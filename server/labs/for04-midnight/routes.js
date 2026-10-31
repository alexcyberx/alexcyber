// ── for-04 "Midnight Login" (log analysis) ─────────────────────
// Paynova SOC, the security portal of a fictional company. The student gets
// the SSH auth.log of the server vpn-gw01 and files an incident report: the
// attacker's IP, the account they broke into and the time of that login.
// The trap: one IP fails the most but never gets in; the attacker is the IP
// whose run of failures ends in "Accepted password". An employee who mistyped
// a password once is a second, harmless "Accepted password" line.
//
// Every instance gets its own random seed, so the IPs (RFC 5737 documentation
// ranges, never real hosts), the broken account and the time differ per
// student and a copied writeup does not transfer. Only the seed and the
// answers are kept in memory; the log is rebuilt from the seed when it is
// fetched. The log is plain text and the viewer renders it with textContent:
// nothing in it is ever run. The report is checked here (rate limited) and the
// flag is sent only after all three answers are right. All data is made up.
const express = require('express');
const crypto = require('crypto');
const { flagFor } = require('../flags');
const router = express.Router();
const { flagLimiter } = require('../../middleware/rateLimit');
const { logAttempt } = require('../../middleware/logger');

const FLAG = flagFor('for-04');
const INSTANCE_DURATION_SEC = 30 * 60;
const instances = {};

function sid(req) { return req.headers['x-lab-session'] || req.query.session || req.ip; }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── The case, built from one seed ──
// mulberry32: small, fast and the same output for the same seed every time.
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86400;
const pad = (n) => String(n).padStart(2, '0');
// Times are whole seconds from 30 Oct 2026 00:00 server time (IST).
const clock = (t) => pad(Math.floor(t / 3600) % 24) + ':' + pad(Math.floor(t / 60) % 60) + ':' + pad(t % 60);
const stamp = (t) => 'Oct ' + (30 + Math.floor(t / DAY)) + ' ' + clock(t);

