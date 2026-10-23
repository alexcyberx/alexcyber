'use client';

// Tools: one card per tool_settings row with the on/off switch, the message
// users see while a tool is off, who changed it last, and usage from
// tool_usage_logs (one paged read of the last 30 days, grouped here, plus a
// head count per tool for the totals). AlexRecon and AlexTrace also show
// what they store (alexrecon_scans by status, alextrace_lookups by level).
// The server checks the switch on every tool request (no cache:
// server/middleware/toolAccess.js checkToolEnabled), so a change works at once.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ToolIcon } from '@/components/ToolsHub';
import { TOOLS, type Tool } from '@/lib/tools';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, Stat, TrendChart, dateTime, num, timeAgo, useToast } from '../ui';

type ToolRow = {
  tool_key: string; display_name: string | null; is_enabled: boolean; disabled_message: string | null;
  updated_at: string | null; updated_by: string | null;
};
const COLS = 'tool_key, display_name, is_enabled, disabled_message, updated_at, updated_by';
type UseRow = { tool_key: string; user_id: string | null; created_at: string | null };
type Usage = { total: number | null; d7: number | null; d30: number | null; users: number | null; last: string | null; days: number[] };
type UsageAll = { per: Record<string, Usage>; labels: string[]; users: number | null; capped: boolean; error: string };
type ReconKey = 'total' | 'completed' | 'partial' | 'failed' | 'running' | 'stuck';
type Recon = { n: Record<ReconKey, number>; last: string | null; error: string };
type TraceKey = 'total' | 'd30' | 'low' | 'medium' | 'high';
/** others: a lookup by another user is readable (admin read access works); null = not checked. */
type Trace = { n: Record<TraceKey, number>; last: string | null; others: boolean | null; error: string };
type HeadRes = { count: number | null; error: { message: string } | null };

const DAYS = 30;
const PAGE = 1000;        // PostgREST hands out at most 1000 rows per request
const MAX_ROWS = 20000;   // uses in 30 days; the page says so if it is ever reached
const MSG_MAX = 200;
// Column default of tool_settings.disabled_message, also the server's fallback.
const DEFAULT_MSG = 'This tool is temporarily unavailable. Please check back soon.';
const STUCK_MS = 3600e3;  // a scan normally ends within minutes

// What switching a tool off stops (the routes that call checkToolEnabled).
const OFF_EFFECT: Record<string, string> = {
  mistake_analyzer: 'Every analysis request is refused.',
  alexrecon: 'New scans and new or changed schedules are refused, and scheduled scans pause. Past scans and schedules stay readable.',
  // Only these five call the server; hash, Base64, subnet and the rest run in
  // the browser (js/tools/alexutils.js) and keep working.
  alexutils: 'The server lookups (IP, DNS, SSL, MAC and CVE) are refused. The utilities that run in the browser (hash, Base64, subnet and the rest) keep working.',
  alextrace: 'Every check is refused, the lookup history too.',
};

const codeTool = (key: string): Tool | undefined => TOOLS.find((t) => t.key === key);
const nameOf = (r: ToolRow) => codeTool(r.tool_key)?.title || r.display_name || r.tool_key;
const msgOf = (r: ToolRow) => r.disabled_message || DEFAULT_MSG;
// Code order first (same as the /tools page), then rows the code does not know.
const order = (k: string) => { const i = TOOLS.findIndex((t) => t.key === k); return i < 0 ? TOOLS.length : i; };
const sortRows = (l: ToolRow[]) => [...l].sort((a, b) => order(a.tool_key) - order(b.tool_key) || a.tool_key.localeCompare(b.tool_key));
// Same-site path (one "/", no "//" or "/\") or https only.
const safeHref = (h: string | undefined) => (h && (/^\/(?![/\\])/.test(h) || /^https:\/\//.test(h)) ? h : null);

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
/** The last 30 calendar days (local time), oldest first, today last. */
function lastDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (DAYS - 1 - i));
    return { key: dayKey(d), label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), start: d.getTime() };
  });
}

/** Several head counts at once; the first error is reported, its count shows as 0. */
async function counts<K extends string>(q: Record<K, PromiseLike<HeadRes>>): Promise<{ n: Record<K, number>; error: string }> {
  const keys = Object.keys(q) as K[];
  const res = await Promise.all(keys.map((k) => q[k]));
  const n = {} as Record<K, number>;
  let error = '';
  res.forEach((r, i) => {
    if (r.error && !error) error = r.error.message;
    n[keys[i]] = r.count || 0;
  });
  return { n, error };
}

