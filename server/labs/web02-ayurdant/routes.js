// ── web-02 "Daadi ka Nuskha" (cookie tampering) ─────────────────
// Ayurdant, a fictional ayurvedic toothpaste brand from Haridwar, runs an
// online store. After login the store keeps WHO you are in a plain Base64
// JSON cookie (ayd_session: uid, name, role) with no signature, and the
// server believes it (OWASP A07:2021 Identification and Authentication
// Failures, CWE-565 reliance on cookies without validation, CWE-639).
// The account page has a "Daadi ka Nuskha" vault for the owner only; it
// checks role === 'owner' AND that the uid is the owner's. The owner's uid
// is never shown on screen, but the product reviews API sends it along with
// her reply (CWE-213, an API returning more than the page needs).
//
// The owner's uid is random per instance, so a copied cookie from a writeup
// does not work. All data is made up; the lab touches no real table, holds no
// login token and logs no flag. Images are our own 3D renders, served from a
// fixed whitelist.
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { flagFor } = require('../flags');
const { flagLimiter, loginLimiter } = require('../../middleware/rateLimit');
const { logAttempt } = require('../../middleware/logger');
const { LANGS, textsFor } = require('./i18n');

const router = express.Router();
const FLAG = flagFor('web-02');
const INSTANCE_DURATION_SEC = 30 * 60;
const CREDS = { email: 'riya.kapoor@mailbox.test', password: 'Kesar@1962' };
const instances = {};

const CSS = fs.readFileSync(path.join(__dirname, 'store.css'), 'utf8');
const IMAGES = {};
for (const n of ['hero', 'laung', 'neem', 'kesar', 'manjan']) IMAGES[n] = fs.readFileSync(path.join(__dirname, 'img', n + '.webp'));

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
// The CTF page opens the lab with ?lang= (the language picked on the site); English by default.
function langOf(req) { return typeof req.query.lang === 'string' && LANGS.includes(req.query.lang) ? req.query.lang : 'en'; }
const HTML_LANG = { en: 'en', hl: 'hi-Latn', hi: 'hi', pa: 'pa', ta: 'ta', te: 'te', bn: 'bn', mr: 'mr' };
// Query string kept on every link (session + language). `amp` for HTML attributes.
function qs(s, lang, amp = true) { return 'session=' + encodeURIComponent(s) + (amp ? '&amp;' : '&') + 'lang=' + lang; }
const LOCK = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="vertical-align:-1px;margin-left:4px"><rect x="2.5" y="6" width="9" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 6V4.3a2.5 2.5 0 015 0V6" stroke="currentColor" stroke-width="1.4"/></svg>';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupee = (n) => '&#8377;' + n.toLocaleString('en-IN');
const uid = () => 'AYD-' + (10000 + crypto.randomInt(90000));

function newInst() {
  const riya = uid();
  let owner = uid();
  while (owner === riya) owner = uid();
  return { startedAt: Date.now(), riyaUid: riya, ownerUid: owner, solved: false };
}
function getOrCreate(s) { if (!instances[s]) instances[s] = newInst(); return instances[s]; }
function resetInst(s) { instances[s] = newInst(); return instances[s]; }
function instStatus(s) {
  const inst = getOrCreate(s);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000));
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}
function isRunning(s) { const inst = instances[s]; return !!inst && (INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000)) > 0; }

// ── Catalogue ──
const PRODUCTS = {
  laung: { name: 'Laung Shakti Toothpaste', price: 95, mrp: 120, rating: '4.6', count: '2,310' },
  neem: { name: 'Neem Raksha Toothpaste', price: 89, mrp: 110, rating: '4.5', count: '1,876' },
  kesar: { name: 'Kesar Gold Toothpaste', price: 179, mrp: 225, rating: '4.8', count: '1,284', best: true },
  manjan: { name: 'Daadi ka Dant Manjan', price: 129, mrp: 150, rating: '4.7', count: '3,042' },
};
const off = (p) => Math.round((1 - p.price / p.mrp) * 100);

