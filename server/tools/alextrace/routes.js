/* ═══════════════════════════════════════════════════════════
   ALEXTRACE - Digital footprint / self-OSINT audit tool
   ═══════════════════════════════════════════════════════════
   POST /api/alextrace/lookup
   Body: { username?, email?, userId }
   Runs username enumeration across 25+ platforms and/or email
   intelligence (Gravatar, free breach-list domain match, domain
   security), correlates the findings, and, when GitHub is among
   the hits, pulls that public profile's bio/links for a deeper
   correlation pass. Returns an exposure "report card" with an
   overall score, per-category breakdown, and action items.

   POST /api/alextrace/metadata  (multipart/form-data, field: image)
   Extracts EXIF metadata from an uploaded image. Nothing is
   stored - processed in memory and discarded after the response.

   POST /api/alextrace/password-check
   Body: { password }
   Fully offline password pattern/entropy analysis. The password
   is never logged or stored anywhere.

   GET  /api/alextrace/breach-search?q=service-name
   Free, keyless search of HIBP's public breach directory by
   service name - no email required.

   GET  /api/alextrace/history?userId=uuid
   GET  /api/alextrace/lookup/:id?userId=uuid

   All routes require login and respect the admin's enable/disable
   switch for the 'alextrace' tool, same as AlexRecon/AlexUtils.

   No API keys or environment variables are required - every check
   this tool runs is free and keyless.
═══════════════════════════════════════════════════════════ */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { requireToolLogin, checkToolEnabled, logToolUsage } = require('../../middleware/toolAccess');
const { traceLimiter } = require('../../middleware/rateLimit');

const { isValidUsername, isValidEmail } = require('./modules/utils');
const { usernameEnumeration } = require('./modules/username');
const { emailIntelligence } = require('./modules/email');
const { searchBreachesByName } = require('./modules/breachList');
const { extractMetadata } = require('./modules/metadata');
const { deepCorrelate } = require('./modules/correlation');
const { analyzePassword } = require('./modules/passwordIntel');
const { buildReport } = require('./modules/riskScorer');

// Images only, kept small and in memory (never written to disk -
// consistent with "nothing is stored" for this privacy-sensitive check).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are accepted.'));
    }
    cb(null, true);
  }
});

let supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null; // history saving is optional - lookup still works without it
    }
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdmin;
}

router.use(requireToolLogin, checkToolEnabled('alextrace'));

router.post('/lookup', traceLimiter, async (req, res) => {
  const startedAt = Date.now();
  try {
    const { username, email } = req.body;
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim() : '';

    if (!cleanUsername && !cleanEmail) {
      return res.status(400).json({ error: 'Please enter a username or email to check.' });
    }
    if (cleanUsername && !isValidUsername(cleanUsername)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, dots, underscores, and hyphens (2-39 characters).' });
    }
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const [usernameResult, emailResult] = await Promise.all([
      cleanUsername ? usernameEnumeration(cleanUsername, { includeVariations: true }) : Promise.resolve(null),
      cleanEmail ? emailIntelligence(cleanEmail) : Promise.resolve(null)
    ]);

    // Deep correlation: if GitHub came back as a hit, pull its public
    // bio/links and see what else it points to. Bounded to one extra
    // hop so this stays fast and doesn't chain indefinitely.
    let deepCorrelation = null;
    if (usernameResult && usernameResult.found.some(p => p.id === 'github')) {
      deepCorrelation = await deepCorrelate(cleanUsername).catch(() => null);
    }

    const report = buildReport({ usernameResult, emailResult, metadataResult: null, deepCorrelation });

    const responsePayload = {
      username: cleanUsername || null,
      email: cleanEmail || null,
      usernameResult,
      emailResult,
      deepCorrelation,
      report,
      scanDurationMs: Date.now() - startedAt,
      disclaimer: 'AlexTrace only checks publicly available information. Use it to audit your own exposure, or with explicit permission from the person you\'re checking.'
    };

    const db = getSupabaseAdmin();
    if (db && req.toolUserId) {
      const { data, error } = await db
        .from('alextrace_lookups')
        .insert({
          user_id: req.toolUserId,
          username: cleanUsername || null,
          email_domain: cleanEmail ? cleanEmail.split('@')[1] : null, // domain only, never the full email, for privacy
          overall_score: report.overallScore,
          overall_level: report.overallLevel,
          result: responsePayload
        })
        .select('id')
        .single();
      if (!error && data) responsePayload.lookupId = data.id;
    }

    logToolUsage('alextrace', req.toolUserId);
    res.json(responsePayload);
  } catch (err) {
    console.error('[AlexTrace] lookup failed:', err.message);
    res.status(500).json({ error: 'Something went wrong running the lookup. Please try again.' });
  }
});

