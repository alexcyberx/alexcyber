/* ═══════════════════════════════════════════
   COURSE SEARCH - AlexCyberX
   SEARCH_DATA is built dynamically:
   - Courses come live from the Supabase `courses` table (same
     source courses.js uses), so a course added from the admin
     panel shows up in search with no code edit here.
   - Tools are read live from the tool cards in #toolsPage's DOM
     (data-tool-key / data-search-page / data-search-tags), so a
     new tool card added to the Tools page shows up in search too.
   - Chapters (chapters/cyberAttackChapters) and CTF challenges
     (ctfChallenges) were already pulled live from their JS arrays.
   Hardcoded fallbacks are kept ONLY as a last-resort safety net,
   in case Supabase / the DOM aren't ready yet (offline, slow load).
═══════════════════════════════════════════ */

async function buildCourseSearchEntries() {
  const entries = [];
  try {
    if (typeof fetchCoursesWithCounts === 'function') {
      const { courses, counts } = await fetchCoursesWithCounts();
      (courses || []).forEach(c => {
        const words = [c.tag, c.title, c.description].filter(Boolean).join(' ')
          .toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        entries.push({
          type: 'course',
          title: c.title,
          sub: `Course • ${counts[c.course_key] || 0} Chapters`,
          page: c.page_key,
          chapterIndex: null,
          tags: Array.from(new Set(words))
        });
      });
    }
  } catch (e) { console.warn('[Search] course fetch failed, using fallback list', e); }

  if (!entries.length) {
    entries.push({ type:'course', title:'Network Forensics', sub:`Course • ${(typeof chapters !== 'undefined' ? chapters.length : 25)} Chapters`, page:'learn', chapterIndex:null, tags:['network','forensics','pcap','wireshark','packet','traffic','malware','nmap'] });
    entries.push({ type:'course', title:'Cyber Attacks Fundamentals', sub:`Course • ${(typeof cyberAttackChapters !== 'undefined' ? cyberAttackChapters.length : 11)} Chapters`, page:'learn2', chapterIndex:null, tags:['cyber','attacks','hacking','exploit','vulnerability','phishing','sql','xss'] });
  }
  return entries;
}

function buildToolSearchEntries() {
  const entries = [];
  const cards = document.querySelectorAll('#toolsPage .tut-card[data-tool-key]');
  cards.forEach(card => {
    const key     = card.getAttribute('data-tool-key');
    const page    = card.getAttribute('data-search-page') || key;
    const special = card.getAttribute('data-search-special') || null;
    const tagText = (card.querySelector('.card-tag')?.textContent || '').trim();
    const title   = (card.querySelector('.card-title')?.textContent || key).trim();
    const desc    = card.querySelector('.card-desc')?.textContent || '';
    const extra   = (card.getAttribute('data-search-tags') || '').replace(/,/g, ' ');
    const words   = [tagText, title, desc, extra].join(' ').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    entries.push({ type:'tool', title, sub:`Tool • ${tagText || 'Utility'}`, page, special, chapterIndex:null, tags: Array.from(new Set(words)) });
  });

  if (!entries.length) {
    entries.push({ type:'tool', title:'AlexSync', sub:'Tool • Automation', page:'alexsync', special:'alexsync', tags:['automation','alarm','wake','music','schedule','laptop','sync'] });
    entries.push({ type:'tool', title:'Cyber Mistake Analyzer', sub:'Tool • Learning', page:'mistakeAnalyzer', tags:['mistake','analyzer','command','nmap','feedback','learning','correction'] });
    entries.push({ type:'tool', title:'AlexRecon', sub:'Tool • Recon', page:'alexrecon', tags:['recon','reconnaissance','dns','ssl','subdomain','port','scan','attack surface','domain','tech stack'] });
    entries.push({ type:'tool', title:'AlexUtils', sub:'Tool • Utilities', page:'alexutils', tags:['utils','utilities','ip','dns','lookup','ssl','checker','hash','generator','base64','subnet','calculator','cve','search'] });
    entries.push({ type:'tool', title:'AlexTrace', sub:'Tool • OSINT', page:'alextrace', tags:['trace','osint','digital footprint','username','breach','email','photo','metadata','exposure'] });
  }
  return entries;
}

