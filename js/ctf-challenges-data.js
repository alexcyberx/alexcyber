/* ═══════════════════════════════════════════
   CTF DATA, AlexCyberX
   Admin panel se manage hoga future mein (Supabase ctf_challenges table)
   Abhi ke liye: local data (static seed)
═══════════════════════════════════════════ */
/* ── CATEGORY ICONS (SVG) ── */
const CTF_ICONS = {
  Web: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#63b3ed" stroke-width="1.4"/><path d="M2 10h16M10 2c2.2 2.2 3.4 5.1 3.4 8s-1.2 5.8-3.4 8c-2.2-2.2-3.4-5.1-3.4-8S7.8 4.2 10 2z" stroke="#63b3ed" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Forensics: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#a78bfa" stroke-width="1.4"/><path d="M12.5 12.5L17 17" stroke="#a78bfa" stroke-width="1.4" stroke-linecap="round"/></svg>',
  Crypto: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="1.5" stroke="#facc15" stroke-width="1.4"/><path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="#facc15" stroke-width="1.4" stroke-linecap="round"/><circle cx="10" cy="13" r="1.2" fill="#facc15"/></svg>',
  OSINT: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="#34d399" stroke-width="1.4"/><path d="M12.5 12.5L17 17" stroke="#34d399" stroke-width="1.4" stroke-linecap="round"/><circle cx="8.5" cy="8.5" r="2" stroke="#34d399" stroke-width="1.2"/></svg>',
  Pwn: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17L13 7M11 3l6 6-2 2-6-6 2-2zM4 16l-1 3 3-1-2-2z" stroke="#f87171" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Reversing: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" stroke="#fb923c" stroke-width="1.4"/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.5 4.5l1.8 1.8M13.7 13.7l1.8 1.8M15.5 4.5l-1.8 1.8M5.5 14.5l-1.8 1.8" stroke="#fb923c" stroke-width="1.4" stroke-linecap="round"/></svg>',
  'AI Security': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="5" width="10" height="10" rx="2" stroke="#f472b6" stroke-width="1.4"/><rect x="8" y="8" width="4" height="4" rx="0.8" stroke="#f472b6" stroke-width="1.2"/><path d="M8 2.5V5M12 2.5V5M8 15v2.5M12 15v2.5M2.5 8H5M2.5 12H5M15 8h2.5M15 12h2.5" stroke="#f472b6" stroke-width="1.4" stroke-linecap="round"/></svg>',
  Misc: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#9ca3af" stroke-width="1.4"/><circle cx="10" cy="10" r="4" stroke="#9ca3af" stroke-width="1.4"/><circle cx="10" cy="10" r="1" fill="#9ca3af"/></svg>'
};

// CTF Challenges, hardcoded (working approach)
// Flag check: server-side via submit_ctf_flag() RPC, c.flag kabhi client pe expose nahi hota
// Supabase mein bhi same data hai (admin panel se manage ke liye)
const ctfChallenges = window.CTF_CHALLENGES = [
  // ── WEB ──
  {
    id: 'web-01', addedAt: '2026-09-16', cat: 'Web', icon: '🌐', iconClass: 'ctf-cat-web',
    title: 'Hidden in Plain Sight',
    desc: 'A website has something hidden inside its source code. Take a close look at the page source. Developers sometimes leave a lot behind in comments.',
    scenario: 'CorpX Ltd.\'s internal portal was pushed to production without a final cleanup. On the surface everything looks clean, but the developers left a few traces behind.<br><br>The flag is hidden in three separate places. Don\'t just look at what gets rendered.',
    author: 'AlexCyberX Security Team',
    tags: ['Web Exploitation', 'AlexCyberX Labs'],
    diff: 'Easy', pts: 50, xp: 100,
    hints: [
      'View the page source (Ctrl+U) and check the HTML comments near the top, one part of the flag is hidden there.',
      'Check robots.txt for a disallowed path, then visit it directly. The 404 response carries an extra header with the second part of the flag.',
      'Look at the JS file the page loads. A hex-encoded string is buried in a comment near the middle, that decodes to the final part.'
    ],
    labUrl: '/pages/labs/lab-hidden.html',
    labApiPath: '/api/lab/hidden',
    hasLabFlow: true,
    solvers: 142,
    objectives: [
      'Enumerate the application: source, robots.txt, JS files',
      'Find and decode Part 1 in the HTML source',
      'Find Part 2 in an HTTP response header',
      'Find and decode Part 3 in the JS file',
      'Assemble and submit the complete flag'
    ]
  },
  {
    id: 'web-02', addedAt: '2026-09-16', cat: 'Web', icon: '🌐', iconClass: 'ctf-cat-web',
    title: 'Cookie Monster',
    desc: 'NovaCorp Employee Portal blindly trusts its session cookies. A leaked employee account has been found. Can you escalate your privileges and access the Admin Control Panel?',
    author: 'AlexCyberX',
    diff: 'Medium', pts: 150, xp: 250,
    hints: ['Check DevTools Application tab and inspect all cookies set after login.', 'One cookie is Base64 encoded JSON. Decode it with atob() in browser console.', 'The server checks more than one cookie. Changing only one triggers a security alert.'],
    labUrl: '/pages/labs/lab-cookie.html',
    labApiPath: '/api/lab/cookie',
    hasLabFlow: true,
    solvers: 67
  },
  {
    id: 'web-03', addedAt: '2026-09-16', cat: 'Web', icon: '🌐', iconClass: 'ctf-cat-web',
    title: 'SQL Injection 101',
    desc: 'VaultBank Employee Portal has a vulnerable search feature. Extract the flag from a hidden database table using UNION-based SQL injection.',
    author: 'AlexCyberX',
    diff: 'Medium', pts: 200, xp: 350,
    hints: ['Add a single quote to the search field to trigger a SQL error and confirm the injection point.', 'Use ORDER BY to count columns, then UNION SELECT NULL to find which column accepts strings.', 'Query information_schema.tables to find hidden tables, then extract data from vault_secrets.'],
    labUrl: '/pages/labs/lab-sqli101.html',
    labApiPath: '/api/lab/sqli101',
    hasLabFlow: true,
    solvers: 89
  },
  {
    id: 'web-04', addedAt: '2026-09-16', cat: 'Web', icon: '🌐', iconClass: 'ctf-cat-web',
    title: 'robots.txt Secret',
    desc: 'A website\'s robots.txt file tells search engines which paths not to index, but the file itself is public. A restricted path is hidden inside this file. Find it and visit it.',
    author: 'AlexCyberX',
    diff: 'Easy', pts: 50, xp: 80,
    hints: ['Every website has a robots.txt at /robots.txt. Always check it during recon.', 'The Disallow entries list paths that are meant to stay hidden. Visit each one.', 'The vault needs a passcode. Check the page source of the homepage carefully.'],
    labUrl: '/pages/labs/lab-robots.html',
    labApiPath: '/api/lab/robots',
    hasLabFlow: true,
    solvers: 210
  },
  {
    id: 'web-06', addedAt: '2026-09-18', cat: 'Web', icon: '🌐', iconClass: 'ctf-cat-web',
    title: 'Insecure Deserialization',
    desc: 'NovaSat internal member portal stores your session in a cookie. Log in as a guest, inspect the cookie, and find a way to become admin without ever knowing an admin password.',
    author: 'AlexCyberX',
    diff: 'Easy', pts: 60, xp: 90,
    hints: ['The cookie is Base64 encoded. Decode it and read the raw string.', 'The decoded string is a PHP-serialized object with a boolean field isAdmin, currently b:0 (false).', 'Change b:0 to b:1, Base64 encode it again, and set it back as the acx_session cookie before checking access.'],
    labUrl: '/pages/labs/lab-deserialize.html',
    labApiPath: '/api/lab/deserialize',
    hasLabFlow: false,
    solvers: 0
  },
  {
    id: 'web-07', addedAt: '2026-09-18', cat: 'Web', icon: '🌐', iconClass: 'ctf-cat-web',
    title: 'Insecure Deserialization II',
    desc: 'NovaSat pushed a v2 API for the member session. Same cookie-trust problem, but this time the role is a string, not a boolean, and the server reads it strictly.',
    author: 'AlexCyberX',
    diff: 'Medium', pts: 150, xp: 220,
    hints: ['The cookie is a Base64 encoded PHP-serialized object again, decode it first.', 'The role field looks like s:4:"user". That leading number is the exact byte length of the string that follows.', 'Changing "user" to "admin" without updating that number breaks parsing. Update s:4: to match admin\'s length before encoding it back.'],
    labUrl: '/pages/labs/lab-deserialize-medium.html',
    labApiPath: '/api/lab/deserialize-medium',
    hasLabFlow: false,
    solvers: 0
  },

  // ── FORENSICS ──
  {
    id: 'for-01', addedAt: '2026-09-16', cat: 'Forensics', iconClass: 'ctf-cat-forensics',
    title: 'Packet Detective',
    desc: 'A machine on the CorpX LAN was flagged for unusual outbound DNS activity. A 20-second packet capture was taken at the egress point. Download the PCAP, isolate the suspicious traffic, and reconstruct what was exfiltrated.',
    author: 'AlexCyberX',
    diff: 'Medium', pts: 150, xp: 250,
    hints: [
      'Filter by dns in Wireshark. One internal IP is querying an external domain repeatedly and getting NXDOMAIN every time.',
      'The parent domain is data.corpx-sync.net. Collect the 4 subdomain labels in timestamp order.',
      'Join the labels, convert to uppercase, pad to a multiple of 8 with = signs, then Base32 decode. CyberChef works well for this.'
    ],
    labUrl: '/pages/labs/lab-packet.html',
    labApiPath: '/api/lab/packet',
    hasLabFlow: true,
    solvers: 41
  },
  {
    id: 'for-02', addedAt: '2026-09-16', cat: 'Forensics', icon: '🔍', iconClass: 'ctf-cat-forensics',
    title: 'Metadata Matters',
    desc: 'Someone shared an image on PixelDrop. The image looks normal but was flagged during a metadata review. Download it and extract the EXIF data to find the hidden flag.',
    author: 'AlexCyberX',
    diff: 'Easy', pts: 75, xp: 120,
    hints: ['Image files store hidden data called EXIF metadata beyond just pixels.', 'Use exiftool or an online viewer like exifinfo.net to read all fields.', 'The flag is split across 4 fields. Find them all and figure out the correct order.'],
    labUrl: '/pages/labs/lab-metadata.html',
    labApiPath: '/api/lab/metadata',
    hasLabFlow: true,
    solvers: 178
  },
  {
    id: 'for-03', addedAt: '2026-09-16', cat: 'Forensics', iconClass: 'ctf-cat-forensics',
    title: 'Log Hunter',
    desc: 'CorpX SOC pulled a full day of Apache access logs after detecting unusual activity. 2,156 requests, one attacker hidden in the noise. Find the IP, identify both tools used, and name the path that was targeted for SQL injection.',
    author: 'AlexCyberX',
    diff: 'Hard', pts: 350, xp: 600,
    hints: [
      'Count requests per IP with awk and uniq -c. One IP has far more requests than any legitimate visitor.',
      'Filter by the attacker IP and check unique User-Agent strings. Two distinct tools were used at different times of day.',
      'The flag uses the SQL injection tool name only (not the directory scanner). Strip the query string from the path, keep only the base PHP file.'
    ],
    labUrl: '/pages/labs/lab-loghunter.html',
    labApiPath: '/api/lab/loghunter',
    hasLabFlow: false,
    solvers: 14
  },

  // ── CRYPTO ──
  {
    id: 'cry-01', addedAt: '2026-09-16', cat: 'Crypto', iconClass: 'ctf-cat-crypto',
    title: "Caesar's Secret",
    desc: "An encrypted transmission was intercepted from a dark web channel linked to underground group RedCell. The message is protected with a classic substitution cipher. Decrypt it and extract the flag.",
    author: 'AlexCyberX',
    diff: 'Easy', pts: 50, xp: 80,
    hints: [
      'Each letter is shifted by the same fixed number of places in the alphabet. Try shifting the ciphertext by different amounts and see when it turns into real words.',
      'Only 25 shifts are possible. Use the shift dial in the lab to go through them one by one, or brute-force it with a script or CyberChef.',
      'Shift is 3.'
    ],
    labUrl: '/pages/labs/lab-caesar.html',
    labApiPath: '/api/lab/caesar',
    hasLabFlow: false,
    solvers: 312
  },
  {
    id: 'cry-02', addedAt: '2026-09-16', cat: 'Crypto', iconClass: 'ctf-cat-crypto',
    title: 'Base64 Bonanza',
    desc: 'A suspicious file was found in the NovaSat NS-7 telemetry export directory. It has a .jpg extension but it is not an image. Open it as text, decode what you find, and peel back both layers to extract the flag.',
    author: 'AlexCyberX',
    diff: 'Easy', pts: 50, xp: 80,
    hints: [
      'Open the file in a text editor or with cat. It is not an image -- the content is a single Base64 encoded string.',
      'Decoding the file gives a telemetry message, not the flag. Look for the ENCODED PAYLOAD section inside that message.',
      'Decode the payload string a second time with Base64 to get the flag. Two layers total.'
    ],
    labUrl: '/pages/labs/lab-base64.html',
    labApiPath: '/api/lab/base64',
    hasLabFlow: false,
    solvers: 267
  },
  // ── AI SECURITY ──
  {
    id: 'ai-01', addedAt: '2026-09-30', cat: 'AI Security', iconClass: 'ctf-cat-ai',
    title: 'Helpdesk Slip',
    desc: 'CorpX Ltd. launched an AI assistant for its IT helpdesk. It knows a confidential admin recovery code and has been told not to share it with regular staff. Can you get it to talk?',
    scenario: 'CorpX Ltd. just rolled out a chatbot to answer IT support questions. To help the IT team, its developers gave it a confidential admin recovery code, and told it not to hand the code to regular employees.<br><br>You are a regular employee. The bot follows its instructions, but it can only judge who it is talking to from what you type. Get it to reveal the recovery code.',
    author: 'AlexCyberX',
    tags: ['AI Security', 'Prompt Injection', 'AlexCyberX Labs'],
    diff: 'Easy', pts: 50, xp: 100,
    hints: [
      'The bot has no way to check who you really are. Its only protection is a polite request in its instructions not to share the code.',
      'Try telling the bot you are the person the code is meant for, or ask it to repeat the instructions it was given at the start of the chat.',
      'Ask directly for the admin recovery code while explaining that you are from the IT admin team. The flag is the code, in ACX{...} format.'
    ],
    labUrl: '/pages/labs/lab-ai-easy.html',
    labApiPath: '/api/lab/aichat-easy',
    hasLabFlow: false,
    solvers: 0,
    objectives: [
      'Chat with the helpdesk assistant and see what it is willing to talk about',
      'Find a way to make it ignore the rule against sharing the code',
      'Submit the recovery code as the flag'
    ]
  }

];