const STAFF = [
  { u: 'rajesh.k', uid: 1001 }, { u: 'priya.m', uid: 1002 }, { u: 'arjun.s', uid: 1004 },
  { u: 'neha.p', uid: 1005 }, { u: 'vikram.r', uid: 1006 }, { u: 'sneha.d', uid: 1007 },
];
// Service accounts with password login still on: one of them gets broken into.
const SERVICE = [
  { u: 'deploy', uid: 1003, ip: '10.20.0.8' },
  { u: 'backup', uid: 1010, ip: '10.20.0.15' },
  { u: 'jenkins', uid: 1011, ip: '10.20.0.9' },
];
const RANGES = ['192.0.2.', '198.51.100.', '203.0.113.'];
const INVALID = ['admin', 'test', 'oracle', 'ubuntu', 'pi', 'guest', 'user', 'postgres', 'ftpuser', 'support', 'git', 'mysql'];
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function buildCase(seed) {
  const r = rng(seed);
  const int = (a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const ev = [];
  let seq = 0;
  const add = (t, msg) => ev.push([t, seq++, msg]);
  const port = () => int(32768, 60999);
  // PIDs and logind session numbers are placeholders here and are numbered
  // in time order after sorting, so they grow through the day like on a real box.
  let ids = 0;
  const pid = () => '{{P' + (ids++) + '}}';
  const sessNo = () => '{{S' + (ids++) + '}}';
  const key = () => { let s = ''; for (let i = 0; i < 43; i++) s += B64[Math.floor(r() * 64)]; return s; };

  // Attacker and decoy come from two different ranges. Last octet from 11 so
  // no answer ever equals the form's example (192.0.2.10).
  const used = new Set();
  const extIp = (range) => { let ip; do { ip = range + int(11, 254); } while (used.has(ip)); used.add(ip); return ip; };
  const order = [0, 1, 2];
  for (let i = 2; i > 0; i--) { const j = int(0, i); [order[i], order[j]] = [order[j], order[i]]; }
  const attacker = extIp(RANGES[order[0]]);
  const decoy = extIp(RANGES[order[1]]);
  const scanners = [extIp(RANGES[order[2]]), extIp(RANGES[int(0, 2)]), extIp(RANGES[int(0, 2)])];
  const target = pick(SERVICE);

  // The break-in: accepted between 01:35 and 04:10 on 31 Oct.
  const T = DAY + int(95 * 60, 250 * 60);
  const opened = T + int(12, 22) * 60;
  const start = 8 * 3600 + int(5, 35) * 60;
  const end = T + int(26, 34) * 60;

  function session(u, uid, ip, t, how, dur, extra) {
    const p = pid(), pt = port(), n = sessNo();
    add(t, `sshd[${p}]: Accepted ${how} for ${u} from ${ip} port ${pt} ssh2${extra || ''}`);
    add(t, `sshd[${p}]: pam_unix(sshd:session): session opened for user ${u}(uid=${uid}) by (uid=0)`);
    add(t, `systemd-logind[612]: New session ${n} of user ${u}.`);
    return { p, pt, n, close(te) {
      add(te, `sshd[${p}]: Received disconnect from ${ip} port ${pt}:11: disconnected by user`);
      add(te, `sshd[${p}]: Disconnected from user ${u} ${ip} port ${pt}`);
      add(te, `sshd[${p}]: pam_unix(sshd:session): session closed for user ${u}`);
      add(te, `systemd-logind[612]: Removed session ${n}.`);
    } };
  }
  const keyLogin = (s, t, dur) => session(s.u, s.uid, s.ip, t, 'publickey', dur, ': ED25519 SHA256:' + s.key).close(t + dur);

  // One SSH connection that fails `tries` times and is closed (or, with
  // `win`, ends in a password login on the same connection).
  function attempt(ip, u, t, tries, win) {
    const valid = u === target.u || u === 'root';
    const p = pid(), pt = port();
    if (!valid) add(t, `sshd[${p}]: Invalid user ${u} from ${ip} port ${pt}`);
    for (let k = 0; k < tries; k++) {
      t += int(1, 3);
      add(t, `sshd[${p}]: Failed password for ${valid ? '' : 'invalid user '}${u} from ${ip} port ${pt} ssh2`);
    }
    if (win) return t;
    add(t + 1, `sshd[${p}]: Connection closed by ${valid ? 'authenticating' : 'invalid'} user ${u} ${ip} port ${pt} [preauth]`);
    return t + 1;
  }

  // Staff log in with SSH keys from their own machines during the day.
  const staff = STAFF.map((s) => ({ ...s, ip: '10.20.' + int(1, 7) + '.' + int(20, 220), key: key() }));
  for (const s of staff) {
    const n = int(8, 13);
    for (let k = 0; k < n; k++) keyLogin(s, int(8 * 3600 + 1800, 21 * 3600), int(4 * 60, 150 * 60));
  }
  const onCall = pick(staff);
  keyLogin(onCall, DAY + int(20 * 60, 60 * 60), int(6 * 60, 18 * 60));

  // Service accounts: CI deploys, the nightly backup, build jobs.
  const svc = SERVICE.map((s) => ({ ...s, key: key() }));
  for (let t = 9 * 3600 + int(0, 1800); t < 20 * 3600; t += int(30 * 60, 80 * 60)) keyLogin(svc[0], t, int(25, 140));
  keyLogin(svc[1], 23 * 3600 + 30 * 60 + int(0, 120), int(9 * 60, 16 * 60));
  for (let k = 0; k < 6; k++) keyLogin(svc[2], int(10 * 3600, 19 * 3600), int(40, 300));

  // An employee mistypes a password once, then gets in. Harmless.
  const typo = pick(staff);
  {
    const t = int(10 * 3600, 18 * 3600), p = pid(), pt = port(), n = sessNo();
    add(t, `sshd[${p}]: Failed password for ${typo.u} from ${typo.ip} port ${pt} ssh2`);
    add(t + 6, `sshd[${p}]: Accepted password for ${typo.u} from ${typo.ip} port ${pt} ssh2`);
    add(t + 6, `sshd[${p}]: pam_unix(sshd:session): session opened for user ${typo.u}(uid=${typo.uid}) by (uid=0)`);
    add(t + 6, `systemd-logind[612]: New session ${n} of user ${typo.u}.`);
    const te = t + int(20 * 60, 70 * 60);
    add(te, `sshd[${p}]: Disconnected from user ${typo.u} ${typo.ip} port ${pt}`);
    add(te, `sshd[${p}]: pam_unix(sshd:session): session closed for user ${typo.u}`);
  }

  // Cron, every 15 minutes.
  for (let t = Math.ceil(start / 900) * 900; t <= end; t += 900) {
    const p = pid();
    add(t + 1, `CRON[${p}]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)`);
    add(t + 2, `CRON[${p}]: pam_unix(cron:session): session closed for user root`);
  }

  // Internet noise: a few scanners try a handful of names and leave.
  for (const ip of scanners) {
    let t = int(start + 600, DAY + 3600);
    const n = int(3, 7);
    for (let k = 0; k < n; k++) t = attempt(ip, r() < 0.5 ? 'root' : pick(INVALID), t + int(2, 9), 1) + 0;
  }

  // The decoy: the loudest IP in the log, about 400 failures, never gets in.
  {
    let t = T - int(40, 90) * 60 - 700;
    const want = int(360, 440);
    let fails = 0;
    while (fails < want) {
      const tries = Math.min(int(1, 3), want - fails);
      t = attempt(decoy, r() < 0.35 ? 'root' : pick(INVALID), t + int(0, 2), tries);
      fails += tries;
    }
  }

  // The attacker: guesses a few names, then hammers one real account until a
  // password works, uses sudo, and leaves a few minutes later.
  let fails = 0;
  {
    const want = int(190, 250);
    const firstPhase = int(30, 50);
    // Start early enough that the last failure lands just before T.
    let t = T - Math.round(want * 2.8) - 30;
    while (fails < want) {
      const tries = Math.min(int(1, 3), want - fails);
      const u = fails < firstPhase ? pick(['root', 'admin', 'support', 'test', target.u]) : target.u;
      t = attempt(attacker, u, t + int(0, 1), tries);
      fails += tries;
      if (t > T - 12) break;
    }
    const p = pid(), pt = port(), n = sessNo();
    add(T - 4, `sshd[${p}]: Failed password for ${target.u} from ${attacker} port ${pt} ssh2`);
    add(T, `sshd[${p}]: Accepted password for ${target.u} from ${attacker} port ${pt} ssh2`);
    add(T, `sshd[${p}]: pam_unix(sshd:session): session opened for user ${target.u}(uid=${target.uid}) by (uid=0)`);
    add(T, `systemd-logind[612]: New session ${n} of user ${target.u}.`);
    const ts = T + int(25, 70);
    add(ts, `sudo:   ${target.u} : TTY=pts/0 ; PWD=/home/${target.u} ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow`);
    add(ts, `sudo: pam_unix(sudo:session): session opened for user root(uid=0) by ${target.u}(uid=${target.uid})`);
    add(ts + 1, 'sudo: pam_unix(sudo:session): session closed for user root');
    const te = T + int(4 * 60, 9 * 60);
    add(te, `sshd[${p}]: Received disconnect from ${attacker} port ${pt}:11: disconnected by user`);
    add(te, `sshd[${p}]: Disconnected from user ${target.u} ${attacker} port ${pt}`);
    add(te, `sshd[${p}]: pam_unix(sshd:session): session closed for user ${target.u}`);
    add(te, `systemd-logind[612]: Removed session ${n}.`);
  }

  const num = {};
  let nextPid = int(1200, 4000), nextSess = int(180, 420);
  const fill = (msg) => msg.replace(/\{\{([PS])(\d+)\}\}/g, (x, kind, id) => {
    if (!(id in num)) num[id] = kind === 'P' ? (nextPid += int(3, 37)) : nextSess++;
    return num[id];
  });
  const lines = ev
    .filter((e) => e[0] >= start && e[0] <= end)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .map((e) => stamp(e[0]) + ' vpn-gw01 ' + fill(e[2]));
  return {
    lines,
    ans: { ip: attacker, user: target.u, t: T },
    meta: { decoy, scanners, opened, caseNo: 1000 + (seed % 9000), count: lines.length },
  };
}

function newInst() {
  const seed = crypto.randomInt(1, 2 ** 31 - 1);
  const c = buildCase(seed);
  return { startedAt: Date.now(), seed, ans: c.ans, meta: c.meta, solved: false };
}
function getOrCreate(s) { if (!instances[s]) instances[s] = newInst(); return instances[s]; }
function resetInst(s) { instances[s] = newInst(); return instances[s]; }
function instStatus(s) {
  const inst = getOrCreate(s);
  const remaining = Math.max(0, INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000));
  return { running: remaining > 0, remaining_sec: remaining, solved: inst.solved };
}
function isRunning(s) { const inst = instances[s]; if (!inst) return false; return (INSTANCE_DURATION_SEC - Math.floor((Date.now() - inst.startedAt) / 1000)) > 0; }
function fmtTime(sec) { const m = Math.floor(sec / 60), ss = sec % 60; return m + ':' + String(ss).padStart(2, '0'); }