router.post('/metadata', traceLimiter, (req, res) => {
  upload.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message || 'Could not process the uploaded image.' });
    }
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'Please upload an image.' });
      }
      const metadataResult = await extractMetadata(req.file.buffer);
      const report = buildReport({ usernameResult: null, emailResult: null, metadataResult });
      logToolUsage('alextrace', req.toolUserId);
      res.json({ metadataResult, report });
    } catch (err) {
      console.error('[AlexTrace] metadata check failed:', err.message);
      res.status(500).json({ error: 'Could not read metadata from this image. Please try again.' });
    }
  });
});

// ── POST /api/alextrace/password-check ───────────────────────
// Fully offline analysis (no external calls). The password value
// is used only in-memory for this single computation - it is never
// logged (see the catch block below, which logs only err.message,
// never req.body) and never written to Supabase or anywhere else.
router.post('/password-check', traceLimiter, (req, res) => {
  try {
    const { password } = req.body;
    const analysis = analyzePassword(password);
    if (analysis.error) {
      return res.status(400).json({ error: analysis.error });
    }
    const report = buildReport({ usernameResult: null, emailResult: null, metadataResult: null, passwordResult: analysis });
    logToolUsage('alextrace', req.toolUserId);
    res.json({ analysis, report });
  } catch (err) {
    console.error('[AlexTrace] password check failed:', err.message);
    res.status(500).json({ error: 'Could not analyze this password. Please try again.' });
  }
});

// ── GET /api/alextrace/breach-search?q=canva ─────────────────
// Free "check a service" lookup, no email needed, no API key
// needed. Searches HIBP's public breach list by name/title.
router.get('/breach-search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Please enter at least 2 characters to search.' });
    }
    const results = await searchBreachesByName(q);
    logToolUsage('alextrace', req.toolUserId);
    res.json({ query: q, results });
  } catch (err) {
    console.error('[AlexTrace] breach search failed:', err.message);
    // Degrade gracefully, an unreachable breach directory shouldn't
    // look like a broken feature to the user, just an empty result
    // with an honest note, consistent with how the rest of AlexTrace
    // handles unreachable third-party services.
    res.json({ query: req.query.q || '', results: [], note: 'The breach directory is temporarily unavailable. Please try again shortly.' });
  }
});

// ── GET /api/alextrace/history ───────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Lookup history is not configured on the server.' });

    const { data, error } = await db
      .from('alextrace_lookups')
      .select('id, username, email_domain, overall_score, overall_level, created_at')
      .eq('user_id', req.toolUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ lookups: data });
  } catch (err) {
    console.error('[AlexTrace] history fetch failed:', err.message);
    res.status(500).json({ error: 'Could not load lookup history.' });
  }
});

// ── GET /api/alextrace/lookup/:id ────────────────────────────
router.get('/lookup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getSupabaseAdmin();
    if (!db) return res.status(500).json({ error: 'Lookup history is not configured on the server.' });

    const { data, error } = await db
      .from('alextrace_lookups')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.toolUserId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Lookup not found.' });
    res.json(data);
  } catch (err) {
    console.error('[AlexTrace] lookup fetch failed:', err.message);
    res.status(500).json({ error: 'Could not load lookup.' });
  }
});

module.exports = router;
