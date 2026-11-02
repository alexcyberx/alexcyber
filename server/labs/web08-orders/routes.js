// ── web-08 "Other People's Orders" (IDOR) ───────────────────────
// Gharkart, a fictional grocery store. The order page returns an order by its
// number WITHOUT checking it belongs to the signed-in customer (IDOR, OWASP
// Broken Access Control). The store owner's order carries the flag in its
// delivery note. Order numbers are random per instance, so a copied writeup
// ("open order 10418") does not transfer. All data is fake; the lab never
// touches a real table and holds no login token (it runs on the labs origin).
const express = require('express');
const { flagFor } = require('../flags');
const router  = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt }  = require('../../middleware/logger');
const { langFor, texts, fill, notActivePage, HTML_LANG, qs } = require('../i18n');
const TEXT = require('./i18n');
// Language of this request: ?lang= or the one the instance was opened in.
const L = (req) => langFor(req, instances[sid(req)]);
// Order data is written in English; these show it in the page language.
const EN_OWNER_NOTE = TEXT.en.data.owner_note;
function dataTr(T) {
  const D = T.data;
  return {
    item: (n) => D.items[n] || n,
    status: (v) => { const m = /^Delivered on (.+)$/.exec(v); if (m) return fill(D.delivered, { d: m[1] }); return v === 'Cancelled, refund sent' ? D.cancelled : v === 'Out for delivery' ? D.out : v; },
    note: (v) => (v.startsWith(EN_OWNER_NOTE) ? D.owner_note + v.slice(EN_OWNER_NOTE.length) : D.notes[v] || v),
    pay: (v) => { const m = /^UPI, paid on (.+)$/.exec(v); if (m) return fill(D.paid, { d: m[1] }); return ({ 'Refunded to UPI': D.refunded, 'Store account': D.store_acct, 'Cash on delivery': D.cod, UPI: D.upi })[v] || v; },
  };
}

const FLAG = flagFor('web-08');
const INSTANCE_DURATION_SEC = 15 * 60;
const CREDS = { email: 'rahul.s@gharkart.test', password: 'Gharkart@123' };
const instances = {};

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupee = (n) => '₹' + n.toLocaleString('en-IN');

