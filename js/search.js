/* ═══════════════════════════════════════════
   COURSE SEARCH - AlexCyberX
   SEARCH_DATA is built dynamically from the existing
   content arrays (chapters, cyberAttackChapters, ctfChallenges)
   so any new chapter / challenge added later shows up in
   search automatically — no manual edits needed here.
═══════════════════════════════════════════ */

function buildSearchData() {
  const data = [];

  // Courses (static — only 2 courses exist; add a line here if a 3rd course is created)
  data.push({ type:'course', title:'Network Forensics', sub:`Course • ${(typeof chapters !== 'undefined' ? chapters.length : 25)} Chapters`, page:'learn', chapterIndex:null, tags:['network','forensics','pcap','wireshark','packet','traffic','malware','nmap'] });
  data.push({ type:'course', title:'Cyber Attacks Fundamentals', sub:`Course • ${(typeof cyberAttackChapters !== 'undefined' ? cyberAttackChapters.length : 11)} Chapters`, page:'learn2', chapterIndex:null, tags:['cyber','attacks','hacking','exploit','vulnerability','phishing','sql','xss'] });

  // Network Forensics chapters — pulled live from router.js's `chapters` array
  if (typeof chapters !== 'undefined') {
    chapters.forEach((ch, i) => {
      data.push({ type:'chapter', title: ch.title, sub: `Network Forensics • Ch ${i + 1}`, page:'learn', chapterIndex: i, tags: ch.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean) });
    });
  }

  // Cyber Attacks Fundamentals chapters — pulled live from chapters2.js's `cyberAttackChapters` array
  if (typeof cyberAttackChapters !== 'undefined') {
    cyberAttackChapters.forEach((ch, i) => {
      data.push({ type:'chapter', title: ch.title, sub: `Cyber Attacks • Ch ${i + 1}`, page:'learn2', chapterIndex: i, tags: ch.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean) });
    });
  }

  // CTF challenges — pulled live from the ctfChallenges array, so new rooms/challenges
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

// Built once on load. If chapters/challenges arrays load after this script (defer ordering),
// it's rebuilt lazily the first time a search actually runs (see _runSearch below).
let SEARCH_DATA = buildSearchData();

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
let _searchDataReady = false;
function _runSearch(q) {
  if (!q) return [];
  // Rebuild once more on first use — covers the case where ctfChallenges/chapters
  // (defined in scripts loaded after this one) weren't ready when this file first ran.
  if (!_searchDataReady) {
    SEARCH_DATA = buildSearchData();
    _searchDataReady = true;
  }
  return SEARCH_DATA.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.sub.toLowerCase().includes(q)   ||
    item.tags.some(t => t.includes(q))
  ).slice(0, 8);
}

function _renderResults(results, q, dropdownEl) {
  if (!results.length) {
    dropdownEl.innerHTML = `<div class="search-no-results">No results for "<strong style="color:#888">${escapeHtml(q)}</strong>"</div>`;
    dropdownEl.style.display = '';
    return;
  }
  dropdownEl.innerHTML = results.map((item, i) => {
    const iconSvg = item.type === 'course'
      ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="2" stroke="#dc1414" stroke-width="1.2"/><path d="M4 6.5h5M4 4.5h3" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>`
      : item.type === 'ctf'
      ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 1.5v10M2 1.5h7l-1.2 2.2L9 6H2" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10l4-8 4 8" stroke="#555" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 7h5" stroke="#555" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    const badgeLabel = item.type === 'course' ? 'Course' : item.type === 'ctf' ? 'CTF' : 'Chapter';
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
  }).join('');
  dropdownEl.style.display = '';
}

/* ─── Nav search input handler ─── */
function handleCourseSearch(val, source) {
  const q = val.trim().toLowerCase();

  if (source === 'mobile') {
    const dd = document.getElementById('mobileSearchResultsDropdown');
    if (!q) { dd.style.display = 'none'; return; }
    _lastSearchResults = _runSearch(q);
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
  _lastSearchResults = _runSearch(q);
  _searchSelectedIndex = -1;
  _renderResults(_lastSearchResults, q, dd);
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
  if (!items.length) return;
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

/* ─── Desktop nav search (separate from mobile — untouched) ─── */
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

function handleDesktopSearch(val) {
  const q  = val.trim().toLowerCase();
  const dd = document.getElementById('navSearchDesktopResults');
  if (!q) { dd.style.display = 'none'; _deskSearchResults = []; return; }
  if (!_searchDataReady) { SEARCH_DATA = buildSearchData(); _searchDataReady = true; }
  _deskSearchResults = SEARCH_DATA.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.sub.toLowerCase().includes(q)   ||
    item.tags.some(t => t.includes(q))
  ).slice(0, 8);
  _deskSearchIdx = -1;
  if (!_deskSearchResults.length) {
    dd.innerHTML = `<div class="search-no-results">No results for "<strong style="color:#888">${escapeHtml(q)}</strong>"</div>`;
    dd.style.display = '';
    return;
  }
  dd.innerHTML = _deskSearchResults.map((item, i) => {
    const badge = item.type === 'course' ? 'Course' : item.type === 'ctf' ? 'CTF' : 'Chapter';
    const hi = escapeHtml(item.title).replace(
      new RegExp(escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'),
      m => `<span class="search-highlight">${m}</span>`
    );
    return `<div class="search-result-item" onclick="selectDesktopResult(${i})">
      <div class="sri-text"><div class="sri-title">${hi}</div><div class="sri-sub">${escapeHtml(item.sub)}</div></div>
      <span class="sri-badge ${item.type}">${badge}</span>
    </div>`;
  }).join('');
  dd.style.display = '';
}

function handleDesktopSearchKey(e) {
  const dd = document.getElementById('navSearchDesktopResults');
  const items = dd ? dd.querySelectorAll('.search-result-item') : [];
  if (e.key === 'ArrowDown') { _deskSearchIdx = Math.min(_deskSearchIdx+1, items.length-1); _highlightDeskItem(items); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { _deskSearchIdx = Math.max(_deskSearchIdx-1, 0); _highlightDeskItem(items); e.preventDefault(); }
  else if (e.key === 'Enter') { if (_deskSearchIdx >= 0) selectDesktopResult(_deskSearchIdx); }
  else if (e.key === 'Escape') { closeDesktopSearch(); }
}
function _highlightDeskItem(items) {
  items.forEach((el,i) => el.classList.toggle('active', i === _deskSearchIdx));
}

function selectDesktopResult(index) {
  const item = _deskSearchResults[index];
  if (!item) return;
  closeDesktopSearch();
  if (item.type === 'course')        { showPage('learn'); if(item.id) setTimeout(()=>selectCourse(item.id),100); }
  else if (item.type === 'chapter')  { showPage('learn'); if(item.courseId && item.id) setTimeout(()=>{ selectCourse(item.courseId); selectChapter(item.id); },100); }
  else if (item.type === 'ctf')      { showPage('ctf'); }
}

// Close desktop search on outside click
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('navSearchDesktop');
  if (wrap && !wrap.contains(e.target) && _deskSearchOpen) closeDesktopSearch();
});
