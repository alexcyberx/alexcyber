-- ════════════════════════════════════════
-- STEP 1: Columns add karo (safe hai)
-- ════════════════════════════════════════
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp               integer   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level            integer   DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_current   integer   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_longest   integer   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen        timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_date  date,
  ADD COLUMN IF NOT EXISTS is_banned        boolean   DEFAULT false,
  ADD COLUMN IF NOT EXISTS ctf_solves       integer   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_count      integer   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role             text      DEFAULT 'user';

-- ════════════════════════════════════════
-- STEP 2: Purane functions DROP karo
-- ════════════════════════════════════════
DROP FUNCTION IF EXISTS get_profile_stats(uuid);
DROP FUNCTION IF EXISTS get_leaderboard(integer);
DROP FUNCTION IF EXISTS update_login_streak(uuid);
DROP FUNCTION IF EXISTS mark_notifications_read(uuid);
DROP FUNCTION IF EXISTS award_xp(uuid, integer, text);

-- ════════════════════════════════════════
-- STEP 3: get_profile_stats
-- ════════════════════════════════════════
CREATE FUNCTION get_profile_stats(p_user_id uuid)
RETURNS TABLE (
  xp                  integer,
  level               integer,
  rank                bigint,
  ctf_solved          integer,
  ctf_total           integer,
  badge_count         integer,
  first_blood_count   bigint,
  streak_current      integer,
  streak_longest      integer,
  recent_solves       jsonb
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH
    user_profile AS (
      SELECT p.xp, p.level, p.streak_current, p.streak_longest,
             p.badge_count, p.ctf_solves
      FROM profiles p WHERE p.id = p_user_id
    ),
    user_rank AS (
      SELECT COUNT(*) + 1 AS rank FROM profiles
      WHERE xp > (SELECT xp FROM profiles WHERE id = p_user_id)
    ),
    ctf_total_count AS (
      SELECT COUNT(*) AS total FROM ctf_challenges WHERE status = 'active'
    ),
    first_bloods AS (
      SELECT COUNT(*) AS cnt FROM (
        SELECT challenge_id
        FROM ctf_solves
        GROUP BY challenge_id
        HAVING MIN(CASE WHEN user_id = p_user_id THEN solved_at END) = MIN(solved_at)
          AND MIN(CASE WHEN user_id = p_user_id THEN solved_at END) IS NOT NULL
      ) fb
    ),
    recent AS (
      SELECT jsonb_agg(
        jsonb_build_object(
          'title',    cc.title,
          'category', cc.category,
          'points',   cc.points,
          'solved_at',cs.solved_at
        ) ORDER BY cs.solved_at DESC
      ) AS solves
      FROM (
        SELECT * FROM ctf_solves
        WHERE user_id = p_user_id
        ORDER BY solved_at DESC LIMIT 10
      ) cs
      JOIN ctf_challenges cc ON cc.id = cs.challenge_id
    )
  SELECT
    up.xp, up.level, ur.rank,
    up.ctf_solves, ctc.total::integer,
    up.badge_count, fb.cnt,
    up.streak_current, up.streak_longest,
    COALESCE(r.solves, '[]'::jsonb)
  FROM user_profile up
  CROSS JOIN user_rank ur
  CROSS JOIN ctf_total_count ctc
  CROSS JOIN first_bloods fb
  CROSS JOIN recent r;
END;
$$;

-- ════════════════════════════════════════
-- STEP 4: get_leaderboard
-- ════════════════════════════════════════
CREATE FUNCTION get_leaderboard(p_limit integer DEFAULT 50)
RETURNS TABLE (
  user_id     uuid,
  username    text,
  full_name   text,
  xp          integer,
  level       integer,
  ctf_solves  integer,
  badge_count integer
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- FIX: same-XP rows ka order pehle non-deterministic tha (no tiebreaker).
  -- Live leaderboard ke rank-change-arrow feature ke saath combine ho ke
  -- false "moved up/down" dikha sakta tha. ctf_solves DESC, id ASC se ab
  -- order 100% deterministic hai.
  RETURN QUERY
  SELECT p.id, p.username, p.full_name, p.xp, p.level, p.ctf_solves, p.badge_count
  FROM profiles p
  ORDER BY p.xp DESC, p.ctf_solves DESC, p.id ASC
  LIMIT p_limit;
END;
$$;

-- ════════════════════════════════════════
-- STEP 5: update_login_streak
-- ════════════════════════════════════════
CREATE FUNCTION update_login_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_last_login  date;
  v_today       date := CURRENT_DATE;
  v_streak      integer;
  v_longest     integer;
BEGIN
  SELECT last_login_date, streak_current, streak_longest
  INTO v_last_login, v_streak, v_longest
  FROM profiles WHERE id = p_user_id;

  IF v_last_login = v_today THEN
    UPDATE profiles SET last_seen = NOW() WHERE id = p_user_id;
    RETURN;
  END IF;

  IF v_last_login = v_today - INTERVAL '1 day' THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  v_longest := GREATEST(COALESCE(v_longest, 0), v_streak);

  UPDATE profiles SET
    last_login_date = v_today,
    last_seen       = NOW(),
    streak_current  = v_streak,
    streak_longest  = v_longest
  WHERE id = p_user_id;
END;
$$;

-- ════════════════════════════════════════
-- STEP 6: mark_notifications_read
-- ════════════════════════════════════════
CREATE FUNCTION mark_notifications_read(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE (user_id = p_user_id OR user_id IS NULL) AND read = false;
END;
$$;

-- ════════════════════════════════════════
-- STEP 7: award_xp
-- ════════════════════════════════════════
CREATE FUNCTION award_xp(p_user_id uuid, p_amount integer, p_source text DEFAULT 'general')
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles SET
    xp    = COALESCE(xp, 0) + p_amount,
    level = GREATEST(1, (COALESCE(xp, 0) + p_amount) / 500 + 1)
  WHERE id = p_user_id;
END;
$$;

-- ════════════════════════════════════════
-- STEP 8: Notifications table
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES profiles(id) ON DELETE CASCADE,
  title      text        NOT NULL,
  body       text,
  type       text        DEFAULT 'info',
  read       boolean     DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- ════════════════════════════════════════
-- STEP 9: Badges tables
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS badges (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  description text,
  icon        text DEFAULT 'star',
  color       text DEFAULT '#f59e0b',
  rule        text DEFAULT 'manual',
  value       integer DEFAULT 0,
  created_at  timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  uuid REFERENCES badges(id)   ON DELETE CASCADE,
  earned_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_public_read" ON badges;
CREATE POLICY "badges_public_read" ON badges FOR SELECT USING (true);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_badges_read" ON user_badges;
CREATE POLICY "user_badges_read" ON user_badges FOR SELECT USING (true);

INSERT INTO badges (name, description, icon, color, rule, value)
SELECT * FROM (VALUES
  ('First Blood',   'Solve your first CTF challenge', 'medal',   '#f59e0b', 'ctf',    1),
  ('7-Day Streak',  'Login 7 days in a row',          'flame',   '#ef4444', 'streak', 7),
  ('Bookworm',      'Complete 10 chapters',           'book',    '#3b82f6', 'chapters',10),
  ('XP Grinder',    'Earn 1000 total XP',             'bolt',    '#a855f7', 'xp',     1000),
  ('Network Ninja', 'Awarded by admin',               'shield',  '#10b981', 'manual', 0),
  ('CTF Veteran',   'Solve 25 CTF challenges',        'diamond', '#06b6d4', 'ctf',    25),
  ('Elite Hacker',  'Earn 5000 total XP',             'trophy',  '#dc1414', 'xp',     5000)
) AS v(name, description, icon, color, rule, value)
WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1);

-- ════════════════════════════════════════
-- STEP 10: GRANT permissions
-- ════════════════════════════════════════
GRANT EXECUTE ON FUNCTION get_profile_stats(uuid)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard(integer)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_login_streak(uuid)     TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION award_xp(uuid, integer, text) TO authenticated;