const head = { count: 'exact' as const, head: true };
const zeroRecon = (error: string): Recon => ({ n: { total: 0, completed: 0, partial: 0, failed: 0, running: 0, stuck: 0 }, last: null, error });
const zeroTrace = (error: string): Trace => ({ n: { total: 0, d30: 0, low: 0, medium: 0, high: 0 }, last: null, others: null, error });

async function loadUsage(sb: SupabaseClient, keys: string[], stale: () => boolean): Promise<UsageAll> {
  const days = lastDays();
  const since30 = days[0].start;
  const since7 = days[DAYS - 7].start;
  const index = new Map(days.map((d, i) => [d.key, i]));
  const readRows = async () => {
    const list: UseRow[] = [];
    let error = '';
    // Pages after the first stop at the newest row of the first page: a use
    // logged while paging would otherwise shift the offsets (a row read twice).
    let until = '';
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
      let q = sb.from('tool_usage_logs').select('tool_key, user_id, created_at').gte('created_at', new Date(since30).toISOString());
      if (until) q = q.lte('created_at', until);
      const { data, error: e } = await q.order('created_at', { ascending: false }).order('id', { ascending: true }).range(from, from + PAGE - 1);
      if (stale()) break;
      if (e) { error = e.message; break; }
      const page = (data || []) as UseRow[];
      list.push(...page);
      if (!until) until = page[0]?.created_at || '';
      if (page.length < PAGE) break;
    }
    return { list, error };
  };
  const [totals, rows] = await Promise.all([
    Promise.all(keys.map((k) => sb.from('tool_usage_logs').select('id', head).eq('tool_key', k))),
    readRows(),
  ]);
  const ok = !rows.error;
  const per: Record<string, Usage> = {};
  const people = new Map<string, Set<string>>();
  const all = new Set<string>();
  keys.forEach((k, i) => {
    per[k] = { total: totals[i].error ? null : totals[i].count || 0, d7: ok ? 0 : null, d30: ok ? 0 : null, users: ok ? 0 : null, last: null, days: Array(DAYS).fill(0) };
    people.set(k, new Set());
  });
  if (ok) {
    for (const r of rows.list) {
      const u = per[r.tool_key];
      if (!u || !r.created_at) continue;
      const t = Date.parse(r.created_at);
      if (!(t >= since30)) continue;
      u.d30 = (u.d30 || 0) + 1;
      if (t >= since7) u.d7 = (u.d7 || 0) + 1;
      if (!u.last) u.last = r.created_at; // newest first
      const i = index.get(dayKey(new Date(t)));
      if (i != null) u.days[i]++;
      if (r.user_id) { people.get(r.tool_key)!.add(r.user_id); all.add(r.user_id); }
    }
    keys.forEach((k) => { per[k].users = people.get(k)!.size; });
  }
  // Last use before the 30 days: one small read, only for tools without a recent use.
  const older = keys.filter((k) => !per[k].last && per[k].total !== 0);
  if (older.length && !stale()) {
    const res = await Promise.all(older.map((k) => sb.from('tool_usage_logs').select('created_at')
      .eq('tool_key', k).order('created_at', { ascending: false, nullsFirst: false }).limit(1)));
    res.forEach((r, i) => { per[older[i]].last = ((r.data || []) as { created_at: string | null }[])[0]?.created_at || null; });
  }
  const totalErr = totals.find((t) => t.error)?.error?.message || '';
  // No labels when the 30-day read failed: the chart then says so instead of
  // "No uses in the last 30 days".
  return { per, labels: ok ? days.map((d) => d.label) : [], users: ok ? all.size : null, capped: rows.list.length >= MAX_ROWS, error: rows.error || totalErr };
}

async function loadRecon(sb: SupabaseClient): Promise<Recon> {
  const scans = () => sb.from('alexrecon_scans').select('id', head);
  const [c, last] = await Promise.all([
    counts<ReconKey>({
      total: scans(),
      completed: scans().eq('status', 'completed'),
      partial: scans().eq('status', 'partial'),
      failed: scans().eq('status', 'failed'),
      running: scans().eq('status', 'running'),
      stuck: scans().eq('status', 'running').lt('started_at', new Date(Date.now() - STUCK_MS).toISOString()),
    }),
    sb.from('alexrecon_scans').select('started_at').order('started_at', { ascending: false, nullsFirst: false }).limit(1),
  ]);
  return { n: c.n, last: ((last.data || []) as { started_at: string | null }[])[0]?.started_at || null, error: c.error || last.error?.message || '' };
}

