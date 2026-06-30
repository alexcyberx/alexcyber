-- ================================================================
-- AlexCyberX — FINAL COMPLETE DATABASE FIX
-- Supabase SQL Editor mein RUN karo (ek baar mein sab fix)
-- ================================================================


-- ── STEP 1: profiles table columns ──────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp              integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level           integer     DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_current  integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_longest  integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen       timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_date date,
  ADD COLUMN IF NOT EXISTS is_banned       boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS ctf_solves      integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_count     integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role            text        DEFAULT 'user',
  -- FIX: saveProfile() auth.js mein upsert updated_at bhejta tha —
  -- yeh column exist nahi tha isliye upsert silently fail ho raha tha
  -- aur name/username save nahi ho rahe the. Column add karo.
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz DEFAULT NOW();


-- ── STEP 2: profiles RLS ────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());


-- ── STEP 3: ctf_challenges table ────────────────────────────────
CREATE TABLE IF NOT EXISTS ctf_challenges (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug       text        UNIQUE,
  title      text,
  category   text,
  difficulty text        DEFAULT 'Easy',
  points     integer     DEFAULT 0,
  xp         integer     DEFAULT 0,
  flag       text,
  status     text        DEFAULT 'active',
  solvers    integer     DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS slug       text;
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS flag       text;
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS points     integer DEFAULT 0;
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS status     text    DEFAULT 'active';
ALTER TABLE ctf_challenges ADD COLUMN IF NOT EXISTS title      text;

ALTER TABLE ctf_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ctf_challenges_public_read" ON ctf_challenges;
CREATE POLICY "ctf_challenges_public_read" ON ctf_challenges
  FOR SELECT USING (true);


-- ── STEP 4: ctf_solves table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ctf_solves (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id  uuid        REFERENCES ctf_challenges(id) ON DELETE CASCADE,
  solved_at     timestamptz DEFAULT NOW(),
  points_earned integer     DEFAULT 0,
  correct       boolean     DEFAULT true,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE ctf_solves ADD COLUMN IF NOT EXISTS correct       boolean DEFAULT true;
ALTER TABLE ctf_solves ADD COLUMN IF NOT EXISTS points_earned integer DEFAULT 0;

ALTER TABLE ctf_solves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ctf_solves_select" ON ctf_solves;
CREATE POLICY "ctf_solves_select" ON ctf_solves
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ctf_solves_insert" ON ctf_solves;
CREATE POLICY "ctf_solves_insert" ON ctf_solves
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- ── STEP 5: Insert all 20 challenges ────────────────────────────
INSERT INTO ctf_challenges (slug, title, category, difficulty, points, xp, status, solvers)
VALUES
  ('web-01', 'Hidden in Plain Sight',  'Web',       'Easy',   50,  100, 'active', 142),
  ('web-02', 'Cookie Monster',         'Web',       'Medium', 150, 250, 'active', 67),
  ('web-03', 'SQL Injection 101',      'Web',       'Medium', 200, 350, 'active', 89),
  ('web-04', 'robots.txt Secret',      'Web',       'Easy',   50,  80,  'active', 210),
  ('for-01', 'Packet Detective',       'Forensics', 'Medium', 150, 250, 'active', 41),
  ('for-02', 'Metadata Matters',       'Forensics', 'Easy',   75,  120, 'active', 178),
  ('for-03', 'Log Hunter',             'Forensics', 'Hard',   350, 600, 'active', 14),
  ('cry-01', 'Caesar''s Secret',       'Crypto',    'Easy',   50,  80,  'active', 312),
  ('cry-02', 'Base64 Bonanza',         'Crypto',    'Easy',   50,  80,  'active', 267),
  ('cry-03', 'RSA Weak Keys',          'Crypto',    'Hard',   400, 700, 'active', 19),
  ('osi-01', 'Google Dorking',         'OSINT',     'Easy',   50,  75,  'active', 289),
  ('osi-02', 'Wayback Machine',        'OSINT',     'Medium', 150, 250, 'active', 73),
  ('osi-03', 'Geolocation Challenge',  'OSINT',     'Hard',   300, 500, 'active', 41),
  ('pwn-01', 'Buffer Overflow 101',    'Pwn',       'Hard',   400, 700, 'active', 15),
  ('pwn-02', 'Format String Bug',      'Pwn',       'Hard',   450, 800, 'active', 9),
  ('rev-01', 'Strings Hunt',           'Reversing', 'Easy',   75,  120, 'active', 156),
  ('rev-02', 'XOR Decoder',            'Reversing', 'Medium', 200, 350, 'active', 62),
  ('mis-01', 'QR Code Mystery',        'Misc',      'Medium', 150, 250, 'active', 83),
  ('mis-02', 'Steganography Intro',    'Misc',      'Medium', 175, 300, 'active', 71),
  ('mis-03', 'Linux Basics',           'Misc',      'Easy',   50,  75,  'active', 198)
ON CONFLICT (slug) DO UPDATE SET
  title      = EXCLUDED.title,
  category   = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  points     = EXCLUDED.points,
  xp         = EXCLUDED.xp,
  status     = EXCLUDED.status;


-- ── STEP 6: get_profile_stats function ──────────────────────────
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
  v_xp           integer;
  v_level        integer;
  v_streak_cur   integer;
  v_streak_long  integer;
  v_badge_count  integer;
  v_ctf_solves   integer;
  v_rank         bigint;
  v_ctf_total    integer;
  v_first_bloods bigint;
  v_recent       jsonb;
BEGIN
  SELECT
    COALESCE(p.xp, 0),
    COALESCE(p.level, 1),
    COALESCE(p.streak_current, 0),
    COALESCE(p.streak_longest, 0),
    COALESCE(p.badge_count, 0),
    COALESCE(p.ctf_solves, 0)
  INTO v_xp, v_level, v_streak_cur, v_streak_long, v_badge_count, v_ctf_solves
  FROM profiles p WHERE p.id = p_user_id;

  SELECT COUNT(*) + 1 INTO v_rank
  FROM profiles WHERE xp > COALESCE(v_xp, 0);

  SELECT COUNT(*) INTO v_ctf_total
  FROM ctf_challenges WHERE status = 'active';

  SELECT COUNT(*) INTO v_first_bloods FROM (
    SELECT challenge_id FROM ctf_solves
    WHERE correct = true
    GROUP BY challenge_id
    HAVING MIN(solved_at) FILTER (WHERE user_id = p_user_id) = MIN(solved_at)
      AND MIN(solved_at) FILTER (WHERE user_id = p_user_id) IS NOT NULL
  ) t;

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


-- ── STEP 7: update_login_streak function ────────────────────────
DROP FUNCTION IF EXISTS update_login_streak(uuid);

CREATE FUNCTION update_login_streak(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_last   date;
  v_today  date := CURRENT_DATE;
  v_streak integer;
  v_long   integer;
BEGIN
  SELECT last_login_date, streak_current, streak_longest
  INTO v_last, v_streak, v_long
  FROM profiles WHERE id = p_user_id;

  IF v_last = v_today THEN
    UPDATE profiles SET last_seen = NOW() WHERE id = p_user_id;
    RETURN;
  END IF;

  IF v_last = v_today - INTERVAL '1 day' THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  v_long := GREATEST(COALESCE(v_long, 0), v_streak);

  UPDATE profiles SET
    last_login_date = v_today,
    last_seen       = NOW(),
    streak_current  = v_streak,
    streak_longest  = v_long
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_login_streak(uuid) TO authenticated;


-- ── STEP 8: submit_ctf_flag function ────────────────────────────
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
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, false, 0, 'Not authenticated';
    RETURN;
  END IF;

  SELECT flag, points INTO v_correct_flag, v_points
  FROM ctf_challenges
  WHERE id = p_challenge_id AND status = 'active';

  IF v_correct_flag IS NULL THEN
    RETURN QUERY SELECT false, false, 0, 'Challenge not found';
    RETURN;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM ctf_solves
    WHERE user_id = v_user_id AND challenge_id = p_challenge_id AND correct = true
  ) INTO v_already;

  IF v_already THEN
    RETURN QUERY SELECT true, true, 0, 'Already solved';
    RETURN;
  END IF;

  v_is_correct := (trim(p_flag) = trim(v_correct_flag));

  IF v_is_correct THEN
    INSERT INTO ctf_solves (user_id, challenge_id, points_earned, correct, solved_at)
    VALUES (v_user_id, p_challenge_id, v_points, true, NOW())
    ON CONFLICT (user_id, challenge_id) DO NOTHING;

    UPDATE profiles SET
      xp         = COALESCE(xp, 0) + v_points,
      level      = GREATEST(1, (COALESCE(xp, 0) + v_points) / 500 + 1),
      ctf_solves = COALESCE(ctf_solves, 0) + 1,
      last_seen  = NOW()
    WHERE id = v_user_id;

    RETURN QUERY SELECT true, false, v_points, 'Correct! Flag accepted';
  ELSE
    RETURN QUERY SELECT false, false, 0, 'Incorrect flag';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_ctf_flag(uuid, text) TO authenticated;


-- ── STEP 9: get_leaderboard function ────────────────────────────
DROP FUNCTION IF EXISTS get_leaderboard(integer);

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
  -- FIX: pehle sirf `ORDER BY p.xp DESC` tha — jab do users ka XP same
  -- ho, Postgres unka aapas ka order GUARANTEE nahi karta (vacuum, query
  -- plan, ya kuch bhi internal reason se badal sakta hai bina kisi real
  -- score-change ke). Client-side naye rank-change-arrow feature ke
  -- saath yeh combine ho ke FALSE "▲ moved up" / "▼ moved down" dikhata,
  -- jabki actual mein kisi ka rank nahi badla tha. ctf_solves DESC se
  -- tie-break karna real CTF platforms jaisa hai (zyada solves wins
  -- tie ko), aur id ko aakhri, hamesha-unique tiebreaker rakha hai taaki
  -- order har baar 100% deterministic rahe.
  RETURN QUERY
  SELECT p.id, p.username, p.full_name, p.xp, p.level, p.ctf_solves, p.badge_count
  FROM profiles p
  ORDER BY p.xp DESC, p.ctf_solves DESC, p.id ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard(integer) TO anon, authenticated;


-- ── STEP 10: notifications table ────────────────────────────────
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

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);


-- ── STEP 11: Auto-create profile on signup (CRITICAL FIX) ───────
-- Bina is trigger ke: naye user signup karte hain lekin profiles table
-- mein koi row nahi banti. Phir:
--   • get_profile_stats → 0 rows return → profile page blank
--   • submit_ctf_flag → UPDATE profiles WHERE id = user_id → 0 rows updated → XP kabhi nahi badhta
--   • saveProfile → pehla save hone ke baad hi row banti hai
-- Yeh trigger Supabase ke auth.users table pe lagta hai aur har naye
-- signup pe automatically profiles mein ek row insert kar deta hai.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, bio, xp, level, ctf_solves, badge_count, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    0, 1, 0, 0, 'user'
  )
  ON CONFLICT (id) DO NOTHING; -- safe if row already exists
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── STEP 12: Schema cache reload ────────────────────────────────
NOTIFY pgrst, 'reload schema';


