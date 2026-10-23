import { serverSupabase } from './supabase';
import type { LeaderRow } from './player-utils';

export * from './player-utils';

// get_leaderboard() leaves out banned users (the old page queried profiles
// directly and showed them).
export async function getLeaderboard(limit = 50): Promise<LeaderRow[] | null> {
  const sb = serverSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc('get_leaderboard', { p_limit: limit });
  if (error) { console.error('[leaderboard]', error.message); return null; }
  return (data || []).map((r: LeaderRow) => ({ id: r.id, full_name: r.full_name, username: r.username, xp: r.xp || 0, ctf_solves: r.ctf_solves || 0 }));
}

export type PublicProfile = {
  id: string; full_name: string | null; username: string | null; bio: string | null; xp: number; ctf_solves: number;
  rank: number | null;
  staff: boolean;
  solves: { title: string; category: string | null; points: number; solved_at: string | null }[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  if (!UUID.test(id)) return null;
  const sb = serverSupabase();
  if (!sb) return null;
  const { data: u } = await sb.from('profiles')
    .select('id, full_name, username, bio, xp, ctf_solves, is_banned, role').eq('id', id).maybeSingle();
  if (!u || u.is_banned) return null;
  const isAdmin = u.role === 'admin';
  const [{ count, error: rankErr }, { data: solves }] = await Promise.all([
    // Rank among non-banned non-admin users, like the leaderboard (admins are
    // not on it). Equal XP shares a rank.
    isAdmin ? Promise.resolve({ count: null, error: null })
      : sb.from('profiles').select('id', { count: 'exact', head: true }).eq('is_banned', false)
        .or('role.is.null,role.neq.admin').gt('xp', u.xp || 0),
    sb.from('ctf_solves').select('points_earned, solved_at, ctf_challenges(title, category)')
      .eq('user_id', id).eq('correct', true).order('solved_at', { ascending: false }).limit(20),
  ]);
  type SolveRow = { points_earned: number | null; solved_at: string | null; ctf_challenges: { title: string; category: string | null } | { title: string; category: string | null }[] | null };
  return {
    id: u.id, full_name: u.full_name, username: u.username, bio: u.bio, xp: u.xp || 0, ctf_solves: u.ctf_solves || 0,
    rank: isAdmin || rankErr ? null : (count || 0) + 1,
    staff: isAdmin,
    solves: ((solves || []) as SolveRow[]).map((s) => {
      const ch = Array.isArray(s.ctf_challenges) ? s.ctf_challenges[0] : s.ctf_challenges;
      return { title: ch?.title || 'Unknown challenge', category: ch?.category || null, points: s.points_earned || 0, solved_at: s.solved_at };
    }),
  };
}