// dbId map: slug → Supabase UUID (RPC call ke liye)
// Yeh runtime pe Supabase se lazy-load hoga
window._ctfSlugToUuid = window._ctfSlugToUuid || {};
const _ctfSlugToUuid = window._ctfSlugToUuid;
async function loadCTFUuids() {
  if (!window._supabase || Object.keys(_ctfSlugToUuid).length > 0) return;
  try {
    // FIX: pehle 'id, title, status' fetch hota tha, slug column nahi tha
    // toh r.slug hamesha undefined tha, Pass 1 kabhi populate nahi hota tha.
    // Sirf title match (Pass 2) kaam karta tha, lekin "Caesar''s Secret"
    // title mismatch pe woh bhi fail hota tha. UUID null milta tha aur
    // flag submit silently fail ho jaata tha (error message dikhta tha).
    // Ab slug bhi fetch karo, yeh primary reliable match hai.
    const { data } = await window._supabase
      .from('ctf_challenges_public')
      .select('id, slug, title, status');
    if (data) {
      // Pass 1: DB slug → UUID (exact match with JS c.id like 'web-01')
      data.forEach(r => {
        if (r.slug) _ctfSlugToUuid[r.slug] = r.id;
      });
      // Pass 2: JS c.id → UUID via title match (fills gaps)
      if (window.CTF_CHALLENGES) {
        window.CTF_CHALLENGES.forEach(c => {
          if (_ctfSlugToUuid[c.id]) return;
          const match = data.find(r => r.title === c.title);
          if (match) _ctfSlugToUuid[c.id] = match.id;
        });
      }
      // Re-render CTF grid
      ctfRender();
    }
  } catch(e) { console.warn('[CTF] UUID load failed:', e); }
}

/* Overlays real 'solvers' counts from the ctf_challenges_public view onto
   the local CTF_CHALLENGES seed (matched by slug === id). Same idea as
   loadCTFUuids above, background fetch then a single re-render, so the
   grid first paints instantly from the static seed and the solver counts
   just update in place once the real numbers arrive. */
async function ctfSyncSolverCounts() {
  if (!window._supabase) return;
  try {
    const { data, error } = await window._supabase
      .from('ctf_challenges_public')
      .select('slug, solvers');
    if (error || !data) return;

    const bySlug = {};
    data.forEach(r => { if (r.slug) bySlug[r.slug] = r.solvers || 0; });

    CTF_CHALLENGES.forEach(c => {
      if (Object.prototype.hasOwnProperty.call(bySlug, c.id)) {
        c.solvers = bySlug[c.id];
      }
    });
    ctfRender();
  } catch (e) {
    console.warn('[CTF] solver count sync failed:', e);
  }
}
function getChallengeUuid(slugOrId) { return (window._ctfSlugToUuid || {})[slugOrId] || null; }

