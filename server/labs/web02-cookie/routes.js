const express  = require('express');
const router   = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG = process.env.FLAG_COOKIE || 'ACX{c00k13s_4r3_n0t_s3cur3}';
const INSTANCE_DURATION_SEC = 30 * 60;
const instances = {};

function getOrCreate(sid) {
  if (!instances[sid]) instances[sid] = { startedAt: Date.now(), solved: false };
  return instances[sid];
}
function resetInst(sid) {
  instances[sid] = { startedAt: Date.now(), solved: false };
  return instances[sid];
}
function instStatus(sid) {
  const inst = getOrCreate(sid);
  const elapsed = Math.floor((Date.now() - inst.startedAt) / 1000);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - elapsed);
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}
function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }

function isInstanceRunning(s) {
  const inst = instances[s];
  if (!inst) return false;
  const elapsed = Math.floor((Date.now() - inst.startedAt) / 1000);
  return (INSTANCE_DURATION_SEC - elapsed) > 0;
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

// ── INSTANCE ENDPOINTS ──────────────────────────────────────────
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));

router.post('/instance/restart', (req, res) => {
  resetInst(sid(req));
  logAttempt('COOKIE', req.ip, 'instance_restart', 'ok');
  res.json({ success: true, ...instStatus(sid(req)) });
});

router.post('/instance/stop', (req, res) => {
  const s = sid(req);
  if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000;
  logAttempt('COOKIE', req.ip, 'instance_stop', 'ok');
  res.json({ success: true, running: false, remaining_sec: 0 });
});

// ── COOKIE HELPERS ───────────────────────────────────────────────
// session_token = base64({"user":"employee","lvl":1})   → tamper to admin + lvl 3
// access_lvl    = "1"                                    → tamper to "3"
// user_pref     = base64("theme=dark&lang=en")          → red herring

function makeSessionToken(user, lvl) {
  return Buffer.from(JSON.stringify({ user, lvl })).toString('base64');
}

function parseSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (e) { return null; }
}

