'use client';

// Users (old "Users" + "Public Profiles"): searchable, paged list from the DB;
// a click opens the person's details (stats, activity, CTF history, course
// progress) with the admin actions: edit, ban, award XP, delete. "Invite user"
// sends a sign-up invite by email (server route, service role).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, adminToken, logAdminEvent } from '../sb';
import { Card, Drawer, Empty, Modal, Pager, Stat, adminApi, dateTime, downloadCsv, likeText, num, timeAgo, useToast } from '../ui';

type Row = {
  id: string; full_name: string | null; username: string | null; role: string | null; is_banned: boolean | null;
  xp: number | null; level: number | null; ctf_solves: number | null; last_seen: string | null; created_at: string | null;
};
const COLS = 'id, full_name, username, role, is_banned, xp, level, ctf_solves, last_seen, created_at';
const PER_PAGE = 25;
type Sort = 'created_at' | 'last_seen' | 'xp';

const display = (u: Row) => u.full_name || u.username || 'No name';
const levelFor = (xp: number) => Math.floor(Math.max(0, xp) / 500) + 1; // same rule as the DB

export default function Users(_: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | 'user' | 'admin'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'banned'>('all');
  const [sort, setSort] = useState<Sort>('created_at');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  // Search waits until typing stops.
  useEffect(() => { const t = setTimeout(() => { setQuery(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const build = useCallback(() => {
    let r = sb.from('profiles').select(COLS, { count: 'exact' });
    const s = likeText(query);
    if (s) r = r.or(`full_name.ilike.%${s}%,username.ilike.%${s}%`);
    if (role !== 'all') r = r.eq('role', role);
    if (status === 'banned') r = r.eq('is_banned', true);
    if (status === 'active') r = r.or('is_banned.is.null,is_banned.eq.false');
    return r.order(sort, { ascending: false, nullsFirst: false });
  }, [sb, query, role, status, sort]);

  const load = useCallback(async () => {
    const from = (page - 1) * PER_PAGE;
    const { data, error, count } = await build().range(from, from + PER_PAGE - 1);
    if (error) { setErr(error.message); setRows([]); return; }
    setErr('');
    setRows(data as Row[]);
    setTotal(count || 0);
  }, [build, page]);
  useEffect(() => { load(); }, [load]);

  async function exportCsv() {
    const { data, error } = await build().range(0, 4999);
    if (error) return toast('Export failed: ' + error.message, 'error');
    const list = (data || []) as Row[];
    downloadCsv(`alexcyberx-users-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Name', 'Username', 'Role', 'Status', 'XP', 'Level', 'CTF solves', 'Joined', 'Last active'],
      ...list.map((u) => [u.full_name, u.username, u.role || 'user', u.is_banned ? 'banned' : 'active', u.xp || 0, u.level || 1, u.ctf_solves || 0, u.created_at, u.last_seen]),
    ]);
    toast(`Exported ${list.length} users`);
  }

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const updateRow = useCallback((id: string, patch: Partial<Row> | null) => {
    setRows((l) => (l || []).flatMap((r) => (r.id !== id ? [r] : patch ? [{ ...r, ...patch }] : [])));
    if (!patch) setTotal((t) => Math.max(0, t - 1));
  }, []);

  return (
    <>
      <Card title="Users" actions={<>
        <input className="adm-input" placeholder="Search name or username" value={q} onChange={(e) => setQ(e.target.value)} id="admUserSearch" />
        <select className="adm-input adm-select" value={role} onChange={(e) => { setRole(e.target.value as typeof role); setPage(1); }} aria-label="Role" id="admUserRole">
          <option value="all">All roles</option><option value="user">Users</option><option value="admin">Admins</option>
        </select>
        <select className="adm-input adm-select" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} aria-label="Status" id="admUserStatus">
          <option value="all">Any status</option><option value="active">Active</option><option value="banned">Banned</option>
        </select>
        <select className="adm-input adm-select" value={sort} onChange={(e) => { setSort(e.target.value as Sort); setPage(1); }} aria-label="Sort">
          <option value="created_at">Newest first</option><option value="last_seen">Recently active</option><option value="xp">Most XP</option>
        </select>
        <button className="adm-btn" onClick={exportCsv}>Export CSV</button>
        <button className="adm-btn primary" onClick={() => setInviting(true)} id="admInviteBtn">Invite user</button>
      </>}>
        {rows == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load users: {err}</Empty> : !rows.length ? <Empty>No users match.</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admUsers">
              <thead><tr><th>User</th><th>Role</th><th>XP</th><th>Solves</th><th>Joined</th><th>Last active</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} onClick={() => setOpenId(u.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(u.id); }}>
                    <td><div className="adm-user-cell"><span className="adm-avatar" aria-hidden="true">{display(u).charAt(0).toUpperCase()}</span><span><span className="adm-strong">{display(u)}</span>{u.username && <span className="adm-dim"> @{u.username}</span>}</span></div></td>
                    <td>{u.role === 'admin' ? <span className="adm-pill accent">admin</span> : <span className="adm-dim">user</span>}</td>
                    <td className="adm-num">{num(u.xp || 0)} <span className="adm-dim">L{u.level || 1}</span></td>
                    <td className="adm-num">{num(u.ctf_solves || 0)}</td>
                    <td className="adm-dim adm-nowrap">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '-'}</td>
                    <td className="adm-dim adm-nowrap">{u.last_seen ? timeAgo(u.last_seen) : 'Never'}</td>
                    <td>{u.is_banned ? <span className="adm-pill danger">banned</span> : <span className="adm-pill">active</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={pages} total={total} onPage={setPage} />
      </Card>
      {openId && <UserDetail id={openId} onClose={() => setOpenId(null)} onChange={updateRow} />}
      {inviting && <InviteModal onClose={() => setInviting(false)} onSent={() => { setInviting(false); toast('Invite sent'); }} />}
    </>
  );
}

function InviteModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    const token = await adminToken();
    const r = token ? await adminApi('/invite', token, { email, name }) : { ok: false, error: 'Please sign in again.' };
    setBusy(false);
    if (!r.ok) return setErr(r.error || 'Could not send the invite.');
    logAdminEvent('admin_user_invited', `invited ${email.trim().toLowerCase()}`);
    onSent();
  }
  return (
    <Modal title="Invite user" onClose={onClose}>
      <form onSubmit={send} className="adm-form">
        <p className="adm-help">They get an email with a link. The link signs them in and asks them to pick a password.</p>
        <label className="adm-field"><span>Email</span><input type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} autoFocus id="admInviteEmail" /></label>
        <label className="adm-field"><span>Name (optional)</span><input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} id="admInviteName" /></label>
        {err && <p className="adm-error" id="admInviteErr">{err}</p>}
        <div className="adm-actions"><button className="adm-btn primary" disabled={busy} id="admInviteSend">{busy ? 'Sending...' : 'Send invite'}</button><button type="button" className="adm-btn ghost" onClick={onClose}>Cancel</button></div>
      </form>
    </Modal>
  );
}

type Solve = { solved_at: string; points_earned: number | null; ctf_challenges: { title: string | null; category: string | null } | null };
type Progress = { course: string; chapter_slug: string; viewed_at: string | null };
type Detail = {
  u: Row; ip: string | null; solves: Solve[]; progress: Progress[];
  courses: { key: string; title: string; done: number; total: number }[];
};

function UserDetail({ id, onClose, onChange }: { id: string; onClose: () => void; onChange: (id: string, patch: Partial<Row> | null) => void }) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState<'view' | 'edit' | 'xp'>('view');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, ips, s, cp, ch, cs] = await Promise.all([
      sb.from('profiles').select(COLS).eq('id', id).maybeSingle(),
      sb.rpc('admin_get_last_ips'),
      sb.from('ctf_solves').select('solved_at, points_earned, ctf_challenges(title, category)').eq('user_id', id).eq('correct', true).order('solved_at', { ascending: false }).limit(50),
      sb.from('chapter_progress').select('course, chapter_slug, viewed_at').eq('user_id', id).limit(2000),
      sb.from('content_chapters').select('course, slug').eq('enabled', true),
      sb.from('courses').select('course_key, title').order('display_order'),
    ]);
    if (p.error || !p.data) { setErr(p.error?.message || 'User not found.'); return; }
    const progress = (cp.data || []) as Progress[];
    const seen = new Set(progress.map((x) => x.course + '/' + x.chapter_slug));
    const chapters = (ch.data || []) as { course: string; slug: string }[];
    const courses = ((cs.data || []) as { course_key: string; title: string }[]).map((c) => {
      const list = chapters.filter((x) => x.course === c.course_key);
      return { key: c.course_key, title: c.title, total: list.length, done: list.filter((x) => seen.has(c.course_key + '/' + x.slug)).length };
    }).filter((c) => c.total > 0);
    const ip = ((ips.data || []) as { id: string; last_login_ip: string | null }[]).find((x) => x.id === id)?.last_login_ip || null;
    setD({ u: p.data as Row, ip, solves: (s.data || []) as unknown as Solve[], progress, courses });
  }, [sb, id]);
  useEffect(() => { load(); }, [load]);

  async function patch(values: Partial<Row>, what: string) {
    if (!d) return false;
    setBusy(true);
    const { error } = await sb.from('profiles').update(values).eq('id', id);
    setBusy(false);
    if (error) { toast('Could not save: ' + error.message, 'error'); return false; }
    setD({ ...d, u: { ...d.u, ...values } });
    onChange(id, values);
    logAdminEvent('admin_user_updated', `${display(d.u)} (${id}): ${what}`);
    return true;
  }

  async function toggleBan() {
    if (!d) return;
    const ban = !d.u.is_banned;
    if (ban && !confirm(`Ban ${display(d.u)}? They are signed out and cannot post, solve or use the tools.`)) return;
    if (await patch({ is_banned: ban }, ban ? 'banned' : 'unbanned')) toast(ban ? 'User banned' : 'User unbanned');
  }

  async function remove() {
    if (!d) return;
    const name = display(d.u);
    const typed = prompt(`Delete ${name} for good? Their solves, progress, posts and notifications are deleted too.\n\nType DELETE to confirm.`);
    if (typed !== 'DELETE') return;
    setBusy(true);
    const token = await adminToken();
    const r = token ? await adminApi(`/users/${id}/delete`, token) : { ok: false, error: 'Please sign in again.' };
    setBusy(false);
    if (!r.ok) return toast(r.error || 'Could not delete.', 'error');
    toast('Account deleted');
    onChange(id, null);
    onClose();
  }

  const u = d?.u;
  return (
    <Drawer title={u ? display(u) : 'User'} onClose={onClose}>
      {err ? <Empty>{err}</Empty> : !d || !u ? <Empty>Loading...</Empty> : (
        <div className="adm-stack" id="admUserDetail">
          <div className="adm-profile-head">
            <span className="adm-avatar big" aria-hidden="true">{display(u).charAt(0).toUpperCase()}</span>
            <div>
              <div className="adm-strong">{display(u)}</div>
              <div className="adm-dim">{u.username ? '@' + u.username : 'no username'}{' | '}{u.role === 'admin' ? 'admin' : 'user'}{u.is_banned ? ' | banned' : ''}</div>
              <div className="adm-dim">Joined {dateTime(u.created_at)} | Last active {u.last_seen ? timeAgo(u.last_seen) : 'never'}</div>
              <div className="adm-dim">Last IP {d.ip || 'not recorded'}</div>
            </div>
          </div>
          <div className="adm-stats small">
            <Stat label="XP" value={num(u.xp || 0)} />
            <Stat label="Level" value={num(u.level || 1)} />
            <Stat label="CTF solves" value={num(u.ctf_solves || 0)} />
            <Stat label="Chapters read" value={num(d.progress.length)} />
          </div>
          {mode === 'edit' ? <EditForm u={u} busy={busy} onCancel={() => setMode('view')} onSave={async (v) => { if (await patch(v, `edited (name/role)`)) { toast('Saved'); setMode('view'); } }} />
            : mode === 'xp' ? <XpForm u={u} busy={busy} onCancel={() => setMode('view')} onSave={async (delta, reason) => {
              const xp = Math.max(0, (u.xp || 0) + delta);
              if (await patch({ xp, level: levelFor(xp) }, `XP ${delta > 0 ? '+' : ''}${delta} (${reason || 'no reason'}), now ${xp}`)) { toast(`XP is now ${xp}`); setMode('view'); }
            }} />
              : (
                <div className="adm-actions">
                  <button className="adm-btn" onClick={() => setMode('edit')} id="admUserEdit">Edit</button>
                  <button className="adm-btn" onClick={() => setMode('xp')} id="admUserXp">Award XP</button>
                  <button className={'adm-btn' + (u.is_banned ? '' : ' danger')} onClick={toggleBan} disabled={busy} id="admUserBan">{u.is_banned ? 'Unban' : 'Ban'}</button>
                  <a className="adm-btn ghost" href={'/u/' + encodeURIComponent(u.id)} target="_blank" rel="noopener noreferrer">Public profile</a>
                  {u.role !== 'admin' && <button className="adm-btn danger" onClick={remove} disabled={busy} id="admUserDelete">Delete account</button>}
                </div>
              )}
          <section>
            <h4 className="adm-h4">Activity, last 12 weeks</h4>
            <Heatmap dates={[...d.progress.map((x) => x.viewed_at), ...d.solves.map((x) => x.solved_at)]} />
          </section>
          <section>
            <h4 className="adm-h4">Course progress</h4>
            {!d.courses.length ? <Empty>No courses.</Empty> : d.courses.map((c) => (
              <div key={c.key} className="adm-progress">
                <div className="adm-progress-top"><span>{c.title}</span><span className="adm-dim">{c.done} / {c.total}</span></div>
                <div className="adm-bar"><span style={{ width: `${Math.round((c.done / c.total) * 100)}%` }} /></div>
              </div>
            ))}
          </section>
          <section>
            <h4 className="adm-h4">CTF solves</h4>
            {!d.solves.length ? <Empty>No solves yet.</Empty> : (
              <ul className="adm-list" id="admUserSolves">
                {d.solves.map((s, i) => (
                  <li key={i}>
                    <span className="adm-list-main">{s.ctf_challenges?.title || 'Removed challenge'} <span className="adm-dim">{s.ctf_challenges?.category || ''}</span></span>
                    <span className="adm-dim">+{num(s.points_earned || 0)}</span>
                    <span className="adm-dim adm-nowrap">{timeAgo(s.solved_at)}</span>
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

function EditForm({ u, busy, onSave, onCancel }: { u: Row; busy: boolean; onSave: (v: Partial<Row>) => void; onCancel: () => void }) {
  const [name, setName] = useState(u.full_name || '');
  const [role, setRole] = useState(u.role === 'admin' ? 'admin' : 'user');
  return (
    <form className="adm-form adm-inline-form" onSubmit={(e) => {
      e.preventDefault();
      if (role !== (u.role || 'user') && !confirm(role === 'admin' ? `Make ${name || 'this user'} an ADMIN? Admins can change everything on the site.` : 'Remove the admin role?')) return;
      onSave({ full_name: name.trim().slice(0, 60) || null, role });
    }}>
      <label className="adm-field"><span>Full name</span><input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} id="admEditName" /></label>
      <label className="adm-field"><span>Role</span>
        <select value={role} onChange={(e) => setRole(e.target.value)} id="admEditRole"><option value="user">User</option><option value="admin">Admin</option></select>
      </label>
      <div className="adm-actions"><button className="adm-btn primary" disabled={busy} id="admEditSave">Save</button><button type="button" className="adm-btn ghost" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function XpForm({ u, busy, onSave, onCancel }: { u: Row; busy: boolean; onSave: (delta: number, reason: string) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState('50');
  const [reason, setReason] = useState('');
  const n = Math.trunc(Number(amount));
  const ok = Number.isFinite(n) && n !== 0 && Math.abs(n) <= 100000;
  return (
    <form className="adm-form adm-inline-form" onSubmit={(e) => { e.preventDefault(); if (ok) onSave(n, reason.trim().slice(0, 120)); }}>
      <p className="adm-help">Now {num(u.xp || 0)} XP. Use a minus number to take XP away. The level follows (every 500 XP).</p>
      <label className="adm-field"><span>XP to add</span><input type="number" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} id="admXpAmount" /></label>
      <label className="adm-field"><span>Reason (kept in the admin log)</span><input maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} id="admXpReason" /></label>
      <div className="adm-actions"><button className="adm-btn primary" disabled={busy || !ok} id="admXpSave">Apply</button><button type="button" className="adm-btn ghost" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 12 weeks x 7 days (local dates), darker = more activity (chapters opened + flags solved). */
function Heatmap({ dates }: { dates: (string | null)[] }) {
  const cells = useMemo(() => {
    const counts = new Map<string, number>();
    dates.forEach((d) => { if (d) { const k = dayKey(new Date(d)); counts.set(k, (counts.get(k) || 0) + 1); } });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - 7 * 11 - start.getDay()); // Sunday, 12 columns
    const out: { k: string; n: number }[] = [];
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const k = dayKey(d);
      out.push({ k, n: counts.get(k) || 0 });
    }
    return out;
  }, [dates]);
  const max = Math.max(1, ...cells.map((c) => c.n));
  return (
    <div className="adm-heat" role="img" aria-label="Activity heatmap">
      {cells.map((c) => <span key={c.k} title={`${c.k}: ${c.n}`} style={{ opacity: c.n ? 0.25 + 0.75 * (c.n / max) : 1 }} className={c.n ? 'on' : ''} />)}
    </div>
  );
}
