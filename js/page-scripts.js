/* ── Auth header for our own API ──────────────────────────────
   Tool routes on the server verify the Supabase access token, so every
   same-origin /api/ request carries "Authorization: Bearer <token>"
   when a user is logged in. Done once here so each fetch() call site
   doesn't have to remember it. */
(function () {
  const _origFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.startsWith('/api/') && window._supabase && window._supabase.auth) {
        const { data } = await window._supabase.auth.getSession();
        const token = data && data.session && data.session.access_token;
        if (token) {
          init = Object.assign({}, init);
          const h = new Headers(init.headers || (typeof input !== 'string' && input.headers) || undefined);
          if (!h.has('Authorization')) h.set('Authorization', 'Bearer ' + token);
          init.headers = h;
        }
      }
    } catch (e) { /* fall through to the plain request */ }
    return _origFetch(input, init);
  };
})();

/* ═══════════════════════════════════════════
   COURSE CLICK - Auth gate
   Language already selected → saved in localStorage
   If logged in → go to learn page directly
   If not logged in → show login/signup modal, redirect after
═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   CONTACT FORM - Client-side validation
═══════════════════════════════════════════ */
async function handleContactSubmit() {
  const name  = (document.getElementById('contactName')?.value  || '').trim();
  const email = (document.getElementById('contactEmail')?.value || '').trim();
  const msg   = (document.getElementById('contactMsg')?.value   || '').trim();
  const hp    =  document.getElementById('contactHP')?.value    || '';
  const status = document.getElementById('contactMsg_status');

  function setStatus(txt, ok) {
    if (!status) return;
    status.style.color = ok ? '#4ade80' : '#e06060';
    status.textContent = txt;
  }

  // Pulls the message from DICT (respects selected language), falling
  // back to a hardcoded string if the key is somehow missing.
  function t(key, fallback) {
    if (typeof getDictText === 'function') {
      const v = getDictText(key);
      if (v) return v;
    }
    return fallback;
  }

  // Honeypot check - bot detected
  if (hp) { setStatus('', true); return; }

  // Validation
  if (!name)  { setStatus(t('form.status.nameRequired', 'Apna naam daalo.'), false); return; }
  if (name.length > 60) { setStatus(t('form.status.nameTooLong', 'Naam bahut lamba hai.'), false); return; }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus(t('form.status.emailInvalid', 'Valid email daalo.'), false); return; }
  if (!msg || msg.length < 10) { setStatus(t('form.status.msgTooShort', 'Message kam se kam 10 characters ka hona chahiye.'), false); return; }
  if (msg.length > 1000) { setStatus(t('form.status.msgTooLong', 'Message 1000 characters se zyada nahi ho sakta.'), false); return; }

  // XSS check - no HTML tags
  if (/<[^>]*>/.test(name + msg)) { setStatus(t('form.status.noHtml', 'Special characters are not allowed.'), false); return; }

  // Save to Supabase
  const btn = document.querySelector('.btn-send');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

  if (_supabase) {
    const { error } = await _supabase.rpc('submit_contact_message', {
      p_name:    name,
      p_email:   email,
      p_message: msg
    });
    if (error) {
      setStatus(t('form.status.sendError', 'Message could not be sent. Please try again.'), false);
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
      return;
    }
  } else {
    // FIX: Supabase client ready nahi tha (page load timing issue), pehle
    // yeh silently skip ho jaata tha aur seedha "success" dikha deta tha,
    // jabki message kahin save hi nahi hota tha. Ab user ko sach batao.
    setStatus(t('form.status.sendErrorRetry', 'Message could not be sent. Please try again in a moment.'), false);
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    return;
  }

  setStatus(t('form.status.success', 'Message mil gaya! Jaldi reply karenge.'), true);
  document.getElementById('contactName').value  = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value   = '';
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  setTimeout(() => setStatus('', true), 4000);
}
function handleCourseClick() {
  if (!window._currentUser) {
    showAuth('login', 'learn');
    return;
  }
  showPage('learn');
}
function handleCourse2Click() {
  if (!window._currentUser) {
    showAuth('login', 'learn2');
    return;
  }
  showPage('learn2');
}
// Generic version used by dynamically-rendered course cards (js/courses.js),
// works for any course's page_key, not just the original two hardcoded ones.
function handleCourseClickFor(pageKey) {
  if (!window._currentUser) {
    showAuth('login', pageKey);
    return;
  }
  showPage(pageKey);
}

