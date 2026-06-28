const express  = require('express');
const router   = express.Router();
const path     = require('path');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG      = process.env.FLAG_PACKET || 'ACX{p4ck3t_d3t3ct1v3_dn5_3xf1l}';
const PCAP_PATH = path.join(__dirname, '../../files/corpx_network.pcap');

// GET /api/lab/packet/page  — target site shown in iframe
router.get('/page', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AlexNet Internal Portal</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#07070f;font-family:'Inter',sans-serif;min-height:100vh;display:flex;flex-direction:column;color:#e8e8f8;}

.topbar{background:#0a0a16;border-bottom:1px solid rgba(56,189,248,0.08);height:56px;display:flex;align-items:center;padding:0 28px;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-mark{width:32px;height:32px;background:#38bdf8;border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(56,189,248,0.5);}
.logo-text{font-size:16px;font-weight:800;color:#ffffff;}
.logo-text span{color:#38bdf8;}
.logo-sub{font-size:11.5px;color:#40406a;font-weight:600;margin-left:4px;}
.topbar-right{margin-left:auto;font-size:12px;color:#40406a;font-weight:600;display:flex;align-items:center;gap:7px;}
.status-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,0.7);}

.main{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 20px;}

.portal-card{
  background:linear-gradient(160deg,#0e0e20 0%,#0a0a16 100%);
  border:1px solid rgba(56,189,248,0.22);
  border-radius:18px;
  width:100%;max-width:480px;
  overflow:hidden;
  box-shadow:0 0 0 1px rgba(56,189,248,0.05), 0 8px 40px rgba(0,0,0,0.7), 0 0 60px rgba(56,189,248,0.07);
  position:relative;
}
.portal-card::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(56,189,248,0.4),transparent);
}

.portal-card-top{padding:28px 28px 22px;border-bottom:1px solid rgba(56,189,248,0.08);}
.portal-icon{
  width:50px;height:50px;
  background:rgba(56,189,248,0.08);
  border:1px solid rgba(56,189,248,0.22);
  border-radius:13px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:18px;
  box-shadow:0 0 18px rgba(56,189,248,0.12);
}
.portal-title{font-size:20px;font-weight:800;color:#ffffff;margin-bottom:8px;letter-spacing:0.1px;}
.portal-sub{font-size:13px;color:#6060a0;line-height:1.75;font-weight:500;}

.portal-body{padding:24px 28px;}

.file-row{
  display:flex;align-items:center;gap:14px;
  background:rgba(56,189,248,0.04);
  border:1px solid rgba(56,189,248,0.14);
  border-radius:12px;
  padding:15px 16px;
  margin-bottom:18px;
  box-shadow:0 0 20px rgba(56,189,248,0.05);
  transition:border-color 0.2s, box-shadow 0.2s;
}
.file-row:hover{border-color:rgba(56,189,248,0.3);box-shadow:0 0 28px rgba(56,189,248,0.1);}

.file-icon-box{
  width:42px;height:42px;
  background:rgba(56,189,248,0.08);
  border:1px solid rgba(56,189,248,0.2);
  border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
  box-shadow:0 0 12px rgba(56,189,248,0.1);
}
.file-meta{flex:1;min-width:0;}
.file-name{font-family:'JetBrains Mono',monospace;font-size:13.5px;font-weight:600;color:#ffffff;margin-bottom:4px;}
.file-size{font-size:11.5px;color:#40406a;font-weight:500;}

.dl-btn{
  display:flex;align-items:center;gap:7px;
  background:#38bdf8;
  color:#07070f;
  border:none;border-radius:9px;
  padding:11px 20px;
  font-size:13px;font-weight:700;
  cursor:pointer;font-family:'Inter',sans-serif;
  white-space:nowrap;flex-shrink:0;
  text-decoration:none;
  box-shadow:0 0 18px rgba(56,189,248,0.35);
  transition:background 0.15s, box-shadow 0.15s;
}
.dl-btn:hover{background:#7dd3fc;box-shadow:0 0 28px rgba(56,189,248,0.55);}

.notice{font-size:12px;color:#40406a;line-height:1.75;display:flex;gap:9px;align-items:flex-start;font-weight:500;}
.notice svg{flex-shrink:0;margin-top:2px;}

.footer{background:#0a0a16;border-top:1px solid rgba(56,189,248,0.06);padding:13px 28px;text-align:center;font-size:11.5px;color:#28284a;font-weight:500;}
</style>
</head>
<body>

<div class="topbar">
  <div class="logo">
    <div class="logo-mark">
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 1010 0A5 5 0 003 8z" stroke="#07070f" stroke-width="1.4"/><path d="M8 5v3l2 2" stroke="#07070f" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <span class="logo-text">Alex<span>Net</span><span class="logo-sub">Internal Portal</span></span>
  </div>
  <div class="topbar-right">
    <div class="status-dot"></div>
    Systems Operational
  </div>
</div>

<div class="main">
  <div class="portal-card">
    <div class="portal-card-top">
      <div class="portal-icon">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 5h16M3 11h10M3 17h6" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="15" r="4" stroke="#38bdf8" stroke-width="1.3"/><path d="M15.5 15h3M17 13.5v3" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round"/></svg>
      </div>
      <div class="portal-title">Network Capture Archive</div>
      <div class="portal-sub">Authorized personnel only. This capture was recorded at the AlexNet egress point and has been flagged for internal review.</div>
    </div>
    <div class="portal-body">
      <div class="file-row">
        <div class="file-icon-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 3h8l4 4v11H4V3z" stroke="#38bdf8" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 3v4h4" stroke="#38bdf8" stroke-width="1.3" stroke-linejoin="round"/><path d="M7 10h6M7 13h6M7 7h3" stroke="#38bdf8" stroke-width="1.1" stroke-linecap="round"/></svg>
        </div>
        <div class="file-meta">
          <div class="file-name">corpx_network.pcap</div>
          <div class="file-size">2.1 KB &nbsp;·&nbsp; 21 packets &nbsp;·&nbsp; 20s capture</div>
        </div>
        <a class="dl-btn" href="/api/lab/packet/download" download="corpx_network.pcap">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3 6.5l3.5 3L10 6.5M2 12h9" stroke="#07070f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Download
        </a>
      </div>
      <div class="notice">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#40406a" stroke-width="1.1"/><path d="M7 5v.4M7 7v3" stroke="#40406a" stroke-width="1.1" stroke-linecap="round"/></svg>
        Open with Wireshark or any compatible packet analyzer. Available free at wireshark.org
      </div>
    </div>
  </div>
</div>

<div class="footer">AlexNet Internal Systems &nbsp;·&nbsp; Authorized Access Only</div>
</body>
</html>
`);
});

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
    note: 'Recorded at the AlexNet egress point. One internal host showed unusual outbound behaviour during this window.'
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
      message: 'Correct. DNS exfiltration tunnels data through subdomain labels, bypassing firewalls that allow DNS but block direct outbound connections.'
    });
  }

  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
