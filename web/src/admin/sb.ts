import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The admin panel's own Supabase session: same storage key as the old panel
// (js/admin-panel-app.js), so a sign-in on either panel works on both while the
// sections move over. It is separate from the site login on purpose.
export const ADMIN_STORAGE_KEY = 'alexcyberx-admin-auth';

// The old panel also wants this sessionStorage marker before it trusts the
// session (it then re-checks role + aal2 itself). 2 h, same as there.
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

export function markOldPanelSession(email: string) {
  try { sessionStorage.setItem(OLD_PANEL_SESSION, JSON.stringify({ email, exp: Date.now() + 2 * 3600 * 1000, ts: Date.now() })); } catch { /* blocked */ }
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
