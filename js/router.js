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

/* ═══════════════════════════
   URL → PAGE MAP
═══════════════════════════ */
const PAGE_TO_PATH = {
  home:        '/',
  learn:       '/tutorials/network-forensics',
  learn2:      '/tutorials/cyber-attacks-fundamentals',
  ctf:         '/rooms',
  tools:       '/tools',
  alexsync:    '/tools/alexsync',
  blog:        '/blog',
  resources:   '/resources',
  community:   '/community',
  profile:     '/profile',
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
  if (clean.startsWith('/tutorials/')) return 'learn';
  // rooms/lab sub-paths → handled separately (lab access gate)
  if (clean.startsWith('/rooms/')) return 'ctf';
  // blog post sub-paths (/blog/some-slug)
  if (clean.startsWith('/blog/')) return 'blog';
  // community thread sub-paths (/community/thread-id)
  if (clean.startsWith('/community/')) return 'community';
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
  const _protectedPages = ['ctf', 'profile', 'learn', 'learn2', 'resources', 'alexsync'];
  if (_protectedPages.includes(page) && !window._currentUser) {
    if (typeof showAuth === 'function') showAuth('login', page);
    return;
  }

  // Page view tracking — SPA navigation ke liye (pehla load config.js
  // se track hota hai, uske baad ke saare navigations yahan se).
  // FIX: .catch() direct chain crash karta tha (see config.js note) — poore
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
  document.getElementById('learnPage').classList.toggle('active', page === 'learn');
  const l2p = document.getElementById('learn2Page');
  if (l2p) l2p.classList.toggle('active', page === 'learn2');
  const pp = document.getElementById('profilePage');
  if (pp) pp.classList.toggle('active', page === 'profile');
  // Live leaderboard polling sirf profile page pe chalna chahiye —
  // kisi aur page pe navigate karte hi band kar do (warna background
  // mein interval chalta rehta, battery/network waste).
  if (page !== 'profile' && typeof pfStopLbPolling === 'function') pfStopLbPolling();

  // Tools page
  const tp = document.getElementById('toolsPage');
  if (tp) tp.classList.toggle('active', page === 'tools');

  // AlexSync tool page
  const asP = document.getElementById('alexSyncPage');
  if (asP) asP.classList.toggle('active', page === 'alexsync');
  if (page === 'alexsync' && typeof initAlexSyncPage === 'function') initAlexSyncPage();

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

  // Legal pages
  const legalPages = ['privacy', 'terms', 'disclaimer', 'refund', 'cookie', 'donotsell', 'legalwarning'];
  legalPages.forEach(id => {
    const el = document.getElementById(id + 'Page');
    if (el) el.classList.toggle('active', page === id);
  });

  // Update page title
  if (page === 'home') {
    document.title = 'AlexCyberX: Free Cybersecurity Education for Everyone';
  } else if (page === 'learn') {
    document.title = 'Learn with AlexCyberX: Network Forensics Course';
  } else if (page === 'learn2') {
    document.title = 'Learn with AlexCyberX: Cyber Attacks Fundamentals';
  } else if (page === 'profile') {
    document.title = 'My Profile on AlexCyberX';
  } else if (page === 'privacy') {
    document.title = 'Privacy Policy - AlexCyberX';
  } else if (page === 'terms') {
    document.title = 'Terms of Service - AlexCyberX';
  } else if (page === 'disclaimer') {
    document.title = 'Disclaimer - AlexCyberX';
  } else if (page === 'refund') {
    document.title = 'Refund Policy - AlexCyberX';
  } else if (page === 'cookie') {
    document.title = 'Cookie Notice - AlexCyberX';
  } else if (page === 'donotsell') {
    document.title = 'Do Not Sell My Info - AlexCyberX';
  } else if (page === 'legalwarning') {
    document.title = 'Legal Warning - AlexCyberX';
  } else if (page === 'tools') {
    document.title = 'Tools - AlexCyberX';
  } else if (page === 'alexsync') {
    document.title = 'AlexSync - AlexCyberX';
  } else if (page === 'blog') {
    document.title = 'Blog - AlexCyberX';
  } else if (page === 'resources') {
    document.title = 'Resources - AlexCyberX';
  } else if (page === 'community') {
    document.title = 'Community - AlexCyberX';
  } else if (page === 'ctf') {
    document.title = 'CTF Challenges - AlexCyberX';
  }

  // Show/hide learn sub-nav and home nav links
  const learnSubNav = document.getElementById('learnSubNav');
  const homeNavCenter = document.getElementById('homeNavCenter');
  const homeNavRight = document.getElementById('homeNavRight');
  const hamburger = document.getElementById('hamburger');
  const navSearchWrap = document.getElementById('navSearchWrap');
  const navMobileRight = document.getElementById('navMobileRight');

  if (page === 'learn' || page === 'learn2') {
    learnSubNav.classList.add('visible');
    homeNavCenter.style.display = 'none';
    homeNavRight.style.display = 'none';
    // Keep hamburger + search visible on learn pages (mobile)
    hamburger.style.display = '';
    if (navSearchWrap) navSearchWrap.style.display = '';
    if (navMobileRight) navMobileRight.style.display = '';
    const bc = document.getElementById('lsnBreadcrumbLabel');
    if (bc) bc.textContent = (page === 'learn2') ? 'Cyber Attacks Fundamentals' : 'Network Forensics';
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

/* Next/Prev navigation ke liye — disabled chapters ko skip karke agla/pichla
   enabled chapter dhundta hai. Agar enabled-state abhi load nahi hui
   (fail-safe), seedha +1/-1 pe chala jaata hai jaisa pehle hota tha. */
function goToAdjacentChapter(currentIndex, direction) {
  const course = window.currentPage === 'learn2' ? 'attacks' : 'forensics';
  const loader = course === 'attacks' ? window.loadCyberChapter : window.loadChapter;
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
function toggleNavMoreDropdown(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('navMoreDropdown');
  if (dd) dd.classList.toggle('open');
}

function closeNavMoreDropdown() {
  const dd = document.getElementById('navMoreDropdown');
  if (dd) dd.classList.remove('open');
}

// Close the "More" dropdown when tapping/clicking anywhere outside it
document.addEventListener('click', function(e) {
  const dd = document.getElementById('navMoreDropdown');
  if (dd && dd.classList.contains('open') && !dd.contains(e.target)) {
    dd.classList.remove('open');
  }
});

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
}

function closeMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
    if (ham) { ham.classList.remove('open'); ham.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
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
