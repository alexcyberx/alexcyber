// POST /api/me/seen  (Authorization: Bearer <supabase JWT>)
// Records last_seen + last_login_ip for the admin Users tab. The IP comes
// from the request (trust proxy = 1 on Render), not from the browser, which
// used to ask api.ipify.org (blocked by our own CSP, so it never worked).
const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth, getSupabaseAdmin } = require('../middleware/toolAccess');

const router = express.Router();

const seenLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/seen', seenLimiter, requireAuth, async (req, res) => {
  const db = getSupabaseAdmin();
  if (!db) return res.status(503).json({ error: 'Not configured' });
  const { error } = await db.from('profiles')
    .update({ last_seen: new Date().toISOString(), last_login_ip: req.ip || null })
    .eq('id', req.authUserId);
  if (error) {
    console.error('[me/seen]', error.message);
    return res.status(500).json({ error: 'Could not record' });
  }
  res.status(204).end();
});

module.exports = router;