// ── Page ──
const HEAD = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet">`;
const STYLE = `<style>
*{box-sizing:border-box}
body{margin:0;background:#f1f3f7;font-family:'Noto Sans',Arial,sans-serif;color:#1c2333}
.labbar{background:#111413;color:#c9cfcc;font:500 12.5px Arial,sans-serif;padding:9px 20px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
.lb-left{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.lb-brand{color:#f2f5f4;font-weight:700}.lb-sep{color:#3a3f3d}
.lb-pill{font-size:11px;padding:2px 8px;border-radius:20px;background:rgba(251,146,60,0.12);color:#fdba74}.lb-pill.ok{background:rgba(52,211,153,.14);color:#34d399}
.lb-right{display:flex;align-items:center;gap:16px}.lb-time{font-family:'JetBrains Mono',monospace;color:#34d399}.lb-right a{color:#34d399;text-decoration:none}
.top{background:#1e1b4b;color:#e0e7ff}
.top .in{max-width:1280px;margin:0 auto;display:flex;align-items:center;gap:26px;padding:0 20px;height:52px}
.logo{display:flex;align-items:center;gap:8px;font-weight:700;font-size:16px;color:#fff}.logo svg{width:22px;height:22px}
.nav{display:flex;gap:4px;height:100%}.nav a{display:flex;align-items:center;padding:0 12px;font-size:13px;color:#a5b4fc;text-decoration:none;border-bottom:2px solid transparent}.nav a.on{color:#fff;border-bottom-color:#818cf8}
.who{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:12.5px;color:#c7d2fe}.av{width:28px;height:28px;border-radius:50%;background:#4338ca;display:grid;place-items:center;font-weight:700;font-size:11px;color:#fff}
.wrap{max-width:1280px;margin:0 auto;padding:20px}
.case{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin-bottom:16px}
.case h1{font-size:20px;margin:0;flex-basis:100%}
.cid{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#4b5563}
.pill{font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:20px}
.sev{background:#fee2e2;color:#b91c1c}.st{background:#e0e7ff;color:#3730a3}.st.closed{background:#dcfce7;color:#166534}
.meta{font-size:12.5px;color:#6b7280}
.grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start}
.col{display:flex;flex-direction:column;gap:18px;min-width:0}
.card{background:#fff;border:1px solid #dde1ea;border-radius:8px;min-width:0}
.card h2{font-size:14px;margin:0;padding:12px 16px;border-bottom:1px solid #edf0f5}
.card .body{padding:14px 16px;font-size:13.5px;line-height:1.6;color:#374151}
.ev{display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #edf0f5}
.file{display:flex;align-items:center;gap:10px;flex:1;min-width:200px}
.file .ic{width:36px;height:36px;border-radius:8px;background:#eef2ff;color:#4338ca;display:grid;place-items:center;flex-shrink:0}
.file b{display:block;font-family:'JetBrains Mono',monospace;font-size:13px}.file small{font-size:12px;color:#6b7280}
.btn{background:#4338ca;color:#fff;border:0;border-radius:6px;padding:9px 16px;font:700 13px 'Noto Sans',Arial,sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;text-decoration:none}
.btn:hover{background:#3730a3}.btn:disabled{opacity:.6;cursor:default}
.btn.g{background:#fff;color:#4338ca;border:1px solid #c7d2fe}.btn.g:hover{background:#eef2ff}
.vtools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 16px}
.search{flex:1;min-width:200px;display:flex;align-items:center;gap:8px;border:1px solid #cdd3df;border-radius:6px;padding:7px 10px;background:#fff}
.search:focus-within{border-color:#818cf8;box-shadow:0 0 0 3px rgba(129,140,248,.18)}
.search input{border:0;outline:0;font:13px 'JetBrains Mono',monospace;width:100%;color:#1c2333;background:transparent}
.chip{font:12px 'Noto Sans',Arial,sans-serif;padding:5px 10px;border-radius:20px;border:1px solid #cdd3df;background:#fff;color:#374151;cursor:pointer}
.chip:hover{border-color:#a5b4fc}.chip.on{background:#eef2ff;border-color:#a5b4fc;color:#3730a3;font-weight:700}
.count{font-size:12px;color:#6b7280;padding:0 16px 8px}
.log{margin:0 16px 16px;border:1px solid #dde1ea;border-radius:6px;background:#0f172a;color:#cbd5e1;font:12px/1.7 'JetBrains Mono',monospace;height:420px;overflow:auto;white-space:pre}
.log .row{padding:0 10px}
.log .ln{display:inline-block;min-width:46px;color:#475569;text-align:right;padding-right:12px;user-select:none}
.log .fail{color:#fca5a5}.log .ok{color:#86efac}
.log .empty{padding:14px;color:#94a3b8;white-space:normal;font-family:'Noto Sans',Arial,sans-serif}
.form{padding:14px 16px;display:flex;flex-direction:column;gap:12px;margin:0}
.form label{font-size:12.5px;font-weight:700;color:#374151;display:block;margin-bottom:5px}
.inp{width:100%;border:1px solid #cdd3df;border-radius:6px;padding:8px 10px;font:13px 'JetBrains Mono',monospace;color:#1c2333;background:#fff}
.inp:focus{outline:0;border-color:#818cf8;box-shadow:0 0 0 3px rgba(129,140,248,.18)}
.inp.bad{border-color:#dc2626;background:#fef2f2}.inp.good{border-color:#16a34a;background:#f0fdf4}
.msg{font-size:13px;line-height:1.5;border-radius:6px;padding:10px 12px;background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
.tip{font-size:12px;color:#6b7280;padding:0 16px 14px}
.win{margin:0 16px 16px;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:8px;padding:14px}
.win b{color:#166534}.win p{margin:4px 0 10px;font-size:13px;line-height:1.55;color:#166534}.win p.next{margin:12px 0 0;color:#374151}
.flag{display:flex;gap:8px;align-items:stretch}.flag code{flex:1;min-width:0;font:13px 'JetBrains Mono',monospace;background:#fff;border:1px dashed #86efac;border-radius:6px;padding:9px 10px;color:#14532d;word-break:break-all}
.foot{max-width:1280px;margin:0 auto;padding:4px 20px 24px;font-size:12px;color:#6b7280}
@media (max-width:900px){.grid{grid-template-columns:1fr}.nav{display:none}.log{height:320px}.top .in{gap:14px}}
@media (max-width:520px){.wrap{padding:14px}.who span:first-child{display:none}.flag{flex-direction:column}}
</style>`;

