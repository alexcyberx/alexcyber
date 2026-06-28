-- ════════════════════════════════════════════════════════════════
-- AlexCyberX — CTF Challenges Supabase Insert
-- Ye sab 20 challenges ctf_challenges table mein insert karta hai
-- Bina iske UUID map empty rahega aur solves record nahi honge
-- Supabase SQL Editor mein run karo
-- ════════════════════════════════════════════════════════════════

-- Pehle table ensure karo
CREATE TABLE IF NOT EXISTS ctf_challenges (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text    UNIQUE NOT NULL,
  title       text    NOT NULL,
  category    text    NOT NULL,
  difficulty  text    DEFAULT 'Easy',
  points      integer DEFAULT 0,
  xp          integer DEFAULT 0,
  flag        text,
  status      text    DEFAULT 'active',
  solvers     integer DEFAULT 0,
  created_at  timestamptz DEFAULT NOW()
);

ALTER TABLE ctf_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ctf_challenges_public_read" ON ctf_challenges;
CREATE POLICY "ctf_challenges_public_read" ON ctf_challenges
  FOR SELECT USING (true);

-- Insert all 20 challenges (slug = c.id from JS)
-- ON CONFLICT DO NOTHING = safe to re-run
INSERT INTO ctf_challenges (slug, title, category, difficulty, points, xp, flag, status, solvers)
VALUES
  -- WEB
  ('web-01', 'Hidden in Plain Sight',  'Web',       'Easy',   50,  100, NULL, 'active', 142),
  ('web-02', 'Cookie Monster',         'Web',       'Medium', 150, 250, NULL, 'active', 67),
  ('web-03', 'SQL Injection 101',      'Web',       'Medium', 200, 350, NULL, 'active', 89),
  ('web-04', 'robots.txt Secret',      'Web',       'Easy',   50,  80,  NULL, 'active', 210),

  -- FORENSICS
  ('for-01', 'Packet Detective',       'Forensics', 'Medium', 150, 250, NULL, 'active', 41),
  ('for-02', 'Metadata Matters',       'Forensics', 'Easy',   75,  120, NULL, 'active', 178),
  ('for-03', 'Log Hunter',             'Forensics', 'Hard',   350, 600, NULL, 'active', 14),

  -- CRYPTO
  ('cry-01', 'Caesar''s Secret',       'Crypto',    'Easy',   50,  80,  NULL, 'active', 312),
  ('cry-02', 'Base64 Bonanza',         'Crypto',    'Easy',   50,  80,  NULL, 'active', 267),
  ('cry-03', 'RSA Weak Keys',          'Crypto',    'Hard',   400, 700, NULL, 'active', 19),

  -- OSINT
  ('osi-01', 'Google Dorking',         'OSINT',     'Easy',   50,  75,  NULL, 'active', 289),
  ('osi-02', 'Wayback Machine',        'OSINT',     'Medium', 150, 250, NULL, 'active', 73),
  ('osi-03', 'Geolocation Challenge',  'OSINT',     'Hard',   300, 500, NULL, 'active', 41),

  -- PWN
  ('pwn-01', 'Buffer Overflow 101',    'Pwn',       'Hard',   400, 700, NULL, 'active', 15),
  ('pwn-02', 'Format String Bug',      'Pwn',       'Hard',   450, 800, NULL, 'active', 9),

  -- REVERSING
  ('rev-01', 'Strings Hunt',           'Reversing', 'Easy',   75,  120, NULL, 'active', 156),
  ('rev-02', 'XOR Decoder',            'Reversing', 'Medium', 200, 350, NULL, 'active', 62),

  -- MISC
  ('mis-01', 'QR Code Mystery',        'Misc',      'Medium', 150, 250, NULL, 'active', 83),
  ('mis-02', 'Steganography Intro',    'Misc',      'Medium', 175, 300, NULL, 'active', 71),
  ('mis-03', 'Linux Basics',           'Misc',      'Easy',   50,  75,  NULL, 'active', 198)

ON CONFLICT (slug) DO UPDATE SET
  title      = EXCLUDED.title,
  category   = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  points     = EXCLUDED.points,
  xp         = EXCLUDED.xp,
  status     = EXCLUDED.status;

-- Verify
SELECT slug, title, id FROM ctf_challenges ORDER BY category, slug;