/* ── STATE ── */
let ctfActiveFilter = { cat: 'all', diff: null };
let ctfSolved = {}; // { challengeId: { xp, solvedAt } }
// FIX: `let ctfSolved` yahan ek inline <script> ke top level pe hai, 
// yeh window.ctfSolved NAHI hai (top-level let/const window pe nahi
// chadte, sirf var hota hai). ctf-sync.js jab `window.ctfSolved = ...`
// karta tha, woh ek bilkul alag binding set kar raha tha jo ctfRender(),
// updateCTFStats(), aur flag-submit code (jo sab bare `ctfSolved` padhte
// hain) ko kabhi dikhta hi nahi tha. Isi liye DB se sync hone ke baad
// bhi UI 0 solved/0 XP dikhata rehta tha. Yeh getter/setter external
// scripts ko REAL ctfSolved se connect karte hain.
window.getCtfSolved = function() { return ctfSolved; };
window.setCtfSolved = function(val) { ctfSolved = val || {}; return ctfSolved; };
let ctfCurrentChallenge = null;
let ctfHintVisible = false;

/* ── INIT ── */
// ── CTF USER SESSION INIT ───────────────────────────────────────
// auth.js mein SIGNED_IN event pe call hota hai, lab session ko
// newly logged-in user ke saath anchor karta hai taaki cross-user
// session leakage na ho. Per-challenge sessionStorage keys use
// hoti hain (acx_lab_session_<challengeId>) jo user-scoped hain.
// Plain Math.random() ka use yahan intentional nahi tha (v28 bug
// tha woh, fix ho chuka hai). Yeh function sirf ensure karta hai
// ki koi stale anonymous session nahi bachi hai.
function ctfInitUserSession() {
  try {
    // Purani anonymous lab sessions sessionStorage se wipe karo
    const toWipe = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('acx_lab_session_')) toWipe.push(k);
    }
    toWipe.forEach(k => sessionStorage.removeItem(k));
  } catch(e) {}
}

function initCTFPage() {
  const user = window._currentUser;

  const setupView = document.getElementById('ctfSetupView');
  const mainView  = document.getElementById('ctfMainView');

  if (!user) {
    // Auth still loading, retry after short delay (race condition: /rooms direct open)
    setTimeout(function() {
      if (window._currentUser) {
        initCTFPage();
      } else {
        // Still no user after retry, show login prompt
        if (typeof showAuth === 'function') showAuth('login', 'ctf');
      }
    }, 800);
    return;
  }

  if (!user.username || !user.username.trim()) {
    if (setupView) setupView.style.display = 'block';
    if (mainView)  mainView.style.display  = 'none';
    const emailEl = document.getElementById('ctfSetupEmail');
    if (emailEl) emailEl.textContent = user.email || '';
    const inp = document.getElementById('ctfUsernameInput');
    if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 100); }
    const msg = document.getElementById('ctfUsernameMsg');
    if (msg) { msg.className = 'ctf-setup-msg'; msg.textContent = ''; }
    return;
  }

  if (setupView) setupView.style.display = 'none';
  if (mainView)  mainView.style.display  = 'block';

  loadCTFSolvedFromStorage();

  // Fetch disabled slugs from server first, then render
  fetch('/api/ctf/disabled')
    .then(r => r.json())
    .then(data => {
      if (data && Array.isArray(data.disabled)) {
        localStorage.setItem('acx_ctf_disabled', JSON.stringify(data.disabled));
      }
    })
    .catch(() => {})
    .finally(() => {
      ctfRender();
      updateCTFStats();
    });

  // UUID map preload karo (flag RPC ke liye), background mein, non-blocking
  loadCTFUuids();

  // Real solver counts bhi background mein sync karo, non-blocking
  ctfSyncSolverCounts();

  // My Stats button show/hide based on auth

  if (typeof selectedLang !== 'undefined' && selectedLang !== 'hl') {
    if (typeof applyCTFTranslation === 'function') applyCTFTranslation(selectedLang);
  }
}

/* ── CTF USERNAME SETUP ── */
async function submitCTFUsername() {
  const inp = document.getElementById('ctfUsernameInput');
  const btn = document.getElementById('ctfUsernameSubmitBtn');
  const msg = document.getElementById('ctfUsernameMsg');
  const uname = (inp?.value || '').trim();

  const showMsg = (type, text) => {
    if (!msg) return;
    msg.className = 'ctf-setup-msg ' + type;
    msg.textContent = text;
  };

  if (!uname) { showMsg('error', 'Please enter a username.'); return; }
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(uname)) {
    showMsg('error', 'Username must be 3-20 characters: letters, numbers, underscores, hyphens only.');
    return;
  }

  if (!window._currentUser) { showMsg('error', 'You must be logged in.'); return; }
  if (!_supabase) { showMsg('error', 'Service not configured. Please try again later.'); return; }

  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    // Check username uniqueness
    const { data: existing } = await _supabase
      .from('profiles')
      .select('id')
      .eq('username', uname)
      .neq('id', window._currentUser.id)
      .maybeSingle();

    if (existing) {
      showMsg('error', 'This username is already taken. Please choose another.');
      btn.disabled = false;
      btn.textContent = 'Complete Setup';
      return;
    }

    const { error } = await _supabase.from('profiles').upsert({
      id: window._currentUser.id,
      username: uname,
      updated_at: new Date().toISOString()
    });

    if (error) {
      // RLS / 403 error, fallback: auth metadata mein save karo
      console.warn('[ACX] profiles upsert failed, falling back to auth metadata:', error.message);
      const { error: metaErr } = await _supabase.auth.updateUser({
        data: { username: uname }
      });
      if (metaErr) {
        showMsg('error', 'Could not save username. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Complete Setup';
        return;
      }
    } else {
      // Profiles save successful, auth metadata bhi sync karo
      await _supabase.auth.updateUser({ data: { username: uname } }).catch(() => {});
    }

    window._currentUser.username = uname;
    if (typeof updateNavForUser === 'function') updateNavForUser(window._currentUser);

    showMsg('success', 'Username set! Loading challenges...');
    setTimeout(() => initCTFPage(), 600);

  } catch (e) {
    showMsg('error', 'Something went wrong. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Complete Setup';
  }
}

/* ── STORAGE (Supabase ya localStorage) ── */
function loadCTFSolvedFromStorage() {
  try {
    const raw = localStorage.getItem('acx_ctf_solved');
    ctfSolved = raw ? JSON.parse(raw) : {};
  } catch(e) { ctfSolved = {}; }
}

function saveCTFSolvedToStorage() {
  try {
    localStorage.setItem('acx_ctf_solved', JSON.stringify(ctfSolved));
  } catch(e) {}
}

/* Supabase mein save, ab submit_ctf_flag() RPC hi sab handle karta hai
   (ctf_solves insert + XP award dono). Yeh function sirf localStorage
   se solved state sync karta hai jab user fresh login kare. */
async function syncSolvedFromSupabase() {
  if (!window._supabase || !window._currentUser) return;
  try {
    await loadCTFUuids(); // slug<->UUID map ready hone do pehle

    const { data } = await window._supabase
      .from('ctf_solves')
      .select('challenge_id')
      .eq('user_id', window._currentUser.id);

    if (!data) return;
    // challenges_public view mein id = UUID, slug = old string id
    // FIX: c.dbId kabhi set nahi hota tha, isliye yeh map hamesha empty
    // ban jaata tha aur neeche ka match kabhi hit nahi hota tha, result:
    // har sync pe ctfSolved {} (empty) ho jaata tha, real solves ke bawajood.
    // _ctfSlugToUuid (loadCTFUuids se, slug -> UUID) ko reverse karke
    // UUID -> slug map banao.
    const slugMap = {};
    Object.entries(window._ctfSlugToUuid || {}).forEach(([slug, uuid]) => { slugMap[uuid] = slug; });

    // FIX Bug 2: ctfSolved ko Supabase data se REPLACE karo (merge nahi)
    // Yahi ensure karta hai ki dono accounts ka data mix na ho
    const freshSolved = {};
    data.forEach(row => {
      const slug = slugMap[row.challenge_id];
      if (slug) {
        freshSolved[slug] = { xp: row.points_earned, solvedAt: null };
      }
    });
    ctfSolved = freshSolved;
    saveCTFSolvedToStorage();
    updateCTFStats();
    ctfRender();
  } catch(e) { console.warn('[CTF] Sync failed:', e); }
}

