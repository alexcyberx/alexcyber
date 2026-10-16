'use client';

// Admin panel shell: sign-in gate, sidebar, one section per URL hash
// (#dashboard, #messages, ...). Sections still on the old panel open it at the
// same section (same tab, so the old panel sees this session).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import Login from './Login';
import { adminSupabase, clearOldPanelSession, logAdminEvent, markOldPanelSession } from './sb';
import { Icon } from './icons';
import { ToastProvider } from './ui';
import Dashboard from './sections/Dashboard';
import Messages from './sections/Messages';

export type SectionProps = { go: (id: string) => void; setBadge: (id: string, n: number) => void };

type Section = { id: string; label: string; group: string; icon: string; view?: (p: SectionProps) => React.ReactNode; old?: string };

// Order and grouping of the sidebar. `old` = section id in the old panel.
const SECTIONS: Section[] = [
  { id: 'dashboard', label: 'Dashboard', group: 'Overview', icon: 'dashboard', view: (p) => <Dashboard {...p} /> },
  { id: 'analytics', label: 'Analytics', group: 'Overview', icon: 'analytics', old: 'analytics' },
  { id: 'users', label: 'Users', group: 'People', icon: 'users', old: 'users' },
  { id: 'messages', label: 'Messages', group: 'People', icon: 'messages', view: (p) => <Messages {...p} /> },
  { id: 'notifications', label: 'Notifications', group: 'People', icon: 'notifications', old: 'notifications' },
  { id: 'community', label: 'Community', group: 'People', icon: 'community', old: 'community' },
  { id: 'content', label: 'Courses', group: 'Content', icon: 'content', old: 'content' },
  { id: 'blog', label: 'Blog', group: 'Content', icon: 'blog', old: 'blog' },
  { id: 'resources', label: 'Resources', group: 'Content', icon: 'resources', old: 'resources' },
  { id: 'ctf', label: 'CTF', group: 'Content', icon: 'ctf', old: 'ctf' },
  { id: 'tools', label: 'Tools', group: 'Platform', icon: 'toolsmanager', old: 'toolsmanager' },
  { id: 'gamification', label: 'XP & Leaderboard', group: 'Platform', icon: 'gamification', old: 'gamification' },
  { id: 'security', label: 'Security', group: 'Platform', icon: 'security', old: 'security' },
  { id: 'backup', label: 'Backup', group: 'Platform', icon: 'backup', old: 'backup' },
  { id: 'settings', label: 'Settings', group: 'Platform', icon: 'settings', old: 'settings' },
];

export const OLD_PANEL = '/panel-1b47c1ab561e.html';
const IDLE_MS = 30 * 60 * 1000;

type Gate = { state: 'loading' } | { state: 'login'; pending: User | null } | { state: 'ready'; user: User; name: string };

export default function AdminApp() {
  const sb = adminSupabase();
  const [gate, setGate] = useState<Gate>({ state: 'loading' });
  const [active, setActive] = useState('dashboard');
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);

  const enter = useCallback(async (u: User) => {
    let name = u.email || 'Admin';
    const { data } = await sb!.from('profiles').select('full_name, username').eq('id', u.id).maybeSingle();
    if (data) name = (data.full_name as string) || (data.username as string) || name;
    markOldPanelSession(u.email || '');
    setGate({ state: 'ready', user: u, name });
  }, [sb]);

  // On load: an existing session counts only with the admin role and aal2.
  useEffect(() => {
    if (!sb) { setGate({ state: 'login', pending: null }); return; }
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return setGate({ state: 'login', pending: null });
      const { data: prof } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      if (prof?.role !== 'admin') { await sb.auth.signOut(); return setGate({ state: 'login', pending: null }); }
      const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === 'aal2') return enter(session.user);
      setGate({ state: 'login', pending: session.user });
    })();
  }, [sb, enter]);

  const logout = useCallback(async (why = 'signed out') => {
    if (gate.state === 'ready') logAdminEvent('admin_logout', `${gate.user.email} ${why}`);
    clearOldPanelSession();
    await sb?.auth.signOut();
    setGate({ state: 'login', pending: null });
  }, [sb, gate]);

  // Idle sign-out.
  useEffect(() => {
    if (gate.state !== 'ready') return;
    let t = setTimeout(() => logout('idle sign-out'), IDLE_MS);
    const reset = () => { clearTimeout(t); t = setTimeout(() => logout('idle sign-out'), IDLE_MS); };
    const evs = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => { clearTimeout(t); evs.forEach((e) => window.removeEventListener(e, reset)); };
  }, [gate.state, logout]);

  // Hash routing.
  useEffect(() => {
    const read = () => {
      const h = location.hash.slice(1);
      if (SECTIONS.some((s) => s.id === h)) setActive(h);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  const go = useCallback((id: string) => {
    const s = SECTIONS.find((x) => x.id === id);
    if (!s) return;
    if (!s.view && s.old) { location.href = OLD_PANEL + '#' + s.old; return; }
    history.replaceState(null, '', '#' + id);
    setActive(id);
    setMenuOpen(false);
  }, []);
  const setBadge = useCallback((id: string, n: number) => setBadges((b) => (b[id] === n ? b : { ...b, [id]: n })), []);

  // Sidebar counts that should show before the section is opened.
  useEffect(() => {
    if (gate.state !== 'ready' || !sb) return;
    sb.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false)
      .then(({ count, error }) => { if (!error) setBadge('messages', count || 0); });
  }, [gate.state, sb, setBadge]);

  const groups = useMemo(() => [...new Set(SECTIONS.map((s) => s.group))], []);
  const current = SECTIONS.find((s) => s.id === active) || SECTIONS[0];

  if (gate.state === 'loading') return <div className="adm-loading">Loading...</div>;
  if (gate.state === 'login') return <ToastProvider><Login pending={gate.pending} onDone={(u) => { logAdminEvent('admin_login', `${u.email} logged in (2-step)`); enter(u); }} /></ToastProvider>;

  return (
    <ToastProvider>
      <div className={'adm-shell' + (menuOpen ? ' menu-open' : '')}>
        <aside className="adm-side" aria-label="Admin sections">
          <div className="adm-brand"><span className="adm-brand-mark">X</span> AlexCyberX <span className="adm-brand-tag">Admin</span></div>
          <nav>
            {groups.map((g) => (
              <div key={g} className="adm-side-group">
                <div className="adm-side-title">{g}</div>
                {SECTIONS.filter((s) => s.group === g).map((s) => (
                  <button key={s.id} className={'adm-side-item' + (s.id === current.id ? ' active' : '')} onClick={() => go(s.id)} data-sec={s.id}>
                    <span className="adm-side-icon"><Icon name={s.icon} /></span>
                    <span>{s.label}</span>
                    {!s.view && <span className="adm-side-old" title="Still on the old panel">old</span>}
                    {!!badges[s.id] && <span className="adm-badge">{badges[s.id]}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <a className="adm-side-foot" href="/"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg> Back to site</a>
        </aside>
        <div className="adm-main">
          <header className="adm-top">
            <button className="adm-icon-btn adm-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
            <h1>{current.label}</h1>
            <div className="adm-top-right">
              <span className="adm-who" id="admWho">{gate.name}</span>
              <button className="adm-btn ghost" onClick={() => logout()} id="admLogout">Sign out</button>
            </div>
          </header>
          <main className="adm-content" id="admContent">
            {current.view ? current.view({ go, setBadge }) : null}
          </main>
        </div>
        {menuOpen && <div className="adm-scrim" onClick={() => setMenuOpen(false)} />}
      </div>
    </ToastProvider>
  );
}
