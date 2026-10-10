// Small helpers shared by server pages and client components (no DB access).

export type LeaderRow = { id: string; full_name: string | null; username: string | null; xp: number; ctf_solves: number };

// Level is always derived from XP (same formula as auth.js / ctf-sync.js),
// the stored level column can be stale.
export const levelFromXp = (xp: number | null | undefined) => Math.max(1, Math.floor((xp || 0) / 500) + 1);

export const displayName = (u: { full_name?: string | null; username?: string | null }) =>
  u.full_name || u.username || 'Anonymous';
