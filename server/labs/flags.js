// ── CTF FLAGS ───────────────────────────────────────────────────
// The repo is public, so no flag is written anywhere in it. Every flag is
// ACX{<theme>_<tail>}: the theme is the readable part (public, it only hints
// at the challenge), the tail is HMAC-SHA256(secret, slug), so nobody can
// work it out without the server's secret.
//
// Secret: FLAG_SECRET, or else the Supabase service-role key (already a
// secret on Render, so nothing extra has to be set). Changing it changes
// every flag; syncFlagHashes() below then updates the DB on the next start.
// No secret at all (local dev without Supabase): a random one per process.
//
// The DB never holds a flag, only sha256(flag) in ctf_challenges.flag_hash,
// which submit_ctf_flag() compares (supabase/migrations/2026-10-20_ctf_flag_hashes.sql).
const crypto = require('crypto');

const THEMES = {
  'web-01': 'c0mm3nts_4r3_n0t_s3cr3t',
  'web-02': 'c00k13s_4r3_n0t_s3cur3',
  'web-03': 'un10n_s3l3ct_g0t_m3',
  'web-04': 'r0b0ts_txt_l34ks_s3cr3ts',
  'web-06': 'tru5t_n0th1ng_fr0m_th3_cl13nt',
  'web-07': 'l3ngth_pr3f1x3s_l13_2_y0u',
  'for-01': 'p4ck3t_d3t3ct1v3_dn5_3xf1l',
  'for-02': 'm3t4_d4t4_1s_3v3rywh3r3',
  'cry-01': 'veni_vidi_vici_shift3',
  'cry-02': 'base64_is_not_encryption',
  'ai-01':  'h3lpd3sk_b0t_sp1ll3d_th3_b34ns',
  'web-08': 'n0_0wn3r_ch3ck_0n_0rd3rs',
  'for-04': 'f41l3d_f41l3d_f41l3d_4cc3pt3d',
};

const SECRET = process.env.FLAG_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || crypto.randomBytes(32).toString('hex');
// Where the secret came from. The labs server (its own origin, no database
// keys) must get FLAG_SECRET, the same value as the main server.
const SECRET_SOURCE = process.env.FLAG_SECRET ? 'FLAG_SECRET' : process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service-role' : 'random';
if (!process.env.FLAG_SECRET && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[flags] no FLAG_SECRET / SUPABASE_SERVICE_ROLE_KEY: lab flags change on every restart');
}

const cache = {};
function flagFor(slug) {
  if (!THEMES[slug]) throw new Error('unknown CTF slug ' + slug);
  if (!cache[slug]) {
    const tail = crypto.createHmac('sha256', SECRET).update('acx-flag:' + slug).digest('hex').slice(0, 12);
    cache[slug] = `ACX{${THEMES[slug]}_${tail}}`;
  }
  return cache[slug];
}

const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

// Constant-time compare of a submitted flag.
function isFlag(slug, input) {
  if (typeof input !== 'string') return false;
  const a = Buffer.from(sha256(input.trim()), 'hex');
  const b = Buffer.from(sha256(flagFor(slug)), 'hex');
  return crypto.timingSafeEqual(a, b);
}

// Push sha256 of every flag to ctf_challenges.flag_hash (service role), so a
// flag submitted on the CTF page (submit_ctf_flag RPC) matches the lab's.
async function syncFlagHashes(db) {
  if (!db) return;
  for (const slug of Object.keys(THEMES)) {
    let { error } = await db.from('ctf_challenges').update({ flag_hash: sha256(flagFor(slug)) }).eq('slug', slug);
    // Migration not applied yet (no flag_hash column): keep the old plain
    // column in step instead (not readable by anon/authenticated). Once the
    // migration is in, its trigger turns any plain flag into a hash.
    if (error && /flag_hash/.test(error.message)) ({ error } = await db.from('ctf_challenges').update({ flag: flagFor(slug) }).eq('slug', slug));
    if (error) console.error('[flags] sync', slug, error.message);
  }
  console.log('[flags] flag hashes synced');
}

// Non-secret fingerprint of the secret (its own HMAC input, so it says
// nothing about any flag): the main server compares it with the labs
// server's to catch two different secrets.
function secretFingerprint() {
  return crypto.createHmac('sha256', SECRET).update('acx-flag-fingerprint').digest('hex').slice(0, 16);
}

module.exports = { flagFor, isFlag, syncFlagHashes, secretFingerprint, SECRET_SOURCE, THEMES };
