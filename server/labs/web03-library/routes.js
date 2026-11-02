// ── web-03 "SQL Injection: UNION Attack" ────────────────────────
// Narmada Valley College (fictional) put its library catalogue (OPAC) online
// in 2004 and never changed the code. The title search pastes the search text
// straight into the SQL (OWASP A03:2021 Injection, CWE-89):
//   SELECT accession_no, title, author, status FROM books
//   WHERE section = 'general' AND title LIKE '%<search>%' ORDER BY title
// Database errors are shown on the page, like old OPACs did. The trap:
// "' OR 1=1--" shows the restricted books, but the flag is not there. The
// student counts the 4 columns, UNIONs into sqlite_master, finds the archive
// table (its name is random per instance, so a copied writeup does not
// transfer) and reads its access_code column.
//
// Safety for the labs server (not part of the challenge): every query runs in
// a worker thread (db-worker.js) on a read-only database with a capped SQLite
// heap; the thread is restarted if a query runs too long; the search text is
// length-capped and a few heavy functions are refused. Results are rendered
// as text only. No flag is ever logged.
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { Worker } = require('worker_threads');
const { flagFor } = require('../flags');
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt } = require('../../middleware/logger');
const { langFor, texts, notActivePage, HTML_LANG, qs } = require('../i18n');
const TEXT = require('./i18n');

const router = express.Router();
const FLAG = flagFor('web-03');
const INSTANCE_DURATION_SEC = 30 * 60;
const QUERY_TIMEOUT_MS = 1500;
const MAX_SEARCH = 300;
const instances = {};

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
const L = (req) => langFor(req, instances[sid(req)]);
const newSuffix = () => { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < 4; i++) s += a[crypto.randomInt(a.length)]; return s; };
function newInst() { return { startedAt: Date.now(), suffix: newSuffix(), solved: false }; }
function getOrCreate(s) { if (!instances[s]) instances[s] = newInst(); return instances[s]; }
function resetInst(s) { instances[s] = newInst(); return instances[s]; }
function instStatus(s) {
  const inst = getOrCreate(s);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000));
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}
function isRunning(s) { const inst = instances[s]; return !!inst && (INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000)) > 0; }

// ── Database thread (same pattern as ai-02) ──
let worker = null, nextId = 1;
const pending = new Map();
function failAll(w) {
  for (const [id, p] of pending) {
    if (p.w !== w) continue;
    pending.delete(id); clearTimeout(p.timer); p.resolve({ ok: false, offline: true });
  }
}
function startWorker() {
  const w = new Worker(path.join(__dirname, 'db-worker.js'), {
    workerData: { flag: FLAG },
    resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16 },
  });
  w.unref();
  w.ready = new Promise((resolve) => {
    w.on('message', (m) => {
      if (m.ready) return resolve(true);
      if (m.fatal) { console.error('[WEB-03] database thread failed:', m.fatal); return resolve(false); }
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id); clearTimeout(p.timer); p.resolve(m);
    });
    w.on('error', (e) => { console.error('[WEB-03] database thread error:', e.message); resolve(false); });
  });
  w.on('error', () => { if (worker === w) worker = null; failAll(w); });
  w.on('exit', () => { if (worker === w) worker = null; failAll(w); });
  worker = w;
  return w;
}
async function runQuery(suffix, sql) {
  const w = worker || startWorker();
  if (!(await w.ready)) { if (worker === w) worker = null; return { ok: false, offline: true }; }
  return new Promise((resolve) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({ ok: false, slow: true });
      if (worker === w) worker = null;
      w.terminate().catch(() => {});
    }, QUERY_TIMEOUT_MS);
    pending.set(id, { resolve, timer, w });
    w.postMessage({ id, suffix, sql });
  });
}

// THE BUG: the search text goes into the SQL as it is.
const buildQuery = (search) => `SELECT accession_no, title, author, status FROM books WHERE section = 'general' AND title LIKE '%${search}%' ORDER BY title`;

