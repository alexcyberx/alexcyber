'use client';

// Backup: the snapshots the database makes of itself (admin_backup_snapshots),
// "Backup now", a JSON download per snapshot and the auto-backup schedule.
// A snapshot (run_backup_snapshot) is one JSON value with profiles (no login
// IPs), courses, chapters, CTF rooms (no flags or flag hashes) and blog posts.
// The pg_cron job alexcyberx-scheduled-backup runs at 03:00 UTC and follows
// admin_backup_schedule.frequency (daily, weekly = Sundays, off).
// No restore from the browser (owner decision). The list never loads the big
// data column: a download fetches one snapshot through admin_get_backup, which
// also writes the audit entry in the database, so it cannot be skipped.
// Reading the list and the schedule needs the Backup migration (before it the
// admin role had RLS policies but no table grants); "Backup now" works without it.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, Pager, Stat, dateTime, num, timeAgo, useToast } from '../ui';

type Snap = { id: string; type: string; status: string; size_bytes: number | null; error: string | null; created_at: string };
type Freq = 'daily' | 'weekly' | 'off';
type Sched = { frequency: string; updated_at: string | null };
type Filter = 'all' | 'scheduled' | 'manual' | 'failed';

const LIST_COLS = 'id, type, status, size_bytes, error, created_at';
const MAX_ROWS = 1000;
const PER_PAGE = 20;
const RUN_UTC_HOUR = 3; // pg_cron schedule '0 3 * * *'
const GRACE_MS = 15 * 60e3; // the job takes about a second; wait a bit before calling a run missed
// Clean-up in run_scheduled_backup (Backup migration), only after a good run:
// scheduled and failed snapshots older than KEEP_DAYS go, the newest KEEP_MIN
// good scheduled ones always stay.
const KEEP_DAYS = 30;
const KEEP_MIN = 7;
const FREQS: { key: Freq; label: string }[] = [{ key: 'daily', label: 'Daily' }, { key: 'weekly', label: 'Weekly' }, { key: 'off', label: 'Off' }];
const FILTERS: Record<Filter, string> = { all: 'All snapshots', scheduled: 'Scheduled', manual: 'Manual', failed: 'Failed' };
const NO_GRANT = 'grant';

const isFreq = (v: string | undefined | null): v is Freq => v === 'daily' || v === 'weekly' || v === 'off';
const ms = (iso: string | null | undefined) => (iso ? new Date(iso).getTime() || 0 : 0);
// 42501 on a table read = no grant (an RLS refusal returns no rows, not an error).
const noGrant = (e: { code?: string; message: string }) => e.code === '42501' || /permission denied/i.test(e.message);

function size(b: number | null | undefined): string {
  if (b == null) return '-';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return Math.round(b / 1024) + ' KB';
  if (b < 1024 ** 3) return (b / 1024 / 1024).toFixed(1) + ' MB';
  return (b / 1024 ** 3).toFixed(2) + ' GB';
}

/** The latest scheduled run at or before t (weekly: Sundays, UTC like pg_cron). */
function lastRun(freq: Freq, t: number): number | null {
  if (freq === 'off') return null;
  const d = new Date(t);
  d.setUTCHours(RUN_UTC_HOUR, 0, 0, 0);
  if (d.getTime() > t) d.setUTCDate(d.getUTCDate() - 1);
  if (freq === 'weekly') d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.getTime();
}

/** The next scheduled run after t. */
function nextRun(freq: Freq, t: number): number | null {
  if (freq === 'off') return null;
  const d = new Date(t);
  d.setUTCHours(RUN_UTC_HOUR, 0, 0, 0);
  if (d.getTime() <= t) d.setUTCDate(d.getUTCDate() + 1);
  if (freq === 'weekly') d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7));
  return d.getTime();
}

// The run time in the viewer's own clock (8:30 am in India). 2 Jan 2000 was a Sunday.
const RUN_AT = new Date(Date.UTC(2000, 0, 2, RUN_UTC_HOUR));
const runTime = () => RUN_AT.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const runDay = () => RUN_AT.toLocaleDateString('en-IN', { weekday: 'long' });
function freqText(f: Freq): string {
  if (f === 'daily') return `Every day at ${runTime()} (03:00 UTC)`;
  if (f === 'weekly') return `Every ${runDay()} at ${runTime()} (Sunday 03:00 UTC)`;
  return 'Off: no automatic snapshots';
}

