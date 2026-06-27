const express = require('express');
const router  = express.Router();
const { flagLimiter }  = require('../../middleware/rateLimit');
const { logAttempt }   = require('../../middleware/logger');

const FLAG = process.env.FLAG_SQLI101 || 'ACX{un10n_s3l3ct_g0t_m3}';
const INSTANCE_DURATION_SEC = 30 * 60;
const instances = {};

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }

// sql.js lazy init — shared SQL engine, per-instance in-memory DB
let _SQL = null;
async function getSqlJs() {
  if (_SQL) return _SQL;
  _SQL = await require('sql.js')();
  return _SQL;
}

function buildDb(SQL) {
  const db = new SQL.Database();
  db.run(`
    CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT);
    INSERT INTO employees VALUES (1,'Alice Chen','Engineering');
    INSERT INTO employees VALUES (2,'Bob Martinez','Finance');
    INSERT INTO employees VALUES (3,'Carol Singh','Operations');
    INSERT INTO employees VALUES (4,'David Park','Security');
    INSERT INTO employees VALUES (5,'Eva Russo','Executive');

    CREATE TABLE vault_secrets (id INTEGER PRIMARY KEY, secret_key TEXT, data TEXT);
    INSERT INTO vault_secrets VALUES (1,'internal_build','vb-core-2024.11.3-internal');
    INSERT INTO vault_secrets VALUES (2,'db_version','SQLite 3.43.2');
    INSERT INTO vault_secrets VALUES (3,'flag','${FLAG}');
    INSERT INTO vault_secrets VALUES (4,'backup_token','bkp_xK92mNv7pQ4rL');
  `);
  return db;
}

async function getOrCreate(s) {
  if (!instances[s]) {
    const SQL = await getSqlJs();
    instances[s] = { startedAt: Date.now(), solved: false, db: buildDb(SQL) };
  }
  return instances[s];
}

async function resetInst(s) {
  if (instances[s]?.db) { try { instances[s].db.close(); } catch(e){} }
  const SQL = await getSqlJs();
  instances[s] = { startedAt: Date.now(), solved: false, db: buildDb(SQL) };
  return instances[s];
}

function instStatus(inst) {
  const elapsed = Math.floor((Date.now() - inst.startedAt) / 1000);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - elapsed);
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}

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

// ── INSTANCE ENDPOINTS ────────────────────────────────────────────
router.get('/instance/status', async (req, res) => {
  const inst = await getOrCreate(sid(req));
  res.json(instStatus(inst));
});

router.post('/instance/restart', async (req, res) => {
  const inst = await resetInst(sid(req));
  logAttempt('SQLI101', req.ip, 'instance_restart', 'ok');
  res.json({ success: true, ...instStatus(inst) });
});

router.post('/instance/stop', async (req, res) => {
  const s = sid(req);
  if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000;
  logAttempt('SQLI101', req.ip, 'instance_stop', 'ok');
  res.json({ success: true, running: false, remaining_sec: 0 });
});

