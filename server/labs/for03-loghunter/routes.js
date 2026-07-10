const express = require('express');
const router  = express.Router();
const path    = require('path');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG     = process.env.FLAG_LOGHUNTER || 'ACX{45.33.32.156__sqlmap__/admin/config.php}';
const LOG_PATH = path.join(__dirname, '../../files/corpx_access.log');

// GET /api/lab/loghunter/download
router.get('/download', (req, res) => {
  logAttempt('LOGHUNTER', req.ip, 'GET /download', 'log_downloaded');
  res.download(LOG_PATH, 'corpx_access.log', (err) => {
    if (err) {
      console.error('[LOGHUNTER] download error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'File not found' });
    }
  });
});

// GET /api/lab/loghunter/info
router.get('/info', (req, res) => {
  res.json({
    filename:    'corpx_access.log',
    format:      'Apache Combined Log Format',
    lines:       2156,
    date:        '2024-11-08',
    description: 'Access log from the CorpX public-facing web server. Security team flagged unusual activity on this date. One external IP is responsible for the attack traffic.'
  });
});

// POST /api/lab/loghunter/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('LOGHUNTER', req.ip, flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({
      success: true,
      flag: FLAG,
      message: 'Correct. The attacker first ran gobuster to map the server surface, discovered /admin/config.php, then used sqlmap to extract the database. Both tools left distinct User-Agent strings in the log. Defenders can detect this pattern by alerting on known scanner User-Agents and by watching for rapid sequential 404 responses from a single IP.'
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag. Check attacker IP, tool name, and target path. Format: ACX{ip__tool__path}' });
});

module.exports = router;
