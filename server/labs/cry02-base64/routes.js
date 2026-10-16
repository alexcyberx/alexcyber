const express = require('express');
const { flagFor } = require('../flags');
const router  = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG      = flagFor('cry-02'); // server/labs/flags.js

// The "jpg" is a base64 text file: telemetry message whose payload is the flag
// in base64 again (two layers). Built from the flag at start-up.
const MESSAGE = [
  'NOVASAT TELEMETRY ARCHIVE',
  'Satellite: NS-7 ORION',
  'Timestamp: 2024-11-21T02:44:11Z',
  'Operator: ground-ctrl-04',
  '',
  '=== ENCODED PAYLOAD ===',
  Buffer.from(FLAG).toString('base64'),
  '=== END PAYLOAD ===',
  '',
  'NOTE: Payload contains mission-critical data.',
  'Decode before transmission review.',
].join('\n');
const FILE_BUF = Buffer.from(Buffer.from(MESSAGE).toString('base64'));

// Session id, dusre labs jaisa hi resolve hota hai: header > query > ip fallback
function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }

// GET /api/lab/base64/download
router.get('/download', (req, res) => {
  logAttempt('BASE64', sid(req), 'GET /download', 'file_downloaded');
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', 'attachment; filename="ns7_telemetry_snapshot.jpg"');
  res.send(FILE_BUF);
});

// GET /api/lab/base64/info
router.get('/info', (req, res) => {
  res.json({
    filename:   'ns7_telemetry_snapshot.jpg',
    size_bytes: FILE_BUF.length
  });
});

// POST /api/lab/base64/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  // FIX: sirf truthy check tha (`!flag`), agar body mein flag ki jagah
  // object/array/number bheja jaaye toh yeh truthy hi hota aur niche
  // .trim() pe crash ho jaata. Type bhi check karo.
  if (typeof flag !== 'string' || !flag.trim()) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('BASE64', sid(req), flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({ success: true, flag: FLAG, message: 'Correct.' });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
