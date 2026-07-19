/* ═══════════════════════════
   PAGE SWITCHING
═══════════════════════════ */
let currentPage = 'home';

const chapters = [
  { title: "Network Forensics Introduction", prev: null, next: "Networking Fundamentals" },
  { title: "Networking Fundamentals", prev: "Network Forensics Introduction", next: "OSI & TCP/IP Deep Analysis" },
  { title: "OSI & TCP/IP Deep Analysis", prev: "Networking Fundamentals", next: "Packet Analysis Basics" },
  { title: "Packet Analysis Basics", prev: "OSI & TCP/IP Deep Analysis", next: "Wireshark Mastery" },
  { title: "Wireshark Mastery", prev: "Packet Analysis Basics", next: "TCP/UDP/ICMP Investigation" },
  { title: "TCP/UDP/ICMP Investigation", prev: "Wireshark Mastery", next: "DNS & HTTP Forensics" },
  { title: "DNS & HTTP Forensics", prev: "TCP/UDP/ICMP Investigation", next: "HTTPS/TLS Analysis" },
  { title: "HTTPS/TLS Analysis", prev: "DNS & HTTP Forensics", next: "Email Forensics" },
  { title: "Email Forensics", prev: "HTTPS/TLS Analysis", next: "PCAP Investigation Workflow" },
  { title: "PCAP Investigation Workflow", prev: "Email Forensics", next: "Malware Traffic Analysis" },
  { title: "Malware Traffic Analysis", prev: "PCAP Investigation Workflow", next: "Intrusion Detection" },
  { title: "Intrusion Detection", prev: "Malware Traffic Analysis", next: "Log Correlation" },
  { title: "Log Correlation", prev: "Intrusion Detection", next: "Threat Hunting" },
  { title: "Threat Hunting", prev: "Log Correlation", next: "Memory + Network Correlation" },
  { title: "Memory + Network Correlation", prev: "Threat Hunting", next: "Wireless Network Forensics" },
  { title: "Wireless Network Forensics", prev: "Memory + Network Correlation", next: "Cloud Network Forensics" },
  { title: "Cloud Network Forensics", prev: "Wireless Network Forensics", next: "SIEM & Enterprise Investigation" },
  { title: "SIEM & Enterprise Investigation", prev: "Cloud Network Forensics", next: "Real Incident Case Studies" },
  { title: "Real Incident Case Studies", prev: "SIEM & Enterprise Investigation", next: "Career Reality & Roles" },
  { title: "Career Reality & Roles", prev: "Real Incident Case Studies", next: "Home Lab From Scratch" },
  { title: "Home Lab From Scratch", prev: "Career Reality & Roles", next: "Wireshark & PCAP Mastery" },
  { title: "Wireshark & PCAP Mastery", prev: "Home Lab From Scratch", next: "Threat Hunting Mastery" },
  { title: "Threat Hunting Mastery", prev: "Wireshark & PCAP Mastery", next: "DFIR & Incident Response" },
  { title: "DFIR & Incident Response", prev: "Threat Hunting Mastery", next: "Certifications & Career Plan" },
  { title: "Certifications & Career Plan", prev: "DFIR & Incident Response", next: null },
];

let currentChapter = 0;
let currentCyberChapter = 0; // Tracks active cyber attacks chapter index
let currentEthicalChapter = 0; // Tracks active ethical hacking chapter index

/* ═══════════════════════════
   URL → PAGE MAP
═══════════════════════════ */
const PAGE_TO_PATH = {
  home:        '/',
  courses:     '/tutorials',
  learn:       '/tutorials/network-forensics',
  learn2:      '/tutorials/cyber-attacks-fundamentals',
  learn3:      '/tutorials/ethical-hacking',
  ctf:         '/rooms',
  tools:       '/tools',
  alexsync:    '/tools/alexsync',
  mistakeAnalyzer: '/tools/mistake-analyzer',
  alexrecon:   '/tools/alexrecon',
  alexutils:   '/tools/alexutils',
  alextrace:   '/tools/alextrace',
  blog:        '/blog',
  resources:   '/resources',
  community:   '/community',
  profile:     '/profile',
  leaderboard: '/leaderboard',
  publicProfile: '/u',
  privacy:     '/privacy-policy',
  terms:       '/terms-of-service',
  disclaimer:  '/disclaimer',
  refund:      '/refund-policy',
  cookie:      '/cookie-notice',
  donotsell:   '/do-not-sell',
  legalwarning:'/legal-warning'
};

