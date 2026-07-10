const express = require('express');
const router  = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG = process.env.FLAG_CAESAR || 'ACX{veni_vidi_vici_shift3}';

// GET /api/lab/caesar/info
router.get('/info', (req, res) => {
  res.json({
    challenge: 'cry-01',
    title: "Caesar's Secret",
    cipher: 'Caesar cipher',
    note: 'Intercepted RedCell transmission. Encoded with a classic substitution cipher. Shift value unknown.'
  });
});

// POST /api/lab/caesar/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('CAESAR', req.ip, flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({
      success: true,
      flag: FLAG,
      message: 'Correct. Caesar cipher shifts each letter by a fixed number. Julius Caesar himself used a shift of 3 -- the same shift used here. With only 25 possible shifts, brute force is trivial. Never use Caesar cipher or any single-substitution scheme to protect real data.'
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag. Decode the ciphertext first, then submit what you find inside ACX{...}.' });
});

module.exports = router;