// Reviews come from the store's API. The owner's replies carry her full
// staff record (uid, email, role): THE LEAK. The page only shows her name.
function reviewsFor(slug, inst, T) {
  const owner = { uid: inst.ownerUid, name: 'Savitri Devi', email: 'savitri@ayurdant.test', role: 'owner' };
  const R = {
    kesar: [
      { id: 'r-5512', user: 'Ankit S.', rating: 5, date: '2026-10-28', reply: true },
      { id: 'r-5498', user: 'Meena R.', rating: 4, date: '2026-10-19' },
      { id: 'r-5431', user: 'Farhan Q.', rating: 5, date: '2026-10-07', reply: true },
    ],
    laung: [{ id: 'r-5520', user: 'Pooja N.', rating: 5, date: '2026-10-30' }, { id: 'r-5470', user: 'Vikram T.', rating: 4, date: '2026-10-14' }],
    neem: [{ id: 'r-5509', user: 'Sneha G.', rating: 4, date: '2026-10-25' }],
    manjan: [{ id: 'r-5502', user: 'Ramesh K.', rating: 5, date: '2026-10-22', reply: true }],
  };
  return (R[slug] || []).map((r) => {
    const o = { id: r.id, user: r.user, rating: r.rating, date: r.date, text: T.rv[r.id] };
    if (r.reply) o.reply = { text: T.rv[r.id + 'r'], by: owner };
    return o;
  });
}

// ── The session cookie (THE BUG: plain Base64 JSON, no signature) ──
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');
function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}
function readSession(req) {
  let v = readCookie(req, 'ayd_session');
  if (!v || v.length > 2048) return null;
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  try { v = decodeURIComponent(v); } catch (e) { /* keep raw */ }
  try {
    const o = JSON.parse(Buffer.from(v, 'base64').toString('utf8'));
    if (!o || typeof o !== 'object' || typeof o.uid !== 'string' || typeof o.role !== 'string') return null;
    return { uid: o.uid.slice(0, 40), name: typeof o.name === 'string' ? o.name.slice(0, 60) : 'Customer', role: o.role.slice(0, 30) };
  } catch (e) { return null; }
}
// Cookies are scoped to this lab's path on the labs origin.
function cookieOpts(req) { return `Path=${req.baseUrl}/; SameSite=Lax`; }

// ── Page chrome ──
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rozha+One&amp;family=Mukta:wght@400;500;600;700&amp;display=swap" rel="stylesheet">';
function page(req, title, user, body, script) {
  const s = sid(req), lang = langOf(req), T = textsFor(lang), q = qs(s, lang);
  const who = user
    ? `<a href="account?${q}">${esc(user.name.split(' ')[0] || T.acct)}</a>`
    : `<a href="login?${q}">${T.login}</a>`;
  return `<!DOCTYPE html><html lang="${HTML_LANG[lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>${FONTS}<link rel="stylesheet" href="css/store.css"></head><body>
<div class="strip">${T.strip}</div>
<header class="hdr"><div class="wrap"><a class="logo" href="page?${q}"><span class="seal">&#2310;</span><span><span class="name">Ayurdant</span><small>&#2310;&#2351;&#2369;&#2352;&#2381;&#2342;&#2306;&#2340;. ${T.since}</small></span></a>
<nav class="nav"><a href="product?item=laung&amp;${q}">${T.nav_paste}</a><a href="product?item=manjan&amp;${q}">${T.nav_manjan}</a><a href="page?${q}#combo">${T.nav_combo}</a><a href="page?${q}#kahani">${T.nav_story}</a></nav>
<div class="hright"><div class="search">${T.search}</div>${who}<span class="cart">${T.cart} (<b id="cc">0</b>)</span></div></div></header><div class="border"></div>
${body}
<footer class="foot"><div class="wrap"><div><h4>Ayurdant</h4>${T.foot_about}</div>
<div><h4>${T.foot_shop}</h4><a href="product?item=laung&amp;${q}">${T.nav_paste}</a><a href="product?item=manjan&amp;${q}">${T.nav_manjan}</a><a href="page?${q}#combo">${T.nav_combo}</a></div>
<div><h4>${T.foot_help}</h4><a href="account?${q}">${T.f_track}</a><a href="#">${T.f_returns}</a><a href="#">${T.f_contact}</a></div>
<div><h4>${T.foot_company}</h4><a href="page?${q}#kahani">${T.nav_story}</a><a href="#">${T.f_careers}</a></div></div>
<div class="fine">&copy; 2026 Ayurdant. ${T.fine}</div></footer>
<div class="toast" id="toast"></div>
<script>
var S=${JSON.stringify(String(s)).replace(/</g, '\\u003c')};
var LANG=${JSON.stringify(lang)};
var T=${JSON.stringify({ added: T.added, rev_none: T.rev_none, rev_fail: T.rev_fail }).replace(/</g, '\\u003c')};
function toast(t){var e=document.getElementById('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},1800)}
document.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(ev){ev.preventDefault();var c=document.getElementById('cc');c.textContent=+c.textContent+1;toast(T.added)})});
${script || ''}
</script></body></html>`;
}