const PATH_TO_PAGE = {};
Object.entries(PAGE_TO_PATH).forEach(([p,u]) => PATH_TO_PAGE[u] = p);

function getPageFromPath(path) {
  if (!path || path === '/') return 'home';
  const clean = path.replace(/\/$/, '');
  if (PATH_TO_PAGE[clean]) return PATH_TO_PAGE[clean];
  // tutorials sub-paths
  if (clean === '/tutorials/cyber-attacks-fundamentals') return 'learn2';
  if (clean === '/tutorials/ethical-hacking') return 'learn3';
  if (clean.startsWith('/tutorials/')) return 'learn';
  // rooms/lab sub-paths → handled separately (lab access gate)
  if (clean.startsWith('/rooms/')) return 'ctf';
  // blog post sub-paths (/blog/some-slug)
  if (clean.startsWith('/blog/')) return 'blog';
  // community thread sub-paths (/community/thread-id)
  if (clean.startsWith('/community/')) return 'community';
  // public profile sub-paths (/u/user-id)
  if (clean.startsWith('/u/')) return 'publicProfile';
  return 'home';
}

function updateURL(page) {
  const path = PAGE_TO_PATH[page] || '/';
  if (window.location.pathname !== path) {
    history.pushState({ page }, '', path);
  }
}

// Handle browser Back/Forward
window.addEventListener('popstate', function(e) {
  const page = (e.state && e.state.page) || getPageFromPath(window.location.pathname);
  showPage(page, true); // skipPush = true
});

