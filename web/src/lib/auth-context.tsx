'use client';

// Auth state for the Next pages. Same Supabase project, storage key and rules
// as js/auth.js, so a login on either app is a login on both.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { browserSupabase } from './supabase';

export type AuthModal = 'login' | 'signup' | 'forgot' | 'newpw' | null;

export type NavUser = { id: string; email: string; name: string; initial: string };

type AuthCtx = {
  user: NavUser | null;
  ready: boolean;
  modal: AuthModal;
  openAuth: (modal: Exclude<AuthModal, null>, nextPath?: string | null) => void;
  closeAuth: () => void;
  /** Where to go after a successful sign-in (validated same-site path), if any. */
  nextPath: string | null;
  afterSignIn: () => void;
  logout: () => Promise<void>;
  /** Re-read the signed-in user's name (after a profile edit). */
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}

// Only same-site relative paths (no //host, no schemes) may be used as a redirect.
export function safeNextPath(p: string | null | undefined): string | null {
  if (!p) return null;
  return /^\/(?!\/)[A-Za-z0-9/_-]*(\?[A-Za-z0-9=&%._-]*)?$/.test(p) ? p : null;
}

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // same as js/auth.js

function toast(message: string) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;background:#1a1a1f;color:#fff;border:1px solid rgba(239,68,68,0.4);padding:12px 18px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.4);opacity:0;transition:opacity .3s ease;pointer-events:none';
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 350); }, 3200);
}

// A suspended account is signed out on load (the DB refuses its writes anyway).
class BannedError extends Error {}

async function loadNavUser(authUser: User): Promise<NavUser> {
  const sb = browserSupabase()!;
  let name = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
  const { data, error } = await sb.from('profiles').select('full_name, is_banned').eq('id', authUser.id).maybeSingle();
  if (data?.is_banned) throw new BannedError();
  if (data?.full_name) {
    name = data.full_name;
  } else if (!data && !error) {
    // No profiles row (signup trigger missed it): create one with the defaults
    // the RLS insert policy allows. Never overwrites an existing row.
    await sb.from('profiles').upsert(
      { id: authUser.id, full_name: name, username: authUser.user_metadata?.username || '', bio: '', xp: 0, level: 1, ctf_solves: 0, role: 'user' },
      { onConflict: 'id', ignoreDuplicates: true },
    ).then(() => {}, () => {});
  }
  return { id: authUser.id, email: authUser.email || '', name, initial: (name || 'U')[0].toUpperCase() };
}

// On sign-out: drop per-user lab/CTF state so the next account on this
// browser doesn't inherit it (same keys as the SIGNED_OUT handler in js/auth.js).
function clearUserStorage() {
  const wipe = (s: Storage, keep: (k: string) => boolean) => {
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && keep(k)) keys.push(k); }
    keys.forEach((k) => s.removeItem(k));
  };
  try {
    wipe(sessionStorage, (k) => k.startsWith('acx_lab_') || ['acx_back_to_ctf', 'acx_back_ts', 'acx_pending_redirect', 'acx_seen_sent'].includes(k));
    wipe(localStorage, (k) => k.startsWith('acx_lab_') || ['acx_return_to_modal', 'acx_return_ts', 'acx_ctf_solved', 'acx_ctf_disabled'].includes(k));
  } catch { /* storage blocked */ }
}

// Once per tab: tell the server this user is active. The server takes the IP
// from the request itself (the browser can't be trusted to report it).
function recordSeen(session: Session) {
  try {
    if (sessionStorage.getItem('acx_seen_sent')) return;
    sessionStorage.setItem('acx_seen_sent', '1');
  } catch { /* ignore */ }
  fetch('/api/me/seen', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } })
    .then(() => {}, () => {});
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NavUser | null>(null);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<AuthModal>(null);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const xpChecked = useRef(false);

  const openAuth = useCallback((m: Exclude<AuthModal, null>, next?: string | null) => {
    if (next !== undefined) setNextPath(safeNextPath(next));
    setModal(m);
  }, []);
  const closeAuth = useCallback(() => setModal(null), []);

  const afterSignIn = useCallback(() => {
    setModal(null);
    const next = nextPath;
    setNextPath(null);
    if (next && next !== window.location.pathname) window.location.href = next;
  }, [nextPath]);

  const logout = useCallback(async () => {
    const sb = browserSupabase();
    if (sb) await sb.auth.signOut();
    clearUserStorage();
    window.location.href = '/';
  }, []);

  const refreshUser = useCallback(async () => {
    const sb = browserSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getUser();
    if (data.user) setUser(await loadNavUser(data.user).catch(() => null));
  }, []);

  // Session + auth events
  useEffect(() => {
    const sb = browserSupabase();
    if (!sb) { setReady(true); return; }
    let cancelled = false;

    const apply = async (session: Session | null) => {
      if (!session) { if (!cancelled) setUser(null); return; }
      let nu: NavUser;
      try {
        nu = await loadNavUser(session.user);
      } catch (e) {
        if (!(e instanceof BannedError)) throw e;
        await sb.auth.signOut();
        clearUserStorage();
        if (!cancelled) setUser(null);
        toast('Your account is suspended. Contact support if you think this is a mistake.');
        return;
      }
      if (cancelled) return;
      setUser(nu);
      // Daily login XP: the RPC itself makes sure it is only once per day.
      if (!xpChecked.current) {
        xpChecked.current = true;
        sb.rpc('award_daily_login_xp').then(({ data }) => {
          if (data && data.awarded) toast(`+${data.xp_gained} XP for logging in today!`);
        }, () => {});
      }
    };

    sb.auth.getSession().then(({ data }) => apply(data.session)).finally(() => { if (!cancelled) setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setModal('newpw');
      if (event === 'SIGNED_IN' && session) recordSeen(session);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') apply(session);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  // Links from the old SPA / emails: /?auth=login&next=/rooms, /?reset=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'login' || auth === 'signup' || auth === 'forgot') openAuth(auth, params.get('next'));
    else if (params.has('next')) setNextPath(safeNextPath(params.get('next')));
    if (params.has('auth') || params.has('next')) {
      params.delete('auth'); params.delete('next');
      const qs = params.toString();
      history.replaceState(history.state, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }
  }, [openAuth]);

  // 30 min of inactivity -> sign out (same as js/auth.js)
  useEffect(() => {
    if (!user) return;
    let t: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(async () => {
        const sb = browserSupabase();
        if (sb) await sb.auth.signOut();
        clearUserStorage();
        setUser(null);
        setModal('login');
      }, IDLE_TIMEOUT_MS);
    };
    const evts = ['click', 'keydown', 'touchstart', 'scroll'] as const;
    evts.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { clearTimeout(t); evts.forEach((e) => document.removeEventListener(e, reset)); };
  }, [user]);

  return (
    <Ctx.Provider value={{ user, ready, modal, openAuth, closeAuth, nextPath, afterSignIn, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}