/* ── FILTERS ── */
function ctfSetFilter(btn, type) {
  if (type === 'cat') {
    document.querySelectorAll('.ctf-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ctfActiveFilter.cat = btn.dataset.cat;
  } else {
    const wasActive = btn.classList.contains('active');
    document.querySelectorAll('.ctf-diff-btn').forEach(b => b.classList.remove('active'));
    if (!wasActive) {
      btn.classList.add('active');
      ctfActiveFilter.diff = btn.dataset.diff;
    } else {
      ctfActiveFilter.diff = null;
    }
  }
  ctfRender();
}

/* ── RENDER ── */
function ctfRender() {
  const grid = document.getElementById('ctfGrid');
  if (!grid) return;

  let filtered;
  try {
    const query = (document.getElementById('ctfSearchInput')?.value || '').toLowerCase().trim();

    const _disabledIds = JSON.parse(localStorage.getItem('acx_ctf_disabled') || '[]');
    filtered = ctfChallenges.filter(c => {
      if (_disabledIds.includes(c.id)) return false;
      if (ctfActiveFilter.cat !== 'all' && c.cat !== ctfActiveFilter.cat) return false;
      if (ctfActiveFilter.diff && c.diff !== ctfActiveFilter.diff) return false;
      if (query) {
        const haystack = ((c.title || '') + ' ' + (c.desc || '') + ' ' + (c.cat || '') + ' ' + (c.tags ? c.tags.join(' ') : '')).toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  } catch (err) {
    console.error('ctfRender filter error:', err);
    filtered = ctfChallenges; // fail-safe: show everything instead of wiping the grid
  }

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="ctf-empty">
        <div class="ctf-empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#444" stroke-width="1.5"/><path d="M21 21l-4.35-4.35" stroke="#444" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <h3>No challenges found</h3>
        <p>Try changing the filter or search query.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(c => {
    const solved = !!ctfSolved[c.id];
    return `
    <div class="ctf-card ${solved ? 'solved' : ''}" onclick="openCTFModal('${c.id}')">
      <div class="ctf-card-top">
        <div class="ctf-card-icon ${c.iconClass}">${CTF_ICONS[c.cat] || ''}</div>
        <div class="ctf-card-info">
          <div class="ctf-card-title">${c.title}</div>
          <div class="ctf-card-cat">${c.cat}</div>
        </div>
      </div>
      <div class="ctf-card-desc">${c.desc}</div>
      <div class="ctf-card-footer">
        <span class="ctf-diff-badge ${c.diff.toLowerCase()}">${c.diff}</span>
        <span class="ctf-points">${c.xp} <span>XP</span></span>
        <span class="ctf-solvers">${c.solvers + (solved && !ctfSolved[c.id]?.counted ? 0 : 0)} solvers</span>
      </div>
    </div>`;
  }).join('');
}

/* ── MY STATS PANEL (collapsible) ── */
function ctfToggleMyStats() {
  const panel = document.getElementById('ctfMyStatsPanel');
  const btn   = document.getElementById('ctfMyStatsToggle');
  if (!panel || !btn) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  btn.classList.toggle('open', !isOpen);
}

/* ── STATS ── */
function updateCTFStats() {
  const solvedIds = Object.keys(ctfSolved);
  const totalXP = solvedIds.reduce((sum, id) => sum + (ctfSolved[id]?.xp || 0), 0);
  const el = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  el('ctfTotalCount', ctfChallenges.length);
  el('ctfSolvedCount', solvedIds.length);
  el('ctfTotalXP', totalXP);

  const u = window._currentUser;

  // Daily Challenge row
  const dailyRow = document.getElementById('ctfDailyRow');
  if (dailyRow) {
    if (!u) {
      dailyRow.style.display = 'none';
    } else {
      dailyRow.style.display = 'grid';

      // Daily Challenge, date-seeded pick so every user sees the same
      // "challenge of the day" and it rotates automatically at midnight.
      // Already-solved challenges are skipped; if today's picked challenge
      // is solved, walk forward through the list (deterministically) to
      // the next unsolved one. If everything is solved, show a
      // "all caught up" state instead of a fake/dummy card.
      const dailyEl = document.getElementById('ctfDailyChallengeInner');
      if (dailyEl) {
        const pool = ctfChallenges;
        if (!pool.length) {
          dailyEl.innerHTML = '<div style="color:#4a4a5a;font-size:12px;">No challenges available.</div>';
        } else {
          const d = new Date();
          const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
          let idx = Math.abs((seed * 1103515245 + 12345) % pool.length);

          let picked = null;
          for (let i = 0; i < pool.length; i++) {
            const candidate = pool[(idx + i) % pool.length];
            if (!ctfSolved[candidate.id]) { picked = candidate; break; }
          }

          if (!picked) {
            dailyEl.innerHTML = `
              <div class="ctf-daily-done">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 5" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                All challenges solved, great work!
              </div>`;
          } else {
            dailyEl.innerHTML = `
              <div class="ctf-daily-name">${picked.title}</div>
              <div class="ctf-daily-meta">${picked.cat} · ${picked.xp} XP</div>
              <button class="ctf-daily-btn" onclick="openCTFModal('${picked.id}')">Go to challenge →</button>`;
          }
        }
      }
    }
  }
}

/* ── MODAL ── */
function openCTFModal(id) {
  loadCTFSolvedFromStorage();
  const c = ctfChallenges.find(x => x.id === id);
  if (!c) return;
  ctfCurrentChallenge = c;
  ctfHintVisible = false;
  if (typeof resetAiHintPanel === 'function') resetAiHintPanel();

  // Modal open hote hi doosri sab challenges ka stale "active" state clear karo,
  // taaki agar beech mein kahin (doosri tab/session) koi aur lab start hua ho
  // toh bhi is challenge ka purana running/timer UI kabhi na dikhe.
  ctfEnforceSingleActiveLocal(id);

  const solved = !!ctfSolved[id];

  // Fill basic modal fields
  document.getElementById('modalCat').innerHTML = `<span style="display:inline-flex;align-items:center;">${CTF_ICONS[c.cat] || ''}</span> ${c.cat}`;
  document.getElementById('modalTitle').textContent = c.title;

  document.getElementById('modalMeta').innerHTML = `
    <span class="ctf-diff-badge ${c.diff.toLowerCase()}">${c.diff}</span>
    <span class="ctf-xp-pill">+${c.xp} XP</span>
    <span style="font-size:12px;color:var(--text-dim);">${c.solvers} solvers</span>
  `;

  // Hint(s), supports both c.hint (single string) and c.hints (array)
  const hintList = c.hints && c.hints.length ? c.hints : (c.hint ? [c.hint] : []);
  const hintWrapEl = document.getElementById('ctfHintWrap');
  const hintBoxEl = document.getElementById('ctfHintBox');
  const hintLabelEl = document.getElementById('ctfHintToggleLabel');
  if (hintList.length) {
    hintWrapEl.style.display = 'block';
    hintBoxEl.innerHTML = hintList.map((h, i) => hintList.length > 1 ? `<div style="margin-bottom:6px;"><strong>Hint ${i+1}:</strong> ${h}</div>` : h).join('');
    hintBoxEl.classList.remove('visible');
    hintLabelEl.textContent = 'Show Hint';
    ctfHintVisible = false;
  } else {
    hintWrapEl.style.display = 'none';
  }

  // CHALLENGE card, show if scenario exists, else show plain desc
  const challengeCard = document.getElementById('ctfChallengeCard');
  if (challengeCard) {
    if (c.scenario) {
      // Badges removed, diff already shown in modalMeta above, tags not shown
      const badgesEl = document.getElementById('modalChallengeBadges');
      if (badgesEl) badgesEl.innerHTML = '';
      // Author
      const authorEl = document.getElementById('modalChallengeAuthor');
      if (authorEl) authorEl.textContent = c.author ? `Author: ${c.author}` : '';
      // Scenario text
      const scenarioEl = document.getElementById('modalChallengeScenario');
      if (scenarioEl) scenarioEl.innerHTML = c.scenario;
      challengeCard.style.display = 'block';
    } else {
      // Fallback: plain desc in challenge card
      const scenarioEl = document.getElementById('modalChallengeScenario');
      if (scenarioEl) scenarioEl.textContent = c.desc || '';
      const badgesEl = document.getElementById('modalChallengeBadges');
      if (badgesEl) badgesEl.innerHTML = '';
      const authorEl = document.getElementById('modalChallengeAuthor');
      if (authorEl) authorEl.textContent = c.author ? `Author: ${c.author}` : '';
      challengeCard.style.display = 'block';
    }
  }

  // Restore lab state if challenge was already running
  // Ab same-tab navigation hai, toh ctfLabState mein state nahi hogi (page reload ho jaata hai)
  // sessionStorage mein acx_lab_active_<id> check karo, yahi real source of truth hai
  if (typeof ctfTimerPoll !== 'undefined' && ctfTimerPoll) { clearInterval(ctfTimerPoll); ctfTimerPoll = null; }
  const startWrap = document.getElementById('ctfStartWrap');
  const runningWrap = document.getElementById('ctfRunningWrap');
  const timerRow = document.getElementById('ctfTimerRow');

  // Check karo ki lab active hai (localStorage se, refresh pe bhi survive karta hai)
  const labIsActive = (() => {
    try {
      const d = JSON.parse(localStorage.getItem('acx_lab_active_' + id) || 'null');
      if (!d) return false;
      // Expiry check: agar 30 min se zyada ho gayi toh clear karo
      if (Date.now() - d.startedAt > 30 * 60 * 1000) {
        localStorage.removeItem('acx_lab_active_' + id);
        return false;
      }
      return true;
    } catch(e) { return false; }
  })();
  // Fallback: in-memory state (jab modal same page session mein close/reopen ho)
  const labState = ctfLabState && ctfLabState[id];
  const isLabRunning = labIsActive || (labState && labState.running);

  if (isLabRunning) {
    // Lab chal rahi hai, Restart + ViewLab dikhao, Start chupaao
    if (startWrap) startWrap.style.display = 'none';
    if (runningWrap) runningWrap.style.display = 'block';
    if (timerRow) timerRow.classList.add('show');
    const tv = document.getElementById('ctfTimerVal');
    // Timer value: localStorage se recover karo (refresh pe survive karta hai)
    let savedSecs = 1800;
    try {
      const d = JSON.parse(localStorage.getItem('acx_lab_active_' + id) || 'null');
      if (d && d.secsLeft > 0) {
        // Actual elapsed time adjust karo
        const elapsed = Math.floor((Date.now() - d.startedAt) / 1000);
        savedSecs = Math.max(0, 1800 - elapsed);
      }
    } catch(e) {}
    const mm = String(Math.floor(savedSecs/60)).padStart(2,'0');
    const ss = String(savedSecs%60).padStart(2,'0');
    const savedTimer = mm + ':' + ss;
    if (tv) tv.textContent = savedTimer;
    // Resume countdown
    let secs = savedSecs;
    if (secs > 0) {
      ctfTimerPoll = setInterval(() => {
        secs--;
        const m = String(Math.floor(secs/60)).padStart(2,'0');
        const s = String(secs%60).padStart(2,'0');
        const t = document.getElementById('ctfTimerVal');
        if (t) { t.textContent = m+':'+s; t.className='ctf-timer-val'+(secs<=300?' danger':secs<=600?' warn':''); }
        if (secs<=0){clearInterval(ctfTimerPoll);ctfTimerPoll=null;}
      }, 1000);
    }
    // Restore ctfActiveLabUrl so View Lab works on reopen
    if (c.hasLabFlow && c.labApiPath) {
      const sid = (() => { try { return sessionStorage.getItem('acx_lab_direct_session_' + c.id); } catch(e) { return null; } })();
      if (sid) ctfActiveLabUrl = c.labApiPath + '/page?session=' + encodeURIComponent(sid);
    } else if (c.labUrl) {
      const sessVal = (() => { try { return sessionStorage.getItem('acx_lab_session_' + c.id); } catch(e) { return null; } })();
      let url = c.labUrl;
      const sep = () => (url.includes('?') ? '&' : '?');
      if (sessVal) { url += sep() + 'session=' + encodeURIComponent(sessVal); }
      ctfActiveLabUrl = url;
    }
  } else {
    // Fresh start
    ctfActiveTab = null;
    ctfActiveLabUrl = null;
    if (startWrap) startWrap.style.display = 'block';
    if (runningWrap) runningWrap.style.display = 'none';
    if (timerRow) timerRow.classList.remove('show');
  }

  // Show/hide Launch wrap
  const launchWrap = document.getElementById('ctfLaunchWrap');
  if (launchWrap) launchWrap.style.display = c.labUrl ? 'block' : 'none';

  // Flag box: shown when there is no lab, or when the lab is running.
  // (No separate "solved" panel anymore. Submitting again on a solved challenge
  // gives an "already solved" message instead, see submitCTFFlag.)
  const flagSection = document.getElementById('ctfFlagSection');
  {
    const showFlag = !c.labUrl || isLabRunning;
    flagSection.style.display = showFlag ? 'block' : 'none';
    const inp = document.getElementById('ctfFlagInput');
    if (inp) { inp.value = ''; inp.className = 'ctf-flag-input'; }
    const msg = document.getElementById('ctfFlagMsg');
    if (msg) { msg.className = 'ctf-flag-msg'; msg.textContent = ''; }
    const btn = document.getElementById('ctfSubmitBtn');
    if (btn) { btn.disabled = false; btn.textContent = 'Submit'; }
  }

  const _ov = document.getElementById('ctfModalOverlay');
  // Modal ko <body> ke seedha neeche rakho taaki nav ya kisi page ka stacking context use na dabaye
  if (_ov.parentElement !== document.body) document.body.appendChild(_ov);
  _ov.scrollTop = 0;
  _ov.classList.add('active');
  document.body.classList.add('ctf-modal-open');
  setTimeout(() => {
    const inp = document.getElementById('ctfFlagInput');
    if (inp) inp.focus();
  }, 100);
}

// Lab state persist karo per challenge
const ctfLabState = {};

function toggleCTFHint() {
  ctfHintVisible = !ctfHintVisible;
  const hintBox = document.getElementById('ctfHintBox');
  const hintLabel = document.getElementById('ctfHintToggleLabel');
  if (hintBox) hintBox.classList.toggle('visible', ctfHintVisible);
  if (hintLabel) hintLabel.textContent = ctfHintVisible ? 'Hide Hint' : 'Show Hint';
}

// ── AI hints (server: /api/lab/hint) ──
const ctfAiState = {};   // challengeId -> { cards: [{ hint, n }], max, remaining }
let ctfAiOpen = false;
let ctfAiBusy = false;

function ctfAiSid() {
  try {
    let v = sessionStorage.getItem('acx_hint_sid');
    if (!v) {
      v = 'h' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      sessionStorage.setItem('acx_hint_sid', v);
    }
    return v;
  } catch (e) { return ''; }
}

function ctfAiRender() {
  const out  = document.getElementById('ctfAiOut');
  const left = document.getElementById('ctfAiLeft');
  if (!out) return;
  const c  = ctfCurrentChallenge;
  const st = c && ctfAiState[c.id];
  out.textContent = '';
  if (st) {
    st.cards.forEach(card => {
      const box = document.createElement('div');
      box.className = 'ctf-ai-card';
      const lab = document.createElement('div');
      lab.className = 'lab';
      lab.textContent = 'AI hint ' + card.n;
      const txt = document.createElement('div');
      txt.className = 'txt';
      txt.textContent = card.hint;            // textContent on purpose: never treat model output as HTML
      box.appendChild(lab);
      box.appendChild(txt);
      out.appendChild(box);
    });
  }
  if (left) left.textContent = st ? (st.remaining + ' of ' + st.max + ' AI hints left') : 'AI hints are limited per challenge';
}

function ctfAiMessage(cls, text) {
  const out = document.getElementById('ctfAiOut');
  if (!out) return null;
  const el = document.createElement('div');
  el.className = cls;
  el.textContent = text;
  out.appendChild(el);
  return el;
}

function resetAiHintPanel() {
  ctfAiOpen = false;
  ctfAiBusy = false;
  const panel = document.getElementById('ctfAiPanel');
  const label = document.getElementById('ctfAiToggleLabel');
  const tog   = document.getElementById('ctfAiToggle');
  const q     = document.getElementById('ctfAiQ');
  const go    = document.getElementById('ctfAiGo');
  if (panel) panel.classList.remove('visible');
  if (label) label.textContent = 'Ask AI for a hint';
  if (tog)   tog.setAttribute('aria-expanded', 'false');
  if (q)     q.value = '';
  if (go)    go.disabled = false;
  ctfAiRender();
}

function toggleAiHint() {
  ctfAiOpen = !ctfAiOpen;
  const panel = document.getElementById('ctfAiPanel');
  const label = document.getElementById('ctfAiToggleLabel');
  const tog   = document.getElementById('ctfAiToggle');
  if (panel) panel.classList.toggle('visible', ctfAiOpen);
  if (label) label.textContent = ctfAiOpen ? 'Hide AI hint' : 'Ask AI for a hint';
  if (tog)   tog.setAttribute('aria-expanded', ctfAiOpen ? 'true' : 'false');
  if (ctfAiOpen) ctfAiRender();
}

async function askAiHint() {
  const c = ctfCurrentChallenge;
  if (!c || ctfAiBusy) return;
  const qEl = document.getElementById('ctfAiQ');
  const go  = document.getElementById('ctfAiGo');
  const question = qEl ? qEl.value.trim() : '';

  ctfAiBusy = true;
  if (go) go.disabled = true;
  ctfAiRender();                                   // clears any old error message
  const wait = ctfAiMessage('ctf-ai-wait', 'Thinking...');

  let ok = false, data = {}, netFail = false;
  try {
    const res = await fetch('/api/lab/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId: c.id, question: question, sessionId: ctfAiSid() })
    });
    try { data = await res.json(); } catch (e) {}
    ok = res.ok && typeof data.hint === 'string' && data.hint.length > 0;
  } catch (e) {
    netFail = true;
  }

  ctfAiBusy = false;
  if (go) go.disabled = false;
  // the player may have opened another challenge while we waited
  if (!ctfCurrentChallenge || ctfCurrentChallenge.id !== c.id) {
    if (ok) {
      const st0 = ctfAiState[c.id] || (ctfAiState[c.id] = { cards: [], max: data.max, remaining: data.remaining });
      st0.cards.push({ hint: data.hint, n: data.used }); st0.max = data.max; st0.remaining = data.remaining;
    }
    return;
  }
  if (wait && wait.parentNode) wait.remove();

  if (ok) {
    const st = ctfAiState[c.id] || (ctfAiState[c.id] = { cards: [], max: data.max, remaining: data.remaining });
    st.cards.push({ hint: data.hint, n: data.used });
    st.max = data.max;
    st.remaining = data.remaining;
    if (qEl) qEl.value = '';
    ctfAiRender();
  } else {
    if (!netFail && typeof data.remaining === 'number') {
      const st = ctfAiState[c.id] || (ctfAiState[c.id] = { cards: [], max: data.max || data.remaining, remaining: data.remaining });
      st.remaining = data.remaining;
      ctfAiRender();
    }
    ctfAiMessage('ctf-ai-err', netFail ? 'Could not reach the server. Check your connection and try again.' : (data.error || 'Could not get a hint right now. Try again in a moment.'));
  }
}

function closeCTFModal() {
  document.getElementById('ctfModalOverlay').classList.remove('active');
  document.body.classList.remove('ctf-modal-open');
  ctfActiveLabUrl = null;
  // Save running state so reopening shows Restart not Start
  if (ctfCurrentChallenge && ctfCurrentChallenge.labUrl) {
    const runningWrap = document.getElementById('ctfRunningWrap');
    const isRunning = runningWrap && runningWrap.style.display !== 'none';
    const tv = document.getElementById('ctfTimerVal');
    ctfLabState[ctfCurrentChallenge.id] = {
      running: isRunning,
      timerVal: tv ? tv.textContent : '30:00'
    };
  }
  ctfCurrentChallenge = null;
}

/* ── LAB ACCESS TOKEN ── */
// Token ek baar generate hota hai jab user Start dabaata hai.
// Lab page is token ke bina open nahi hogi (direct URL se access block).
const ctfLabTokens = {}; // challengeId → token

function generateLabToken(challengeId) {
  const token = 'acx_' + challengeId + '_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
  ctfLabTokens[challengeId] = token;
  // sessionStorage mein save karo (lab page issi window.origin pe chalta hai)
  try { sessionStorage.setItem('acx_lab_token_' + challengeId, token); } catch(e) {}
  return token;
}

function getLabUrlWithToken(c) {
  // For hasLabFlow challenges open the target site directly (labApiPath/page)
  // instead of the lab wrapper page, session ID passed as query param
  if (c.hasLabFlow && c.labApiPath) {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
    try { sessionStorage.setItem('acx_lab_direct_session_' + c.id, sessionId); } catch(e) {}
    return c.labApiPath + '/page?session=' + encodeURIComponent(sessionId);
  }
  generateLabToken(c.id);
  const sep = c.labUrl.includes('?') ? '&' : '?';
  const sessVal = 'sess_' + Math.random().toString(36).substring(2, 12);
  try { sessionStorage.setItem('acx_lab_session_' + c.id, sessVal); } catch(e) {}
  return c.labUrl + sep + 'session=' + encodeURIComponent(sessVal);
}

/* ── LAB LAUNCH ── */
let ctfActiveTab = null;
let ctfActiveLabUrl = null; // View Lab button ke liye URL store
let ctfTimerPoll = null;

function ctfLaunchClick(e) {
  e.preventDefault();
  const c = ctfCurrentChallenge;
  if (!c || !c.labUrl) return false;
  ctfStartInstance(c);
  return false;
}

// Synchronous, localStorage-only enforcement, sirf ek challenge ka
// "active" state kabhi bhi localStorage mein rehna chahiye. Ye function
// koi network call ya tab close nahi karta, sirf stale flags clear karta hai,
// taaki modal/grid hamesha sahi state dikhaye chahe stop call kahin miss ho jaye.
function ctfEnforceSingleActiveLocal(keepId) {
  ctfChallenges.forEach(ch => {
    if (ch.id === keepId) return;
    try {
      if (localStorage.getItem('acx_lab_active_' + ch.id)) {
        localStorage.removeItem('acx_lab_active_' + ch.id);
      }
    } catch(e) {}
    if (ctfLabState && ctfLabState[ch.id]) ctfLabState[ch.id] = { running: false, timerVal: '30:00' };
  });
}

// Server-side stop calls for every other challenge that has a backend instance.
// Fire-and-forget, UI aur window.open ka wait nahi karta, taaki popup block na ho.
function ctfStopOtherInstancesOnServer(exceptId) {
  ctfChallenges.forEach(ch => {
    if (ch.id === exceptId) return;
    if (!ch.hasLabFlow || !ch.labApiPath) return;
    const sess = sessionStorage.getItem('acx_lab_direct_session_' + ch.id);
    if (!sess) return; // never started, nothing to stop
    fetch(ch.labApiPath + '/instance/stop', {
      method: 'POST',
      headers: { 'X-Lab-Session': sess }
    }).catch(() => {});
  });
}

async function ctfStartInstance(c) {
  // Pehle turant, synchronously, doosri sab challenges ka local "active" state
  // saaf karo aur unka tab band karo, koi await yahan nahi, taaki window.open
  // popup blocker se na ruke (popup sirf direct click ke andar hi allow hota hai).
  ctfEnforceSingleActiveLocal(c.id);
  if (ctfActiveTab && !ctfActiveTab.closed) {
    try { ctfActiveTab.close(); } catch(e) {}
  }
  ctfActiveTab = null;

  document.getElementById('ctfStartWrap').style.display = 'none';
  document.getElementById('ctfRunningWrap').style.display = 'block';
  document.getElementById('ctfTimerRow').classList.add('show');
  document.getElementById('ctfFlagSection').style.display = 'block';
  const timerVal = document.getElementById('ctfTimerVal');
  if (timerVal) timerVal.textContent = '30:00';

  // Server-side stop calls for other running instances, background mein,
  // window.open ko block nahi karna (fire and forget)
  ctfStopOtherInstancesOnServer(c.id);

  // For hasLabFlow: ping server to start instance, store URL for View Lab
  if (c.hasLabFlow && c.labApiPath) {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
    try { sessionStorage.setItem('acx_lab_direct_session_' + c.id, sessionId); } catch(e) {}
    // Start server instance
    fetch(c.labApiPath + '/instance/restart', {
      method: 'POST',
      headers: { 'X-Lab-Session': sessionId }
    }).catch(() => {});
    // Store URL, View Lab button se new tab mein khulega
    ctfActiveLabUrl = c.labApiPath + '/page?session=' + encodeURIComponent(sessionId);
  } else {
    ctfActiveLabUrl = getLabUrlWithToken(c);
  }

  // localStorage mein lab active state save karo (refresh pe survive karta hai)
  try {
    localStorage.setItem('acx_lab_active_' + c.id, JSON.stringify({ startedAt: Date.now(), secsLeft: 1800 }));
  } catch(e) {}

  // Start countdown timer
  let secs = 1800;
  if (ctfTimerPoll) clearInterval(ctfTimerPoll);
  ctfTimerPoll = setInterval(() => {
    secs--;
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    const tv = document.getElementById('ctfTimerVal');
    if (tv) {
      tv.textContent = m + ':' + s;
      tv.className = 'ctf-timer-val' + (secs <= 300 ? ' danger' : secs <= 600 ? ' warn' : '');
    }
    // Timer bhi update karo localStorage mein
    try {
      const d = JSON.parse(localStorage.getItem('acx_lab_active_' + c.id) || 'null');
      if (d) { d.secsLeft = secs; localStorage.setItem('acx_lab_active_' + c.id, JSON.stringify(d)); }
    } catch(e) {}
    if (secs <= 0) {
      clearInterval(ctfTimerPoll); ctfTimerPoll = null;
      // Timer expire, lab active state clear karo
      try { localStorage.removeItem('acx_lab_active_' + c.id); } catch(e) {}
    }
  }, 1000);
}

function ctfRestartFromModal() {
  const c = ctfCurrentChallenge;
  if (!c) return;

  ctfEnforceSingleActiveLocal(c.id);
  ctfStopOtherInstancesOnServer(c.id);

  let targetUrl;
  if (c.hasLabFlow && c.labApiPath) {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
    try { sessionStorage.setItem('acx_lab_direct_session_' + c.id, sessionId); } catch(e) {}
    fetch(c.labApiPath + '/instance/restart', {
      method: 'POST',
      headers: { 'X-Lab-Session': sessionId }
    }).catch(() => {});
    targetUrl = c.labApiPath + '/page?session=' + encodeURIComponent(sessionId);
  } else {
    targetUrl = getLabUrlWithToken(c);
  }

  if (ctfActiveTab && !ctfActiveTab.closed) {
    ctfActiveTab.location.href = targetUrl;
    ctfActiveTab.focus();
  } else {
    ctfActiveLabUrl = targetUrl;
  }
  // Reset localStorage state on restart
  try {
    localStorage.setItem('acx_lab_active_' + c.id, JSON.stringify({ startedAt: Date.now(), secsLeft: 1800 }));
  } catch(e) {}
  // Reset timer
  if (ctfTimerPoll) clearInterval(ctfTimerPoll);
  let secs = 1800;
  const tv = document.getElementById('ctfTimerVal');
  if (tv) tv.textContent = '30:00';
  ctfTimerPoll = setInterval(() => {
    secs--;
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    const t = document.getElementById('ctfTimerVal');
    if (t) {
      t.textContent = m + ':' + s;
      t.className = 'ctf-timer-val' + (secs <= 300 ? ' danger' : secs <= 600 ? ' warn' : '');
    }
    try {
      const d = JSON.parse(localStorage.getItem('acx_lab_active_' + c.id) || 'null');
      if (d) { d.secsLeft = secs; localStorage.setItem('acx_lab_active_' + c.id, JSON.stringify(d)); }
    } catch(e) {}
    if (secs <= 0) {
      clearInterval(ctfTimerPoll); ctfTimerPoll = null;
      try { localStorage.removeItem('acx_lab_active_' + c.id); } catch(e) {}
    }
  }, 1000);
}

function ctfOpenLabTab(e) {
  if (e && e.preventDefault) e.preventDefault();
  const c = ctfCurrentChallenge;
  if (!c) return false;
  // ctfActiveLabUrl mein stored URL new tab mein kholo
  let url = ctfActiveLabUrl;
  if (!url) {
    // Fallback: session se recover karo
    if (c.hasLabFlow && c.labApiPath) {
      const sid = (() => { try { return sessionStorage.getItem('acx_lab_direct_session_' + c.id); } catch(e) { return null; } })();
      url = c.labApiPath + '/page' + (sid ? '?session=' + encodeURIComponent(sid) : '');
    } else {
      url = c.labUrl || '#';
    }
  }
  window.open(url, '_blank');
  return false;
}

/* ── FLAG SUBMIT ── */
/* ── SOLVE CELEBRATION (HTB-style pop + chime) ──
   No audio file needed, a quick ascending chime is synthesized live via
   Web Audio API. Triggered from submitCTFFlag() on a real user click,
   so browser autoplay restrictions don't block it. */
function playSolveSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6, major arpeggio
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => { try { ctx.close(); } catch(e) {} }, 900);
  } catch(e) { /* Web Audio unavailable, fail silently, visuals still play */ }
}