async function buildSearchData() {
  const data = [];

  data.push(...await buildCourseSearchEntries());
  data.push(...buildToolSearchEntries());

  // Network Forensics chapters, pulled live from router.js's `chapters` array
  if (typeof chapters !== 'undefined') {
    chapters.forEach((ch, i) => {
      data.push({ type:'chapter', title: ch.title, sub: `Network Forensics • Ch ${i + 1}`, page:'learn', chapterIndex: i, tags: ch.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean) });
    });
  }

  // Cyber Attacks Fundamentals chapters, pulled live from chapters2.js's `cyberAttackChapters` array
  if (typeof cyberAttackChapters !== 'undefined') {
    cyberAttackChapters.forEach((ch, i) => {
      data.push({ type:'chapter', title: ch.title, sub: `Cyber Attacks • Ch ${i + 1}`, page:'learn2', chapterIndex: i, tags: ch.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean) });
    });
  }

  // CTF challenges, pulled live from the ctfChallenges array, so new rooms/challenges
  // added in the future appear in nav search automatically
  if (typeof ctfChallenges !== 'undefined') {
    ctfChallenges.forEach(c => {
      data.push({
        type: 'ctf',
        title: c.title,
        sub: `CTF • ${c.cat}${c.diff ? ' • ' + c.diff : ''}`,
        page: 'ctf',
        chapterIndex: null,
        ctfId: c.id,
        tags: [c.cat, c.diff, ...(c.tags || [])].filter(Boolean).map(t => String(t).toLowerCase())
      });
    });
  }

  return data;
}

// Built once, asynchronously, on load. `ensureSearchData()` is awaited
// by every search entry point so results are always ready before use,
// and `refreshSearchData()` lets other scripts (e.g. the admin panel,
// right after adding a course) force an immediate rebuild in the same
// session without needing a page reload.
let SEARCH_DATA = [];
let _searchDataReady   = false;
let _searchDataPromise = null;

function ensureSearchData() {
  if (!_searchDataPromise) {
    _searchDataPromise = buildSearchData().then(data => {
      SEARCH_DATA = data;
      _searchDataReady = true;
      return data;
    });
  }
  return _searchDataPromise;
}

function refreshSearchData() {
  _searchDataPromise = null;
  _searchDataReady = false;
  return ensureSearchData();
}
window.refreshSearchData = refreshSearchData;

// Kick off the first build right away so it's usually ready before the
// user finishes typing their first search character.
ensureSearchData();

let _searchSelectedIndex = -1;
let _lastSearchResults    = [];
let _navSearchOpen        = false;

/* ─── Toggle nav search expand ─── */
function toggleNavSearch() {
  const expanded = document.getElementById('navSearchExpanded');
  const iconBtn  = document.getElementById('navSearchToggle');
  const dropdown = document.getElementById('searchResultsDropdown');
  _navSearchOpen = !_navSearchOpen;
  if (_navSearchOpen) {
    expanded.style.display = 'flex';
    iconBtn.style.display  = 'none';
    setTimeout(() => { const inp = document.getElementById('heroSearchInput'); if(inp) inp.focus(); }, 60);
  } else {
    expanded.style.display = 'none';
    iconBtn.style.display  = 'flex';
    dropdown.style.display = 'none';
    const inp = document.getElementById('heroSearchInput');
    if (inp) inp.value = '';
    const cb = document.getElementById('searchClearBtn');
    if (cb) cb.style.display = 'none';
    _lastSearchResults = [];
  }
}