// One fresh store per instance: Rahul's own orders, the owner's order (flag),
// and two decoy customers' orders, at random numbers spread around a base.
function buildStore() {
  const base = 10000 + Math.floor(Math.random() * 90000);
  const orders = {};
  const add = (offset, o) => { orders[base - offset] = { id: base - offset, ...o }; };
  add(0, {
    customer: 'Rahul Sharma', mine: true, placedAt: '21 Oct 2026, 6:12 pm',
    status: 'Delivered on 22 Oct 2026', statusColor: '#1d6b38',
    items: [
      { name: 'Whole wheat atta, 5 kg', qty: 1, price: 245 },
      { name: 'Toor dal, 1 kg', qty: 1, price: 162 },
      { name: 'Fresh paneer, 200 g', qty: 1, price: 90 },
      { name: 'Tomato, 1 kg', qty: 1, price: 48 }],
    delivery: 49, address: ['Rahul Sharma', 'Flat 302, Sai Residency, Vijay Nagar', 'Indore, Madhya Pradesh 452010', '+91 98260 1XXXX'],
    instructions: 'Please call before coming. Gate 2.', payment: 'UPI, paid on 21 Oct 2026',
  });
  add(55, {
    customer: 'Rahul Sharma', mine: true, placedAt: '12 Oct 2026, 9:40 am',
    status: 'Delivered on 13 Oct 2026', statusColor: '#1d6b38',
    items: [
      { name: 'Basmati rice, 5 kg', qty: 1, price: 520 },
      { name: 'Sunflower oil, 1 L', qty: 2, price: 320 },
      { name: 'Amul butter, 500 g', qty: 1, price: 265 }],
    delivery: 0, address: ['Rahul Sharma', 'Flat 302, Sai Residency, Vijay Nagar', 'Indore, Madhya Pradesh 452010', '+91 98260 1XXXX'],
    instructions: 'Leave with the watchman if not home.', payment: 'UPI, paid on 12 Oct 2026',
  });
  add(131, {
    customer: 'Rahul Sharma', mine: true, placedAt: '2 Oct 2026, 7:05 pm',
    status: 'Cancelled, refund sent', statusColor: '#8a2c0a',
    items: [{ name: 'Cold drink, 2 L', qty: 2, price: 190 }, { name: 'Potato chips, 90 g', qty: 3, price: 150 }],
    delivery: 49, address: ['Rahul Sharma', 'Flat 302, Sai Residency, Vijay Nagar', 'Indore, Madhya Pradesh 452010', '+91 98260 1XXXX'],
    instructions: '', payment: 'Refunded to UPI',
  });
  // The store owner's own order. The delivery note carries the flag.
  add(14, {
    customer: 'Meera Joshi (Gharkart)', owner: true, placedAt: '19 Oct 2026, 10:03 am',
    status: 'Out for delivery', statusColor: '#8a5a00',
    items: [
      { name: 'Packing tape, brown, 6 rolls', qty: 2, price: 420 },
      { name: 'Garbage bags, large, 30 pcs', qty: 3, price: 285 },
      { name: 'A4 paper, 500 sheets', qty: 1, price: 310 }],
    delivery: 0, address: ['Meera Joshi (Gharkart)', '14, Old Palasia, near Geeta Bhawan', 'Indore, Madhya Pradesh 452001', '+91 99260 4XXXX'],
    instructions: TEXT.en.data.owner_note + FLAG,
    payment: 'Store account',
  });
  add(3, {
    customer: 'Arjun Verma', placedAt: '20 Oct 2026, 1:22 pm',
    status: 'Delivered on 20 Oct 2026', statusColor: '#1d6b38',
    items: [{ name: 'Milk, 1 L', qty: 2, price: 120 }, { name: 'Brown bread', qty: 1, price: 45 }],
    delivery: 49, address: ['Arjun Verma', '22, Scheme 54, AB Road', 'Indore, Madhya Pradesh 452010', '+91 90390 7XXXX'],
    instructions: 'Ring the bell twice.', payment: 'Cash on delivery',
  });
  add(27, {
    customer: 'Sana Khan', placedAt: '18 Oct 2026, 5:48 pm',
    status: 'Delivered on 19 Oct 2026', statusColor: '#1d6b38',
    items: [{ name: 'Eggs, 12 pcs', qty: 1, price: 84 }, { name: 'Onion, 2 kg', qty: 1, price: 70 }, { name: 'Green chilli, 250 g', qty: 1, price: 20 }],
    delivery: 49, address: ['Sana Khan', '7, Nehru Nagar', 'Indore, Madhya Pradesh 452011', '+91 93020 2XXXX'],
    instructions: '', payment: 'UPI',
  });
  for (const o of Object.values(orders)) {
    o.itemTotal = o.items.reduce((a, i) => a + i.price, 0);
    o.total = o.itemTotal + (o.delivery || 0);
  }
  return { base, orders, loggedIn: false };
}

function getOrCreate(s) { if (!instances[s]) instances[s] = { startedAt: Date.now(), store: buildStore(), solved: false }; return instances[s]; }
function resetInst(s) { instances[s] = { startedAt: Date.now(), store: buildStore(), solved: false }; return instances[s]; }
function instStatus(s) {
  const inst = getOrCreate(s);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000));
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}
function isRunning(s) { const inst = instances[s]; if (!inst) return false; return (INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000)) > 0; }


