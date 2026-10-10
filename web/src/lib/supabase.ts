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

let browserClient: SupabaseClient | null = null;

// Browser: shares the old SPA's session from localStorage.
export function browserSupabase(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(URL, ANON, {
      auth: {
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return browserClient;
}