// ── LOGIN PAGE ─────────────────────────────────────────────────────
router.get('/page', async (req, res) => {
  const s = sid(req);
  if (!isInstanceRunning(s)) return sendInstanceNotActive(res);
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VaultBank Employee Portal</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;flex-direction:column;}
.topbar{background:#0d1424;border-bottom:1px solid #1a2340;padding:0 32px;height:54px;display:flex;align-items:center;justify-content:space-between;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-icon{width:32px;height:32px;background:linear-gradient(135deg,#1a6b3c,#0d4a28);border-radius:8px;display:flex;align-items:center;justify-content:center;border:1px solid #1e7a42;}
.logo-text{font-size:16px;font-weight:700;color:#e8f0fe;letter-spacing:0.3px;}
.logo-text span{color:#22c55e;}
.secure-row{display:flex;align-items:center;gap:6px;font-size:11px;color:#4ade80;}
.main{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 20px;}
.login-card{background:#0d1424;border:1px solid #1a2340;border-radius:14px;width:100%;max-width:420px;overflow:hidden;}
.card-top{background:#0a1428;padding:28px 30px 22px;border-bottom:1px solid #1a2340;text-align:center;}
.bank-seal{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1a6b3c,#0d4a28);border:2px solid #22c55e;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}
.card-title{font-size:17px;font-weight:700;color:#e8f0fe;margin-bottom:4px;}
.card-sub{font-size:12px;color:#4a5a7a;}
.card-body{padding:26px 30px;}
.form-group{margin-bottom:18px;}
label{display:block;font-size:11px;font-weight:600;color:#6b7fa3;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:7px;}
input{width:100%;background:#080e1c;border:1px solid #1a2340;border-radius:8px;padding:11px 14px;font-size:13px;color:#e8f0fe;outline:none;font-family:inherit;transition:border-color 0.15s;}
input:focus{border-color:#22c55e;}
input::placeholder{color:#2a3555;}
.login-btn{width:100%;background:#1a6b3c;color:#fff;border:none;border-radius:8px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px;}
.login-btn:hover{background:#15803d;}
.login-btn:disabled{opacity:0.5;cursor:not-allowed;}
.notice{font-size:11px;color:#2a3555;text-align:center;margin-top:16px;line-height:1.6;}
.err-box{display:none;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.18);border-radius:8px;padding:10px 13px;font-size:12px;color:#f87171;margin-bottom:14px;}
.footer{background:#0d1424;border-top:1px solid #1a2340;padding:12px 32px;text-align:center;font-size:11px;color:#2a3555;}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo">
    <div class="logo-icon">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="8" width="14" height="9" rx="1.5" stroke="#22c55e" stroke-width="1.3"/><path d="M5 8V6a4 4 0 018 0v2" stroke="#22c55e" stroke-width="1.3" stroke-linecap="round"/><circle cx="9" cy="12.5" r="1" fill="#22c55e"/></svg>
    </div>
    <span class="logo-text">Vault<span>Bank</span></span>
  </div>
  <div class="secure-row">
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1L2 2.5v3c0 2.2 1.5 4 3.5 4.5C7.5 9.5 9 7.7 9 5.5v-3L5.5 1z" stroke="#4ade80" stroke-width="1"/></svg>
    256-bit encrypted
  </div>
</div>
<div class="main">
  <div class="login-card">
    <div class="card-top">
      <div class="bank-seal">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v4c0 5 3.6 9.7 9 11 5.4-1.3 9-6 9-11V7L12 2z" stroke="#22c55e" stroke-width="1.4"/><path d="M9 12l2 2 4-4" stroke="#22c55e" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="card-title">Employee Secure Login</div>
      <div class="card-sub">VaultBank Internal Systems v4.2.1</div>
    </div>
    <div class="card-body">
      <div class="err-box" id="errBox"></div>
      <div class="form-group">
        <label>Employee ID</label>
        <input type="text" id="uname" value="john" placeholder="Enter employee ID" autocomplete="off">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="pass" value="pass123" placeholder="Enter password">
      </div>
      <button class="login-btn" id="loginBtn" onclick="doLogin()">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="5" width="11" height="7" rx="1.5" stroke="#fff" stroke-width="1.1"/><path d="M4 5V4a2.5 2.5 0 015 0v1" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></svg>
        Secure Login
      </button>
      <p class="notice">Authorized personnel only. All access attempts are monitored and logged by the VaultBank Security Operations Center.</p>
    </div>
  </div>
</div>
<div class="footer">VaultBank Employee Portal v4.2.1 — Unauthorized access is strictly prohibited</div>
<script>
const LAB_SESSION = ${JSON.stringify(s)};
async function doLogin() {
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('errBox');
  btn.disabled = true;
  err.style.display = 'none';
  try {
    const res = await fetch('/api/lab/sqli101/login?session=' + encodeURIComponent(LAB_SESSION), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: document.getElementById('uname').value, password: document.getElementById('pass').value })
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = '/api/lab/sqli101/dashboard?session=' + encodeURIComponent(LAB_SESSION);
    } else {
      err.innerHTML = data.error || 'Login failed.';
      err.style.display = 'block';
      btn.disabled = false;
    }
  } catch(e) {
    err.textContent = 'Connection error. Please try again.';
    err.style.display = 'block';
    btn.disabled = false;
  }
}
document.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
</script>
</body>
</html>`);
});

// ── LOGIN API ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const s = sid(req);
  if (!isInstanceRunning(s)) return res.status(403).json({ error: 'Instance not active' });
  if (username === 'john' && password === 'pass123') {
    logAttempt('SQLI101', req.ip, 'login:john', 'ok');
    return res.json({ success: true, labSession: s });
  }
  logAttempt('SQLI101', req.ip, `login:${username}`, 'fail');
  res.status(401).json({ success: false, error: 'Invalid credentials. Access denied.' });
});

// ── DASHBOARD ──────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  const s = sid(req);
  if (!isInstanceRunning(s)) return sendInstanceNotActive(res);
  await getOrCreate(s);
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VaultBank Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;}
.topbar{background:#0d1424;border-bottom:1px solid #1a2340;padding:0 28px;height:54px;display:flex;align-items:center;justify-content:space-between;}
.logo{display:flex;align-items:center;gap:9px;}
.logo-icon{width:28px;height:28px;background:#1a6b3c;border-radius:7px;display:flex;align-items:center;justify-content:center;}
.logo-text{font-size:15px;font-weight:700;color:#e8f0fe;}
.logo-text span{color:#22c55e;}
.user-row{display:flex;align-items:center;gap:10px;}
.user-chip{font-size:11px;color:#6b7fa3;background:#080e1c;border:1px solid #1a2340;padding:4px 12px;border-radius:6px;}
.main{max-width:900px;margin:0 auto;padding:28px 20px;}
.section-title{font-size:11px;font-weight:700;color:#4a5a7a;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;}
.search-card{background:#0d1424;border:1px solid #1a2340;border-radius:12px;padding:20px;margin-bottom:20px;}
.search-row{display:flex;gap:10px;}
.search-input{flex:1;background:#080e1c;border:1px solid #1a2340;border-radius:8px;padding:10px 14px;font-size:13px;color:#e8f0fe;outline:none;font-family:inherit;transition:border-color 0.15s;}
.search-input:focus{border-color:#22c55e;}
.search-input::placeholder{color:#2a3555;}
.search-btn{background:#1a6b3c;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:7px;white-space:nowrap;}
.search-btn:hover{background:#15803d;}
.results-card{background:#0d1424;border:1px solid #1a2340;border-radius:12px;overflow:hidden;}
.results-head{padding:12px 18px;border-bottom:1px solid #1a2340;display:flex;align-items:center;justify-content:space-between;}
.results-label{font-size:10.5px;font-weight:700;color:#4a5a7a;letter-spacing:1px;text-transform:uppercase;}
.results-count{font-size:11px;color:#2a3555;font-family:'Courier New',monospace;}
.results-body{min-height:120px;}
.result-row{display:grid;grid-template-columns:60px 1fr 1fr;gap:12px;padding:12px 18px;border-bottom:1px solid #0d1424;font-size:13px;color:#94a3b8;align-items:center;}
.result-row.header{background:#080e1c;font-size:10px;font-weight:700;color:#4a5a7a;letter-spacing:0.8px;text-transform:uppercase;padding:9px 18px;}
.result-id{font-family:'Courier New',monospace;color:#4a5a7a;}
.result-name{color:#e8f0fe;font-weight:500;}
.result-dept{color:#6b7fa3;}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;gap:10px;}
.empty-text{font-size:13px;color:#2a3555;}
.error-card{background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:16px 18px;margin:12px;}
.error-label{font-size:10px;font-weight:700;color:#ef4444;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.error-msg{font-family:'Courier New',monospace;font-size:11.5px;color:#fca5a5;line-height:1.8;word-break:break-all;}
.error-query{font-family:'Courier New',monospace;font-size:11px;color:#4a5a7a;margin-top:8px;padding-top:8px;border-top:1px solid rgba(239,68,68,0.1);word-break:break-all;}
.info-bar{background:#080e1c;border:1px solid #1a2340;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:11.5px;color:#4a5a7a;line-height:1.7;}
.info-bar code{font-family:'Courier New',monospace;color:#22c55e;background:rgba(34,197,94,0.08);padding:1px 5px;border-radius:3px;font-size:11px;}
.loading{display:flex;align-items:center;justify-content:center;padding:36px;gap:10px;color:#2a3555;font-size:13px;}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo">
    <div class="logo-icon">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="7" width="12" height="7" rx="1.5" stroke="#22c55e" stroke-width="1.2"/><path d="M4 7V5.5a3.5 3.5 0 017 0V7" stroke="#22c55e" stroke-width="1.2" stroke-linecap="round"/></svg>
    </div>
    <span class="logo-text">Vault<span>Bank</span></span>
  </div>
  <div class="user-row">
    <span class="user-chip">john</span>
    <span class="user-chip" style="color:#ef4444;border-color:#2a1a1a;">CLEARANCE: L1</span>
  </div>
</div>
<div class="main">
  <div class="section-title">Employee Directory Search</div>
  <div class="info-bar">Search employee database by name. Example: <code>Alice</code> or <code>Bob</code></div>
  <div class="search-card">
    <div class="search-row">
      <input class="search-input" type="text" id="searchInput" placeholder="Enter employee name..." autocomplete="off">
      <button class="search-btn" onclick="doSearch()">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#fff" stroke-width="1.2"/><path d="M10 10L8 8" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>
        Search
      </button>
    </div>
  </div>
  <div class="results-card">
    <div class="results-head">
      <span class="results-label">Results</span>
      <span class="results-count" id="resultCount">waiting for query</span>
    </div>
    <div class="results-body" id="resultsBody">
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="14" cy="14" r="9" stroke="#1a2340" stroke-width="1.5"/><path d="M21 21l5 5" stroke="#1a2340" stroke-width="1.5" stroke-linecap="round"/></svg>
        <div class="empty-text">Enter a name to search the directory</div>
      </div>
    </div>
  </div>
</div>
<script>
const LAB_SESSION = new URLSearchParams(window.location.search).get('session') || '';
function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

async function doSearch() {
  const q = document.getElementById('searchInput').value;
  const body = document.getElementById('resultsBody');
  const count = document.getElementById('resultCount');
  body.innerHTML = '<div class="loading"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation:spin 1s linear infinite"><circle cx="8" cy="8" r="6" stroke="#1a2340" stroke-width="1.5"/><path d="M8 2a6 6 0 016 6" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/></svg>Querying database...</div>';
  count.textContent = 'searching...';
  try {
    const res = await fetch('/api/lab/sqli101/search', {
      method: 'POST',
      headers: {'Content-Type':'application/json','X-Lab-Session': LAB_SESSION},
      body: JSON.stringify({ q })
    });
    const data = await res.json();
    if (data.error) {
      count.textContent = 'query error';
      body.innerHTML = '<div class="error-card"><div class="error-label"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#ef4444" stroke-width="1"/><path d="M6 4v2.5M6 8.5v.5" stroke="#ef4444" stroke-width="1" stroke-linecap="round"/></svg>SQL Error</div><div class="error-msg">' + escHtml(data.error) + '</div><div class="error-query">Query: ' + escHtml(data.query||'') + '</div></div>';
      return;
    }
    const rows = data.rows || [];
    count.textContent = rows.length + ' row' + (rows.length !== 1 ? 's' : '') + ' returned';
    if (rows.length === 0) {
      body.innerHTML = '<div class="empty-state"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="9" stroke="#1a2340" stroke-width="1.5"/></svg><div class="empty-text">No employees found</div></div>';
      return;
    }
    let html = '<div class="result-row header"><span>ID</span><span>Name</span><span>Department</span></div>';
    rows.forEach(r => {
      html += '<div class="result-row"><span class="result-id">' + escHtml(String(r[0]??'')) + '</span><span class="result-name">' + escHtml(String(r[1]??'')) + '</span><span class="result-dept">' + escHtml(String(r[2]??'')) + '</span></div>';
    });
    body.innerHTML = html;
  } catch(e) {
    count.textContent = 'connection error';
    body.innerHTML = '<div class="empty-state"><div class="empty-text">Connection error. Please try again.</div></div>';
  }
}
document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key==='Enter') doSearch(); });
</script>
</body>
</html>`);
});

// ── SEARCH API (intentionally vulnerable) ─────────────────────────
router.post('/search', async (req, res) => {
  const { q } = req.body;
  const s = sid(req);
  if (!isInstanceRunning(s)) return res.status(403).json({ error: 'Instance not active' });
  const inst = await getOrCreate(s);
  const db = inst.db;

  if (q === undefined || q === null) return res.json({ rows: [], query: '' });

  const query = `SELECT id, name, department FROM employees WHERE name = '${q}'`;

  try {
    const result = db.exec(query);
    logAttempt('SQLI101', req.ip, query.substring(0, 120), 'ok');

    let rows = [];
    if (result.length > 0) {
      rows = result[0].values;
    }

    // Check if flag was extracted
    const flat = rows.flat().map(c => String(c || ''));
    if (flat.some(c => c.includes('ACX{'))) {
      inst.solved = true;
      logAttempt('SQLI101', req.ip, 'FLAG_EXTRACTED', 'correct');
    }

    res.json({ rows, query });
  } catch(err) {
    logAttempt('SQLI101', req.ip, query.substring(0, 120), 'db_error');
    res.status(500).json({ error: err.message, query, hint: 'SQLite 3.43.2' });
  }
});

// ── SUBMIT ─────────────────────────────────────────────────────────
router.post('/submit', flagLimiter, async (req, res) => {
  const { flag } = req.body;
  const s = sid(req);
  if (!flag) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('SQLI101', req.ip, flag.trim(), correct ? 'correct' : 'wrong');
  if (correct) {
    const inst = await getOrCreate(s);
    inst.solved = true;
    return res.json({ success: true, flag: FLAG, message: 'UNION SELECT extracted from vault_secrets. Classic SQL injection.' });
  }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

module.exports = router;
