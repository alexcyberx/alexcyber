/* ═══════════════════════════════════════════════════════════
   ADMIN AI SEARCH (browser side)
   ═══════════════════════════════════════════════════════════
   One helper for every search box in the admin panel.

   The AI only turns a question into keywords (server: /api/lab/admin-search).
   The panel then matches those keywords against its own rows, so a result
   is always a real row. If the AI fails, normal search keeps working.

   Use in a filter function:
     AdminAI.match('users', q, [u.name, u.email])      -> true / false

   Hook a search box (once, after the panel loads):
     AdminAI.bind({
       input:    '#sec-users .search-input input',
       scope:    'users',          // what the server is told (see adminSearch.js)
       key:      'users',          // optional, state slot, defaults to scope
       rerender: () => filterUsers(),
       rows:     () => users,
       fields:   u => [u.name, u.email, u.role]
     });

   Typing filters normally at once. After a short pause, or on Enter,
   the AI adds its keywords and the list is filtered again.
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const URL_AI       = '/api/lab/admin-search';
  const IDLE_MS      = 900;
  const MIN_LEN      = 3;
  const STOP = new Set(['the','and','for','with','your','you','this','that','are','from','how','what','into','can','will','has','have','not','all','any','use','using','its','our','new','null','undefined']);

  const state = {};   // scope -> { q, keywords, note }
  const busy  = {};   // scope -> true while a request runs

  /* ── Styles for the small AI button inside each search box ── */
  function injectStyle() {
    if (document.getElementById('adminAiStyle')) return;
    const s = document.createElement('style');
    s.id = 'adminAiStyle';
    s.textContent =
      '.adm-ai-btn{flex-shrink:0;margin-left:6px;padding:2px 7px;border-radius:6px;border:1px solid var(--border);' +
      'background:transparent;color:var(--text-dim);font-size:10px;font-weight:600;letter-spacing:.4px;cursor:pointer;line-height:1.5;}' +
      '.adm-ai-btn:hover{border-color:var(--border-h);color:var(--text);}' +
      '.adm-ai-btn.busy{opacity:.6;cursor:default;}' +
      '.adm-ai-btn.ok{color:#22c55e;border-color:#22c55e55;}' +
      '.adm-ai-btn.err{color:#f59e0b;border-color:#f59e0b55;}';
    document.head.appendChild(s);
  }

  /* ── Access token of the logged in admin ── */
  async function getToken() {
    const sb = window._supabase || (typeof _supabase !== 'undefined' ? _supabase : null);
    if (!sb) throw new Error('Not connected to database.');
    const res = await sb.auth.getSession();
    const tok = res && res.data && res.data.session && res.data.session.access_token;
    if (!tok) throw new Error('Please log in again.');
    return tok;
  }

  /* ── Words that really exist in the rows, so keywords line up with them ── */
  function vocabFrom(rows, fields) {
    const freq = new Map();
    (rows || []).forEach(r => {
      let parts = [];
      try { parts = fields(r) || []; } catch (e) {}
      parts.forEach(p => {
        String(p == null ? '' : p).toLowerCase().split(/[^a-z0-9+#.]+/).forEach(w => {
          if (w.length < 3 || w.length > 20 || STOP.has(w)) return;
          freq.set(w, (freq.get(w) || 0) + 1);
        });
      });
    });
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 60).map(e => e[0]);
  }

  /* ── Ask the server for keywords ── */
  async function ask(scope, query, vocab) {
    const token = await getToken();
    let res, data = {};
    try {
      res = await fetch(URL_AI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ query: query, scope: scope, vocab: vocab || [] })
      });
    } catch (e) {
      throw new Error('Could not reach the server. Showing normal results.');
    }
    try { data = await res.json(); } catch (e) {}
    if (!res.ok || !Array.isArray(data.keywords)) {
      throw new Error(data.error || 'AI search is not available right now. Showing normal results.');
    }
    return data;
  }

  /* ── Matching used inside every filter function ──
     q must already be lower case. A row matches if the typed text is in it,
     or, when the AI answered for this exact text, if any AI keyword is. */
  function norm(q) { return String(q == null ? '' : q).replace(/\s+/g, ' ').trim().toLowerCase(); }

  function match(key, q, fields) {
    q = norm(q);
    if (!q) return true;
    const hay = fields.map(f => String(f == null ? '' : f)).join(' ').toLowerCase();
    if (hay.includes(q)) return true;
    const st = state[key];
    if (st && st.q === q) return st.keywords.some(k => hay.includes(k));
    return false;
  }

  // AI keywords for this exact text, or an empty list (used by searches that query Supabase)
  function keywords(key, q) {
    const st = state[key];
    return st && st.q === norm(q) ? st.keywords.slice() : [];
  }

  function note(key) { return state[key] ? state[key].note : ''; }
  function reset(key) { delete state[key]; }

  /* ── Hook one search box ── */
  function bind(opts) {
    injectStyle();
    const input = typeof opts.input === 'string' ? document.querySelector(opts.input) : opts.input;
    if (!input || input.dataset.adminAi) return null;
    input.dataset.adminAi = '1';

    const scope = opts.scope;           // sent to the server
    const key   = opts.key || scope;    // state slot, so two boxes can share a scope
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'adm-ai-btn';
    btn.textContent = 'AI';
    btn.title = 'Search with AI. Ask in your own words.';
    input.insertAdjacentElement('afterend', btn);

    let timer = null;

    function setBtn(kind, text, title) {
      btn.className = 'adm-ai-btn' + (kind ? ' ' + kind : '');
      btn.textContent = text;
      if (title) btn.title = title;
    }

    async function run() {
      const q = norm(input.value);
      if (q.length < MIN_LEN || busy[key]) return;
      if (state[key] && state[key].q === q) return;
      busy[key] = true;
      setBtn('busy', '...', 'Thinking');
      try {
        const vocab = opts.rows && opts.fields ? vocabFrom(opts.rows(), opts.fields) : [];
        const data = await ask(scope, q, vocab);
        if (norm(input.value) !== q) return;   // admin kept typing
        state[key] = { q: q, keywords: data.keywords, note: data.note || '' };
        setBtn('ok', 'AI', (data.note ? data.note + '. ' : '') + 'Keywords: ' + data.keywords.join(', '));
        opts.rerender();
      } catch (e) {
        if (norm(input.value) !== q) return;
        setBtn('err', 'AI', e.message);
      } finally {
        busy[key] = false;
        if (btn.classList.contains('busy')) setBtn('', 'AI', 'Search with AI. Ask in your own words.');
      }
    }

    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = norm(input.value);
      if (state[key] && state[key].q !== q) reset(key);
      if (!q) { setBtn('', 'AI', 'Search with AI. Ask in your own words.'); return; }
      timer = setTimeout(run, IDLE_MS);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { clearTimeout(timer); run(); }
    });
    btn.addEventListener('click', () => { clearTimeout(timer); run(); });

    return { run: run };
  }

  window.AdminAI = { bind: bind, match: match, keywords: keywords, ask: ask, vocabFrom: vocabFrom, note: note, reset: reset };
})();