// ── Shared chrome (store header) ──
function storeHeader(s, loggedIn, T, lang) {
  const q = qs(s, lang);
  return `<header class="shop-head">
    <div class="topstrip"><span>${T.delivering} <b>Indore 452010</b></span><span class="ts-links"><a href="#">${T.help}</a><a href="#">${T.track}</a></span></div>
    <div class="shop-row">
      <div class="logo">gharkart</div>
      <form class="search" onsubmit="return false"><input aria-label="${T.search_btn}" placeholder="${T.search_ph}"><button>${T.search_btn}</button></form>
      <div class="acct">${loggedIn ? '<a href="orders?' + q + '">' + T.hi + '</a><span>' + T.cart + ' (2)</span>' : '<a href="page?' + q + '">' + T.sign_in + '</a>'}</div>
    </div>
  </header>`;
}
function footer(T) {
  return `<footer class="shop-foot"><span>2026 Gharkart. ${T.foot}</span><span class="ft-links">${T.foot_links.map((l) => `<a href="#">${l}</a>`).join('')}</span></footer>`;
}
const STYLE = `<style>
*{box-sizing:border-box}
body{margin:0;background:#f4f4f2;font-family:'Noto Sans',Arial,sans-serif;color:#222}
a{color:#b4380b}
.shop-head{background:#fff;border-bottom:1px solid #e3e3df}
.topstrip{max-width:1180px;margin:0 auto;padding:6px 20px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12px;color:#555;border-bottom:1px solid #f0f0ec}
.topstrip b{color:#222}.ts-links{display:flex;gap:14px}.topstrip a{color:#555;text-decoration:none}
.shop-row{max-width:1180px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.logo{font-size:26px;font-weight:700;color:#b4380b;letter-spacing:-.5px}
.search{flex:1 1 320px;display:flex;min-width:0;margin:0}.search input{flex:1;min-width:0;border:1px solid #c7c7c2;border-right:0;border-radius:4px 0 0 4px;padding:9px 11px;font:14px Arial,sans-serif}
.search button{background:#b4380b;color:#fff;border:0;border-radius:0 4px 4px 0;padding:0 16px;font:600 13px Arial,sans-serif;cursor:pointer}
.acct{display:flex;gap:16px;align-items:center;font-size:13.5px}.acct a{color:#222;text-decoration:none}
.wrap{max-width:1180px;margin:0 auto;padding:22px 20px 32px}
.card{background:#fff;border:1px solid #e0e0dc;border-radius:6px}
.shop-foot{background:#fff;border-top:1px solid #e3e3df;padding:16px 20px;font-size:12px;color:#666;display:flex;flex-wrap:wrap;gap:18px;justify-content:space-between;max-width:1180px;margin:0 auto}
.ft-links{display:flex;gap:16px}.shop-foot a{color:#666;text-decoration:none}
h1{font-size:20px;font-weight:600;margin:0 0 12px}
.crumb{font-size:13px;color:#666;margin-bottom:12px}
.orow{display:flex;flex-wrap:wrap;gap:12px 28px;align-items:center;padding:14px 16px;border:1px solid #e0e0dc;border-radius:6px;background:#fff;margin-bottom:12px}
.orow .k{font-size:12px;color:#777}.orow a{font-size:13.5px;font-weight:600}
.btn{background:#b4380b;color:#fff;border:0;border-radius:4px;padding:10px 14px;font:600 13px Arial,sans-serif;cursor:pointer}
.btn.g{background:#fff;color:#b4380b;border:1px solid #b4380b}
table{width:100%;border-collapse:collapse;font-size:14px;min-width:420px}
th{padding:10px 16px;font-weight:500;color:#666;font-size:12.5px;text-align:left}
td{padding:10px 16px;border-top:1px solid #f0f0ec}
.login{max-width:400px;margin:40px auto;display:flex;flex-direction:column;gap:16px}
.login .note{background:#161a19;color:#c9cfcc;border-radius:8px;padding:12px 14px;font:13px/1.6 Arial,sans-serif}
.login .note b{color:#34d399}.login .note code{font-family:'JetBrains Mono',monospace;color:#f2f5f4}
.login .box{background:#fff;border:1px solid #e0e0dc;border-radius:6px;padding:26px;display:flex;flex-direction:column;gap:14px}
.login label{font-size:13px;font-weight:500;color:#444;display:block;margin-bottom:6px}
.login input{width:100%;border:1px solid #c7c7c2;border-radius:4px;padding:10px 11px;font:14px Arial,sans-serif}
.err{color:#b00020;font-size:13px;display:none}.err.show{display:block}
@media(max-width:600px){.acct{font-size:12.5px;gap:10px}}
</style>`;
const HEAD = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet">`;

function page(title, s, bodyInner, lang = 'en') {
  return `<!DOCTYPE html><html lang="${HTML_LANG[lang]}"><head>${HEAD}<title>${esc(title)}</title>${STYLE}</head><body>
${bodyInner}
<script>
var S=${JSON.stringify(String(s)).replace(/</g, '\\u003c')};
var LANG=${JSON.stringify(lang)};
</script>
</body></html>`;
}