function notActive(req, res) {
  const T = textsFor(langOf(req));
  res.status(403).type('html').send(`<!DOCTYPE html><html lang="${HTML_LANG[langOf(req)]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Instance not active</title><style>${CSS}</style></head><body><div class="notice"><h1>${T.na_title}</h1><p>${T.na_text}</p></div></body></html>`);
}

function card(slug, q, T) {
  const p = PRODUCTS[slug];
  return `<div class="card" style="position:relative"><a class="pic" href="product?item=${slug}&amp;${q}"><img src="img/${slug}.webp" alt="${esc(p.name)}" loading="lazy"></a>${p.best ? `<span class="tag">${T.bestseller}</span>` : ''}
<div class="body"><h3><a href="product?item=${slug}&amp;${q}">${esc(p.name)}</a></h3><div class="meta">${T.products[slug].meta}</div><div class="meta"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${p.rating} (${p.count})</div>
<div class="row"><span class="price">${rupee(p.price)}<span class="mrp">${rupee(p.mrp)}</span></span><a class="add" href="#" data-add>${T.add}</a></div></div></div>`;
}

// ── Instance endpoints ──
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));
router.post('/instance/restart', (req, res) => { resetInst(sid(req)); logAttempt('AYURDANT', req.ip, 'instance_restart', 'ok'); res.json({ success: true, ...instStatus(sid(req)) }); });
router.post('/instance/stop', (req, res) => { const s = sid(req); if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000; res.json({ success: true, running: false, remaining_sec: 0 }); });

// ── Static files (fixed whitelist) ──
router.get('/css/store.css', (req, res) => res.set('Cache-Control', 'public, max-age=3600').type('text/css').send(CSS));
router.get('/img/:name.webp', (req, res, next) => {
  const img = Object.prototype.hasOwnProperty.call(IMAGES, req.params.name) ? IMAGES[req.params.name] : null;
  if (!img) return next();
  res.set('Cache-Control', 'public, max-age=86400').type('image/webp').send(img);
});

// ── Home ──
router.get('/page', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  const T = textsFor(langOf(req)), q = qs(s, langOf(req));
  const body = `<section class="hero"><div class="wrap"><div><div class="kicker">${T.kicker}</div><h1>${T.h1}</h1><p>${T.hero_p}</p><a class="btn btn-red" href="product?item=kesar&amp;${q}">${T.shop_kesar}</a> &nbsp; <a class="btn btn-line" href="#kahani">${T.nav_story}</a></div><img class="heroimg" src="img/hero.webp" alt="Ayurdant"></div></section>
<div class="trust">${T.trust.map(([b, t]) => `<div><b>${b}</b>${t}</div>`).join('')}</div>
<section class="sec"><div class="wrap"><h2>${T.prod_h2}</h2><p class="lead">${T.prod_lead}</p><div class="grid">${Object.keys(PRODUCTS).map((k) => card(k, q, T)).join('')}</div></div></section>
<section class="sec" id="combo" style="padding-top:0"><div class="wrap"><div class="offer"><div><h3>${T.offer_h3}</h3><p>${T.offer_p}</p></div><span class="code">DAADI20</span></div></div></section>
<section class="sec" id="kahani" style="padding-top:0"><div class="wrap"><h2>${T.nav_story}</h2><p class="lead" style="max-width:720px">${T.story}</p></div></section>`;
  res.set('Cache-Control', 'no-store').type('html').send(page(req, T.t_home, readSession(req), body));
});