// ── Page ──
const STYLE = `<style>
:root{--maroon:#6b1420;--maroon2:#4d0e17;--cream:#f7f0e1;--paper:#fffdf7;--ink:#2a211b;--mute:#6f6152;--line:#dccfb4;--gold:#b88a3b;--link:#7a1a28}
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--cream);color:var(--ink);font:15px/1.6 Georgia,'Times New Roman',serif}
a{color:var(--link)}
.top{background:var(--maroon);color:#f6e9cf;border-bottom:4px solid var(--gold)}
.top .in{max-width:1080px;margin:0 auto;padding:14px 18px;display:flex;align-items:center;gap:14px}
.crest{width:58px;height:58px;flex:none;border-radius:50%;background:#f6e9cf;color:var(--maroon);display:grid;place-items:center;font:700 17px/1 Georgia,serif;letter-spacing:.5px;box-shadow:inset 0 0 0 3px var(--maroon),0 0 0 2px #f6e9cf}
.top b{display:block;font-size:24px;font-weight:700;letter-spacing:.3px}
.top small{display:block;font-size:14px;color:#e2c995;font-style:italic}
.nav{background:var(--maroon2)}
.nav .in{max-width:1080px;margin:0 auto;padding:0 18px;display:flex;flex-wrap:wrap}
.nav a{color:#f1dfba;text-decoration:none;padding:9px 14px;font-size:14px;border-right:1px solid #6e2330}
.nav a:first-child{border-left:1px solid #6e2330}
.nav a.on{background:var(--cream);color:var(--maroon);font-weight:700}
.wrap{max-width:1080px;margin:0 auto;padding:22px 18px 36px;display:grid;grid-template-columns:230px 1fr;gap:22px}
.side .box{background:var(--paper);border:1px solid var(--line);margin-bottom:16px}
.side h3{margin:0;padding:7px 12px;background:#efe3c8;border-bottom:1px solid var(--line);font-size:14px;color:var(--maroon)}
.side .b{padding:10px 12px;font-size:13.5px}
.side ul{margin:0;padding-left:18px}
.main{background:var(--paper);border:1px solid var(--line);padding:20px 22px;min-width:0}
h1{margin:0 0 4px;font-size:24px;color:var(--maroon);font-weight:700}
.intro{margin:0 0 16px;color:var(--mute)}
form{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px;background:#f5ecd8;border:1px solid var(--line);margin-bottom:16px}
form label{font-weight:700;font-size:14px}
form input{flex:1 1 240px;min-width:0;height:34px;border:1px solid #b9a780;padding:0 8px;font:15px Georgia,serif;background:#fff}
form button{height:34px;padding:0 18px;border:1px solid var(--maroon2);background:var(--maroon);color:#fff;font:700 14px Georgia,serif;cursor:pointer}
form button:disabled{opacity:.6}
.count{font-size:13.5px;color:var(--mute);margin:0 0 8px}
.tbl{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:14px;min-width:520px}
th{background:var(--maroon);color:#f6e9cf;text-align:left;padding:7px 9px;font-weight:700}
td{padding:7px 9px;border-bottom:1px solid #eadfc6;vertical-align:top;word-break:break-word}
tr:nth-child(even) td{background:#fbf6ea}
td.mono{font-family:'Courier New',monospace;font-size:13px;white-space:nowrap}
.err{border:1px solid #c98b8b;background:#fbeeee;padding:10px 12px;font-size:14px}
.err b{color:#8a1c1c}
.err code{display:block;margin-top:6px;font:13px/1.5 'Courier New',monospace;white-space:pre-wrap;word-break:break-all;color:#4a2a2a}
.note{color:var(--mute);font-style:italic}
.foot{border-top:3px double var(--line);text-align:center;font-size:12.5px;color:var(--mute);padding:14px 18px 22px}
.toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:var(--ink);color:#fff;padding:8px 14px;font-size:13px;opacity:0;transition:.2s;pointer-events:none}
.toast.show{opacity:1}
@media (max-width:760px){.wrap{grid-template-columns:1fr}.side{order:2}.top b{font-size:19px}.crest{width:46px;height:46px;font-size:14px}.nav a{padding:8px 10px}}
</style>`;

