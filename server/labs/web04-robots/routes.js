const express = require('express');
const router  = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG     = process.env.FLAG_ROBOTS || 'ACX{r0b0ts_txt_l34ks_s3cr3ts}';
const PASSCODE = 'NX-2024-INTERNAL';
const INSTANCE_DURATION_SEC = 30 * 60;
const instances = {};

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
function getOrCreate(s) {
  if (!instances[s]) instances[s] = { startedAt: Date.now(), solved: false };
  return instances[s];
}
function resetInst(s) {
  instances[s] = { startedAt: Date.now(), solved: false };
  return instances[s];
}
function instStatus(s) {
  const inst = getOrCreate(s);
  const elapsed = Math.floor((Date.now() - inst.startedAt) / 1000);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - elapsed);
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}

// ── INSTANCE ENDPOINTS ────────────────────────────────────────────
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));

router.post('/instance/restart', (req, res) => {
  resetInst(sid(req));
  logAttempt('ROBOTS', req.ip, 'instance_restart', 'ok');
  res.json({ success: true, ...instStatus(sid(req)) });
});

router.post('/instance/stop', (req, res) => {
  const s = sid(req);
  if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000;
  logAttempt('ROBOTS', req.ip, 'instance_stop', 'ok');
  res.json({ success: true, running: false, remaining_sec: 0 });
});

