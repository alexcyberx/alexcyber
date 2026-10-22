'use client';

// CTF: the rooms the site really shows (site.rooms, read from
// js/ctf-challenges-data.js) next to their DB rows (ctf_challenges, by slug).
// Texts, hints and labs come from the code; the DB row decides whether a room
// is live and solvable, its XP, its prerequisites and the uuid the flag check
// needs. Counts and the scoreboard come from ctf_solves, correct = true only.
// Flags never appear here: the server derives them and the DB keeps a hash
// (server/labs/flags.js). No "Create challenge": a DB row alone never makes a
// room (owner decision). lab_url is never written (the old edit wiped it).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectionProps } from '../AdminApp';
import type { SiteRoom } from '../site-data';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Drawer, Empty, Stat, TrendChart, dateTime, num, timeAgo, useToast } from '../ui';

type DbRow = {
  id: string; slug: string; title: string | null; category: string | null; difficulty: string | null;
  points: number | null; xp: number | null; status: string | null; solvers: number | null; requires: unknown; created_at: string | null;
};
// Never flag / flag_hash (not readable anyway) and never lab_url (not ours to change).
const COLS = 'id, slug, title, category, difficulty, points, xp, status, solvers, requires, created_at';
type Solve = { user_id: string; challenge_id: string; solved_at: string; points_earned: number | null };
type Person = { id: string; full_name: string | null; username: string | null; xp: number | null };
type Room = { slug: string; site: SiteRoom | null; db: DbRow | null };
type Tally = { n: number; last: string };

const PAGE = 1000;        // PostgREST hands out at most 1000 rows per request
const MAX_SOLVES = 20000; // years of solves; the page says so if it is ever reached
const XP_MAX = 10000;
const BOARD = 20;

// Same rule as the site and the flag check: no status counts as live
// (getRooms skips only a set, non-active status; NULL <> 'active' is not true).
const isLive = (r: DbRow | null | undefined) => !!r && (r.status == null || r.status === 'active');
const reqsOf = (r: DbRow | null | undefined): string[] =>
  Array.isArray(r?.requires) ? (r.requires as unknown[]).filter((x): x is string => typeof x === 'string') : [];
// What the flag check awards: xp, else points (submit_ctf_flag); the code value until there is a row.
const xpOf = (room: Room) => room.db?.xp ?? room.db?.points ?? room.site?.xp ?? 0;
const label = (room: Room) => room.site?.title || room.db?.title || room.slug;
const cap = (s: string | null | undefined) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '-');
const who = (p: Person | undefined) => (p ? p.full_name || p.username || 'No name' : '...'); // '...' until the names load
const ms = (iso: string) => new Date(iso).getTime();

// Same format as the existing rows: lower-case category key and difficulty.
const CAT_KEYS: Record<string, string> = { 'AI Security': 'ai' };
const dbCategory = (cat: string) => CAT_KEYS[cat] || cat.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, '') || 'misc';

/** acx_announce sends the "New CTF room" notification once per room link.
 * true = sent before (nothing new goes out), null = could not check. */
async function announced(sb: SupabaseClient, slug: string): Promise<boolean | null> {
  const { count, error } = await sb.from('notifications').select('id', { count: 'exact', head: true }).is('user_id', null).eq('link', '/rooms?open=' + slug);
  return error ? null : (count || 0) > 0;
}
function notifyLine(dbTitle: string, was: boolean | null) {
  if (was) return 'It was announced before, so no new notification goes out.';
  const line = `Every user gets one notification: "New CTF room: ${dbTitle}".`;
  return was === null ? line + ' (Not sent again if it was announced before.)' : line;
}

/** Does `from` need `target`, directly or through other rooms? */
function needs(from: string, target: string, map: Map<string, string[]>): boolean {
  const seen = new Set<string>();
  const stack = [from];
  while (stack.length) {
    const s = stack.pop()!;
    if (s === target) return true;
    if (seen.has(s)) continue;
    seen.add(s);
    stack.push(...(map.get(s) || []));
  }
  return false;
}

/** Accessible on/off switch (a button with role="switch"). */
function Switch({ value, onChange, id, name, disabled }: { value: boolean; onChange: (v: boolean) => void; id: string; name: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={`${name}: live on site`} id={id} disabled={disabled}
      className={'adm-ctf-switch' + (value ? ' on' : '')} onClick={(e) => { e.stopPropagation(); onChange(!value); }}>
      <span className="adm-ctf-track" aria-hidden="true"><span className="adm-ctf-knob" /></span>
      <span className="adm-ctf-text">{value ? 'Live' : 'Off'}</span>
    </button>
  );
}

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

