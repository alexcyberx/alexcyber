/* ═══════════════════════════════════════════
   COURSE SEARCH - AlexCyberX
═══════════════════════════════════════════ */

const SEARCH_DATA = [
  { type:'course',  title:'Network Forensics',              sub:'Course • 20 Chapters', page:'learn',  chapterIndex:null, tags:['network','forensics','pcap','wireshark','packet','traffic','malware','nmap'] },
  { type:'course',  title:'Cyber Attacks Fundamentals',     sub:'Course • 11 Chapters', page:'learn2', chapterIndex:null, tags:['cyber','attacks','hacking','exploit','vulnerability','phishing','sql','xss'] },
  { type:'chapter', title:'Network Forensics Introduction', sub:'Network Forensics • Ch 1',  page:'learn',  chapterIndex:0,  tags:['intro','forensics','overview'] },
  { type:'chapter', title:'Networking Fundamentals',        sub:'Network Forensics • Ch 2',  page:'learn',  chapterIndex:1,  tags:['networking','basics','tcp','ip','fundamentals'] },
  { type:'chapter', title:'OSI & TCP/IP Deep Analysis',     sub:'Network Forensics • Ch 3',  page:'learn',  chapterIndex:2,  tags:['osi','tcp','ip','model','layers'] },
  { type:'chapter', title:'Packet Analysis Basics',         sub:'Network Forensics • Ch 4',  page:'learn',  chapterIndex:3,  tags:['packet','analysis','capture','basics'] },
  { type:'chapter', title:'Wireshark Mastery',              sub:'Network Forensics • Ch 5',  page:'learn',  chapterIndex:4,  tags:['wireshark','filter','capture','pcap'] },
  { type:'chapter', title:'TCP/UDP/ICMP Investigation',     sub:'Network Forensics • Ch 6',  page:'learn',  chapterIndex:5,  tags:['tcp','udp','icmp','investigation','protocol'] },
  { type:'chapter', title:'DNS & HTTP Forensics',           sub:'Network Forensics • Ch 7',  page:'learn',  chapterIndex:6,  tags:['dns','http','forensics','web'] },
  { type:'chapter', title:'HTTPS/TLS Analysis',             sub:'Network Forensics • Ch 8',  page:'learn',  chapterIndex:7,  tags:['https','tls','ssl','encryption','certificate'] },
  { type:'chapter', title:'Email Forensics',                sub:'Network Forensics • Ch 9',  page:'learn',  chapterIndex:8,  tags:['email','smtp','imap','phishing','forensics'] },
  { type:'chapter', title:'PCAP Investigation Workflow',    sub:'Network Forensics • Ch 10', page:'learn',  chapterIndex:9,  tags:['pcap','workflow','investigation'] },
  { type:'chapter', title:'Malware Traffic Analysis',       sub:'Network Forensics • Ch 11', page:'learn',  chapterIndex:10, tags:['malware','traffic','c2','botnet','analysis'] },
  { type:'chapter', title:'Intrusion Detection',            sub:'Network Forensics • Ch 12', page:'learn',  chapterIndex:11, tags:['ids','ips','intrusion','detection','snort'] },
  { type:'chapter', title:'Log Correlation',                sub:'Network Forensics • Ch 13', page:'learn',  chapterIndex:12, tags:['log','correlation','siem','events'] },
  { type:'chapter', title:'Threat Hunting',                 sub:'Network Forensics • Ch 14', page:'learn',  chapterIndex:13, tags:['threat','hunting','ioc','indicator'] },
  { type:'chapter', title:'Memory + Network Correlation',   sub:'Network Forensics • Ch 15', page:'learn',  chapterIndex:14, tags:['memory','network','correlation'] },
  { type:'chapter', title:'Wireless Network Forensics',     sub:'Network Forensics • Ch 16', page:'learn',  chapterIndex:15, tags:['wireless','wifi','wpa','forensics'] },
  { type:'chapter', title:'Cloud Network Forensics',        sub:'Network Forensics • Ch 17', page:'learn',  chapterIndex:16, tags:['cloud','aws','azure','forensics'] },
  { type:'chapter', title:'SIEM & Enterprise Investigation',sub:'Network Forensics • Ch 18', page:'learn',  chapterIndex:17, tags:['siem','enterprise','splunk'] },
  { type:'chapter', title:'Real Incident Case Studies',     sub:'Network Forensics • Ch 19', page:'learn',  chapterIndex:18, tags:['incident','case','study','response'] },
  { type:'chapter', title:'Career Reality & Roles',         sub:'Network Forensics • Ch 20', page:'learn',  chapterIndex:19, tags:['career','roles','jobs','analyst','soc'] },
  { type:'chapter', title:'Home Lab From Scratch',          sub:'Network Forensics • Ch 21', page:'learn',  chapterIndex:20, tags:['home','lab','setup','kali','virtualbox'] },
  { type:'chapter', title:'Wireshark & PCAP Mastery',       sub:'Network Forensics • Ch 22', page:'learn',  chapterIndex:21, tags:['wireshark','pcap','mastery','advanced'] },
  { type:'chapter', title:'Threat Hunting Mastery',         sub:'Network Forensics • Ch 23', page:'learn',  chapterIndex:22, tags:['threat','hunting','advanced','mastery'] },
  { type:'chapter', title:'DFIR & Incident Response',       sub:'Network Forensics • Ch 24', page:'learn',  chapterIndex:23, tags:['dfir','incident','response','digital'] },
  { type:'chapter', title:'Certifications & Career Plan',   sub:'Network Forensics • Ch 25', page:'learn',  chapterIndex:24, tags:['certifications','career','ceh','oscp','cissp'] },
  { type:'chapter', title:'Cyber Attacks Introduction',     sub:'Cyber Attacks • Ch 1',  page:'learn2', chapterIndex:0,  tags:['intro','cyber','attacks','overview'] },
  { type:'chapter', title:'Social Engineering & Phishing',  sub:'Cyber Attacks • Ch 2',  page:'learn2', chapterIndex:1,  tags:['social','engineering','phishing','email','fraud'] },
  { type:'chapter', title:'MITM Attack',                    sub:'Cyber Attacks • Ch 3',  page:'learn2', chapterIndex:2,  tags:['mitm','man','middle','arp','spoofing'] },
  { type:'chapter', title:'DoS & DDoS Attacks',             sub:'Cyber Attacks • Ch 4',  page:'learn2', chapterIndex:3,  tags:['dos','ddos','denial','service','flood','botnet'] },
  { type:'chapter', title:'SQL Injection',                  sub:'Cyber Attacks • Ch 5',  page:'learn2', chapterIndex:4,  tags:['sql','injection','sqli','database','query','bypass'] },
  { type:'chapter', title:'XSS Attack',                     sub:'Cyber Attacks • Ch 6',  page:'learn2', chapterIndex:5,  tags:['xss','cross','site','scripting','javascript','cookie'] },
  { type:'chapter', title:'DNS Spoofing & Poisoning',       sub:'Cyber Attacks • Ch 7',  page:'learn2', chapterIndex:6,  tags:['dns','spoofing','poisoning','cache'] },
  { type:'chapter', title:'Ransomware & Malware',           sub:'Cyber Attacks • Ch 8',  page:'learn2', chapterIndex:7,  tags:['ransomware','malware','virus','trojan','encrypt'] },
  { type:'chapter', title:'TLS & Encryption Attacks',       sub:'Cyber Attacks • Ch 9',  page:'learn2', chapterIndex:8,  tags:['tls','ssl','encryption','certificate','downgrade'] },
  { type:'chapter', title:'Brute Force & Password Attacks', sub:'Cyber Attacks • Ch 10', page:'learn2', chapterIndex:9,  tags:['brute','force','password','crack','dictionary','hash'] },
  { type:'chapter', title:'Attack Defense & Prevention',    sub:'Cyber Attacks • Ch 11', page:'learn2', chapterIndex:10, tags:['defense','prevention','firewall','waf','patch'] },
];

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
function _runSearch(q) {
  if (!q) return [];
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
    const isCourse = item.type === 'course';
    const iconSvg  = isCourse
      ? `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="2" stroke="#dc1414" stroke-width="1.2"/><path d="M4 6.5h5M4 4.5h3" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>`
      : `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10l4-8 4 8" stroke="#555" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 7h5" stroke="#555" stroke-width="1.2" stroke-linecap="round"/></svg>`;
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
      <span class="sri-badge ${item.type}">${isCourse ? 'Course' : 'Chapter'}</span>
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