function notActive(req, res) {
  res.status(403).type('html').send(notActivePage(req, 'background:#f4f4f2;color:#222'));
}

// ── Instance endpoints ──
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));
router.post('/instance/restart', (req, res) => { resetInst(sid(req)); logAttempt('ORDERS', req.ip, 'instance_restart', 'ok'); res.json({ success: true, ...instStatus(sid(req)) }); });
router.post('/instance/stop', (req, res) => { const s = sid(req); if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000; res.json({ success: true, running: false, remaining_sec: 0 }); });

// ── Login page / sign-in ──
router.get('/page', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  const inst = getOrCreate(s);
  const lang = L(req), T = texts(TEXT, lang);
  if (inst.store.loggedIn) return res.redirect(302, 'orders?' + qs(s, lang, false));
  const body = `${storeHeader(s, false, T, lang)}
<div class="wrap"><div class="login">
  <div class="note"><b>${T.note_b}</b>: ${T.note}<br><code>${CREDS.email}</code> / <code>${CREDS.password}</code></div>
  <form class="box" id="loginForm">
    <h1>${T.sign_in}</h1>
    <div class="err" id="err">${T.wrong}</div>
    <div><label for="em">${T.em_label}</label><input id="em" value="${CREDS.email}"></div>
    <div><label for="pw">${T.pw}</label><input id="pw" type="password" value="${CREDS.password}"></div>
    <label style="font-weight:400"><input type="checkbox" checked> ${T.keep}</label>
    <button class="btn" type="submit">${T.sign_in}</button>
  </form>
</div></div>
${footer(T)}
<script>
document.getElementById('loginForm').addEventListener('submit',function(e){e.preventDefault();
  fetch('login?session='+encodeURIComponent(S),{method:'POST',headers:{'Content-Type':'application/json','X-Lab-Session':S},body:JSON.stringify({email:document.getElementById('em').value,password:document.getElementById('pw').value})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){location.href='orders?session='+encodeURIComponent(S)+'&lang='+LANG}else{document.getElementById('err').classList.add('show')}}).catch(function(){document.getElementById('err').classList.add('show')});
});
</script>`;
  res.type('html').send(page(T.t_signin, s, body, lang));
});

router.post('/login', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return res.status(403).json({ error: 'Instance not active' });
  const b = req.body || {};
  if (typeof b.email !== 'string' || typeof b.password !== 'string') return res.status(400).json({ error: 'Email and password required.' });
  if (b.email.trim().toLowerCase() === CREDS.email && b.password === CREDS.password) {
    getOrCreate(s).store.loggedIn = true;
    logAttempt('ORDERS', req.ip, 'login', 'ok');
    return res.json({ success: true });
  }
  logAttempt('ORDERS', req.ip, 'login:wrong', 'fail');
  res.status(401).json({ success: false });
});

// ── My orders (only Rahul's) ──
router.get('/orders', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  const inst = getOrCreate(s);
  const lang = L(req), T = texts(TEXT, lang), tr = dataTr(T);
  if (!inst.store.loggedIn) return res.redirect(302, 'page?' + qs(s, lang, false));
  const mine = Object.values(inst.store.orders).filter((o) => o.mine).sort((a, b) => b.id - a.id);
  const rows = mine.map((o) => `<div class="orow">
    <div style="flex:1 1 140px"><div class="k">${T.k_order}</div><div style="font-weight:600">#${o.id}</div></div>
    <div style="flex:1 1 140px"><div class="k">${T.placed}</div><div>${esc(o.placedAt.split(',')[0])}</div></div>
    <div style="flex:1 1 100px"><div class="k">${T.total}</div><div>${rupee(o.total)}</div></div>
    <div style="flex:1 1 160px"><div class="k">${T.status}</div><div style="color:${o.statusColor}">${esc(tr.status(o.status))}</div></div>
    <a href="order/${o.id}?${qs(s, lang)}">${T.view}</a>
  </div>`).join('');
  const body = `${storeHeader(s, true, T, lang)}
<div class="wrap">
  <h1>${T.my_orders}</h1>
  ${rows}
  <div style="font-size:12.5px;color:#777;padding-top:4px">${fill(T.showing, { n: mine.length })}</div>
</div>
${footer(T)}`;
  res.type('html').send(page(T.t_orders, s, body, lang));
});