// ── Product page (reviews load from the API) ──
router.get('/product', (req, res, next) => {
  const s = sid(req);
  const slug = typeof req.query.item === 'string' ? req.query.item : '';
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, slug)) return next();
  if (!isRunning(s)) return notActive(req, res);
  const lang = langOf(req), T = textsFor(lang), q = qs(s, lang);
  const p = PRODUCTS[slug];
  const others = Object.keys(PRODUCTS).filter((k) => k !== slug).map((k) => `<a class="mini" href="product?item=${k}&amp;${q}"><img src="img/${k}.webp" alt=""><span><b>${esc(PRODUCTS[k].name)}</b><span>${rupee(PRODUCTS[k].price)}</span></span></a>`).join('');
  const body = `<div class="wrap"><div class="crumbs"><a href="page?${q}">${T.crumb_home}</a> / ${T.nav_paste} / ${esc(p.name)}</div>
<div class="pd"><div class="big"><img src="img/${slug}.webp" alt="${esc(p.name)}"></div><div>
${p.best ? `<div class="kicker">${T.bestseller}</div>` : ''}<h1>${esc(p.name)}</h1><div class="rate"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${p.rating} (${T.reviews_n.replace('{n}', p.count)})</div>
<span class="price">${rupee(p.price)}<span class="mrp">${rupee(p.mrp)}</span><span class="off">${T.off.replace('{n}', off(p))}</span></span>
<ul>${T.products[slug].points.map((t) => `<li>${t}</li>`).join('')}</ul>
<span class="qty"><span>-</span><span>1</span><span>+</span></span><a class="btn btn-red" href="#" data-add>${T.add_cart}</a>
<h2 style="font:26px/1.1 'Rozha One',serif;color:var(--maroon);font-weight:400;margin:30px 0 0">${T.reviews}</h2>
<div id="revs"><div class="revload">${T.rev_loading}</div></div>
<div class="thumbs">${others}</div></div></div></div>`;
  const script = `
function e(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
fetch('api/reviews?product=${slug}&session='+encodeURIComponent(S)+'&lang='+LANG).then(function(r){return r.json()}).then(function(d){
  var h=(d.reviews||[]).map(function(r){
    return '<div class="rev"><div class="h">'+e(r.user)+' <span class="stars">'+'\\u2605'.repeat(r.rating)+'\\u2606'.repeat(5-r.rating)+'</span><span class="date">'+e(r.date)+'</span></div><p>'+e(r.text)+'</p>'+
      (r.reply?'<div class="reply"><b>'+e(r.reply.by.name)+'</b> <span class="staff">AYURDANT</span><br>'+e(r.reply.text)+'</div>':'')+'</div>';
  }).join('');
  document.getElementById('revs').innerHTML=h||'<div class="revload">'+e(T.rev_none)+'</div>';
}).catch(function(){document.getElementById('revs').innerHTML='<div class="revload">'+e(T.rev_fail)+'</div>'});`;
  res.set('Cache-Control', 'no-store').type('html').send(page(req, p.name + ': Ayurdant', readSession(req), body, script));
});

router.get('/api/reviews', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return res.status(403).json({ error: 'Instance not active' });
  const slug = typeof req.query.product === 'string' ? req.query.product : '';
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, slug)) return res.status(404).json({ error: 'Unknown product' });
  res.set('Cache-Control', 'no-store').json({ product: slug, reviews: reviewsFor(slug, instances[s], textsFor(langOf(req))) });
});