-- ── VERIFY: Ye results aane chahiye ─────────────────────────────
SELECT
  (SELECT COUNT(*) FROM ctf_challenges) AS total_challenges,
  (SELECT COUNT(*) FROM profiles)       AS total_users,
  (SELECT COUNT(*) FROM ctf_solves)     AS total_solves;


-- ── STEP 13: badges aur user_badges tables ──────────────────────
-- profile.js badges tab ke liye zaroori hai
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

-- Default badges seed (sirf agar empty ho)
INSERT INTO badges (name, description, icon, color, rule, value)
SELECT * FROM (VALUES
  ('First Blood',   'Solve your first CTF challenge', 'medal',    '#f59e0b', 'ctf',     1),
  ('7-Day Streak',  'Login 7 days in a row',          'flame',    '#ef4444', 'streak',  7),
  ('Bookworm',      'Complete 10 chapters',           'book',     '#3b82f6', 'chapters',10),
  ('XP Grinder',    'Earn 1000 total XP',             'bolt',     '#a855f7', 'xp',      1000),
  ('Network Ninja', 'Awarded by admin',               'shield',   '#10b981', 'manual',  0),
  ('CTF Veteran',   'Solve 25 CTF challenges',        'diamond',  '#06b6d4', 'ctf',     25),
  ('Elite Hacker',  'Earn 5000 total XP',             'trophy',   '#dc1414', 'xp',      5000)
) AS v(name, description, icon, color, rule, value)
WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1);


-- ── STEP 14: mark_notifications_read RPC ────────────────────────
DROP FUNCTION IF EXISTS mark_notifications_read(uuid);

CREATE FUNCTION mark_notifications_read(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE (user_id = p_user_id OR user_id IS NULL) AND read = false;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_notifications_read(uuid) TO authenticated;


-- ── STEP 15: award_xp helper RPC ────────────────────────────────
DROP FUNCTION IF EXISTS award_xp(uuid, integer, text);

CREATE FUNCTION award_xp(p_user_id uuid, p_amount integer, p_source text DEFAULT 'general')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles SET
    xp    = COALESCE(xp, 0) + p_amount,
    level = GREATEST(1, (COALESCE(xp, 0) + p_amount) / 500 + 1)
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION award_xp(uuid, integer, text) TO authenticated;


-- ── FINAL VERIFY ────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM ctf_challenges) AS challenges,
  (SELECT COUNT(*) FROM profiles)       AS users,
  (SELECT COUNT(*) FROM badges)         AS badges,
  (SELECT COUNT(*) FROM notifications)  AS notifications;