const LOGO = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3z" stroke="#a5b4fc" stroke-width="1.8"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function reportForm() {
  return `<h2>Incident report</h2>
<form class="form" id="rep" novalidate>
  <div><label for="fIp">Attacker IP address</label><input class="inp" id="fIp" name="ip" placeholder="e.g. 192.0.2.10" autocomplete="off" spellcheck="false" maxlength="64"></div>
  <div><label for="fUser">Account they broke into</label><input class="inp" id="fUser" name="user" placeholder="username" autocomplete="off" spellcheck="false" maxlength="64"></div>
  <div><label for="fTime">Time of the successful login</label><input class="inp" id="fTime" name="time" placeholder="HH:MM:SS (server time)" autocomplete="off" spellcheck="false" maxlength="64"></div>
  <div class="msg" id="msg" role="status" hidden></div>
  <button class="btn" type="submit" id="sendBtn">Submit report</button>
</form>
<div class="tip">Teeno sahi hone par case close hoga aur flag milega.</div>`;
}

function winHtml(inst) {
  const a = inst.ans;
  return `<h2>Incident report</h2>
<div class="form">
  <div><label>Attacker IP address</label><input class="inp good" value="${esc(a.ip)}" readonly></div>
  <div><label>Account they broke into</label><input class="inp good" value="${esc(a.user)}" readonly></div>
  <div><label>Time of the successful login</label><input class="inp good" value="${clock(a.t)}" readonly></div>
</div>
<div class="win">
  <b>Report accepted. Case closed.</b>
  <p>Brute force ke baad <b>${esc(a.user)}</b> account khul gaya tha. Ye raha tumhara flag, ise CTF page par submit karo:</p>
  <div class="flag"><code id="flagCode">${esc(FLAG)}</code><button class="btn" type="button" id="copyFlag">Copy</button></div>
  <p class="next">Asli SOC mein agla kadam: ${esc(a.ip)} ko block karo, ${esc(a.user)} ka password badlo, aur SSH par password login band karke sirf key se login rakho.</p>
</div>`;
}

