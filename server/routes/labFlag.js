// ── POST /api/lab/flag ──────────────────────────────────────────
// Flag submit for the lab-flow rooms, on the main server. The labs run on
// their own origin (docs/LABS.md) and never see a login token, so the CTF
// page sends the flag here: it is checked with the shared flag secret
// (server/labs/flags.js) and the solve + XP are recorded with the service
// role (record_lab_ctf_solve). Under /api/lab/ so that payload-looking wrong
// flags are not treated as attacks (attackDetection skips the prefix).
//   body { slug: 'web-04', flag: 'ACX{...}' }, header Authorization: Bearer <token>
const express = require('express');
const router = express.Router();
const { flagLimiter } = require('../middleware/rateLimit');
const { logAttempt } = require('../middleware/logger');
const { isFlag } = require('../labs/flags');
const { FLOW_SLUGS } = require('../labs/mount');
const { recordForRequest } = require('../labs/recordSolve');

router.post('/', flagLimiter, async (req, res) => {
  const { slug, flag } = req.body || {};
  if (typeof slug !== 'string' || !FLOW_SLUGS.has(slug)) return res.status(400).json({ success: false, error: 'Unknown lab.' });
  if (typeof flag !== 'string' || !flag.trim() || flag.length > 300) return res.status(400).json({ success: false, error: 'No flag provided' });
  const correct = isFlag(slug, flag);
  logAttempt('FLAG:' + slug, req.ip, flag.trim(), correct ? 'correct' : 'wrong');
  if (!correct) return res.status(401).json({ success: false, message: 'Incorrect flag.' });
  try {
    res.json({ success: true, ...(await recordForRequest(req, slug)) });
  } catch (e) {
    console.error('[labFlag]', slug, e.message);
    res.json({ success: true, recorded: false, reason: 'server_error' });
  }
});

module.exports = router;