function showPage(page, skipPush) {
  // Protected pages require login - gate before rendering anything
  const _protectedPages = ['ctf', 'profile', 'learn', 'learn2', 'learn3', 'resources', 'alexsync', 'alexrecon', 'mistakeAnalyzer', 'alexutils', 'alextrace'];
  if (_protectedPages.includes(page) && !window._currentUser) {
    if (typeof showAuth === 'function') showAuth('login', page);
    return;
  }

  // Page view tracking, SPA navigation ke liye (pehla load config.js
  // se track hota hai, uske baad ke saare navigations yahan se).
  // FIX: .catch() direct chain crash karta tha (see config.js note), poore
  // showPage() ko todता tha, isliye kisi bhi page pe navigate hi nahi ho pata tha.
  if (window._supabase) {
    try {
      window._supabase.rpc('track_page_view', {
        p_page: '/' + page,
        p_device_type: (typeof _detectDeviceType === 'function') ? _detectDeviceType() : 'unknown',
        p_session_id: (typeof _getOrCreateSessionId === 'function') ? _getOrCreateSessionId() : null
      })
        .then(() => {}, () => {});
    } catch (e) {}
  }

  // Update browser URL (unless called from popstate)
  if (!skipPush) updateURL(page);

  document.getElementById('homePage').classList.toggle('active', page === 'home');
  const coursesP = document.getElementById('coursesPage');
  if (coursesP) coursesP.classList.toggle('active', page === 'courses');
  if (page === 'courses' && typeof initAllCoursesPage === 'function') initAllCoursesPage();
  document.getElementById('learnPage').classList.toggle('active', page === 'learn');
  const l2p = document.getElementById('learn2Page');
  if (l2p) l2p.classList.toggle('active', page === 'learn2');
  const l3p = document.getElementById('learn3Page');
  if (l3p) l3p.classList.toggle('active', page === 'learn3');
  const pp = document.getElementById('profilePage');
  if (pp) pp.classList.toggle('active', page === 'profile');
  // Live leaderboard polling sirf profile page pe chalna chahiye, 
  // kisi aur page pe navigate karte hi band kar do (warna background
  // mein interval chalta rehta, battery/network waste).
  if (page !== 'profile' && typeof pfStopLbPolling === 'function') pfStopLbPolling();

  // Tools page
  const tp = document.getElementById('toolsPage');
  if (tp) tp.classList.toggle('active', page === 'tools');
  if (page === 'tools' && typeof initToolsPage === 'function') initToolsPage();

  // AlexSync tool page
  const asP = document.getElementById('alexSyncPage');
  if (asP) asP.classList.toggle('active', page === 'alexsync');
  if (page === 'alexsync' && typeof initAlexSyncPage === 'function') initAlexSyncPage();

  // Cyber Mistake Analyzer tool page
  const cmaP = document.getElementById('mistakeAnalyzerPage');
  if (cmaP) cmaP.classList.toggle('active', page === 'mistakeAnalyzer');

  // AlexRecon tool page
  const arP = document.getElementById('alexReconPage');
  if (arP) arP.classList.toggle('active', page === 'alexrecon');
  if (page === 'alexrecon' && typeof initAlexReconPage === 'function') initAlexReconPage();

  // AlexUtils tool page
  const auP = document.getElementById('alexUtilsPage');
  if (auP) auP.classList.toggle('active', page === 'alexutils');
  if (page === 'alexutils' && typeof initAlexUtilsPage === 'function') initAlexUtilsPage();

  // AlexTrace tool page
  const atP = document.getElementById('alexTracePage');
  if (atP) atP.classList.toggle('active', page === 'alextrace');
  if (page === 'alextrace' && typeof initAlexTracePage === 'function') initAlexTracePage();

  // Blog page
  const bp = document.getElementById('blogPage');
  if (bp) bp.classList.toggle('active', page === 'blog');
  if (page === 'blog' && typeof initBlogPage === 'function') initBlogPage();

  // Resources page
  const resP = document.getElementById('resourcesPage');
  if (resP) resP.classList.toggle('active', page === 'resources');
  if (page === 'resources' && typeof initResourcesPage === 'function') initResourcesPage();

  // Community page
  const commP = document.getElementById('communityPage');
  if (commP) commP.classList.toggle('active', page === 'community');
  if (page === 'community' && typeof initCommunityPage === 'function') initCommunityPage();

  // CTF page
  const ctfP = document.getElementById('ctfPage');
  if (ctfP) ctfP.classList.toggle('active', page === 'ctf');

  // Leaderboard page
  const lbP = document.getElementById('leaderboardPage');
  if (lbP) lbP.classList.toggle('active', page === 'leaderboard');
  if (page === 'leaderboard' && typeof loadLeaderboard === 'function') loadLeaderboard();

  // Public profile page
  const ppP = document.getElementById('publicProfilePage');
  if (ppP) ppP.classList.toggle('active', page === 'publicProfile');
  if (page === 'publicProfile' && typeof loadPublicProfile === 'function') {
    const idFromUrl = (typeof _publicProfileIdFromUrl === 'function') ? _publicProfileIdFromUrl() : null;
    const targetId = idFromUrl || (typeof _publicProfileId !== 'undefined' ? _publicProfileId : null);
    if (targetId) {
      if (typeof _publicProfileId !== 'undefined') _publicProfileId = targetId;
      loadPublicProfile(targetId);
    }
  }

  // Legal pages
  const legalPages = ['privacy', 'terms', 'disclaimer', 'refund', 'cookie', 'donotsell', 'legalwarning'];
  legalPages.forEach(id => {
    const el = document.getElementById(id + 'Page');
    if (el) el.classList.toggle('active', page === id);
  });

  // Update page title + meta description + canonical + OG tags (SEO)
  // Each entry: title, description shown to search engines/social previews.
  const PAGE_META = {
    home:        { title: 'AlexCyberX: Free Cybersecurity Education for Everyone', desc: 'AlexCyberX is a free cybersecurity education platform by Pawan Tanwar, a Certified Ethical Hacker from Rajasthan, India. Learn Ethical Hacking, Network Forensics, and Cyber Attack techniques in Hindi with hands-on CTF labs.' },
    courses:     { title: 'All Courses - AlexCyberX', desc: 'Browse all free cybersecurity courses on AlexCyberX: Network Forensics and Cyber Attacks Fundamentals, taught in Hindi with hands-on labs.' },
    learn:       { title: 'Learn with AlexCyberX: Network Forensics Course', desc: 'Free Network Forensics course covering Wireshark, packet analysis, DNS/HTTP forensics, malware traffic analysis, and threat hunting.' },
    learn2:      { title: 'Learn with AlexCyberX: Cyber Attacks Fundamentals', desc: 'Free Cyber Attacks Fundamentals course covering SQL Injection, XSS, MITM, DoS/DDoS, DNS spoofing, and ransomware.' },
    learn3:      { title: 'Learn with AlexCyberX: Ethical Hacking Complete Course', desc: 'Free complete Ethical Hacking course covering CEH v13 fundamentals, footprinting, scanning, system hacking, web and wireless security, plus AI Security, Cloud and IoT.' },
    profile:     { title: 'My Profile on AlexCyberX', desc: 'View your AlexCyberX profile, course progress, and CTF solves.' },
    privacy:     { title: 'Privacy Policy - AlexCyberX', desc: 'Read the AlexCyberX privacy policy covering how user data is collected, used, and protected.' },
    terms:       { title: 'Terms of Service - AlexCyberX', desc: 'Terms of Service for using the AlexCyberX cybersecurity education platform.' },
    disclaimer:  { title: 'Disclaimer - AlexCyberX', desc: 'Legal disclaimer for AlexCyberX educational content and CTF labs.' },
    refund:      { title: 'Refund Policy - AlexCyberX', desc: 'Refund policy for AlexCyberX paid tools and subscriptions.' },
    cookie:      { title: 'Cookie Notice - AlexCyberX', desc: 'How AlexCyberX uses cookies across the platform.' },
    donotsell:   { title: 'Do Not Sell My Info - AlexCyberX', desc: 'Opt out of data sharing on AlexCyberX.' },
    legalwarning:{ title: 'Legal Warning - AlexCyberX', desc: 'Legal warning regarding unauthorized use of AlexCyberX cybersecurity tools and CTF content.' },
    tools:       { title: 'Cybersecurity Tools - AlexCyberX', desc: 'Free cybersecurity tools by AlexCyberX: AlexRecon (attack-surface recon), AlexUtils (IP/DNS/SSL/CVE utilities), AlexTrace (OSINT digital footprint audit), Cyber Mistake Analyzer, and AlexSync.' },
    alexsync:    { title: 'AlexSync - Automated Wake & Music Scheduler | AlexCyberX', desc: 'AlexSync wakes your laptop and starts music automatically at a scheduled time. Simple automation tool by AlexCyberX.' },
    mistakeAnalyzer: { title: 'Cyber Mistake Analyzer - AlexCyberX', desc: 'Paste a command like nmap -A target.com and get instant feedback on what is right, what is wrong, and a corrected version. Free learning tool by AlexCyberX.' },
    alexrecon:   { title: 'AlexRecon - Free Attack Surface Reconnaissance Tool | AlexCyberX', desc: 'AlexRecon generates a combined attack-surface report for any domain: DNS, SSL, subdomains, port scanning, tech stack, and risk indicators. Free recon tool by AlexCyberX.' },
    alexutils:   { title: 'AlexUtils - IP, DNS, SSL & CVE Lookup Toolkit | AlexCyberX', desc: 'AlexUtils is a free cybersecurity utility toolkit: IP/DNS lookup, SSL checker, hash generator, Base64 encode/decode, subnet calculator, and CVE search.' },
    alextrace:   { title: 'AlexTrace - Digital Footprint & OSINT Audit Tool | AlexCyberX', desc: 'AlexTrace audits your digital footprint: cross-platform username check, email breach lookup, and photo metadata scan with an exposure score and fix-it steps.' },
    blog:        { title: 'Blog - AlexCyberX', desc: 'Cybersecurity articles and tutorials from AlexCyberX.' },
    resources:   { title: 'Resources - AlexCyberX', desc: 'Curated cybersecurity learning resources from AlexCyberX.' },
    community:   { title: 'Community - AlexCyberX', desc: 'Join the AlexCyberX cybersecurity learning community.' },
    ctf:         { title: 'CTF Challenges - AlexCyberX', desc: 'Free hands-on Capture The Flag (CTF) challenges covering SQL injection, XSS, packet analysis, log hunting, and cryptography, by AlexCyberX.' },
    leaderboard: { title: 'Leaderboard - AlexCyberX', desc: 'See the top ranked AlexCyberX learners by XP, level, and CTF solves.' },
    publicProfile: { title: 'User Profile - AlexCyberX', desc: 'View a public AlexCyberX learner profile: XP, level, rank, and CTF solve history.' }
  };

  const _meta = PAGE_META[page] || PAGE_META.home;
  document.title = _meta.title;

  const _descTag = document.querySelector('meta[name="description"]');
  if (_descTag) _descTag.setAttribute('content', _meta.desc);

  const _ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (_ogTitleTag) _ogTitleTag.setAttribute('content', _meta.title);
  const _ogDescTag = document.querySelector('meta[property="og:description"]');
  if (_ogDescTag) _ogDescTag.setAttribute('content', _meta.desc);
  const _twTitleTag = document.querySelector('meta[name="twitter:title"]');
  if (_twTitleTag) _twTitleTag.setAttribute('content', _meta.title);
  const _twDescTag = document.querySelector('meta[name="twitter:description"]');
  if (_twDescTag) _twDescTag.setAttribute('content', _meta.desc);

  const _canonicalTag = document.querySelector('link[rel="canonical"]');
  if (_canonicalTag) {
    const _canonicalPath = PAGE_TO_PATH[page] || '/';
    _canonicalTag.setAttribute('href', 'https://alexcyberx.com' + _canonicalPath);
  }
  const _ogUrlTag = document.querySelector('meta[property="og:url"]');
  if (_ogUrlTag) {
    const _canonicalPath = PAGE_TO_PATH[page] || '/';
    _ogUrlTag.setAttribute('content', 'https://alexcyberx.com' + _canonicalPath);
  }

  // Show/hide learn sub-nav and home nav links
  const learnSubNav = document.getElementById('learnSubNav');
  const homeNavCenter = document.getElementById('homeNavCenter');
  const homeNavRight = document.getElementById('homeNavRight');
  const hamburger = document.getElementById('hamburger');
  const navSearchWrap = document.getElementById('navSearchWrap');
  const navMobileRight = document.getElementById('navMobileRight');

  if (page === 'learn' || page === 'learn2' || page === 'learn3') {
    learnSubNav.classList.add('visible');
    homeNavCenter.style.display = 'none';
    homeNavRight.style.display = 'none';
    // Keep hamburger + search visible on learn pages (mobile)
    hamburger.style.display = '';
    if (navSearchWrap) navSearchWrap.style.display = '';
    if (navMobileRight) navMobileRight.style.display = '';
    const bc = document.getElementById('lsnBreadcrumbLabel');
    if (bc) bc.textContent = (page === 'learn2') ? 'Cyber Attacks Fundamentals' : (page === 'learn3') ? 'Ethical Hacking Complete Course' : 'Network Forensics';
  } else {
    learnSubNav.classList.remove('visible');
    homeNavCenter.style.display = '';
    homeNavRight.style.display = '';
    hamburger.style.display = '';
    if (navSearchWrap) navSearchWrap.style.display = '';
    if (navMobileRight) navMobileRight.style.display = '';
  }

  currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Everything below this point is page-specific init (loading chapter
  // scripts, fetching CTF data, etc.). Wrapped in try/catch so that if
  // one page's init logic throws, it doesn't leave the page looking
  // blank, the .active class above has already been applied, so the
  // page shell is visible either way; this just protects the extra
  // setup work.
  try {
    // Init sidebar state for learn page
    if (page === 'learn') {
      if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('learnMain').classList.remove('full');
        sidebarOpen = true;
      }
      // Load chapters.js then call loadChapter
      loadScriptOnce('/js/chapters.js').then(function() {
        var fn = window.loadChapter && window.loadChapter._real
                 ? window.loadChapter._real
                 : (window.loadChapter || null);
        if (fn) fn(currentChapter);
        applyChapterVisibility('forensics', '#chapterList .chapter-item');
      });
    }

    // Init CTF page
    if (page === 'ctf') {
      if (typeof initCTFPage === 'function') initCTFPage();
    }

    // Init sidebar state for cyber attacks learn page
    if (page === 'learn2') {
      if (window.innerWidth > 768) {
        document.getElementById('cyberSidebar').classList.remove('hidden');
        document.getElementById('cyberLearnMain').classList.remove('full');
        cyberSidebarOpen = true;
      }
      loadScriptOnce('/js/chapters2.js').then(function() {
        var fn = window.loadCyberChapter && window.loadCyberChapter._real
                 ? window.loadCyberChapter._real
                 : (window.loadCyberChapter || null);
        // Use whichever index is most recent: router's own or window shared
        var idx = (window._cyberChIdx !== undefined) ? window._cyberChIdx : currentCyberChapter;
        if (fn) fn(idx);
        applyChapterVisibility('attacks', '#cyberChapterList .chapter-item');
      });
    }

    // Init sidebar state for ethical hacking learn page
    if (page === 'learn3') {
      if (window.innerWidth > 768) {
        document.getElementById('ethicalSidebar').classList.remove('hidden');
        document.getElementById('ethicalLearnMain').classList.remove('full');
        ethicalSidebarOpen = true;
      }
      loadScriptOnce('/js/chapters3.js').then(function() {
        var fn = window.loadEthicalChapter && window.loadEthicalChapter._real
                 ? window.loadEthicalChapter._real
                 : (window.loadEthicalChapter || null);
        var idx = (window._ethicalChIdx !== undefined) ? window._ethicalChIdx : currentEthicalChapter;
        if (fn) fn(idx);
        applyChapterVisibility('ethical-hacking', '#ethicalChapterList .chapter-item');
      });
    }
  } catch (e) {
    console.error('showPage: page-specific init failed for page "' + page + '":', e);
  }
}