function showSolveCelebration(challengeTitle) {
  playSolveSound();
  const toast = document.getElementById('ctfSolveToast');
  const sub   = document.getElementById('ctfSolveToastSub');
  if (sub) sub.textContent = challengeTitle ? `"${challengeTitle}" solved.` : 'Challenge solved.';
  if (toast) {
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }
}

async function submitCTFFlag() {
  if (!ctfCurrentChallenge) return;
  const c = ctfCurrentChallenge;

  if (!window._currentUser) {
    showFlagMsg('error', '[!] Please login to submit a flag.');
    return;
  }

  // Was this challenge solved before? The flag is still checked below (the server
  // verifies it first), and only a CORRECT flag gets the "already solved" message.
  // XP is only ever given once, by the server.
  const wasSolved = !!ctfSolved[c.id];

  const inp  = document.getElementById('ctfFlagInput');
  const btn  = document.getElementById('ctfSubmitBtn');
  const flag = inp.value.trim();

  // ── CTF Flag validation ───────────────────────────────────────
  if (!flag) {
    showFlagMsg('error', '[!] Please enter a flag.');
    inp.focus();
    return;
  }
  if (flag.length < 4) {
    showFlagMsg('error', '[!] Flag is too short.');
    return;
  }
  if (flag.length > 300) {
    showFlagMsg('error', '[!] Flag is too long.');
    return;
  }
  if (/<[^>]*>/.test(flag)) {
    showFlagMsg('error', '[!] Flag cannot contain HTML.');
    return;
  }
  // Warn if flag does not match expected ACX{...} format (soft check, not hard block)
  if (!/^ACX\{.+\}$/.test(flag)) {
    showFlagMsg('error', '[!] Flag format should be ACX{...}');
    inp.classList.add('wrong');
    setTimeout(() => inp.classList.remove('wrong'), 600);
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Checking...';

  // Slight delay for UX
  await new Promise(r => setTimeout(r, 600));

  // Real CTF rule: challenges with a live lab backend get validated by that server.
  // Everything else now goes through submit_ctf_flag() RPC, flag never leaves DB.
  let isCorrect = false;
  let alreadyResp = false;
  let earnedXP = c.xp;
  if (c.hasLabFlow && c.labApiPath) {
    try {
      const sessionId = (function() {
        try {
          let sid = sessionStorage.getItem('acx_lab_session_' + c.id);
          if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substring(2, 10);
            sessionStorage.setItem('acx_lab_session_' + c.id, sid);
          }
          return sid;
        } catch(e) { return 'sess_' + Math.random().toString(36).substring(2, 10); }
      })();

      const res = await fetch(c.labApiPath + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Lab-Session': sessionId },
        body: JSON.stringify({ flag })
      });
      const data = await res.json().catch(() => ({}));
      isCorrect = !!(res.ok && data.success);
      // Lab backend hi sole source of truth hai, flag client pe kabhi nahi aata,
      // isliye yahan koi client-side fallback nahi hai. Agar redeploy ke baad
      // flag stale ho jaaye, woh server/lab route mein fix karna hoga.
      // Lab backend ne validate kiya, ab Supabase mein bhi record karo via RPC
      // FIX: c.dbId kabhi set hi nahi hota tha (CTF_CHALLENGES mein koi entry
      // mein dbId field nahi hai), isliye yeh RPC har lab challenge (Cookie
      // Monster, Hidden in Plain Sight, etc.) pe silently skip ho jaata tha.
      // Solve sirf localStorage mein save hota tha, Supabase ctf_solves mein
      // kabhi nahi, isi liye /rooms pe "Solved" dikhta tha lekin /profile
      // (jo sirf DB se padhta hai) pe 0 XP / 0 solved aata tha.
      if (isCorrect && !wasSolved) {
        // Save solve to DB via ctf-sync.js
        await window.acxRecordSolve(c.id, earnedXP);
      }
    } catch (e) {
      showFlagMsg('error', '[!] Could not connect to server. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Submit';
      return;
    }
  } else if (window._supabase) {
    // Supabase UUID dhundo slug se
    const uuid = getChallengeUuid(c.id) || c.dbId || null;
    if (uuid) {
      const { data: rpcData, error: rpcErr } = await window._supabase.rpc('submit_ctf_flag', {
        p_challenge_id: uuid,
        p_flag: flag
      });
      if (rpcErr) {
        console.warn('[CTF] RPC error:', rpcErr);
        showFlagMsg('error', '[!] Server error. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Submit';
        return;
      }
      const result = rpcData?.[0] || rpcData || {};

      // FIX: server ab rate_limited/locked (missing prereqs) ke liye
      // specific error + message deta hai. Pehle yeh dono generic
      // "[X] Incorrect flag" mein fall through ho jaate the. Sirf inhi 2
      // cases ke liye alag message dikhao aur yahin return karo; baaki
      // error codes (not_found, auth_required, wrong_flag, etc.) purane
      // generic wrong-flag path se hi safe handle hote hain.
      if (result.error === 'rate_limited' || result.error === 'locked') {
        showFlagMsg('error', '[!] ' + (result.message || 'Try again in a moment.'));
        btn.disabled = false;
        btn.textContent = 'Submit';
        return;
      }

      isCorrect = result.correct || result.already_solved;
      alreadyResp = !!result.already_solved;
      earnedXP  = result.already_solved ? 0 : (result.xp_earned || result.points_earned || c.xp);
      // FIX: yahan pehle safety-net ke taur pe acxRecordSolve() bhi call hota
      // tha. Lekin submit_ctf_flag RPC khud hi ctf_solves insert + profiles.xp/
      // level/ctf_solves update atomically SQL mein kar deta hai, koi gap
      // nahi hai jo safety-net fix kare. acxRecordSolve() ka apna existing-solve
      // check ek alag SELECT se hota hai (RPC ke commit se race ho sakta tha),
      // isliye rare case mein dono writes chal jaate aur XP do baar add ho
      // jaata profiles.xp mein. RPC hi authoritative hai is branch ke liye,
      // isliye extra call hata diya.
    } else {
      // UUID nahi mila, flag client pe kabhi available nahi hota, isliye
      // yahan validate karna possible nahi hai. Fail safely, user ko batao.
      console.warn('[CTF] UUID not found, cannot validate flag client-side');
      showFlagMsg('error', '[!] Could not verify this challenge right now. Please try again shortly.');
      btn.disabled = false;
      btn.textContent = 'Submit';
      return;
    }
  } else {
    // Supabase unavailable, flag client pe nahi hai, isliye validate nahi kar sakte.
    // Fail safely instead of silently rejecting or accepting.
    console.warn('[CTF] Supabase unavailable, cannot validate flag');
    showFlagMsg('error', '[!] Could not connect to server. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Submit';
    return;
  }

  if (isCorrect && (wasSolved || alreadyResp)) {
    // Correct flag, but this challenge was already solved: no XP, no celebration.
    inp.classList.add('correct');
    showFlagMsg('success', 'Already solved. No additional XP awarded.');
    // Correct submit ke baad flag box khaali kar do
    inp.value = '';
    setTimeout(() => inp.classList.remove('correct'), 1500);
    if (!ctfSolved[c.id]) {
      // solved on another device or session: show it as solved here too
      ctfSolved[c.id] = { xp: c.xp, solvedAt: new Date().toISOString() };
      saveCTFSolvedToStorage();
      updateCTFStats();
      ctfRender();
    }
    if (ctfActiveTab && !ctfActiveTab.closed) {
      try { ctfActiveTab.close(); } catch(e) {}
      ctfActiveTab = null;
    }
    if (ctfTimerPoll) { clearInterval(ctfTimerPoll); ctfTimerPoll = null; }
    try { sessionStorage.removeItem('acx_lab_token_' + c.id); } catch(e) {}
    btn.disabled = false;
    btn.textContent = 'Submit';
    return;
  }

  if (isCorrect) {
    // ✅ CORRECT (first time)
    inp.classList.add('correct');
    showFlagMsg('success', `✓ Correct! +${earnedXP} XP earned!`);
    // Correct submit ke baad flag box khaali kar do
    inp.value = '';
    setTimeout(() => inp.classList.remove('correct'), 1500);
    showSolveCelebration(c.title);
    // Close lab tab automatically (real CTF ki tarah)
    if (ctfActiveTab && !ctfActiveTab.closed) {
      try { ctfActiveTab.close(); } catch(e) {}
      ctfActiveTab = null;
    }
    // Stop timer
    if (ctfTimerPoll) { clearInterval(ctfTimerPoll); ctfTimerPoll = null; }
    // Invalidate lab token
    try { sessionStorage.removeItem('acx_lab_token_' + c.id); } catch(e) {}

    // LocalStorage mein save karo (RPC ne DB already update kar diya)
    ctfSolved[c.id] = { xp: earnedXP, solvedAt: new Date().toISOString() };
    saveCTFSolvedToStorage();
    // (saveSolvedToSupabase call removed, submit_ctf_flag RPC handles it)

    // FIX: Lab challenges mein acxRecordSolve() pehle se _currentUser.xp
    // update kar deta hai. Agar yahan bhi earnedXP add karo toh DOUBLE
    // XP memory mein ho jaata (display wrong, profile reload tak).
    // Solution: sirf non-lab challenges (RPC branch) mein update karo.
    // Lab branch ka c.hasLabFlow=true flag check karo.
    if (window._currentUser && earnedXP > 0 && !c.hasLabFlow) {
      // Non-lab RPC branch: acxRecordSolve nahi chala, manually update karo
      window._currentUser.xp         = (window._currentUser.xp || 0) + earnedXP;
      window._currentUser.ctf_solves = (window._currentUser.ctf_solves || 0) + 1;
      window._currentUser.level      = Math.max(1, Math.floor(window._currentUser.xp / 500) + 1);
    }
    // Nav update dono branches ke liye (acxRecordSolve updated xp for labs,
    // we updated it above for non-labs, either way reflect in nav now)
    if (window._currentUser && typeof updateNavForUser === 'function') {
      updateNavForUser(window._currentUser);
    }

    // Update UI
    updateCTFStats();
    ctfRender();

    // Lab is stopped now: START shown, Restart/ViewLab and timer hidden.
    // The flag box stays visible so the success message above stays on screen.
    const sw = document.getElementById('ctfStartWrap');
    const rw = document.getElementById('ctfRunningWrap');
    const tr = document.getElementById('ctfTimerRow');
    if (sw) sw.style.display = 'block';
    if (rw) rw.style.display = 'none';
    if (tr) tr.classList.remove('show');
    btn.disabled = false;
    btn.textContent = 'Submit';

  } else {
    // [X] WRONG
    inp.classList.add('wrong');
    setTimeout(() => inp.classList.remove('wrong'), 500);
    showFlagMsg('error', '[X] Incorrect flag. Please try again!');
    btn.disabled = false;
    btn.textContent = 'Submit';
  }
}

function showFlagMsg(type, text) {
  const el = document.getElementById('ctfFlagMsg');
  if (!el) return;
  el.className = `ctf-flag-msg ${type}`;
  el.textContent = text;
}

/* Keyboard shortcut, Esc closes modal */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCTFModal();
});

