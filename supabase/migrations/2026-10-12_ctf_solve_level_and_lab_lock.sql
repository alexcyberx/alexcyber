-- 2026-10-12: CTF solve fixes
-- 1) record_lab_ctf_solve() is now really used: server/labs/recordSolve.js calls
--    it (service role) after a lab's own /submit accepted the flag. Before, the
--    browser was meant to save lab solves but that code was a no-op, so lab
--    solves were never stored. Hardened here: advisory lock (two parallel
--    submits can't both count as the first solve) and only active challenges.
-- 2) Level = floor(xp / 500) + 1 everywhere. Both solve RPCs used / 1000 while
--    the site, the admin panel and award_daily_login_xp() use / 500, so a CTF
--    solve could lower a player's level until the next daily login fixed it.

CREATE OR REPLACE FUNCTION public.record_lab_ctf_solve(p_user_id uuid, p_slug text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_challenge   ctf_challenges%ROWTYPE;
  v_already     boolean;
  v_new_xp      integer;
  v_new_level   integer;
BEGIN
  SELECT * INTO v_challenge FROM ctf_challenges WHERE slug = p_slug;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found');
  END IF;
  IF v_challenge.status <> 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'inactive');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || v_challenge.id::text, 0));

  SELECT EXISTS(
    SELECT 1 FROM ctf_solves
    WHERE user_id = p_user_id AND challenge_id = v_challenge.id
  ) INTO v_already;

  IF v_already THEN
    RETURN jsonb_build_object('success', true, 'already_solved', true);
  END IF;

  -- on_ctf_solve_insert trigger increments ctf_challenges.solvers; no manual +1.
  INSERT INTO ctf_solves (user_id, challenge_id, points_earned, correct)
  VALUES (p_user_id, v_challenge.id, v_challenge.points, true);

  UPDATE profiles
    SET xp = COALESCE(xp, 0) + COALESCE(v_challenge.xp, v_challenge.points, 0),
        ctf_solves = COALESCE(ctf_solves, 0) + 1
    WHERE id = p_user_id
    RETURNING xp INTO v_new_xp;

  v_new_level := GREATEST(1, FLOOR(COALESCE(v_new_xp, 0) / 500.0) + 1);
  UPDATE profiles SET level = v_new_level WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'already_solved', false,
    'points_earned', v_challenge.points,
    'xp_earned', COALESCE(v_challenge.xp, v_challenge.points, 0),
    'new_xp', v_new_xp,
    'new_level', v_new_level
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.record_lab_ctf_solve(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_lab_ctf_solve(uuid, text) TO service_role;

-- submit_ctf_flag: same function, only the level formula changes (/ 1000 -> / 500).
DO $$
DECLARE d text;
BEGIN
  d := pg_get_functiondef('public.submit_ctf_flag(uuid, text)'::regprocedure);
  IF position('v_new_xp / 1000.0' in d) > 0 THEN
    EXECUTE replace(d, 'FLOOR(v_new_xp / 1000.0) + 1', 'GREATEST(1, FLOOR(COALESCE(v_new_xp, 0) / 500.0) + 1)');
  END IF;
END $$;
