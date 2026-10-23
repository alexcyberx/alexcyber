'use client';

// XP & Leaderboard: the XP rules that really give XP (daily_login and
// chapter_completion, read by award_daily_login_xp and track_chapter_view at
// the moment XP is given), the stored rules nothing reads (shown, not
// editable), the global leaderboard exactly as the site shows it
// (get_leaderboard: top 50 by XP, banned users left out) and the total XP of
// every account. No weekly/monthly boards: nothing records XP per week
// (owner decision, the old ones always showed 0).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, Stat, dateTime, num, timeAgo, useToast } from '../ui';

type Rules = Record<string, unknown>;
type BoardRow = {
  id: string; username: string | null; full_name: string | null; xp: number | null; level: number | null;
  ctf_solves: number | null; rank: number | string | null;
};
type Summary = { users: number; total: number; withXp: number; banned: number; inBrowser: boolean; capped: boolean };

const XP_MAX = 1000;
const BOARD = 50;          // same as the public leaderboard page
const PAGE = 1000;         // PostgREST hands out at most 1000 rows per request
const MAX_USERS = 50000;   // browser fallback only; the page says so if it is reached

// The rules a DB function reads when it gives XP. fallback = what that
// function uses when the key is missing or null (its coalesce).
// broken = what a stored value the DB cannot cast to integer does (the cast
// error stops the whole function call).
const EDITABLE = [
  {
    key: 'daily_login', label: 'Daily login', fallback: 10,
    where: 'Given once a day when a signed-in user opens the site. A new day starts at 5:30 AM India time (midnight UTC). Not for banned users.',
    broken: 'no daily login XP is given',
  },
  {
    key: 'chapter_completion', label: 'Chapter completion', fallback: 25,
    where: 'Given the first time a signed-in user opens a chapter that is visible on the site (opening counts as completing). Once per chapter. Not for banned users.',
    broken: 'no chapter XP is given and chapter progress is not saved either',
  },
] as const;
type Rule = (typeof EDITABLE)[number];

// Stored in the same settings row, but nothing gives XP with them.
const CTF_WHY = 'Not used: each room has its own XP, set in the CTF section. Only the old panel read it, to pre-fill a new challenge.';
const UNUSED: Record<string, { label: string; why: string }> = {
  ctf_easy: { label: 'CTF solve, Easy', why: CTF_WHY },
  ctf_medium: { label: 'CTF solve, Medium', why: CTF_WHY },
  ctf_hard: { label: 'CTF solve, Hard', why: CTF_WHY },
  quiz_pass: { label: 'Quiz pass', why: 'Not used: the site has no quizzes yet.' },
};

const isObj = (v: unknown): v is Rules => !!v && typeof v === 'object' && !Array.isArray(v);
/** What the DB cast (value->>'key')::integer accepts; anything else makes it fail. */
function asInt(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && /^\s*[+-]?\d+\s*$/.test(v) ? Number(v) : NaN;
  return Number.isInteger(n) && Math.abs(n) <= 2147483647 ? n : null;
}
const show = (v: unknown) => (typeof v === 'string' ? `"${v.slice(0, 40)}"` : (JSON.stringify(v) ?? String(v)).slice(0, 40));

type Eff = { value: number | null; note: string; saved: boolean };
/** The XP the site gives today for a rule, and what is wrong with the stored value. */
function effective(r: Rules | null, rule: Rule): Eff {
  const v = r ? r[rule.key] : undefined;
  if (v === undefined || v === null) return { value: rule.fallback, note: `Not saved yet: the site uses ${rule.fallback}.`, saved: false };
  const n = asInt(v);
  if (n == null) return { value: null, note: `The saved value ${show(v)} is not a whole number, so ${rule.broken} until you save one.`, saved: true };
  if (n < 0) return { value: n, note: `The saved value ${n} is below 0, so users lose XP for it. Save a value from 0 to ${XP_MAX}.`, saved: true };
  if (n > XP_MAX) return { value: n, note: `The saved value ${n} is above ${XP_MAX}. Save a value from 0 to ${XP_MAX}.`, saved: true };
  return { value: n, note: '', saved: true };
}
const inputOf = (e: Eff) => (e.value == null ? '' : String(e.value));

const display = (u: BoardRow) => u.full_name || u.username || 'No name';
const levelFor = (xp: number) => Math.floor(Math.max(0, xp) / 500) + 1; // same rule as the DB and the site

