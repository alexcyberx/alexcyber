const express = require('express');
const router  = express.Router();
const { loginLimiter, flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG        = process.env.FLAG_WEB07 || 'ACX{l3ngth_pr3f1x3s_l13_2_y0u}';
const COOKIE_NAME  = 'acx_session_v2';

// Session id, dusre labs jaisa hi resolve hota hai: header > query > ip fallback
function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }

function phpSerializeGuest() {
  const username = 'guest';
  const role = 'user';
  // O:8:"UserData":2:{...} -- object with 2 string properties, both length-prefixed
  return `O:8:"UserData":2:{s:8:"username";s:${username.length}:"${username}";s:4:"role";s:${role.length}:"${role}";}`;
}

// Strict-ish extraction of the role field: reads the declared length prefix
// (s:N:"...") and checks it against the actual string length. Real PHP
// unserialize() does exactly this at the byte level, if the prefix and the
// actual payload length disagree, the string is malformed. Simply replacing
// "user" with "admin" in place (without updating N) produces a cookie that
// LOOKS right but fails this check, that's the core lesson of this tier.
function extractRole(serialized) {
  const match = serialized.match(/s:4:"role";s:(\d+):"([^"]*)"/);
  if (!match) return { ok: false, reason: 'role field not found' };

  const declaredLen = parseInt(match[1], 10);
  const value = match[2];

  if (value.length !== declaredLen) {
    return { ok: false, reason: `length prefix mismatch (declared ${declaredLen}, actual ${value.length})` };
  }

  return { ok: true, value };
}

// GET /api/lab/deserialize-medium/init, guest login: issues a fresh guest cookie
router.get('/init', loginLimiter, (req, res) => {
  const serialized = phpSerializeGuest();
  const cookieValue = Buffer.from(serialized, 'utf8').toString('base64');

  res.cookie(COOKIE_NAME, cookieValue, {
    httpOnly: false, // intentionally readable/writable from the client, that's the point of the lab
    sameSite: 'Lax',
    path: '/'
  });

  logAttempt('WEB07', sid(req), 'GET /init', 'guest_session_issued');
  res.json({ success: true, cookie: COOKIE_NAME });
});

// GET /api/lab/deserialize-medium/check, reads the cookie back and deserializes it
router.get('/check', flagLimiter, (req, res) => {
  const raw = req.cookies && req.cookies[COOKIE_NAME];
  if (!raw) {
    return res.status(400).json({ authenticated: false, error: 'No session cookie found. Log in first.' });
  }

  let serialized;
  try {
    serialized = Buffer.from(raw, 'base64').toString('utf8');
  } catch (e) {
    return res.status(400).json({ authenticated: false, error: 'Malformed session cookie.' });
  }

  const role = extractRole(serialized);
  logAttempt('WEB07', sid(req), raw, role.ok ? `role=${role.value}` : `malformed: ${role.reason}`);

  if (!role.ok) {
    return res.status(400).json({ authenticated: true, error: 'Session cookie failed to deserialize: ' + role.reason });
  }

  if (role.value === 'admin') {
    return res.json({ authenticated: true, role: 'admin', flag: FLAG });
  }

  res.json({ authenticated: true, role: role.value, flag: null });
});

module.exports = router;