// ── HOMEPAGE ──────────────────────────────────────────────────────
router.get('/page', (req, res) => {
  const s = sid(req);
  getOrCreate(s);
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NexaCloud — Modern SaaS Platform</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#06080f;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;color:#e2e8f0;}
.nav{background:rgba(6,8,15,0.95);border-bottom:1px solid #0f172a;padding:0 40px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;backdrop-filter:blur(8px);}
.nav-logo{display:flex;align-items:center;gap:10px;}
.nav-logo-icon{width:30px;height:30px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:8px;display:flex;align-items:center;justify-content:center;}
.nav-logo-text{font-size:16px;font-weight:700;color:#f1f5f9;letter-spacing:0.2px;}
.nav-logo-text span{color:#818cf8;}
.nav-links{display:flex;align-items:center;gap:28px;}
.nav-link{font-size:13px;color:#64748b;text-decoration:none;transition:color 0.15s;cursor:pointer;}
.nav-link:hover{color:#e2e8f0;}
.nav-cta{background:#6366f1;color:#fff;border:none;border-radius:7px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;}
.nav-cta:hover{background:#4f46e5;}
.hero{max-width:900px;margin:0 auto;padding:100px 40px 80px;text-align:center;}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:20px;padding:5px 14px;font-size:11px;font-weight:600;color:#818cf8;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:28px;}
.hero-title{font-size:52px;font-weight:800;color:#f1f5f9;line-height:1.1;margin-bottom:20px;letter-spacing:-1px;}
.hero-title span{color:#818cf8;}
.hero-sub{font-size:17px;color:#64748b;line-height:1.8;max-width:560px;margin:0 auto 40px;}
.hero-btns{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;}
.btn-primary{background:#6366f1;color:#fff;border:none;border-radius:9px;padding:13px 28px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:8px;}
.btn-primary:hover{background:#4f46e5;}
.btn-secondary{background:transparent;color:#94a3b8;border:1px solid #1e293b;border-radius:9px;padding:13px 28px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;}
.btn-secondary:hover{border-color:#334155;color:#e2e8f0;}
.features{max-width:1100px;margin:0 auto;padding:60px 40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.feature-card{background:#0d1117;border:1px solid #0f172a;border-radius:12px;padding:24px;}
.feature-icon{width:40px;height:40px;border-radius:10px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.feature-title{font-size:14px;font-weight:700;color:#f1f5f9;margin-bottom:8px;}
.feature-desc{font-size:12.5px;color:#475569;line-height:1.7;}
.footer-bar{border-top:1px solid #0f172a;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;}
.footer-text{font-size:11px;color:#1e293b;}
.footer-links{display:flex;gap:20px;}
.footer-link{font-size:11px;color:#1e293b;text-decoration:none;}
.footer-link:hover{color:#64748b;}
</style>
</head>
<body>
<!-- dev note: vault passcode = ${PASSCODE} -->
<div class="nav">
  <div class="nav-logo">
    <div class="nav-logo-icon">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4.5v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7v-4L8 1.5z" stroke="#fff" stroke-width="1.2"/><path d="M5.5 8l2 2 3-3" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <span class="nav-logo-text">Nexa<span>Cloud</span></span>
  </div>
  <div class="nav-links">
    <a class="nav-link" href="#">Product</a>
    <a class="nav-link" href="#">Pricing</a>
    <a class="nav-link" href="#">Docs</a>
    <a class="nav-link" href="#">Blog</a>
  </div>
  <button class="nav-cta">Get Started</button>
</div>
<div class="hero">
  <div class="hero-badge">
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" fill="#818cf8"/></svg>
    Now in public beta
  </div>
  <h1 class="hero-title">The smarter way to<br><span>scale your product</span></h1>
  <p class="hero-sub">NexaCloud gives engineering teams the infrastructure, observability, and deployment tools they need to ship faster and stay reliable.</p>
  <div class="hero-btns">
    <button class="btn-primary">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 2.5l7 4-7 4V2.5z" fill="#fff"/></svg>
      Start free trial
    </button>
    <button class="btn-secondary">View documentation</button>
  </div>
</div>
<div class="features">
  <div class="feature-card">
    <div class="feature-icon">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="3" stroke="#818cf8" stroke-width="1.2"/><path d="M5 9h8M9 5v8" stroke="#818cf8" stroke-width="1.2" stroke-linecap="round"/></svg>
    </div>
    <div class="feature-title">Instant Deployments</div>
    <div class="feature-desc">Push to deploy in under 30 seconds. Automatic rollbacks on failure with zero downtime.</div>
  </div>
  <div class="feature-card">
    <div class="feature-icon">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="#818cf8" stroke-width="1.2"/><path d="M9 6v3l2 2" stroke="#818cf8" stroke-width="1.2" stroke-linecap="round"/></svg>
    </div>
    <div class="feature-title">Real-time Monitoring</div>
    <div class="feature-desc">Full observability stack built in. Metrics, traces, and logs in one unified dashboard.</div>
  </div>
  <div class="feature-card">
    <div class="feature-icon">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L3 5v4c0 3 2 5.5 6 6.5 4-1 6-3.5 6-6.5V5L9 2z" stroke="#818cf8" stroke-width="1.2"/></svg>
    </div>
    <div class="feature-title">Enterprise Security</div>
    <div class="feature-desc">SOC 2 Type II certified. End-to-end encryption, SSO, and granular access controls.</div>
  </div>
</div>
<div class="footer-bar">
  <span class="footer-text">NexaCloud Inc. 2024. All rights reserved.</span>
  <div class="footer-links">
    <a class="footer-link" href="#">Privacy</a>
    <a class="footer-link" href="#">Terms</a>
    <a class="footer-link" href="#">Security</a>
  </div>
</div>
</body>
</html>`);
});

// ── ROBOTS.TXT ────────────────────────────────────────────────────
router.get('/robots.txt', (req, res) => {
  logAttempt('ROBOTS', req.ip, 'GET /robots.txt', 'accessed');
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Disallow: /admin/
Disallow: /backup/
Disallow: /internal/vault/
Disallow: /staging/
`);
});

// ── DECOY PATHS ───────────────────────────────────────────────────
router.get('/admin/', (req, res) => {
  logAttempt('ROBOTS', req.ip, 'GET /admin/', 'decoy_403');
  res.setHeader('Content-Type', 'text/html');
  res.status(403).send(`<!DOCTYPE html><html><head><title>403 Forbidden</title><style>body{background:#06080f;color:#e2e8f0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:12px;}h1{font-size:28px;font-weight:700;}p{color:#64748b;font-size:14px;}</style></head><body><svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom:8px;"><circle cx="24" cy="24" r="20" stroke="#dc2626" stroke-width="1.5"/><path d="M24 16v8M24 30v2" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg><h1>403 Forbidden</h1><p>You do not have permission to access this resource.</p></body></html>`);
});

router.get('/backup/', (req, res) => {
  logAttempt('ROBOTS', req.ip, 'GET /backup/', 'decoy_404');
  res.setHeader('Content-Type', 'text/html');
  res.status(404).send(`<!DOCTYPE html><html><head><title>404 Not Found</title><style>body{background:#06080f;color:#e2e8f0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:12px;}h1{font-size:28px;font-weight:700;}p{color:#64748b;font-size:14px;}</style></head><body><svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom:8px;"><circle cx="24" cy="24" r="20" stroke="#f59e0b" stroke-width="1.5"/><path d="M16 16l16 16M32 16L16 32" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg><h1>404 Not Found</h1><p>This path has been removed or does not exist.</p></body></html>`);
});

router.get('/staging/', (req, res) => {
  logAttempt('ROBOTS', req.ip, 'GET /staging/', 'decoy_503');
  res.setHeader('Content-Type', 'text/html');
  res.status(503).send(`<!DOCTYPE html><html><head><title>503 Service Unavailable</title><style>body{background:#06080f;color:#e2e8f0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:12px;}h1{font-size:28px;font-weight:700;}p{color:#64748b;font-size:14px;}</style></head><body><svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin-bottom:8px;"><circle cx="24" cy="24" r="20" stroke="#64748b" stroke-width="1.5"/><path d="M24 14v10M24 32v2" stroke="#64748b" stroke-width="2" stroke-linecap="round"/></svg><h1>503 Service Unavailable</h1><p>Staging environment is currently offline.</p></body></html>`);
});

// ── VAULT PAGE ────────────────────────────────────────────────────
router.get('/internal/vault/', (req, res) => {
  logAttempt('ROBOTS', req.ip, 'GET /internal/vault/', 'vault_accessed');
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NexaCloud Internal Vault</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#06080f;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.vault-card{background:#0d1117;border:1px solid #1e293b;border-radius:14px;width:100%;max-width:420px;overflow:hidden;}
.vault-top{background:#0a0f1a;padding:28px 28px 22px;border-bottom:1px solid #0f172a;text-align:center;}
.vault-icon{width:56px;height:56px;border-radius:14px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
.vault-title{font-size:17px;font-weight:700;color:#f1f5f9;margin-bottom:5px;}
.vault-sub{font-size:12px;color:#475569;}
.vault-body{padding:26px 28px;}
label{display:block;font-size:11px;font-weight:600;color:#475569;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:8px;}
input{width:100%;background:#06080f;border:1px solid #1e293b;border-radius:8px;padding:11px 14px;font-size:13px;color:#f1f5f9;outline:none;font-family:'Courier New',monospace;transition:border-color 0.15s;letter-spacing:0.5px;}
input:focus{border-color:#6366f1;}
input::placeholder{color:#1e293b;font-family:'Segoe UI',sans-serif;letter-spacing:0;}
.unlock-btn{width:100%;background:#6366f1;color:#fff;border:none;border-radius:8px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;}
.unlock-btn:hover{background:#4f46e5;}
.unlock-btn:disabled{opacity:0.5;cursor:not-allowed;}
.err-box{display:none;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.18);border-radius:7px;padding:10px 13px;font-size:12px;color:#f87171;margin-bottom:14px;align-items:center;gap:8px;}
.err-box.show{display:flex;}
.flag-box{display:none;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:18px;margin-top:14px;}
.flag-box.show{display:block;}
.flag-label{font-size:10px;font-weight:700;color:#818cf8;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;}
.flag-value{font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#a5b4fc;word-break:break-all;line-height:1.6;}
.notice{font-size:11px;color:#1e293b;text-align:center;margin-top:16px;line-height:1.6;}
</style>
</head>
<body>
<div class="vault-card">
  <div class="vault-top">
    <div class="vault-icon">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="11" width="20" height="13" rx="2.5" stroke="#818cf8" stroke-width="1.4"/><path d="M7 11V8.5a6 6 0 0112 0V11" stroke="#818cf8" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="17.5" r="1.5" fill="#818cf8"/></svg>
    </div>
    <div class="vault-title">NexaCloud Internal Vault</div>
    <div class="vault-sub">Restricted access. Authorized personnel only.</div>
  </div>
  <div class="vault-body">
    <div class="err-box" id="errBox">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#f87171" stroke-width="1"/><path d="M7 4.5v3M7 9.5v.5" stroke="#f87171" stroke-width="1.2" stroke-linecap="round"/></svg>
      <span id="errMsg">Invalid passcode. Access denied.</span>
    </div>
    <label>Vault Passcode</label>
    <input type="text" id="passcodeInput" placeholder="Enter passcode" autocomplete="off" spellcheck="false">
    <button class="unlock-btn" id="unlockBtn" onclick="doUnlock()">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="6" width="10" height="7" rx="1.5" stroke="#fff" stroke-width="1.1"/><path d="M4 6V4.5a3 3 0 016 0V6" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></svg>
      Unlock Vault
    </button>
    <div class="flag-box" id="flagBox">
      <div class="flag-label">Vault Unlocked</div>
      <div class="flag-value" id="flagValue"></div>
    </div>
    <p class="notice">This system is monitored. All access attempts are logged and reviewed.</p>
  </div>
</div>
<script>
async function doUnlock() {
  const btn = document.getElementById('unlockBtn');
  const err = document.getElementById('errBox');
  const passcode = document.getElementById('passcodeInput').value.trim();
  err.classList.remove('show');
  btn.disabled = true;
  try {
    const res = await fetch('/api/lab/robots/vault/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('flagValue').textContent = data.flag;
      document.getElementById('flagBox').classList.add('show');
      btn.style.display = 'none';
    } else {
      document.getElementById('errMsg').textContent = data.error || 'Invalid passcode. Access denied.';
      err.classList.add('show');
      btn.disabled = false;
    }
  } catch(e) {
    document.getElementById('errMsg').textContent = 'Connection error. Please try again.';
    err.classList.add('show');
    btn.disabled = false;
  }
}
document.addEventListener('keydown', e => { if(e.key === 'Enter') doUnlock(); });
</script>
</body>
</html>`);
});

// ── VAULT UNLOCK API ──────────────────────────────────────────────
router.post('/vault/unlock', flagLimiter, (req, res) => {
  const { passcode } = req.body;
  const s = sid(req);
  if (!passcode) return res.status(400).json({ error: 'No passcode provided.' });
  if (passcode.trim() === PASSCODE) {
    logAttempt('ROBOTS', req.ip, 'vault_unlock', 'correct');
    getOrCreate(s).solved = true;
    return res.json({ success: true, flag: FLAG });
  }
  logAttempt('ROBOTS', req.ip, 'vault_unlock:wrong', 'fail');
  res.status(401).json({ success: false, error: 'Invalid passcode. Access denied.' });
});

// ── SUBMIT ────────────────────────────────────────────────────────
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  const s = sid(req);
  if (!flag) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('ROBOTS', req.ip, flag.trim(), correct ? 'correct' : 'wrong');
  if (correct) {
    getOrCreate(s).solved = true;
    return res.json({ success: true, flag: FLAG, message: 'robots.txt should never reveal sensitive internal paths.' });
  }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
