const express  = require('express');
const router   = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG = process.env.FLAG_METADATA || 'ACX{m3t4_d4t4_1s_3v3rywh3r3}';

const INSTANCE_DURATION_SEC = 30 * 60;
const instances = {};
function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
function getOrCreate(s) { if (!instances[s]) instances[s] = { startedAt: Date.now(), solved: false }; return instances[s]; }
function resetInst(s)   { instances[s] = { startedAt: Date.now(), solved: false }; return instances[s]; }
function instStatus(s)  { const inst = getOrCreate(s); const e = Math.floor((Date.now()-inst.startedAt)/1000); const r = Math.max(0, INSTANCE_DURATION_SEC-e); return { running: r>0, remaining_sec: r, solved: inst.solved }; }
function isInstanceRunning(s) {
  const inst = instances[s];
  if (!inst) return false;
  const e = Math.floor((Date.now() - inst.startedAt) / 1000);
  return (INSTANCE_DURATION_SEC - e) > 0;
}
function sendInstanceNotActive(res) {
  res.status(403).setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Instance Not Active</title>
<style>
  body{background:#0a0a12;color:#e4e4ef;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}
  .box{max-width:420px;padding:32px;}
  h1{font-size:20px;margin:0 0 10px;}
  p{font-size:14px;color:#9999a6;line-height:1.6;}
</style></head>
<body>
  <div class="box">
    <h1>Instance Not Active</h1>
    <p>This lab instance is not running. Go back to the challenge and press Start (or Restart Instance) to begin a fresh session.</p>
  </div>
</body>
</html>`);
}

// ── Build JPEG with embedded EXIF ─────────────────────────────────
function buildExifJpeg(flag) {
  // Split flag into 4 parts: artist=ACX{m3t4  comment=_d4t4_  usercomment=_1s_3v  copyright=3rywh3r3}
  const p1 = flag.slice(0, 8);   // ACX{m3t4
  const p2 = flag.slice(8, 14);  // _d4t4_
  const p3 = flag.slice(14, 20); // _1s_3v
  const p4 = flag.slice(20);     // 3rywh3r3}

  const strings = [
    { tag: 0x010E, val: 'The photographer left more than just pixels behind.' },
    { tag: 0x010F, val: 'CORP-CAM-X1' },
    { tag: 0x0110, val: 'ShadowLens 300' },
    { tag: 0x0131, val: 'PixelDrop Uploader v2.1.4' },
    { tag: 0x013B, val: p1 },   // Artist
    { tag: 0x8298, val: p4 },   // Copyright
    { tag: 0x9C9C, val: p2 },   // XPComment  (Comment)
    { tag: 0x9C98, val: p3 },   // XPAuthor   (UserComment)
    { tag: 0x0132, val: '2024:03:15 03:42:11' },
  ];

  function u16LE(b,o,v){b[o]=v&0xff;b[o+1]=(v>>8)&0xff;}
  function u32LE(b,o,v){b[o]=v&0xff;b[o+1]=(v>>8)&0xff;b[o+2]=(v>>16)&0xff;b[o+3]=(v>>24)&0xff;}

  const n = strings.length;
  const ifd0Off = 8;
  const ifd0Size = 2 + n*12 + 4;
  const strStart = ifd0Off + ifd0Size;

  const strBufs = strings.map(s => Buffer.from(s.val + '\0', 'utf8'));
  const strOffsets = [];
  let cur = strStart;
  strBufs.forEach(b => { strOffsets.push(cur); cur += b.length; });

  const tiff = Buffer.alloc(8 + ifd0Size + (cur - strStart), 0);
  tiff[0]=0x49;tiff[1]=0x49;
  u16LE(tiff,2,0x002A);
  u32LE(tiff,4,8);
  u16LE(tiff,ifd0Off,n);

  strings.forEach((t,i) => {
    const base = ifd0Off + 2 + i*12;
    const len  = strBufs[i].length;
    u16LE(tiff,base,t.tag);
    u16LE(tiff,base+2,2);
    u32LE(tiff,base+4,len);
    if (len<=4) strBufs[i].copy(tiff,base+8);
    else        u32LE(tiff,base+8,strOffsets[i]);
  });
  u32LE(tiff, ifd0Off+2+n*12, 0);

  let sp = strStart;
  strBufs.forEach(b => { b.copy(tiff,sp); sp+=b.length; });

  const app1Data = Buffer.concat([Buffer.from('Exif\0\0'), tiff]);
  const app1Len  = app1Data.length + 2;

  return Buffer.concat([
    Buffer.from([0xFF,0xD8]),
    Buffer.from([0xFF,0xE1,(app1Len>>8)&0xff,app1Len&0xff]),
    app1Data,
    Buffer.from([
      0xFF,0xC0,0x00,0x0B,0x08,0x00,0x01,0x00,0x01,0x01,0x01,0x11,0x00,
      0xFF,0xC4,0x00,0x1F,
      0x00,0x00,0x01,0x05,0x01,0x01,0x01,0x01,0x01,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
      0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,
      0xFF,0xDA,0x00,0x08,0x01,0x01,0x00,0x00,0x3F,0x00,
      0xF8,
      0xFF,0xD9
    ])
  ]);
}

const JPEG_BUF = buildExifJpeg(FLAG);

// ── INSTANCE ENDPOINTS ────────────────────────────────────────────
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));
router.post('/instance/restart', (req, res) => { resetInst(sid(req)); logAttempt('META',req.ip,'restart','ok'); res.json({success:true,...instStatus(sid(req))}); });
router.post('/instance/stop',   (req, res) => { const s=sid(req); if(instances[s]) instances[s].startedAt=Date.now()-(INSTANCE_DURATION_SEC+1)*1000; res.json({success:true,running:false,remaining_sec:0}); });

// ── HOMEPAGE ──────────────────────────────────────────────────────
router.get('/page', (req, res) => {
  if (!isInstanceRunning(sid(req))) return sendInstanceNotActive(res);
  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PixelDrop</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0c0c10;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;color:#e2e8f0;}
.nav{background:#0f0f14;border-bottom:1px solid #1a1a28;padding:0 36px;height:56px;display:flex;align-items:center;justify-content:space-between;}
.logo{display:flex;align-items:center;gap:9px;}
.logo-icon{width:28px;height:28px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:7px;display:flex;align-items:center;justify-content:center;}
.logo-text{font-size:15px;font-weight:700;color:#f1f5f9;}
.logo-text span{color:#a78bfa;}
.nav-right{display:flex;align-items:center;gap:20px;}
.nav-link{font-size:13px;color:#475569;text-decoration:none;cursor:pointer;}
.nav-link:hover{color:#e2e8f0;}
.hero{text-align:center;padding:80px 24px 60px;}
.hero-label{display:inline-flex;align-items:center;gap:6px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);border-radius:20px;padding:4px 14px;font-size:11px;font-weight:600;color:#a78bfa;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:24px;}
.hero-title{font-size:44px;font-weight:800;color:#f1f5f9;line-height:1.1;margin-bottom:14px;letter-spacing:-0.5px;}
.hero-title span{color:#a78bfa;}
.hero-sub{font-size:15px;color:#475569;max-width:480px;margin:0 auto 36px;line-height:1.7;}
.upload-zone{max-width:520px;margin:0 auto;background:#0f0f14;border:2px dashed #1e1e30;border-radius:14px;padding:48px 32px;cursor:pointer;transition:border-color 0.2s;}
.upload-zone:hover{border-color:#7c3aed;}
.upload-icon{width:48px;height:48px;border-radius:12px;background:rgba(124,58,237,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
.upload-title{font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:6px;}
.upload-sub{font-size:12px;color:#334155;}
.or-row{display:flex;align-items:center;gap:14px;max-width:520px;margin:18px auto;}
.or-line{flex:1;height:1px;background:#1a1a28;}
.or-text{font-size:11px;color:#334155;}
.recent-section{max-width:720px;margin:40px auto;padding:0 20px;}
.section-label{font-size:10.5px;font-weight:700;color:#334155;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;}
.file-card{background:#0f0f14;border:1px solid #1a1a28;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:border-color 0.15s;text-decoration:none;}
.file-card:hover{border-color:#7c3aed;}
.file-thumb{width:44px;height:44px;border-radius:8px;background:#1a1a28;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.file-info{flex:1;min-width:0;}
.file-name{font-size:13px;font-weight:600;color:#f1f5f9;margin-bottom:3px;}
.file-meta{font-size:11.5px;color:#334155;}
.file-badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:4px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);color:#a78bfa;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;}
.footer{border-top:1px solid #1a1a28;padding:18px 36px;text-align:center;font-size:11px;color:#1a1a28;margin-top:60px;}
</style>
</head>
<body>
<div class="nav">
  <div class="logo">
    <div class="logo-icon">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 11h10" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg>
    </div>
    <span class="logo-text">Pixel<span>Drop</span></span>
  </div>
  <div class="nav-right">
    <a class="nav-link" href="#">Pricing</a>
    <a class="nav-link" href="#">Docs</a>
  </div>
</div>
<div class="hero">
  <div class="hero-label">
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" fill="#a78bfa"/></svg>
    Fast and anonymous
  </div>
  <h1 class="hero-title">Share files<br><span>instantly</span></h1>
  <p class="hero-sub">Drop any file and get a shareable link in seconds. No account needed. Files expire automatically.</p>
  <div class="upload-zone">
    <div class="upload-icon">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v12M7 7l4-4 4 4" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17h14" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/></svg>
    </div>
    <div class="upload-title">Drag and drop your files here</div>
    <div class="upload-sub">or click to browse. Max 50MB per file.</div>
  </div>
  <div class="or-row"><div class="or-line"></div><span class="or-text">or browse a shared file</span><div class="or-line"></div></div>
</div>
<div class="recent-section">
  <div class="section-label">Recently Shared</div>
  <a class="file-card" href="/api/lab/metadata/share/nx7k2p">
    <div class="file-thumb">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="16" height="18" rx="2" stroke="#7c3aed" stroke-width="1.2"/><circle cx="8.5" cy="8.5" r="2" stroke="#7c3aed" stroke-width="1.1"/><path d="M3 15l4-4 3 3 3-4 5 6" stroke="#7c3aed" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div class="file-info">
      <div class="file-name">asset_photo.jpg</div>
      <div class="file-meta">Shared 2 hours ago — 351 bytes — Image</div>
    </div>
    <span class="file-badge">View</span>
  </a>
</div>
<div class="footer">PixelDrop v2.1.4 — Anonymous file sharing. Files are auto-deleted after 7 days.</div>
</body>
</html>`);
});

