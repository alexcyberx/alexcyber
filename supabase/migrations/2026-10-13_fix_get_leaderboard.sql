-- 2026-10-13: get_leaderboard() failed on every call ("column p.badge_count
-- does not exist": the column was dropped after the function was written), so
-- /leaderboard showed "Failed to load leaderboard." Same signature (callers
-- and grants stay), badge_count is always 0 (there is no badges system).
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, username text, full_name text, xp integer, level integer, ctf_solves integer, badge_count integer, rank bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p.id, p.username, p.full_name, p.xp, p.level, p.ctf_solves,
         0::integer as badge_count,
         row_number() over (order by p.xp desc) as rank
  from public.profiles p
  where coalesce(p.is_banned, false) = false
  order by p.xp desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200);
$function$;
