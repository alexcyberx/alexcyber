-- ════════════════════════════════════════════════════════════
-- AlexCyberX — BUG FIX SQL
-- Ye 3 problems fix karta hai:
-- 1. Profile page pe data nahi dikhta
-- 2. Logout/login ke baad CTF solves reset ho jaate hain
-- 3. submit_ctf_flag RPC missing ya broken
-- Supabase SQL Editor mein run karo
-- ════════════════════════════════════════════════════════════


-- ════════════════════════════════════════
-- FIX 1: ctf_solves table — ensure `correct` column exists
-- (syncSolvedFromSupabase .eq('correct', true) use karta hai)
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ctf_solves (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id   uuid        REFERENCES ctf_challenges(id) ON DELETE CASCADE,
  solved_at      timestamptz DEFAULT NOW(),
  points_earned  integer     DEFAULT 0,
  correct        boolean     DEFAULT true,
  UNIQUE(user_id, challenge_id)
);

-- `correct` column add karo agar nahi hai
ALTER TABLE ctf_solves ADD COLUMN IF NOT EXISTS correct boolean DEFAULT true;
ALTER TABLE ctf_solves ADD COLUMN IF NOT EXISTS points_earned integer DEFAULT 0;

-- RLS
ALTER TABLE ctf_solves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ctf_solves_select" ON ctf_solves;
CREATE POLICY "ctf_solves_select" ON ctf_solves
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ctf_solves_insert" ON ctf_solves;
CREATE POLICY "ctf_solves_insert" ON ctf_solves
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- ════════════════════════════════════════
-- FIX 2: submit_ctf_flag RPC
-- Ye RPC flag validate karke ctf_solves mein insert karta hai
-- aur profiles ka XP/ctf_solves update karta hai
-- ════════════════════════════════════════
DROP FUNCTION IF EXISTS submit_ctf_flag(uuid, text);