// ── SHARE PAGE ────────────────────────────────────────────────────
router.get('/share/nx7k2p', (req, res) => {
  if (!isInstanceRunning(sid(req))) return sendInstanceNotActive(res);
  logAttempt('META', req.ip, 'GET /share', 'accessed');
  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>asset_photo.jpg — PixelDrop</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0c0c10;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;color:#e2e8f0;display:flex;flex-direction:column;}
.nav{background:#0f0f14;border-bottom:1px solid #1a1a28;padding:0 36px;height:56px;display:flex;align-items:center;justify-content:space-between;}
.logo{display:flex;align-items:center;gap:9px;}
.logo-icon{width:28px;height:28px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:7px;display:flex;align-items:center;justify-content:center;}
.logo-text{font-size:15px;font-weight:700;color:#f1f5f9;}
.logo-text span{color:#a78bfa;}
.main{flex:1;max-width:640px;margin:0 auto;padding:48px 20px;}
.breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:#334155;margin-bottom:28px;}
.breadcrumb a{color:#334155;text-decoration:none;}
.breadcrumb a:hover{color:#a78bfa;}
.file-card{background:#0f0f14;border:1px solid #1a1a28;border-radius:14px;overflow:hidden;}
.file-preview{background:#080810;border-bottom:1px solid #1a1a28;padding:48px;display:flex;align-items:center;justify-content:center;}
.file-preview-icon{width:80px;height:80px;border-radius:16px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;}
.file-details{padding:22px 24px;}
.file-title{font-size:16px;font-weight:700;color:#f1f5f9;margin-bottom:10px;}
.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.meta-item{background:#080810;border:1px solid #1a1a28;border-radius:8px;padding:10px 13px;}
.meta-key{font-size:10px;font-weight:600;color:#334155;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:4px;}
.meta-val{font-size:12.5px;color:#94a3b8;font-family:'Courier New',monospace;}
.note-box{background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.12);border-radius:8px;padding:12px 16px;font-size:12px;color:#475569;line-height:1.7;margin-bottom:18px;}
.dl-btn{display:flex;align-items:center;justify-content:center;gap:9px;background:#7c3aed;color:#fff;border:none;border-radius:9px;padding:13px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;width:100%;text-decoration:none;transition:background 0.15s;}
.dl-btn:hover{background:#6d28d9;}
.footer{border-top:1px solid #1a1a28;padding:16px 36px;text-align:center;font-size:11px;color:#1a1a28;}
</style>
</head>
<body>
<div class="nav">
  <div class="logo">
    <div class="logo-icon">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 11h10" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg>
    </div>
    <span class="logo-text">Pixel<span>Drop</span></span>
  </div>
</div>
<div class="main">
  <div class="breadcrumb">
    <a href="/api/lab/metadata/page">Home</a>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#334155" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span>asset_photo.jpg</span>
  </div>
  <div class="file-card">
    <div class="file-preview">
      <div class="file-preview-icon">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="3" width="28" height="30" rx="3" stroke="#a78bfa" stroke-width="1.4"/><circle cx="13" cy="13" r="3.5" stroke="#a78bfa" stroke-width="1.2"/><path d="M4 24l7-7 5 5 5-6 8 9" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <div class="file-details">
      <div class="file-title">asset_photo.jpg</div>
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-key">Type</div><div class="meta-val">image/jpeg</div></div>
        <div class="meta-item"><div class="meta-key">Size</div><div class="meta-val">351 bytes</div></div>
        <div class="meta-item"><div class="meta-key">Shared</div><div class="meta-val">2 hours ago</div></div>
        <div class="meta-item"><div class="meta-key">Expires</div><div class="meta-val">7 days</div></div>
      </div>
      <div class="note-box">
        Submitted as part of an IT asset inventory audit. The image documents a piece of hardware equipment. Uploaded via PixelDrop desktop client.
      </div>
      <a class="dl-btn" href="/api/lab/metadata/download/image" download="asset_photo.jpg">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 11h10" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg>
        Download File
      </a>
    </div>
  </div>
</div>
<div class="footer">PixelDrop v2.1.4</div>
</body>
</html>`);
});

// ── IMAGE DOWNLOAD ────────────────────────────────────────────────
router.get('/download/image', (req, res) => {
  const s = sid(req);
  if (!isInstanceRunning(s)) return res.status(403).send('Instance not active');
  logAttempt('META', req.ip, 'GET /download/image', 'downloaded');
  getOrCreate(s);
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', 'attachment; filename="asset_photo.jpg"');
  res.setHeader('Content-Length', JPEG_BUF.length);
  res.end(JPEG_BUF);
});

// ── SUBMIT ────────────────────────────────────────────────────────
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  const s = sid(req);
  if (!flag) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('META', req.ip, flag.trim(), correct ? 'correct' : 'wrong');
  if (correct) {
    getOrCreate(s).solved = true;
    return res.json({ success: true, flag: FLAG, message: 'EXIF metadata sanitization is often overlooked before sharing files externally.' });
  }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
