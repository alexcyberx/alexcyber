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

const router = express.Router();
const FLAG = flagFor('web-02');
const INSTANCE_DURATION_SEC = 30 * 60;
const CREDS = { email: 'riya.kapoor@mailbox.test', password: 'Kesar@1962' };
const instances = {};

const CSS = fs.readFileSync(path.join(__dirname, 'store.css'), 'utf8');
const IMAGES = {};
for (const n of ['hero', 'laung', 'neem', 'kesar', 'manjan']) IMAGES[n] = fs.readFileSync(path.join(__dirname, 'img', n + '.webp'));

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
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
  laung: { name: 'Laung Shakti Toothpaste', meta: '150 g. Laung and babool', price: 95, mrp: 120, rating: '4.6', count: '2,310',
    points: ['Laung (clove) oil for daant dard and fresh breath', 'Babool bark for strong gums', 'No artificial colour'] },
  neem: { name: 'Neem Raksha Toothpaste', meta: '150 g. Neem and pudina', price: 89, mrp: 110, rating: '4.5', count: '1,876',
    points: ['Neem for healthy gums', 'Pudina for a cool, fresh mouth', 'Fluoride free'] },
  kesar: { name: 'Kesar Gold Toothpaste', meta: '100 g. Kesar and chandan', price: 179, mrp: 225, rating: '4.8', count: '1,284', tag: 'Bestseller',
    points: ['Real Kashmiri kesar and chandan', "Daadi's 1962 recipe, unchanged", 'Fluoride free, 100 g'] },
  manjan: { name: 'Daadi ka Dant Manjan', meta: '100 g jar. 11 herbs', price: 129, mrp: 150, rating: '4.7', count: '3,042',
    points: ['11 jadibootiyan, ground by hand', 'Use with a finger or a soft brush', 'Comes in a reusable glass jar'] },
};
const off = (p) => Math.round((1 - p.price / p.mrp) * 100);

