import { roomDetails } from '@/lib/ctf';
import { serverSupabase } from '@/lib/supabase';

// Scenario + hints of every room, for logged-in players only (RoomsView
// fetches this after login with the Supabase access token).
export const dynamic = 'force-dynamic';

const HEADERS = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function GET(req: Request) {
  const m = (req.headers.get('authorization') || '').match(/^Bearer ([A-Za-z0-9._-]{20,4096})$/);
  const sb = serverSupabase();
  if (!m || !sb) return Response.json({ error: 'login_required' }, { status: 401, headers: HEADERS });
  const { data, error } = await sb.auth.getUser(m[1]);
  if (error || !data.user) return Response.json({ error: 'login_required' }, { status: 401, headers: HEADERS });
  return Response.json(roomDetails(), { headers: HEADERS });
}
