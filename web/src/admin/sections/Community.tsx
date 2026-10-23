'use client';

// Community: threads, reports, replies, user feedback and the admin activity
// log (the old Moderation tab's useful parts). Everything is read from the DB
// in pages; user text is rendered as React text only.
// Rules this follows (trigger acx_community_guard, RLS):
// - A thread has ONE status: open, pinned or locked. Pinning a locked thread
//   unlocks it and locking a pinned one unpins it, so both ask first.
// - New replies are approved at once (no pre-moderation). Hide = status
//   'rejected' (the site shows approved replies only), Show = 'approved'.
// - Deleting a thread deletes its replies, votes and reports (FK cascade);
//   deleting a reply deletes its votes and reports. Report rows cannot be
//   deleted on their own, only resolved, dismissed or escalated.
// - admin_feedback allows the statuses unread and read only (CHECK), and the
//   admin cannot delete feedback (no policy).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { CATEGORIES } from '@/lib/community';
import { Card, Drawer, Empty, Pager, Stat, dateTime, likeText, num, timeAgo, useToast } from '../ui';

type ThreadStatus = 'open' | 'pinned' | 'locked';
type Thread = { id: string; user_id: string | null; title: string; category: string | null; status: string | null; votes: number | null; created_at: string | null };
type FullThread = Thread & { body: string };
type Reply = { id: string; thread_id: string; user_id: string | null; body: string; status: string | null; votes: number | null; created_at: string | null };
type ThreadRef = { id: string; title: string; status: string | null; user_id: string | null };
type ListReply = Reply & { thread: ThreadRef | null };
type ReportStatus = 'open' | 'resolved' | 'dismissed' | 'escalated';
type Report = {
  id: string; reporter_id: string | null; thread_id: string | null; reply_id: string | null; reason: string | null; status: string | null; created_at: string | null;
  thread: ThreadRef | null; reply: ListReply | null;
};
type Feedback = { id: string; user_id: string | null; type: string; message: string; status: string; created_at: string };
type Log = { id: string; event_type: string; details: string | null; created_at: string; actor_id?: string | null };
type Audit = { id: string; actor_id: string | null; action: string; target: string; created_at: string };
type Person = { id: string; full_name: string | null; username: string | null };
type Stats = { open: number | null; pinned: number | null; locked: number | null; reports: number | null; escalated: number | null; replies7: number | null; feedback: number | null };

const THREAD_COLS = 'id, user_id, title, category, status, votes, created_at';
const REPLY_COLS = 'id, thread_id, user_id, body, status, votes, created_at';
// FK names as hints: replies and threads are linked through two tables
// (votes, reports), so a plain embed could be ambiguous for PostgREST.
const REF = 'id, title, status, user_id';
const LIST_REPLY_COLS = `${REPLY_COLS}, thread:community_threads!community_replies_thread_id_fkey(${REF})`;
const REPORT_COLS = 'id, reporter_id, thread_id, reply_id, reason, status, created_at, '
  + `thread:community_threads!community_reports_thread_id_fkey(${REF}), `
  + `reply:community_replies!community_reports_reply_id_fkey(${LIST_REPLY_COLS})`;
const FEEDBACK_COLS = 'id, user_id, type, message, status, created_at';
const LOG_COLS = 'id, event_type, details, created_at';
const PER_PAGE = 25;
const LOG_PAGE = 50;
const COUNT_ROUNDS = 30; // reply counts of one page: up to 30 requests of 1,000 rows
const DRAWER_REPLIES = 1000;

const TABS = [
  { key: 'threads', label: 'Threads' }, { key: 'reports', label: 'Reports' }, { key: 'replies', label: 'Replies' },
  { key: 'feedback', label: 'Feedback' }, { key: 'activity', label: 'Activity' },
] as const;
type Tab = (typeof TABS)[number]['key'];

const FEEDBACK_TYPES: [string, string][] = [['bug', 'Bug'], ['suggestion', 'Suggestion'], ['complaint', 'Complaint'], ['praise', 'Praise']];
// The events this section writes (used by the Activity filter).
const COMMUNITY_EVENTS = ['admin_thread_updated', 'admin_thread_deleted', 'admin_reply_updated', 'admin_reply_deleted', 'admin_report_updated', 'admin_feedback_updated'];
const AREAS: Record<string, { label: string; types?: string[] }> = {
  all: { label: 'All admin actions' },
  community: { label: 'Community moderation', types: COMMUNITY_EVENTS },
  signins: { label: 'Sign-ins', types: ['admin_login', 'admin_logout'] },
};
// Sign-ins, the server's invite/delete entries and the password change start
// with the acting admin's email. Other details can start with user text (a
// thread title, a full name), so they are never read as the actor.
const EMAIL_FIRST = /^([^\s@"]+@[^\s@"]+\.[^\s@"]+)\s/;
const EMAIL_FIRST_EVENTS = ['admin_login', 'admin_logout', 'admin_user_invited', 'admin_user_deleted', 'admin_password_changed'];
const REFUSED = 'the database refused it (the item is gone or this session may not change it). Reload, or sign in again.';

const tStatus = (s: string | null | undefined): ThreadStatus => (s === 'pinned' || s === 'locked' ? s : 'open'); // the column default is open
const rStatus = (s: string | null | undefined): ReportStatus => (s === 'resolved' || s === 'dismissed' || s === 'escalated' ? s : 'open');
const catLabel = (c: string | null) => CATEGORIES.find(([k]) => k === c)?.[1] || c || 'General';
const short = (s: string | null | undefined, n: number) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 3) + '...' : t;
};
const stop = (e: React.SyntheticEvent) => e.stopPropagation();
const plural = (n: number, one: string, many: string) => `${num(n)} ${n === 1 ? one : many}`;