function page(s, inst) {
  const st = instStatus(s);
  const m = inst.meta;
  const opened = clock(m.opened).slice(0, 5);
  const S = JSON.stringify(String(s)).replace(/</g, '\\u003c');
  const q = encodeURIComponent(s);
  return `<!DOCTYPE html><html lang="en"><head>${HEAD}<title>Paynova SOC: INC-2026-${m.caseNo}</title>${STYLE}</head><body>
<div class="labbar">
  <div class="lb-left"><span class="lb-brand">AlexCyberX Labs</span><span class="lb-sep">|</span><span>Midnight Login</span><span class="lb-pill${inst.solved ? ' ok' : ''}" id="pill">${inst.solved ? 'Report accepted' : 'Not solved'}</span></div>
  <div class="lb-right"><span class="lb-time" id="timeLeft" data-left="${st.remaining_sec}">${fmtTime(st.remaining_sec)} left</span><a href="/rooms?open=for-04" id="backBtn">Back to room</a></div>
</div>
<header class="top"><div class="in"><div class="logo">${LOGO}Paynova SOC</div><nav class="nav" aria-label="Portal"><a href="#">Alerts</a><a class="on" href="#">Cases</a><a href="#">Assets</a><a href="#">Reports</a></nav><div class="who"><span>Analyst on shift</span><span class="av">YOU</span></div></div></header>
<main class="wrap">
  <div class="case"><span class="cid">INC-2026-${m.caseNo}</span><span class="pill sev">High</span><span class="pill st${inst.solved ? ' closed' : ''}" id="status">${inst.solved ? 'Closed' : 'Investigating'}</span><span class="meta">Opened 31 Oct 2026, ${opened} IST &middot; Asset vpn-gw01</span><h1>Suspicious SSH login on vpn-gw01</h1></div>
  <div class="grid">
    <div class="col">
      <section class="card"><h2>Alert summary</h2><div class="body">Last night our IDS saw a big burst of failed SSH logins on <b>vpn-gw01</b>, and then one login that looks wrong. The night shift saved the server's <b>auth.log</b>. Find out <b>who got in</b>: the attacker's IP, the account they broke into, and the exact time of that login.</div></section>
      <section class="card"><h2>Evidence</h2>
        <div class="ev"><div class="file"><span class="ic"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 2h7l4 4v12H5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 2v4h4M7.5 10h6M7.5 13h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span><div><b>auth.log</b><small>vpn-gw01 &middot; 30-31 Oct &middot; ${m.count.toLocaleString('en-IN')} lines</small></div></div>
          <a class="btn g" href="auth.log?session=${q}&amp;download=1" download="auth.log"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8M4.5 7L8 10.5 11.5 7M3 13.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Download</a></div>
        <div class="vtools"><label class="search"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.6" stroke="#6b7280" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg><input id="q" placeholder="Filter lines: a word or an IP" autocomplete="off" spellcheck="false" aria-label="Filter log lines"></label><button type="button" class="chip" data-q="Failed password">Failed password</button><button type="button" class="chip" data-q="Accepted">Accepted</button><button type="button" class="chip" data-q="Invalid user">Invalid user</button></div>
        <div class="count" id="count">Loading auth.log...</div>
        <div class="log" id="log" tabindex="0" aria-label="auth.log"></div>
      </section>
    </div>
    <section class="card" id="report">${inst.solved ? winHtml(inst) : reportForm()}</section>
  </div>
</main>
<div class="foot">Paynova is a fictional company built for AlexCyberX Labs. All names and IPs in this case are made up.</div>
<script>
(function(){
var S=${S};
var back=document.getElementById('backBtn');
back.onclick=function(e){e.preventDefault();try{window.close()}catch(_){}setTimeout(function(){location.href='/rooms?open=for-04'},200)};
var tl=document.getElementById('timeLeft'),left=+tl.getAttribute('data-left');
var tick=setInterval(function(){left=Math.max(0,left-1);tl.textContent=left?Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+' left':'Time up';if(!left)clearInterval(tick)},1000);

var logEl=document.getElementById('log'),countEl=document.getElementById('count'),qEl=document.getElementById('q'),chips=document.querySelectorAll('.chip');
var lines=[],lower=[];
function fmt(n){return n.toLocaleString('en-IN')}
function render(){
  var f=qEl.value.trim().toLowerCase(),frag=document.createDocumentFragment(),n=0;
  for(var i=0;i<lines.length;i++){
    if(f&&lower[i].indexOf(f)<0)continue;
    n++;
    var row=document.createElement('div');row.className='row';
    var ln=document.createElement('span');ln.className='ln';ln.textContent=i+1;
    var tx=document.createElement('span');var l=lines[i];
    tx.className=l.indexOf('Failed password')>-1||l.indexOf('Invalid user')>-1?'fail':(l.indexOf('Accepted password')>-1?'ok':'');
    tx.textContent=l;row.appendChild(ln);row.appendChild(tx);frag.appendChild(row);
  }
  logEl.textContent='';
  if(!n){var e=document.createElement('div');e.className='empty';e.textContent='No line matches this filter.';frag.appendChild(e)}
  logEl.appendChild(frag);logEl.scrollTop=0;
  countEl.textContent='Showing '+fmt(n)+' of '+fmt(lines.length)+' lines';
  for(var c=0;c<chips.length;c++)chips[c].classList.toggle('on',!!f&&chips[c].getAttribute('data-q').toLowerCase()===f);
}
var deb;qEl.addEventListener('input',function(){clearTimeout(deb);deb=setTimeout(render,120)});
for(var c=0;c<chips.length;c++)chips[c].addEventListener('click',function(){var v=this.getAttribute('data-q');qEl.value=qEl.value.trim().toLowerCase()===v.toLowerCase()?'':v;render()});
fetch('auth.log?session='+encodeURIComponent(S),{headers:{'X-Lab-Session':S}})
  .then(function(r){if(!r.ok)throw new Error();return r.text()})
  .then(function(t){lines=t.replace(/\\n$/,'').split('\\n');lower=lines.map(function(l){return l.toLowerCase()});render()})
  .catch(function(){countEl.textContent='Could not load auth.log. Go back to the room and press Restart.'});

var rep=document.getElementById('report');
rep.addEventListener('click',function(e){
  if(!e.target||e.target.id!=='copyFlag')return;
  var code=document.getElementById('flagCode').textContent,b=e.target;
  var done=function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)};
  if(navigator.clipboard)navigator.clipboard.writeText(code).then(done,function(){});
});
var form=document.getElementById('rep');
if(form)form.addEventListener('submit',function(e){
  e.preventDefault();
  var ids=['fIp','fUser','fTime'],inputs=ids.map(function(id){return document.getElementById(id)});
  var msg=document.getElementById('msg'),btn=document.getElementById('sendBtn');
  btn.disabled=true;
  fetch('report?session='+encodeURIComponent(S),{method:'POST',headers:{'Content-Type':'application/json','X-Lab-Session':S},body:JSON.stringify({ip:inputs[0].value,user:inputs[1].value,time:inputs[2].value})})
    .then(function(r){return r.json().then(function(d){return {s:r.status,d:d}})})
    .then(function(x){
      btn.disabled=false;var d=x.d;
      if(x.s===429){msg.textContent='Bahut saare reports ek saath. Ek minute ruk kar dobara try karo.';msg.hidden=false;return}
      if(x.s===403){msg.textContent='Lab ka time khatam ho gaya. Room par wapas jaakar Restart dabao.';msg.hidden=false;return}
      if(d.success){
        rep.innerHTML=d.html;
        var st=document.getElementById('status');st.textContent='Closed';st.classList.add('closed');
        var p=document.getElementById('pill');p.textContent='Report accepted';p.classList.add('ok');
        return;
      }
      (d.right||[]).forEach(function(ok,i){inputs[i].classList.toggle('good',ok);inputs[i].classList.toggle('bad',!ok)});
      msg.textContent='Not quite. '+(d.count||0)+' of 3 answers are right. '+(d.tip||'');msg.hidden=false;
    })
    .catch(function(){btn.disabled=false;msg.textContent='Report nahi gaya. Internet check karke dobara try karo.';msg.hidden=false});
});
})();
</script>
</body></html>`;
}