function scrollToSection(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 50);
}

/* ═══════════════════════════
   CHAPTER VISIBILITY (admin-controlled)
   Sidebar mein disabled chapters ko hide karta hai, admin panel ke
   Content Management se jo control hote hain. Fail-safe: agar
   Supabase se fetch fail ho, sab chapters visible hi rehte hain
   (koi bhi hide nahi hota) taaki koi content accidentally chhup na jaaye.
═══════════════════════════ */
async function applyChapterVisibility(course, itemSelector) {
  if (!window._supabase) return;
  try {
    const { data, error } = await window._supabase
      .from('content_chapters')
      .select('title, chapter_order, enabled')
      .eq('course', course)
      .order('chapter_order', { ascending: true });
    if (error || !data) return;

    // Store globally so Next/Prev navigation (chapters.js / chapters2.js)
    // can also skip disabled chapters, not just the sidebar list.
    window._chapterEnabledState = window._chapterEnabledState || {};
    window._chapterEnabledState[course] = data.map(ch => ch.enabled);

    const items = document.querySelectorAll(itemSelector);
    // Sidebar items index-based hain (loadChapter(0), loadChapter(1)...)
    // jo chapter_order se match karta hai (dono 0-indexed, insertion order se).
    data.forEach((ch, i) => {
      const el = items[i];
      if (el) el.style.display = ch.enabled ? '' : 'none';
    });
  } catch (e) { /* fail-safe: chhupao mat, jaisa hai waisa hi rehne do */ }
}

