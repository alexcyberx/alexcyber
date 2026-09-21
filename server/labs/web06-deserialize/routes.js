const express = require('express');
const router  = express.Router();
const { loginLimiter, flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG        = process.env.FLAG_WEB06 || 'ACX{tru5t_n0th1ng_fr0m_th3_cl13nt}';
const COOKIE_NAME  = 'acx_session';

// Session id, dusre labs jaisa hi resolve hota hai: header > query > ip fallback
function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }

function phpSerializeGuest() {
  const username = 'guest';
  const role = 'user';
  // O:8:"UserData":3:{...} -- object with 3 string/bool properties
  return `O:8:"UserData":3:{s:8:"username";s:${username.length}:"${username}";s:4:"role";s:${role.length}:"${role}";s:7:"isAdmin";b:0;}`;
}

// Extract just the isAdmin boolean out of a PHP-serialized UserData blob.
// Intentionally naive (regex, not a real PHP unserializer) -- this mirrors
// how a lot of real-world deserialization bugs work: the app trusts the
// client-supplied blob and only reads out the field it cares about,
// without validating the structure or a signature around it.
function extractIsAdmin(serialized) {
  const match = serialized.match(/s:7:"isAdmin";b:(\d);/);
  return !!match && match[1] === '1';
}

// GET /api/lab/deserialize/init, guest login: issues a fresh guest cookie
router.get('/init', loginLimiter, (req, res) => {
  const serialized = phpSerializeGuest();
  const cookieValue = Buffer.from(serialized, 'utf8').toString('base64');

  res.cookie(COOKIE_NAME, cookieValue, {
    httpOnly: false, // intentionally readable/writable from the client, that's the point of the lab
    sameSite: 'Lax',
    path: '/'
  });

  logAttempt('WEB06', sid(req), 'GET /init', 'guest_session_issued');
  res.json({ success: true, cookie: COOKIE_NAME });
});

// GET /api/lab/deserialize/check, reads the cookie back and deserializes it
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

  const isAdmin = extractIsAdmin(serialized);
  logAttempt('WEB06', sid(req), raw, isAdmin ? 'admin_access' : 'guest_access');

  if (isAdmin) {
    return res.json({ authenticated: true, role: 'admin', flag: FLAG });
  }

  res.json({ authenticated: true, role: 'user', flag: null });
});

module.exports = router;
