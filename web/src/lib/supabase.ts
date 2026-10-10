import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Must match js/config.js so a login on the old SPA is visible here (same origin,
// same localStorage key).
export const AUTH_STORAGE_KEY = 'alexcyberx-auth';

export function supabaseConfigured(): boolean {
  return Boolean(URL && ANON);
}

// Server-side reads: anon key only, RLS decides what is visible. No session.
export function serverSupabase(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

// "Remember me": the session is kept in localStorage (survives closing the
// browser) or only in sessionStorage (this tab). Same adapter as js/config.js,
// so both apps read the same session either way.
export const REMEMBER_KEY = 'acx_remember';

const authStorage = {
  getItem(key: string): string | null {
    try { return localStorage.getItem(key) ?? sessionStorage.getItem(key); } catch { return null; }
  },
  setItem(key: string, value: string) {
    try {
      const remember = localStorage.getItem(REMEMBER_KEY) !== '0';
      (remember ? localStorage : sessionStorage).setItem(key, value);
      (remember ? sessionStorage : localStorage).removeItem(key);
    } catch { /* storage blocked */ }
  },
  removeItem(key: string) {
    try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch { /* storage blocked */ }
  },
};

export function setRememberMe(remember: boolean) {
  try { localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0'); } catch { /* storage blocked */ }
}

let browserClient: SupabaseClient | null = null;

// Browser: shares the old SPA's session (same storage key + adapter).
export function browserSupabase(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(URL, ANON, {
      auth: {
        storageKey: AUTH_STORAGE_KEY,
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
        // Google sign-in and the password-reset link come back to a Next page
        // with the tokens in the URL hash.
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}
