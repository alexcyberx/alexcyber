const express = require('express');
const router  = express.Router();
const path    = require('path');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG      = process.env.FLAG_BASE64 || 'ACX{base64_is_not_encryption}';
const FILE_PATH = path.join(__dirname, '../../files/ns7_telemetry_snapshot.jpg');

// GET /api/lab/base64/download
router.get('/download', (req, res) => {
  logAttempt('BASE64', req.ip, 'GET /download', 'file_downloaded');
  res.download(FILE_PATH, 'ns7_telemetry_snapshot.jpg', (err) => {
    if (err) {
      console.error('[BASE64] download error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'File not found' });
    }
  });
});

// GET /api/lab/base64/info
router.get('/info', (req, res) => {
  res.json({
    filename:    'ns7_telemetry_snapshot.jpg',
    size_bytes:  364,
    satellite:   'NS-7 ORION',
    captured:    '2024-11-21T02:44:11Z',
    note:        'Telemetry snapshot exported from NovaSat ground station. File format may not be what it appears.'
  });
});

// POST /api/lab/base64/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('BASE64', req.ip, flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({
      success: true,
      flag: FLAG,
      message: 'Correct. Base64 is an encoding scheme, not encryption. Anyone with the encoded string can instantly decode it. Developers sometimes mistake Base64 for a security measure and store sensitive data like tokens, credentials, or flags in Base64 -- but it offers zero confidentiality. Always use proper encryption for sensitive data.'
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag. Remember: two layers. Decode once to get the telemetry message, then decode the payload inside it.' });
});

module.exports = router;