async function loadTrace(sb: SupabaseClient, me: string | null): Promise<Trace> {
  const since30 = new Date(lastDays()[0].start).toISOString();
  // Counts only, from an admin RPC: the lookup rows hold what users checked
  // (emails and usernames), so the admin gets numbers, never the rows.
  const rpc = await sb.rpc('admin_alextrace_counts', { p_since: since30 });
  if (!rpc.error && rpc.data) {
    const d = rpc.data as Partial<Record<TraceKey, number>> & { last?: string | null };
    const n = { total: d.total ?? 0, d30: d.d30 ?? 0, low: d.low ?? 0, medium: d.medium ?? 0, high: d.high ?? 0 } as Record<TraceKey, number>;
    return { n, last: d.last || null, others: true, error: '' };
  }
  if (rpc.error && rpc.error.code !== 'PGRST202') return { n: { total: 0, d30: 0, low: 0, medium: 0, high: 0 } as Record<TraceKey, number>, last: null, others: null, error: rpc.error.message };
  // RPC not there yet (database update not applied): RLS shows only the admin's own rows.
  const looks = () => sb.from('alextrace_lookups').select('id', head);
  const [c, last] = await Promise.all([
    counts<TraceKey>({
      total: looks(),
      d30: looks().gte('created_at', since30),
      low: looks().eq('overall_level', 'low'),
      medium: looks().eq('overall_level', 'medium'),
      high: looks().eq('overall_level', 'high'),
    }),
    sb.from('alextrace_lookups').select('created_at').order('created_at', { ascending: false }).limit(1),
  ]);
  void me;
  return { n: c.n, last: ((last.data || []) as { created_at: string | null }[])[0]?.created_at || null, others: false, error: c.error || last.error?.message || '' };
}

/** Accessible on/off switch (a button with role="switch"), Courses switch styles. */
function OnOff({ value, onChange, id, label, disabled }: { value: boolean; onChange: (v: boolean) => void; id: string; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} id={id} disabled={disabled}
      className={'adm-crs-switch' + (value ? ' on' : '')} onClick={() => onChange(!value)}>
      <span className="adm-crs-track" aria-hidden="true"><span className="adm-crs-knob" /></span>
      <span>{value ? 'On' : 'Off'}</span>
    </button>
  );
}