/** One write that must touch one row: an RLS refusal comes back as no rows and no error. */
async function one<T>(q: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<{ row: T | null; err: string }> {
  const { data, error } = await q;
  if (error) return { row: null, err: error.message };
  const row = Array.isArray(data) ? (data[0] as T | undefined) : undefined;
  return row ? { row, err: '' } : { row: null, err: REFUSED };
}

/** Each load gets a ticket; a result counts only while no newer load started and the section is open. */
function useLatest() {
  const seq = useRef(0);
  useEffect(() => () => { seq.current++; }, []);
  return useCallback(() => { const me = ++seq.current; return () => me === seq.current; }, []);
}

/** One write at a time per item (key); the item's buttons show busy. */
function useRun() {
  const inFlight = useRef(new Set<string>());
  const alive = useRef(true);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const held = useCallback((key: string) => inFlight.current.has(key), []);
  const run = useCallback(async (key: string, fn: () => Promise<void>) => {
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setBusy((b) => ({ ...b, [key]: true }));
    try { await fn(); } finally {
      inFlight.current.delete(key);
      if (alive.current) setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  }, []);
  return { busy, run, held };
}

/** Names for user ids, fetched once per id (shared by all tabs). */
function useNames(sb: SupabaseClient) {
  const [names, setNames] = useState<Record<string, Person>>({});
  const asked = useRef(new Set<string>());
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const want = useCallback((ids: (string | null | undefined)[]) => {
    const missing = [...new Set(ids.filter((x): x is string => !!x))].filter((id) => !asked.current.has(id));
    for (let i = 0; i < missing.length; i += 100) {
      const part = missing.slice(i, i + 100);
      part.forEach((id) => asked.current.add(id));
      sb.from('profiles').select('id, full_name, username').in('id', part).then(({ data, error }) => {
        if (error) { part.forEach((id) => asked.current.delete(id)); return; }
        if (!alive.current) return;
        setNames((p) => {
          const n = { ...p };
          part.forEach((id) => { n[id] = { id, full_name: null, username: null }; }); // no profile: 'No name', not '...'
          ((data || []) as Person[]).forEach((x) => { n[x.id] = x; });
          return n;
        });
      });
    }
  }, [sb]);
  return { names, want };
}

type Act = {
  busy: Record<string, boolean>;
  who: (id: string | null | undefined) => string;
  want: (ids: (string | null | undefined)[]) => void;
  openThread: (id: string) => void;
  changed: () => void;
  run: (key: string, fn: () => Promise<void>) => Promise<void>;
  threadStatus: (t: ThreadRef, to: ThreadStatus, then: (row: Thread) => void) => Promise<void>;
  deleteThread: (t: ThreadRef, replies: number | null, then: () => void) => Promise<void>;
  replyStatus: (r: Reply, to: 'approved' | 'rejected', then: (row: Reply) => void) => Promise<void>;
  deleteReply: (r: Reply, then: () => void) => Promise<void>;
};

export default function Community({ go, setBadge }: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('threads');
  const [rev, setRev] = useState(0); // bumped after every write: stats and the open list reload
  const [stats, setStats] = useState<Stats | null>(null);
  const [drawer, setDrawer] = useState<string | null>(null);
  const { names, want } = useNames(sb);
  const { busy, run, held } = useRun();
  const latest = useLatest();
  const changed = useCallback(() => setRev((n) => n + 1), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  const loadStats = useCallback(async () => {
    const fresh = latest();
    const head = { count: 'exact' as const, head: true };
    const week = new Date(Date.now() - 7 * 86400e3).toISOString();
    const res = await Promise.all([
      sb.from('community_threads').select('id', head).eq('status', 'open'),
      sb.from('community_threads').select('id', head).eq('status', 'pinned'),
      sb.from('community_threads').select('id', head).eq('status', 'locked'),
      sb.from('community_reports').select('id', head).eq('status', 'open'),
      sb.from('community_reports').select('id', head).eq('status', 'escalated'),
      sb.from('community_replies').select('id', head).gte('created_at', week),
      sb.from('admin_feedback').select('id', head).eq('status', 'unread'),
    ]);
    if (!fresh()) return;
    const [o, p, l, r, e, w, f] = res.map((x) => (x.error ? null : x.count ?? 0));
    setStats({ open: o, pinned: p, locked: l, reports: r, escalated: e, replies7: w, feedback: f });
    if (r != null) setBadge('community', r);
  }, [sb, setBadge, latest]);
  useEffect(() => { loadStats(); }, [loadStats, rev]);

  // Usernames first, the way the community pages show authors.
  const who = (id: string | null | undefined) => {
    if (!id) return 'Deleted user';
    const p = names[id];
    if (!p) return '...';
    return p.username ? '@' + p.username : p.full_name || 'No name';
  };
  const logWho = (id: string | null | undefined) => { const w = who(id); return w === '...' ? 'user ' + id : w; };

  async function threadStatus(t: ThreadRef, to: ThreadStatus, then: (row: Thread) => void) {
    const key = 'thread-' + t.id;
    const from = tStatus(t.status);
    if (from === to || held(key)) return;
    const name = short(t.title, 70);
    if (from === 'locked' && to === 'pinned' && !confirm(`"${name}" is locked. A thread is either pinned or locked, not both, so pinning it also unlocks it: people can reply and vote again.\n\nPin it?`)) return;
    if (from === 'pinned' && to === 'locked' && !confirm(`"${name}" is pinned. A thread is either pinned or locked, not both, so locking it also unpins it (it moves back down the list).\n\nLock it? New replies and votes stop.`)) return;
    await run(key, async () => {
      const { row, err } = await one<Thread>(sb.from('community_threads').update({ status: to }).eq('id', t.id).select(THREAD_COLS));
      if (!row) { toast('Could not save: ' + err, 'error'); return; }
      then(row);
      logAdminEvent('admin_thread_updated', `"${short(t.title, 80)}" (${t.id}) by ${logWho(t.user_id)}: ${from} to ${to}`);
      toast(to === 'pinned' ? 'Thread pinned' : to === 'locked' ? 'Thread locked' : from === 'pinned' ? 'Thread unpinned' : 'Thread unlocked');
      changed();
    });
  }

  async function deleteThread(t: ThreadRef, replies: number | null, then: () => void) {
    const key = 'thread-' + t.id;
    if (held(key)) return;
    const what = replies == null ? 'Its replies, votes and any reports on it'
      : replies === 0 ? 'Its votes and any reports on it' : `Its ${plural(replies, 'reply', 'replies')}, votes and any reports on it`;
    if (!confirm(`Delete the thread "${short(t.title, 70)}" for good?\n\n${what} are deleted too. This cannot be undone.`)) return;
    await run(key, async () => {
      const { row, err } = await one<{ id: string }>(sb.from('community_threads').delete().eq('id', t.id).select('id'));
      if (!row) { toast('Could not delete: ' + err, 'error'); return; }
      then();
      logAdminEvent('admin_thread_deleted', `"${short(t.title, 80)}" (${t.id}) by ${logWho(t.user_id)} deleted${replies == null ? '' : ` with ${plural(replies, 'reply', 'replies')}`}`);
      toast('Thread deleted');
      changed();
    });
  }

  async function replyStatus(r: Reply, to: 'approved' | 'rejected', then: (row: Reply) => void) {
    await run('reply-' + r.id, async () => {
      const { row, err } = await one<Reply>(sb.from('community_replies').update({ status: to }).eq('id', r.id).select(REPLY_COLS));
      if (!row) { toast('Could not save: ' + err, 'error'); return; }
      then(row);
      logAdminEvent('admin_reply_updated', `reply ${r.id} by ${logWho(r.user_id)} ${to === 'approved' ? 'shown' : 'hidden'}: "${short(r.body, 60)}"`);
      toast(to === 'approved' ? 'Reply is back on the site' : 'Reply hidden from the site');
      changed();
    });
  }

  async function deleteReply(r: Reply, then: () => void) {
    const key = 'reply-' + r.id;
    if (held(key)) return;
    if (!confirm(`Delete this reply by ${who(r.user_id)} for good?\n\n"${short(r.body, 120)}"\n\nIts votes and any reports on it are deleted too. This cannot be undone. To take it off the site but keep it, use Hide.`)) return;
    await run(key, async () => {
      const { row, err } = await one<{ id: string }>(sb.from('community_replies').delete().eq('id', r.id).select('id'));
      if (!row) { toast('Could not delete: ' + err, 'error'); return; }
      then();
      logAdminEvent('admin_reply_deleted', `reply ${r.id} by ${logWho(r.user_id)} deleted: "${short(r.body, 60)}"`);
      toast('Reply deleted');
      changed();
    });
  }

  const act: Act = { busy, who, want, openThread: setDrawer, changed, run, threadStatus, deleteThread, replyStatus, deleteReply };
  const threads = stats && stats.open != null && stats.pinned != null && stats.locked != null ? stats.open + stats.pinned + stats.locked : null;
  const count = (t: Tab) => (t === 'reports' ? stats?.reports : t === 'feedback' ? stats?.feedback : null);

  return (
    <div className="adm-stack">
      <div className="adm-stats" id="admComStats">
        <Stat label="Threads" value={!stats ? '...' : num(threads)}
          sub={stats && threads != null ? `${num(stats.open)} open, ${num(stats.pinned)} pinned, ${num(stats.locked)} locked` : undefined} />
        <Stat label="Open reports" value={!stats ? '...' : num(stats.reports)} sub={stats?.escalated ? `plus ${num(stats.escalated)} escalated` : undefined} />
        <Stat label="Replies, last 7 days" value={!stats ? '...' : num(stats.replies7)} />
        <Stat label="Feedback not read" value={!stats ? '...' : num(stats.feedback)} />
      </div>
      <div className="adm-seg adm-com-seg" role="tablist" aria-label="Community" id="admComTabs">
        {TABS.map((t) => {
          const n = count(t.key);
          return (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)} id={'admComTab-' + t.key}>
              {t.label}{n ? ` (${num(n)})` : ''}
            </button>
          );
        })}
      </div>
      {tab === 'threads' && <Threads act={act} rev={rev} />}
      {tab === 'reports' && <Reports act={act} rev={rev} />}
      {tab === 'replies' && <Replies act={act} rev={rev} />}
      {tab === 'feedback' && <FeedbackTab act={act} rev={rev} go={go} />}
      {tab === 'activity' && <Activity act={act} rev={rev} />}
      {drawer && <ThreadDrawer key={drawer} id={drawer} act={act} onClose={closeDrawer} />}
    </div>
  );
}

function ThreadPill({ status }: { status: string | null }) {
  const s = tStatus(status);
  return <span className={'adm-pill' + (s === 'pinned' ? ' accent' : s === 'locked' ? ' adm-com-warn' : '')}>{s}</span>;
}

function ReplyPill({ status }: { status: string | null }) {
  // Only approved replies are on the site (RLS).
  if (status === 'approved') return <span className="adm-pill">live</span>;
  if (status === 'rejected') return <span className="adm-pill danger">hidden</span>;
  return <span className="adm-pill adm-com-warn" title="Not shown on the site">pending</span>;
}

/** Pin / Lock / View on site / Delete, in the list and in the drawer (idp keeps ids unique). */
function ThreadButtons({ t, act, replies, idp, onRow, onGone }: {
  t: Thread; act: Act; replies: number | null; idp: string; onRow: (row: Thread) => void; onGone: () => void;
}) {
  const s = tStatus(t.status);
  const b = !!act.busy['thread-' + t.id];
  return (
    <div className="adm-com-actions">
      <button className="adm-btn" disabled={b} id={`${idp}Pin-${t.id}`} onClick={() => act.threadStatus(t, s === 'pinned' ? 'open' : 'pinned', onRow)}
        title={s === 'pinned' ? 'Back among the other threads' : 'Shown first on the community page'}>{s === 'pinned' ? 'Unpin' : 'Pin'}</button>
      <button className="adm-btn" disabled={b} id={`${idp}Lock-${t.id}`} onClick={() => act.threadStatus(t, s === 'locked' ? 'open' : 'locked', onRow)}
        title={s === 'locked' ? 'Replies and votes allowed again' : 'No new replies or votes'}>{s === 'locked' ? 'Unlock' : 'Lock'}</button>
      <a className="adm-btn ghost" href={'/community/' + encodeURIComponent(t.id)} target="_blank" rel="noopener noreferrer" id={`${idp}View-${t.id}`}>View on site</a>
      <button className="adm-btn danger" disabled={b} id={`${idp}Del-${t.id}`} onClick={() => act.deleteThread(t, replies, onGone)}>Delete</button>
    </div>
  );
}

function ReplyButtons({ r, act, idp, onRow, onGone }: { r: Reply; act: Act; idp: string; onRow: (row: Reply) => void; onGone: () => void }) {
  const b = !!act.busy['reply-' + r.id];
  const live = r.status === 'approved';
  return (
    <div className="adm-com-actions">
      <button className="adm-btn" disabled={b} id={`${idp}Hide-${r.id}`} onClick={() => act.replyStatus(r, live ? 'rejected' : 'approved', onRow)}>{live ? 'Hide' : 'Show'}</button>
      <button className="adm-btn danger" disabled={b} id={`${idp}Del-${r.id}`} onClick={() => act.deleteReply(r, onGone)}>Delete</button>
    </div>
  );
}

function Threads({ act, rev }: { act: Act; rev: number }) {
  const sb = adminSupabase()!;
  const { want } = act;
  const latest = useLatest();
  const [rows, setRows] = useState<Thread[] | null>(null);
  // undefined = counting, null = could not count
  const [replyCounts, setReplyCounts] = useState<Record<string, { all: number; hidden: number }> | null | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [cat, setCat] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { const t = setTimeout(() => { setQuery(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const load = useCallback(async () => {
    const fresh = latest();
    const from = (page - 1) * PER_PAGE;
    let r = sb.from('community_threads').select(THREAD_COLS, { count: 'exact' });
    const s = likeText(query);
    if (s) r = r.or(`title.ilike.%${s}%,body.ilike.%${s}%`);
    if (status !== 'all') r = r.eq('status', status);
    if (cat !== 'all') r = r.eq('category', cat);
    const { data, error, count } = await r.order('created_at', { ascending: false, nullsFirst: false }).range(from, from + PER_PAGE - 1);
    if (!fresh()) return;
    if (error) { setErr(error.message); setRows([]); setTotal(0); return; }
    const list = (data || []) as Thread[];
    const n = count || 0;
    if (!list.length && page > 1 && n > 0) { setPage(Math.ceil(n / PER_PAGE)); return; } // the page emptied (deletes)
    setErr('');
    setRows(list);
    setTotal(n);
    setReplyCounts(list.length ? undefined : {});
    want(list.map((t) => t.user_id));
    if (!list.length) return;
    // All replies of these threads, hidden ones too (the site counts approved only).
    // Read in pages: the API returns at most 1,000 rows per request, so one
    // request would undercount busy threads without any error.
    const ids = list.map((t) => t.id);
    const m: Record<string, { all: number; hidden: number }> = {};
    let off = 0;
    let end = Infinity;
    for (let round = 0; off < end; round++) {
      if (round >= COUNT_ROUNDS) { setReplyCounts(null); return; } // too many to count here: show '-' rather than a wrong number
      const rc = await sb.from('community_replies').select('thread_id, status', { count: 'exact' })
        .in('thread_id', ids).order('id', { ascending: true }).range(off, off + 999);
      if (!fresh()) return;
      if (rc.error) { setReplyCounts(null); return; }
      const got = (rc.data || []) as { thread_id: string; status: string | null }[];
      got.forEach((x) => {
        const c = m[x.thread_id] || (m[x.thread_id] = { all: 0, hidden: 0 });
        c.all++;
        if (x.status !== 'approved') c.hidden++;
      });
      if (!got.length) break;
      off += got.length;
      end = rc.count ?? off;
    }
    setReplyCounts(m);
  }, [sb, query, status, cat, page, want, latest]);
  useEffect(() => { load(); }, [load, rev]);

  const setRow = (row: Thread) => setRows((l) => (l || []).map((x) => (x.id === row.id ? { ...x, ...row } : x)));
  const dropRow = (id: string) => { setRows((l) => (l || []).filter((x) => x.id !== id)); setTotal((t) => Math.max(0, t - 1)); };
  const repliesOf = (id: string) => (replyCounts ? replyCounts[id]?.all || 0 : null);

  return (
    <Card title="Threads" actions={<>
      <input className="adm-input" placeholder="Search title or text" value={q} onChange={(e) => setQ(e.target.value)} id="admComThreadSearch" />
      <select className="adm-input adm-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status" id="admComThreadStatus">
        <option value="all">Any status</option><option value="open">Open</option><option value="pinned">Pinned</option><option value="locked">Locked</option>
      </select>
      <select className="adm-input adm-select" value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} aria-label="Category" id="admComThreadCat">
        <option value="all">All categories</option>
        {CATEGORIES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>
    </>}>
      <p className="adm-help">Click a thread for its text and every reply, hidden ones too. Pinned threads show first on the community page; locked threads take no new replies or votes.</p>
      {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load threads: {err}</Empty> : !rows.length ? <Empty>{query || status !== 'all' || cat !== 'all' ? 'No threads match.' : 'No threads yet.'}</Empty> : (
        <div className="adm-table-wrap">
          <table className="adm-table" id="admComThreads">
            <thead><tr><th>Thread</th><th>Author</th><th>Category</th><th>Replies</th><th>Votes</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((t) => {
                const c = replyCounts?.[t.id];
                return (
                  <tr key={t.id} id={'admComThreadRow-' + t.id} tabIndex={0} onClick={() => act.openThread(t.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) act.openThread(t.id); }}>
                    <td><span className="adm-strong adm-com-title" title={t.title}>{t.title}</span></td>
                    <td className="adm-nowrap">{act.who(t.user_id)}</td>
                    <td className="adm-nowrap">{catLabel(t.category)}</td>
                    <td className="adm-num">{replyCounts === undefined ? '...' : replyCounts === null ? '-' : num(c?.all || 0)}{c?.hidden ? <span className="adm-dim"> ({num(c.hidden)} hidden)</span> : null}</td>
                    <td className="adm-num">{num(t.votes || 0)}</td>
                    <td className="adm-dim adm-nowrap" title={dateTime(t.created_at)}>{timeAgo(t.created_at)}</td>
                    <td><ThreadPill status={t.status} /></td>
                    <td onClick={stop} onKeyDown={stop}>
                      <ThreadButtons t={t} act={act} replies={repliesOf(t.id)} idp="admCom" onRow={setRow} onGone={() => dropRow(t.id)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pages={Math.max(1, Math.ceil(total / PER_PAGE))} total={total} onPage={setPage} />
    </Card>
  );
}

function ThreadDrawer({ id, act, onClose }: { id: string; act: Act; onClose: () => void }) {
  const sb = adminSupabase()!;
  const { want } = act;
  const latest = useLatest();
  const [t, setT] = useState<FullThread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyTotal, setReplyTotal] = useState(0); // all replies of the thread; the list holds the first DRAWER_REPLIES
  const [replyErr, setReplyErr] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const fresh = latest();
    const [a, b] = await Promise.all([
      sb.from('community_threads').select(THREAD_COLS + ', body').eq('id', id).maybeSingle(),
      sb.from('community_replies').select(REPLY_COLS, { count: 'exact' }).eq('thread_id', id).order('created_at', { ascending: true }).limit(DRAWER_REPLIES),
    ]);
    if (!fresh()) return;
    if (a.error || !a.data) { setErr(a.error ? 'Could not load the thread: ' + a.error.message : 'This thread no longer exists.'); return; }
    const th = a.data as unknown as FullThread;
    const list = b.error ? [] : (b.data || []) as Reply[];
    setReplyErr(b.error ? b.error.message : '');
    setErr('');
    setT(th);
    setReplies(list);
    setReplyTotal(Math.max(b.count ?? 0, list.length));
    want([th.user_id, ...list.map((r) => r.user_id)]);
  }, [sb, id, want, latest]);
  useEffect(() => { load(); }, [load]);

  const hidden = replies.filter((r) => r.status !== 'approved').length;
  const cut = replyTotal > replies.length;
  const s = t ? tStatus(t.status) : 'open';
  return (
    <Drawer title={t ? t.title : 'Thread'} onClose={onClose}>
      {err ? <Empty>{err}</Empty> : !t ? <Empty>Loading...</Empty> : (
        <div className="adm-stack" id="admComDrawer">
          <div className="adm-com-meta">
            <ThreadPill status={t.status} />
            <span>by {act.who(t.user_id)}</span>
            <span>{catLabel(t.category)}</span>
            <span>{plural(t.votes || 0, 'vote', 'votes')}</span>
            <span title={dateTime(t.created_at)}>{timeAgo(t.created_at)}</span>
          </div>
          {s !== 'open' && <p className="adm-help">{s === 'pinned' ? 'Pinned: shown first on the community page.' : 'Locked: no new replies or votes. Existing replies stay visible.'}</p>}
          <div className="adm-msg-body adm-com-body" id="admComDrawerBody">{t.body}</div>
          <ThreadButtons t={t} act={act} replies={replyErr ? null : replyTotal} idp="admComDrawer"
            onRow={(row) => setT((x) => (x ? { ...x, ...row } : x))} onGone={onClose} />
          <section>
            <h4 className="adm-h4">Replies ({num(replyTotal)}{hidden ? `, ${num(hidden)} hidden${cut ? ' in the first ' + num(replies.length) : ''}` : ''})</h4>
            {cut && !replyErr && <p className="adm-help">Showing the oldest {num(replies.length)} replies. Use the Replies tab to search the rest.</p>}
            {replyErr ? <p className="adm-error">Could not load the replies: {replyErr}</p> : !replies.length ? <Empty>No replies yet.</Empty> : (
              <ul className="adm-list adm-com-list" id="admComDrawerReplies">
                {replies.map((r) => (
                  <li key={r.id} className="adm-list-col" id={'admComDrawerReply-' + r.id}>
                    <div className="adm-com-meta"><ReplyPill status={r.status} /><span className="adm-strong">{act.who(r.user_id)}</span><span title={dateTime(r.created_at)}>{timeAgo(r.created_at)}</span><span>{plural(r.votes || 0, 'vote', 'votes')}</span></div>
                    <div className="adm-com-text">{r.body}</div>
                    <ReplyButtons r={r} act={act} idp="admComDrawerReply"
                      onRow={(row) => setReplies((l) => l.map((x) => (x.id === row.id ? { ...x, ...row } : x)))}
                      onGone={() => { setReplies((l) => l.filter((x) => x.id !== r.id)); setReplyTotal((n) => Math.max(0, n - 1)); }} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}

function Reports({ act, rev }: { act: Act; rev: number }) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const { want } = act;
  const latest = useLatest();
  const [rows, setRows] = useState<Report[] | null>(null);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState<ReportStatus | 'all'>('open');
  const [kind, setKind] = useState<'all' | 'thread' | 'reply'>('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const fresh = latest();
    const from = (page - 1) * PER_PAGE;
    let r = sb.from('community_reports').select(REPORT_COLS, { count: 'exact' });
    if (status !== 'all') r = r.eq('status', status);
    if (kind === 'thread') r = r.not('thread_id', 'is', null);
    if (kind === 'reply') r = r.not('reply_id', 'is', null);
    const { data, error, count } = await r.order('created_at', { ascending: false, nullsFirst: false }).range(from, from + PER_PAGE - 1);
    if (!fresh()) return;
    if (error) { setErr(error.message); setRows([]); setTotal(0); return; }
    const list = (data || []) as unknown as Report[];
    const n = count || 0;
    if (!list.length && page > 1 && n > 0) { setPage(Math.ceil(n / PER_PAGE)); return; }
    setErr('');
    setRows(list);
    setTotal(n);
    want(list.flatMap((x) => [x.reporter_id, x.thread?.user_id, x.reply?.user_id]));
  }, [sb, status, kind, page, want, latest]);
  useEffect(() => { load(); }, [load, rev]);

  const targetText = (r: Report) => (r.thread ? `thread "${short(r.thread.title, 60)}"` : r.reply ? `reply "${short(r.reply.body, 60)}"` : 'deleted content');

  async function setReport(r: Report, to: ReportStatus) {
    const from = rStatus(r.status);
    await act.run('report-' + r.id, async () => {
      const { row, err: e } = await one<{ id: string; status: string | null }>(sb.from('community_reports').update({ status: to }).eq('id', r.id).select('id, status'));
      if (!row) { toast('Could not save: ' + e, 'error'); return; }
      setRows((l) => (l || []).map((x) => (x.id === r.id ? { ...x, status: row.status } : x)));
      logAdminEvent('admin_report_updated', `report ${r.id} on ${targetText(r)}: ${from} to ${to}`);
      toast(to === 'resolved' ? 'Report resolved' : to === 'dismissed' ? 'Report dismissed' : to === 'escalated' ? 'Report escalated' : 'Report reopened');
      act.changed();
    });
  }

  const threadOf = (r: Report) => r.thread?.id || r.reply?.thread_id || null;
  // Deleting content cascades: every report on that thread (and its replies) or reply goes with it.
  const dropThread = (tid: string) => setRows((l) => (l || []).filter((x) => x.thread_id !== tid && x.reply?.thread_id !== tid));
  const dropReply = (rid: string) => setRows((l) => (l || []).filter((x) => x.reply_id !== rid));
  const setReply = (row: Reply) => setRows((l) => (l || []).map((x) => (x.reply?.id === row.id ? { ...x, reply: { ...x.reply, ...row } } : x)));

  return (
    <Card title="Reports" actions={<>
      <select className="adm-input adm-select" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} aria-label="Status" id="admComReportStatus">
        <option value="open">Open</option><option value="escalated">Escalated</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option><option value="all">All</option>
      </select>
      <select className="adm-input adm-select" value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setPage(1); }} aria-label="Reported item" id="admComReportType">
        <option value="all">Threads and replies</option><option value="thread">Threads</option><option value="reply">Replies</option>
      </select>
    </>}>
      <p className="adm-help">
        Resolve: you dealt with it (hid or deleted the post). Dismiss: nothing wrong. Escalate: serious, keep it for a closer look.
        Deleting the post also removes its reports; the admin log keeps a note.
      </p>
      {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load reports: {err}</Empty> : !rows.length ? <Empty>{status === 'open' ? 'No open reports.' : 'No reports match.'}</Empty> : (
        <ul className="adm-list adm-com-list" id="admComReports">
          {rows.map((r) => {
            const st = rStatus(r.status);
            const b = !!act.busy['report-' + r.id];
            const tid = threadOf(r);
            const rp = r.reply;
            const th = r.thread;
            return (
              <li key={r.id} className="adm-list-col" id={'admComReport-' + r.id}>
                <div className="adm-com-meta">
                  <span className={'adm-pill' + (st === 'open' ? ' adm-com-warn' : st === 'escalated' ? ' danger' : st === 'resolved' ? ' accent' : '')}>{st}</span>
                  <span className="adm-pill">{r.thread_id ? 'thread' : 'reply'}</span>
                  <span>Reported by {act.who(r.reporter_id)}</span>
                  <span title={dateTime(r.created_at)}>{timeAgo(r.created_at)}</span>
                </div>
                <div className="adm-com-reason"><span className="adm-dim">Reason: </span>{r.reason || 'No reason given'}</div>
                <div className="adm-com-quote">
                  {th ? (
                    <><span className="adm-strong">{th.title}</span> <span className="adm-dim">by {act.who(th.user_id)}</span> <ThreadPill status={th.status} /></>
                  ) : rp ? (
                    <>
                      <div className="adm-com-text">{rp.body}</div>
                      <div className="adm-com-meta"><span>by {act.who(rp.user_id)}</span><ReplyPill status={rp.status} />{rp.thread && <span>in &quot;{short(rp.thread.title, 80)}&quot;</span>}</div>
                    </>
                  ) : <span className="adm-dim">The reported post is gone.</span>}
                </div>
                <div className="adm-com-actions">
                  {st !== 'resolved' && <button className="adm-btn primary" disabled={b} onClick={() => setReport(r, 'resolved')} id={'admComResolve-' + r.id}>Resolve</button>}
                  {st !== 'dismissed' && <button className="adm-btn" disabled={b} onClick={() => setReport(r, 'dismissed')} id={'admComDismiss-' + r.id}>Dismiss</button>}
                  {st === 'open' && <button className="adm-btn" disabled={b} onClick={() => setReport(r, 'escalated')} id={'admComEscalate-' + r.id}>Escalate</button>}
                  {(st === 'resolved' || st === 'dismissed') && <button className="adm-btn ghost" disabled={b} onClick={() => setReport(r, 'open')} id={'admComReopen-' + r.id}>Reopen</button>}
                  {tid && <button className="adm-btn ghost" onClick={() => act.openThread(tid)} id={'admComReportOpen-' + r.id}>Open thread</button>}
                  {rp && <button className="adm-btn" disabled={!!act.busy['reply-' + rp.id]} onClick={() => act.replyStatus(rp, rp.status === 'approved' ? 'rejected' : 'approved', setReply)} id={'admComReportHide-' + r.id}>{rp.status === 'approved' ? 'Hide reply' : 'Show reply'}</button>}
                  {th && <button className="adm-btn danger" disabled={!!act.busy['thread-' + th.id]} onClick={() => act.deleteThread(th, null, () => dropThread(th.id))} id={'admComReportDelete-' + r.id}>Delete thread</button>}
                  {!th && rp && <button className="adm-btn danger" disabled={!!act.busy['reply-' + rp.id]} onClick={() => act.deleteReply(rp, () => dropReply(rp.id))} id={'admComReportDelete-' + r.id}>Delete reply</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} pages={Math.max(1, Math.ceil(total / PER_PAGE))} total={total} onPage={setPage} />
    </Card>
  );
}

function Replies({ act, rev }: { act: Act; rev: number }) {
  const sb = adminSupabase()!;
  const { want } = act;
  const latest = useLatest();
  const [rows, setRows] = useState<ListReply[] | null>(null);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { const t = setTimeout(() => { setQuery(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const load = useCallback(async () => {
    const fresh = latest();
    const from = (page - 1) * PER_PAGE;
    let r = sb.from('community_replies').select(LIST_REPLY_COLS, { count: 'exact' });
    const s = likeText(query);
    if (s) r = r.ilike('body', `%${s}%`);
    if (status !== 'all') r = r.eq('status', status);
    const { data, error, count } = await r.order('created_at', { ascending: false, nullsFirst: false }).range(from, from + PER_PAGE - 1);
    if (!fresh()) return;
    if (error) { setErr(error.message); setRows([]); setTotal(0); return; }
    const list = (data || []) as unknown as ListReply[];
    const n = count || 0;
    if (!list.length && page > 1 && n > 0) { setPage(Math.ceil(n / PER_PAGE)); return; }
    setErr('');
    setRows(list);
    setTotal(n);
    want(list.map((x) => x.user_id));
  }, [sb, query, status, page, want, latest]);
  useEffect(() => { load(); }, [load, rev]);

  const setRow = (row: Reply) => setRows((l) => (l || []).map((x) => (x.id === row.id ? { ...x, ...row } : x)));
  const dropRow = (id: string) => { setRows((l) => (l || []).filter((x) => x.id !== id)); setTotal((t) => Math.max(0, t - 1)); };

  return (
    <Card title="Replies" actions={<>
      <input className="adm-input" placeholder="Search reply text" value={q} onChange={(e) => setQ(e.target.value)} id="admComReplySearch" />
      <select className="adm-input adm-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status" id="admComReplyStatus">
        <option value="all">Any status</option><option value="approved">Live</option><option value="rejected">Hidden</option><option value="pending">Pending</option>
      </select>
    </>}>
      <p className="adm-help" id="admComRepliesNote">
        Replies go live as soon as they are posted (no approval step, as per the current rule). Hide takes one off the site and keeps it here; Show puts it back.
      </p>
      {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load replies: {err}</Empty> : !rows.length ? <Empty>{query || status !== 'all' ? 'No replies match.' : 'No replies yet.'}</Empty> : (
        <ul className="adm-list adm-com-list" id="admComReplies">
          {rows.map((r) => (
            <li key={r.id} className="adm-list-col" id={'admComReply-' + r.id}>
              <div className="adm-com-meta">
                <ReplyPill status={r.status} />
                <span className="adm-strong">{act.who(r.user_id)}</span>
                <span title={dateTime(r.created_at)}>{timeAgo(r.created_at)}</span>
                {r.thread
                  ? <span>in <button className="adm-link" onClick={() => act.openThread(r.thread_id)} id={'admComReplyThread-' + r.id}>{short(r.thread.title, 80)}</button></span>
                  : <span>in a deleted thread</span>}
              </div>
              <div className="adm-com-text">{r.body}</div>
              <ReplyButtons r={r} act={act} idp="admComReply" onRow={setRow} onGone={() => dropRow(r.id)} />
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pages={Math.max(1, Math.ceil(total / PER_PAGE))} total={total} onPage={setPage} />
    </Card>
  );
}

function FeedbackTab({ act, rev, go }: { act: Act; rev: number; go: (id: string) => void }) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const { want } = act;
  const latest = useLatest();
  const [rows, setRows] = useState<Feedback[] | null>(null);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const fresh = latest();
    const from = (page - 1) * PER_PAGE;
    let r = sb.from('admin_feedback').select(FEEDBACK_COLS, { count: 'exact' });
    if (type !== 'all') r = r.eq('type', type);
    if (status !== 'all') r = r.eq('status', status);
    const { data, error, count } = await r.order('created_at', { ascending: false }).range(from, from + PER_PAGE - 1);
    if (!fresh()) return;
    if (error) { setErr(error.message); setRows([]); setTotal(0); return; }
    const list = (data || []) as Feedback[];
    const n = count || 0;
    if (!list.length && page > 1 && n > 0) { setPage(Math.ceil(n / PER_PAGE)); return; }
    setErr('');
    setRows(list);
    setTotal(n);
    want(list.map((x) => x.user_id));
  }, [sb, type, status, page, want, latest]);
  useEffect(() => { load(); }, [load, rev]);

  async function mark(f: Feedback, to: 'read' | 'unread') {
    await act.run('fb-' + f.id, async () => {
      const { row, err: e } = await one<{ id: string; status: string }>(sb.from('admin_feedback').update({ status: to }).eq('id', f.id).select('id, status'));
      if (!row) { toast('Could not save: ' + e, 'error'); return; }
      setRows((l) => (l || []).map((x) => (x.id === f.id ? { ...x, status: row.status } : x)));
      logAdminEvent('admin_feedback_updated', `feedback ${f.id} (${f.type}) from ${act.who(f.user_id) === '...' ? 'user ' + f.user_id : act.who(f.user_id)}: marked ${to}`);
      toast(to === 'read' ? 'Marked as read' : 'Marked as unread');
      act.changed();
    });
  }

  const typeLabel = (t: string) => FEEDBACK_TYPES.find(([k]) => k === t)?.[1] || t;
  return (
    <Card title="Feedback" actions={<>
      <select className="adm-input adm-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} aria-label="Type" id="admComFbType">
        <option value="all">All types</option>
        {FEEDBACK_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <select className="adm-input adm-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status" id="admComFbStatus">
        <option value="all">Read and unread</option><option value="unread">Unread</option><option value="read">Read</option>
      </select>
    </>}>
      <p className="adm-help" id="admComFbNote">
        No form on the site sends feedback yet, so this list stays empty until one is added. Contact form messages are under{' '}
        <button className="adm-link" onClick={() => go('messages')} id="admComFbMessages">Messages</button>.
      </p>
      {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load feedback: {err}</Empty> : !rows.length ? <Empty>{type !== 'all' || status !== 'all' ? 'No feedback matches.' : 'No feedback yet.'}</Empty> : (
        <ul className="adm-list adm-com-list" id="admComFeedback">
          {rows.map((f) => {
            const unread = f.status === 'unread';
            return (
              <li key={f.id} className="adm-list-col" id={'admComFb-' + f.id}>
                <div className="adm-com-meta">
                  {unread ? <span className="adm-pill accent">unread</span> : <span className="adm-pill">read</span>}
                  <span className={'adm-pill' + (f.type === 'bug' || f.type === 'complaint' ? ' adm-com-warn' : '')}>{typeLabel(f.type)}</span>
                  <span className="adm-strong">{act.who(f.user_id)}</span>
                  <span title={dateTime(f.created_at)}>{timeAgo(f.created_at)}</span>
                </div>
                <div className="adm-com-text">{f.message}</div>
                <div className="adm-com-actions">
                  <button className="adm-btn" disabled={!!act.busy['fb-' + f.id]} onClick={() => mark(f, unread ? 'read' : 'unread')} id={'admComFbRead-' + f.id}>{unread ? 'Mark read' : 'Mark unread'}</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} pages={Math.max(1, Math.ceil(total / PER_PAGE))} total={total} onPage={setPage} />
    </Card>
  );
}

function Activity({ act, rev }: { act: Act; rev: number }) {
  const sb = adminSupabase()!;
  const { want } = act;
  const latest = useLatest();
  const [rows, setRows] = useState<Log[] | null>(null);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [noActor, setNoActor] = useState(false); // security_logs.actor_id comes with the Community migration
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('all');
  const [page, setPage] = useState(1);
  const [audit, setAudit] = useState<{ rows: Audit[]; total: number; err: string } | null>(null);

  useEffect(() => { const t = setTimeout(() => { setQuery(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const load = useCallback(async () => {
    const fresh = latest();
    const from = (page - 1) * LOG_PAGE;
    let r = sb.from('security_logs').select(noActor ? LOG_COLS : LOG_COLS + ', actor_id', { count: 'exact' }).like('event_type', 'admin_%');
    const types = AREAS[area]?.types;
    if (types) r = r.in('event_type', types);
    const s = likeText(query);
    if (s) r = r.or(`details.ilike.%${s}%,event_type.ilike.%${s}%`);
    const { data, error, count } = await r.order('created_at', { ascending: false }).range(from, from + LOG_PAGE - 1);
    if (!fresh()) return;
    // 42703 = no such column: the migration is not in yet, read without it.
    if (error && !noActor && (error.code === '42703' || /actor_id/.test(error.message))) { setNoActor(true); return; }
    if (error) { setErr(error.message); setRows([]); setTotal(0); return; }
    const list = (data || []) as unknown as Log[];
    const n = count || 0;
    if (!list.length && page > 1 && n > 0) { setPage(Math.ceil(n / LOG_PAGE)); return; }
    setErr('');
    setRows(list);
    setTotal(n);
    want(list.map((x) => x.actor_id));
  }, [sb, noActor, area, query, page, want, latest]);
  useEffect(() => { load(); }, [load, rev]);

  // admin_audit_log: an older table nothing writes to now; listed only if it has rows.
  useEffect(() => {
    let live = true;
    sb.from('admin_audit_log').select('id, actor_id, action, target, created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(0, LOG_PAGE - 1)
      .then(({ data, error, count }) => {
        if (!live) return;
        const list = (data || []) as Audit[];
        setAudit({ rows: error ? [] : list, total: error ? 0 : count || 0, err: error ? error.message : '' });
        if (!error) want(list.map((x) => x.actor_id));
      });
    return () => { live = false; };
  }, [sb, want]);

  const actor = (l: Log) => {
    if (l.actor_id) return act.who(l.actor_id);
    if (!EMAIL_FIRST_EVENTS.includes(l.event_type)) return null;
    const m = EMAIL_FIRST.exec(l.details || '');
    return m ? m[1] : null;
  };
  const label = (t: string) => t.replace(/^admin_/, '').replace(/_/g, ' ');

  return (
    <>
      <Card title="Admin activity" actions={<>
        <input className="adm-input" placeholder="Search details or event" value={q} onChange={(e) => setQ(e.target.value)} id="admComActSearch" />
        <select className="adm-input adm-select" value={area} onChange={(e) => { setArea(e.target.value); setPage(1); }} aria-label="Area" id="admComActArea">
          {Object.entries(AREAS).map(([k, a]) => <option key={k} value={k}>{a.label}</option>)}
        </select>
      </>}>
        <p className="adm-help">
          Admin actions logged by this panel and the admin server, newest first (the admin entries of the security log). IP blocks and the full log with IPs are under Security.
          {noActor ? ' The log does not record which admin acted yet (the Community database update adds it); sign-ins and invites name the email in the details.' : ' Entries from before the Community database update do not say who acted, except sign-ins and invites, which name the email.'}
        </p>
        {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load the activity log: {err}</Empty> : !rows.length ? <Empty>{query || area !== 'all' ? 'No entries match.' : 'No admin activity yet.'}</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admComActivity">
              <thead><tr><th>Time</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {rows.map((l) => {
                  const w = actor(l);
                  return (
                    <tr key={l.id} className="static">
                      <td className="adm-dim adm-nowrap" title={dateTime(l.created_at)}>{timeAgo(l.created_at)}</td>
                      <td className="adm-nowrap">{w || <span className="adm-dim">Not recorded</span>}</td>
                      <td><span className={'adm-pill' + (COMMUNITY_EVENTS.includes(l.event_type) ? ' accent' : '')} title={l.event_type}>{label(l.event_type)}</span></td>
                      <td className="adm-wrap">{l.details || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={Math.max(1, Math.ceil(total / LOG_PAGE))} total={total} onPage={setPage} />
      </Card>
      {audit && (audit.err || audit.total > 0) && (
        <Card title="Older audit log">
          <p className="adm-help">The separate admin_audit_log table, shown as its own list (nothing writes to it now). Latest {num(Math.min(audit.total, LOG_PAGE))} of {num(audit.total)}.</p>
          {audit.err ? <p className="adm-error">Could not load it: {audit.err}</p> : (
            <ul className="adm-list" id="admComAudit">
              {audit.rows.map((a) => (
                <li key={a.id}>
                  <span className="adm-list-main"><span className="adm-strong">{act.who(a.actor_id)}</span> {a.action} <span className="adm-dim">{a.target}</span></span>
                  <span className="adm-dim adm-nowrap" title={dateTime(a.created_at)}>{timeAgo(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}
