import { browserSupabase } from './supabase';

// Our own /api routes verify the Supabase access token. The SPA adds it with a
// global fetch wrapper (top of js/page-scripts.js); Next pages pass it explicitly.
export async function authHeaders(): Promise<Record<string, string>> {
  const sb = browserSupabase();
  if (!sb) return {};
  const { data } = await sb.auth.getSession();
  const t = data.session?.access_token;
  return t ? { Authorization: 'Bearer ' + t } : {};
}