// Reviews come from the store's API. The owner's replies carry her full
// staff record (uid, email, role): THE LEAK. The page only shows her name.
function reviewsFor(slug, inst) {
  const owner = { uid: inst.ownerUid, name: 'Savitri Devi', email: 'savitri@ayurdant.test', role: 'owner' };
  const R = {
    kesar: [
      { id: 'r-5512', user: 'Ankit S.', rating: 5, date: '2026-10-28', text: 'The kesar smell is amazing. Will you ever share the recipe?',
        reply: { text: 'Beta, this is daadi ka raaz. The recipe stays in our vault only.', by: owner } },
      { id: 'r-5498', user: 'Meena R.', rating: 4, date: '2026-10-19', text: 'A little costly, but very good for the gums.' },
      { id: 'r-5431', user: 'Farhan Q.', rating: 5, date: '2026-10-07', text: 'My whole family uses only this now. Delivery was quick too.',
        reply: { text: 'Shukriya Farhan ji, Diwali ki shubhkamnayein!', by: owner } },
    ],
    laung: [
      { id: 'r-5520', user: 'Pooja N.', rating: 5, date: '2026-10-30', text: 'Helped with my toothache in two days.' },
      { id: 'r-5470', user: 'Vikram T.', rating: 4, date: '2026-10-14', text: 'Strong taste, but it works.' },
    ],
    neem: [
      { id: 'r-5509', user: 'Sneha G.', rating: 4, date: '2026-10-25', text: 'Bitter at first, you get used to it. Gums feel better.' },
    ],
    manjan: [
      { id: 'r-5502', user: 'Ramesh K.', rating: 5, date: '2026-10-22', text: 'Just like my nani used to make.',
        reply: { text: 'Bas yahi to humara maqsad hai. Dhanyavaad!', by: owner } },
    ],
  };
  return R[slug] || [];
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
function page(title, s, user, body, script) {
  const q = 'session=' + encodeURIComponent(s);
  const who = user
    ? `<a href="account?${q}">${esc(user.name.split(' ')[0] || 'Account')}</a>`
    : `<a href="login?${q}">Login</a>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>${FONTS}<link rel="stylesheet" href="css/store.css?${q}"></head><body>
<div class="strip">Free delivery on orders above <b>&#8377;299</b>. Diwali offer: 20% off with code <b>DAADI20</b></div>
<header class="hdr"><div class="wrap"><a class="logo" href="page?${q}"><span class="seal">&#2310;</span><span><span class="name">Ayurdant</span><small>&#2310;&#2351;&#2369;&#2352;&#2381;&#2342;&#2306;&#2340;. Since 1962</small></span></a>
<nav class="nav"><a href="product?item=laung&amp;${q}">Toothpaste</a><a href="product?item=manjan&amp;${q}">Dant Manjan</a><a href="page?${q}#combo">Combo Packs</a><a href="page?${q}#kahani">Humari Kahani</a></nav>
<div class="hright"><div class="search">Search Laung, Neem...</div>${who}<span class="cart">Cart (<b id="cc">0</b>)</span></div></div></header><div class="border"></div>
${body}
<footer class="foot"><div class="wrap"><div><h4>Ayurdant</h4>Daadi ka nuskha, ab tube mein. Desi dant-care made with laung, neem and kesar, in Haridwar since 1962.</div>
<div><h4>Shop</h4><a href="product?item=laung&amp;${q}">Toothpaste</a><a href="product?item=manjan&amp;${q}">Dant Manjan</a><a href="page?${q}#combo">Combo Packs</a></div>
<div><h4>Help</h4><a href="account?${q}">Track order</a><a href="#">Returns</a><a href="#">Contact us</a></div>
<div><h4>Company</h4><a href="page?${q}#kahani">Humari Kahani</a><a href="#">Careers</a></div></div>
<div class="fine">&copy; 2026 Ayurdant. A fictional store built for AlexCyberX Labs. No real brand or person.</div></footer>
<div class="toast" id="toast"></div>
<script>
var S=${JSON.stringify(String(s)).replace(/</g, '\\u003c')};
function toast(t){var e=document.getElementById('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},1800)}
document.querySelectorAll('[data-add]').forEach(function(b){b.addEventListener('click',function(ev){ev.preventDefault();var c=document.getElementById('cc');c.textContent=+c.textContent+1;toast('Added to cart')})});
${script || ''}
</script></body></html>`;
}

function notActive(res) {
  res.status(403).type('html').send(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Instance not active</title><style>${CSS}</style></head><body><div class="notice"><h1>Lab not running</h1><p>This lab instance is not running. Go back to the room on AlexCyberX and press Start (or Restart) to open a fresh store.</p></div></body></html>`);
}

function card(slug, s) {
  const p = PRODUCTS[slug];
  const q = 'session=' + encodeURIComponent(s);
  return `<div class="card" style="position:relative"><a class="pic" href="product?item=${slug}&amp;${q}"><img src="img/${slug}.webp?${q}" alt="${esc(p.name)}" loading="lazy"></a>${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
<div class="body"><h3><a href="product?item=${slug}&amp;${q}">${esc(p.name)}</a></h3><div class="meta">${esc(p.meta)}</div><div class="meta"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${p.rating} (${p.count})</div>
<div class="row"><span class="price">${rupee(p.price)}<span class="mrp">${rupee(p.mrp)}</span></span><a class="add" href="#" data-add>Add</a></div></div></div>`;
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
  if (!isRunning(s)) return notActive(res);
  const q = 'session=' + encodeURIComponent(s);
  const body = `<section class="hero"><div class="wrap"><div><div class="kicker">Haridwar se, 1962 se</div><h1>Daadi ka nuskha,<br>ab tube mein.</h1><p>Laung, neem and real kesar. No chemical shine, just the old desi asar.</p><a class="btn btn-red" href="product?item=kesar&amp;${q}">Shop Kesar Gold</a> &nbsp; <a class="btn btn-line" href="#kahani">Humari Kahani</a></div><img class="heroimg" src="img/hero.webp?${q}" alt="Ayurdant toothpaste range"></div></section>
<div class="trust"><div><b>4 lakh+</b>happy customers</div><div><b>11 jadibootiyan</b>in every tube</div><div><b>Free delivery</b>above &#8377;299</div><div><b>Cash on delivery</b>all over India</div></div>
<section class="sec"><div class="wrap"><h2>Humare products</h2><p class="lead">Four nuskhe, loved in every ghar.</p><div class="grid">${Object.keys(PRODUCTS).map((k) => card(k, s)).join('')}</div></div></section>
<section class="sec" id="combo" style="padding-top:0"><div class="wrap"><div class="offer"><div><h3>Diwali par 20% off</h3><p>On every combo pack. Only till 15 November.</p></div><span class="code">DAADI20</span></div></div></section>
<section class="sec" id="kahani" style="padding-top:0"><div class="wrap"><h2>Humari Kahani</h2><p class="lead" style="max-width:720px">In 1962 Savitri Devi started grinding dant manjan for her neighbours in Haridwar. Today her grandchildren run Ayurdant, and she still signs off every batch of Kesar Gold herself. The Kesar Gold recipe has never left the family: it lives only in her vault.</p></div></section>`;
  res.set('Cache-Control', 'no-store').type('html').send(page('Ayurdant: daadi ka nuskha, ab tube mein', s, readSession(req), body));
});

// ── Product page (reviews load from the API) ──
router.get('/product', (req, res, next) => {
  const s = sid(req);
  const slug = typeof req.query.item === 'string' ? req.query.item : '';
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, slug)) return next();
  if (!isRunning(s)) return notActive(res);
  const p = PRODUCTS[slug];
  const q = 'session=' + encodeURIComponent(s);
  const others = Object.keys(PRODUCTS).filter((k) => k !== slug).map((k) => `<a class="mini" href="product?item=${k}&amp;${q}"><img src="img/${k}.webp?${q}" alt=""><span><b>${esc(PRODUCTS[k].name)}</b><span>${rupee(PRODUCTS[k].price)}</span></span></a>`).join('');
  const body = `<div class="wrap"><div class="crumbs"><a href="page?${q}">Home</a> / Toothpaste / ${esc(p.name)}</div>
<div class="pd"><div class="big"><img src="img/${slug}.webp?${q}" alt="${esc(p.name)}"></div><div>
${p.tag ? `<div class="kicker">${p.tag}</div>` : ''}<h1>${esc(p.name)}</h1><div class="rate"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${p.rating} (${p.count} reviews)</div>
<span class="price">${rupee(p.price)}<span class="mrp">${rupee(p.mrp)}</span><span class="off">${off(p)}% off</span></span>
<ul>${p.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<span class="qty"><span>-</span><span>1</span><span>+</span></span><a class="btn btn-red" href="#" data-add>Add to cart</a>
<h2 style="font:26px/1.1 'Rozha One',serif;color:var(--maroon);font-weight:400;margin:30px 0 0">Reviews</h2>
<div id="revs"><div class="revload">Loading reviews...</div></div>
<div class="thumbs">${others}</div></div></div></div>`;
  const script = `
function e(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
fetch('api/reviews?product=${slug}&session='+encodeURIComponent(S)).then(function(r){return r.json()}).then(function(d){
  var h=(d.reviews||[]).map(function(r){
    return '<div class="rev"><div class="h">'+e(r.user)+' <span class="stars">'+'\\u2605'.repeat(r.rating)+'\\u2606'.repeat(5-r.rating)+'</span><span class="date">'+e(r.date)+'</span></div><p>'+e(r.text)+'</p>'+
      (r.reply?'<div class="reply"><b>'+e(r.reply.by.name)+'</b> <span class="staff">AYURDANT</span><br>'+e(r.reply.text)+'</div>':'')+'</div>';
  }).join('');
  document.getElementById('revs').innerHTML=h||'<div class="revload">No reviews yet.</div>';
}).catch(function(){document.getElementById('revs').innerHTML='<div class="revload">Could not load reviews.</div>'});`;
  res.set('Cache-Control', 'no-store').type('html').send(page(p.name + ': Ayurdant', s, readSession(req), body, script));
});

router.get('/api/reviews', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return res.status(403).json({ error: 'Instance not active' });
  const slug = typeof req.query.product === 'string' ? req.query.product : '';
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, slug)) return res.status(404).json({ error: 'Unknown product' });
  res.set('Cache-Control', 'no-store').json({ product: slug, reviews: reviewsFor(slug, instances[s]) });
});

// ── Login ──
router.get('/login', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(res);
  const q = 'session=' + encodeURIComponent(s);
  if (readSession(req)) return res.redirect(302, 'account?' + q);
  const body = `<div class="wrap"><div class="authwrap"><div class="authart"><img src="img/hero.webp?${q}" alt=""><p>"Daadi kehti thi, daant mazboot to sehat mazboot."</p></div>
<div class="form"><h2>Swagat hai</h2><p class="sub">Log in to your Ayurdant account.</p>
<div class="tabs"><button class="on" data-tab="in" type="button">Login</button><button data-tab="up" type="button">New account</button></div>
<form class="on" id="in"><div class="err" id="err">Wrong email or password.</div>
<label for="em">Email</label><input class="inp" id="em" autocomplete="username" value="${esc(CREDS.email)}">
<label for="pw">Password</label><input class="inp" id="pw" type="password" autocomplete="current-password" value="${esc(CREDS.password)}">
<button class="btn btn-red" type="submit">Login</button>
<p class="small" style="margin-top:14px">Lab note: Riya's login from the room is filled in for you.</p></form>
<form id="up"><p class="small" style="margin:0 0 16px">New accounts are paused during the Diwali rush. Please check back after 15 November.</p>
<label>Name</label><input class="inp" disabled><label>Email</label><input class="inp" disabled><button class="btn btn-red" type="button" disabled>Create account</button></form>
</div></div></div>`;
  const script = `
document.querySelectorAll('.tabs button').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('.tabs button').forEach(function(x){x.classList.toggle('on',x===b)});
  document.querySelectorAll('.form form').forEach(function(f){f.classList.toggle('on',f.id===b.dataset.tab)});
})});
document.getElementById('in').addEventListener('submit',function(ev){ev.preventDefault();
  fetch('login?session='+encodeURIComponent(S),{method:'POST',headers:{'Content-Type':'application/json','X-Lab-Session':S},body:JSON.stringify({email:document.getElementById('em').value,password:document.getElementById('pw').value})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){location.href='account?session='+encodeURIComponent(S)}else{document.getElementById('err').classList.add('show')}})
  .catch(function(){document.getElementById('err').classList.add('show')});
});`;
  res.set('Cache-Control', 'no-store').type('html').send(page('Login: Ayurdant', s, null, body, script));
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
  res.redirect(302, 'page?session=' + encodeURIComponent(s));
});

// ── Account (trusts the cookie) ──
function sideNav(s, user, on, isOwner) {
  const q = 'session=' + encodeURIComponent(s);
  const initial = esc((user.name.trim()[0] || 'A').toUpperCase());
  return `<aside class="side"><div class="who"><span class="av">${initial}</span><span><b>${esc(user.name)}${isOwner ? '<span class="staff">OWNER</span>' : ''}</b><small>Customer ID ${esc(user.uid)}</small></span></div>
<a class="${on === 'acct' ? 'on' : ''}" href="account?${q}">Mera Khaata</a><a href="account?${q}#orders">Orders</a><a href="account?${q}#address">Addresses</a>
<a class="${on === 'vault' ? 'on' : ''}" href="nuskha?${q}">Daadi ka Nuskha${isOwner ? '' : ' &#128274;'}</a><a href="logout?${q}">Logout</a></aside>`;
}

router.get('/account', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(res);
  const q = 'session=' + encodeURIComponent(s);
  const user = readSession(req);
  if (!user) return res.redirect(302, 'login?' + q);
  const inst = instances[s];
  const isOwner = user.role === 'owner' && user.uid === inst.ownerUid;
  const main = isOwner
    ? `<div class="stats"><div class="stat"><span>Orders today</span><b>418</b></div><div class="stat"><span>Revenue today</span><b>&#8377;61,240</b></div><div class="stat"><span>Kesar Gold stock</span><b>2,960</b></div></div>
<div class="panel"><h3>Namaste, Savitri ji</h3><p style="margin:0">Batch KG-1102 is waiting for your sign-off. The recipe is in your vault.</p></div>`
    : `<div class="panel"><h3>Mera Khaata</h3><div class="kv"><span>Name</span><b>${esc(user.name)}</b><span>Customer ID</span><b class="mono">${esc(user.uid)}</b><span>Account type</span><b>${esc(user.role)}</b><span>Email</span><b>${user.uid === inst.riyaUid ? esc(CREDS.email) : '-'}</b></div></div>
<div class="panel" id="orders"><h3>Orders</h3><div class="tbl"><table><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>
<tr><td class="mono">#AY-77310</td><td>29 Oct 2026</td><td>Kesar Gold x1, Neem Raksha x2</td><td>${rupee(357)}</td><td><span class="pill o">Shipped</span></td></tr>
<tr><td class="mono">#AY-76854</td><td>11 Oct 2026</td><td>Daadi ka Dant Manjan x1</td><td>${rupee(129)}</td><td><span class="pill">Delivered</span></td></tr>
<tr><td class="mono">#AY-75120</td><td>20 Sep 2026</td><td>Laung Shakti x3</td><td>${rupee(285)}</td><td><span class="pill r">Returned</span></td></tr></tbody></table></div></div>
<div class="panel" id="address"><h3>Address</h3><p style="margin:0">Riya Kapoor<br>B-14, Shanti Kunj, Jwalapur<br>Haridwar, Uttarakhand 249407</p></div>`;
  const body = `<div class="wrap"><div class="crumbs"><a href="page?${q}">Home</a> / Mera Khaata</div><div class="acct">${sideNav(s, user, 'acct', isOwner)}<div>${main}</div></div></div>`;
  res.set('Cache-Control', 'no-store').type('html').send(page('Mera Khaata: Ayurdant', s, user, body));
});

// ── The vault: owner only, decided from the cookie alone ──
router.get('/nuskha', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(res);
  const q = 'session=' + encodeURIComponent(s);
  const user = readSession(req);
  if (!user) return res.redirect(302, 'login?' + q);
  const inst = instances[s];
  const isOwner = user.role === 'owner' && user.uid === inst.ownerUid;
  let main;
  if (isOwner) {
    if (!inst.solved) logAttempt('AYURDANT', req.ip, 'vault:open', 'correct');
    inst.solved = true;
    main = `<div class="panel"><h3>Daadi ka Nuskha: Kesar Gold (1962)</h3>
<table><tbody><tr><td>Kashmiri kesar</td><td>2 g per 10 kg batch</td></tr><tr><td>Chandan powder</td><td>120 g</td></tr><tr><td>Laung oil</td><td>18 ml</td></tr><tr><td>Mulethi</td><td>90 g</td></tr><tr><td>Desi ghee (just a little)</td><td>"Andaaza se", says daadi</td></tr></tbody></table>
<p style="margin:16px 0 6px" class="small">Vault code, for family only:</p><div class="code" style="display:inline-block;word-break:break-all">${esc(FLAG)}</div></div>`;
  } else if (user.role === 'owner') {
    logAttempt('AYURDANT', req.ip, 'vault:role_mismatch', 'wrong');
    main = `<div class="panel"><h3>Security alert</h3><p style="margin:0 0 10px"><span class="pill r">BLOCKED</span></p><p style="margin:0">The role <b>owner</b> does not belong to customer ID <span class="mono">${esc(user.uid)}</span>. This attempt has been noted.</p></div>`;
  } else {
    main = `<div class="panel"><h3>Daadi ka Nuskha &#128274;</h3><p style="margin:0">This vault is only for the owner of Ayurdant.</p></div>`;
  }
  const body = `<div class="wrap"><div class="crumbs"><a href="page?${q}">Home</a> / <a href="account?${q}">Mera Khaata</a> / Daadi ka Nuskha</div><div class="acct">${sideNav(s, user, 'vault', isOwner)}<div>${main}</div></div></div>`;
  res.set('Cache-Control', 'no-store').type('html').send(page('Daadi ka Nuskha: Ayurdant', s, user, body));
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