/* Next/Prev navigation ke liye, disabled chapters ko skip karke agla/pichla
   enabled chapter dhundta hai. Agar enabled-state abhi load nahi hui
   (fail-safe), seedha +1/-1 pe chala jaata hai jaisa pehle hota tha. */
function goToAdjacentChapter(currentIndex, direction) {
  const course = window.currentPage === 'learn2' ? 'attacks' : (window.currentPage === 'learn3' ? 'ethical-hacking' : 'forensics');
  const loader = course === 'attacks' ? window.loadCyberChapter : (course === 'ethical-hacking' ? window.loadEthicalChapter : window.loadChapter);
  const enabledArr = window._chapterEnabledState && window._chapterEnabledState[course];

  if (!enabledArr) {
    // Fail-safe: state load nahi hui, purana behavior use karo
    if (loader) loader(currentIndex + direction);
    return;
  }

  let idx = currentIndex + direction;
  while (idx >= 0 && idx < enabledArr.length && enabledArr[idx] === false) {
    idx += direction;
  }
  if (idx >= 0 && idx < enabledArr.length && loader) loader(idx);
}

// "Tutorials" nav links should land on the course-selection section
// (Choose Your Path), not jump straight into a specific course's chapters.
function goToTutorials() {
  if (currentPage !== 'home') {
    showPage('home');
    setTimeout(() => scrollToSection('tutorials'), 100);
  } else {
    scrollToSection('tutorials');
  }
}

