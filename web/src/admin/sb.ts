import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The admin panel's own Supabase session (same storage key the old panel used,
// so a signed-in admin stays signed in). It is separate from the site login on
// purpose.
export const ADMIN_STORAGE_KEY = 'alexcyberx-admin-auth';

// sessionStorage marker the removed old panel needed; cleared on sign-in and
// sign-out so no stale copy is left behind.
const OLD_PANEL_SESSION = 'acx_admin_auth';

let client: SupabaseClient | null = null;

export function adminSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !anon) return null;
  if (!client) {
    client = createClient(url, anon, {
      auth: { storageKey: ADMIN_STORAGE_KEY, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return client;
}

export function clearOldPanelSession() {
  try { sessionStorage.removeItem(OLD_PANEL_SESSION); } catch { /* blocked */ }
}

/** This session's access token, for the server admin API. */
export async function adminToken(): Promise<string | null> {
  const { data } = (await adminSupabase()?.auth.getSession()) || { data: { session: null } };
  return data.session?.access_token || null;
}

/** Audit entry (admin RPC). No client IP: a browser-supplied IP proves nothing. */
export function logAdminEvent(type: string, details: string) {
  adminSupabase()?.rpc('log_admin_event', { p_event_type: type, p_details: details, p_ip: null }).then(() => {}, () => {});
}