// ── LOGIN PAGE ───────────────────────────────────────────────────
router.get('/page', (req, res) => {
  const s = sid(req);
  if (!isInstanceRunning(s)) return sendInstanceNotActive(res);
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NovaCorp Employee Portal</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;flex-direction:column;}
.topbar{background:#161b27;border-bottom:1px solid #1e2535;padding:0 32px;height:52px;display:flex;align-items:center;justify-content:space-between;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-icon{width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:6px;display:flex;align-items:center;justify-content:center;}
.logo-text{font-size:15px;font-weight:700;color:#f1f5f9;letter-spacing:0.3px;}
.logo-sub{font-size:11px;color:#64748b;margin-left:4px;font-weight:400;}
.secure-badge{font-size:10px;font-weight:700;letter-spacing:0.8px;color:#22c55e;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);padding:3px 9px;border-radius:4px;text-transform:uppercase;}
.main{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 20px;}
.login-card{background:#161b27;border:1px solid #1e2535;border-radius:12px;width:100%;max-width:400px;overflow:hidden;}
.card-header{background:#1a2033;padding:24px 28px 20px;border-bottom:1px solid #1e2535;}
.card-title{font-size:18px;font-weight:700;color:#f1f5f9;margin-bottom:4px;}
.card-sub{font-size:12px;color:#64748b;}
.card-body{padding:24px 28px;}
.form-group{margin-bottom:16px;}
label{display:block;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:7px;}
input{width:100%;background:#0f1117;border:1px solid #1e2535;border-radius:7px;padding:10px 13px;font-size:13px;color:#f1f5f9;outline:none;font-family:inherit;transition:border-color 0.15s;}
input:focus{border-color:#3b82f6;}
input::placeholder{color:#374151;}
.login-btn{width:100%;background:#3b82f6;color:#fff;border:none;border-radius:7px;padding:11px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;margin-top:4px;}
.login-btn:hover{background:#2563eb;}
.login-btn:disabled{opacity:0.5;cursor:not-allowed;}
.notice{font-size:11px;color:#374151;text-align:center;margin-top:16px;line-height:1.6;}
.err-box{display:none;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:7px;padding:10px 13px;font-size:12px;color:#f87171;margin-bottom:14px;}
.footer{background:#161b27;border-top:1px solid #1e2535;padding:12px 32px;text-align:center;font-size:11px;color:#374151;}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo">
    <div class="logo-icon">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#fff" stroke-width="1.2"/><path d="M4.5 6V4a2.5 2.5 0 015 0v2" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>
    </div>
    <span class="logo-text">NovaCorp<span class="logo-sub">Employee Portal</span></span>
  </div>
  <span class="secure-badge">Secure</span>
</div>
<div class="main">
  <div class="login-card">
    <div class="card-header">
      <div class="card-title">Employee Sign In</div>
      <div class="card-sub">Access your NovaCorp workspace</div>
    </div>
    <div class="card-body">
      <div class="err-box" id="errBox"></div>
      <div class="form-group">
        <label>Employee ID</label>
        <input type="text" id="uname" value="employee" placeholder="Enter employee ID" autocomplete="off">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="pass" value="nova123" placeholder="Enter password">
      </div>
      <button class="login-btn" id="loginBtn" onclick="doLogin()">Sign In</button>
      <p class="notice">Authorized personnel only. All activity is monitored and logged.</p>
    </div>
  </div>
</div>
<div class="footer">NovaCorp Systems v3.1.0 — Unauthorized access is strictly prohibited</div>
<script>
const LAB_SESSION = ${JSON.stringify(s)};
async function doLogin() {
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('errBox');
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  err.style.display = 'none';
  try {
    const res = await fetch('/api/lab/cookie/login?session=' + encodeURIComponent(LAB_SESSION), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: document.getElementById('uname').value, password: document.getElementById('pass').value })
    });
    const data = await res.json();
    if (data.success) {
      document.cookie = 'session_token=' + data.session_token + '; path=/';
      document.cookie = 'access_lvl=' + data.access_lvl + '; path=/';
      document.cookie = 'user_pref=' + data.user_pref + '; path=/';
      window.location.href = '/api/lab/cookie/dashboard?session=' + encodeURIComponent(LAB_SESSION);
    } else {
      err.textContent = data.error || 'Login failed. Please try again.';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  } catch(e) {
    err.textContent = 'Connection error. Please try again.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}
document.addEventListener('keydown', function(e){ if(e.key === 'Enter') doLogin(); });
</script>
</body>
</html>`);
});

// ── LOGIN API ────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  if (!isInstanceRunning(sid(req))) return res.status(403).json({ error: 'Instance not active' });
  const { username, password } = req.body;
  if (username === 'employee' && password === 'nova123') {
    logAttempt('COOKIE', req.ip, 'login:employee', 'ok');
    return res.json({
      success: true,
      session_token: makeSessionToken('employee', 1),   // base64({"user":"employee","lvl":1})
      access_lvl: '1',
      user_pref: Buffer.from('theme=dark&lang=en').toString('base64'), // red herring
    });
  }
  logAttempt('COOKIE', req.ip, `login:${username}`, 'fail');
  res.status(401).json({ error: 'Invalid credentials' });
});

// ── DASHBOARD ────────────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  if (!isInstanceRunning(sid(req))) return sendInstanceNotActive(res);
  const cookieHeader = req.headers.cookie || '';
  const get = (name) => { const m = cookieHeader.match(new RegExp(name + '=([^;]+)')); return m ? m[1] : null; };

  const rawToken = get('session_token');
  const rawLvl   = get('access_lvl');

  const tokenData = rawToken ? parseSessionToken(rawToken) : null;
  const isAdmin   = tokenData && tokenData.user === 'admin' && Number(tokenData.lvl) === 3 && rawLvl === '3';
  const isLoggedIn = !!tokenData;

  const userName = tokenData?.user || 'unknown';
  const lvl      = tokenData?.lvl || 0;

  if (!isLoggedIn) {
    return res.status(401).setHeader('Content-Type', 'text/html') && res.send(`<!DOCTYPE html>
<html><head><title>NovaCorp</title><style>body{background:#0f1117;color:#f1f5f9;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head>
<body><div style="text-align:center"><p style="color:#64748b;margin-bottom:16px;">Session not found. Please log in.</p><a href="/api/lab/cookie/page" style="color:#3b82f6;">Back to Login</a></div></body></html>`);
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NovaCorp Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;}
.topbar{background:#161b27;border-bottom:1px solid #1e2535;padding:0 32px;height:52px;display:flex;align-items:center;justify-content:space-between;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-icon{width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:6px;display:flex;align-items:center;justify-content:center;}
.logo-text{font-size:15px;font-weight:700;color:#f1f5f9;}
.user-row{display:flex;align-items:center;gap:10px;}
.user-name{font-size:12px;color:#94a3b8;}
.role-chip{font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;background:${isAdmin ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)'};color:${isAdmin ? '#22c55e' : '#60a5fa'};border:1px solid ${isAdmin ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'};}
.main{max-width:900px;margin:0 auto;padding:32px 24px;}
.welcome-card{background:#161b27;border:1px solid #1e2535;border-radius:10px;padding:24px;margin-bottom:20px;}
.welcome-title{font-size:17px;font-weight:700;color:#f1f5f9;margin-bottom:6px;}
.welcome-sub{font-size:13px;color:#64748b;line-height:1.6;}
.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
.info-card{background:#161b27;border:1px solid #1e2535;border-radius:10px;padding:16px;}
.info-label{font-size:10px;font-weight:600;color:#64748b;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;}
.info-val{font-size:14px;font-weight:700;color:#f1f5f9;font-family:'Courier New',monospace;}
.info-val.dim{color:#64748b;}
.clearance-bar{background:#161b27;border:1px solid #1e2535;border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;}
.clearance-label{font-size:11px;font-weight:600;color:#64748b;letter-spacing:0.8px;text-transform:uppercase;}
.clearance-val{font-size:13px;font-weight:700;color:${Number(lvl) >= 3 ? '#22c55e' : '#f59e0b'};font-family:'Courier New',monospace;}
.admin-section{background:#161b27;border:2px solid ${isAdmin ? '#22c55e' : '#1e2535'};border-radius:10px;overflow:hidden;}
.admin-header{padding:16px 20px;border-bottom:1px solid ${isAdmin ? 'rgba(34,197,94,0.2)' : '#1e2535'};display:flex;align-items:center;gap:10px;}
.admin-title{font-size:13px;font-weight:700;color:${isAdmin ? '#22c55e' : '#94a3b8'};letter-spacing:0.3px;}
.admin-body{padding:20px;}
.lock-box{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;gap:12px;}
.lock-title{font-size:14px;font-weight:600;color:#94a3b8;}
.lock-sub{font-size:12px;color:#374151;line-height:1.6;max-width:300px;}
.deny-msg{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:7px;padding:12px 16px;font-size:12px;color:#f87171;font-family:'Courier New',monospace;margin-bottom:14px;}
.flag-box{background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:7px;padding:16px;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#22c55e;letter-spacing:0.5px;word-break:break-all;}
.flag-label{font-size:10px;font-weight:600;color:#16a34a;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:8px;}
footer{border-top:1px solid #1e2535;padding:14px 32px;text-align:center;font-size:11px;color:#1e2535;margin-top:40px;}
@media(max-width:600px){.info-grid{grid-template-columns:1fr 1fr;}.clearance-bar{flex-direction:column;align-items:flex-start;gap:6px;}}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo">
    <div class="logo-icon">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#fff" stroke-width="1.2"/><path d="M4.5 6V4a2.5 2.5 0 015 0v2" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>
    </div>
    <span class="logo-text">NovaCorp</span>
  </div>
  <div class="user-row">
    <span class="user-name">${userName}</span>
    <span class="role-chip">${isAdmin ? 'Admin' : 'Employee'}</span>
  </div>
</div>
<div class="main">
  <div class="welcome-card">
    <div class="welcome-title">Welcome back, ${userName}</div>
    <div class="welcome-sub">NovaCorp Employee Portal v3.1.0. Your session is active. All access attempts are logged and monitored by the security team.</div>
  </div>
  <div class="info-grid">
    <div class="info-card">
      <div class="info-label">User</div>
      <div class="info-val">${userName}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Clearance</div>
      <div class="info-val">LEVEL-${lvl}</div>
    </div>
    <div class="info-card">
      <div class="info-label">Access Level</div>
      <div class="info-val ${Number(rawLvl) < 3 ? 'dim' : ''}">${rawLvl || '?'}</div>
    </div>
  </div>
  <div class="clearance-bar">
    <span class="clearance-label">Security Clearance</span>
    <span class="clearance-val">LEVEL-${Number(lvl) >= 3 ? '3 (ADMIN)' : lvl + ' (STANDARD)'}</span>
  </div>
  <div class="admin-section">
    <div class="admin-header">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="${isAdmin ? '#22c55e' : '#64748b'}" stroke-width="1.2"/><path d="M4.5 6V4a2.5 2.5 0 015 0v2" stroke="${isAdmin ? '#22c55e' : '#64748b'}" stroke-width="1.2" stroke-linecap="round"/></svg>
      <span class="admin-title">Admin Control Panel</span>
    </div>
    <div class="admin-body">
      ${isAdmin ? `
      <div class="flag-label">Access Granted</div>
      <div class="flag-box">${FLAG}</div>
      ` : `
      <div class="lock-box">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="5" y="14" width="22" height="15" rx="3" stroke="#374151" stroke-width="1.6"/><path d="M10 14v-4a6 6 0 0112 0v4" stroke="#374151" stroke-width="1.6" stroke-linecap="round"/></svg>
        <div class="lock-title">Restricted Access</div>
        ${(tokenData && (tokenData.user === 'admin' || Number(tokenData.lvl) === 3) || rawLvl === '3') ? `<div class="deny-msg">SECURITY ALERT: Token mismatch detected. Incident has been logged.</div>` : ''}
        <div class="lock-sub">This panel requires full administrative clearance. Your current credentials do not meet the required security level.</div>
      </div>
      `}
    </div>
  </div>
</div>
<footer>NovaCorp Systems v3.1.0</footer>
</body>
</html>`);
});

// ── SUBMIT ───────────────────────────────────────────────────────
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body;
  const s = sid(req);
  if (!flag) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('COOKIE', req.ip, flag.trim(), correct ? 'correct' : 'wrong');
  if (correct) {
    getOrCreate(s).solved = true;
    return res.json({ success: true, flag: FLAG, message: 'Session cookies trusted blindly. Classic auth bypass.' });
  }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

router._instances = instances;

module.exports = router;