// ── Login ──
router.get('/login', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  const lang = langOf(req), T = textsFor(lang), q = qs(s, lang);
  if (readSession(req)) return res.redirect(302, 'account?' + qs(s, lang, false));
  const body = `<div class="wrap"><div class="authwrap"><div class="authart"><img src="img/hero.webp" alt=""><p>${T.h1.replace('<br>', ' ')}</p></div>
<div class="form"><h2>${T.welcome}</h2><p class="sub">${T.welcome_sub}</p>
<div class="tabs"><button class="on" data-tab="in" type="button">${T.tab_login}</button><button data-tab="up" type="button">${T.tab_new}</button></div>
<form class="on" id="in"><div class="err" id="err">${T.err_login}</div>
<label for="em">${T.email}</label><input class="inp" id="em" autocomplete="username" value="${esc(CREDS.email)}">
<label for="pw">${T.password}</label><input class="inp" id="pw" type="password" autocomplete="current-password" value="${esc(CREDS.password)}">
<button class="btn btn-red" type="submit">${T.btn_login}</button>
<p class="small" style="margin-top:14px">${T.lab_note}</p></form>
<form id="up"><p class="small" style="margin:0 0 16px">${T.new_paused}</p>
<label>${T.name}</label><input class="inp" disabled><label>${T.email}</label><input class="inp" disabled><button class="btn btn-red" type="button" disabled>${T.create}</button></form>
</div></div></div>`;
  const script = `
document.querySelectorAll('.tabs button').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('.tabs button').forEach(function(x){x.classList.toggle('on',x===b)});
  document.querySelectorAll('.form form').forEach(function(f){f.classList.toggle('on',f.id===b.dataset.tab)});
})});
document.getElementById('in').addEventListener('submit',function(ev){ev.preventDefault();
  fetch('login?session='+encodeURIComponent(S),{method:'POST',headers:{'Content-Type':'application/json','X-Lab-Session':S},body:JSON.stringify({email:document.getElementById('em').value,password:document.getElementById('pw').value})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){location.href='account?session='+encodeURIComponent(S)+'&lang='+LANG}else{document.getElementById('err').classList.add('show')}})
  .catch(function(){document.getElementById('err').classList.add('show')});
});`;
  res.set('Cache-Control', 'no-store').type('html').send(page(req, T.t_login, null, body, script));
});

router.post('/login', loginLimiter, (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return res.status(403).json({ error: 'Instance not active' });
  const b = req.body || {};
  if (typeof b.email !== 'string' || typeof b.password !== 'string' || b.email.length > 200 || b.password.length > 200) return res.status(400).json({ error: 'Email and password required.' });
  if (b.email.trim().toLowerCase() === CREDS.email && b.password === CREDS.password) {
    const inst = instances[s];
    const o = cookieOpts(req);
    res.append('Set-Cookie', `ayd_session=${b64({ uid: inst.riyaUid, name: 'Riya Kapoor', role: 'customer' })}; ${o}`);
    res.append('Set-Cookie', `ayd_cart=${Buffer.from('kesar:1|neem:2|coupon:DAADI20').toString('base64')}; ${o}`);
    logAttempt('AYURDANT', req.ip, 'login', 'ok');
    return res.json({ success: true });
  }
  logAttempt('AYURDANT', req.ip, 'login:wrong', 'fail');
  res.status(401).json({ success: false });
});

router.get('/logout', (req, res) => {
  const s = sid(req);
  const o = cookieOpts(req) + '; Max-Age=0';
  res.append('Set-Cookie', `ayd_session=; ${o}`);
  res.append('Set-Cookie', `ayd_cart=; ${o}`);
  res.redirect(302, 'page?' + qs(s, langOf(req), false));
});

// ── Account (trusts the cookie) ──
function sideNav(q, T, user, on, isOwner) {
  const initial = esc((user.name.trim()[0] || 'A').toUpperCase());
  return `<aside class="side"><div class="who"><span class="av">${initial}</span><span><b>${esc(user.name)}${isOwner ? '<span class="staff">OWNER</span>' : ''}</b><small>${T.cust_id} ${esc(user.uid)}</small></span></div>
<a class="${on === 'acct' ? 'on' : ''}" href="account?${q}">${T.acct}</a><a href="account?${q}#orders">${T.side_orders}</a><a href="account?${q}#address">${T.side_addr}</a>
<a class="${on === 'vault' ? 'on' : ''}" href="nuskha?${q}">${T.vault}${isOwner ? '' : LOCK}</a><a href="logout?${q}">${T.logout}</a></aside>`;
}

