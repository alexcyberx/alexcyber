const express = require('express');
const router  = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG = process.env.FLAG_CAESAR || 'ACX{veni_vidi_vici_shift3}';
const SHIFT = 3;

// Session id, dusre labs jaisa hi resolve hota hai: header > query > ip fallback
function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }

function caesarEncrypt(str, shift) {
  return str.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch === ch.toUpperCase() ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base);
  });
}

// GET /api/lab/caesar/info
router.get('/info', (req, res) => {
  res.json({
    challenge: 'cry-01',
    title: "Caesar's Secret",
    cipher: 'Caesar cipher',
    ciphertext: caesarEncrypt(FLAG, SHIFT)
  });
});

// POST /api/lab/caesar/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('CAESAR', sid(req), flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({ success: true, flag: FLAG, message: 'Correct.' });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
