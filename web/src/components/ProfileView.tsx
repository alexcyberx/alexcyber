'use client';

// /profile: same layout as #profilePage in index.html (Notifications +
// Settings tabs). Logic from js/profile.js and saveProfile() in js/auth.js.

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { browserSupabase } from '@/lib/supabase';

type Notif = { id: string; title: string; body: string | null; type: string; read: boolean; created_at: string };

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function nameError(v: string): string | null {
  const s = v.trim();
  if (!s) return 'Name cannot be empty.';
  if (s.length < 2) return 'Name must be at least 2 characters.';
  if (s.length > 60) return 'Name must be 60 characters or less.';
  if (/<[^>]*>/.test(s) || /[<>"'&;]/.test(s)) return 'Name contains invalid characters.';
  return null;
}

function usernameError(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional
  if (s.length < 3) return 'Username must be at least 3 characters.';
  if (s.length > 30) return 'Username cannot exceed 30 characters.';
  if (!/^[a-zA-Z0-9_.-]+$/.test(s)) return 'Username can only contain letters, numbers, _ . -';
  if (/^[._-]/.test(s)) return 'Username cannot start with . _ -';
  if (/[._-]{2,}/.test(s)) return 'Username cannot have consecutive special characters.';
  return null;
}

function passwordError(pw: string, pw2: string): string | null {
  if (!pw) return null;
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (pw.length > 72) return 'Password cannot exceed 72 characters.';
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain at least one letter.';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.';
  if (pw !== pw2) return 'Passwords do not match.';
  return null;
}

const FieldErr = ({ text }: { text: string | null }) =>
  text ? <div className="pf-field-error" style={{ color: '#e06060', fontSize: 12, marginTop: 4 }}>{text}</div> : null;

export default function ProfileView() {
  const { user, ready, openAuth, logout, refreshUser } = useAuth();
  const [tab, setTab] = useState<'notifications' | 'settings'>('notifications');
  const [notifs, setNotifs] = useState<Notif[] | null>(null);
  const [notifErr, setNotifErr] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', username: '', bio: '', pw: '', pw2: '' });
  const [loaded, setLoaded] = useState({ name: '', username: '', bio: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Logged out: open the login modal and come back here after it.
  useEffect(() => { if (ready && !user) openAuth('login', '/profile'); }, [ready, user, openAuth]);

  const loadNotifs = useCallback(async () => {
    const sb = browserSupabase();
    if (!sb || !user) return;
    const { data, error } = await sb.rpc('get_notifications', { p_user_id: user.id, p_limit: 30 });
    if (error) { setNotifErr(true); return; }
    setNotifErr(false);
    setNotifs((data as Notif[]) || []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadNotifs();
    const sb = browserSupabase()!;
    sb.from('profiles').select('full_name, username, bio').eq('id', user.id).maybeSingle().then(({ data }) => {
      const v = { name: data?.full_name || user.name, username: data?.username || '', bio: data?.bio || '' };
      setLoaded(v);
      setForm((f) => ({ ...f, ...v, email: user.email }));
    });
  }, [user, loadNotifs]);

  async function markAllRead() {
    const sb = browserSupabase();
    if (!sb || !user) return;
    await sb.rpc('mark_notifications_read', { p_user_id: user.id }).then(() => {}, () => {});
    loadNotifs();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const name = form.name.trim(), uname = form.username.trim(), bio = form.bio.trim();
    const err = nameError(name) || usernameError(uname)
      || (bio.length > 200 ? 'Bio cannot exceed 200 characters.' : /<[^>]*>/.test(bio) ? 'Bio cannot contain HTML.' : null)
      || passwordError(form.pw, form.pw2);
    if (err) return setMsg({ ok: false, text: err });
    const sb = browserSupabase();
    if (!sb || !user) return setMsg({ ok: false, text: 'Service not configured.' });
    setSaving(true);
    try {
      // Usernames must be unique (case-insensitive). The DB doesn't enforce it yet.
      if (uname && uname.toLowerCase() !== loaded.username.toLowerCase()) {
        const { data: taken } = await sb.from('profiles').select('id').ilike('username', uname.replace(/[%_\\]/g, '\\$&')).neq('id', user.id).limit(1);
        if (taken && taken.length) return setMsg({ ok: false, text: 'This username is already taken.' });
      }
      const updates: { data: Record<string, string>; password?: string } = { data: { full_name: name, username: uname, bio } };
      if (form.pw) updates.password = form.pw;
      const { error } = await sb.auth.updateUser(updates);
      if (error) {
        const text = /reauthentication|recent/i.test(error.message) ? 'For a password change, please sign in again first.'
          : /different|same/i.test(error.message) ? 'New password must be different from the old one.'
          : 'Could not save changes. Please try again.';
        return setMsg({ ok: false, text });
      }
      const { error: upErr } = await sb.from('profiles').update({ full_name: name, username: uname, bio }).eq('id', user.id);
      if (upErr) {
        return setMsg({ ok: false, text: upErr.code === '23505' ? 'This username is already taken.' : 'Profile saved partially. Some changes may not persist.' });
      }
      setLoaded({ name, username: uname, bio });
      setForm((f) => ({ ...f, pw: '', pw2: '' }));
      setMsg({ ok: true, text: 'Changes saved!' });
      refreshUser();
    } finally {
      setSaving(false);
    }
  }

  const unread = (notifs || []).some((n) => !n.read);
  const initial = (loaded.name || user?.name || 'A')[0]?.toUpperCase();
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div id="profilePage" className="page active">
      <div className="pf-shell" style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px', paddingTop: 'calc(var(--nav-h) + 16px)' }}>
        <div className="pf-banner">
          <div className="pf-banner-glow"></div>
          <a className="pf-back-btn" href="/" style={{ textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back
          </a>
          <div className="pf-identity">
            <div className="pf-avatar" id="profileAvatarBig">{user ? initial : 'A'}</div>
            <div className="pf-identity-text">
              <div className="pf-display-name" id="profileDisplayName">{user ? (loaded.name || user.name) : '-'}</div>
              <div className="pf-display-meta">
                <span id="profileDisplayEmail" className="pf-email">{user?.email || ''}</span>
                <span className="pf-meta-sep">·</span>
                <span className="pf-username-tag" id="pfUsernameTag">{loaded.username ? '@' + loaded.username : ''}</span>
              </div>
              <div className="pf-bio-display" id="pfBioDisplay">{loaded.bio}</div>
            </div>
          </div>
        </div>

        <div className="pf-tabs" style={{ marginTop: 20 }}>
          <button className={'pf-tab' + (tab === 'notifications' ? ' active' : '')} data-tab="notifications" onClick={() => { setTab('notifications'); loadNotifs(); }}>
            Notifications
            <span className="pf-notif-dot" id="pfNotifDot" style={{ display: unread ? '' : 'none' }}></span>
          </button>
          <button className={'pf-tab' + (tab === 'settings' ? ' active' : '')} data-tab="settings" onClick={() => setTab('settings')}>Settings</button>
        </div>

        <div className={'pf-tab-panel' + (tab === 'notifications' ? ' active' : '')} id="pfTab-notifications">
          <div className="pf-notif-header">
            <div className="pf-section-label" style={{ margin: 0 }}>Notifications</div>
            <button className="pf-lb-refresh" onClick={markAllRead} title="Mark all read">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
          <div id="pfNotifList" className="pf-notif-list">
            {!user ? <div className="pf-empty">-</div>
              : notifErr ? <div className="pf-empty">Could not load notifications.</div>
              : notifs === null ? <div className="pf-empty">Loading…</div>
              : notifs.length === 0 ? <div className="pf-empty">No notifications yet.</div>
              : notifs.map((n) => (
                <div key={n.id} className={'pf-notif-row' + (n.read ? '' : ' pf-notif-row--unread')}>
                  <div className={`pf-notif-type-dot pf-notif-type-dot--${n.type}`}></div>
                  <div className="pf-notif-body">
                    <div className="pf-notif-title">{n.title}</div>
                    {n.body && <div className="pf-notif-text">{n.body}</div>}
                    <div className="pf-notif-time">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <div className="pf-notif-unread-pip"></div>}
                </div>
              ))}
          </div>
        </div>

        <form className={'pf-tab-panel' + (tab === 'settings' ? ' active' : '')} id="pfTab-settings" onSubmit={save} noValidate>
          <div className="pf-section-label">Personal Information</div>
          <div className="pf-field">
            <label className="pf-label" htmlFor="profileName">Full Name</label>
            <input className="pf-input" id="profileName" type="text" placeholder="Your full name" maxLength={60} value={form.name} onChange={set('name')} style={form.name && nameError(form.name) ? { borderColor: '#e06060' } : undefined} />
            <FieldErr text={form.name ? nameError(form.name) : null} />
          </div>
          <div className="pf-field">
            <label className="pf-label" htmlFor="profileEmail">Email Address</label>
            <input className="pf-input" id="profileEmail" type="email" disabled value={form.email} readOnly />
          </div>
          <div className="pf-field">
            <label className="pf-label" htmlFor="profileUsername">Username</label>
            <input className="pf-input" id="profileUsername" type="text" placeholder="Your username" maxLength={30} value={form.username} onChange={set('username')} style={usernameError(form.username) ? { borderColor: '#e06060' } : undefined} />
            <FieldErr text={usernameError(form.username)} />
          </div>
          <div className="pf-field">
            <label className="pf-label" htmlFor="profileBio">Bio</label>
            <input className="pf-input" id="profileBio" type="text" placeholder="Tell us about yourself…" maxLength={200} value={form.bio} onChange={set('bio')} />
          </div>
          <div className="pf-divider"></div>
          <div className="pf-section-label">Change Password</div>
          <div className="pf-field">
            <label className="pf-label" htmlFor="profileNewPw">New Password</label>
            <input className="pf-input" id="profileNewPw" type="password" placeholder="New password (optional)" autoComplete="new-password" value={form.pw} onChange={set('pw')} />
          </div>
          <div className="pf-field">
            <label className="pf-label" htmlFor="profileConfirmPw">Confirm New Password</label>
            <input className="pf-input" id="profileConfirmPw" type="password" placeholder="Re-enter new password" autoComplete="new-password" value={form.pw2} onChange={set('pw2')} />
          </div>
          <div className="pf-divider"></div>
          <div className="pf-msg" id="profileMsg" style={{ color: msg ? (msg.ok ? '#60c060' : '#e06060') : undefined }}>{msg?.text}</div>
          <button className="pf-save-btn" type="submit" disabled={saving || !user}>{saving ? 'Saving…' : 'Save Changes'}</button>
          <button className="pf-logout-btn" type="button" onClick={logout}>Sign Out</button>
        </form>
      </div>
    </div>
  );
}