router.get('/account', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  const lang = langOf(req), T = textsFor(lang), q = qs(s, lang);
  const user = readSession(req);
  if (!user) return res.redirect(302, 'login?' + qs(s, lang, false));
  const inst = instances[s];
  const isOwner = user.role === 'owner' && user.uid === inst.ownerUid;
  const main = isOwner
    ? `<div class="stats"><div class="stat"><span>${T.own_stats[0]}</span><b>418</b></div><div class="stat"><span>${T.own_stats[1]}</span><b>&#8377;61,240</b></div><div class="stat"><span>${T.own_stats[2]}</span><b>2,960</b></div></div>
<div class="panel"><h3>${T.own_hello}</h3><p style="margin:0">${T.own_text}</p></div>`
    : `<div class="panel"><h3>${T.acct}</h3><div class="kv"><span>${T.name}</span><b>${esc(user.name)}</b><span>${T.cust_id}</span><b class="mono">${esc(user.uid)}</b><span>${T.k_type}</span><b>${esc(user.role)}</b><span>${T.email}</span><b>${user.uid === inst.riyaUid ? esc(CREDS.email) : '-'}</b></div></div>
<div class="panel" id="orders"><h3>${T.orders_h}</h3><div class="tbl"><table><thead><tr>${T.th.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>
<tr><td class="mono">#AY-77310</td><td>29/10/2026</td><td>Kesar Gold x1, Neem Raksha x2</td><td>${rupee(357)}</td><td><span class="pill o">${T.st_shipped}</span></td></tr>
<tr><td class="mono">#AY-76854</td><td>11/10/2026</td><td>Daadi ka Dant Manjan x1</td><td>${rupee(129)}</td><td><span class="pill">${T.st_delivered}</span></td></tr>
<tr><td class="mono">#AY-75120</td><td>20/09/2026</td><td>Laung Shakti x3</td><td>${rupee(285)}</td><td><span class="pill r">${T.st_returned}</span></td></tr></tbody></table></div></div>
<div class="panel" id="address"><h3>${T.addr_h}</h3><p style="margin:0">Riya Kapoor<br>B-14, Shanti Kunj, Jwalapur<br>Haridwar, Uttarakhand 249407</p></div>`;
  const body = `<div class="wrap"><div class="crumbs"><a href="page?${q}">${T.crumb_home}</a> / ${T.acct}</div><div class="acct">${sideNav(q, T, user, 'acct', isOwner)}<div>${main}</div></div></div>`;
  res.set('Cache-Control', 'no-store').type('html').send(page(req, T.t_account, user, body));
});

// ── The vault: owner only, decided from the cookie alone ──
router.get('/nuskha', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  const lang = langOf(req), T = textsFor(lang), q = qs(s, lang);
  const user = readSession(req);
  if (!user) return res.redirect(302, 'login?' + qs(s, lang, false));
  const inst = instances[s];
  const isOwner = user.role === 'owner' && user.uid === inst.ownerUid;
  let main;
  if (isOwner) {
    if (!inst.solved) logAttempt('AYURDANT', req.ip, 'vault:open', 'correct');
    inst.solved = true;
    main = `<div class="panel"><h3>${T.vault_title}</h3>
<table><tbody>${T.ing.map(([n, v]) => `<tr><td>${n}</td><td>${v}</td></tr>`).join('')}</tbody></table>
<p style="margin:16px 0 6px" class="small">${T.vault_code}</p><div class="code" style="display:inline-block;word-break:break-all">${esc(FLAG)}</div></div>`;
  } else if (user.role === 'owner') {
    logAttempt('AYURDANT', req.ip, 'vault:role_mismatch', 'wrong');
    main = `<div class="panel"><h3>${T.alert_title}</h3><p style="margin:0 0 10px"><span class="pill r">${T.alert_blocked}</span></p><p style="margin:0">${T.alert_text.replace('{uid}', '<span class="mono">' + esc(user.uid) + '</span>')}</p></div>`;
  } else {
    main = `<div class="panel"><h3>${T.vault}${LOCK}</h3><p style="margin:0">${T.locked}</p></div>`;
  }
  const body = `<div class="wrap"><div class="crumbs"><a href="page?${q}">${T.crumb_home}</a> / <a href="account?${q}">${T.acct}</a> / ${T.vault}</div><div class="acct">${sideNav(q, T, user, 'vault', isOwner)}<div>${main}</div></div></div>`;
  res.set('Cache-Control', 'no-store').type('html').send(page(req, T.t_vault, user, body));
});

// ── Flag submit (the CTF page posts to the MAIN server; this is a fallback) ──
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body || {};
  const s = sid(req);
  if (typeof flag !== 'string' || !flag.trim()) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('AYURDANT', req.ip, 'submit', correct ? 'correct' : 'wrong'); // never log a flag
  if (correct) { getOrCreate(s).solved = true; return res.json({ success: true, flag: FLAG, message: 'The store trusted an unsigned cookie. Keep who-is-who on the server, and send only what the page needs.' }); }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

router._instances = instances;
module.exports = router;