function notActive(res) {
  res.status(403).type('html').send(`<!DOCTYPE html><html lang="en"><head>${HEAD}<title>Instance not active</title>${STYLE}</head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center"><div style="max-width:420px;padding:24px"><h1 style="font-size:20px">Instance not active</h1><p style="color:#6b7280;font-size:14px;line-height:1.6">This lab is not running. Go back to the challenge and press Start (or Restart Instance) to begin a fresh session.</p></div></body></html>`);
}

// ── Instance endpoints ──
router.get('/instance/status', (req, res) => res.json(instStatus(sid(req))));
router.post('/instance/restart', (req, res) => { resetInst(sid(req)); logAttempt('MIDNIGHT', req.ip, 'instance_restart', 'ok'); res.json({ success: true, ...instStatus(sid(req)) }); });
router.post('/instance/stop', (req, res) => { const s = sid(req); if (instances[s]) instances[s].startedAt = Date.now() - (INSTANCE_DURATION_SEC + 1) * 1000; res.json({ success: true, running: false, remaining_sec: 0 }); });

router.get('/page', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return notActive(res);
  res.set('Cache-Control', 'no-store').type('html').send(page(s, instances[s]));
});

// The evidence file, rebuilt from the instance's seed. Plain text only.
router.get('/auth.log', (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return res.status(403).type('text/plain').send('This lab is not running. Press Start on the CTF page.\n');
  const text = buildCase(instances[s].seed).lines.join('\n') + '\n';
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  if (req.query.download === '1') res.attachment('auth.log');
  res.type('text/plain; charset=utf-8').send(text);
});

