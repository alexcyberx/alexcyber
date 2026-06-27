const express  = require('express');
const router   = express.Router();
const path     = require('path');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG      = process.env.FLAG_PACKET || 'ACX{p4ck3t_d3t3ct1v3_dn5_3xf1l}';
const PCAP_PATH = path.join(__dirname, '../../files/corpx_network.pcap');

// GET /api/lab/packet/download
router.get('/download', (req, res) => {
  logAttempt('PACKET', req.ip, 'GET /download', 'pcap_downloaded');
  res.download(PCAP_PATH, 'corpx_network.pcap', (err) => {
    if (err) {
      console.error('[PACKET] download error:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'File not found' });
    }
  });
});

// GET /api/lab/packet/info
router.get('/info', (req, res) => {
  res.json({
    filename:     'corpx_network.pcap',
    size_bytes:   2167,
    packet_count: 21,
    duration_sec: 20,
    note: 'A 20 second segment captured at the CorpX network egress point. One machine on the LAN showed unusual outbound DNS behaviour during this window.'
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
      message: 'Correct. DNS exfiltration tunnels data through subdomain labels, one chunk per query. Each label was a Base32 encoded fragment of the flag. Defenders should alert on repeated NXDOMAIN responses to the same unknown domain from a single host.'
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