/* ─── Core search logic (shared by nav + mobile) ─── */
async function _runSearch(q) {
  if (!q) return [];
  await ensureSearchData();
  return SEARCH_DATA.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.sub.toLowerCase().includes(q)   ||
    item.tags.some(t => t.includes(q))
  ).slice(0, 8);
}

function _renderResults(results, q, dropdownEl, opts) {
  opts = opts || {};
  const head = _aiNoteHtml(opts);
  const foot = _aiRowHtml(opts);
  if (!results.length) {
    dropdownEl.innerHTML = head + `<div class="search-no-results">No results for "<strong style="color:#888">${escapeHtml(q)}</strong>"</div>` + foot;
    dropdownEl.style.display = '';
    return;
  }
  dropdownEl.innerHTML = head + results.map((item, i) => {
    const iconSvg = item.type === 'course'
      ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="2" stroke="#dc1414" stroke-width="1.2"/><path d="M4 6.5h5M4 4.5h3" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>`
      : item.type === 'ctf'
      ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 1.5v10M2 1.5h7l-1.2 2.2L9 6H2" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : item.type === 'tool'
      ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 1.5a2.4 2.4 0 00-2.4 3L1.7 8.9a1.1 1.1 0 001.6 1.6l4.4-4.4a2.4 2.4 0 003-2.4l-1.7 1.7-1.3-1.3 1.7-1.7a2.4 2.4 0 00-1.7-.5z" stroke="#dc1414" stroke-width="1.1" stroke-linejoin="round"/></svg>`
      : `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10l4-8 4 8" stroke="#555" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 7h5" stroke="#555" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    const badgeLabel = item.type === 'course' ? 'Course' : item.type === 'ctf' ? 'CTF' : item.type === 'tool' ? 'Tool' : 'Chapter';
    const hiTitle = escapeHtml(item.title).replace(
      new RegExp(escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'),
      m => `<span class="search-highlight">${m}</span>`
    );
    return `<div class="search-result-item" data-index="${i}" onclick="selectSearchResult(${i})">
      <div class="sri-icon ${item.type}">${iconSvg}</div>
      <div class="sri-text">
        <div class="sri-title">${hiTitle}</div>
        <div class="sri-sub">${escapeHtml(item.sub)}</div>
      </div>
      <span class="sri-badge ${item.type}">${badgeLabel}</span>
    </div>`;
  }).join('') + foot;
  dropdownEl.style.display = '';
}

/* ─── AI search ─────────────────────────────────────────────
   The AI only turns a question ("web hacking sikhna hai") into a few
   keywords (server: /api/lab/search). Results are then found in the same
   live index the normal search uses, so they are always real pages. */
const AI_SEARCH_URL = '/api/lab/search';
let _aiSearchBusy = false;
const AI_STOP_WORDS = new Set(['the','and','for','with','your','you','this','that','are','from','how','what','into','can','will','has','have','not','all','any','use','using','its','our','new']);
const _AI_CTX = {
  desktop: { input: 'desktopSearchInput', dropdown: 'navSearchDesktopResults' },
  hero:    { input: 'heroSearchInput',    dropdown: 'searchResultsDropdown' }
};

const _AI_ICON = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0;"><path d="M2 3.2l3 3.3-3 3.3M6.5 10h4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function _aiRowHtml(opts) {
  if (!opts || !opts.aiCtx || opts.ai) return '';
  return `<div class="search-ai-row" role="button" tabindex="0" onclick="runAiSearch('${opts.aiCtx}')">${_AI_ICON}<span class="sai-label">Search with AI</span><span class="sai-hint">Ask in your own words</span></div>`;
}

function _aiNoteHtml(opts) {
  if (!opts) return '';
  if (opts.error) return `<div class="search-ai-note error">${escapeHtml(opts.error)}</div>`;
  if (opts.note)  return `<div class="search-ai-note">${escapeHtml(opts.note)}</div>`;
  return '';
}

// Words that really exist in the live index, so the AI's keywords line up with it.
function _aiVocab() {
  const freq = new Map();
  SEARCH_DATA.forEach(it => (it.tags || []).forEach(t => {
    t = String(t).toLowerCase().trim();
    if (t.length < 3 || t.length > 20 || AI_STOP_WORDS.has(t) || !/^[a-z0-9][a-z0-9 +#.&'-]*$/.test(t)) return;
    freq.set(t, (freq.get(t) || 0) + 1);
  }));
  const tags   = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 60).map(e => e[0]);
  const titles = SEARCH_DATA.filter(i => i.type === 'course' || i.type === 'tool')
                            .map(i => i.title.toLowerCase().trim()).filter(t => t.length <= 30);
  return Array.from(new Set(titles.concat(tags))).slice(0, 100);
}

// Look the AI's keywords up in the index. The visitor's own words count most,
// then the AI keywords in the order it gave them; a title hit beats a tag hit.
function _scoreWithKeywords(q, keywords) {
  const terms = [{ t: q.toLowerCase(), w: 4 }];
  keywords.forEach((k, i) => { if (k && k.length >= 2) terms.push({ t: k.toLowerCase(), w: Math.max(1, 3 - Math.floor(i / 3)) }); });
  const scored = [];
  SEARCH_DATA.forEach(item => {
    const title = item.title.toLowerCase(), sub = item.sub.toLowerCase();
    let score = 0;
    terms.forEach(({ t, w }) => {
      if (title.includes(t)) score += w + 1;
      else if (sub.includes(t) || item.tags.some(x => x.includes(t))) score += w;
    });
    if (score) scored.push({ item, score });
  });
  scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
  return scored.slice(0, 8).map(x => x.item);
}

async function _fetchAiKeywords(q) {
  await ensureSearchData();
  let res, data = {};
  try {
    res = await fetch(AI_SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, vocab: _aiVocab() })
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

function _aiRender(ctxName, results, q, opts) {
  const ctx = _AI_CTX[ctxName];
  const dd  = document.getElementById(ctx.dropdown);
  if (!dd) return;
  if (ctxName === 'desktop') { _deskSearchResults = results; _deskSearchIdx = -1; _renderDesktopResults(results, q, dd, opts); }
  else                       { _lastSearchResults = results; _searchSelectedIndex = -1; _renderResults(results, q, dd, opts); }
}

async function runAiSearch(ctxName) {
  const ctx = _AI_CTX[ctxName];
  if (!ctx || _aiSearchBusy) return;
  const inp = document.getElementById(ctx.input);
  const dd  = document.getElementById(ctx.dropdown);
  if (!inp || !dd) return;
  const q = inp.value.trim();
  if (q.length < 2) return;

  _aiSearchBusy = true;
  // show that something is happening, keep whatever results are on screen
  dd.style.display = '';
  const row = dd.querySelector('.search-ai-row');
  if (row) {
    row.classList.add('busy');
    row.removeAttribute('onclick');
    const label = row.querySelector('.sai-label'); if (label) label.textContent = 'Thinking...';
    const hint  = row.querySelector('.sai-hint');  if (hint)  hint.textContent  = '';
  } else {
    dd.insertAdjacentHTML('beforeend', `<div class="search-ai-row busy">${_AI_ICON}<span class="sai-label">Thinking...</span></div>`);
  }

  try {
    const data = await _fetchAiKeywords(q);
    if (inp.value.trim() !== q) return;                    // the visitor kept typing, drop this answer
    const results = _scoreWithKeywords(q, data.keywords);
    _aiRender(ctxName, results, q, { ai: true, note: data.note || 'AI search results' });
  } catch (e) {
    if (inp.value.trim() !== q) return;
    // keep the normal results, show why AI search did not work, allow another try
    const keep = ctxName === 'desktop' ? _deskSearchResults : _lastSearchResults;
    _aiRender(ctxName, keep, q, { aiCtx: ctxName, error: e.message });
  } finally {
    _aiSearchBusy = false;
  }
}
window.runAiSearch = runAiSearch;

/* ─── Nav search input handler ───
   _searchReqId guards against out-of-order async results: if the user
   keeps typing while an earlier search is still awaiting ensureSearchData(),
   only the response for the LATEST keystroke gets rendered. */
let _searchReqId = 0;
async function handleCourseSearch(val, source) {
  const q = val.trim().toLowerCase();
  const reqId = ++_searchReqId;

  if (source === 'mobile') {
    const dd = document.getElementById('mobileSearchResultsDropdown');
    if (!q) { dd.style.display = 'none'; return; }
    const results = await _runSearch(q);
    if (reqId !== _searchReqId) return;
    _lastSearchResults = results;
    _renderResults(_lastSearchResults, q, dd);
    // reattach onclick to use mobile-close
    dd.querySelectorAll('.search-result-item').forEach((el, i) => {
      el.onclick = () => selectSearchResult(i, true);
    });
    return;
  }

  // Desktop nav search
  const dd  = document.getElementById('searchResultsDropdown');
  const cb  = document.getElementById('searchClearBtn');
  if (cb) cb.style.display = q ? 'flex' : 'none';
  if (!q) { dd.style.display = 'none'; _lastSearchResults = []; return; }
  const results = await _runSearch(q);
  if (reqId !== _searchReqId) return;
  _lastSearchResults = results;
  _searchSelectedIndex = -1;
  _renderResults(_lastSearchResults, q, dd, { aiCtx: 'hero' });
}

/* ─── Select a result ─── */
function selectSearchResult(index, isMobile) {
  const item = _lastSearchResults[index];
  if (!item) return;

  // Close everything
  if (isMobile) {
    document.getElementById('mobileSearchInput').value = '';
    document.getElementById('mobileSearchResultsDropdown').style.display = 'none';
    const mm = document.getElementById('mobileMenu');
    if (mm) mm.classList.remove('show');
  } else {
    toggleNavSearch(); // close nav search
  }

  if (item.page === 'learn' && item.chapterIndex !== null) {
    showPage('learn');  setTimeout(() => loadChapter(item.chapterIndex), 80);
  } else if (item.page === 'learn2' && item.chapterIndex !== null) {
    showPage('learn2'); setTimeout(() => loadCyberChapter(item.chapterIndex), 80);
  } else if (item.page === 'ctf' && item.ctfId) {
    showPage('ctf'); setTimeout(() => { if (typeof openCTFModal === 'function') openCTFModal(item.ctfId); }, 150);
  } else if (item.type === 'tool' && item.special === 'alexsync') {
    if (typeof handleAlexSyncClick === 'function') handleAlexSyncClick();
  } else {
    showPage(item.page);
  }
}

/* ─── Clear nav search ─── */
function clearCourseSearch() {
  const inp = document.getElementById('heroSearchInput');
  if (inp) inp.value = '';
  const cb = document.getElementById('searchClearBtn');
  if (cb) cb.style.display = 'none';
  const dd = document.getElementById('searchResultsDropdown');
  if (dd) dd.style.display = 'none';
  _lastSearchResults = [];
  if (inp) inp.focus();
}

/* ─── Keyboard navigation ─── */
function handleSearchKeydown(e, source) {
  const ddId = source === 'mobile' ? 'mobileSearchResultsDropdown' : 'searchResultsDropdown';
  const dropdown = document.getElementById(ddId);
  const items = dropdown ? dropdown.querySelectorAll('.search-result-item') : [];

  if (e.key === 'Escape') {
    if (source === 'mobile') {
      document.getElementById('mobileSearchInput').value = '';
      dropdown.style.display = 'none';
    } else { toggleNavSearch(); }
    return;
  }
  if (!items.length) {
    // nothing matched: Enter asks the AI instead
    if (e.key === 'Enter' && source !== 'mobile') { e.preventDefault(); runAiSearch('hero'); }
    return;
  }
  if (e.key === 'ArrowDown') { e.preventDefault(); _searchSelectedIndex = Math.min(_searchSelectedIndex + 1, items.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); _searchSelectedIndex = Math.max(_searchSelectedIndex - 1, -1); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    const idx = _searchSelectedIndex >= 0 ? _searchSelectedIndex : 0;
    selectSearchResult(idx, source === 'mobile');
    return;
  }
  items.forEach((el, i) => el.classList.toggle('selected', i === _searchSelectedIndex));
  if (_searchSelectedIndex >= 0) items[_searchSelectedIndex].scrollIntoView({ block: 'nearest' });
}

/* ─── Close on outside click ─── */
document.addEventListener('click', function(e) {
  // Nav search
  const wrap = document.getElementById('navSearchWrap');
  if (wrap && !wrap.contains(e.target) && _navSearchOpen) toggleNavSearch();
  // Mobile search
  const mRow = document.getElementById('mobileSearchRow');
  const mDd  = document.getElementById('mobileSearchResultsDropdown');
  if (mRow && mDd && !mRow.contains(e.target)) mDd.style.display = 'none';
});

/* ─── Desktop nav search (separate from mobile, untouched) ─── */
let _deskSearchOpen = false;
let _deskSearchResults = [];
let _deskSearchIdx = -1;

function expandNavSearch() {
  const pill = document.getElementById('navSearchPill');
  if (pill) pill.classList.add('expanded');
  _deskSearchOpen = true;
}

function toggleDesktopSearch() {
  const pill = document.getElementById('navSearchPill');
  const inp  = document.getElementById('desktopSearchInput');
  if (!_deskSearchOpen) {
    if (pill) pill.classList.add('expanded');
    _deskSearchOpen = true;
    setTimeout(() => { if(inp) inp.focus(); }, 50);
  } else {
    closeDesktopSearch();
  }
}

function closeDesktopSearch() {
  _deskSearchOpen = false;
  const pill = document.getElementById('navSearchPill');
  const dd   = document.getElementById('navSearchDesktopResults');
  const inp  = document.getElementById('desktopSearchInput');
  if (pill) pill.classList.remove('expanded');
  if (dd)  dd.style.display = 'none';
  if (inp) inp.value = '';
  _deskSearchResults = [];
  _deskSearchIdx = -1;
}

let _deskSearchReqId = 0;
async function handleDesktopSearch(val) {
  const q  = val.trim().toLowerCase();
  const dd = document.getElementById('navSearchDesktopResults');
  if (!q) { dd.style.display = 'none'; _deskSearchResults = []; return; }
  const reqId = ++_deskSearchReqId;
  const results = await _runSearch(q);
  if (reqId !== _deskSearchReqId) return;
  _deskSearchResults = results;
  _deskSearchIdx = -1;
  _renderDesktopResults(results, q, dd, { aiCtx: 'desktop' });
}

function _renderDesktopResults(results, q, dd, opts) {
  opts = opts || {};
  const head = _aiNoteHtml(opts);
  const foot = _aiRowHtml(opts);
  if (!results.length) {
    dd.innerHTML = head + `<div class="search-no-results">No results for "<strong style="color:#888">${escapeHtml(q)}</strong>"</div>` + foot;
    dd.style.display = '';
    return;
  }
  dd.innerHTML = head + results.map((item, i) => {
    const badge = item.type === 'course' ? 'Course' : item.type === 'ctf' ? 'CTF' : item.type === 'tool' ? 'Tool' : 'Chapter';
    const hi = escapeHtml(item.title).replace(
      new RegExp(escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'),
      m => `<span class="search-highlight">${m}</span>`
    );
    return `<div class="search-result-item" onclick="selectDesktopResult(${i})">
      <div class="sri-text"><div class="sri-title">${hi}</div><div class="sri-sub">${escapeHtml(item.sub)}</div></div>
      <span class="sri-badge ${item.type}">${badge}</span>
    </div>`;
  }).join('') + foot;
  dd.style.display = '';
}

function handleDesktopSearchKey(e) {
  const dd = document.getElementById('navSearchDesktopResults');
  const items = dd ? dd.querySelectorAll('.search-result-item') : [];
  if (e.key === 'ArrowDown') { _deskSearchIdx = Math.min(_deskSearchIdx+1, items.length-1); _highlightDeskItem(items); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { _deskSearchIdx = Math.max(_deskSearchIdx-1, 0); _highlightDeskItem(items); e.preventDefault(); }
  else if (e.key === 'Enter') { if (_deskSearchIdx >= 0) selectDesktopResult(_deskSearchIdx); else runAiSearch('desktop'); }
  else if (e.key === 'Escape') { closeDesktopSearch(); }
}
function _highlightDeskItem(items) {
  items.forEach((el,i) => el.classList.toggle('active', i === _deskSearchIdx));
}

function selectDesktopResult(index) {
  const item = _deskSearchResults[index];
  if (!item) return;
  closeDesktopSearch();
  if (item.page === 'learn' && item.chapterIndex !== null) {
    showPage('learn');
    setTimeout(() => { if (typeof loadChapter === 'function') loadChapter(item.chapterIndex); }, 80);
  } else if (item.page === 'learn2' && item.chapterIndex !== null) {
    showPage('learn2');
    setTimeout(() => { if (typeof loadCyberChapter === 'function') loadCyberChapter(item.chapterIndex); }, 80);
  } else if (item.type === 'ctf') {
    // FIX S-1: pehle sirf showPage('ctf') tha, openCTFModal call nahi hoti thi.
    // Desktop search se CTF result click karne pe challenge page khulta tha
    // lekin modal open nahi hota tha. ab openCTFModal bhi call karo.
    showPage('ctf');
    if (item.ctfId) {
      setTimeout(() => { if (typeof openCTFModal === 'function') openCTFModal(item.ctfId); }, 150);
    }
  } else if (item.type === 'tool' && item.special === 'alexsync') {
    if (typeof handleAlexSyncClick === 'function') handleAlexSyncClick();
  } else if (item.page) {
    showPage(item.page);
  }
}

// Close desktop search on outside click
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('navSearchDesktop');
  if (wrap && !wrap.contains(e.target) && _deskSearchOpen) closeDesktopSearch();
});

/* ─── Desktop search: cursor pill par aate hi open ───
   Sirf hover-capable devices (mouse) par. Touch devices par pehle jaisa
   tap-to-open hi rehta hai. Hover se khula aur kuch type nahi kiya to
   cursor hatate hi wapas collapse ho jata hai; click se khola ya kuch
   type kiya ho to pehle jaisa hi (outside click / Esc se band). */
(function () {
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const wrap = document.getElementById('navSearchDesktop');
  const pill = document.getElementById('navSearchPill');
  const inp  = document.getElementById('desktopSearchInput');
  if (!wrap || !pill || !inp) return;

  let openedByHover = false;

  wrap.addEventListener('mouseenter', function () {
    if (_deskSearchOpen) return;
    openedByHover = true;
    expandNavSearch();
    inp.focus({ preventScroll: true });
  });

  // Click/typing = user ne khud use karna shuru kiya, ab auto-collapse nahi
  pill.addEventListener('mousedown', function () { openedByHover = false; });
  inp.addEventListener('input', function () { openedByHover = false; });

  wrap.addEventListener('mouseleave', function () {
    if (!openedByHover) return;
    openedByHover = false;
    if (inp.value.trim() === '') {
      inp.blur();
      closeDesktopSearch();
    }
  });
})();
