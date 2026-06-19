const express  = require('express');
const router   = express.Router();
const path     = require('path');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG = process.env.FLAG_PACKET || 'ACX{dns_3xf1ltr4t10n_d3t3ct3d}';
const PCAP_PATH = path.join(__dirname, '../../files/corpx_segment.pcap');

// GET /api/lab/packet/download — serves the real .pcap file
router.get('/download', (req, res) => {
  logAttempt('PACKET', req.ip, 'GET /download', 'pcap_downloaded');
  res.download(PCAP_PATH, 'corpx_segment.pcap', (err) => {
    if (err) {
      console.error('[PACKET] download error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'File not found' });
    }
  });
});

// GET /api/lab/packet/info — basic capture metadata, no flag content
router.get('/info', (req, res) => {
  res.json({
    filename:      'corpx_segment.pcap',
    size_bytes:    2757,
    packet_count:  22,
    duration_sec:  18.9,
    note: 'A 60 second segment of traffic captured at the CorpX network egress point. Suspicious activity was reported around this timeframe.'
  });
});

// POST /api/lab/packet/submit
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ error: 'No flag provided' });

  const correct = flag.trim() === FLAG;
  logAttempt('PACKET', req.ip, flag.trim(), correct ? 'correct' : 'wrong');

  if (correct) {
    return res.json({
      success: true,
      flag: FLAG,
      message: 'Correct. DNS exfiltration hides in plain sight inside repeated NXDOMAIN queries with changing subdomain labels. Always inspect every unique query name in a capture, not just the ones that resolve.'
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