CREATE FUNCTION submit_ctf_flag(p_challenge_id uuid, p_flag text)
RETURNS TABLE (
  correct        boolean,
  already_solved boolean,
  points_earned  integer,
  message        text
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id      uuid;
  v_correct_flag text;
  v_points       integer;
  v_is_correct   boolean;
  v_already      boolean;
BEGIN
  -- Current logged-in user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, false, 0, 'Not authenticated';
    RETURN;
  END IF;

  -- Challenge ka flag aur points fetch karo
  SELECT flag, points INTO v_correct_flag, v_points
  FROM ctf_challenges
  WHERE id = p_challenge_id AND status = 'active';

  IF v_correct_flag IS NULL THEN
    RETURN QUERY SELECT false, false, 0, 'Challenge not found';
    RETURN;
  END IF;

  -- Already solved check
  SELECT EXISTS(
    SELECT 1 FROM ctf_solves
    WHERE user_id = v_user_id AND challenge_id = p_challenge_id AND correct = true
  ) INTO v_already;

  IF v_already THEN
    RETURN QUERY SELECT true, true, 0, 'Already solved';
    RETURN;
  END IF;

  -- Flag check (case-sensitive exact match)
  v_is_correct := (trim(p_flag) = trim(v_correct_flag));

  IF v_is_correct THEN
    -- ctf_solves mein insert karo
    INSERT INTO ctf_solves (user_id, challenge_id, points_earned, correct, solved_at)
    VALUES (v_user_id, p_challenge_id, v_points, true, NOW())
    ON CONFLICT (user_id, challenge_id) DO NOTHING;

    -- profiles table update: XP + level + ctf_solves count
    UPDATE profiles
    SET
      xp         = COALESCE(xp, 0) + v_points,
      level      = GREATEST(1, (COALESCE(xp, 0) + v_points) / 500 + 1),
      ctf_solves = COALESCE(ctf_solves, 0) + 1,
      last_seen  = NOW()
    WHERE id = v_user_id;

    RETURN QUERY SELECT true, false, v_points, 'Correct! Flag accepted';
  ELSE
    -- Wrong attempt bhi log karo (optional)
    INSERT INTO ctf_solves (user_id, challenge_id, points_earned, correct, solved_at)
    VALUES (v_user_id, p_challenge_id, 0, false, NOW())
    ON CONFLICT (user_id, challenge_id) DO NOTHING;

    RETURN QUERY SELECT false, false, 0, 'Incorrect flag';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_ctf_flag(uuid, text) TO authenticated;


-- ════════════════════════════════════════
-- FIX 3: ctf_challenges table mein `flag` aur `points` columns
-- (submit_ctf_flag RPC inhe use karta hai)
-- ════════════════════════════════════════
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS flag   text;
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS status text    DEFAULT 'active';
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS title  text;
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS slug   text;


-- ════════════════════════════════════════
-- FIX 4: get_profile_stats — drop and recreate with better error handling
-- ════════════════════════════════════════
DROP FUNCTION IF EXISTS get_profile_stats(uuid);

CREATE FUNCTION get_profile_stats(p_user_id uuid)
RETURNS TABLE (
  xp                integer,
  level             integer,
  rank              bigint,
  ctf_solved        integer,
  ctf_total         integer,
  badge_count       integer,
  first_blood_count bigint,
  streak_current    integer,
  streak_longest    integer,
  recent_solves     jsonb
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_xp            integer;
  v_level         integer;
  v_streak_cur    integer;
  v_streak_long   integer;
  v_badge_count   integer;
  v_ctf_solves    integer;
  v_rank          bigint;
  v_ctf_total     integer;
  v_first_bloods  bigint;
  v_recent        jsonb;
BEGIN
  -- User profile
  SELECT
    COALESCE(p.xp, 0),
    COALESCE(p.level, 1),
    COALESCE(p.streak_current, 0),
    COALESCE(p.streak_longest, 0),
    COALESCE(p.badge_count, 0),
    COALESCE(p.ctf_solves, 0)
  INTO v_xp, v_level, v_streak_cur, v_streak_long, v_badge_count, v_ctf_solves
  FROM profiles p
  WHERE p.id = p_user_id;

  -- Rank (position by XP)
  SELECT COUNT(*) + 1 INTO v_rank
  FROM profiles WHERE xp > v_xp;

  -- Total active challenges
  SELECT COUNT(*) INTO v_ctf_total
  FROM ctf_challenges WHERE status = 'active';

  -- First bloods
  SELECT COUNT(*) INTO v_first_bloods
  FROM (
    SELECT challenge_id
    FROM ctf_solves
    WHERE correct = true
    GROUP BY challenge_id
    HAVING MIN(solved_at) FILTER (WHERE user_id = p_user_id) = MIN(solved_at)
      AND MIN(solved_at) FILTER (WHERE user_id = p_user_id) IS NOT NULL
  ) t;

  -- Recent solves (last 10)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'title',    cc.title,
      'category', cc.category,
      'points',   cs.points_earned,
      'solved_at',cs.solved_at
    ) ORDER BY cs.solved_at DESC
  ), '[]'::jsonb)
  INTO v_recent
  FROM ctf_solves cs
  JOIN ctf_challenges cc ON cc.id = cs.challenge_id
  WHERE cs.user_id = p_user_id AND cs.correct = true
  LIMIT 10;

  RETURN QUERY SELECT
    v_xp, v_level, v_rank,
    v_ctf_solves, v_ctf_total,
    v_badge_count, v_first_bloods,
    v_streak_cur, v_streak_long,
    COALESCE(v_recent, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION get_profile_stats(uuid) TO anon, authenticated;


-- ════════════════════════════════════════
-- FIX 5: profiles table mein missing columns
-- ════════════════════════════════════════
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp               integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level            integer     DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_current   integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_longest   integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen        timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_date  date,
  ADD COLUMN IF NOT EXISTS is_banned        boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS ctf_solves       integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_count      integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role             text        DEFAULT 'user';

-- ════════════════════════════════════════
-- FIX 6: profiles RLS — user apna row read/update kar sake
-- ════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (true);  -- public readable (leaderboard ke liye)

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());


-- ════════════════════════════════════════
-- VERIFY: Ye queries run karo check ke liye
-- ════════════════════════════════════════
-- SELECT COUNT(*) FROM ctf_solves;          -- koi rows hain?
-- SELECT COUNT(*) FROM ctf_challenges;      -- challenges hain?
-- SELECT xp, level, ctf_solves FROM profiles LIMIT 5;   -- columns hain?