function page(s, lang) {
  const T = texts(TEXT, lang);
  const q = qs(s, lang);
  const S = JSON.stringify(String(s)).replace(/</g, '\\u003c');
  const C = JSON.stringify({ cols: T.cols, wait: T.wait, searching: T.searching, found: T.found, found1: T.found1, none: T.none, more: T.more, err_h: T.err_h, err_q: T.err_q, net: T.net, soon: T.soon }).replace(/</g, '\\u003c');
  return `<!DOCTYPE html><html lang="${HTML_LANG[lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${T.title}</title>${STYLE}</head><body>
<header class="top"><div class="in"><span class="crest">NVC</span><div><b>${T.college}</b><small>${T.lib}</small></div></div></header>
<nav class="nav" aria-label="Library"><div class="in">${T.nav.map((n, i) => (i === 1 ? `<a class="on" href="page?${q}">${n}</a>` : `<a href="#" data-soon>${n}</a>`)).join('')}</div></nav>
<div class="wrap">
 <aside class="side">
  <div class="box"><h3>${T.side_h}</h3><div class="b">${T.side_t}</div></div>
  <div class="box"><h3>${T.side_h2}</h3><div class="b"><ul>${T.side_r.map((r) => `<li>${r}</li>`).join('')}</ul></div></div>
 </aside>
 <main class="main">
  <h1>${T.h1}</h1>
  <p class="intro">${T.intro}</p>
  <form id="f" autocomplete="off"><label for="q">${T.label}</label><input id="q" name="q" maxlength="${MAX_SEARCH}" placeholder="${T.ph}" spellcheck="false"><button id="go" type="submit">${T.btn}</button></form>
  <div id="out"><p class="note">${T.wait}</p></div>
 </main>
</div>
<div class="foot">${T.foot}<br>${T.fict}</div>
<div class="toast" id="toast"></div>
<script>
(function(){
var S=${S},LANG=${JSON.stringify(lang)},T=${C};
var out=document.getElementById('out'),go=document.getElementById('go'),input=document.getElementById('q'),toast=document.getElementById('toast');
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
document.querySelectorAll('[data-soon]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();toast.textContent=T.soon;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},1800)})});
function show(d){
  out.textContent='';
  if(d.error){
    var b=el('div','err');b.appendChild(el('b',null,(d.sqlError?T.err_h+': ':'')+d.error));
    if(d.query){var c=el('code',null,T.err_q+': '+d.query);b.appendChild(c)}
    out.appendChild(b);return;
  }
  var rows=d.rows||[];
  out.appendChild(el('p','count',rows.length===1?T.found1:T.found.replace('{n}',rows.length)));
  if(!rows.length){out.appendChild(el('p','note',T.none));return}
  var w=el('div','tbl'),t=el('table'),h=el('tr');
  T.cols.forEach(function(x){h.appendChild(el('th',null,x))});
  var th=el('thead');th.appendChild(h);t.appendChild(th);var tb=el('tbody');
  rows.forEach(function(r){var tr=el('tr');for(var i=0;i<r.length;i++)tr.appendChild(el('td',i===0?'mono':null,r[i]));tb.appendChild(tr)});
  t.appendChild(tb);w.appendChild(t);out.appendChild(w);
  if(d.truncated)out.appendChild(el('p','note',T.more));
}
document.getElementById('f').addEventListener('submit',function(e){
  e.preventDefault();go.disabled=true;out.textContent='';out.appendChild(el('p','note',T.searching));
  fetch('search?session='+encodeURIComponent(S)+'&lang='+LANG,{method:'POST',headers:{'Content-Type':'application/json','X-Lab-Session':S},body:JSON.stringify({q:input.value})})
    .then(function(r){return r.json()}).then(show)
    .catch(function(){out.textContent='';out.appendChild(el('div','err',T.net))})
    .then(function(){go.disabled=false});
});
})();
</script>
</body></html>`;
}

function notActive(req, res) { res.status(403).type('html').send(notActivePage(req, 'background:#f7f0e1;color:#2a211b')); }

// ── Instance endpoints ──
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));
router.post('/instance/restart', (req, res) => { resetInst(sid(req)); logAttempt('LIBRARY', req.ip, 'instance_restart', 'ok'); res.json({ success: true, ...instStatus(sid(req)) }); });
router.post('/instance/stop', (req, res) => { const s = sid(req); if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000; res.json({ success: true, running: false, remaining_sec: 0 }); });

router.get('/page', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  res.set('Cache-Control', 'no-store').type('html').send(page(s, L(req)));
});

// ── The catalogue search (vulnerable on purpose) ──
router.post('/search', async (req, res) => {
  const s = sid(req);
  const T = texts(TEXT, L(req));
  if (!isRunning(s)) return res.status(403).json({ error: T.expired });
  const inst = instances[s];
  const search = req.body && typeof req.body.q === 'string' ? req.body.q : '';
  if (search.length > MAX_SEARCH) return res.status(400).json({ error: T.too_long });
  // Server safety only (not a fix for the bug): no recursive queries, no
  // functions that build huge blobs, one statement at a time.
  if (/\brecursive\b/i.test(search) || /\b(randomblob|zeroblob|load_extension)\s*\(/i.test(search)) return res.status(400).json({ error: T.blocked });
  const query = buildQuery(search);
  const r = await runQuery(inst.suffix, query);
  if (r.slow) { logAttempt('LIBRARY', req.ip, 'search:timeout', 'error'); return res.json({ error: T.slow }); }
  if (r.offline) return res.json({ error: T.offline });
  if (!r.ok) { logAttempt('LIBRARY', req.ip, 'search:sql_error', 'error'); return res.json({ error: r.error, sqlError: true, query }); }
  const leaked = r.rows.some((row) => row.includes(FLAG));
  if (leaked && !inst.solved) { inst.solved = true; logAttempt('LIBRARY', req.ip, 'search:archive_read', 'correct'); }
  res.set('Cache-Control', 'no-store').json({ rows: r.rows, truncated: r.truncated });
});

// ── Flag submit (the CTF page posts to the MAIN server; this is a fallback) ──
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body || {};
  const s = sid(req);
  if (typeof flag !== 'string' || !flag.trim()) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('LIBRARY', req.ip, 'submit', correct ? 'correct' : 'wrong'); // never log a flag
  if (correct) { getOrCreate(s).solved = true; return res.json({ success: true, flag: FLAG, message: 'The search text went straight into the SQL. Use parameterised queries and never show database errors to users.' }); }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

router._instances = instances;
router._buildQuery = buildQuery;
module.exports = router;