const pad = (n: number) => String(n).padStart(2, '0');
/** alexcyberx-backup-2026-10-22-0830-scheduled.json (the snapshot's own time, local clock). */
function fileName(s: Snap): string {
  const d = new Date(s.created_at);
  const stamp = isNaN(d.getTime()) ? 'unknown-date' : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `alexcyberx-backup-${stamp}-${/^[a-z]+$/.test(s.type) ? s.type : 'snapshot'}.json`;
}

function saveJson(name: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000); // big file: give the save a moment
}

export default function Backup(_: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [rows, setRows] = useState<Snap[] | null>(null);
  const [total, setTotal] = useState(0);
  const [listErr, setListErr] = useState('');
  const [sched, setSched] = useState<Sched | null>(null);
  const [schedErr, setSchedErr] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const inflight = useRef(new Set<string>());
  const seq = useRef(0); // the latest load; older ones (and any after unmount) are dropped
  const loadingNow = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; seq.current++; }; }, []);

  const load = useCallback(async () => {
    const me = ++seq.current;
    loadingNow.current = true;
    setLoading(true);
    const [l, s] = await Promise.all([
      sb.from('admin_backup_snapshots').select(LIST_COLS, { count: 'exact' })
        .order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, MAX_ROWS - 1),
      sb.from('admin_backup_schedule').select('frequency, updated_at').eq('id', true).maybeSingle(),
    ]);
    if (me !== seq.current) return;
    loadingNow.current = false;
    setNow(Date.now());
    if (l.error) {
      setListErr(noGrant(l.error) ? NO_GRANT : l.error.message);
      // Keep snapshots made here this visit (Backup now works without the list).
      setRows((r) => r || []);
    } else {
      const list = (l.data || []) as Snap[];
      setListErr('');
      setRows(list);
      setTotal(l.count ?? list.length);
    }
    if (s.error) { setSchedErr(noGrant(s.error) ? NO_GRANT : s.error.message); setSched(null); }
    else if (!s.data) { setSchedErr('The schedule row is missing, or this session may not read it.'); setSched(null); }
    else { setSchedErr(''); setSched(s.data as Sched); }
    setLoading(false);
  }, [sb]);
  useEffect(() => { load(); }, [load]);
  // A load still in flight when a write finished may have read the old rows
  // and would undo the local update: read again (the newer load wins).
  const reloadIfStale = useCallback(() => { if (loadingNow.current) load(); }, [load]);

  // One write at a time per key (a snapshot's download or delete, Backup now,
  // the schedule). The key is held before the confirm, so a double click asks once.
  const run = useCallback(async (key: string, fn: () => Promise<void>) => {
    if (inflight.current.has(key)) return;
    inflight.current.add(key);
    setBusy((b) => ({ ...b, [key]: true }));
    try { await fn(); } finally {
      inflight.current.delete(key);
      if (alive.current) setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  }, []);

  const list = useMemo(() => rows || [], [rows]);
  const listOk = rows != null && !listErr;
  const newestGood = list.find((r) => r.status === 'success') || null; // rows are newest first
  const last = list[0] || null;
  const totalBytes = list.reduce((n, r) => n + (r.size_bytes || 0), 0);
  const capped = listOk && total > list.length;
  const freq: Freq | null = sched && isFreq(sched.frequency) ? sched.frequency : null;
  const next = freq ? nextRun(freq, now) : null;

  // A scheduled run that should have happened (after the schedule was last
  // changed) but left no snapshot: the cron job may be broken.
  const missed = useMemo(() => {
    if (!listOk || !freq || !sched) return false;
    const due = lastRun(freq, now - GRACE_MS);
    if (due == null || ms(sched.updated_at) >= due) return false;
    const lastSched = list.find((r) => r.type === 'scheduled');
    return !lastSched || ms(lastSched.created_at) < due - 60e3;
  }, [listOk, freq, sched, now, list]);

  // Old scheduled snapshots the clean-up has not removed yet.
  const oldLeft = useMemo(() => {
    if (!listOk) return 0;
    const keep = new Set(list.filter((r) => r.type === 'scheduled' && r.status === 'success').slice(0, KEEP_MIN).map((r) => r.id));
    const cut = now - KEEP_DAYS * 86400e3;
    return list.filter((r) => (r.type === 'scheduled' || r.status === 'failed') && ms(r.created_at) < cut && !keep.has(r.id)).length;
  }, [listOk, list, now]);

  const shown = useMemo(() => list.filter((r) => (filter === 'all' ? true : filter === 'failed' ? r.status === 'failed' : r.type === filter)), [list, filter]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const slice = shown.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  async function backupNow() {
    await run('make', async () => {
      const about = newestGood?.size_bytes ? ` (about ${size(newestGood.size_bytes)})` : '';
      if (!confirm(`Make a backup now?\n\nIt saves profiles, courses, chapters, CTF rooms and blog posts as a new snapshot in this database${about}.`)) return;
      const { data, error } = await sb.rpc('trigger_manual_backup').select(LIST_COLS);
      if (error) { toast('Backup failed: ' + error.message, 'error'); return; }
      const row = (Array.isArray(data) ? data[0] : data) as Snap | null | undefined;
      if (!row?.id) { toast('Backup failed: the database sent no snapshot back. Reload the page.', 'error'); return; }
      logAdminEvent('admin_backup_created', `manual snapshot ${row.id}: ${row.status}, ${size(row.size_bytes)}`);
      if (row.status === 'failed') toast('Backup failed: ' + (row.error || 'unknown error'), 'error');
      else toast(`Backup made (${size(row.size_bytes)})`);
      if (!alive.current) return;
      setRows((l) => [row, ...(l || []).filter((x) => x.id !== row.id)]);
      setTotal((t) => t + 1);
      setNow(Date.now());
      setPage(1);
      reloadIfStale();
    });
  }

  async function download(s: Snap) {
    await run('dl-' + s.id, async () => {
      if (!confirm(`Download snapshot ${s.id}?\n\nThe file has user data (names, usernames, bios, XP, roles). Keep it private: do not share or email it, and never put it in the GitHub repo (the repo is public).`)) return;
      const { data, error } = await sb.rpc('admin_get_backup', { p_id: s.id });
      if (error) {
        toast(error.code === 'PGRST202'
          ? 'Download needs the Backup migration (database function admin_get_backup). Run it in the Supabase SQL Editor first.'
          : 'Download failed: ' + error.message, 'error');
        return;
      }
      if (data == null) { toast('Download failed: this snapshot has no data.', 'error'); return; }
      saveJson(fileName(s), data);
      toast('Downloaded. Keep the file private.');
    });
  }

  async function remove(s: Snap) {
    if (newestGood && s.id === newestGood.id) return; // the database refuses it too
    await run('del-' + s.id, async () => {
      if (!confirm(`Delete snapshot ${s.id} (${dateTime(s.created_at)})?\n\nIt is removed from the database for good.`)) return;
      const { data, error } = await sb.rpc('admin_delete_backup', { p_id: s.id });
      if (error) {
        toast(error.code === 'PGRST202'
          ? 'Delete needs the Backup migration (database function admin_delete_backup). Run it in the Supabase SQL Editor first.'
          : 'Could not delete: ' + error.message, 'error');
        return;
      }
      if (data !== s.id) { toast('Could not delete: nothing was deleted. Reload the page.', 'error'); return; }
      toast('Snapshot deleted');
      if (!alive.current) return;
      setRows((l) => (l || []).filter((x) => x.id !== s.id));
      setTotal((t) => Math.max(0, t - 1));
      reloadIfStale();
    });
  }

  async function setFreq(f: Freq) {
    if (!sched || sched.frequency === f) return;
    const old = sched.frequency;
    await run('sched', async () => {
      if (f === 'off' && !confirm('Turn off automatic backups?\n\nNo new snapshots are made until you turn them on again.')) return;
      const { data, error } = await sb.from('admin_backup_schedule')
        .update({ frequency: f, updated_at: new Date().toISOString() }).eq('id', true).select('frequency, updated_at');
      if (error) { toast('Could not save: ' + error.message, 'error'); return; }
      const row = ((data || []) as Sched[])[0];
      if (!row) { toast('Could not save: nothing was changed (this session may not edit the schedule). Reload the page.', 'error'); return; }
      logAdminEvent('admin_backup_schedule_updated', `auto-backup ${old} to ${row.frequency}`);
      toast(row.frequency === 'off' ? 'Automatic backups are off' : `Automatic backups: ${row.frequency}`);
      if (!alive.current) return;
      setSched(row);
      setNow(Date.now());
      reloadIfStale();
    });
  }

  const statusPill = (s: Snap) => (s.status === 'success'
    ? <span className="adm-pill accent">Success</span>
    : s.status === 'failed' ? <span className="adm-pill danger">Failed</span> : <span className="adm-pill">{s.status}</span>);

  return (
    <div className="adm-stack">
      <div className="adm-stats" id="admBakStats">
        <Stat label="Snapshots" value={listOk ? num(total) : '-'} sub={listOk ? 'In this database' : undefined} />
        <Stat label="Last backup" value={last ? timeAgo(last.created_at) : listOk ? 'None' : '-'}
          sub={last ? <span className={last.status === 'failed' ? 'adm-bak-bad' : undefined}>{last.status === 'failed' ? 'Failed' : 'Success'}, {last.type}</span> : undefined} />
        <Stat label="Total size" value={listOk ? size(totalBytes) : '-'} sub={listOk ? (capped ? `Newest ${num(list.length)} snapshots` : 'All snapshots, as JSON') : undefined} />
        <Stat label="Schedule" value={freq ? FREQS.find((x) => x.key === freq)!.label : '-'}
          sub={next ? `Next: ${dateTime(new Date(next).toISOString())}` : freq === 'off' ? 'No automatic snapshots' : undefined} />
      </div>

      <p className="adm-bak-note" id="admBakNote">
        <strong>Not a full backup.</strong> Snapshots are stored in the same Supabase database as the site. If the project is deleted,
        paused for good or the database is damaged, the snapshots are lost with it. For real safety, use Supabase&apos;s own daily
        backups (paid plans) and keep a private copy somewhere else: download a snapshot now and then, or export the whole database
        with <code>supabase db dump</code>.
      </p>

      <Card title="Snapshots" actions={<>
        <select className="adm-input adm-select" value={filter} onChange={(e) => { setFilter(e.target.value as Filter); setPage(1); }} aria-label="Show" id="admBakFilter">
          {(Object.keys(FILTERS) as Filter[]).map((k) => <option key={k} value={k}>{FILTERS[k]}</option>)}
        </select>
        <button className="adm-btn ghost" onClick={() => load()} disabled={loading} id="admBakRefresh">{loading ? 'Loading...' : 'Refresh'}</button>
        <button className="adm-btn primary" onClick={backupNow} disabled={!!busy.make} id="admBakNow">{busy.make ? 'Backing up...' : 'Backup now'}</button>
      </>}>
        {listErr && (
          <p className="adm-error adm-bak-gap" id="admBakListErr">
            {listErr === NO_GRANT
              ? 'The snapshot list cannot be read yet: admins have no read access to admin_backup_snapshots. Run the Backup part of the admin migration in the Supabase SQL Editor. Backup now already works.'
              : 'Could not load the snapshots: ' + listErr}
          </p>
        )}
        {last?.status === 'failed' && (
          <p className="adm-error adm-bak-gap" id="admBakFailed">The last backup failed{last.error ? ': ' + last.error : '.'}</p>
        )}
        {missed && (
          <p className="adm-bak-warn" id="admBakMissed">
            The last scheduled backup did not happen. Check the pg_cron job alexcyberx-scheduled-backup in Supabase (Integrations, Cron).
          </p>
        )}
        {rows == null ? <Empty>Loading...</Empty> : !list.length ? (listErr ? null : <Empty>No snapshots yet. Use Backup now to make the first one.</Empty>) : !shown.length ? <Empty>No snapshots match.</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admBakList">
              <thead><tr><th>Snapshot</th><th>Type</th><th>Status</th><th>Size</th><th>Made</th><th><span className="adm-bak-sr">Actions</span></th></tr></thead>
              <tbody>
                {slice.map((s) => {
                  const keep = newestGood?.id === s.id;
                  return (
                    <tr key={s.id} className="static" data-id={s.id}>
                      <td><code className="adm-bak-id">{s.id}</code></td>
                      <td>{s.type === 'manual' ? <span className="adm-pill">Manual</span> : s.type === 'scheduled' ? <span className="adm-dim">Scheduled</span> : <span className="adm-dim">{s.type}</span>}</td>
                      <td>{statusPill(s)}{s.error && <span className="adm-bak-err">{s.error}</span>}</td>
                      <td className="adm-num">{s.status === 'success' ? size(s.size_bytes) : '-'}</td>
                      <td className="adm-dim adm-nowrap" title={timeAgo(s.created_at)}>{dateTime(s.created_at)}</td>
                      <td>
                        <div className="adm-bak-acts">
                          {s.status === 'success' && (
                            <button className="adm-btn" onClick={() => download(s)} disabled={!!busy['dl-' + s.id]} id={'admBakDl-' + s.id}>
                              {busy['dl-' + s.id] ? 'Downloading...' : 'Download'}
                            </button>
                          )}
                          {listOk && (
                            <button className="adm-btn danger" onClick={() => remove(s)} disabled={keep || !!busy['del-' + s.id]} id={'admBakDel-' + s.id}
                              title={keep ? 'The newest good snapshot is always kept' : undefined}>
                              {busy['del-' + s.id] ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {listOk && !!shown.length && <Pager page={cur} pages={pages} total={shown.length} onPage={setPage} />}
        {capped && <p className="adm-help" id="admBakCapped">Showing the newest {num(list.length)} of {num(total)} snapshots.</p>}
      </Card>

      <div className="adm-grid-2 top">
        <Card title="Automatic backups">
          <div className="adm-bak-sched">
            <div className="adm-seg" role="group" aria-label="Automatic backups" id="admBakFreq">
              {FREQS.map((f) => (
                <button key={f.key} type="button" className={freq === f.key ? 'on' : ''} aria-pressed={freq === f.key}
                  disabled={!sched || !!busy.sched} onClick={() => setFreq(f.key)} id={'admBakFreq' + f.label}>
                  {f.label}
                </button>
              ))}
            </div>
            {sched ? (
              <>
                <p className="adm-help" id="admBakFreqText">{freq ? freqText(freq) : `Unknown setting "${sched.frequency}": no automatic snapshots.`}</p>
                {next && <p className="adm-help" id="admBakNext">Next snapshot: {dateTime(new Date(next).toISOString())}</p>}
                {sched.updated_at && <p className="adm-dim">Setting changed {timeAgo(sched.updated_at)}</p>}
              </>
            ) : schedErr ? (
              <p className="adm-error" id="admBakSchedErr">
                {schedErr === NO_GRANT
                  ? `The setting cannot be read here yet (the Backup migration adds access). The database job still runs at ${runTime()} (03:00 UTC) with the setting saved there.`
                  : 'Could not load the schedule: ' + schedErr}
              </p>
            ) : <p className="adm-dim">Loading...</p>}
            {listOk && (
              <p className="adm-help" id="admBakKeep">
                Clean-up: after each good scheduled backup, scheduled and failed snapshots older than {KEEP_DAYS} days are deleted; the
                newest {KEEP_MIN} good scheduled ones always stay. Good manual snapshots stay until you delete them.
                {oldLeft > 0 && ` ${num(oldLeft)} old ${oldLeft === 1 ? 'snapshot goes' : 'snapshots go'} with the next scheduled backup${freq === 'off' ? ' (none while this is off)' : ''}.`}
              </p>
            )}
          </div>
        </Card>
        <Card title="What a snapshot has">
          <h4 className="adm-h4">Included</h4>
          <ul className="adm-bak-ul">
            <li>Profiles: names, usernames, bios, XP, levels, roles, ban status, last seen (no emails, no login IPs)</li>
            <li>Courses and chapters</li>
            <li>CTF rooms (no flags or flag hashes)</li>
            <li>Blog posts</li>
          </ul>
          <h4 className="adm-h4">Not included</h4>
          <ul className="adm-bak-ul">
            <li>Sign-in accounts, emails and passwords (Supabase Auth)</li>
            <li>CTF solves and course progress</li>
            <li>Community posts, messages, notifications</li>
            <li>Site settings, XP rules, tool settings, blog categories, resources and their files</li>
          </ul>
          <p className="adm-help">There is no restore button. To bring something back, a person with database access copies it from the JSON file.</p>
        </Card>
      </div>
    </div>
  );
}