export default function Tools(_: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [tools, setTools] = useState<ToolRow[] | null>(null);
  const [err, setErr] = useState('');
  const [usage, setUsage] = useState<UsageAll | null>(null);
  const [recon, setRecon] = useState<Recon | null>(null);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [people, setPeople] = useState<Record<string, string> | null>(null); // null = names not loaded
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pick, setPick] = useState('all');
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const inflight = useRef(new Set<string>());
  const seq = useRef(0); // the latest load; older ones (and any after unmount) are dropped
  const alive = useRef(true);
  // Saved writes, numbered. A write saved after a load started wins over that
  // load's row, so a Reload answered before the write landed cannot put the
  // old value back on screen.
  const ver = useRef(0);
  const wrote = useRef(new Map<string, number>());

  useEffect(() => { alive.current = true; return () => { alive.current = false; seq.current++; }; }, []);

  const load = useCallback(async () => {
    const my = ++seq.current;
    const stale = () => my !== seq.current;
    const v0 = ver.current;
    setLoading(true);
    let gotTools = false;
    try {
      const [{ data: sess }, t] = await Promise.all([
        sb.auth.getSession(),
        sb.from('tool_settings').select(COLS).order('tool_key'),
      ]);
      if (stale()) return;
      const uid = sess.session?.user.id || null;
      setMe(uid);
      if (t.error) { setErr(t.error.message); setTools((l) => l || []); setLoading(false); return; }
      const rows = sortRows((t.data || []) as ToolRow[]);
      setErr('');
      setTools((prev) => rows.map((x) => ((wrote.current.get(x.tool_key) || 0) > v0 && prev?.find((p) => p.tool_key === x.tool_key)) || x));
      gotTools = true;
      const keys = rows.map((r) => r.tool_key);
      const ids = [...new Set([...rows.map((r) => r.updated_by).filter((x): x is string => !!x), ...(uid ? [uid] : [])])];
      const [u, rc, tr, names] = await Promise.all([
        loadUsage(sb, keys, stale),
        keys.includes('alexrecon') ? loadRecon(sb) : null,
        keys.includes('alextrace') ? loadTrace(sb, uid) : null,
        ids.length ? sb.from('profiles').select('id, full_name, username').in('id', ids) : null,
      ]);
      if (stale()) return;
      setUsage(u);
      setRecon(rc);
      setTrace(tr);
      if (names && !names.error) {
        const m: Record<string, string> = {};
        ((names.data || []) as { id: string; full_name: string | null; username: string | null }[])
          .forEach((p) => { m[p.id] = p.full_name || p.username || 'No name'; });
        setPeople(m);
      }
      setLoading(false);
    } catch (e) {
      // supabase-js returns errors, but a broken network or session read can still throw.
      if (stale()) return;
      const msg = e instanceof Error ? e.message : 'Network error. Try again.';
      if (gotTools) {
        // The cards stay; only the numbers say they failed.
        setUsage({ per: {}, labels: [], users: null, capped: false, error: msg });
        setRecon(zeroRecon(msg));
        setTrace(zeroTrace(msg));
      } else {
        setErr(msg);
        setTools((l) => l || []);
      }
      setLoading(false);
    }
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  // One write at a time per tool: a second click while saving is ignored and
  // that card shows as busy (switch and Save disabled).
  const run = useCallback(async (key: string, fn: () => Promise<boolean>) => {
    if (inflight.current.has(key)) return false;
    inflight.current.add(key);
    setBusy((b) => ({ ...b, [key]: true }));
    try { return await fn(); } finally {
      inflight.current.delete(key);
      if (alive.current) setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  }, []);

  // Call inside run(). An update that RLS refuses comes back with no row and
  // no error, so "no row came back" counts as a failure, never as saved.
  async function patch(r: ToolRow, values: Partial<ToolRow>, type: string, what: string, ok: string): Promise<boolean> {
    const v: Record<string, unknown> = { ...values, updated_at: new Date().toISOString() };
    if (me) v.updated_by = me;
    try {
      const { data, error } = await sb.from('tool_settings').update(v).eq('tool_key', r.tool_key).select(COLS);
      if (error) { toast('Could not save: ' + error.message, 'error'); return false; }
      const fresh = ((data || []) as ToolRow[])[0];
      if (!fresh) { toast('Not saved: the database refused the change. Sign in again and retry.', 'error'); return false; }
      // The change is saved: audit and toast it even if the admin left this
      // section meanwhile (the toasts live in the panel shell).
      logAdminEvent(type, `${nameOf(r)} (${r.tool_key}): ${what}`);
      toast(ok);
      if (alive.current) {
        wrote.current.set(r.tool_key, ++ver.current);
        setTools((l) => (l || []).map((x) => (x.tool_key === r.tool_key ? fresh : x)));
      }
      return true;
    } catch (e) {
      toast('Could not save: ' + (e instanceof Error ? e.message : 'network error. Try again.'), 'error');
      return false;
    }
  }

  function setEnabled(r: ToolRow, v: boolean) {
    const name = nameOf(r);
    run(r.tool_key, async () => {
      if (!v && !confirm(`Turn off ${name}?\n\nUsers then see this message: "${msgOf(r)}"\n\n${OFF_EFFECT[r.tool_key] || 'Every request to this tool is refused.'} `
        + 'The /tools page shows the card as Unavailable. It works at once, and you can switch it back on any time.')) return false;
      return patch(r, { is_enabled: v }, v ? 'admin_tool_enabled' : 'admin_tool_disabled', v ? 'switched on' : 'switched off', v ? `${name} is on` : `${name} is off`);
    });
  }

  const saveMessage = (r: ToolRow, text: string) =>
    run(r.tool_key, () => patch(r, { disabled_message: text }, 'admin_tool_message_updated', `message when off set to "${text}"`, 'Message saved'));

  const list = useMemo(() => tools || [], [tools]);
  const missing = tools && !err ? TOOLS.filter((t) => !list.some((r) => r.tool_key === t.key)) : [];
  const onCount = list.filter((r) => r.is_enabled).length;
  const sum = (f: (u: Usage) => number | null) => {
    if (!usage) return null;
    let s = 0;
    for (const r of list) { const u = usage.per[r.tool_key]; const x = u ? f(u) : null; if (x == null) return null; s += x; }
    return s;
  };
  const plus = usage?.capped ? '+' : '';
  const total = (v: number | null) => (v == null ? '-' : num(v) + plus);
  const pickKey = pick !== 'all' && list.some((r) => r.tool_key === pick) ? pick : 'all';
  const points = useMemo(() => {
    if (!usage) return [];
    if (pickKey !== 'all') return usage.per[pickKey]?.days || [];
    return Array.from({ length: DAYS }, (_, i) => list.reduce((s, r) => s + (usage.per[r.tool_key]?.days[i] || 0), 0));
  }, [usage, list, pickKey]);
  const chartTotal = points.reduce((a, b) => a + b, 0);

  return (
    <div className="adm-stack">
      <div className="adm-tool-top">
        <p className="adm-help" id="admToolCacheNote">
          Switches and messages work at once: the server checks the switch on every tool request. The /tools page shows the change on the next visit.
          A tool that is off still opens, but every request to it then gets the message set on its card below.
        </p>
        <button className="adm-btn" onClick={() => load()} disabled={loading} id="admToolReload">{loading ? 'Loading...' : 'Reload'}</button>
      </div>

      <div className="adm-stats" id="admToolStats">
        <Stat label="Tools on" value={tools == null ? '...' : err ? '-' : `${num(onCount)} of ${num(list.length)}`} />
        <Stat label="Uses, last 7 days" value={usage ? total(sum((u) => u.d7)) : '...'} />
        <Stat label="Uses, last 30 days" value={usage ? total(sum((u) => u.d30)) : '...'} />
        <Stat label="Users, last 30 days" value={usage ? total(usage.users) : '...'} sub="different people, all tools" />
      </div>

      {usage?.error && <p className="adm-error" id="admToolUsageErr">Some usage numbers could not be loaded: {usage.error}</p>}
      {usage?.capped && <p className="adm-help" id="admToolCapped">More than {num(MAX_ROWS)} uses in 30 days: the numbers and the chart show the newest {num(MAX_ROWS)}.</p>}

      <Card title="Uses per day, last 30 days" actions={
        <select className="adm-input adm-select" value={pickKey} onChange={(e) => setPick(e.target.value)} aria-label="Tool" id="admToolChartPick">
          <option value="all">All tools</option>
          {list.map((r) => <option key={r.tool_key} value={r.tool_key}>{nameOf(r)}</option>)}
        </select>
      }>
        {!usage ? <Empty>Loading...</Empty> : !usage.labels.length ? <Empty>Could not load usage.</Empty> : !chartTotal ? <Empty>No uses in the last 30 days.</Empty> : (
          <div className="adm-tool-chart" id="admToolChart"><TrendChart points={points} labels={usage.labels} unit="uses" /></div>
        )}
        <p className="adm-help adm-tool-chart-note">
          A use is one request that worked: one analysis, one manual AlexRecon scan, one AlexTrace check or one AlexUtils server lookup (IP, DNS, SSL, MAC, CVE).
          Utilities that run in the browser are not counted.
        </p>
      </Card>

      {tools == null ? <Empty>Loading...</Empty> : err ? <p className="adm-error" id="admToolErr">Could not load tools: {err}</p> : !list.length ? <Empty>No tools in the database.</Empty> : (
        <div className="adm-tool-grid" id="admTools">
          {list.map((r) => (
            <ToolCard key={r.tool_key} r={r} usage={usage?.per[r.tool_key] || null} plus={plus} busy={!!busy[r.tool_key]}
              people={people} recon={r.tool_key === 'alexrecon' ? recon : null} trace={r.tool_key === 'alextrace' ? trace : null}
              loaded={!!usage} onToggle={(v) => setEnabled(r, v)} onSaveMessage={(t) => saveMessage(r, t)} />
          ))}
        </div>
      )}

      {missing.length > 0 && (
        <p className="adm-error" id="admToolMissing">
          In the code but without a database row: {missing.map((t) => t.title).join(', ')}. The site shows {missing.length === 1 ? 'it' : 'them'} as on and no switch exists here,
          and {missing.length === 1 ? 'its' : 'their'} uses are not counted (a use needs the tool row). Adding the row needs a database change.
        </p>
      )}
    </div>
  );
}

function ToolCard({ r, usage, plus, busy, people, recon, trace, loaded, onToggle, onSaveMessage }: {
  r: ToolRow; usage: Usage | null; plus: string; busy: boolean; people: Record<string, string> | null;
  recon: Recon | null; trace: Trace | null; loaded: boolean;
  onToggle: (v: boolean) => void; onSaveMessage: (text: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const k = r.tool_key;
  const code = codeTool(k);
  const href = safeHref(code?.href);
  const name = nameOf(r);
  // Names not loaded (read failed): say nothing rather than "unknown".
  const by = r.updated_by && people ? people[r.updated_by] || 'an unknown account' : '';
  const n = (v: number | null | undefined) => (!loaded ? '...' : num(v ?? null));

  return (
    <section className={'adm-card adm-tool-card' + (r.is_enabled ? '' : ' off')} id={'admTool-' + k}>
      <div className="adm-tool-head">
        <span className="adm-tool-icon" aria-hidden="true"><ToolIcon toolKey={k} /></span>
        <div className="adm-tool-name">
          <span className="adm-strong">{name}</span>
          <span className="adm-dim"><code>{k}</code> {code ? code.tag : <span className="adm-pill danger" title="No page for this key in the code">not on the site</span>}</span>
        </div>
        <OnOff value={r.is_enabled} onChange={onToggle} disabled={busy} id={'admToolSwitch-' + k} label={`${name} on for users`} />
      </div>
      <p className={'adm-tool-status' + (r.is_enabled ? '' : ' off')} id={'admToolStatus-' + k}>
        {r.is_enabled ? 'Live: users can use it.' : 'Off: users get the message below.'}
      </p>

      <dl className="adm-tool-nums">
        <div><dt>Total uses</dt><dd id={'admToolTotal-' + k}>{n(usage?.total)}</dd></div>
        <div><dt>Last 7 days</dt><dd id={'admTool7-' + k}>{n(usage?.d7)}{usage?.d7 != null && plus}</dd></div>
        <div><dt>Last 30 days</dt><dd id={'admTool30-' + k}>{n(usage?.d30)}{usage?.d30 != null && plus}</dd></div>
        <div><dt>Users, 30 days</dt><dd id={'admToolUsers-' + k}>{n(usage?.users)}{usage?.users != null && plus}</dd></div>
      </dl>
      <div className="adm-dim" id={'admToolLast-' + k} title={usage?.last ? dateTime(usage.last) : undefined}>
        Last used: {!loaded ? '...' : usage?.last ? timeAgo(usage.last) : usage?.total === 0 ? 'never' : '-'}
      </div>

      {k === 'alexrecon' && <ReconBlock recon={recon} loaded={loaded} />}
      {k === 'alextrace' && <TraceBlock trace={trace} loaded={loaded} />}

      <div className="adm-tool-msg">
        <div className="adm-h4">Message when off</div>
        {editing ? (
          <MessageForm k={k} stored={r.disabled_message || ''} busy={busy} onSave={onSaveMessage} onDone={() => setEditing(false)} />
        ) : (
          <>
            <p className="adm-tool-msg-text" id={'admToolMsg-' + k}>{msgOf(r)}{!r.disabled_message && <span className="adm-dim"> (default)</span>}</p>
            <button className="adm-link" onClick={() => setEditing(true)} disabled={busy} id={'admToolMsgEdit-' + k}>Edit message</button>
          </>
        )}
      </div>

      <div className="adm-tool-foot">
        <span className="adm-dim" id={'admToolUpdated-' + k} title={r.updated_at ? dateTime(r.updated_at) : undefined}>
          {r.updated_at ? `Updated ${timeAgo(r.updated_at)}` : 'Never updated'}{by && ` by ${by}`}
        </span>
        {href && <a className="adm-link" href={href} target="_blank" rel="noopener noreferrer" id={'admToolOpen-' + k}>Open tool page</a>}
      </div>
    </section>
  );
}

function ReconBlock({ recon, loaded }: { recon: Recon | null; loaded: boolean }) {
  return (
    <div className="adm-tool-extra" id="admToolRecon">
      <div className="adm-h4">Scans stored</div>
      {!loaded || !recon ? <span className="adm-dim">Loading...</span> : recon.error ? <p className="adm-error">Could not count scans: {recon.error}</p> : (
        <>
          <div className="adm-tool-pills">
            <span className="adm-pill" id="admToolReconTotal">{num(recon.n.total)} total</span>
            <span className="adm-pill accent" id="admToolReconCompleted">{num(recon.n.completed)} completed</span>
            <span className="adm-pill" id="admToolReconPartial">{num(recon.n.partial)} partial</span>
            <span className={'adm-pill' + (recon.n.failed ? ' danger' : '')} id="admToolReconFailed">{num(recon.n.failed)} failed</span>
            <span className="adm-pill" id="admToolReconRunning">{num(recon.n.running)} running</span>
          </div>
          {recon.n.stuck > 0 && <p className="adm-tool-warn" id="admToolReconStuck">{num(recon.n.stuck)} running for over an hour, probably stuck.</p>}
          <span className="adm-dim" title={recon.last ? dateTime(recon.last) : undefined}>Last scan: {recon.last ? timeAgo(recon.last) : 'never'}. Scheduled scans are stored here but do not count as uses.</span>
        </>
      )}
    </div>
  );
}

function TraceBlock({ trace, loaded }: { trace: Trace | null; loaded: boolean }) {
  return (
    <div className="adm-tool-extra" id="admToolTrace">
      <div className="adm-h4">Lookups stored (username and email checks)</div>
      {!loaded || !trace ? <span className="adm-dim">Loading...</span> : trace.error ? <p className="adm-error">Could not count lookups: {trace.error}</p> : (
        <>
          <div className="adm-tool-pills">
            <span className="adm-pill" id="admToolTraceTotal">{num(trace.n.total)} total</span>
            <span className="adm-pill" id="admToolTrace30">{num(trace.n.d30)} in 30 days</span>
            <span className="adm-pill" id="admToolTraceLow">{num(trace.n.low)} low exposure</span>
            <span className="adm-pill" id="admToolTraceMedium">{num(trace.n.medium)} medium</span>
            <span className={'adm-pill' + (trace.n.high ? ' danger' : '')} id="admToolTraceHigh">{num(trace.n.high)} high</span>
          </div>
          {trace.others === false && (
            <p className="adm-tool-warn" id="admToolTraceNote">
              Only your own lookups are counted until the database update for this section is applied (it adds a counts-only function; the lookups themselves stay private).
            </p>
          )}
          <span className="adm-dim" title={trace.last ? dateTime(trace.last) : undefined}>Last lookup: {trace.last ? timeAgo(trace.last) : 'never'}. Photo, password and breach checks are not stored, they count as uses only.</span>
        </>
      )}
    </div>
  );
}

function MessageForm({ k, stored, busy, onSave, onDone }: {
  k: string; stored: string; busy: boolean; onSave: (text: string) => Promise<boolean>; onDone: () => void;
}) {
  const [draft, setDraft] = useState(stored || DEFAULT_MSG);
  const [err, setErr] = useState('');
  // One line: the hub shows it in an alert, the tools in their error box.
  const clean = draft.replace(/\s+/g, ' ').trim();
  const changed = clean !== stored;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!clean) return setErr('Write the message users should see while the tool is off.');
    if (clean.length > MSG_MAX) return setErr(`Keep it to ${MSG_MAX} characters or less.`);
    if (!changed) return onDone();
    setErr('');
    if (await onSave(clean)) onDone();
  }

  return (
    <form className="adm-form adm-inline-form" onSubmit={submit}>
      <label className="adm-field">
        <span>Users see this while the tool is off</span>
        <textarea rows={3} maxLength={MSG_MAX} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus id={'admToolMsgInput-' + k} />
      </label>
      <div className="adm-tool-msg-meta">
        <span className="adm-dim">{clean.length} of {MSG_MAX}</span>
        <button type="button" className="adm-link" onClick={() => setDraft(DEFAULT_MSG)} id={'admToolMsgDefault-' + k}>Use the default text</button>
      </div>
      {err && <p className="adm-error" id={'admToolMsgErr-' + k}>{err}</p>}
      <div className="adm-actions">
        <button className="adm-btn primary" disabled={busy || !clean || !changed} id={'admToolMsgSave-' + k}>{busy ? 'Saving...' : 'Save'}</button>
        <button type="button" className="adm-btn ghost" onClick={onDone} id={'admToolMsgCancel-' + k}>Cancel</button>
      </div>
    </form>
  );
}