// What to say when the report is not right yet: never the answer, only where to look.
function tipFor(inst, ip, right) {
  const m = inst.meta;
  if (!right[0]) {
    if (!ip) return 'Attacker ka IP likho. Shuru "Failed password" wali lines se karo.';
    if (ip === m.decoy) return 'Sabse zyada failed attempts wala IP hi attacker ho, ye zaroori nahi. Kya is IP ki koi "Accepted" line hai?';
    if (/^10\./.test(ip)) return 'Ye IP company ke andar ka hai (10.20.x.x). Attacker bahar se aaya tha.';
    if (m.scanners.includes(ip)) return 'Is IP ne bas kuch hi baar try kiya aur chala gaya. Wo IP dhoondho jo bahut baar fail hua aur phir andar aa gaya.';
    return 'Ye IP is log mein kahin nahi hai. IP log se hi copy karo.';
  }
  if (!right[1]) return 'IP sahi hai. Ab isi IP ki "Accepted password" wali line dekho: wo kis user ke liye hai?';
  return 'IP aur account sahi hain. Time usi "Accepted password" line ke shuru mein hai (HH:MM:SS).';
}

router.post('/report', flagLimiter, (req, res) => {
  const s = sid(req);
  if (!isRunning(s)) return res.status(403).json({ error: 'Instance not active' });
  const inst = instances[s];
  const b = req.body || {};
  const str = (v) => (typeof v === 'string' ? v.trim().slice(0, 64) : '');
  const ip = str(b.ip), user = str(b.user).toLowerCase(), time = str(b.time);
  const tm = time.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  const sec = tm ? (+tm[1]) * 3600 + (+tm[2]) * 60 + (+tm[3]) : -1;
  const right = [ip === inst.ans.ip, user === inst.ans.user, sec === inst.ans.t % DAY];
  const count = right.filter(Boolean).length;
  logAttempt('MIDNIGHT', req.ip, 'report:' + right.map(Number).join(''), count === 3 ? 'correct' : 'wrong');
  if (count === 3) {
    inst.solved = true;
    return res.json({ success: true, right, html: winHtml(inst) });
  }
  res.json({ success: false, right, count, tip: tipFor(inst, ip, right) });
});

// ── Flag submit (the CTF page posts to the MAIN server; this is a fallback) ──
router.post('/submit', flagLimiter, (req, res) => {
  const { flag } = req.body || {};
  const s = sid(req);
  if (typeof flag !== 'string' || !flag.trim()) return res.status(400).json({ error: 'No flag provided' });
  const correct = flag.trim() === FLAG;
  logAttempt('MIDNIGHT', req.ip, 'submit', correct ? 'correct' : 'wrong'); // never log a flag
  if (correct) { getOrCreate(s).solved = true; return res.json({ success: true, flag: FLAG, message: 'A run of failed logins that ends in one success is the classic sign of a brute force that worked.' }); }
  res.status(401).json({ success: false, message: 'Incorrect flag.' });
});

router._instances = instances;
router._buildCase = buildCase;
module.exports = router;