/* ═══════════════════════════
   HOME NAV
═══════════════════════════ */
function positionNavMoreDropdown() {
  const dd = document.getElementById('navMoreDropdown');
  if (!dd) return;
  const trigger = dd.querySelector('.nav-dropdown-trigger');
  const menu    = document.getElementById('navMoreDropdownMenu');
  if (!trigger || !menu) return;

  // FIX: .nav-dropdown-menu used to stay nested inside .nav-center, which
  // has `transform: translateX(-50%)`. A transform on any ancestor creates
  // a new containing block for position:fixed descendants (per spec), so
  // the menu's fixed top/left were being resolved against .nav-center's
  // box instead of the viewport - that's why it was rendering above the
  // navbar instead of below the trigger. Reparenting the menu to <body>
  // once removes it from that transformed ancestor entirely.
  if (menu.parentElement !== document.body) {
    document.body.appendChild(menu);
  }

  const r = trigger.getBoundingClientRect();
  // Center the menu under the trigger, then clamp so it never runs off
  // the left/right edge of the viewport on narrower widths.
  const menuWidth = menu.offsetWidth || 180;
  let left = r.left + r.width / 2 - menuWidth / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

  menu.style.top  = (r.bottom + 8) + 'px';
  menu.style.left = left + 'px';
}

function toggleNavMoreDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('navMoreDropdown');
  if (!dd) return;
  const opening = !dd.classList.contains('open');
  if (opening) positionNavMoreDropdown();
  // Look up the menu AFTER positionNavMoreDropdown runs (it may reparent
  // the menu out of `dd` into <body>), so dd.querySelector would return
  // null on the second and every later toggle. A global lookup by id
  // keeps working regardless of where the menu currently lives in the DOM.
  const menu = document.getElementById('navMoreDropdownMenu');
  dd.classList.toggle('open', opening);
  if (menu) menu.classList.toggle('open', opening);
}

function closeNavMoreDropdown() {
  const dd = document.getElementById('navMoreDropdown');
  if (dd) dd.classList.remove('open');
  const menu = document.getElementById('navMoreDropdownMenu');
  if (menu) menu.classList.remove('open');
}

// Collapsible "More" group inside the mobile hamburger menu (Blog/Resources/Community)
function toggleMobileMoreGroup(e) {
  if (e) e.stopPropagation();
  const grp = document.getElementById('mMoreGroup');
  if (!grp) return;
  const opening = !grp.classList.contains('open');
  grp.classList.toggle('open', opening);
  const btn = grp.querySelector('.m-more-toggle');
  if (btn) btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
}

// Keep the menu aligned with its trigger if the viewport changes while open
// (rotating a phone, resizing a desktop window, toggling "desktop site" mode).
window.addEventListener('resize', () => {
  const dd = document.getElementById('navMoreDropdown');
  if (dd && dd.classList.contains('open')) positionNavMoreDropdown();
});

// Close the "More" dropdown when tapping/clicking anywhere outside it.
// The menu itself now lives under <body> (see positionNavMoreDropdown),
// so a click inside the menu is no longer inside `dd` - check both.
document.addEventListener('click', function(e) {
  const dd = document.getElementById('navMoreDropdown');
  if (!dd || !dd.classList.contains('open')) return;
  const menu = document.getElementById('navMoreDropdownMenu');
  const clickedInsideTrigger = dd.contains(e.target);
  const clickedInsideMenu = menu && menu.contains(e.target);
  if (!clickedInsideTrigger && !clickedInsideMenu) {
    closeNavMoreDropdown();
  }
});

