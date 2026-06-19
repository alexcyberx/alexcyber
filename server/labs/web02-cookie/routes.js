const express   = require('express');
const router    = express.Router();
const crypto    = require('crypto');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');

const FLAG   = process.env.FLAG_COOKIE || 'ACX{c00k13s_4r3_n0t_s3cur3}';
const SECRET = 'corpx2024'; // Weak secret — hidden in portal JS as hex: 636f72707832303234

function makeCookie(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  const sig = crypto.createHash('md5').update(payload + SECRET).digest('hex').substring(0, 8);
  return `${payload}.${sig}`;
}

function verifyCookie(cookie) {
  if (!cookie) return { data: null, err: 'missing' };
  try {
    const lastDot = cookie.lastIndexOf('.');
    if (lastDot === -1) return { data: null, err: 'malformed' };
    const payload = cookie.substring(0, lastDot);
    const sig     = cookie.substring(lastDot + 1);
    const expected = crypto.createHash('md5').update(payload + SECRET).digest('hex').substring(0, 8);
    if (sig !== expected) return { data: null, err: 'invalid_signature' };
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return { data, err: null };
  } catch (e) {
    return { data: null, err: 'malformed' };
  }
}

// GET /api/lab/cookie/page — login page HTML
router.get('/page', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CorpX — Staff Login</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#1a1a2e;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}
  .box{background:#fff;border-radius:8px;padding:40px;width:340px;}
  h2{color:#1a1a2e;font-size:20px;margin-bottom:24px;text-align:center;}
  label{font-size:12px;color:#4a5568;font-weight:600;display:block;margin-bottom:4px;}
  input{width:100%;border:1px solid #e2e8f0;border-radius:4px;padding:9px 12px;font-size:13px;margin-bottom:14px;outline:none;}
  input:focus{border-color:#3b82f6;}
  button{width:100%;background:#1a1a2e;color:#fff;border:none;border-radius:4px;padding:10px;font-size:14px;cursor:pointer;}
  button:hover{background:#16213e;}
  .note{font-size:11px;color:#a0aec0;text-align:center;margin-top:14px;}
</style>
</head>
<body>
<div class="box">
  <h2>CorpX Staff Portal</h2>
  <form id="loginForm">
    <label>Username</label>
    <input type="text" id="username" value="john" />
    <label>Password</label>
    <input type="password" id="password" value="password123" />
    <button type="submit">Login</button>
  </form>
  <p class="note">Internal use only. Unauthorized access is prohibited.</p>
</div>
<script>
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const res = await fetch('/api/lab/cookie/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    })
  });
  const data = await res.json();
  if (data.cookie) {
    document.cookie = 'session=' + data.cookie + '; path=/';
    window.location.href = '/api/lab/cookie/dashboard';
  } else {
    alert('Login failed: ' + (data.error || 'unknown error'));
  }
});
</script>
</body>
</html>`);
});

// POST /api/lab/cookie/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = {
    john:  { password: 'password123', role: 'user'  },
    admin: { password: 'adm1n$ecret', role: 'admin' }
  };

  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const cookie = makeCookie({ user: username, role: user.role, exp: 9999999999 });
  logAttempt('COOKIE', req.ip, `login:${username}`, 'ok');

  res.json({
    success: true,
    cookie,
    message: `Welcome ${username}. Session created.`,
    // Intentional info leak
    debug: {
      cookie_format: 'base64(json).md5sig',
      your_role: user.role
    }
  });
});

// GET /api/lab/cookie/dashboard
router.get('/dashboard', (req, res) => {
  const cookieHeader = req.headers.cookie || '';
  const sessionMatch = cookieHeader.match(/session=([^;]+)/);
  const rawCookie = sessionMatch ? sessionMatch[1] : null;

  const { data, err } = verifyCookie(rawCookie);

  if (err || !data) {
    return res.setHeader('Content-Type', 'text/html') && res.status(401).send(`<!DOCTYPE html>
<html><head><title>CorpX</title><style>body{background:#1a1a2e;color:#fff;font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head>
<body><div style="text-align:center"><h2>Session Invalid</h2><p style="color:#a0aec0;margin-top:8px;">Error: ${err}. Please login again.</p><a href="/api/lab/cookie/page" style="color:#60a5fa;display:block;margin-top:16px;">Back to Login</a></div></body></html>`);
  }

  const isAdmin = data.role === 'admin';

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CorpX — Dashboard</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f5f5f5;font-family:Arial,sans-serif;}
  header{background:#1a1a2e;color:#fff;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;}
  header h1{font-size:18px;}
  .role-badge{font-size:11px;padding:3px 10px;border-radius:10px;background:${isAdmin ? '#22c55e' : '#3b82f6'};color:#fff;font-weight:600;}
  .main{padding:32px;}
  .welcome{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin-bottom:20px;}
  .welcome h2{font-size:18px;color:#1a1a2e;margin-bottom:6px;}
  .welcome p{font-size:13px;color:#718096;}
  .admin-panel{background:#fff;border:2px solid #22c55e;border-radius:8px;padding:24px;}
  .admin-panel h3{color:#15803d;font-size:16px;margin-bottom:12px;}
  .flag-reveal{background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:16px;font-family:monospace;font-size:14px;color:#15803d;font-weight:700;margin-top:12px;}
  .locked{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;text-align:center;}
  .locked h3{color:#4a5568;font-size:15px;margin-bottom:8px;}
  .locked p{font-size:12px;color:#a0aec0;}
  .lock-icon{font-size:32px;margin-bottom:12px;}
</style>
</head>
<body>
<header>
  <h1>CorpX Dashboard</h1>
  <div style="display:flex;align-items:center;gap:12px;">
    <span style="font-size:13px;color:#94a3b8;">Logged in as <strong style="color:#fff">${data.user}</strong></span>
    <span class="role-badge">${data.role.toUpperCase()}</span>
  </div>
</header>
<div class="main">
  <div class="welcome">
    <h2>Welcome, ${data.user}</h2>
    <p>Your current access level is <strong>${data.role}</strong>. ${isAdmin ? 'You have full administrative access.' : 'Standard user access only. Admin panel is restricted.'}</p>
  </div>
  ${isAdmin ? `
  <div class="admin-panel">
    <h3>Admin Panel — Restricted Access</h3>
    <p style="font-size:13px;color:#4a5568;margin-bottom:8px;">Internal system credentials and audit logs.</p>
    <div class="flag-reveal">${FLAG}</div>
  </div>` : `
  <div class="locked">
    <div class="lock-icon">&#128274;</div>
    <h3>Admin Panel</h3>
    <p>This section is restricted to administrators only.<br>Your current role does not have access.</p>
  </div>`}
</div>
</body>
</html>`);
});

// GET /api/lab/cookie/static/app.js
// Weak secret hidden as hex in a JS comment
router.get('/static/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`// CorpX Portal App — v1.3.0
// Build: 2024-11-12

(function() {
  'use strict';

  var CONFIG = {
    api_base:    '/api',
    timeout:     5000,
    retry_count: 3
  };

  // session integrity check
  // sig_key: 0x${SECRET.split('').map(c => c.charCodeAt(0).toString(16)).join('')}
  // algo: md5(payload+key)[0:8]

  function checkSession() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.startsWith('session=')) return c.substring(8);
    }
    return null;
  }

  window._corpx = { checkSession: checkSession, cfg: CONFIG };
})();
`);
});

module.exports = router;