// ── Cyber Mistake Analyzer ──────────────────────────────────
async function handleAnalyzeCommand() {
  const input = document.getElementById('cmaInput');
  const btn = document.getElementById('cmaAnalyzeBtn');
  const status = document.getElementById('cmaStatus');
  const resultBox = document.getElementById('cmaResult');

  const command = input.value.trim();
  if (!command) {
    status.textContent = 'Please enter a command first.';
    status.style.color = '#10b981';
    return;
  }
  if (!window._currentUser) {
    status.textContent = 'Please log in to use the analyzer.';
    status.style.color = '#10b981';
    return;
  }

  btn.disabled = true;
  btn.style.opacity = '0.6';
  status.textContent = 'Analyzing...';
  status.style.color = '#8a8a95';
  resultBox.style.display = 'none';

  try {
    const res = await fetch('/api/tools/analyze-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, userId: window._currentUser.id })
    });
    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || 'Something went wrong. Please try again.';
      status.style.color = '#10b981';
      return;
    }

    status.textContent = '';
    renderAnalyzerResult(data);
  } catch (e) {
    console.error('Cyber Mistake Analyzer error:', e);
    status.textContent = 'Network error. Please try again.';
    status.style.color = '#10b981';
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function renderAnalyzerResult(data) {
  const resultBox = document.getElementById('cmaResult');

  if (data.tool === 'unrecognized') {
    resultBox.innerHTML = `
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;">
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#f4f4f5;line-height:1.7;">${escapeHtml(data.whatItDoes || "Couldn't recognize this as a security/networking command.")}</p>
      </div>`;
    resultBox.style.display = 'block';
    return;
  }

  const riskColors = { low: '#4ade80', medium: '#fbbf24', high: '#f87171' };
  const riskColor = riskColors[data.riskLevel] || '#8a8a95';

  const listHtml = (items, color) =>
    (items && items.length)
      ? `<ul style="margin:0;padding-left:18px;">${items.map(i => `<li style="font-family:'Inter',sans-serif;font-size:13px;color:#ccc;line-height:1.8;">${escapeHtml(i)}</li>`).join('')}</ul>`
      : `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#555;">None noted.</p>`;

  resultBox.innerHTML = `
    <div class="cma-box" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:18px;">

      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${escapeHtml(data.tool || 'Command')}</div>
        <span style="font-size:10px;letter-spacing:1px;font-family:'Rajdhani',sans-serif;font-weight:700;color:${riskColor};border:1px solid ${riskColor}55;background:${riskColor}15;padding:3px 10px;border-radius:20px;">${escapeHtml((data.riskLevel || 'low').toUpperCase())} RISK</span>
      </div>

      <div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#ccc;line-height:1.7;">${escapeHtml(data.whatItDoes || '')}</p>
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#4ade80;letter-spacing:0.5px;margin-bottom:8px;">✓ WHAT YOU DID RIGHT</div>
        ${listHtml(data.didRight, '#4ade80')}
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#10b981;letter-spacing:0.5px;margin-bottom:8px;">✕ WHAT TO FIX</div>
        ${listHtml(data.didWrong, '#ef4444')}
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#8a8a95;letter-spacing:0.5px;margin-bottom:8px;">BETTER COMMAND</div>
        <div style="background:#0a0a0c;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#f4f4f5;overflow-x:auto;white-space:pre;">${escapeHtml(data.betterCommand || '')}</div>
        ${data.betterCommandWhy ? `<p style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-top:8px;line-height:1.6;">${escapeHtml(data.betterCommandWhy)}</p>` : ''}
      </div>

      <div>
        <div style="font-family:'Inter',sans-serif;font-size:11px;color:#8a8a95;letter-spacing:0.5px;margin-bottom:8px;">WHEN TO USE THIS</div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#ccc;line-height:1.7;">${escapeHtml(data.whenToUse || '')}</p>
      </div>

    </div>`;
  resultBox.style.display = 'block';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

/* ═══════════════════════════════════════════
   TOOLS PAGE - enabled/disabled state
   Reads public tool_settings rows (RLS allows anonymous select)
   so a disabled tool shows as locked even to logged-out visitors,
   instead of only failing once they click into it.
═══════════════════════════════════════════ */
async function initToolsPage() {
  if (!window._supabase) return;
  try {
    const { data, error } = await window._supabase
      .from('tool_settings')
      .select('tool_key, is_enabled, disabled_message');
    if (error || !data) return;

    data.forEach(row => {
      const card = document.querySelector(`.tut-card[data-tool-key="${row.tool_key}"]`);
      if (!card) return;
      if (!row.is_enabled) {
        card.style.opacity = '0.45';
        card.style.cursor = 'not-allowed';
        card.setAttribute('data-tool-disabled', 'true');
        card.setAttribute('data-tool-disabled-message', row.disabled_message || 'This tool is temporarily unavailable.');
        // Replace the click handler with a message instead of navigating,
        // without needing to know or preserve the original onclick logic.
        card.onclick = (e) => {
          e.stopPropagation();
          alert(card.getAttribute('data-tool-disabled-message'));
        };
        const badge = card.querySelector('.card-tag');
        if (badge && !badge.dataset.origText) {
          badge.dataset.origText = badge.textContent;
          badge.textContent = 'Unavailable';
          badge.style.color = '#8a8a95';
        }
      } else if (card.getAttribute('data-tool-disabled') === 'true') {
        // Was disabled, now re-enabled (e.g. admin flipped it back on
        // without a full page reload) - restore normal appearance.
        card.style.opacity = '';
        card.style.cursor = 'pointer';
        card.removeAttribute('data-tool-disabled');
        card.onclick = null; // page reload needed to restore original handler; acceptable for this edge case
      }
    });
  } catch (e) {
    console.error('[Tools] could not load tool settings:', e);
  }
}

/* ═══════════════════════════════════════════
   SAFE SHIMS for lazy-loaded chapter functions
   Sidebar onclicks fire before chapters.js / chapters2.js are loaded.
   These shims queue calls and replay them once scripts are ready.
═══════════════════════════════════════════ */
(function() {
  // Network Forensics content lives in per-chapter files (js/chapter-content/
  // forensics-NN.js, each sets window.chapterContentNN). They must be loaded
  // together with chapters.js; router.js uses this too when the course page
  // opens directly. (Chapter 11 has no file; chapters.js loads it from the DB.)
  var _forensicsChapterIndices = [0,1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24];
  window.acxEnsureForensicsScripts = function() {
    var urls = _forensicsChapterIndices.map(function(n) {
      return '/js/chapter-content/forensics-' + String(n).padStart(2, '0') + '.js';
    });
    return Promise.all(urls.concat(['/js/chapters.js']).map(loadScriptOnce));
  };

  // ── loadChapter shim (Network Forensics - chapters.js) ──
  var _q1 = null;
  window.loadChapter = function(index) {
    if (window.loadChapter._real) {
      window.loadChapter._real(index);
    } else {
      _q1 = index;
      // Chapter content used to live inline inside chapters.js; it's now split
      // into small per-chapter files (js/chapter-content/forensics-NN.js) that
      // each just set a window.chapterContentNN string. Load all of them plus
      // chapters.js itself before running the real function, so those globals
      // already exist when it reads them.
      window.acxEnsureForensicsScripts().then(function() {
        if (window.loadChapter._real && _q1 !== null) {
          window.loadChapter._real(_q1);
          _q1 = null;
        }
      });
    }
  };
  window.loadChapter._real = null; // set by chapters.js after load

  // ── loadCyberChapter shim (Cyber Attacks - chapters2.js) ──
  var _q2 = null;
  window.loadCyberChapter = function(index) {
    if (window.loadCyberChapter._real) {
      window.loadCyberChapter._real(index);
    } else {
      _q2 = index;
      loadScriptOnce('/js/chapters2.js').then(function() {
        if (window.loadCyberChapter._real && _q2 !== null) {
          window.loadCyberChapter._real(_q2);
          _q2 = null;
        }
      });
    }
  };
  window.loadCyberChapter._real = null; // set by chapters2.js after load

  // ── loadEthicalChapter shim (Ethical Hacking - chapters3.js) ──
  var _q3 = null;
  window.loadEthicalChapter = function(index) {
    if (window.loadEthicalChapter._real) {
      window.loadEthicalChapter._real(index);
    } else {
      _q3 = index;
      loadScriptOnce('/js/chapters3.js').then(function() {
        if (window.loadEthicalChapter._real && _q3 !== null) {
          window.loadEthicalChapter._real(_q3);
          _q3 = null;
        }
      });
    }
  };
  window.loadEthicalChapter._real = null; // set by chapters3.js after load
})();