// ── One order by number. THE BUG: no check that it is the signed-in user's. ──
router.get('/order/:id', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(req, res);
  const inst = getOrCreate(s);
  const lang = L(req), T = texts(TEXT, lang), tr = dataTr(T), q = qs(s, lang);
  // Links inside /order/<id> point one level up.
  if (!inst.store.loggedIn) return res.redirect(302, '../page?' + qs(s, lang, false));
  const o = inst.store.orders[parseInt(req.params.id, 10)];
  if (!o) {
    const body = `${storeHeader(s, true, T, lang).replace(/href="(orders|page)\?/g, 'href="../$1?')}<div class="wrap"><div class="crumb"><a href="../orders?${q}">${T.my_orders}</a> / ${T.not_found}</div><div class="card" style="padding:40px;text-align:center;color:#666">${T.no_order}</div></div>${footer(T)}`;
    return res.status(404).type('html').send(page(T.t_nf, s, body, lang));
  }
  const rows = o.items.map((i) => `<tr><td>${esc(tr.item(i.name))}</td><td>${i.qty}</td><td style="text-align:right">${rupee(i.price)}</td></tr>`).join('');
  const body = `${storeHeader(s, true, T, lang).replace(/href="(orders|page)\?/g, 'href="../$1?')}
<div class="wrap">
  <div class="crumb"><a href="../orders?${q}">${T.my_orders}</a> / ${fill(T.order_h, { id: o.id })}</div>
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:16px">
    <div><h1 style="margin:0">${fill(T.order_h, { id: o.id })}</h1><div style="font-size:13px;color:#666;margin-top:4px">${fill(T.placed_on, { d: esc(o.placedAt) })}</div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn g">${T.invoice}</button><button class="btn">${T.reorder}</button></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
    <div class="card" style="flex:999 1 560px;min-width:0">
      <div style="padding:12px 16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:13.5px"><span style="color:${o.statusColor};font-weight:600">${esc(tr.status(o.status))}</span><span style="color:#666">${fill(T.n_items, { n: o.items.length })}</span></div>
      <div style="overflow-x:auto"><table><thead><tr><th>${T.th[0]}</th><th>${T.th[1]}</th><th style="text-align:right">${T.th[2]}</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div style="padding:12px 16px;border-top:1px solid #eee;display:flex;flex-direction:column;gap:6px;font-size:13.5px">
        <div style="display:flex;justify-content:space-between"><span style="color:#555">${T.item_total}</span><span>${rupee(o.itemTotal)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:#555">${T.delivery_fee}</span><span>${rupee(o.delivery)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:600;font-size:15px;padding-top:6px;border-top:1px solid #f0f0ec"><span>${T.total_paid}</span><span>${rupee(o.total)}</span></div>
      </div>
    </div>
    <div style="flex:1 1 300px;display:flex;flex-direction:column;gap:16px">
      <div class="card" style="padding:14px 16px;font-size:13.5px;line-height:1.6"><div style="font-weight:600;margin-bottom:6px">${T.addr}</div>${o.address.map(esc).join('<br>')}</div>
      <div class="card" style="padding:14px 16px;font-size:13.5px;line-height:1.6"><div style="font-weight:600;margin-bottom:6px">${T.instr}</div>${o.instructions ? esc(tr.note(o.instructions)) : '<span style="color:#888">' + T.none + '</span>'}</div>
      <div class="card" style="padding:14px 16px;font-size:13.5px;line-height:1.6"><div style="font-weight:600;margin-bottom:6px">${T.payment}</div>${esc(tr.pay(o.payment))}</div>
    </div>
  </div>
</div>
${footer(T)}`;
  res.type('html').send(page(fill(T.t_order, { id: o.id }), s, body, lang));
});

// ── Flag submit (the CTF page posts to the MAIN server; this is a fallback) ──
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body || {};
  const s = sid(req);
  if (typeof flag !== 'string' || !flag.trim()) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('ORDERS', req.ip, 'submit', correct ? 'correct' : 'wrong');
  if (correct) { getOrCreate(s).solved = true; return res.json({ success: true, flag: FLAG, message: 'The order page never checked who owned the order. Always check ownership on the server.' }); }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

router._instances = instances;
module.exports = router;
