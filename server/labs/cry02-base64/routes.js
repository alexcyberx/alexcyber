const express = require('express');
const router  = express.Router();
const path    = require('path');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG      = process.env.FLAG_BASE64 || 'ACX{base64_is_not_encryption}';
const FILE_PATH = path.join(__dirname, '../../files/ns7_telemetry_snapshot.jpg');

// Session id, dusre labs jaisa hi resolve hota hai: header > query > ip fallback
function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }

// GET /api/lab/base64/download
router.get('/download', (req, res) => {
  logAttempt('BASE64', sid(req), 'GET /download', 'file_downloaded');
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
    filename:   'ns7_telemetry_snapshot.jpg',
    size_bytes: 364
  });
});

// POST /api/lab/base64/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('BASE64', sid(req), flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({ success: true, flag: FLAG, message: 'Correct.' });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