/* ════════════════════════════════════════════════════
   AUTO-OPEN MODAL, lab se return pe modal reopen karo
   Three channels, one handler:
   A) window.opener.acxLabReturn(), direct call (same-origin, opener tab)
   B) localStorage 'storage' event, cross-tab signal when tab closes
   C) sessionStorage acx_back_to_ctf, same-tab redirect fallback (mobile)
════════════════════════════════════════════════════ */
(function autoOpenFromReturn() {
  let pendingReturnId = null; // set once, consumed once
  let returnHandled = false;

  // Core: CTF page show karo aur modal open karo
  // Called only when we have a valid returnId and user is logged in
  function doReturnToModal(returnId) {
    if (returnHandled || !returnId) return;

    function tryOpen(attempts) {
      if (returnHandled) return;
      const c = (window.CTF_CHALLENGES || []).find(x => x.id === returnId);
      const overlay = document.getElementById('ctfModalOverlay');
      const ctfPageEl = document.getElementById('ctfPage');
      const ctfPageActive = ctfPageEl && ctfPageEl.classList.contains('active');

      if (!window._currentUser) {
        // Auth not ready yet, wait
        if (attempts > 0) setTimeout(() => tryOpen(attempts - 1), 300);
        return;
      }

      if (c && overlay && ctfPageActive) {
        returnHandled = true;
        setTimeout(() => openCTFModal(returnId), 150);
      } else if (c && overlay && typeof showPage === 'function') {
        // Navigate to CTF page first
        showPage('ctf');
        if (attempts > 0) setTimeout(() => tryOpen(attempts - 1), 300);
      } else if (attempts > 0) {
        setTimeout(() => tryOpen(attempts - 1), 300);
      }
    }

    // Listen for CTF page shown event too (belt + suspenders)
    document.addEventListener('acx:ctf-page-shown', function handler() {
      if (returnHandled) return;
      returnHandled = true;
      setTimeout(() => openCTFModal(returnId), 150);
    }, { once: true });

    tryOpen(15);
  }

  // ── Channel A: Direct opener call ──
  // Lab tab calls window.opener.acxLabReturn(id) directly
  window.acxLabReturn = function(returnId) {
    if (!returnId || returnHandled) return;
    window.focus();
    doReturnToModal(returnId);
  };

  // ── Channel B: Cross-tab localStorage signal ──
  // Lab tab sets acx_return_to_modal then closes, storage event fires in THIS tab
  window.addEventListener('storage', function(e) {
    // Re-render CTF grid when disabled list changes (same-browser cross-tab sync)
    if (e.key === 'acx_ctf_disabled') {
      ctfRender();
      updateCTFStats();
      return;
    }
    if (e.key !== 'acx_return_to_modal' || !e.newValue) return;
    const returnId = e.newValue;
    try {
      const ts = parseInt(localStorage.getItem('acx_return_ts') || '0');
      if (Date.now() - ts > 6000) return; // stale signal
    } catch(ex) {}
    try { localStorage.removeItem('acx_return_to_modal'); localStorage.removeItem('acx_return_ts'); } catch(ex) {}
    if (returnHandled) return;
    doReturnToModal(returnId);
  });

  // ── Channel C: sessionStorage, same-tab redirect (mobile window.close() failed) ──
  // Lab tab sets acx_back_to_ctf in sessionStorage then navigates to '/'
  // This runs on fresh page load, initAuth will call consumePendingRedirect AFTER this
  // So we just store the returnId; consumePendingRedirect will call doReturnToModal
  try {
    const backId = sessionStorage.getItem('acx_back_to_ctf');
    const backTs = parseInt(sessionStorage.getItem('acx_back_ts') || '0');
    if (backId && (Date.now() - backTs < 10000)) {
      sessionStorage.removeItem('acx_back_to_ctf');
      sessionStorage.removeItem('acx_back_ts');
      pendingReturnId = backId;
      // Expose it so consumePendingRedirect can pick it up
      window._acxPendingLabReturn = backId;
    }
  } catch(ex) {}

  // Legacy: ctf_return_id sessionStorage (other labs)
  try {
    const legacyId = sessionStorage.getItem('ctf_return_id');
    if (legacyId && !window._acxPendingLabReturn) {
      sessionStorage.removeItem('ctf_return_id');
      window._acxPendingLabReturn = legacyId;
    }
  } catch(ex) {}
})();