export default function CTF({ site }: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [rows, setRows] = useState<DbRow[] | null>(null);
  const [err, setErr] = useState('');
  const [solves, setSolves] = useState<Solve[] | null>(null);
  const [solveErr, setSolveErr] = useState('');
  const [capped, setCapped] = useState(false);
  const [counts, setCounts] = useState<{ total: number | null; week: number | null }>({ total: null, week: null });
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const asked = useRef(new Set<string>());
  const seq = useRef(0); // the latest load; older ones (and any after unmount) are dropped
  const inFlight = useRef(new Set<string>());
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<string[]>([]); // rows added this session: the flag hash comes with the next server start
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const me = ++seq.current;
    setLoading(true);
    const week = new Date(Date.now() - 7 * 86400e3).toISOString();
    const head = { count: 'exact' as const, head: true };
    const [c, t, w] = await Promise.all([
      sb.from('ctf_challenges').select(COLS).order('slug').limit(1000),
      sb.from('ctf_solves').select('id', head).eq('correct', true),
      sb.from('ctf_solves').select('id', head).eq('correct', true).gte('solved_at', week),
    ]);
    if (me !== seq.current) return;
    if (c.error) { setErr(c.error.message); setRows([]); } else { setErr(''); setRows((c.data || []) as DbRow[]); }
    setCounts({ total: t.error ? null : t.count || 0, week: w.error ? null : w.count || 0 });
    // Every correct solve, newest first (the old panel also counted correct = null).
    const list: Solve[] = [];
    let e = '';
    for (let from = 0; from < MAX_SOLVES; from += PAGE) {
      // solved_at can be NULL: keep those last, so "latest" and "last solve" stay right.
      const { data, error } = await sb.from('ctf_solves').select('user_id, challenge_id, solved_at, points_earned')
        .eq('correct', true).order('solved_at', { ascending: false, nullsFirst: false }).order('id', { ascending: true }).range(from, from + PAGE - 1);
      if (me !== seq.current) return; // a newer load runs, or the section was closed
      if (error) { e = error.message; break; }
      const page = (data || []) as Solve[];
      list.push(...page);
      if (page.length < PAGE) break;
    }
    asked.current.clear(); // names and total XP are fetched again
    setSolveErr(e);
    setCapped(list.length >= MAX_SOLVES);
    setSolves(list);
    setLoading(false);
  }, [sb]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => () => { seq.current++; }, []);

  const siteBySlug = useMemo(() => new Map(site.rooms.map((r) => [r.slug, r])), [site]);
  const byId = useMemo(() => new Map((rows || []).map((r) => [r.id, r])), [rows]);
  const bySlug = useMemo(() => new Map((rows || []).map((r) => [r.slug, r])), [rows]);
  const rooms = useMemo<Room[]>(() => site.rooms.map((s) => ({ slug: s.slug, site: s, db: bySlug.get(s.slug) || null })), [site, bySlug]);
  const dbOnly = useMemo<Room[]>(() => (rows || []).filter((r) => !siteBySlug.has(r.slug)).map((r) => ({ slug: r.slug, site: null, db: r })), [rows, siteBySlug]);
  const roomOf = useCallback((challengeId: string): Room | null => {
    const r = byId.get(challengeId);
    return r ? { slug: r.slug, site: siteBySlug.get(r.slug) || null, db: r } : null;
  }, [byId, siteBySlug]);

  // Real correct solves per challenge (the stored `solvers` counter can drift).
  const tally = useMemo(() => {
    const m = new Map<string, Tally>();
    (solves || []).forEach((s) => {
      const t = m.get(s.challenge_id);
      if (t) t.n++; else m.set(s.challenge_id, { n: 1, last: s.solved_at }); // newest first: the first one is the last solve
    });
    return m;
  }, [solves]);
  // Every correct solve loaded: only then are per-room numbers safe to compare or write.
  const complete = !!solves && !capped && !solveErr;

  // XP = what each solve recorded (points_earned), not solves x today's room
  // XP: the old panel's estimate went wrong as soon as a room's XP changed.
  const board = useMemo(() => {
    const m = new Map<string, { user: string; solves: number; xp: number; last: string }>();
    (solves || []).forEach((s) => {
      const xp = s.points_earned || 0;
      const b = m.get(s.user_id);
      if (b) { b.solves++; b.xp += xp; } else m.set(s.user_id, { user: s.user_id, solves: 1, xp, last: s.solved_at });
    });
    // Ties: more XP first, then whoever got there first.
    return [...m.values()].sort((a, b) => b.solves - a.solves || b.xp - a.xp || ms(a.last) - ms(b.last)).slice(0, BOARD);
  }, [solves]);
  const recent = useMemo(() => (solves || []).slice(0, BOARD), [solves]);

  const wanted = useMemo(() => [...new Set([...board.map((b) => b.user), ...recent.map((s) => s.user_id)])], [board, recent]);
  useEffect(() => {
    const missing = wanted.filter((id) => !asked.current.has(id));
    if (!missing.length) return;
    missing.forEach((id) => asked.current.add(id));
    sb.from('profiles').select('id, full_name, username, xp').in('id', missing).then(({ data, error }) => {
      if (error) { missing.forEach((id) => asked.current.delete(id)); toast('Could not load player names: ' + error.message, 'error'); return; }
      setPeople((p) => {
        const n = { ...p };
        missing.forEach((id) => { n[id] = { id, full_name: null, username: null, xp: null }; }); // no profile: 'No name', not '...'
        (data as Person[]).forEach((x) => { n[x.id] = x; });
        return n;
      });
    });
  }, [sb, wanted, toast]);

  // One action at a time per room, held from the first click: the
  // notification check runs before the confirm, so without this a double
  // click asked twice and inserted twice. Its switch and buttons show busy.
  const run = useCallback(async (key: string, fn: () => Promise<boolean>) => {
    if (inFlight.current.has(key)) return false;
    inFlight.current.add(key);
    setBusy((b) => ({ ...b, [key]: true }));
    try { return await fn(); } finally {
      inFlight.current.delete(key);
      setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  }, []);

  // Call inside run().
  async function patch(room: Room, values: Partial<DbRow>, what: string, ok: string): Promise<boolean> {
    const row = room.db;
    if (!row) return false;
    const { data, error } = await sb.from('ctf_challenges').update(values).eq('id', row.id).select(COLS);
    if (error) { toast('Could not save: ' + error.message, 'error'); return false; }
    const fresh = ((data || []) as DbRow[])[0];
    // An update that RLS refuses comes back with no row and no error.
    if (!fresh) { toast('Not saved: the database refused the change. Sign in again and retry.', 'error'); return false; }
    setRows((l) => (l || []).map((x) => (x.id === row.id ? fresh : x)));
    logAdminEvent('admin_ctf_updated', `"${label(room)}" (${row.slug}): ${what}`);
    toast(ok);
    return true;
  }

  // Rooms that list this slug as a prerequisite.
  const dependents = (slug: string) => (rows || []).filter((r) => r.slug !== slug && reqsOf(r).includes(slug)).map((r) => r.slug);

  async function setLive(room: Room, v: boolean) {
    const row = room.db;
    if (!row) return;
    const name = label(room);
    await run(room.slug, async () => {
      if (!v) {
        const deps = dependents(row.slug);
        const depLine = deps.length ? `\n\nRooms that need it first (${deps.join(', ')}) stay locked for players who have not solved it.` : '';
        if (!confirm(`Take "${name}" off the site?\n\nPlayers can no longer see it or submit its flag (the rooms page updates within about a minute). Solves and XP already earned stay.${depLine}`)) return false;
      } else {
        const was = await announced(sb, row.slug);
        const where = room.site
          ? 'It shows on the rooms page within about a minute and players can solve it.'
          : 'It is still not shown on the site (there is no room for it in the code), but the site search lists it.';
        if (!confirm(`Put "${name}" live?\n\n${where}\n${notifyLine(row.title || name, was)}`)) return false;
      }
      return patch(room, { status: v ? 'active' : 'disabled' }, v ? 'live on site' : 'taken off the site', v ? `${name} is live` : `${name} is off`);
    });
  }

  async function addRow(room: Room) {
    const s = room.site;
    if (!s || room.db) return;
    await run(s.slug, async () => {
      const was = await announced(sb, s.slug);
      // server/labs/flags.js: syncFlagHashes() runs once at server start and only
      // updates existing rows, so a row added now gets its flag hash next start.
      if (!confirm(`Add "${s.title}" to the database?\n\nIt goes live with ${s.xp} XP and shows on the rooms page within about a minute. ${notifyLine(s.title, was)}\n\n`
        + (s.hasLabFlow
          ? 'Flag: this room\'s lab checks the flag itself, so solves count at once.'
          : 'Flag: the server writes the flag check of each room in its flag list when it starts. Restart the alexcyber service once (a redeploy does it); until then a correct flag is refused. '
            + 'A brand new room also needs its line in the server flag list; the developer adds it with the room.'))) return false;
      const values = { slug: s.slug, title: s.title, category: dbCategory(s.cat), difficulty: s.diff.toLowerCase(), xp: s.xp, points: s.xp, status: 'active' };
      const { data, error } = await sb.from('ctf_challenges').insert(values).select(COLS).single();
      if (error || !data) { toast('Could not add: ' + (error?.message || 'no row came back'), 'error'); return false; }
      setRows((l) => [...(l || []), data as DbRow]);
      setAdded((a) => [...a, s.slug]);
      logAdminEvent('admin_ctf_added', `"${s.title}" (${s.slug}) added to the database: live, ${s.xp} XP`);
      toast(s.hasLabFlow ? `${s.title} added.` : `${s.title} added. Restart the server so its flag works.`);
      return true;
    });
  }

  async function remove(room: Room) {
    const row = room.db;
    if (!row || room.site) return;
    const name = label(room);
    const n = tally.get(row.id)?.n || 0;
    const deps = dependents(row.slug);
    // The number only when every solve is loaded.
    const what = !complete ? 'Its solve records, hint unlocks and wrong-flag attempts are deleted with it.'
      : n ? `Its ${n} solve record${n === 1 ? '' : 's'}, hint unlocks and wrong-flag attempts are deleted with it.` : 'Its hint unlocks and wrong-flag attempts are deleted with it.';
    const depLine = deps.length ? `\n\nRooms that need it first (${deps.join(', ')}) would stay locked until you remove it from their prerequisites.` : '';
    await run(row.slug, async () => {
      if (!confirm(`Delete "${name}" (${row.slug}) from the database?\n\n${what} Players keep the XP they got. This cannot be undone.${depLine}`)) return false;
      const { data, error } = await sb.from('ctf_challenges').delete().eq('id', row.id).select('id');
      if (error) { toast('Could not delete: ' + error.message, 'error'); return false; }
      if (!data || !data.length) { toast('Not deleted: the database refused it. Sign in again and retry.', 'error'); return false; }
      const weekAgo = Date.now() - 7 * 86400e3;
      const gone = (solves || []).filter((x) => x.challenge_id === row.id);
      setRows((l) => (l || []).filter((x) => x.id !== row.id));
      setSolves((l) => (l || []).filter((x) => x.challenge_id !== row.id));
      setCounts((c) => ({
        total: c.total == null ? null : Math.max(0, c.total - gone.length),
        week: c.week == null ? null : Math.max(0, c.week - gone.filter((x) => ms(x.solved_at) >= weekAgo).length),
      }));
      setOpen((o) => (o === row.slug ? null : o));
      logAdminEvent('admin_ctf_deleted', `"${name}" (${row.slug}) deleted with ${complete ? n : 'its'} solve records`);
      toast(`${name} deleted`);
      return true;
    });
  }

  async function fixCount(room: Room) {
    const row = room.db;
    if (!row || !complete) return; // a part-loaded list would write too low a number
    const was = row.solvers ?? 0;
    await run(room.slug, async () => {
      // Count again right before writing: solves made since the page loaded count too.
      const { count, error } = await sb.from('ctf_solves').select('id', { count: 'exact', head: true }).eq('challenge_id', row.id).eq('correct', true);
      if (error || count == null) { toast('Could not count the solves: ' + (error?.message || 'no count'), 'error'); return false; }
      const n = count;
      if (n === was) { toast('The site count is already right'); return false; }
      if (!confirm(`Set the solver count the rooms page shows for "${label(room)}" from ${was} to ${n}, the real number of correct solves?`)) return false;
      return patch(room, { solvers: n }, `solver count ${was} to ${n}`, 'Solver count fixed');
    });
  }

  async function saveSettings(room: Room, xp: number, reqs: string[]): Promise<boolean> {
    const row = room.db;
    if (!row) return false;
    const values: Partial<DbRow> = {};
    const parts: string[] = [];
    const oldXp = row.xp ?? row.points;
    if (xp !== oldXp) {
      // points too: the solve record keeps points, and profiles show that number.
      values.xp = xp; values.points = xp;
      parts.push(`XP ${oldXp ?? '-'} to ${xp}`);
    }
    const old = reqsOf(row);
    if ([...old].sort().join(',') !== [...reqs].sort().join(',')) {
      values.requires = reqs;
      parts.push(`prerequisites [${old.join(', ') || 'none'}] to [${reqs.join(', ') || 'none'}]`);
    }
    if (!parts.length) { toast('Nothing changed', 'info'); return true; }
    return run(room.slug, () => patch(room, values, parts.join('; '), 'Saved'));
  }

  const s = q.trim().toLowerCase();
  const match = (r: Room) => !s || [r.slug, r.site?.title, r.db?.title, r.site?.cat, r.db?.category].some((x) => !!x && x.toLowerCase().includes(s));
  const shownRooms = rooms.filter(match);
  const shownDbOnly = dbOnly.filter(match);
  const liveCount = rooms.filter((r) => isLive(r.db)).length;
  const missingCount = rows && !err ? rooms.filter((r) => !r.db).length : 0;
  const unique = solves ? new Set(solves.map((x) => x.user_id)).size : null;
  const openRoom = open ? rooms.find((r) => r.slug === open) || dbOnly.find((r) => r.slug === open) || null : null;

  return (
    <div className="adm-stack">
      <p className="adm-help" id="admCtfNote">
        Room texts, hints and labs come from the code (js/ctf-challenges-data.js). The database row decides if a room is live, its XP,
        its prerequisites and its solver count. Flags are made by the server; this panel never sees them. The rooms page picks up
        changes within about a minute.
      </p>
      <div className="adm-stats" id="admCtfStats">
        <Stat label="Rooms live on the site" value={!rows ? '...' : err ? '-' : `${num(liveCount)} of ${num(site.rooms.length)}`} sub={missingCount ? <span className="adm-ctf-subwarn">{missingCount} not in the database</span> : undefined} />
        <Stat label="Correct solves" value={counts.total == null ? (solves ? num(solves.length) : '...') : num(counts.total)} />
        <Stat label="Solves, last 7 days" value={counts.week == null ? '...' : num(counts.week)} />
        <Stat label="Players who solved" value={unique == null ? '...' : num(unique)} />
      </div>
      {solveErr && <p className="adm-error" id="admCtfSolveErr">Could not load all solves: {solveErr}</p>}
      {capped && <p className="adm-help">Per-room counts and the scoreboard use the latest {num(MAX_SOLVES)} solves.</p>}

      <Card title="Rooms" actions={<>
        <input className="adm-input" placeholder="Search room, id or category" value={q} onChange={(e) => setQ(e.target.value)} id="admCtfSearch" />
        <button className="adm-btn" onClick={load} disabled={loading} id="admCtfRefresh">{loading ? 'Loading...' : 'Refresh'}</button>
      </>}>
        {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load the rooms: {err}</Empty> : !site.rooms.length ? <Empty>The site room list could not be read.</Empty> : !shownRooms.length ? <Empty>No rooms match.</Empty> : (
          <>
            <p className="adm-help">Click a room for its solvers, XP and prerequisites.</p>
            <div className="adm-table-wrap">
              <table className="adm-table" id="admCtfRooms">
                <thead><tr><th>Room</th><th>Category</th><th>Difficulty</th><th>XP</th><th>Live on site</th><th>Solvers</th><th>Last solve</th><th>Needs first</th><th>Lab</th></tr></thead>
                <tbody>
                  {shownRooms.map((r) => {
                    const t = r.db ? tally.get(r.db.id) : undefined;
                    const real = t?.n || 0;
                    const reqs = reqsOf(r.db);
                    return (
                      <tr key={r.slug} id={'admCtfRow-' + r.slug} tabIndex={0} onClick={() => setOpen(r.slug)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setOpen(r.slug); }}>
                        <td><span className="adm-strong">{r.site!.title}</span> <span className="adm-dim">{r.slug}</span></td>
                        <td className="adm-nowrap">{r.site!.cat}</td>
                        <td>{r.site!.diff}</td>
                        <td className="adm-num">{num(xpOf(r))}{!r.db && <span className="adm-dim"> default</span>}</td>
                        <td onClick={stop} onKeyDown={stop}>
                          {r.db ? (
                            <div className="adm-ctf-cell">
                              <Switch value={isLive(r.db)} onChange={(v) => setLive(r, v)} id={'admCtfLive-' + r.slug} name={r.site!.title} disabled={!!busy[r.slug]} />
                              {added.includes(r.slug) && !r.site?.hasLabFlow && <span className="adm-pill adm-ctf-warn" title="The server writes the flag check when it starts. Restart the alexcyber service once.">flag after restart</span>}
                            </div>
                          ) : (
                            <div className="adm-ctf-missing">
                              <span className="adm-dim">Not in the database, so players cannot see or solve it.</span>
                              <button className="adm-btn" onClick={() => addRow(r)} disabled={!!busy[r.slug]} id={'admCtfAdd-' + r.slug}>{busy[r.slug] ? 'Adding...' : 'Add to database'}</button>
                            </div>
                          )}
                        </td>
                        <td className="adm-num">
                          {solves ? num(real) : '...'}
                          {r.db && complete && (r.db.solvers ?? 0) !== real && <div className="adm-dim">site shows {num(r.db.solvers ?? 0)}</div>}
                        </td>
                        <td className="adm-dim adm-nowrap" title={t ? dateTime(t.last) : undefined}>{t ? timeAgo(t.last) : 'Never'}</td>
                        <td>{reqs.length ? reqs.join(', ') : <span className="adm-dim">None</span>}</td>
                        <td>{r.site!.hasLab ? 'Yes' : <span className="adm-dim">No</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {rows && !err && shownDbOnly.length > 0 && (
        <Card title="Only in the database (not shown on the site)">
          <p className="adm-help">
            These rows have no room in the code, so the rooms page never shows them. While one is live, the site search still lists it
            (the link opens nothing), and switching one on sends the &quot;New CTF room&quot; notification.
          </p>
          <ul className="adm-list" id="admCtfDbOnly">
            {shownDbOnly.map((r) => {
              const row = r.db!;
              return (
                <li key={r.slug} id={'admCtfDbRow-' + r.slug}>
                  <span className="adm-list-main">
                    <button className="adm-link" onClick={() => setOpen(r.slug)}>{row.title || r.slug}</button>{' '}
                    <span className="adm-dim">{r.slug} | {cap(row.category)} | {cap(row.difficulty)} | {num(xpOf(r))} XP | {num(tally.get(row.id)?.n || 0)} solves</span>
                  </span>
                  <Switch value={isLive(row)} onChange={(v) => setLive(r, v)} id={'admCtfLive-' + r.slug} name={row.title || r.slug} disabled={!!busy[r.slug]} />
                  <button className="adm-btn danger" onClick={() => remove(r)} disabled={!!busy[r.slug]} id={'admCtfDelete-' + r.slug}>Delete</button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="adm-grid-2 top">
        <Card title="Top players">
          <p className="adm-help">Correct solves only. CTF XP adds up the XP each solve gave.</p>
          {solves == null ? <Empty>Loading...</Empty> : !board.length ? <Empty>No solves yet.</Empty> : (
            <div className="adm-table-wrap">
              <table className="adm-table" id="admCtfBoard">
                <thead><tr><th>#</th><th>Player</th><th>Solves</th><th>CTF XP</th><th>Total XP</th><th>Last solve</th></tr></thead>
                <tbody>
                  {board.map((b, i) => {
                    const p = people[b.user];
                    return (
                      <tr key={b.user} className="static">
                        <td className="adm-num adm-dim">{i + 1}</td>
                        <td>
                          <div className="adm-user-cell">
                            <span className="adm-avatar" aria-hidden="true">{p ? who(p).charAt(0).toUpperCase() : ''}</span>
                            <span>
                              <a href={'/u/' + encodeURIComponent(b.user)} target="_blank" rel="noopener noreferrer" className="adm-strong">{who(p)}</a>
                              {p?.username && <span className="adm-dim"> @{p.username}</span>}
                            </span>
                          </div>
                        </td>
                        <td className="adm-num">{num(b.solves)}</td>
                        <td className="adm-num">{num(b.xp)}</td>
                        <td className="adm-num">{p ? num(p.xp || 0) : '-'}</td>
                        <td className="adm-dim adm-nowrap" title={dateTime(b.last)}>{timeAgo(b.last)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Latest solves">
          {solves == null ? <Empty>Loading...</Empty> : !recent.length ? <Empty>No solves yet.</Empty> : (
            <ul className="adm-list" id="admCtfRecent">
              {recent.map((x) => {
                const room = roomOf(x.challenge_id);
                return (
                  <li key={x.user_id + ':' + x.challenge_id}>
                    <span className="adm-list-main"><span className="adm-strong">{who(people[x.user_id])}</span> <span className="adm-dim">solved</span> {room ? label(room) : 'Removed room'}</span>
                    <span className="adm-dim adm-nowrap" title={dateTime(x.solved_at)}>{timeAgo(x.solved_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {openRoom && (
        <RoomDetail key={openRoom.slug} room={openRoom} rows={rows || []} siteBySlug={siteBySlug} solves={solves || []} complete={complete}
          busy={!!busy[openRoom.slug]} added={added.includes(openRoom.slug)} onClose={() => setOpen(null)}
          onAdd={() => addRow(openRoom)} onSave={(xp, reqs) => saveSettings(openRoom, xp, reqs)} onFixCount={() => fixCount(openRoom)} />
      )}
    </div>
  );
}

function RoomDetail({ room, rows, siteBySlug, solves, complete, busy, added, onClose, onAdd, onSave, onFixCount }: {
  room: Room; rows: DbRow[]; siteBySlug: Map<string, SiteRoom>; solves: Solve[]; complete: boolean; busy: boolean; added: boolean;
  onClose: () => void; onAdd: () => void; onSave: (xp: number, reqs: string[]) => Promise<boolean>; onFixCount: () => void;
}) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const row = room.db;
  const rowId = row?.id || '';
  const mine = useMemo(() => (rowId ? solves.filter((x) => x.challenge_id === rowId) : []), [solves, rowId]);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [hints, setHints] = useState<number | null>(null);
  const [xp, setXp] = useState(String(xpOf(room)));
  const [reqs, setReqs] = useState<string[]>(reqsOf(row));
  const [formErr, setFormErr] = useState('');

  // Names of the latest 50 solvers.
  const idKey = useMemo(() => [...new Set(mine.slice(0, 50).map((x) => x.user_id))].join(','), [mine]);
  useEffect(() => {
    if (!idKey) return;
    const ids = idKey.split(',');
    sb.from('profiles').select('id, full_name, username, xp').in('id', ids).then(({ data, error }) => {
      if (error) { toast('Could not load player names: ' + error.message, 'error'); return; }
      const none = (id: string): Person => ({ id, full_name: null, username: null, xp: null }); // no profile: 'No name', not '...'
      setPeople({ ...Object.fromEntries(ids.map((id) => [id, none(id)])), ...Object.fromEntries((data as Person[]).map((p) => [p.id, p])) });
    });
  }, [sb, idKey, toast]);
  useEffect(() => {
    if (!rowId) return;
    sb.from('ctf_hint_unlocks').select('id', { count: 'exact', head: true }).eq('challenge_id', rowId)
      .then(({ count, error }) => setHints(error ? null : count || 0));
  }, [sb, rowId]);

  const weeks = useMemo(() => {
    const now = Date.now(), W = 7 * 86400e3;
    const pts = new Array(8).fill(0) as number[];
    mine.forEach((x) => { const i = Math.floor((now - ms(x.solved_at)) / W); if (i >= 0 && i < 8) pts[7 - i]++; });
    const labels = pts.map((_, k) => new Date(now - (8 - k) * W).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    return { pts, labels };
  }, [mine]);

  // Possible prerequisites: every other DB row, plus saved slugs that no longer exist.
  const options = useMemo(() => {
    const list = rows.filter((r) => r.slug !== room.slug).map((r) => {
      const s = siteBySlug.get(r.slug);
      const note = !s ? 'not on the site' : !isLive(r) ? 'off' : '';
      return { slug: r.slug, title: s?.title || r.title || r.slug, note, onSite: !!s };
    });
    list.sort((a, b) => Number(b.onSite) - Number(a.onSite) || a.slug.localeCompare(b.slug));
    reqsOf(row).filter((x) => !list.some((o) => o.slug === x))
      .forEach((x) => list.push({ slug: x, title: x, note: x === room.slug ? 'this room itself' : 'not in the database', onSite: false }));
    return list;
  }, [rows, room.slug, row, siteBySlug]);
  const blocked = reqs.filter((x) => options.find((o) => o.slug === x)?.note);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr('');
    const t = xp.trim();
    if (!/^\d+$/.test(t) || Number(t) > XP_MAX) return setFormErr(`XP must be a whole number from 0 to ${XP_MAX}.`);
    // A loop (this room needs a room that needs this one) locks both for everyone.
    const map = new Map(rows.map((r) => [r.slug, reqsOf(r)]));
    const loop = reqs.find((x) => needs(x, room.slug, map));
    if (loop) return setFormErr(`${loop} already needs this room (directly or through other rooms), so both would stay locked.`);
    await onSave(Number(t), reqs);
  }

  const status = !row ? 'not in the database' : isLive(row) ? 'live' : `off (${row.status || 'no status'})`;
  const real = mine.length;
  return (
    <Drawer title={label(room)} onClose={onClose}>
      <div className="adm-stack" id="admCtfDetail">
        <div className="adm-dim">
          {room.slug}
          {room.site ? ` | ${room.site.cat} | ${room.site.diff} | Lab: ${room.site.hasLab ? 'yes' : 'no'}` : ` | ${cap(row?.category)} | ${cap(row?.difficulty)} | no room in the code`}
          {' | '}{status}
        </div>
        {!row ? (
          <div className="adm-ctf-missing">
            <p className="adm-help">Not in the database, so players cannot see or solve it. Adding it puts it live with {num(room.site?.xp || 0)} XP.</p>
            <button className="adm-btn primary" onClick={onAdd} disabled={busy} id="admCtfDetailAdd">{busy ? 'Adding...' : 'Add to database'}</button>
          </div>
        ) : (
          <>
            {added && !room.site?.hasLabFlow && <p className="adm-help">Added in this session: its flag check is written when the server starts, so restart the alexcyber service once.</p>}
            <div className="adm-stats small">
              <Stat label="Correct solves" value={num(real)} />
              <Stat label="Count on the site" value={num(row.solvers ?? 0)} />
              <Stat label="Hints opened" value={hints == null ? '-' : num(hints)} />
              <Stat label="XP" value={num(xpOf(room))} />
            </div>
            {complete && (row.solvers ?? 0) !== real && (
              <div className="adm-ctf-missing">
                <p className="adm-help">The rooms page shows a stored counter ({num(row.solvers ?? 0)}), but there are {num(real)} correct solves.</p>
                <button className="adm-btn" onClick={onFixCount} disabled={busy} id="admCtfFixCount">Set the site count to {num(real)}</button>
              </div>
            )}
            <form className="adm-form adm-inline-form" onSubmit={submit} id="admCtfForm">
              <label className="adm-field"><span>XP for a solve (0 to {XP_MAX})</span>
                <input type="number" min={0} max={XP_MAX} step={1} value={xp} onChange={(e) => setXp(e.target.value)} id="admCtfXp" />
              </label>
              <p className="adm-help">
                Players get this XP once, with their first correct flag. Players who solved it already keep what they got.
                It is saved as both XP and points, so the solve record shows the same number.
              </p>
              <div className="adm-field">
                <span>Prerequisites (rooms to solve first)</span>
                {!options.length ? <span className="adm-dim">No other rooms in the database.</span> : (
                  <div className="adm-ctf-reqs" id="admCtfReqs">
                    {options.map((o) => (
                      <label key={o.slug}>
                        <input type="checkbox" checked={reqs.includes(o.slug)} id={'admCtfReq-' + o.slug}
                          onChange={(e) => setReqs((l) => (e.target.checked ? [...l, o.slug] : l.filter((x) => x !== o.slug)))} />
                        <span>{o.title} <span className="adm-dim">{o.slug}{o.note ? ' | ' + o.note : ''}</span></span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="adm-help">
                A player can solve this room only after solving every room ticked here. Until then any flag they send for it (flag box
                or lab) is refused with a message that names the missing room ids. The rooms page shows no lock before that.
              </p>
              {blocked.length > 0 && <p className="adm-error" id="admCtfReqWarn">Nobody can solve {blocked.join(', ')} right now (see the notes above), so this room stays locked for every player who has not solved {blocked.length === 1 ? 'it' : 'them'} already.</p>}
              {formErr && <p className="adm-error" id="admCtfFormErr">{formErr}</p>}
              <div className="adm-actions"><button className="adm-btn primary" disabled={busy} id="admCtfSave">{busy ? 'Saving...' : 'Save'}</button></div>
            </form>
            <section>
              <h4 className="adm-h4">Solves per week, last 8 weeks</h4>
              {real ? <TrendChart points={weeks.pts} labels={weeks.labels} unit="solves" /> : <Empty>No solves yet.</Empty>}
            </section>
            <section>
              <h4 className="adm-h4">Latest solvers</h4>
              {!real ? <Empty>Nobody has solved it yet.</Empty> : (
                <ul className="adm-list" id="admCtfSolvers">
                  {mine.slice(0, 50).map((x) => {
                    const p = people[x.user_id];
                    return (
                      <li key={x.user_id}>
                        <span className="adm-list-main">{who(p)}{p?.username && <span className="adm-dim"> @{p.username}</span>}</span>
                        <span className="adm-dim adm-nowrap">+{num(x.points_earned || 0)} XP</span>
                        <span className="adm-dim adm-nowrap" title={dateTime(x.solved_at)}>{timeAgo(x.solved_at)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </Drawer>
  );
}
