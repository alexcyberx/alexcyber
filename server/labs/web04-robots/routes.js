const express  = require('express');
const router   = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG     = process.env.FLAG_ROBOTS || 'ACX{r0b0ts_txt_l34ks_s3cr3ts}';
const XOR_KEY  = 'c0rpx';
const KEY_HEX  = '6330727078'; // hex of XOR_KEY — hidden in app.js

function xorEncrypt(text, key) {
  return Buffer.from(
    text.split('').map((c, i) => c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  );
}

const ENCRYPTED_FLAG = xorEncrypt(FLAG, XOR_KEY).toString('hex');

// GET /api/lab/robots/robots.txt
router.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Disallow: /admin/
Disallow: /config/
Disallow: /internal/backup/
Disallow: /staging/
Disallow: /tmp/
`);
});

// GET /api/lab/robots/admin/ — decoy, returns 403
router.get('/admin/', (req, res) => {
  res.status(403).json({ error: 'Forbidden', message: 'Access denied.' });
});

// GET /api/lab/robots/config/ — decoy, returns empty JSON
router.get('/config/', (req, res) => {
  res.json({ status: 'ok', version: '2.4.1', maintenance: false });
});

// GET /api/lab/robots/staging/ — decoy, returns 503
router.get('/staging/', (req, res) => {
  res.status(503).json({ error: 'Service unavailable', message: 'Staging environment offline.' });
});

// GET /api/lab/robots/internal/backup/ — real path, directory listing
router.get('/internal/backup/', (req, res) => {
  logAttempt('ROBOTS', req.ip, 'GET /internal/backup/', 'dir_accessed');
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head><title>Index of /internal/backup/</title>
<style>
  body{font-family:monospace;background:#fff;padding:20px;}
  h1{font-size:16px;border-bottom:1px solid #ccc;padding-bottom:8px;}
  table{border-collapse:collapse;width:100%;}
  td{padding:4px 12px;font-size:13px;}
  a{color:#00e;}
  .size{color:#666;}
</style>
</head>
<body>
<h1>Index of /internal/backup/</h1>
<table>
  <tr><td><a href="#">../</a></td><td></td><td class="size"></td></tr>
  <tr><td><a href="/api/lab/robots/internal/backup/system.log">system.log</a></td><td>2024-11-01 03:12</td><td class="size">2.1K</td></tr>
  <tr><td><a href="/api/lab/robots/internal/backup/db_backup_2024.sql.gz">db_backup_2024.sql.gz</a></td><td>2024-11-01 03:12</td><td class="size">841K</td></tr>
  <tr><td><a href="/api/lab/robots/internal/backup/yxjjagl2zq.dat">yxjjagl2zq.dat</a></td><td>2024-11-01 03:14</td><td class="size">58B</td></tr>
</table>
</body>
</html>`);
});

// GET /api/lab/robots/internal/backup/system.log — decoy log file
router.get('/internal/backup/system.log', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`[2024-11-01 03:00:01] INFO  Backup job started
[2024-11-01 03:00:04] INFO  Connecting to database host: db-internal.corpx.local
[2024-11-01 03:00:05] INFO  Database connection established
[2024-11-01 03:10:44] INFO  Dumping tables: users, sessions, posts, config
[2024-11-01 03:11:58] INFO  Compression complete: db_backup_2024.sql.gz (841K)
[2024-11-01 03:12:01] INFO  Writing archive manifest
[2024-11-01 03:14:22] INFO  Backup complete
[2024-11-01 03:14:22] INFO  Cleanup: removing temp files
`);
});

// GET /api/lab/robots/internal/backup/db_backup_2024.sql.gz — decoy, returns 404
router.get('/internal/backup/db_backup_2024.sql.gz', (req, res) => {
  res.status(404).json({ error: 'Not found', message: 'File has been rotated.' });
});

// GET /api/lab/robots/internal/backup/yxjjagl2zq.dat — the real file, XOR encrypted flag
router.get('/internal/backup/yxjjagl2zq.dat', (req, res) => {
  logAttempt('ROBOTS', req.ip, 'GET /internal/backup/yxjjagl2zq.dat', 'file_accessed');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'inline; filename="yxjjagl2zq.dat"');
  // Return hex-encoded encrypted content as plain text — student must decode + decrypt
  res.send(ENCRYPTED_FLAG);
});

// GET /api/lab/robots/static/app.js — XOR key hidden as hex in comment
router.get('/static/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`// CorpX Backup Manager — v1.1.0
// Internal tool — do not expose publicly

(function() {
  'use strict';

  var _bm = {
    api:     '/internal',
    timeout: 8000,
    debug:   false
  };

  // data integrity
  // enc_routine: xor_stream
  // enc_key: 0x${KEY_HEX}
  // output: hex_encoded

  function ping() {
    return fetch(_bm.api + '/backup/').then(r => r.text());
  }

  window._backupMgr = { ping: ping };
})();
`);
});

// POST /api/lab/robots/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  const ip = req.ip;

  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('ROBOTS', ip, flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({
      success: true,
      flag: FLAG,
      message: 'Correct. robots.txt is public — never disallow paths that contain sensitive files.'
    });
  }

  res.status(401).json({
    success: false,
    message: 'Incorrect flag.'
  });
});

module.exports = router;