function _resetMobileMoreGroup() {
  const grp = document.getElementById('mMoreGroup');
  if (!grp) return;
  grp.classList.remove('open');
  const btn = grp.querySelector('.m-more-toggle');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  const isOpen = menu.classList.toggle('show');
  if (ham) {
    ham.classList.toggle('open', isOpen);
    ham.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  // Prevent body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (!isOpen) _resetMobileMoreGroup();
}

function closeMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
    if (ham) { ham.classList.remove('open'); ham.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
    _resetMobileMoreGroup();
  }
}

// Close mobile menu when tapping outside
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  if (menu && menu.classList.contains('show')) {
    if (!menu.contains(e.target) && e.target !== ham && !ham.contains(e.target)) {
      closeMenu();
    }
  }
});

// Close mobile menu on resize to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) closeMenu();
});

/* ═══════════════════════════
   LEARN SIDEBAR
═══════════════════════════ */
let sidebarOpen = true;
let cyberSidebarOpen = true;
let ethicalSidebarOpen = true;




function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('learnMain');
  const overlay = document.getElementById('overlay');

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
  } else {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
      sidebar.classList.remove('hidden');
      main.classList.remove('full');
    } else {
      sidebar.classList.add('hidden');
      main.classList.add('full');
    }
  }
}

function toggleCyberSidebar() {
  const sidebar = document.getElementById('cyberSidebar');
  const main = document.getElementById('cyberLearnMain');
  const overlay = document.getElementById('overlay2');

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
  } else {
    cyberSidebarOpen = !cyberSidebarOpen;
    if (cyberSidebarOpen) {
      sidebar.classList.remove('hidden');
      main.classList.remove('full');
    } else {
      sidebar.classList.add('hidden');
      main.classList.add('full');
    }
  }
}

function toggleEthicalSidebar() {
  const sidebar = document.getElementById('ethicalSidebar');
  const main = document.getElementById('ethicalLearnMain');
  const overlay = document.getElementById('overlay3');

  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
  } else {
    ethicalSidebarOpen = !ethicalSidebarOpen;
    if (ethicalSidebarOpen) {
      sidebar.classList.remove('hidden');
      main.classList.remove('full');
    } else {
      sidebar.classList.add('hidden');
      main.classList.add('full');
    }
  }
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('sidebar').classList.remove('show');
    if (sidebarOpen) {
      document.getElementById('sidebar').classList.remove('hidden');
      document.getElementById('learnMain').classList.remove('full');
    }
    const ov2 = document.getElementById('overlay2');
    const cs = document.getElementById('cyberSidebar');
    const clm = document.getElementById('cyberLearnMain');
    if (ov2) ov2.classList.remove('show');
    if (cs) cs.classList.remove('show');
    if (cyberSidebarOpen) {
      if (cs) cs.classList.remove('hidden');
      if (clm) clm.classList.remove('full');
    }
    const ov3 = document.getElementById('overlay3');
    const es = document.getElementById('ethicalSidebar');
    const elm = document.getElementById('ethicalLearnMain');
    if (ov3) ov3.classList.remove('show');
    if (es) es.classList.remove('show');
    if (ethicalSidebarOpen) {
      if (es) es.classList.remove('hidden');
      if (elm) elm.classList.remove('full');
    }
  }
});


/* ═══════════════════════════
   DIAGRAM IFRAME AUTO-RESIZE
═══════════════════════════ */
window.addEventListener('message', function(e){
  var data = e.data;
  if (!data || data.type !== 'acx-diagram-height') return;
  var frames = document.querySelectorAll('iframe.acx-diagram-frame');
  frames.forEach(function(f){
    try {
      if (f.contentWindow === e.source) {
        var h = Math.max(parseInt(data.height, 10) || 0, 100);
        f.style.height = (h + 8) + 'px';
        f.setAttribute('scrolling', 'no');
        f.style.overflow = 'hidden';
      }
    } catch(err) {}
  });
});

/* ═══════════════════════════
   INITIAL URL ROUTING
   On first load, read the URL path and show the right page.
   Replace state so Back button works correctly.
═══════════════════════════ */
(function initRouteFromURL() {
  const path = window.location.pathname;
  const page = getPageFromPath(path);
  history.replaceState({ page }, '', path);
  window._initialPage = page;
})();
