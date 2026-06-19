const express  = require('express');
const router   = express.Router();
const path     = require('path');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG     = process.env.FLAG_METADATA || 'ACX{3x1f_d4t4_l34ks_l0c4t10n}';
const IMG_PATH = path.join(__dirname, '../../files/asset_photo.jpg');

// GET /api/lab/metadata/download — serves the real JPEG with embedded EXIF
router.get('/download', (req, res) => {
  logAttempt('METADATA', req.ip, 'GET /download', 'image_downloaded');
  res.download(IMG_PATH, 'asset_photo.jpg', (err) => {
    if (err) {
      console.error('[METADATA] download error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'File not found' });
    }
  });
});

// GET /api/lab/metadata/info
router.get('/info', (req, res) => {
  res.json({
    filename:   'asset_photo.jpg',
    size_bytes: 16789,
    note: 'A photo submitted as part of an IT asset inventory audit. The photo itself shows nothing sensitive, but the file was flagged during a routine metadata review.'
  });
});

// POST /api/lab/metadata/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('METADATA', req.ip, flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({
      success: true,
      flag: FLAG,
      message: 'Correct. EXIF metadata frequently contains far more than camera settings. GPS tags, comments, and software fields are often overlooked during sanitization before files are shared externally.'
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