export default function Gamification({ go }: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  // undefined = loading, null = no rules row (the site uses the fallbacks)
  const [rules, setRules] = useState<Rules | null | undefined>(undefined);
  const [rulesErr, setRulesErr] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [board, setBoard] = useState<BoardRow[] | null>(null);
  const [boardErr, setBoardErr] = useState('');
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sumErr, setSumErr] = useState('');
  const [loading, setLoading] = useState(false);
  // The latest load of each kind; older ones (and any after unmount) are dropped.
  const rulesSeq = useRef(0);
  const boardSeq = useRef(0);
  const sumSeq = useRef(0);
  const alive = useRef(true);

  const applyRules = useCallback((r: Rules | null) => {
    setRules(r);
    setVals(Object.fromEntries(EDITABLE.map((x) => [x.key, inputOf(effective(r, x))])));
  }, []);

  const loadRules = useCallback(async () => {
    const me = ++rulesSeq.current;
    const [r, at] = await Promise.all([
      sb.rpc('get_xp_rules'),
      sb.from('platform_settings').select('updated_at').eq('key', 'xp_rules').maybeSingle(),
    ]);
    if (me !== rulesSeq.current) return;
    if (r.error) { setRulesErr(r.error.message); setRules(null); return; }
    setRulesErr('');
    applyRules(isObj(r.data) ? r.data : null);
    setSavedAt((at.data as { updated_at: string | null } | null)?.updated_at ?? null);
  }, [sb, applyRules]);

  const loadBoard = useCallback(async () => {
    const me = ++boardSeq.current;
    const { data, error } = await sb.rpc('get_leaderboard', { p_limit: BOARD });
    if (me !== boardSeq.current) return;
    if (error) { setBoardErr(error.message); setBoard([]); return; }
    const list = (data || []) as BoardRow[];
    setBoardErr('');
    setBoard(list);
    // get_leaderboard leaves admins out once the phase 4 SQL is applied; before
    // that it ranks them like everyone, so mark them.
    if (!list.length) { setAdmins(new Set()); return; }
    const { data: roles, error: roleErr } = await sb.from('profiles').select('id').eq('role', 'admin').in('id', list.map((x) => x.id));
    if (me !== boardSeq.current || roleErr) return;
    setAdmins(new Set(((roles || []) as { id: string }[]).map((x) => x.id)));
  }, [sb]);

  const loadSummary = useCallback(async () => {
    const me = ++sumSeq.current;
    const r = await sb.rpc('admin_xp_summary');
    if (me !== sumSeq.current) return;
    if (!r.error && isObj(r.data)) {
      const d = r.data;
      const n = (k: string) => Number(d[k]) || 0;
      setSumErr('');
      setSummary({ users: n('users'), total: n('total_xp'), withXp: n('users_with_xp'), banned: n('banned'), inBrowser: false, capped: false });
      return;
    }
    // PGRST202: the function is not added yet. Add it up here instead
    // (admins read every profile), page by page. The exact count from the
    // first page decides when to stop: the server may hand out fewer rows
    // per page than asked, and a short page must not end the count early.
    if (r.error && r.error.code !== 'PGRST202') { setSumErr(r.error.message); setSummary(null); return; }
    let users = 0, total = 0, withXp = 0, banned = 0, capped = false;
    let count: number | null = null;
    for (;;) {
      if (users >= MAX_USERS) { capped = true; break; }
      const { data, error, count: c } = await sb.from('profiles')
        .select('xp, is_banned', users === 0 ? { count: 'exact' } : undefined)
        .order('id').range(users, users + PAGE - 1);
      if (me !== sumSeq.current) return;
      if (error) { setSumErr(error.message); setSummary(null); return; }
      if (users === 0 && typeof c === 'number') count = c;
      const page = (data || []) as { xp: number | null; is_banned: boolean | null }[];
      page.forEach((p) => {
        users++;
        total += p.xp || 0;
        if ((p.xp || 0) > 0) withXp++;
        if (p.is_banned) banned++;
      });
      if (!page.length || (count != null ? users >= count : page.length < PAGE)) break;
    }
    setSumErr('');
    setSummary({ users, total, withXp, banned, inBrowser: true, capped });
  }, [sb]);

  useEffect(() => { loadRules(); }, [loadRules]);
  useEffect(() => { loadBoard(); loadSummary(); }, [loadBoard, loadSummary]);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; rulesSeq.current++; boardSeq.current++; sumSeq.current++; };
  }, []);

  // The rules are reloaded only after a failed load: reloading them otherwise
  // would wipe values typed but not saved yet.
  async function refresh() {
    if (loading) return;
    setLoading(true);
    try {
      if (rulesErr) { setRulesErr(''); setRules(undefined); }
      await Promise.all([loadBoard(), loadSummary(), rulesErr ? loadRules() : null]);
    } finally {
      if (alive.current) setLoading(false);
    }
  }

  const effs = EDITABLE.map((r) => ({ rule: r, eff: effective(rules ?? null, r) }));
  const dirty = effs.some(({ rule, eff }) => (vals[rule.key] ?? '').trim() !== inputOf(eff));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current || rules === undefined || rulesErr) return;
    setFormErr('');
    const changes: { key: string; label: string; to: number }[] = [];
    for (const { rule, eff } of effs) {
      const t = (vals[rule.key] ?? '').trim();
      if (!/^\d+$/.test(t) || Number(t) > XP_MAX) return setFormErr(`${rule.label}: enter a whole number from 0 to ${XP_MAX}.`);
      const to = Number(t);
      if (to !== eff.value) changes.push({ key: rule.key, label: rule.label, to });
    }
    if (!changes.length) { toast('Nothing changed', 'info'); return; }
    const zero = changes.filter((c) => c.to === 0).map((c) => c.label);
    if (zero.length && !confirm(`Set ${zero.join(' and ')} to 0 XP?\n\nUsers get no XP for it from now on. XP already given stays.`)) return;
    savingRef.current = true;
    setSaving(true);
    try {
      // Merge onto the latest stored object: keys this form does not edit
      // (ctf_*, quiz_pass, anything else) and rules nobody changed here stay.
      const fresh = await sb.rpc('get_xp_rules');
      if (fresh.error) { toast('Could not save: ' + fresh.error.message, 'error'); return; }
      const base: Rules = isObj(fresh.data) ? fresh.data : {};
      const next: Rules = { ...base };
      changes.forEach((c) => { next[c.key] = c.to; });
      const { error } = await sb.rpc('save_xp_rules', { p_rules: next });
      if (error) { toast('Could not save: ' + error.message, 'error'); return; }
      // save_xp_rules returns nothing: read back to be sure the row holds the new values.
      const [check, at] = await Promise.all([
        sb.rpc('get_xp_rules'),
        sb.from('platform_settings').select('updated_at').eq('key', 'xp_rules').maybeSingle(),
      ]);
      // "from" is the value the DB held just before this save (another admin
      // may have changed it after this page loaded).
      const what = changes.map((c) => `${c.key} ${base[c.key] == null ? 'not set' : show(base[c.key])} to ${c.to}`).join('; ');
      if (check.error) {
        logAdminEvent('admin_xp_rules_updated', what + ' (not read back)');
        toast('Saved, but reading it back failed: ' + check.error.message + '. Reload to check.', 'error');
        return;
      }
      const saved = isObj(check.data) ? check.data : null;
      if (!saved || changes.some((c) => saved[c.key] !== c.to)) {
        toast('Not saved: the database did not keep the change. Sign in again and retry.', 'error');
        return;
      }
      logAdminEvent('admin_xp_rules_updated', what);
      toast('XP rules saved');
      if (!alive.current) return;
      rulesSeq.current++; // a load still running would bring back the old values
      applyRules(saved);
      setSavedAt((at.data as { updated_at: string | null } | null)?.updated_at ?? new Date().toISOString());
    } catch (err) {
      toast('Could not save: ' + (err instanceof Error ? err.message : 'network error'), 'error');
    } finally {
      savingRef.current = false;
      if (alive.current) setSaving(false);
    }
  }

  // Read-only: the known unused rules (always listed) plus any other stored key.
  const extraKeys = rules ? Object.keys(rules).filter((k) => !EDITABLE.some((r) => r.key === k) && !UNUSED[k]).sort() : [];
  const readOnly = [
    ...Object.entries(UNUSED).map(([key, u]) => ({ key, label: u.label, why: u.why })),
    ...extraKeys.map((key) => ({ key, label: key, why: 'Not used: no feature reads this key.' })),
  ];
  const storedText = (key: string) => {
    const v = rules ? rules[key] : undefined;
    if (v === undefined || v === null) return 'not set';
    const n = asInt(v);
    return n == null ? show(v) : `${num(n)} XP`;
  };
  // Only from loaded rules: before the load (or after a failed one) the
  // fallbacks would read as the live values.
  const xpText = (key: Rule['key'], given: (n: string) => string) => {
    if (rules === undefined) return 'Loading...';
    if (rulesErr) return 'Could not load the XP rules.';
    const v = effs.find((x) => x.rule.key === key)?.eff.value;
    return v == null ? 'Not given right now: see XP rules.' : given(num(v));
  };
  const avg = summary && summary.users ? Math.round(summary.total / summary.users) : 0;

  return (
    <div className="adm-stack">
      <div className="adm-stats" id="admXpStats">
        <Stat label="Total XP of all users" value={summary ? num(summary.total) : sumErr ? '-' : '...'} sub={summary ? `${num(summary.users)} accounts, banned included` : undefined} />
        <Stat label="Users with XP" value={summary ? num(summary.withXp) : sumErr ? '-' : '...'} sub={summary ? `of ${num(summary.users)}` : undefined} />
        <Stat label="Average XP" value={summary ? num(avg) : sumErr ? '-' : '...'} sub={summary ? 'per account' : undefined} />
        <Stat label="Banned users" value={summary ? num(summary.banned) : sumErr ? '-' : '...'} sub={summary ? 'left out of the leaderboard' : undefined} />
      </div>
      {sumErr && <p className="adm-error" id="admXpSumErr">Could not count the XP: {sumErr}</p>}
      {summary?.inBrowser && (
        <p className="adm-help" id="admXpSumNote">
          These totals are added up in the browser for now: the database function admin_xp_summary is not added yet (it is in the SQL for this update).
          {summary.capped && ` Counted over the first ${num(MAX_USERS)} accounts only.`}
        </p>
      )}

      <div className="adm-grid-2 top">
        <Card title="XP rules">
          {rules === undefined ? <Empty>Loading...</Empty> : rulesErr ? <Empty>Could not load the XP rules: {rulesErr}. Use Refresh to try again.</Empty> : (
            // noValidate: the browser's own min/max bubble would block the
            // submit before the plain error text below can show.
            <form className="adm-form" onSubmit={save} id="admXpRulesForm" noValidate>
              <p className="adm-help">Changes count from the next login or chapter. XP already given stays. Whole numbers from 0 to {XP_MAX}.</p>
              <div className="adm-xp-rules">
                {effs.map(({ rule, eff }) => (
                  <div className="adm-xp-rule" key={rule.key}>
                    <div className="adm-xp-rule-text">
                      <label htmlFor={'admXpRule-' + rule.key} className="adm-strong">{rule.label}</label>
                      <span className="adm-help">{rule.where}</span>
                      {eff.note && <span className="adm-xp-warn" id={'admXpRuleNote-' + rule.key}>{eff.note}</span>}
                    </div>
                    <div className="adm-xp-rule-input">
                      <input className="adm-input adm-xp-num" type="number" min={0} max={XP_MAX} step={1} inputMode="numeric"
                        id={'admXpRule-' + rule.key} value={vals[rule.key] ?? ''} disabled={saving}
                        onChange={(ev) => setVals((v) => ({ ...v, [rule.key]: ev.target.value }))} />
                      <span className="adm-dim">XP</span>
                    </div>
                  </div>
                ))}
              </div>
              {formErr && <p className="adm-error" id="admXpRulesErr">{formErr}</p>}
              <div className="adm-actions adm-xp-save">
                <button className="adm-btn primary" disabled={saving || !dirty} id="admXpRulesSave">{saving ? 'Saving...' : 'Save XP rules'}</button>
                {dirty && !saving && <button type="button" className="adm-btn ghost" onClick={() => { setFormErr(''); applyRules(rules ?? null); }} id="admXpRulesReset">Undo changes</button>}
                <span className="adm-dim" id="admXpSavedAt" title={savedAt ? dateTime(savedAt) : undefined}>{rules === null ? 'No rules saved yet' : savedAt ? `Last saved ${timeAgo(savedAt)}` : ''}</span>
              </div>
            </form>
          )}
          {rules !== undefined && !rulesErr && (
            <section className="adm-xp-unused">
              <h4 className="adm-h4">Stored but not used</h4>
              <ul className="adm-list" id="admXpUnused">
                {readOnly.map((r) => (
                  <li key={r.key} id={'admXpUnused-' + r.key} className="adm-xp-ro">
                    <div className="adm-xp-rule-text">
                      <span><span className="adm-strong">{r.label}</span>{r.label !== r.key && <> <span className="adm-dim">{r.key}</span></>}</span>
                      <span className="adm-help">{r.why}</span>
                    </div>
                    <span className="adm-num adm-dim">{storedText(r.key)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Card>

        <Card title="How XP and levels work">
          <div className="adm-stack adm-xp-how" id="admXpLevels">
            <div>
              <h4 className="adm-h4">Level rule</h4>
              <p className="adm-help">
                Level = <code>floor(xp / 500) + 1</code>, the same rule the database uses whenever it gives XP, and the site shows the level from the XP.
                So 0 to 499 XP is level 1, 500 to 999 is level 2, 1,000 to 1,499 is level 3, and so on.
              </p>
            </div>
            <div>
              <h4 className="adm-h4">Where XP comes from</h4>
              <ul className="adm-list">
                <li className="adm-xp-ro">
                  <div className="adm-xp-rule-text"><span className="adm-strong">Daily login</span><span className="adm-help">{xpText('daily_login', (n) => `${n} XP once a day (XP rules).`)}</span></div>
                </li>
                <li className="adm-xp-ro">
                  <div className="adm-xp-rule-text"><span className="adm-strong">Chapter completion</span><span className="adm-help">{xpText('chapter_completion', (n) => `${n} XP per chapter, once (XP rules).`)}</span></div>
                </li>
                <li className="adm-xp-ro">
                  <div className="adm-xp-rule-text"><span className="adm-strong">CTF solve</span><span className="adm-help">The XP of the room, once per room, with the first correct flag. A hint with an XP cost takes that XP away (never below 0).</span></div>
                  <button type="button" className="adm-btn" onClick={() => go('ctf')} id="admXpGoCtf">CTF</button>
                </li>
                <li className="adm-xp-ro">
                  <div className="adm-xp-rule-text"><span className="adm-strong">Award XP</span><span className="adm-help">An admin adds or takes away XP for one user, with a reason kept in the admin log.</span></div>
                  <button type="button" className="adm-btn" onClick={() => go('users')} id="admXpGoUsers">Users</button>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Leaderboard" actions={<>
        <a className="adm-btn ghost" href="/leaderboard" target="_blank" rel="noopener noreferrer" id="admXpPublic">Public page</a>
        <button className="adm-btn" onClick={refresh} disabled={loading} id="admXpRefresh">{loading ? 'Loading...' : 'Refresh'}</button>
      </>}>
        <p className="adm-help">
          The same list players see on the leaderboard page: top {BOARD} of all time by XP. Banned users and admin accounts are left out
          (an admin marked here means the database update for this section is not applied yet). With the same XP, the older account comes first.
        </p>
        {board == null ? <Empty>Loading...</Empty> : boardErr ? <Empty>Could not load the leaderboard: {boardErr}</Empty> : !board.length ? <Empty>No players yet.</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admXpBoard">
              <thead><tr><th>#</th><th>Player</th><th>Level</th><th>XP</th><th>CTF solves</th></tr></thead>
              <tbody>
                {board.map((u, i) => (
                  <tr key={u.id} className="static" id={'admXpBoardRow-' + u.id}>
                    {/* Position in the list, as the public page numbers it (the RPC's own rank can differ inside a tie). */}
                    <td className="adm-num adm-dim">{num(i + 1)}</td>
                    <td>
                      <div className="adm-user-cell">
                        <span className="adm-avatar" aria-hidden="true">{display(u).charAt(0).toUpperCase()}</span>
                        <span>
                          <a href={'/u/' + encodeURIComponent(u.id)} target="_blank" rel="noopener noreferrer" className="adm-strong">{display(u)}</a>
                          {u.username && <span className="adm-dim"> @{u.username}</span>}
                          {admins.has(u.id) && <> <span className="adm-pill accent">admin</span></>}
                        </span>
                      </div>
                    </td>
                    <td className="adm-num">{num(levelFor(u.xp || 0))}</td>
                    <td className="adm-num">{num(u.xp || 0)}</td>
                    <td className="adm-num">{num(u.ctf_solves || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
