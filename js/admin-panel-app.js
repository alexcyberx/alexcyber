/* ════════════════════════════════════════════════════
   DATA (mock, replace with Supabase calls)
════════════════════════════════════════════════════ */
let users = [
  { id:1, name:'Rahul Sharma', email:'rahul@gmail.com', joined:'2024-10-12', lastActive:'2h ago', role:'user', status:'active' },
  { id:2, name:'Priya Singh', email:'priya@outlook.com', joined:'2024-11-03', lastActive:'1d ago', role:'mod', status:'active' },
  { id:3, name:'Amit Verma', email:'amit.v@gmail.com', joined:'2024-09-20', lastActive:'5d ago', role:'user', status:'inactive' },
  { id:4, name:'Neha Joshi', email:'neha.j@gmail.com', joined:'2025-01-15', lastActive:'3h ago', role:'user', status:'active' },
  { id:5, name:'Vikram Rao', email:'vikram@yahoo.com', joined:'2024-08-07', lastActive:'30m ago', role:'user', status:'active' },
  { id:6, name:'Sunita Patel', email:'sunita@gmail.com', joined:'2025-02-01', lastActive:'12d ago', role:'user', status:'banned' },
  { id:7, name:'Deepak Nair', email:'deepak.n@gmail.com', joined:'2025-03-18', lastActive:'1h ago', role:'admin', status:'active' },
  { id:8, name:'Anjali Mehta', email:'anjali@gmail.com', joined:'2025-04-05', lastActive:'4d ago', role:'user', status:'inactive' },
];

// NOTE: chapters ab Supabase 'content_chapters' table se load hote hain
// (dekho renderChapters() upar). Hardcoded array yahan se hata diya gaya.

/* ── Gamification: XP Leaderboard ── */
// FIX: Pehle hardcoded array tha, real Supabase data kabhi load
// nahi hota tha. Ab loadGamificationData() Supabase se fetch karta hai
// aur in variables ko populate karta hai before renderGamification() calls.
let leaderboardUsers = []; // populated by loadGamificationData()
let _gamLoaded = false;

async function loadGamificationData() {
  if (!_supabase) return;
  _gamLoaded = true;

  // Show loading state
  const elXPLoading = document.getElementById('gamTotalXP');
  if (elXPLoading) elXPLoading.textContent = '…';

  try {
    const { data, error } = await _supabase
      .from('profiles')
      .select('id, full_name, username, xp, level, ctf_solves, last_seen')
      .order('xp', { ascending: false })
      .limit(50);

    // ── Leaderboard users ────────────────────────────────
    if (!error && data) {
      leaderboardUsers = data.map(u => ({
        id:         u.id,
        name:       u.full_name || u.username || 'Anonymous',
        level:      u.level      || 1,
        xp:         u.xp         || 0,
        ctfSolves:  u.ctf_solves || 0,
        weeklyXp:   0,   // not tracked per-week in DB yet
        monthlyXp:  0    // not tracked per-month in DB yet
      }));
    }

    // ── Stats ────────────────────────────────────────────
    const totalXP = leaderboardUsers.reduce((a, u) => a + u.xp, 0);
    const elXP = document.getElementById('gamTotalXP');
    if (elXP) elXP.textContent = totalXP.toLocaleString();

    // Re-render with real data
    renderLeaderboard();

  } catch(e) {
    console.error('[Admin Gamification] load error:', e);
    const elXP = document.getElementById('gamTotalXP');
    if (elXP) elXP.textContent = '-';
  }
}

/* ── CTF Challenges & Scoreboard ── */
let ctfChallenges = [];  // populated by loadCTFData()
let ctfScoreboard = [];  // populated by loadCTFScoreboard()
let _ctfLoaded = false;

// loadCTFData, loadCTFScoreboard, and all CTF functions defined below (after CTF_LOCAL_SEED)
/* ── Progress Tracking & Certificates ── */
let userProgress = [
  { user:'Rahul Sharma', course:'Network Forensics', progress:100, timeSpent:'6h 20m', quizAvg:92, lastActivity:'2h ago',  resume:'Completed' },
  { user:'Rahul Sharma', course:'Cyber Attacks',      progress:62,  timeSpent:'3h 10m', quizAvg:78, lastActivity:'2h ago',  resume:'DNS Spoofing' },
  { user:'Priya Singh',  course:'Network Forensics', progress:100, timeSpent:'5h 45m', quizAvg:88, lastActivity:'1d ago',  resume:'Completed' },
  { user:'Amit Verma',   course:'Network Forensics', progress:45,  timeSpent:'2h 05m', quizAvg:65, lastActivity:'5d ago',  resume:'PCAP Analysis' },
  { user:'Neha Joshi',   course:'Cyber Attacks',      progress:80,  timeSpent:'4h 30m', quizAvg:84, lastActivity:'3h ago',  resume:'DoS & DDoS' },
  { user:'Vikram Rao',   course:'Network Forensics', progress:100, timeSpent:'7h 00m', quizAvg:95, lastActivity:'30m ago', resume:'Completed' },
  { user:'Vikram Rao',   course:'Cyber Attacks',      progress:100, timeSpent:'5h 15m', quizAvg:90, lastActivity:'30m ago', resume:'Completed' },
  { user:'Sunita Patel', course:'Network Forensics', progress:20,  timeSpent:'45m',    quizAvg:50, lastActivity:'12d ago', resume:'Wireshark Deep Dive' },
];

let certificates = [
  { id:'ACX-2025-0001', user:'Rahul Sharma', course:'Network Forensics', issued:'2025-09-02', status:'issued' },
  { id:'ACX-2025-0002', user:'Priya Singh',  course:'Network Forensics', issued:'2025-09-10', status:'issued' },
  { id:'ACX-2025-0003', user:'Vikram Rao',   course:'Network Forensics', issued:'2025-09-15', status:'issued' },
  { id:'ACX-2025-0004', user:'Vikram Rao',   course:'Cyber Attacks',     issued:'2025-09-15', status:'issued' },
  { id:'ACX-2025-0005', user:'Deepak Nair',  course:'Cyber Attacks',     issued:'2025-08-28', status:'revoked' },
];

let editingCTFId = null;
let ctfFilterText = '';

// FIX: yeh hardcoded demo array hata diya, real messages ab Supabase
// 'contact_messages' table se admLoadMessages() (js/admin-supabase.js)
// ke through load hote hain.


// NOTE: security logs aur blocked IPs ab Supabase se load hote hain
// (dekho renderSecurity() neeche). Dummy data yahan se hata diya gaya.

// NOTE: broadcast history ab Supabase 'broadcasts' table se load hota hai
// aur "Send Announcement" asli 'notifications' table mein rows insert karta hai
// (dekho renderNotifications() aur sendNotification() neeche). Dummy data hata diya gaya.
let broadcasts = [];

/* ════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════ */
let activeSection = 'dashboard';

function nav(id, skipHash) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(s => {
    if (s.getAttribute('onclick') && s.getAttribute('onclick').includes(`'${id}'`)) s.classList.add('active');
  });
  // Reset cache flags when leaving sections so re-entry fetches fresh data
  if (activeSection === 'ctf'          && id !== 'ctf')          _ctfLoaded = false;
  if (activeSection === 'gamification' && id !== 'gamification') _gamLoaded = false;
  activeSection = id;
  // FIX: URL hash mein current tab save karo taaki refresh pe wahi tab
  // khule, Dashboard pe wapas na jaaye. skipHash sirf initial page-load
  // restore ke waqt true hota hai (taaki restore khud ek naya history
  // entry na banaye).
  if (!skipHash) {
    history.replaceState(null, '', '#' + id);
  }
  renderSection(id);
}

function renderSection(id) {
  if (id === 'dashboard')     renderDashboard();
  if (id === 'users')         renderUsers();
  if (id === 'content')       { renderCourses(); renderChapters(); }
  if (id === 'analytics')     renderAnalytics();
  if (id === 'messages')      renderMessages();
  if (id === 'security')      renderSecurity();
  if (id === 'notifications') renderNotifications();
  if (id === 'settings')      renderSettings();
  if (id === 'gamification') renderGamification();
  if (id === 'ctf')          renderCTF().catch(e => console.error('[Admin CTF]', e));
  if (id === 'progress')     renderProgress();
  if (id === 'resources')    renderResources();
  if (id === 'toolsmanager') renderToolsManager();
  if (id === 'community')    renderCommunity();
  if (id === 'blog')         renderBlog();
  if (id === 'profiles')     { document.getElementById('profileCard').style.display='none'; document.getElementById('profileEmpty').style.display=''; }
  if (id === 'moderation')   { renderModReports(); renderModComments(); renderModFeedback(); renderModLog(); }
  if (id === 'backup')       renderBkHistory();
}

/* ════════════════════════════════════════════════════
   DASHBOARD, REAL DATA
════════════════════════════════════════════════════ */
async function renderDashboard() {
  if (!_supabase) return;

  // Show loading state
  ['statTotalUsers','statActiveToday','statCtfSolves','statMessages'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '…';
  });

  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since7d  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();

    const [totalUsersRes, newUsers7dRes, activeTodayRes, ctfSolvesRes, unreadMsgRes] = await Promise.all([
      _supabase.from('profiles').select('id', { count: 'exact', head: true }),
      _supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
      _supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_seen', since24h),
      _supabase.from('ctf_solves').select('id', { count: 'exact', head: true }).eq('correct', true),
      // FIX: pehle 'notifications' table count ho raha tha 'contact_messages' ki
      // jagah, Messages card hamesha 0 dikhata tha chahe contact form se
      // kitne bhi messages aaye hon. Ab sahi table + is_read column check karta hai.
      _supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    ]);

    setDashStat('statTotalUsers', totalUsersRes);
    setDashStat('statActiveToday', activeTodayRes);
    setDashStat('statCtfSolves', ctfSolvesRes);
    setDashStat('statMessages', unreadMsgRes);

    const deltaEl = document.getElementById('statTotalUsersDelta');
    if (deltaEl && !newUsers7dRes.error) {
      deltaEl.textContent = `▲ ${newUsers7dRes.count || 0} this week`;
    }

    // Page views + visitor trend
    renderPageViewStats();
  } catch(e) {
    console.error('[Admin] Dashboard load error:', e);
  }

  renderRecentSignups();
}

function setDashStat(id, res) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = (!res.error && res.count != null) ? res.count.toLocaleString() : '-';
}

async function renderRecentSignups() {
  const el = document.getElementById('recentSignups');
  if (!el) return;
  if (!_supabase) { el.innerHTML = '<div style="padding:16px;color:#5a5a6a;font-size:13px;">Not connected to database.</div>'; return; }

  el.innerHTML = '<div style="padding:16px;color:#5a5a6a;font-size:13px;">Loading…</div>';

  try {
    const { data, error } = await _supabase
      .from('profiles')
      .select('full_name, username, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!data || data.length === 0) {
      el.innerHTML = '<div style="padding:16px;color:#5a5a6a;font-size:13px;">No signups yet.</div>';
      return;
    }

    el.innerHTML = data.map(u => {
      const name = u.full_name || u.username || 'Unknown';
      return `
      <div class="signup-item">
        <div class="user-avatar">${escHtmlAdm(name[0] || '?')}</div>
        <div class="signup-info">
          <div class="signup-name">${escHtmlAdm(name)}</div>
          <div class="signup-meta">${escHtmlAdm(u.username || '-')}</div>
        </div>
        <div class="signup-time">${pfTimeAgoAdmin(u.created_at)}</div>
      </div>`;
    }).join('');
  } catch(e) {
    console.error('[Admin] Recent signups load error:', e);
    el.innerHTML = '<div style="padding:16px;color:#5a5a6a;font-size:13px;">Could not load signups.</div>';
  }
}

function escHtmlAdm(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// FIX: search inputs were interpolated straight into PostgREST .or()/.ilike()
// filter strings, e.g. `full_name.ilike.%${q}%,username.ilike.%${q}%`. PostgREST
// treats comma as an OR-clause separator and *, (, ) as filter-syntax characters,
// so a search term containing any of these broke the query (wrong results, or an
// error) instead of just matching literally. This escapes the characters that
// are meaningful to the .or() string syntax and to the ilike pattern itself,
// so a raw user string always matches as literal text.
function escPostgrestFilter(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')  // escape backslash first
    .replace(/%/g, '\\%')    // ilike wildcard
    .replace(/_/g, '\\_')    // ilike single-char wildcard
    .replace(/,/g, '\\,')    // .or() clause separator
    .replace(/\(/g, '\\(')   // .or() grouping
    .replace(/\)/g, '\\)')
    .replace(/\*/g, '\\*');  // PostgREST's own wildcard shorthand
}

/* ════════════════════════════════════════════════════
   USERS
════════════════════════════════════════════════════ */
let editingUserId = null;
let usersPage = 1;
const usersPerPage = 6;
let filteredUsers = [...users];

async function renderUsers() {
  // FIX: pehle users[] hardcoded array tha, real Supabase data kabhi
  // load nahi hota tha. Ab profiles table se fetch karo.
  if (!_supabase) { filteredUsers = [...users]; renderUsersTable(); return; }

  const tbody = document.getElementById('usersTbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#6a6a7a;">Loading users…</td></tr>';

  try {
    const { data, error } = await _supabase
      .from('profiles')
      .select('id, full_name, username, role, is_banned, xp, level, ctf_solves, last_seen, last_login_ip, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    if (data && data.length > 0) {
      users = data.map(p => ({
        id:         p.id,
        name:       p.full_name || p.username || 'Unknown',
        email:      p.username  || '-',
        joined:     p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '-',
        lastActive: p.last_seen  ? pfTimeAgoAdmin(p.last_seen) : 'Never',
        role:       p.role       || 'user',
        status:     p.is_banned  ? 'banned' : 'active',
        xp:         p.xp         || 0,
        level:      p.level      || 1,
        ctfSolves:  p.ctf_solves || 0,
        lastIP:     p.last_login_ip || '-',
      }));
      toast(`${users.length} users loaded`);
    }
  } catch(e) {
    console.error('[Admin] users load error:', e);
    toast('Could not load users from database', 'error');
  }

  filteredUsers = [...users];
  renderUsersTable();
}

// Simple time-ago for admin (profile.js pfTimeAgo may not be available here)
function pfTimeAgoAdmin(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function renderUsersTable() {
  const start = (usersPage-1) * usersPerPage;
  const page  = filteredUsers.slice(start, start+usersPerPage);
  const tbody = document.getElementById('usersTbody');
  tbody.innerHTML = page.map(u => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${escHtmlAdm(u.name[0])}</div>
          <div>
            <div class="user-name">${escHtmlAdm(u.name)}</div>
            <div class="user-email">${escHtmlAdm(u.email)}</div>
          </div>
        </div>
      </td>
      <td>${u.joined}</td>
      <td>${u.lastActive}</td>
      <td style="font-family:monospace;font-size:12px;color:var(--text-dim);">${escHtmlAdm(u.lastIP)}</td>
      <td><span class="badge ${u.role}">${u.role}</span></td>
      <td><span class="badge ${u.status}">${u.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn icon-only" title="Edit" onclick="openEditUser('${u.id}')">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="btn icon-only ${u.status==='banned'?'green':'red'}" title="${u.status==='banned'?'Unban':'Ban'}" onclick="toggleBan('${u.id}')">
            ${u.status==='banned'
              ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
              : `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 3l6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`}
          </button>
          <button class="btn icon-only red" title="Delete" onclick="deleteUser('${u.id}')">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 5v4M8 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Pagination
  const total = Math.ceil(filteredUsers.length / usersPerPage);
  const pg = document.getElementById('userPagination');
  pg.innerHTML = `<span class="page-info">${filteredUsers.length} users</span>`;
  for(let i=1;i<=total;i++) {
    pg.innerHTML += `<div class="page-btn ${i===usersPage?'active':''}" onclick="goPage(${i})">${i}</div>`;
  }
}

function goPage(p) { usersPage = p; renderUsersTable(); }

function filterUsers(q) {
  const search = (typeof q === 'string' ? q : document.querySelector('#sec-users .search-input input')?.value || '').toLowerCase();
  const role   = document.getElementById('roleFilter')?.value;
  const status = document.getElementById('statusFilter')?.value;
  filteredUsers = users.filter(u => {
    const matchSearch = AdminAI.match('users', search, [u.name, u.email]);
    const matchRole   = !role   || u.role === role;
    const matchStatus = !status || u.status === status;
    return matchSearch && matchRole && matchStatus;
  });
  usersPage = 1;
  renderUsersTable();
}

function sortUsers(key) {
  filteredUsers.sort((a,b) => (a[key]||'').localeCompare(b[key]||''));
  renderUsersTable();
}

function openEditUser(id) {
  const u = users.find(u=>u.id===id);
  if (!u) return;
  editingUserId = id;
  document.getElementById('userModalTitle').textContent = `Edit, ${u.name}`;
  document.getElementById('editName').value   = u.name;
  document.getElementById('editEmail').value  = u.email;
  document.getElementById('editRole').value   = u.role;
  document.getElementById('editStatus').value = u.status;
  openModal('userModal');
}

function openAddUser() {
  editingUserId = null;
  document.getElementById('userModalTitle').textContent = 'Add User';
  document.getElementById('editName').value  = '';
  document.getElementById('editEmail').value = '';
  document.getElementById('editRole').value  = 'user';
  document.getElementById('editStatus').value = 'active';
  openModal('userModal');
}

async function saveUser() {
  const name   = document.getElementById('editName').value.trim();
  const email  = document.getElementById('editEmail').value.trim();
  const role   = document.getElementById('editRole').value;
  const status = document.getElementById('editStatus').value;
  if (!name) { toast('Fill in name', 'error'); return; }

  if (editingUserId) {
    // FIX: pehle sirf in-memory update hota tha, DB mein kuch nahi jaata tha.
    // Ab Supabase profiles row update karo (role + ban status).
    if (_supabase) {
      const { error } = await _supabase.from('profiles')
        .update({ full_name: name, role, is_banned: status === 'banned' })
        .eq('id', editingUserId);
      if (error) { toast('Could not save: ' + error.message, 'error'); return; }
    }
    const u = users.find(u=>u.id===editingUserId);
    if (u) Object.assign(u, { name, role, status });
    toast(`${name} updated`);
  } else {
    // New user, admin se sirf profile add kar sakte, auth user nahi
    // (auth user create karna service_role key chahiye)
    toast('New users must register themselves. Admin can only edit existing users.', 'error');
    return;
  }
  closeModal('userModal');
  renderUsersTable();
}

async function toggleBan(id) {
  const u = users.find(u=>u.id===id);
  if (!u) return;
  const newBan = u.status !== 'banned';
  // FIX: pehle sirf in-memory update hota tha, page refresh pe revert ho jaata.
  // Ab Supabase profiles table mein is_banned update karo.
  if (_supabase) {
    const { error } = await _supabase.from('profiles')
      .update({ is_banned: newBan })
      .eq('id', id);
    if (error) { toast('Could not update ban status: ' + error.message, 'error'); return; }
  }
  u.status = newBan ? 'banned' : 'active';
  toast(`${u.name} ${newBan ? 'banned' : 'unbanned'}`);
  renderUsersTable();
}

async function deleteUser(id) {
  const u = users.find(u=>u.id===id);
  if (!u) return;
  if (!confirm(`Delete ${u.name}? This removes their profile data permanently and cannot be undone.`)) return;
  // FIX: pehle sirf in-memory delete hota tha. Ab Supabase se delete karo.
  // NOTE: auth.users row Supabase dashboard se manually delete karna padega
  // (service_role key ke bina client-side auth user delete nahi ho sakta).
  if (_supabase) {
    const { error } = await _supabase.from('profiles').delete().eq('id', id);
    if (error) { toast('Could not delete user: ' + error.message, 'error'); return; }
  }
  users = users.filter(u=>u.id!==id);
  filteredUsers = filteredUsers.filter(u=>u.id!==id);
  toast(`${u.name} profile deleted. Remove from Supabase Auth manually.`);
  renderUsersTable();
}

function exportCSV() {
  const headers = ['Name','Email','Joined','Last Active','Role','Status'];
  const rows = users.map(u => [u.name,u.email,u.joined,u.lastActive,u.role,u.status]);
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv,' + encodeURIComponent(csv);
  a.download = 'alexcyberx-users.csv';
  a.click();
  toast('CSV exported, ' + users.length + ' users');
}

/* ════════════════════════════════════════════════════
   CONTENT
════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   COURSES MANAGEMENT, live from Supabase 'courses' table.
   Course cards on the home page and /tutorials listing (js/courses.js
   on the public site) read directly from this table, so anything
   added/edited/removed here shows up there without touching any HTML.
════════════════════════════════════════════════════ */
let _dbCourses = [];
let _coursesLoaded = false;
let _courseChapterCounts = {};

const ADMIN_COURSE_ICON_SVGS = {
  radar: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#dc1414" stroke-width="1.2"/><circle cx="10" cy="10" r="3" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/><line x1="4" y1="10" x2="7" y2="10" stroke="#dc1414" stroke-width="1"/><line x1="13" y1="10" x2="16" y2="10" stroke="#dc1414" stroke-width="1"/><line x1="10" y1="4" x2="10" y2="7" stroke="#dc1414" stroke-width="1"/><line x1="10" y1="13" x2="10" y2="16" stroke="#dc1414" stroke-width="1"/><line x1="12.5" y1="12.5" x2="15" y2="15" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>',
  shield: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2.5l6.5 3v4.3c0 4-2.7 7.4-6.5 8.7-3.8-1.3-6.5-4.7-6.5-8.7V5.5l6.5-3Z" stroke="#dc1414" stroke-width="1.2" stroke-linejoin="round"/><path d="M7.2 10l1.9 1.9 3.7-3.9" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lock: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="5" y="9" width="10" height="8" rx="1.5" stroke="#dc1414" stroke-width="1.2"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="#dc1414" stroke-width="1.2"/><circle cx="10" cy="13" r="1.2" fill="#dc1414"/></svg>',
  bug: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="11" rx="4.5" ry="5.5" stroke="#dc1414" stroke-width="1.2"/><path d="M10 5.5V3.5M6.5 6.5L4.5 4.5M13.5 6.5L15.5 4.5M4 11H2M18 11H16M4.5 15.5L2.5 17.5M15.5 15.5L17.5 17.5" stroke="#dc1414" stroke-width="1.1" stroke-linecap="round"/></svg>',
  code: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7 6L2.5 10L7 14M13 6L17.5 10L13 14" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

async function renderCourses() {
  const sb = window._supabase;
  const el = document.getElementById('courseList');
  if (!el) return;
  if (!sb) { el.innerHTML = '<div class="empty">Could not connect to database.</div>'; return; }

  el.innerHTML = '<div class="empty">Loading…</div>';
  try {
    const [{ data: courses, error: cErr }, { data: chapters, error: chErr }] = await Promise.all([
      sb.from('courses').select('*').order('display_order', { ascending: true }),
      sb.from('content_chapters').select('course')
    ]);
    if (cErr) throw cErr;
    if (chErr) throw chErr;

    _dbCourses = courses || [];
    _coursesLoaded = true;

    _courseChapterCounts = {};
    (chapters || []).forEach(ch => {
      _courseChapterCounts[ch.course] = (_courseChapterCounts[ch.course] || 0) + 1;
    });
  } catch (e) {
    console.error('[Admin] Courses load error:', e);
    el.innerHTML = '<div class="empty">Could not load courses.</div>';
    return;
  }

  if (!_dbCourses.length) {
    el.innerHTML = '<div class="empty">No courses yet. Click "New Course" to add one.</div>';
  } else {
    el.innerHTML = _dbCourses.map(c => `
      <div class="chapter-card" data-id="${c.id}">
        <div class="chapter-num">${ADMIN_COURSE_ICON_SVGS[c.icon_key] || ADMIN_COURSE_ICON_SVGS.shield}</div>
        <div class="chapter-info">
          <div class="chapter-title">${escHtmlAdm(c.title)}</div>
          <div class="chapter-desc">${escHtmlAdm(c.description || '')}</div>
          <div class="chapter-meta">
            <div class="chapter-stat" style="font-size:10px;font-weight:500;color:#888;">
              ${escHtmlAdm(c.course_key)} · ${_courseChapterCounts[c.course_key] || 0} chapters · page: ${escHtmlAdm(c.page_key)}
            </div>
          </div>
        </div>
        <label class="toggle" title="Visible on site">
          <input type="checkbox" ${c.enabled ? 'checked' : ''} onchange="toggleCourseEnabled('${c.id}')">
          <span class="toggle-slider"></span>
        </label>
        <button class="btn icon-only ${c.show_on_home ? 'red' : ''}" title="${c.show_on_home ? 'Shown on home page (click to remove)' : 'Show on home page'}" style="margin-left:6px;${c.show_on_home ? 'background:rgba(220,20,20,0.12);border-color:rgba(220,20,20,0.4);' : ''}" onclick="toggleCourseShowOnHome('${c.id}')">
          <svg width="13" height="13" viewBox="0 0 20 20" fill="${c.show_on_home ? '#dc1414' : 'none'}"><path d="M10 2.5l2.2 4.9 5.3.5-4 3.6 1.2 5.3L10 14l-4.7 2.8 1.2-5.3-4-3.6 5.3-.5L10 2.5z" stroke="${c.show_on_home ? '#dc1414' : 'currentColor'}" stroke-width="1.2" stroke-linejoin="round"/></svg>
        </button>
        <div class="action-btns" style="margin-left:4px;">
          <button class="btn icon-only" title="Edit" onclick="openEditCourse('${c.id}')">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="btn icon-only red" title="Delete" onclick="deleteCourse('${c.id}')">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 5v4M8 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    const homeCount = _dbCourses.filter(c => c.show_on_home).length;
    el.insertAdjacentHTML('beforeend', `
      <div style="font-size:11px;color:var(--text-dim);padding:10px 4px 0;display:flex;align-items:center;gap:6px;">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="#dc1414"><path d="M10 2.5l2.2 4.9 5.3.5-4 3.6 1.2 5.3L10 14l-4.7 2.8 1.2-5.3-4-3.6 5.3-.5L10 2.5z"/></svg>
        ${homeCount}/2 courses shown on home page. Click the star on a course to add or remove it from the home page grid.
      </div>
    `);
  }

  _populateCourseFilterDropdowns();
}

// Keeps the chapter list's "All Courses" filter and the chapter modal's
// course picker in sync with whatever courses actually exist right now,
// instead of a hardcoded forensics/attacks pair.
function _populateCourseFilterDropdowns() {
  const filterEl = document.getElementById('courseFilter');
  if (filterEl) {
    const current = filterEl.value || 'all';
    filterEl.innerHTML = '<option value="all">All Courses</option>' +
      _dbCourses.map(c => `<option value="${c.course_key}">${escHtmlAdm(c.title)}</option>`).join('');
    if ([...filterEl.options].some(o => o.value === current)) filterEl.value = current;
  }

  const chCourseEl = document.getElementById('chCourse');
  if (chCourseEl) {
    const current = chCourseEl.value;
    chCourseEl.innerHTML = _dbCourses.map(c => `<option value="${c.course_key}">${escHtmlAdm(c.title)}</option>`).join('');
    if ([...chCourseEl.options].some(o => o.value === current)) chCourseEl.value = current;
  }
}

async function toggleCourseEnabled(id) {
  const sb = window._supabase;
  const c = _dbCourses.find(c => c.id === id);
  if (!c || !sb) return;

  const newVal = !c.enabled;
  c.enabled = newVal; // optimistic update

  try {
    const { error } = await sb.from('courses').update({ enabled: newVal }).eq('id', id);
    if (error) throw error;
    toast(`"${c.title}" ${newVal ? 'enabled' : 'disabled'}`);
    if (typeof window.invalidateCoursesCache === 'function') window.invalidateCoursesCache();
  } catch (e) {
    c.enabled = !newVal; // revert on failure
    toast('Could not update course', 'error');
    renderCourses();
  }
}

// Home page shows at most 2 courses, admin picks exactly which ones via
// this star toggle. Enforced client-side (max 2 selected at once) since
// the home grid layout is only designed for 2 cards.
async function toggleCourseShowOnHome(id) {
  const sb = window._supabase;
  const c = _dbCourses.find(c => c.id === id);
  if (!c || !sb) return;

  const currentlyOn = _dbCourses.filter(x => x.show_on_home).length;
  if (!c.show_on_home && currentlyOn >= 2) {
    toast('Home page shows max 2 courses. Remove one first.', 'error');
    return;
  }

  const newVal = !c.show_on_home;
  c.show_on_home = newVal; // optimistic update
  renderCourses();

  try {
    const { error } = await sb.from('courses').update({ show_on_home: newVal }).eq('id', id);
    if (error) throw error;
    toast(`"${c.title}" ${newVal ? 'added to' : 'removed from'} home page`);
    if (typeof window.invalidateCoursesCache === 'function') window.invalidateCoursesCache();
  } catch (e) {
    c.show_on_home = !newVal; // revert on failure
    toast('Could not update course', 'error');
    renderCourses();
  }
}

function openAddCourse() {
  document.getElementById('courseModalTitle').textContent = 'Add New Course';
  document.getElementById('crsTitle').value = '';
  document.getElementById('crsTag').value = '';
  document.getElementById('crsDesc').value = '';
  document.getElementById('crsIcon').value = 'shield';
  document.getElementById('crsCourseKey').value = '';
  document.getElementById('crsPageKey').value = '';
  document.getElementById('courseModal').dataset.editId = '';
  openModal('courseModal');
}

function openEditCourse(id) {
  const c = _dbCourses.find(c => c.id === id);
  if (!c) return;
  document.getElementById('courseModalTitle').textContent = 'Edit Course';
  document.getElementById('crsTitle').value = c.title;
  document.getElementById('crsTag').value = c.tag || '';
  document.getElementById('crsDesc').value = c.description || '';
  document.getElementById('crsIcon').value = c.icon_key || 'shield';
  document.getElementById('crsCourseKey').value = c.course_key;
  document.getElementById('crsPageKey').value = c.page_key;
  document.getElementById('courseModal').dataset.editId = id;
  openModal('courseModal');
}

async function saveCourse() {
  const sb       = window._supabase;
  const title    = document.getElementById('crsTitle').value.trim();
  const tag      = document.getElementById('crsTag').value.trim();
  const desc     = document.getElementById('crsDesc').value.trim();
  const iconKey  = document.getElementById('crsIcon').value;
  const courseKey= document.getElementById('crsCourseKey').value.trim();
  const pageKey  = document.getElementById('crsPageKey').value.trim();
  const editId   = document.getElementById('courseModal').dataset.editId;

  if (!title)     { toast('Title required', 'error'); return; }
  if (!courseKey) { toast('Course Key required', 'error'); return; }
  if (!pageKey)   { toast('Page Key required', 'error'); return; }
  if (!sb)        { toast('Not connected to database', 'error'); return; }

  try {
    if (editId) {
      const { error } = await sb
        .from('courses')
        .update({
          title, tag, description: desc, icon_key: iconKey,
          course_key: courseKey, page_key: pageKey, updated_at: new Date().toISOString()
        })
        .eq('id', editId);
      if (error) throw error;
      toast(`Course "${title}" updated`);
    } else {
      const slug = title.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const maxOrder = Math.max(-1, ..._dbCourses.map(c => c.display_order));

      const { error } = await sb.from('courses').insert({
        course_key: courseKey, page_key: pageKey, slug,
        title, tag, description: desc, icon_key: iconKey,
        display_order: maxOrder + 1, enabled: true
      });
      if (error) throw error;
      toast(`Course "${title}" added. Remember to wire up its page in router.js/index.html.`);
    }

    _coursesLoaded = false;
    closeModal('courseModal');
    renderCourses();
    if (typeof window.invalidateCoursesCache === 'function') window.invalidateCoursesCache();
  } catch (e) {
    console.error('[Admin] Save course error:', e);
    // Unique constraint violations (duplicate course_key/page_key/slug) are
    // the most likely failure here, surface a clearer message for those.
    if (e && e.code === '23505') {
      toast('That Course Key or Page Key is already used by another course', 'error');
    } else {
      toast('Could not save course', 'error');
    }
  }
}

async function deleteCourse(id) {
  const sb = window._supabase;
  const c = _dbCourses.find(c => c.id === id);
  if (!c || !sb) return;
  const chCount = _courseChapterCounts[c.course_key] || 0;
  const warnMsg = chCount > 0
    ? `Delete course "${c.title}"? Its ${chCount} chapter(s) will remain in Content but won't be reachable from any course card until you point another course at "${c.course_key}". This cannot be undone.`
    : `Delete course "${c.title}"? This cannot be undone.`;
  if (!confirm(warnMsg)) return;

  try {
    const { error } = await sb.from('courses').delete().eq('id', id);
    if (error) throw error;
    toast(`Course "${c.title}" deleted`);
    _coursesLoaded = false;
    renderCourses();
    if (typeof window.invalidateCoursesCache === 'function') window.invalidateCoursesCache();
  } catch (e) {
    toast('Could not delete course', 'error');
  }
}

/* ════════════════════════════════════════════════════
   CONTENT MANAGEMENT, live from Supabase 'content_chapters' table
════════════════════════════════════════════════════ */
let _dbChapters = [];
let _chaptersLoaded = false;

async function renderChapters() {
  const sb  = window._supabase;
  const el  = document.getElementById('chapterList');
  if (!el) return;

  if (!sb) { el.innerHTML = '<div class="empty">Could not connect to database.</div>'; return; }

  if (!_chaptersLoaded) {
    el.innerHTML = '<div class="empty">Loading…</div>';
    try {
      const { data, error } = await sb
        .from('content_chapters')
        .select('*')
        .order('course', { ascending: true })
        .order('chapter_order', { ascending: true });
      if (error) throw error;
      _dbChapters = data || [];
      _chaptersLoaded = true;
    } catch (e) {
      console.error('[Admin] Chapters load error:', e);
      el.innerHTML = '<div class="empty">Could not load chapters.</div>';
      return;
    }
  }

  const course = document.getElementById('courseFilter')?.value || 'all';
  const list   = _dbChapters.filter(c => course === 'all' || c.course === course);

  if (!list.length) {
    el.innerHTML = '<div class="empty">No chapters found.</div>';
    return;
  }

  el.innerHTML = list.map((c, i) => `
    <div class="chapter-card" draggable="true" data-id="${c.id}" data-course="${c.course}">
      <div class="drag-handle">
        <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
          <circle cx="3" cy="2.5" r="1" fill="#6a6a7a"/>
          <circle cx="7" cy="2.5" r="1" fill="#6a6a7a"/>
          <circle cx="3" cy="7" r="1" fill="#6a6a7a"/>
          <circle cx="7" cy="7" r="1" fill="#6a6a7a"/>
          <circle cx="3" cy="11.5" r="1" fill="#6a6a7a"/>
          <circle cx="7" cy="11.5" r="1" fill="#6a6a7a"/>
        </svg>
      </div>
      <div class="chapter-num">${i + 1}</div>
      <div class="chapter-info">
        <div class="chapter-title">${escHtmlAdm(c.title)} ${!c.has_content ? '<span style="font-size:10px;color:var(--text-dim);font-weight:400;">(Coming soon)</span>' : ''}</div>
        <div class="chapter-desc">${escHtmlAdm(c.description || '')}</div>
        <div class="chapter-meta">
          <div class="chapter-stat" style="color:#3b82f6;font-size:10px;font-weight:500;">
            ${escHtmlAdm((_dbCourses.find(cr => cr.course_key === c.course) || {}).title || c.course)}
          </div>
        </div>
      </div>
      <label class="toggle">
        <input type="checkbox" ${c.enabled?'checked':''} onchange="toggleChapter('${c.id}')">
        <span class="toggle-slider"></span>
      </label>
      <div class="action-btns" style="margin-left:4px;">
        <button class="btn icon-only" title="Edit" onclick="openEditChapter('${c.id}')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="btn icon-only red" title="Delete" onclick="deleteChapter('${c.id}')">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 5v4M8 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  _initChapterDrag(el, course);
}

async function toggleChapter(id) {
  const sb = window._supabase;
  const c = _dbChapters.find(c => c.id === id);
  if (!c || !sb) return;

  const newVal = !c.enabled;
  c.enabled = newVal; // optimistic update

  try {
    const { error } = await sb.from('content_chapters').update({ enabled: newVal }).eq('id', id);
    if (error) throw error;
    toast(`"${c.title}" ${newVal ? 'enabled' : 'disabled'}`);
  } catch (e) {
    c.enabled = !newVal; // revert on failure
    toast('Could not update chapter', 'error');
    renderChapters();
  }
}

function openAddChapter() {
  document.getElementById('chTitle').value  = '';
  document.getElementById('chDesc').value   = '';
  document.getElementById('chCourse').value = (_dbCourses[0] && _dbCourses[0].course_key) || '';
  document.getElementById('chapterModal').dataset.editId = '';
  openModal('chapterModal');
}

function openEditChapter(id) {
  const c = _dbChapters.find(c => c.id === id);
  if (!c) return;
  document.getElementById('chTitle').value  = c.title;
  document.getElementById('chDesc').value   = c.description || '';
  document.getElementById('chCourse').value = c.course;
  document.getElementById('chapterModal').dataset.editId = id;
  openModal('chapterModal');
}

async function addChapter() {
  const sb     = window._supabase;
  const title  = document.getElementById('chTitle').value.trim();
  const desc   = document.getElementById('chDesc').value.trim();
  const course = document.getElementById('chCourse').value;
  const editId = document.getElementById('chapterModal').dataset.editId;

  if (!title) { toast('Title required', 'error'); return; }
  if (!sb) { toast('Not connected to database', 'error'); return; }

  try {
    if (editId) {
      // EDIT existing chapter
      const { error } = await sb
        .from('content_chapters')
        .update({ title, description: desc, course })
        .eq('id', editId);
      if (error) throw error;
      toast(`Chapter "${title}" updated`);
    } else {
      // ADD new chapter, naya chapter is course ke end mein jaayega.
      // has_content=false rakha hai kyunki actual HTML content abhi
      // likha nahi gaya, frontend "Coming soon" dikhayega jab tak
      // real content chapters.js/chapters2.js mein add na ho.
      const slug = title.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);

      const maxOrder = Math.max(
        -1, ..._dbChapters.filter(c => c.course === course).map(c => c.chapter_order)
      );

      const { error } = await sb.from('content_chapters').insert({
        slug, title, description: desc, course,
        chapter_order: maxOrder + 1,
        enabled: true,
        has_content: false
      });
      if (error) throw error;
      toast(`Chapter "${title}" added, content abhi likhna baaki hai`);
    }

    _chaptersLoaded = false; // force re-fetch
    closeModal('chapterModal');
    renderChapters();
  } catch (e) {
    console.error('[Admin] Save chapter error:', e);
    toast('Could not save chapter', 'error');
  }
}

async function deleteChapter(id) {
  const sb = window._supabase;
  const c = _dbChapters.find(c => c.id === id);
  if (!c || !sb) return;
  if (!confirm(`Delete chapter "${c.title}"? This cannot be undone.`)) return;

  try {
    const { error } = await sb.from('content_chapters').delete().eq('id', id);
    if (error) throw error;
    toast(`Chapter "${c.title}" deleted`);
    _chaptersLoaded = false;
    renderChapters();
  } catch (e) {
    toast('Could not delete chapter', 'error');
  }
}

/* ── Drag-to-reorder ── */
let _dragChapterId = null;

function _initChapterDrag(container, activeCourseFilter) {
  const cards = container.querySelectorAll('.chapter-card');

  cards.forEach(card => {
    card.addEventListener('dragstart', () => {
      _dragChapterId = card.dataset.id;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = container.querySelector('.dragging');
    if (!dragging) return;
    const afterEl = _getDragAfterElement(container, e.clientY);
    if (afterEl == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterEl);
    }
  });

  container.addEventListener('drop', async () => {
    // Naya visual order read karo DOM se, phir sirf isi course ke
    // chapters ka chapter_order database mein update karo.
    const orderedIds = [...container.querySelectorAll('.chapter-card')].map(c => c.dataset.id);
    const sb = window._supabase;
    if (!sb) return;

    try {
      await Promise.all(orderedIds.map((id, i) =>
        sb.from('content_chapters').update({ chapter_order: i }).eq('id', id)
      ));
      orderedIds.forEach((id, i) => {
        const c = _dbChapters.find(c => c.id === id);
        if (c) c.chapter_order = i;
      });
      toast('Chapter order updated');
    } catch (e) {
      toast('Could not save new order', 'error');
      _chaptersLoaded = false;
      renderChapters();
    }
  });
}

function _getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.chapter-card:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* ════════════════════════════════════════════════════
   ANALYTICS
════════════════════════════════════════════════════ */
async function renderAnalytics() {
  const sb = window._supabase;
  if (!sb) return;

  // ── Page views, unique visitors, device breakdown, top pages, avg session ──
  try {
    const { data, error } = await sb.rpc('get_page_view_stats');
    if (error) throw error;

    const totalViewsEl = document.getElementById('statPageViews7d');
    if (totalViewsEl) {
      const sum7d = (data.trend || []).reduce((s, t) => s + t.views, 0);
      totalViewsEl.textContent = sum7d.toLocaleString();
    }

    const uniqueEl = document.getElementById('statUniqueVisitors');
    if (uniqueEl) uniqueEl.textContent = (data.unique_visitors_7d || 0).toLocaleString();

    const sessionEl = document.getElementById('statAvgSession');
    if (sessionEl) {
      const mins = data.avg_session_minutes || 0;
      sessionEl.textContent = mins > 0 ? `${mins}m` : '-';
    }

    // Top Visited Pages
    const topPagesEl = document.getElementById('topPages');
    if (topPagesEl) {
      const pages = data.top_pages || [];
      if (!pages.length) {
        topPagesEl.innerHTML = '<div style="padding:24px 10px;text-align:center;color:#5a5a6a;font-size:13px;">No page views recorded yet.</div>';
      } else {
        const maxV = Math.max(...pages.map(p => p.views), 1);
        topPagesEl.innerHTML = pages.map(p => `
          <div style="padding:8px 4px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text);margin-bottom:4px;">
              <span>${escHtmlAdm(p.page)}</span><span style="color:var(--text-dim);">${p.views}</span>
            </div>
            <div style="height:5px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${(p.views / maxV * 100).toFixed(0)}%;background:#ff3b3b;border-radius:3px;"></div>
            </div>
          </div>
        `).join('');
      }
    }

    // Device Breakdown (simple donut via conic-gradient, no library needed)
    const deviceEl = document.getElementById('deviceBreakdown');
    if (deviceEl) {
      const devices = data.device_breakdown || [];
      if (!devices.length) {
        deviceEl.innerHTML = '<div style="padding:24px 10px;text-align:center;color:#5a5a6a;font-size:13px;">No device data recorded yet.</div>';
      } else {
        const total = devices.reduce((s, d) => s + d.cnt, 0);
        const colors = { mobile: '#ff3b3b', desktop: '#3b82f6', tablet: '#facc15', unknown: '#6a6a7a' };
        let acc = 0;
        const gradientParts = devices.map(d => {
          const pct = (d.cnt / total) * 100;
          const part = `${colors[d.device] || '#6a6a7a'} ${acc.toFixed(1)}% ${(acc + pct).toFixed(1)}%`;
          acc += pct;
          return part;
        });
        deviceEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:20px;justify-content:center;padding:12px 0;">
            <div style="width:90px;height:90px;border-radius:50%;background:conic-gradient(${gradientParts.join(',')});"></div>
            <div>
              ${devices.map(d => `
                <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text);margin-bottom:4px;">
                  <span style="width:9px;height:9px;border-radius:2px;background:${colors[d.device] || '#6a6a7a'};display:inline-block;"></span>
                  ${d.device}, ${((d.cnt / total) * 100).toFixed(0)}%
                </div>
              `).join('')}
            </div>
          </div>`;
      }
    }
  } catch(e) {
    console.error('[Admin] Page view analytics error:', e);
  }

  // ── Course Completion ──
  try {
    const { data: comp, error: compErr } = await sb.rpc('get_course_completion_stats');
    if (compErr) throw compErr;
    const compEl = document.getElementById('statCourseCompletion');
    if (compEl && comp) {
      const avg = ((comp.forensics || 0) + (comp.attacks || 0)) / 2;
      compEl.textContent = avg.toFixed(0) + '%';
    }
  } catch(e) {
    console.error('[Admin] Course completion error:', e);
  }

  // ── Signup graph, real counts from profiles.created_at, last 14 days ──
  const signupSvg = document.getElementById('signupSvg');
  const lblsEl    = document.getElementById('signupLabels');
  if (!signupSvg) return;

  try {
    const days = 14;
    const since = new Date();
    since.setHours(0,0,0,0);
    since.setDate(since.getDate() - (days - 1));

    const { data, error } = await sb
      .from('profiles')
      .select('created_at')
      .gte('created_at', since.toISOString());

    if (error) throw error;

    // Bucket signups by day
    const counts = Array.from({ length: days }, () => 0);
    (data || []).forEach(row => {
      if (!row.created_at) return;
      const d = new Date(row.created_at);
      d.setHours(0,0,0,0);
      const dayIdx = Math.round((d - since) / 86400000);
      if (dayIdx >= 0 && dayIdx < days) counts[dayIdx]++;
    });

    drawSmoothCurve(signupSvg, counts, 'greenGrad', '#22c55e');
    if (lblsEl) {
      lblsEl.innerHTML = counts.map((_,i) => `<span>${i+1}</span>`).join('');
    }
  } catch(e) {
    console.error('[Admin] Analytics load error:', e);
    signupSvg.innerHTML = '';
    if (lblsEl) lblsEl.innerHTML = '<span style="color:#5a5a6a;">Could not load signup data.</span>';
  }
}

/* Generic smooth bezier-curve area chart, reused by Visitor Trend and
   New Signups charts. Values array me hone chahiye plain numbers. */
function drawSmoothCurve(svg, values, gradientId, strokeColor) {
  if (!svg) return;
  const max = Math.max(...values, 1);
  const W = 600, H = 110, pad = 10;
  const n = values.length;

  const xs = values.map((_, i) => n > 1 ? pad + i * ((W - pad*2) / (n - 1)) : W / 2);
  const ys = values.map(v => H - pad - (v / max) * (H - pad*2));

  let path = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i-1] + xs[i]) / 2;
    path += ` C ${cx} ${ys[i-1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  const area = path + ` L ${xs[xs.length-1]} ${H} L ${xs[0]} ${H} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#${gradientId})" opacity="0.6"/>
    <path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${xs.map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="3" fill="${strokeColor}" stroke="var(--surface)" stroke-width="2" style="cursor:pointer;"><title>${values[i]} signup${values[i]===1?'':'s'}</title></circle>`).join('')}
  `;
}

/* ════════════════════════════════════════════════════
   PAGE VIEWS + VISITOR TREND
════════════════════════════════════════════════════ */
async function renderPageViewStats() {
  const sb = window._supabase;
  const svg = document.getElementById('visitorSvg');
  const labelEl = document.getElementById('visitorGraphLabels');
  if (!sb) return;

  try {
    const { data, error } = await sb.rpc('get_page_view_stats');
    if (error) throw error;

    const pvEl = document.getElementById('statPageViews');
    if (pvEl) pvEl.textContent = (data.total || 0).toLocaleString();
    const delta = document.getElementById('statPageViewsDelta');
    if (delta) delta.textContent = `${data.today || 0} today`;

    if (!svg) return;

    const trend = data.trend || [];
    if (!trend.length) {
      svg.innerHTML = '';
      if (labelEl) labelEl.innerHTML = '<span style="color:#5a5a6a;">No page views recorded yet.</span>';
      return;
    }

    drawVisitorGraph(trend);
  } catch(e) {
    console.error('[Admin] Page view stats error:', e);
    if (svg) svg.innerHTML = '';
    if (labelEl) labelEl.innerHTML = '<span style="color:#5a5a6a;">Could not load visitor trend.</span>';
  }
}

/* Smooth bezier-curve area chart, reference design se, real page_views
   trend data ke saath (dummy data nahi). */
function drawVisitorGraph(trend) {
  const svg = document.getElementById('visitorSvg');
  const labelEl = document.getElementById('visitorGraphLabels');
  if (!svg) return;

  const data = trend.map(t => t.views);
  const max  = Math.max(...data, 1);
  const W = 600, H = 110, pad = 10;
  const n  = data.length;

  const xs = data.map((_, i) => n > 1 ? pad + i * ((W - pad*2) / (n - 1)) : W / 2);
  const ys = data.map(v => H - pad - (v / max) * (H - pad*2));

  let path = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i-1] + xs[i]) / 2;
    path += ` C ${cx} ${ys[i-1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  const area = path + ` L ${xs[xs.length-1]} ${H} L ${xs[0]} ${H} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#dc1414" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#dc1414" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="graph-area" d="${area}"/>
    <path class="graph-line" d="${path}"/>
    ${xs.map((x, i) => `<circle class="graph-dot" cx="${x}" cy="${ys[i]}" r="3"><title>${trend[i].date}: ${data[i].toLocaleString()} views</title></circle>`).join('')}
  `;

  if (labelEl) {
    labelEl.innerHTML = trend.map(t => `<span>${t.date.slice(5)}</span>`).join('');
  }
}
/* ════════════════════════════════════════════════════
   MESSAGES, live from Supabase 'contact_messages' table
   (homepage contact form inserts here via handleContactSubmit)
════════════════════════════════════════════════════ */
let _admMessages = [];

async function renderMessages() {
  const el = document.getElementById('messagesList');
  if (!el) return;
  const sb = window._supabase;
  if (!sb) {
    el.innerHTML = '<div class="empty">Could not connect to database.</div>';
    return;
  }

  el.innerHTML = '<div class="empty">Loading…</div>';

  try {
    const { data, error } = await sb
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    _admMessages = data || [];

    const unreadCount = _admMessages.filter(m => !m.is_read).length;
    const badge = document.getElementById('commBadge');
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? '' : 'none';
    }

    _admDrawMessages();
  } catch (e) {
    console.error('[Admin] Messages load error:', e);
    el.innerHTML = '<div class="empty">Could not load messages. (Make sure a <code>contact_messages</code> table exists in Supabase.)</div>';
  }
}

// Draws the inbox from _admMessages, filtered by the search box (normal text plus AI keywords).
function _admDrawMessages() {
  const el = document.getElementById('messagesList');
  if (!el) return;
  if (!_admMessages.length) {
    el.innerHTML = '<div class="empty">No messages yet.</div>';
    return;
  }
  const q = document.querySelector('#sec-messages .search-input input')?.value || '';
  const rows = _admMessages.filter(m => AdminAI.match('messages', q, [m.name, m.email, m.message]));
  if (!rows.length) {
    el.innerHTML = '<div class="empty">No messages match your search.</div>';
    return;
  }
  el.innerHTML = rows.map(m => `
      <div class="msg-item ${!m.is_read ? 'unread' : ''}" onclick="openMessage('${m.id}')">
        ${!m.is_read ? '<div class="unread-dot"></div>' : '<div style="width:6px;"></div>'}
        <div class="user-avatar" style="flex-shrink:0;">${escHtmlAdm((m.name || '?')[0].toUpperCase())}</div>
        <div class="msg-info">
          <div class="msg-name">${escHtmlAdm(m.name || 'Unknown')} <span style="font-size:10px;color:var(--text-dim);font-weight:400;">, ${escHtmlAdm(m.email || '')}</span></div>
          <div class="msg-preview">${escHtmlAdm(m.message || '')}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
          <div class="msg-time">${_admTimeAgo(m.created_at)}</div>
          <div class="action-btns">
            <button class="btn icon-only" title="Reply via Email" onclick="event.stopPropagation();replyEmail('${escHtmlAdm(m.email || '')}')">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3l4 3.5L10 3M2 3h8v7H2z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="btn icon-only red" title="Delete" onclick="event.stopPropagation();deleteMsg('${m.id}')">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 5v4M8 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
}

function _admTimeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

async function openMessage(id) {
  const m = _admMessages.find(m => String(m.id) === String(id));
  if (!m || m.is_read) return;
  const sb = window._supabase;
  if (!sb) return;
  try {
    await sb.from('contact_messages').update({ is_read: true }).eq('id', id);
    m.is_read = true;
    renderMessages();
  } catch (e) { console.error('[Admin] Mark read failed:', e); }
}

function replyEmail(email) { window.open(`mailto:${email}`); }

async function deleteMsg(id) {
  if (!confirm('Delete this message?')) return;
  const sb = window._supabase;
  if (!sb) return;
  try {
    await sb.from('contact_messages').delete().eq('id', id);
    toast('Message deleted');
    renderMessages();
  } catch (e) {
    console.error('[Admin] Delete message failed:', e);
    toast('Delete failed', 'error');
  }
}

/* ════════════════════════════════════════════════════
   SECURITY
════════════════════════════════════════════════════ */
let _secBlockedIPs = [];
let _secLogs = [];

async function renderSecurity() {
  const sb = window._supabase;
  const ipsEl  = document.getElementById('blockedIPs');
  const logsEl = document.getElementById('securityLogs');
  if (!sb) return;

  try {
    const since24h = new Date(Date.now() - 24*60*60*1000).toISOString();
    const [
      { data: ips, error: ipsErr },
      { data: logs, error: logsErr },
      { count: failedCount, error: failedErr },
      { count: attackCount, error: attackErr },
      { data: adminEvents, error: adminEventsErr }
    ] = await Promise.all([
      sb.from('blocked_ips').select('ip, reason, created_at').order('created_at', { ascending: false }),
      sb.from('security_logs').select('id, event_type, details, ip, created_at').order('created_at', { ascending: false }).limit(30),
      sb.from('security_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'failed_login').gte('created_at', since24h),
      sb.from('security_logs').select('id', { count: 'exact', head: true }).in('event_type', ['sqli_attempt','xss_attempt','path_traversal','bot_scan']).gte('created_at', since24h),
      sb.from('security_logs').select('id, event_type, details, ip, created_at').in('event_type', ['admin_login','admin_logout']).order('created_at', { ascending: false }).limit(20)
    ]);
    if (ipsErr) throw ipsErr;
    if (logsErr) throw logsErr;

    _secBlockedIPs = ips || [];
    _secLogs = logs || [];

    // Stat cards (use dedicated 24h count queries, not the 30-row limited
    // recent list, so a busy attack period doesn't undercount the stat)
    const failedLoginsEl = document.getElementById('statFailedLogins');
    if (failedLoginsEl) failedLoginsEl.textContent = failedErr ? '-' : (failedCount || 0);

    const blockedCountEl = document.getElementById('statBlockedIPs');
    if (blockedCountEl) blockedCountEl.textContent = _secBlockedIPs.length;

    const attackAttemptsEl = document.getElementById('statAttackAttempts');
    if (attackAttemptsEl) attackAttemptsEl.textContent = attackErr ? '-' : (attackCount || 0);

    // Blocked IPs list
    if (ipsEl) {
      ipsEl.innerHTML = _secBlockedIPs.length
        ? _secBlockedIPs.map(row => `
            <div class="ip-tag">
              ${escHtmlAdm(row.ip)}
              <button class="remove" onclick="unblockIP('${escHtmlAdm(row.ip)}')" title="Unblock">✕</button>
            </div>
          `).join('')
        : '<div style="color:var(--text-dim);font-size:13px;padding:8px;">No IPs blocked.</div>';
    }

    // Recent events
    if (logsEl) {
      const iconFor = (type) => {
        if (type === 'ip_blocked')    return { cls: 'danger', svg: '<path d="M7 1L2 3.5V7c0 2.8 2.2 4.5 5 5.5 2.8-1 5-2.7 5-5.5V3.5L7 1z" stroke="currentColor" stroke-width="1.3"/>' };
        if (type === 'ip_unblocked')  return { cls: 'info',   svg: '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 6v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="7" cy="4.5" r="0.7" fill="currentColor"/>' };
        if (type === 'admin_login')   return { cls: 'success', svg: '<path d="M5 7h6M8.5 4.5L11 7l-2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' };
        if (type === 'admin_logout')  return { cls: 'info',    svg: '<path d="M9 7H3M5.5 4.5L3 7l2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 2H11a1 1 0 011 1v8a1 1 0 01-1 1H7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' };
        if (type === 'failed_login')  return { cls: 'danger',  svg: '<path d="M7 3v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="7" cy="10.5" r="0.75" fill="currentColor"/>' };
        if (type === 'sqli_attempt')  return { cls: 'danger',  svg: '<path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M9.5 9.5l2.5 2.5m0-2.5l-2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' };
        if (type === 'xss_attempt')   return { cls: 'danger',  svg: '<path d="M3 2l7 5-3 1 2 4-1.5.7-2-4-2.5 2z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>' };
        if (type === 'path_traversal')return { cls: 'danger',  svg: '<path d="M2 11l4-8M6 11l4-8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M2 5.5h3M2 8.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>' };
        if (type === 'bot_scan')      return { cls: 'warn',    svg: '<rect x="2" y="4" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="7.5" r="0.9" fill="currentColor"/><circle cx="9" cy="7.5" r="0.9" fill="currentColor"/><path d="M7 4V2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>' };
        if (type === 'export_triggered') return { cls: 'info', svg: '<path d="M7 2v6M4.5 5.5L7 8l2.5-2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 10h9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' };
        return { cls: 'info', svg: '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 6v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="7" cy="4.5" r="0.7" fill="currentColor"/>' };
      };
      logsEl.innerHTML = _secLogs.length
        ? _secLogs.map(l => {
            const icon = iconFor(l.event_type);
            const ipLabel = l.ip ? ` · IP: ${escHtmlAdm(l.ip)}` : '';
            return `
              <div class="log-entry">
                <div class="log-icon ${icon.cls}"><svg width="14" height="14" viewBox="0 0 14 14" fill="none">${icon.svg}</svg></div>
                <div class="log-body">
                  <div class="log-title">${escHtmlAdm(l.event_type.replace(/_/g, ' '))}</div>
                  <div class="log-sub">${escHtmlAdm(l.details || '')}${ipLabel}</div>
                </div>
                <div class="log-time">${pfTimeAgoAdmin(l.created_at)}</div>
              </div>`;
          }).join('')
        : '<div style="color:var(--text-dim);font-size:13px;padding:16px;">No events recorded yet.</div>';
    }

    renderAdminSessions(adminEventsErr ? [] : (adminEvents || []));
  } catch (e) {
    console.error('[Admin] Security load error:', e);
    if (ipsEl)  ipsEl.innerHTML  = '<div style="color:var(--text-dim);font-size:13px;">Could not load blocked IPs.</div>';
    if (logsEl) logsEl.innerHTML = '<div style="color:var(--text-dim);font-size:13px;padding:16px;">Could not load security logs.</div>';
  }
}

/* ────────────────────────────────────────────────────────────
   ADMIN SESSIONS
   Derives "who's currently logged in" + a login/logout history
   from the admin_login / admin_logout rows in security_logs.
   Each event's `details` text is "<name/email> logged in" or
   "<name/email> logged out" (see logAdminEvent in the login
   flow below), so we extract that label to group events by
   admin identity. The most recent event per identity determines
   whether that admin is currently active (login with no later
   logout) or not.
──────────────────────────────────────────────────────────── */
function renderAdminSessions(events) {
  const el = document.getElementById('adminSessions');
  if (!el) return;

  if (!events.length) {
    el.innerHTML = '<div style="color:var(--text-dim);font-size:13px;padding:8px 0;">No login activity recorded yet.</div>';
    return;
  }

  // Extract "<label>" from "<label> logged in" / "<label> logged out"
  function labelFor(ev) {
    const m = (ev.details || '').match(/^(.*?)\s+logged (in|out)$/i);
    return m ? m[1] : (ev.ip || 'Unknown admin');
  }

  // Group chronologically (already sorted newest-first) by admin label,
  // find each admin's most recent event to determine current status.
  const byAdmin = new Map();
  for (const ev of events) {
    const label = labelFor(ev);
    if (!byAdmin.has(label)) byAdmin.set(label, []);
    byAdmin.get(label).push(ev);
  }

  const statusCards = [...byAdmin.entries()].map(([label, evs]) => {
    const latest = evs[0]; // newest first
    const isActive = latest.event_type === 'admin_login';
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
        <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${isActive ? 'var(--green)' : 'var(--text-dim)'};"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;color:var(--white);">${escHtmlAdm(label)}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:1px;">
            ${isActive ? 'Currently logged in' : 'Not active'} · ${isActive ? 'since' : 'last logout'} ${pfTimeAgoAdmin(latest.created_at)}
            ${latest.ip ? ' · IP: ' + escHtmlAdm(latest.ip) : ''}
          </div>
        </div>
        <span style="font-size:10px;padding:3px 9px;border-radius:10px;font-weight:600;
          background:${isActive ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)'};
          color:${isActive ? 'var(--green)' : 'var(--text-dim)'};">
          ${isActive ? 'ACTIVE' : 'OFFLINE'}
        </span>
      </div>`;
  }).join('');

  const historyRows = events.slice(0, 10).map(ev => {
    const isLogin = ev.event_type === 'admin_login';
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:12px;">
        <span style="color:${isLogin ? 'var(--green)' : 'var(--text-dim)'};">${isLogin ? '↳ Logged in' : '↰ Logged out'}</span>
        <span style="color:var(--text-dim);">${escHtmlAdm(labelFor(ev))}${ev.ip ? ' · ' + escHtmlAdm(ev.ip) : ''}</span>
        <span style="margin-left:auto;color:var(--text-dim);">${pfTimeAgoAdmin(ev.created_at)}</span>
      </div>`;
  }).join('');

  el.innerHTML = `
    ${statusCards}
    <div style="margin-top:14px;">
      <div style="font-size:11px;font-weight:600;color:var(--text-dim);letter-spacing:0.5px;margin-bottom:4px;">RECENT HISTORY</div>
      ${historyRows}
    </div>`;
}

async function blockIPPrompt() {
  const ip = prompt('Enter IP address to block:');
  if (!ip) return;
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) { toast('Invalid IP format', 'error'); return; }

  const sb = window._supabase;
  if (!sb) return;

  try {
    const { error } = await sb.rpc('block_ip', { p_ip: ip });
    if (error) throw error;
    toast(`${ip} blocked`);
    renderSecurity();
  } catch (e) {
    toast(e.message || 'Could not block IP', 'error');
  }
}

async function unblockIP(ip) {
  const sb = window._supabase;
  if (!sb) return;

  try {
    const { error } = await sb.rpc('unblock_ip', { p_ip: ip });
    if (error) throw error;
    toast(`${ip} unblocked`);
    renderSecurity();
  } catch (e) {
    toast(e.message || 'Could not unblock IP', 'error');
  }
}

async function exportLogs() {
  if (!_secLogs.length) { toast('No logs to export', 'error'); return; }

  const escCsv = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const header = ['event_type', 'ip', 'details', 'created_at'].join(',');
  const rows = _secLogs.map(l =>
    [l.event_type, l.ip || 'unknown', l.details || '', l.created_at].map(escCsv).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `security_logs_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  const sb = window._supabase;
  if (sb) {
    sb.rpc('log_security_event', {
      p_event_type: 'export_triggered',
      p_details: `Admin exported security logs (${_secLogs.length} rows)`
    }).then(() => {}, () => {});
  }
}

/* ════════════════════════════════════════════════════
   NOTIFICATIONS
════════════════════════════════════════════════════ */
async function renderNotifications() {
  const sb = window._supabase;
  const historyEl = document.getElementById('broadcastHistory');
  if (!sb || !historyEl) return;

  try {
    const { data, error } = await sb
      .from('broadcasts')
      .select('id, title, audience, recipient_count, created_at')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    broadcasts = data || [];

    historyEl.innerHTML = broadcasts.length
      ? broadcasts.map(b => `
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px 14px;">
            <div style="font-size:13px;font-weight:500;color:var(--white);">${escHtmlAdm(b.title)}</div>
            <div style="display:flex;gap:14px;margin-top:5px;">
              <span style="font-size:10px;color:var(--text-dim);">${escHtmlAdm(b.audience)}</span>
              <span style="font-size:10px;color:var(--text-dim);">${(b.recipient_count || 0).toLocaleString()} recipients</span>
              <span style="font-size:10px;color:var(--text-dim);">${pfTimeAgoAdmin(b.created_at)}</span>
            </div>
          </div>
        `).join('')
      : '<div style="color:var(--text-dim);font-size:13px;padding:16px;">No announcements sent yet.</div>';
  } catch (e) {
    console.error('[Admin] Notifications load error:', e);
    historyEl.innerHTML = '<div style="color:var(--text-dim);font-size:13px;padding:16px;">Could not load broadcast history.</div>';
  }
}

function toggleNotifUserPicker() {
  const audience = document.getElementById('notifAudience').value;
  const wrap = document.getElementById('notifUserPickerWrap');
  if (!wrap) return;
  if (audience === 'Specific User') {
    wrap.style.display = '';
    loadNotifUserOptions();
  } else {
    wrap.style.display = 'none';
  }
}

let _notifUsersLoaded = false;
async function loadNotifUserOptions() {
  const sel = document.getElementById('notifTargetUser');
  if (!sel || _notifUsersLoaded) return;

  const sb = window._supabase;
  if (!sb) { sel.innerHTML = '<option value="">Not connected</option>'; return; }

  try {
    let list = users;
    if (!list || !list.length) {
      const { data, error } = await sb
        .from('profiles')
        .select('id, full_name, username')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      list = (data || []).map(p => ({ id: p.id, name: p.full_name || p.username || 'Unknown', email: p.username || '' }));
    }

    sel.innerHTML = list.length
      ? list.map(u => `<option value="${escHtmlAdm(u.id)}">${escHtmlAdm(u.name)}${u.email ? ' (' + escHtmlAdm(u.email) + ')' : ''}</option>`).join('')
      : '<option value="">No users found</option>';

    _notifUsersLoaded = true;
  } catch (e) {
    console.error('[Admin] loadNotifUserOptions error:', e);
    sel.innerHTML = '<option value="">Could not load users</option>';
  }
}

async function sendNotification() {
  const sb = window._supabase;
  const title    = document.getElementById('notifTitle').value.trim();
  const msg      = document.getElementById('notifMsg').value.trim();
  const audience = document.getElementById('notifAudience').value;
  if (!title || !msg) { toast('Fill in title and message','error'); return; }
  if (!sb) { toast('Not connected to server','error'); return; }

  let targetUserId = null;
  if (audience === 'Specific User') {
    targetUserId = document.getElementById('notifTargetUser').value;
    if (!targetUserId) { toast('Select a user','error'); return; }
  }

  const btn = document.querySelector('#sec-notifications .btn.primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

  try {
    const { error } = await sb.rpc('send_broadcast', {
      p_title: title,
      p_body: msg,
      p_audience: audience,
      p_target_user_id: targetUserId
    });
    if (error) throw error;

    document.getElementById('notifTitle').value = '';
    document.getElementById('notifMsg').value   = '';
    await renderNotifications();
    toast(audience === 'Specific User' ? 'Announcement sent to user' : `Announcement sent to ${audience}`);
  } catch (e) {
    console.error('[Admin] sendNotification error:', e);
    toast('Failed to send announcement', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Send Announcement'; }
  }
}

/* ════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════ */
// Dashboard "Quick Action" button: instantly flips maintenance mode and
// persists it right away (unlike the Settings page toggle, which only
// saves when "Save Changes" is clicked).
async function toggleMaintenance() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  try {
    const { data: current, error: readErr } = await sb.rpc('get_site_settings');
    if (readErr) throw readErr;

    const next = { ...current, maintenance_mode: !current?.maintenance_mode };
    const { error: writeErr } = await sb.rpc('save_site_settings', { p_settings: next });
    if (writeErr) throw writeErr;

    // Reflect in the Settings page checkbox if it's currently in the DOM
    const chk = document.getElementById('maintenanceChk');
    if (chk) chk.checked = next.maintenance_mode;

    toast(next.maintenance_mode ? 'Maintenance mode ON' : 'Maintenance mode OFF');
  } catch (e) {
    console.error('[Admin] toggleMaintenance error:', e);
    toast(e.message || 'Could not toggle maintenance mode', 'error');
  }
}
let _siteSettingsLoaded = false;

async function renderSettings() {
  const sb = window._supabase;
  if (!sb) return;

  try {
    const { data, error } = await sb.rpc('get_site_settings');
    if (error) throw error;
    if (!data) return;

    const nameEl = document.getElementById('setSiteName');
    const tagEl  = document.getElementById('setTagline');
    const igEl   = document.getElementById('setInstagram');
    const ghEl   = document.getElementById('setGithub');
    const liEl   = document.getElementById('setLinkedin');
    const regEl  = document.getElementById('setUserRegistration');
    const httpsEl= document.getElementById('setForceHttps');
    const maintEl= document.getElementById('maintenanceChk');

    if (nameEl)  nameEl.value  = data.site_name        ?? nameEl.value;
    if (tagEl)   tagEl.value   = data.tagline           ?? tagEl.value;
    if (igEl)    igEl.value    = data.instagram_link    ?? igEl.value;
    if (ghEl)    ghEl.value    = data.github_link       ?? ghEl.value;
    if (liEl)    liEl.value    = data.linkedin_link     ?? liEl.value;
    if (regEl)   regEl.checked = data.user_registration !== false;
    if (httpsEl) httpsEl.checked = data.force_https     !== false;
    if (maintEl) maintEl.checked = !!data.maintenance_mode;

    _siteSettingsLoaded = true;
  } catch (e) {
    console.error('[Admin] Load site settings error:', e);
    toast('Could not load settings from database', 'error');
  }

  await loadAboutBio();
}

/* ── ABOUT PAGE BIO (multi-language, stored in platform_settings key 'about_bio') ── */
let _aboutBioRaw = {};

async function loadAboutBio() {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { data, error } = await sb.rpc('get_about_bio');
    if (error) throw error;
    _aboutBioRaw = data || {};

    const p1El = document.getElementById('setAboutP1');
    const p2El = document.getElementById('setAboutP2');
    const p3El = document.getElementById('setAboutP3');
    if (p1El) p1El.value = _aboutBioRaw?.p1?.en || '';
    if (p2El) p2El.value = _aboutBioRaw?.p2?.en || '';
    if (p3El) p3El.value = _aboutBioRaw?.p3?.en || '';
  } catch (e) {
    console.error('[Admin] Load about bio error:', e);
    toast('Could not load About content', 'error');
  }
}

// Free Google Translate endpoint (same one used on the public site, js/translate.js)
async function _acxTranslate(text, targetLang) {
  if (!text || !text.trim()) return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Translate HTTP ' + res.status);
  const data = await res.json();
  if (data && data[0]) return data[0].map(chunk => (chunk && chunk[0]) || '').join('');
  return text;
}

async function retranslateAndSaveAboutBio() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  const p1 = document.getElementById('setAboutP1').value.trim();
  const p2 = document.getElementById('setAboutP2').value.trim();
  const p3 = document.getElementById('setAboutP3').value.trim();
  if (!p1 || !p2 || !p3) { toast('All three paragraphs are required', 'error'); return; }

  const statusEl = document.getElementById('aboutBioStatus');
  const btn = document.getElementById('retranslateAboutBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Translating...'; }

  // hl (Hinglish) is not auto-translated — it's a distinct romanized style,
  // so we keep whatever was already stored for it (or fall back to English).
  const targetLangs = ['hi', 'bn', 'mr', 'pa', 'ta', 'te'];
  const paragraphs = { p1, p2, p3 };
  const next = {};

  try {
    let done = 0;
    const total = targetLangs.length * 3;
    for (const [pKey, text] of Object.entries(paragraphs)) {
      next[pKey] = { en: text, hl: _aboutBioRaw?.[pKey]?.hl || text };
      for (const lang of targetLangs) {
        if (statusEl) statusEl.textContent = `Translating ${pKey} → ${lang}... (${done}/${total})`;
        next[pKey][lang] = await _acxTranslate(text, lang);
        done++;
      }
    }

    const { error } = await sb.rpc('save_about_bio', { p_bio: next });
    if (error) throw error;

    _aboutBioRaw = next;
    if (statusEl) statusEl.textContent = 'Saved and translated into all languages.';
    toast('About content updated');
  } catch (e) {
    console.error('[Admin] Save about bio error:', e);
    if (statusEl) statusEl.textContent = '';
    toast(e.message || 'Could not save About content', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save & Translate All Languages'; }
  }
}

// Toggle just flips the checkbox visually + gives feedback; the actual
// value is only persisted to the DB when "Save Changes" is clicked, same
// as every other field in this form (consistent save-on-submit behaviour).
function toggleMaintenanceSetting() {
  const on = document.getElementById('maintenanceChk').checked;
  toast(on ? 'Maintenance mode will be enabled on save' : 'Maintenance mode will be disabled on save');
}

async function saveSettings() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  const settings = {
    site_name:          document.getElementById('setSiteName').value.trim()  || 'AlexCyberX',
    tagline:             document.getElementById('setTagline').value.trim(),
    instagram_link:       document.getElementById('setInstagram').value.trim(),
    github_link:          document.getElementById('setGithub').value.trim(),
    linkedin_link:        document.getElementById('setLinkedin').value.trim(),
    user_registration:    document.getElementById('setUserRegistration').checked,
    maintenance_mode:     document.getElementById('maintenanceChk').checked,
    force_https:          document.getElementById('setForceHttps').checked,
  };

  const btn = document.getElementById('saveSettingsBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    const { error } = await sb.rpc('save_site_settings', { p_settings: settings });
    if (error) throw error;
    toast('Settings saved');
  } catch (e) {
    console.error('[Admin] Save site settings error:', e);
    toast(e.message || 'Could not save settings', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
  }
}

function openChangePassword() {
  document.getElementById('newAdminPassword').value = '';
  document.getElementById('confirmAdminPassword').value = '';
  openModal('changePasswordModal');
}

async function submitPasswordChange() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  const pw  = document.getElementById('newAdminPassword').value;
  const pw2 = document.getElementById('confirmAdminPassword').value;

  if (!pw || pw.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
  if (pw !== pw2) { toast('Passwords do not match', 'error'); return; }

  const btn = document.getElementById('confirmPasswordChangeBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Updating...'; }

  try {
    const { error } = await sb.auth.updateUser({ password: pw });
    if (error) throw error;
    closeModal('changePasswordModal');
    toast('Password updated successfully');
  } catch (e) {
    console.error('[Admin] Password change error:', e);
    toast(e.message || 'Could not update password', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
  }
}

/* ════════════════════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.classList.remove('open'); });
});

/* ════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════ */
// FIX: several call sites pass DB-sourced values (a user's full_name/
// username, self-editable by that user via profiles RLS) straight into
// this message with no escaping. Since it went into innerHTML, a name
// like <img src=x onerror=...> would execute as HTML/JS the moment an
// admin banned/deleted/edited that user - i.e. a self-editable profile
// field could run script in an admin's own session. Escaping here once,
// centrally, closes that off for every current and future call site
// without having to remember to escape at each one individually.
function toast(msg, type='success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div><span>${escHtmlAdm(msg)}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ════════════════════════════════════════════════════
   GAMIFICATION / XP SYSTEM
════════════════════════════════════════════════════ */
function renderGamification() {
  // FIX: Pehle hardcoded data se render hota tha (Total XP always wrong).
  // Ab Supabase se fresh data load karo. _gamLoaded flag ensure karta hai ki
  // same page visit pe sirf ek fetch ho (lekin force=true se admin refresh kar sakta hai).
  if (!_gamLoaded) {
    loadGamificationData();
  } else {
    // Already loaded, just re-render with current data
    const totalXP = leaderboardUsers.reduce((a,u) => a+u.xp, 0);
    const el = document.getElementById('gamTotalXP');
    if (el) el.textContent = totalXP.toLocaleString();
    renderLeaderboard();
  }
  loadXPRules();
}

async function loadXPRules() {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { data, error } = await sb.rpc('get_xp_rules');
    if (error) throw error;
    if (!data) return;

    const map = {
      xpLogin:     data.daily_login,
      xpChapter:   data.chapter_completion,
      xpQuiz:      data.quiz_pass,
      xpCtfEasy:   data.ctf_easy,
      xpCtfMedium: data.ctf_medium,
      xpCtfHard:   data.ctf_hard
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val != null) el.value = val;
    });
  } catch (e) {
    console.error('[Admin] Load XP rules error:', e);
  }
}

async function saveXPRules() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  const rules = {
    daily_login:        parseInt(document.getElementById('xpLogin').value, 10)      || 0,
    chapter_completion: parseInt(document.getElementById('xpChapter').value, 10)    || 0,
    quiz_pass:           parseInt(document.getElementById('xpQuiz').value, 10)      || 0,
    ctf_easy:            parseInt(document.getElementById('xpCtfEasy').value, 10)   || 0,
    ctf_medium:          parseInt(document.getElementById('xpCtfMedium').value, 10) || 0,
    ctf_hard:            parseInt(document.getElementById('xpCtfHard').value, 10)   || 0,
  };

  try {
    const { error } = await sb.rpc('save_xp_rules', { p_rules: rules });
    if (error) throw error;
    // Invalidate the CTF form's cached copy so the next challenge save
    // picks up the freshly saved Easy/Medium/Hard values immediately.
    _ctfXpRulesCache = null;
    toast('XP reward rules saved');
  } catch (e) {
    toast(e.message || 'Could not save XP rules', 'error');
  }
}

function renderLeaderboard() {
  const scope = document.getElementById('lbScope')?.value || 'global';
  const key = scope === 'weekly' ? 'weeklyXp' : scope === 'monthly' ? 'monthlyXp' : 'xp';
  const sorted = [...leaderboardUsers].sort((a,b)=>b[key]-a[key]);
  const tbody = document.getElementById('leaderboardTbody');
  tbody.innerHTML = sorted.map((u,i) => {
    const rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
    return `
    <tr>
      <td><span class="rank-pill ${rankClass}">${i+1}</span></td>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${escHtmlAdm(u.name[0])}</div>
          <div class="user-name">${escHtmlAdm(u.name)}</div>
        </div>
      </td>
      <td>Lv. ${u.level}</td>
      <td>${u[key].toLocaleString()} XP</td>
      <td>${u.ctfSolves}</td>
    </tr>`;
  }).join('');
}

/* ════════════════════════════════════════════════════
   CTF CHALLENGE MANAGER
════════════════════════════════════════════════════ */

const LAB_TYPE_MAP = {
  'sqli':         '/pages/lab-sqli.html',
  'xss':          '/pages/lab-xss.html',
  'cmdi':         '/pages/lab-cmdi.html',
  'fileupload':   '/pages/lab-fileupload.html',
  'network':      '/pages/lab-network.html',
  'steganography':'/pages/lab-stego.html',
  'crypto':       '/pages/lab-crypto.html',
  'osint':        '/pages/lab-osint.html',
};

function getLabUrl(labType, customUrl) {
  if (!labType) return '';
  if (labType === 'custom') return customUrl || '';
  return LAB_TYPE_MAP[labType] || '';
}

function updateLabPreview() {
  const type    = document.getElementById('ctfLabType')?.value || '';
  const custom  = document.getElementById('ctfCustomLabWrap');
  const preview = document.getElementById('ctfLabPreview');
  const urlEl   = document.getElementById('ctfLabPreviewUrl');

  if (custom) custom.style.display = type === 'custom' ? '' : 'none';

  if (type && type !== 'custom') {
    const url = getLabUrl(type, '');
    if (urlEl) urlEl.textContent = url;
    if (preview) preview.style.display = '';
  } else if (type === 'custom') {
    if (preview) preview.style.display = 'none';
  } else {
    if (preview) preview.style.display = 'none';
  }
}

/* ── Load real solve scoreboard from Supabase ── */
async function loadCTFScoreboard() {
  if (!_supabase) { ctfScoreboard = []; return; }
  // FIX: pehle select('*') tha aur row.created_at use hota tha, 
  // lekin ctf_solves table mein timestamp column ka naam 'solved_at' hai,
  // 'created_at' nahi. Isliye lastTs hamesha empty tha aur Last Solve
  // column blank dikhta tha. Ab explicit columns fetch karo.
  // FIX 2: correct filter, `correct === false` check DB se null/undefined
  // ke liye wrong tha. `correct !== true` use karo (stricter guard).
  const { data, error } = await _supabase
    .from('ctf_solves')
    .select('user_id, points_earned, solved_at, correct')
    .order('solved_at', { ascending: false });
  if (error || !data) { console.warn('[Admin] ctf_solves error:', error); ctfScoreboard = []; return; }

  const map = {};
  data.forEach(row => {
    // Only count verified correct solves
    if (row.correct !== true && row.correct !== null) return;
    const uid = row.user_id;
    if (!uid) return;
    if (!map[uid]) map[uid] = { user: uid.slice(0,8), solves:0, points:0, lastTs: '' };
    map[uid].solves++;
    map[uid].points += (row.points_earned || 0);
    // solved_at is the correct column (was created_at before, wrong)
    if (!map[uid].lastTs || (row.solved_at > map[uid].lastTs)) map[uid].lastTs = row.solved_at || '';
  });

  const uids = Object.keys(map);
  if (uids.length > 0) {
    const { data: profiles } = await _supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', uids);
    if (profiles) profiles.forEach(p => {
      if (map[p.id]) map[p.id].user = p.username || p.full_name || map[p.id].user;
    });
  }

  ctfScoreboard = Object.values(map)
    .sort((a,b) => b.points - a.points || b.solves - a.solves)
    .slice(0, 20)
    .map((s, i) => ({
      rank:      i + 1,
      user:      s.user,
      solves:    s.solves,
      points:    s.points,
      lastSolve: s.lastTs
        ? new Date(s.lastTs).toLocaleString('en-IN', {
            day:'2-digit', month:'short',
            hour:'2-digit', minute:'2-digit', hour12: true
          })
        : '-'
    }));
}

/* ─────────────────────────────────────────────────────────────
   LOCAL SEED, same 20 challenges as ctf.html CTF_CHALLENGES
   Used as fallback when Supabase table is empty, and for Sync.
───────────────────────────────────────────────────────────── */
const CTF_LOCAL_SEED = [
  { slug:'web-01', title:'Hidden in Plain Sight',     category:'web',       difficulty:'easy',   points:50,  xp_reward:100,  flag:'ACX{c0mm3nts_4r3_n0t_s3cr3t}',          hints:['View the page source (Ctrl+U) and check the HTML comments <!-- --> near the top, one part of the flag is hidden there.','Check robots.txt for a disallowed path, then visit it directly. The 404 response carries an extra header with the second part of the flag.','Look at the JS file the page loads. A hex-encoded string is buried in a comment near the middle, that decodes to the final part.'], description:'A website has something hidden inside its source code, and it isn\'t all in one place. The flag is split into three parts across an HTML comment, a response header, and a JS file, find all three and assemble them in order.', lab_url:'/pages/labs/lab-hidden.html',   solve_count:142, status:'active' },
  { slug:'web-02', title:'Cookie Monster',             category:'web',       difficulty:'medium', points:150, xp_reward:250,  flag:'ACX{c00k13s_4r3_n0t_s3cur3}',              hints:['Check DevTools Application tab and inspect all cookies set after login.','One cookie is Base64 encoded JSON. Decode it with atob() in browser console.','The server checks more than one cookie. Changing only one triggers a security alert.'], description:'NovaCorp Employee Portal blindly trusts its session cookies. A leaked employee account has been found. Can you escalate your privileges and access the Admin Control Panel?', lab_url:'/pages/labs/lab-cookie.html',   solve_count:67,  status:'active' },
  { slug:'web-03', title:'SQL Injection 101',          category:'web',       difficulty:'medium', points:200, xp_reward:350,  flag:'ACX{un10n_s3l3ct_g0t_m3}',                hints:['Add a single quote to the search field to trigger a SQL error and confirm the injection point.','Use ORDER BY to count columns, then UNION SELECT NULL to find which column accepts strings.','Query information_schema.tables to find hidden tables, then extract data from vault_secrets.'], description:'VaultBank Employee Portal has a vulnerable search feature. Extract the flag from a hidden database table using UNION-based SQL injection.', lab_url:'/pages/labs/lab-sqli101.html',    solve_count:89,  status:'active' },
  { slug:'web-04', title:'robots.txt Secret',          category:'web',       difficulty:'easy',   points:50,  xp_reward:80,   flag:'ACX{r0b0ts_txt_l34ks_s3cr3ts}',           hints:['Every website has a robots.txt at /robots.txt. Always check it during recon.','The Disallow entries list paths that are meant to stay hidden. Visit each one.','The vault needs a passcode. Check the page source of the homepage carefully.'], description:'A website\'s robots.txt file tells search engines which paths not to index, but the file itself is public. A restricted path is hidden inside this file. Find it and visit it.', lab_url:'/pages/labs/lab-robots.html',  solve_count:210, status:'active' },
  { slug:'web-06', title:'Insecure Deserialization',    category:'web',       difficulty:'easy',   points:60,  xp_reward:90,   flag:'ACX{tru5t_n0th1ng_fr0m_th3_cl13nt}',      hints:['The cookie is Base64 encoded. Decode it and read the raw string.','The decoded string is a PHP-serialized object with a boolean field isAdmin, currently b:0 (false).','Change b:0 to b:1, Base64 encode it again, and set it back as the acx_session cookie before checking access.'], description:'NovaSat internal member portal stores your session in a cookie. Log in as a guest, inspect the cookie, and find a way to become admin without ever knowing an admin password.', lab_url:'/pages/labs/lab-deserialize.html', solve_count:0, status:'active' },
  { slug:'web-07', title:'Insecure Deserialization II', category:'web',       difficulty:'medium', points:150, xp_reward:220,  flag:'ACX{l3ngth_pr3f1x3s_l13_2_y0u}',          hints:['The cookie is a Base64 encoded PHP-serialized object again, decode it first.', 'The role field looks like s:4:"user". That leading number is the exact byte length of the string that follows.', 'Changing "user" to "admin" without updating that number breaks parsing. Update s:4: to the correct length of admin before encoding it back.'], description:'NovaSat pushed a v2 API for the member session. Same cookie-trust problem, but this time the role is a string, not a boolean, and the server reads it strictly.', lab_url:'/pages/labs/lab-deserialize-medium.html', solve_count:0, status:'active' },
  { slug:'for-01', title:'Packet Detective',           category:'forensics', difficulty:'medium', points:200, xp_reward:350,  flag:'ACX{p4ck3t_d3t3ct1v3_dn5_3xf1l}',         hints:['Filter by `dns` in Wireshark. One internal IP is repeatedly querying an external domain and getting NXDOMAIN every time, that\'s a sign of DNS tunneling.','The subdomain labels being queried are the encoded data. Collect all of them in timestamp order and join them together.','Uppercase the joined string, pad it to a multiple of 8 with `=`, then Base32 decode it. CyberChef makes this quick.'], description:'A machine on the CorpX network was flagged for unusual outbound DNS activity. A short packet capture was taken at the egress point. Download the PCAP and figure out what data was being exfiltrated through DNS queries.', lab_url:'/pages/labs/lab-packet.html',  solve_count:54,  status:'active' },
  { slug:'for-02', title:'Metadata Matters',           category:'forensics', difficulty:'easy',   points:75,  xp_reward:120,  flag:'ACX{m3t4_d4t4_1s_3v3rywh3r3}',           hints:['Image files store hidden data called EXIF metadata beyond just pixels.','Use exiftool or an online viewer like exifinfo.net to read all fields.','The flag is split across 4 fields. Find them all and figure out the correct order.'], description:'Someone shared an image on PixelDrop. The image looks normal but was flagged during a metadata review. Download it and extract the EXIF data to find the hidden flag.', lab_url:'/pages/labs/lab-metadata.html', solve_count:178, status:'active' },
  { slug:'for-03', title:'Log Hunter',                 category:'forensics', difficulty:'hard',   points:350, xp_reward:600,  flag:'ACX{45.33.32.156__sqlmap__/admin/config.php}', hints:['Count requests per IP with awk and uniq -c. One IP has far more requests than any legitimate visitor.','Filter by the attacker IP and check unique User-Agent strings. Two distinct tools were used at different times of day.','The flag uses the SQL injection tool name only (not the directory scanner). Strip the query string from the path, keep only the base PHP file.'], description:'CorpX\'s web server saw unusual traffic one night. An access log with 2,156 lines has been recovered. Find the attacker\'s IP address, which tool they used to break in, and which path was exploited. Format: ACX{ip__tool__path}', lab_url:'/pages/labs/lab-loghunter.html', solve_count:28, status:'active' },
  { slug:'cry-01', title:"Caesar's Secret",            category:'crypto',    difficulty:'easy',   points:50,  xp_reward:80,   flag:'ACX{veni_vidi_vici_shift3}',               hints:['The cipher is named after the Roman emperor who invented it, a fixed letter shift.','The shift is a single digit, the same one Julius Caesar used historically.','Shift is 3. Decode at CyberChef with the Caesar Cipher Decode recipe.'], description:'An encrypted transmission was intercepted from a dark web channel linked to underground group RedCell. The message is protected with a classic substitution cipher. Decrypt it and extract the verification token.', lab_url:'/pages/labs/lab-caesar.html', solve_count:195, status:'active' },
  { slug:'cry-02', title:'Base64 Bonanza',             category:'crypto',    difficulty:'easy',   points:50,  xp_reward:80,   flag:'ACX{base64_is_not_encryption}',            hints:['Open the file in a text editor or with cat. It is not an image.','Decoding the file gives a telemetry message, not the flag. Look for the ENCODED PAYLOAD section.','Decode the payload string a second time with Base64. Two layers total.'], description:'A suspicious file was found in the NovaSat NS-7 telemetry export directory. It has a .jpg extension but it is not an image. Open it as text, decode what you find, and peel back both layers to extract the flag.', lab_url:'/pages/labs/lab-base64.html', solve_count:231, status:'active' },
  { slug:'ai-01', title:'Helpdesk Slip',              category:'ai',        difficulty:'easy',   points:50,  xp_reward:100,  flag:'ACX{h3lpd3sk_b0t_sp1ll3d_th3_b34ns}',     hints:['The bot has no way to check who you really are. Its only protection is a polite request in its instructions not to share the code.','Try telling the bot you are the person the code is meant for, or ask it to repeat the instructions it was given at the start of the chat.','Ask directly for the admin recovery code while explaining that you are from the IT admin team. The flag is the code, in ACX{...} format.'], description:'CorpX Ltd. launched an AI assistant for its IT helpdesk. It knows a confidential admin recovery code and has been told not to share it with regular staff. Can you get it to talk?', lab_url:'/pages/labs/lab-ai-easy.html', solve_count:0, status:'active' },
];

/* ── Merge DB challenges with local seed (DB wins on conflicts) ── */
function ctfMergeWithSeed(dbData) {
  // Local seed is always source of truth for content;
  // DB provides id, status, and solve count.
  const dbMap = {};
  if (dbData) dbData.forEach(d => { if (d.slug) dbMap[d.slug] = d; });
  const disabled = JSON.parse(localStorage.getItem('acx_ctf_disabled') || '[]');
  const seedSlugs = new Set(CTF_LOCAL_SEED.map(c => c.slug));
  // DB mein jo challenges hain lekin local seed mein nahi, unhe bhi dikhao
  // taaki user-facing CTF page ka koi bhi challenge admin se gayab na ho.
  const dbOnly = (dbData || []).filter(d => d.slug && !seedSlugs.has(d.slug)).map(d => ({
    slug:        d.slug,
    title:       d.title || d.slug,
    category:    (d.category || 'misc').toLowerCase(),
    difficulty:  (d.difficulty || 'easy').toLowerCase(),
    points:      d.points || 0,
    xp_reward:   d.xp || 0,
    hints:       d.hints || [],
    description: d.description || '',
    lab_url:     d.lab_url || '',
    status:      d.status || 'active',
    id:          d.id,
    desc:        d.description || '',
    solves:      d.solve_count ?? d.solvers ?? 0,
    _isLocal:    false,
    _dbId:       d.id,
  }));
  const seedList = CTF_LOCAL_SEED.map(c => {
    const db = dbMap[c.slug];
    const dbStatus = db?.status;
    const effectiveStatus = dbStatus || (disabled.includes(c.slug) ? 'disabled' : 'active');
    // solve count: DB se aana chahiye. Agar DB mein match nahi (naya
    // local-only seed challenge), 0 treat karo -- kabhi bhi fake seed
    // solve_count use nahi karna (wo sirf UI demo purpose ke liye tha).
    const dbSolves = db ? (db.solve_count ?? db.solvers ?? 0) : 0;
    // FIX: 'c' (CTF_LOCAL_SEED item) mein already ek fake 'solve_count'
    // field hota hai. Spread (...c) use karne se wo carry ho jaata tha,
    // aur kahin bhi '||' se OR karne pe (jab real value 0 ho) fake value
    // leak ho jaati thi. Isliye explicitly ise object se hata rahe hain.
    const { solve_count: _ignoredFakeSolveCount, ...cWithoutFakeSolveCount } = c;
    return {
      ...cWithoutFakeSolveCount,
      id:       db?.id || 'seed-' + c.slug,
      desc:     c.description,
      solves:   dbSolves,
      hints:    c.hints || [],
      status:   effectiveStatus,
      _isLocal: !db,          // true only when NO matching row in DB
      _dbId:    db?.id || null,
    };
  });
  return seedList.concat(dbOnly);
}

async function renderCTF() {
  const grid = document.getElementById('ctfGrid');
  if (grid && !_ctfLoaded) grid.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:20px;">Loading challenges...</div>';
  await loadCTFData();
  await loadCTFScoreboard();
  renderCTFStats();
  renderCTFGrid();
  renderCTFScoreboard();
  renderCTFCategoryBreakdown();
  // Show sync banner if all local (no real DB records)
  const allLocal = ctfChallenges.length > 0 && ctfChallenges.every(c => c._isLocal);
  const banner = document.getElementById('ctfSyncBanner');
  if (banner) banner.style.display = allLocal ? 'flex' : 'none';
}

async function loadCTFData() {
  _ctfLoaded = false;

  // Show local seed immediately so grid is not blank while DB loads
  ctfChallenges = ctfMergeWithSeed([]);
  renderCTFGrid();

  const banner = document.getElementById('ctfSyncBanner');

  if (!_supabase) {
    // Offline mode, all LOCAL, show sync banner
    _ctfLoaded = true;
    if (banner) banner.style.display = 'flex';
    console.log('[Admin] CTF offline, showing local seed');
    return;
  }

  try {
    // FIX: pehle sirf 'id,slug,solve_count,status' fetch hota tha, 
    // solve_count column DB mein exist nahi karta (ctf_challenges mein
    // yeh column 'solvers' naam se hai, ya phir solves COUNT chahiye).
    // Ab solvers bhi fetch karo taaki solve count sahi dikhe.
    const { data, error } = await _supabase
      .from('ctf_challenges')
      .select('id, slug, title, description, category, difficulty, xp, hints, lab_url, status, solvers, points');

    if (error) {
      console.warn('[Admin] ctf_challenges fetch error:', error.message);
      _ctfLoaded = true;
      if (banner) banner.style.display = 'flex';
      return;
    }

    if (!data || data.length === 0) {
      // DB empty, show sync banner so admin knows to push
      _ctfLoaded = true;
      if (banner) banner.style.display = 'flex';
      console.log('[Admin] ctf_challenges table empty, showing sync banner');
      return;
    }

    // DB has challenges, hide sync banner, merge with seed
    if (banner) banner.style.display = 'none';

    // Sync DB status → localStorage
    const _dis = JSON.parse(localStorage.getItem('acx_ctf_disabled') || '[]');
    data.forEach(r => {
      if (!r.slug) return;
      const idx = _dis.indexOf(r.slug);
      if (r.status === 'disabled' && idx < 0) _dis.push(r.slug);
      else if (r.status !== 'disabled' && idx >= 0) _dis.splice(idx, 1);
    });
    localStorage.setItem('acx_ctf_disabled', JSON.stringify(_dis));

    // Map DB data with solve_count from 'solvers' column
    const dbDataMapped = data.map(r => ({
      ...r,
      solve_count: r.solvers || 0
    }));

    ctfChallenges = ctfMergeWithSeed(dbDataMapped);
    _ctfLoaded = true;
    renderCTFStats();
    renderCTFGrid();
    renderCTFCategoryBreakdown();

  } catch(e) {
    console.warn('[Admin] loadCTFData error:', e);
    _ctfLoaded = true;
  }
  console.log('[Admin] CTF loaded:', ctfChallenges.length, 'challenges');
}

/* ── Sync all local seed challenges to Supabase ── */
/* ── Reset all solver counts (for going live on real hosting) ── */
async function ctfResetSolverCounts() {
  if (!_supabase) { toast('Supabase not configured', 'error'); return; }
  if (!confirm('Reset solver counts to 0 for ALL challenges?\n\nThis only clears the displayed count, it does NOT delete anyone\'s solved-challenge history, XP, or the ctf_solves records. Use this once before going live on real hosting so testing-phase numbers don\'t show to real players.')) return;
  toast('Resetting solver counts…');
  const { error } = await _supabase.from('ctf_challenges').update({ solvers: 0 }).not('id', 'is', null);
  if (error) { toast('Reset failed: ' + error.message, 'error'); return; }
  toast('✓ Solver counts reset to 0');
  await renderCTF();
}

async function ctfSyncToSupabase() {
  if (!_supabase) { toast('Supabase not configured', 'error'); return; }
  // Only sync if DB truly empty
  const { data: existing } = await _supabase.from('ctf_challenges').select('id').limit(1);
  if (existing && existing.length > 0) {
    toast('Database already has challenges, use Edit to modify them', 'error');
    return;
  }
  if (!confirm(`Push all ${CTF_LOCAL_SEED.length} local challenges to Supabase?\n\nThis will create them as real DB records and they will appear live on the CTF page.`)) return;
  toast('Syncing ' + CTF_LOCAL_SEED.length + ' challenges…');
  // FIX: pehle xp_reward aur solve_count use hote the, DB mein
  // ye columns 'xp' aur 'solvers' hain. Wrong names se insert fail hota.
  const rows = CTF_LOCAL_SEED.map(c => ({
    slug:        c.slug,
    title:       c.title,
    description: c.description,
    category:    c.category,
    difficulty:  c.difficulty,
    flag:        c.flag,
    points:      c.points,
    xp:          c.xp_reward || 0,   // DB column: xp (not xp_reward)
    hints:       c.hints,
    status:      c.status,
    lab_url:     c.lab_url || null,
    solvers:     0,                  // DB column: solvers (not solve_count)
  }));
  const { error } = await _supabase.from('ctf_challenges').insert(rows);
  if (error) { toast('Sync failed: ' + error.message, 'error'); return; }
  toast('✓ All ' + CTF_LOCAL_SEED.length + ' challenges synced to database!');
  await renderCTF();
}

/* ── Refresh scoreboard only ── */
async function refreshCTFScoreboard() {
  const btn = event?.currentTarget;
  if (btn) btn.style.opacity = '0.4';
  await loadCTFScoreboard();
  renderCTFScoreboard();
  if (btn) btn.style.opacity = '1';
  toast('Scoreboard refreshed');
}

function renderCTFStats() {
  // FIX: pehle `c.solves || c.solve_count || 0` tha -- agar real solves
  // count 0 hota (jo bilkul valid hai naye challenge ke liye), `0` falsy
  // hone ki wajah se fake CTF_LOCAL_SEED wala solve_count use ho jaata
  // tha. Yehi wajah thi fake total numbers dikhne ki. Ab explicit
  // nullish check karo taaki real 0 bhi 0 hi treat ho.
  const totalSolves = ctfChallenges.reduce((a,c) => a + (c.solves ?? 0), 0);
  const activeCount = ctfChallenges.filter(c=>c.status==='active').length;
  document.getElementById('ctfTotal').textContent = ctfChallenges.length;
  document.getElementById('ctfActiveCount').textContent = `${activeCount} active`;
  document.getElementById('ctfSolves').textContent = totalSolves.toLocaleString();
  const xpAwarded = ctfChallenges.reduce((a,c) => a + (c.solves ?? 0) * (c.xp_reward || c.points || 0), 0);
  document.getElementById('ctfXPAwarded').textContent = xpAwarded.toLocaleString();
}

function renderCTFCategoryBreakdown() {
  const el = document.getElementById('ctfCategoryBreakdown');
  if (!el) return;
  const cats = {};
  ctfChallenges.forEach(c => { cats[c.category] = (cats[c.category]||0)+1; });
  const colors = { web:'#3b82f6', forensics:'#22c55e', crypto:'#a855f7', osint:'#f59e0b', pwn:'#ef4444', reversing:'#06b6d4', ai:'#ec4899', misc:'#6b7280' };
  el.innerHTML = Object.entries(cats).map(([cat, count]) => {
    const col = colors[cat] || '#6b7280';
    return `<span style="font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;background:${col}18;border:1px solid ${col}30;color:${col};cursor:pointer;" onclick="document.getElementById('ctfCategoryFilter').value='${cat}';filterCTF();">${categoryLabel(cat)} <span style="opacity:0.7;">${count}</span></span>`;
  }).join('');
}

function filterCTF(text) {
  if (typeof text === 'string') ctfFilterText = text.toLowerCase();
  renderCTFGrid();
}

function renderCTFGrid() {
  const cat    = document.getElementById('ctfCategoryFilter')?.value || '';
  const diff   = document.getElementById('ctfDifficultyFilter')?.value || '';
  const status = document.getElementById('ctfStatusFilter')?.value || '';
  const list = ctfChallenges.filter(c =>
    (!cat    || c.category  === cat)  &&
    (!diff   || c.difficulty === diff) &&
    (!status || c.status    === status) &&
    AdminAI.match('ctf', ctfFilterText, [c.title, c.desc, c.category, c.difficulty])
  );
  const el = document.getElementById('ctfGrid');
  if (!list.length) {
    el.innerHTML = `<div style="color:var(--text-dim);font-size:12px;padding:20px 0;">No challenges match your filters.</div>`;
    return;
  }
  const diffColor = { easy:'#22c55e', medium:'#f59e0b', hard:'#ef4444', insane:'#a855f7' };
  const catColor  = { web:'#3b82f6', forensics:'#22c55e', crypto:'#a855f7', osint:'#f59e0b', pwn:'#ef4444', reversing:'#06b6d4', ai:'#ec4899', misc:'#6b7280' };
  el.innerHTML = list.map(c => {
    const labUrl  = c.lab_url || getLabUrl(c.lab_type,'');
    const dc = diffColor[c.difficulty] || '#6b7280';
    const cc = catColor[c.category]   || '#6b7280';
    const solveCount = c.solves ?? 0;
    const isLocal = c._isLocal;
    return `
    <div style="background:var(--surface);border:1px solid ${isLocal?'rgba(245,158,11,0.18)':'var(--border)'};border-radius:12px;padding:16px 18px;margin-bottom:10px;transition:border-color 0.15s,box-shadow 0.15s;position:relative;overflow:hidden;"
         onmouseover="this.style.borderColor='${isLocal?'rgba(245,158,11,0.4)':'var(--border-h)'}';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.2)'"
         onmouseout="this.style.borderColor='${isLocal?'rgba(245,158,11,0.18)':'var(--border)'  }';this.style.boxShadow='none'">
      ${isLocal ? `<div style="position:absolute;top:0;right:0;background:rgba(245,158,11,0.15);border-bottom-left-radius:8px;padding:2px 8px;font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:0.5px;">LOCAL</div>` : ''}
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
            <div style="font-size:14px;font-weight:600;color:var(--white);">${c.title}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;background:${cc}15;border:1px solid ${cc}25;color:${cc};">${categoryLabel(c.category)}</span>
          </div>
        </div>
        <span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:10px;background:${dc}15;border:1px solid ${dc}25;color:${dc};white-space:nowrap;flex-shrink:0;">${(c.difficulty||'').toUpperCase()}</span>
      </div>
      <div style="font-size:12px;color:var(--text-dim);line-height:1.6;margin-bottom:12px;">${(c.desc||'').slice(0,130)}${(c.desc||'').length>130?'…':''}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:var(--red);">${c.points}<span style="font-size:10px;font-weight:500;color:var(--text-dim);margin-left:2px;">pts</span></span>
          <span style="font-size:10px;color:var(--text-dim);padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;">${solveCount} solve${solveCount!==1?'s':''}</span>
          ${labUrl ? `<span style="background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);color:#60a5fa;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;">LAB</span>` : ''}
          <span style="font-size:10px;padding:2px 7px;border-radius:5px;${c.status==='active'?'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e;':c.status==='draft'?'background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);color:#f59e0b;':'background:rgba(107,114,128,0.1);border:1px solid rgba(107,114,128,0.2);color:#6b7280;'}">${c.status||'active'}</span>
        </div>
        <div class="action-btns">
          ${labUrl ? `<a href="${labUrl}" target="_blank" class="btn icon-only" title="Preview Lab" style="color:#60a5fa;">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" stroke-width="1.2"/><circle cx="6" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>
          </a>` : ''}
          <button class="btn icon-only" title="${isLocal?'Edit (will create in DB)':'Edit'}" onclick="openEditCTF('${c.id}')">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          ${!isLocal ? `<button class="btn icon-only red" title="Delete" onclick="deleteCTF('${c.id}')">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M4 3V2h4v1M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>` : `<button class="btn icon-only" title="Push to DB" style="color:#f59e0b;" onclick="ctfPushSingle('${c.slug}')">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── Push single local challenge to DB ── */
async function ctfPushSingle(slug) {
  if (!_supabase) { toast('Supabase not configured', 'error'); return; }
  const seed = CTF_LOCAL_SEED.find(c => c.slug === slug);
  if (!seed) return;
  const row = { slug:seed.slug, title:seed.title, description:seed.description, category:seed.category, difficulty:seed.difficulty, flag:seed.flag, points:seed.points, xp_reward:seed.xp_reward, hints:seed.hints, status:seed.status, lab_url:seed.lab_url||null, lab_api_path:null, instance_managed:false, solve_count:0 };
  const { error } = await _supabase.from('ctf_challenges').insert(row);
  if (error) { toast('Push failed: ' + error.message, 'error'); return; }
  toast(seed.title + ' pushed to DB ✓');
  await renderCTF();
}

function categoryLabel(c) {
  const map = { web:'Web', forensics:'Forensics', crypto:'Crypto', osint:'OSINT', pwn:'Pwn', reversing:'Reversing', ai:'AI Security', misc:'Misc' };
  return map[c] || c;
}

function renderCTFScoreboard() {
  const tbody = document.getElementById('ctfScoreboardTbody');
  if (!tbody) return;
  if (!ctfScoreboard.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-dim);font-size:12px;padding:20px;">No solves recorded yet, first solve will appear here.</td></tr>`;
    return;
  }
  tbody.innerHTML = ctfScoreboard.map((s,i) => {
    const rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
    return `
    <tr>
      <td><span class="rank-pill ${rankClass}">${s.rank}</span></td>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${(s.user||'?')[0].toUpperCase()}</div>
          <div class="user-name">${s.user}</div>
        </div>
      </td>
      <td>${s.solves}</td>
      <td><span style="font-family:'Rajdhani',sans-serif;font-weight:700;color:var(--yellow);">${s.points.toLocaleString()}</span></td>
      <td style="color:var(--text-dim);font-size:11px;">${s.lastSolve}</td>
    </tr>`;
  }).join('');
}

// Cache of admin's XP reward rules (platform_settings.xp_rules), used both
// to auto-fill points when picking a difficulty and to compute the actual
// XP reward on save, so the Gamification tab's Easy/Medium/Hard sliders
// actually take effect on newly created/edited challenges.
let _ctfXpRulesCache = null;
async function _getCtfXpRules() {
  if (_ctfXpRulesCache) return _ctfXpRulesCache;
  const sb = window._supabase;
  if (!sb) return { ctf_easy: 50, ctf_medium: 100, ctf_hard: 200 };
  try {
    const { data, error } = await sb.rpc('get_xp_rules');
    if (error || !data) throw error || new Error('no data');
    _ctfXpRulesCache = {
      ctf_easy:   Number(data.ctf_easy)   || 50,
      ctf_medium: Number(data.ctf_medium) || 100,
      ctf_hard:   Number(data.ctf_hard)   || 200,
    };
  } catch (e) {
    console.warn('[Admin] Could not load xp_rules for CTF form, using defaults:', e?.message);
    _ctfXpRulesCache = { ctf_easy: 50, ctf_medium: 100, ctf_hard: 200 };
  }
  return _ctfXpRulesCache;
}

async function ctfAutoPoints() {
  if (editingCTFId) return;
  const diff = document.getElementById('ctfDifficulty').value;
  // Points (leaderboard score) still follows the existing easy/medium/hard/
  // default scale used across the app; XP itself is computed separately
  // in saveCTF() straight from the admin's xp_rules.
  const points = diff==='easy' ? 50 : diff==='medium' ? 150 : diff==='hard' ? 300 : 500;
  document.getElementById('ctfPoints').value = points;
}

function openAddCTF() {
  editingCTFId = null;
  // Clear stored slug so saveCTF generates a fresh slug from title
  const modal = document.getElementById('ctfModal');
  if (modal) modal.dataset.editSlug = '';
  document.getElementById('ctfModalTitle').textContent = 'Create Challenge';
  document.getElementById('ctfTitle').value = '';
  document.getElementById('ctfDesc').value = '';
  document.getElementById('ctfCategory').value = 'web';
  document.getElementById('ctfDifficulty').value = 'easy';
  document.getElementById('ctfFlag').value = '';
  document.getElementById('ctfPoints').value = '50';
  document.getElementById('ctfHints').value = '';
  document.getElementById('ctfStatus').value = 'draft';
  const lt = document.getElementById('ctfLabType');
  if (lt) lt.value = '';
  const cu = document.getElementById('ctfCustomLabUrl');
  if (cu) cu.value = '';
  updateLabPreview();
  openModal('ctfModal');
}

function openEditCTF(id) {
  const c = ctfChallenges.find(x=>String(x.id)===String(id));
  if (!c) return;
  editingCTFId = c._isLocal ? null : id; // local → treat as new
  // Store slug always (needed for local challenges to update correct _disabled key)
  document.getElementById('ctfModal').dataset.editSlug = c.slug || '';
  document.getElementById('ctfModalTitle').textContent = c._isLocal ? 'Create from Seed' : 'Edit Challenge';
  document.getElementById('ctfTitle').value    = c.title;
  document.getElementById('ctfDesc').value     = c.desc || c.description || '';
  document.getElementById('ctfCategory').value = c.category;
  document.getElementById('ctfDifficulty').value = c.difficulty;
  document.getElementById('ctfFlag').value     = c.flag || '';
  document.getElementById('ctfPoints').value   = c.points;
  document.getElementById('ctfHints').value    = (c.hints||[]).join('\n');
  // Read effective status from localStorage (persists across refreshes)
  const _disabled = JSON.parse(localStorage.getItem('acx_ctf_disabled') || '[]');
  document.getElementById('ctfStatus').value = _disabled.includes(c.slug) ? 'disabled' : (c.status || 'active');
  const lt = document.getElementById('ctfLabType');
  if (lt) lt.value = c.lab_type || '';
  const cu = document.getElementById('ctfCustomLabUrl');
  if (cu) cu.value = c.lab_url || '';
  updateLabPreview();
  openModal('ctfModal');
}

async function saveCTF() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  const title      = document.getElementById('ctfTitle').value.trim();
  const desc       = document.getElementById('ctfDesc').value.trim();
  const category   = document.getElementById('ctfCategory').value;
  const difficulty = document.getElementById('ctfDifficulty').value;
  const flag       = document.getElementById('ctfFlag').value.trim();
  const points     = parseInt(document.getElementById('ctfPoints').value) || 50;
  // XP reward now comes from the admin's configured Easy/Medium/Hard rules
  // (Gamification → XP Reward Rules) instead of a flat points*1.5 guess,
  // so changing those sliders actually affects challenges going forward.
  const _xpRules   = await _getCtfXpRules();
  const xp_reward  = difficulty === 'easy'   ? _xpRules.ctf_easy
                    : difficulty === 'medium' ? _xpRules.ctf_medium
                    : difficulty === 'hard'   ? _xpRules.ctf_hard
                    : Math.round(points * 1.5); // fallback for any unexpected difficulty value
  const hints      = document.getElementById('ctfHints').value.split('\n').map(h=>h.trim()).filter(Boolean);
  const status     = document.getElementById('ctfStatus').value;
  const lab_type   = document.getElementById('ctfLabType')?.value || '';
  const customUrl  = document.getElementById('ctfCustomLabUrl')?.value.trim() || '';
  const lab_url    = lab_type === 'custom' ? customUrl : getLabUrl(lab_type, '');

  if (!title)  { toast('Challenge title is required', 'error'); return; }
  if (!flag)   { toast('Flag is required (e.g. ACX{...})', 'error'); return; }
  if (!flag.match(/ACX\{.+\}/)) { if (!confirm('Flag format looks unusual (expected ACX{...}). Continue?')) return; }

  const _editC = editingCTFId ? ctfChallenges.find(x => String(x.id) === String(editingCTFId)) : null;
  const _storedSlug = document.getElementById('ctfModal')?.dataset.editSlug || '';
  const slug = _editC?.slug || _storedSlug || title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);

  const row = {
    slug, title, description: desc, category, difficulty,
    flag, points, xp: xp_reward, hints, status, lab_url: lab_url || null
  };

  try {
    let error;
    if (_editC && !_editC._isLocal) {
      // Real DB row, update by id
      ({ error } = await sb.from('ctf_challenges').update(row).eq('id', _editC.id));
    } else {
      // New challenge OR editing a local-seed-only entry that isn't in DB yet
      ({ error } = await sb.from('ctf_challenges').upsert(row, { onConflict: 'slug' }));
    }
    if (error) throw error;

    toast(title + (editingCTFId ? ' updated' : ' created'));
    closeModal('ctfModal');

    // Re-fetch fresh data from DB (single source of truth now)
    await loadCTFData();
    const banner = document.getElementById('ctfSyncBanner');
    if (banner) banner.style.display = 'none';
  } catch (e) {
    console.error('[Admin] saveCTF error:', e);
    toast('Could not save challenge: ' + e.message, 'error');
  }
}

async function deleteCTF(id) {
  const c = ctfChallenges.find(x=>String(x.id)===String(id));
  if (c?._isLocal) { toast('Local seed challenges cannot be deleted, use Sync to push them first', 'error'); return; }
  if (!confirm('Delete "' + (c?.title||'this challenge') + '"?\n\nThis cannot be undone.')) return;
  if (_supabase) {
    const { error } = await _supabase.from('ctf_challenges').delete().eq('id', id);
    if (error) { toast('Delete failed: ' + error.message, 'error'); return; }
  }
  ctfChallenges = ctfChallenges.filter(x=>String(x.id)!==String(id));
  renderCTFStats(); renderCTFGrid(); renderCTFCategoryBreakdown();
  toast((c?.title||'Challenge') + ' deleted');
}

/* ════════════════════════════════════════════════════
   PROGRESS TRACKING & CERTIFICATES
════════════════════════════════════════════════════ */
function renderProgress() {
  const avg = Math.round(userProgress.reduce((a,p)=>a+p.progress,0) / userProgress.length);
  document.getElementById('progAvgCompletion').textContent = avg + '%';
  document.getElementById('progCertsIssued').textContent = certificates.filter(c=>c.status==='issued').length;
  document.getElementById('progCertsRevoked').textContent = certificates.filter(c=>c.status==='revoked').length + ' revoked';
  document.getElementById('progInProgress').textContent = userProgress.filter(p=>p.progress<100).length;
  renderProgressTable();
  renderCertTable();
}

function filterProgress(text) {
  renderProgressTable(text ? text.toLowerCase() : '');
}

function renderProgressTable(filter='') {
  const list = userProgress.filter(p => AdminAI.match('progress', filter, [p.user, p.course]));
  const tbody = document.getElementById('progressTbody');
  tbody.innerHTML = list.map(p => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${p.user[0]}</div>
          <div class="user-name">${p.user}</div>
        </div>
      </td>
      <td>${p.course}</td>
      <td>
        <div class="mini-progress-wrap">
          <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${p.progress}%;"></div></div>
          <span>${p.progress}%</span>
        </div>
      </td>
      <td>${p.timeSpent}</td>
      <td>${p.quizAvg}%</td>
      <td>${p.lastActivity}</td>
      <td>${p.resume}</td>
    </tr>
  `).join('');
}

function renderCertTable() {
  const tbody = document.getElementById('certTbody');
  tbody.innerHTML = certificates.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${c.user[0]}</div>
          <div class="user-name">${c.user}</div>
        </div>
      </td>
      <td>${c.course}</td>
      <td>${c.issued}</td>
      <td><span class="badge cert-${c.status}">${c.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn icon-only" title="View" onclick="viewCert('${c.id}')">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" stroke-width="1.2"/><circle cx="6" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>
          </button>
          <button class="btn icon-only ${c.status==='revoked'?'green':'red'}" title="${c.status==='revoked'?'Reinstate':'Revoke'}" onclick="toggleCertStatus('${c.id}')">
            ${c.status==='revoked'
              ? `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
              : `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 3l6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`}
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

let viewingCertId = null;
function viewCert(id) {
  const c = certificates.find(x=>x.id===id);
  if (!c) return;
  viewingCertId = id;
  document.getElementById('certUserName').textContent = c.user;
  document.getElementById('certCourseName').textContent = c.course + ', Certificate of Completion';
  document.getElementById('certIdRow').textContent = `Verification ID: ${c.id}  ·  Issued: ${c.issued}`;
  openModal('certModal');
}

function downloadCertPDF() {
  toast('Generating certificate PDF…');
}

function toggleCertStatus(id) {
  const c = certificates.find(x=>x.id===id);
  if (!c) return;
  c.status = c.status === 'revoked' ? 'issued' : 'revoked';
  renderCertTable();
  toast(c.status === 'revoked' ? `Certificate ${id} revoked` : `Certificate ${id} reinstated`, c.status==='revoked' ? 'error' : 'success');
  renderProgress();
}

function exportCertLogs() {
  toast('Certificate logs exported');
}




/* ════════════════════════════════════════════════════
   RESOURCE LIBRARY, live from Supabase (resources table + storage bucket)
════════════════════════════════════════════════════ */
let resources = [];
let editingResId = null;
let _resLoaded = false;
let _resPendingFile = null;

async function loadResources() {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { data, error } = await sb
      .from('resources')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    resources = (data || []).map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      size: formatFileSize(r.file_size),
      chapter: r.chapter_tag || '',
      downloads: r.downloads || 0,
      uploaded: (r.uploaded_at || '').slice(0, 10),
      status: r.status,
      file_path: r.file_path,
    }));
    _resLoaded = true;
    renderResTable();
    renderResourceStats();
  } catch (e) {
    console.error('[Admin] loadResources error:', e);
    toast('Could not load resources', 'error');
  }
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

function renderResources() {
  if (!_resLoaded) {
    loadResources();
  } else {
    renderResTable();
    renderResourceStats();
  }
}

function renderResourceStats() {
  const active = resources.filter(r=>r.status==='active');
  const totalDL = resources.reduce((a,r)=>a+r.downloads,0);
  const top = [...resources].sort((a,b)=>b.downloads-a.downloads)[0];
  const cats = [...new Set(resources.map(r=>r.type))].length;

  document.getElementById('resTotal').textContent = resources.length;
  document.getElementById('resActive').textContent = active.length + ' active';
  document.getElementById('resTotalDownloads').textContent = totalDL.toLocaleString();
  document.getElementById('resTopDownloaded').textContent = top ? top.name.substring(0,18)+(top.name.length>18?'…':'') : '-';
  document.getElementById('resTopCount').textContent = top ? top.downloads + ' downloads' : '';
  document.getElementById('resCategories').textContent = cats;
}

const TYPE_COLORS = { cheatsheet:'blue', pcap:'green', pdf:'red', script:'yellow', wordlist:'purple', other:'gray' };
const TYPE_ICONS = {
  cheatsheet: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1.2" stroke="currentColor" stroke-width="1.2"/><path d="M3.5 4h5M3.5 6.5h5M3.5 9h3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`,
  pcap:       `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 6h2l1.5-3 2 6 1.5-4L9.5 7H11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pdf:        `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1" width="9" height="10" rx="1.2" stroke="currentColor" stroke-width="1.2"/><path d="M3.5 5.5h2M3.5 7.5h5M3.5 9h5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><path d="M3.5 3.5h2" stroke="var(--red)" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  script:     `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 4l-2 2 2 2M9 4l2 2-2 2M6 2l-1.5 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  wordlist:   `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M1.5 6h7M1.5 9h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  other:      `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2"/><path d="M6 4v2.5L7.5 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
};

function renderResTable(list) {
  const data = list !== undefined ? list : resources;
  document.getElementById('resCount').textContent = data.length + ' resource' + (data.length!==1?'s':'');
  document.getElementById('resTbody').innerHTML = data.map(r => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:6px;background:var(--surface3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${TYPE_ICONS[r.type]||TYPE_ICONS.other}
          </div>
          <div>
            <div style="font-size:12px;font-weight:500;color:var(--white);">${escHtmlAdm(r.name)}</div>
          </div>
        </div>
      </td>
      <td><span class="badge ${TYPE_COLORS[r.type]||''}">${r.type}</span></td>
      <td style="font-size:11px;">${r.size}</td>
      <td style="font-size:11px;color:var(--text-dim);">${escHtmlAdm(r.chapter)||'-'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:5px;">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 6l3 3 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-size:12px;font-weight:600;color:var(--white);">${r.downloads.toLocaleString()}</span>
        </div>
      </td>
      <td style="font-size:11px;color:var(--text-dim);">${r.uploaded}</td>
      <td><span class="badge ${r.status==='active'?'green':'gray'}">${r.status}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="action-btn" onclick="editResource('${r.id}')" title="Edit">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2-7 7H1.5v-2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
          </button>
          <button class="action-btn" onclick="toggleResStatus('${r.id}')" title="${r.status==='active'?'Hide':'Show'}">
            ${r.status==='active'
              ? `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M6 3a5 5 0 014.5 3M1.5 4A5 5 0 006 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`
              : `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 6a5 5 0 019 0 5 5 0 01-9 0z" stroke="currentColor" stroke-width="1.2"/><circle cx="6" cy="6" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>`}
          </button>
          <button class="action-btn danger" onclick="deleteResource('${r.id}')" title="Delete">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 3v6h4V3H4z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterResources() {
  const q = document.getElementById('resSearch').value.toLowerCase();
  const cat = document.getElementById('resCatFilter').value;
  const st = document.getElementById('resStatusFilter').value;
  const filtered = resources.filter(r =>
    AdminAI.match('resources', q, [r.name, r.chapter, r.type]) &&
    (!cat || r.type === cat) &&
    (!st || r.status === st)
  );
  renderResTable(filtered);
}

function editResource(id) {
  const r = resources.find(x=>x.id===id);
  if (!r) return;
  editingResId = id;
  _resPendingFile = null;
  document.getElementById('uploadResModalTitle').textContent = 'Edit Resource';
  document.getElementById('resName').value = r.name;
  document.getElementById('resType').value = r.type;
  document.getElementById('resChapterTag').value = r.chapter||'';
  document.getElementById('resVisibility').value = r.status;
  document.getElementById('resFileName').textContent = r.size + ', existing file (choose a new file to replace)';
  openModal('uploadResourceModal');
}

async function saveResource() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  const name = document.getElementById('resName').value.trim();
  if (!name) { toast('Resource name required', 'error'); return; }
  if (!editingResId && !_resPendingFile) { toast('Please select a file to upload', 'error'); return; }

  const type = document.getElementById('resType').value;
  const chapter = document.getElementById('resChapterTag').value.trim();
  const status = document.getElementById('resVisibility').value;

  const saveBtn = document.querySelector('#uploadResourceModal .btn.primary');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Uploading…'; }

  try {
    let file_path, file_size;

    if (_resPendingFile) {
      // Real file upload to Supabase Storage
      const file = _resPendingFile;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${Date.now()}_${safeName}`;

      const { error: uploadErr } = await sb.storage.from('resources').upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;

      file_path = path;
      file_size = file.size;

      // If editing and replacing file, delete old file from storage
      if (editingResId) {
        const old = resources.find(x => x.id === editingResId);
        if (old && old.file_path) {
          sb.storage.from('resources').remove([old.file_path]).then(()=>{}, ()=>{});
        }
      }
    }

    if (editingResId) {
      const updateRow = { name, type, chapter_tag: chapter, status };
      if (file_path) { updateRow.file_path = file_path; updateRow.file_size = file_size; }
      const { error } = await sb.from('resources').update(updateRow).eq('id', editingResId);
      if (error) throw error;
      toast('Resource updated');
    } else {
      const { error } = await sb.from('resources').insert({
        name, type, chapter_tag: chapter, status, file_path, file_size
      });
      if (error) throw error;
      toast('Resource uploaded');
    }

    editingResId = null;
    _resPendingFile = null;
    document.getElementById('uploadResModalTitle').textContent = 'Upload Resource';
    closeModal('uploadResourceModal');
    _resLoaded = false;
    await loadResources();
  } catch (e) {
    console.error('[Admin] saveResource error:', e);
    toast('Could not save resource: ' + e.message, 'error');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Upload'; }
  }
}

function handleResFile(input) {
  if (input.files[0]) {
    _resPendingFile = input.files[0];
    document.getElementById('resFileName').textContent = input.files[0].name;
  }
}

async function toggleResStatus(id) {
  const sb = window._supabase;
  const r = resources.find(x=>x.id===id);
  if (!r || !sb) return;
  const newStatus = r.status==='active' ? 'hidden' : 'active';
  try {
    const { error } = await sb.from('resources').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
    r.status = newStatus;
    renderResTable();
    renderResourceStats();
    toast(newStatus==='active' ? `${r.name} is now visible` : `${r.name} hidden`);
  } catch (e) {
    toast('Could not update status', 'error');
  }
}

async function deleteResource(id) {
  const sb = window._supabase;
  const r = resources.find(x=>x.id===id);
  if (!r || !sb) return;
  if (!confirm(`Delete "${r.name}"? This will also remove the uploaded file.`)) return;

  try {
    const { error } = await sb.from('resources').delete().eq('id', id);
    if (error) throw error;
    if (r.file_path) {
      sb.storage.from('resources').remove([r.file_path]).then(()=>{}, ()=>{});
    }
    resources = resources.filter(x=>x.id!==id);
    renderResTable();
    renderResourceStats();
    toast(`Deleted: ${r.name}`);
  } catch (e) {
    toast('Could not delete resource', 'error');
  }
}

function exportResourceList() {
  toast('Resource list exported as CSV');
}

function renderResources() {
  renderResourceStats();
  renderResTable();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  });
});

/* ════════════════════════════════════════════════════
   TOOLS MANAGER
   Real Supabase-backed enable/disable for AlexSync, Mistake
   Analyzer, and AlexRecon, plus usage stats pulled from
   tool_usage_logs (and each tool's own detail table where one
   exists, for a slightly richer per-tool number).
════════════════════════════════════════════════════ */
const TOOL_MGR_META = {
  alexsync: {
    label: 'AlexSync',
    tag: 'Automation',
    detailTable: 'alexsync_payments',
    detailLabel: 'payments'
  },
  mistake_analyzer: {
    label: 'Cyber Mistake Analyzer',
    tag: 'Learning',
    detailTable: null,
    detailLabel: null
  },
  alexrecon: {
    label: 'AlexRecon',
    tag: 'Recon',
    detailTable: 'alexrecon_scans',
    detailLabel: 'scans'
  },
  alexutils: {
    label: 'AlexUtils',
    tag: 'Utilities',
    detailTable: null,
    detailLabel: null
  },
  alextrace: {
    label: 'AlexTrace',
    tag: 'OSINT',
    detailTable: 'alextrace_lookups',
    detailLabel: 'lookups'
  }
};

async function renderToolsManager() {
  const grid = document.getElementById('toolsMgrGrid');
  if (!grid || !_supabase) return;
  grid.innerHTML = `<div style="grid-column:1/-1;color:var(--text-dim);font-size:13px;padding:20px 0;">Loading tools...</div>`;

  try {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: settings, error: settingsErr } = await _supabase
      .from('tool_settings')
      .select('*')
      .order('tool_key');
    if (settingsErr) throw settingsErr;

    // Pull per-tool usage counts (total + last 7 days) and the most
    // recent usage timestamp in parallel, one query set per tool.
    const statsPerTool = await Promise.all((settings || []).map(async (row) => {
      const [{ count: totalUses }, { count: uses7d }, { data: lastRows }] = await Promise.all([
        _supabase.from('tool_usage_logs').select('id', { count: 'exact', head: true }).eq('tool_key', row.tool_key),
        _supabase.from('tool_usage_logs').select('id', { count: 'exact', head: true }).eq('tool_key', row.tool_key).gte('created_at', since7d),
        _supabase.from('tool_usage_logs').select('created_at').eq('tool_key', row.tool_key).order('created_at', { ascending: false }).limit(1)
      ]);

      let detailCount = null;
      const meta = TOOL_MGR_META[row.tool_key];
      if (meta && meta.detailTable) {
        const { count } = await _supabase.from(meta.detailTable).select('id', { count: 'exact', head: true });
        detailCount = count;
      }

      return {
        ...row,
        totalUses: totalUses || 0,
        uses7d: uses7d || 0,
        lastUsedAt: lastRows && lastRows.length ? lastRows[0].created_at : null,
        detailCount
      };
    }));

    grid.innerHTML = statsPerTool.map(toolMgrCardHtml).join('');
  } catch (e) {
    console.error('[ToolsManager] load failed:', e);
    grid.innerHTML = `<div style="grid-column:1/-1;color:var(--text-dim);font-size:13px;padding:20px 0;">Could not load tools. ${e.message || ''}</div>`;
  }
}

function toolMgrCardHtml(row) {
  const meta = TOOL_MGR_META[row.tool_key] || { label: row.display_name, tag: '' };
  const statusColor = row.is_enabled ? '#4ade80' : '#f87171';
  const lastUsed = row.lastUsedAt ? new Date(row.lastUsedAt).toLocaleString() : 'Never used yet';
  const detailLine = (meta.detailTable && row.detailCount !== null)
    ? `<div class="tm-stat"><span>${row.detailCount}</span><label>total ${escapeAdminHtml(meta.detailLabel)}</label></div>`
    : '';

  return `
    <div class="card" style="padding:18px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px;">
        <div>
          <div style="font-size:10px;letter-spacing:1px;color:var(--red);font-weight:700;margin-bottom:4px;">${escapeAdminHtml(meta.tag || '')}</div>
          <div style="font-size:16px;font-weight:700;color:var(--text);">${escapeAdminHtml(meta.label || row.tool_key)}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${row.is_enabled ? 'checked' : ''} onchange="toolMgrToggle('${row.tool_key}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="width:7px;height:7px;border-radius:50%;background:${statusColor};display:inline-block;"></span>
        <span style="font-size:12px;color:var(--text-dim);">${row.is_enabled ? 'Live on the site' : 'Disabled - locked on the site'}</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(${detailLine ? 3 : 2},1fr);gap:10px;margin-bottom:14px;" class="tm-stats-row">
        <div class="tm-stat"><span>${row.totalUses}</span><label>total uses</label></div>
        <div class="tm-stat"><span>${row.uses7d}</span><label>last 7 days</label></div>
        ${detailLine}
      </div>

      <div style="font-size:11px;color:var(--text-dim);margin-bottom:14px;">Last used: ${escapeAdminHtml(lastUsed)}</div>

      <div style="display:flex;gap:8px;">
        <button class="btn" style="font-size:12px;padding:6px 12px;" onclick="toolMgrEditMessage('${row.tool_key}')">Edit disabled message</button>
      </div>
    </div>
    <style>
      .tm-stat { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:10px; text-align:center; }
      .tm-stat span { display:block; font-size:18px; font-weight:700; color:var(--text); }
      .tm-stat label { display:block; font-size:10px; color:var(--text-dim); margin-top:2px; }
    </style>`;
}

function escapeAdminHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

async function toolMgrToggle(toolKey, isEnabled) {
  if (!_supabase) return;
  try {
    const { data: { user } } = await _supabase.auth.getUser();
    const { error } = await _supabase
      .from('tool_settings')
      .update({ is_enabled: isEnabled, updated_at: new Date().toISOString(), updated_by: user ? user.id : null })
      .eq('tool_key', toolKey);
    if (error) throw error;
    toast(`${TOOL_MGR_META[toolKey] ? TOOL_MGR_META[toolKey].label : toolKey} ${isEnabled ? 'enabled' : 'disabled'}`);
    renderToolsManager();
  } catch (e) {
    console.error('[ToolsManager] toggle failed:', e);
    toast('Could not update tool status');
    renderToolsManager(); // revert the checkbox visually by re-rendering from source of truth
  }
}

async function toolMgrEditMessage(toolKey) {
  if (!_supabase) return;
  const { data } = await _supabase.from('tool_settings').select('disabled_message').eq('tool_key', toolKey).single();
  const current = (data && data.disabled_message) || 'This tool is temporarily unavailable. Please check back soon.';
  const next = prompt('Message shown to users when this tool is disabled:', current);
  if (next === null) return; // cancelled
  try {
    const { error } = await _supabase.from('tool_settings').update({ disabled_message: next }).eq('tool_key', toolKey);
    if (error) throw error;
    toast('Disabled message updated');
  } catch (e) {
    console.error('[ToolsManager] message update failed:', e);
    toast('Could not update message');
  }
}


/* ════════════════════════════════════════════════════
   COMMUNITY MODULE
════════════════════════════════════════════════════ */

let commThreads = [];
let commReports = [];
let commComments = [];
let _commLoaded = false;

async function loadCommunityData() {
  const sb = window._supabase;
  if (!sb) return;

  try {
    const [threadsRes, reportsRes, repliesRes] = await Promise.all([
      sb.from('community_threads').select('id, title, category, status, votes, created_at, user_id').order('created_at', { ascending: false }),
      sb.from('community_reports').select('id, thread_id, reply_id, reason, status, created_at, reporter_id, thread:community_threads(title), reply:community_replies(body)').order('created_at', { ascending: false }),
      sb.from('community_replies').select('id, body, status, created_at, thread_id, user_id').order('created_at', { ascending: false })
    ]);

    if (threadsRes.error) throw threadsRes.error;

    // Reply counts per thread
    const { data: allReplies } = await sb.from('community_replies').select('thread_id');
    const replyCounts = {};
    (allReplies || []).forEach(r => { replyCounts[r.thread_id] = (replyCounts[r.thread_id]||0) + 1; });

    // Collect all user_ids we need names for (threads + replies authors)
    const allUserIds = [...new Set([
      ...(threadsRes.data || []).map(t => t.user_id),
      ...(repliesRes.data || []).map(r => r.user_id)
    ].filter(Boolean))];
    let userMap = {};
    if (allUserIds.length) {
      const { data: userProfiles } = await sb.from('profiles').select('id, username, full_name').in('id', allUserIds);
      (userProfiles || []).forEach(p => { userMap[p.id] = p.username || p.full_name || 'Anonymous'; });
    }

    // Thread titles needed for comment queue display
    const threadTitleMap = {};
    (threadsRes.data || []).forEach(t => { threadTitleMap[t.id] = t.title; });

    commThreads = (threadsRes.data || []).map(t => ({
      id: t.id,
      title: t.title,
      author: userMap[t.user_id] || 'Anonymous',
      category: t.category,
      replies: replyCounts[t.id] || 0,
      votes: t.votes || 0,
      date: (t.created_at||'').slice(0,10),
      status: t.status
    }));

    if (!reportsRes.error) {
      const reporterIds = [...new Set((reportsRes.data || []).map(r => r.reporter_id).filter(Boolean))];
      let reporterMap = {};
      if (reporterIds.length) {
        const { data: reporterProfiles } = await sb.from('profiles').select('id, username, full_name').in('id', reporterIds);
        (reporterProfiles || []).forEach(p => { reporterMap[p.id] = p.username || p.full_name || 'Unknown'; });
      }
      commReports = (reportsRes.data || []).map(r => ({
        id: r.id,
        content: r.thread ? ('Thread: ' + r.thread.title) : (r.reply ? ('Comment: ' + (r.reply.body||'').slice(0,60)) : 'Deleted content'),
        type: r.thread_id ? 'thread' : 'comment',
        reportedBy: reporterMap[r.reporter_id] || 'Unknown',
        reason: r.reason || '-',
        date: (r.created_at||'').slice(0,10),
        status: r.status
      }));
    }

    if (!repliesRes.error) {
      commComments = (repliesRes.data || []).map(c => ({
        id: c.id,
        text: c.body,
        author: userMap[c.user_id] || 'Anonymous',
        thread: threadTitleMap[c.thread_id] || 'Unknown thread',
        date: (c.created_at||'').slice(0,10),
        status: c.status
      }));
    }

    _commLoaded = true;
  } catch (e) {
    console.error('[Admin] loadCommunityData error:', e);
    toast('Could not load community data', 'error');
  }
}

async function renderCommunity() {
  if (!_commLoaded) await loadCommunityData();
  updateCommStats();
  commTab('threads');
}

function updateCommStats() {
  document.getElementById('commTotalThreads').textContent = commThreads.length;
  document.getElementById('commOpenThreads').textContent = commThreads.filter(t => t.status === 'open').length + ' open';
  const openRep = commReports.filter(r => r.status === 'open').length;
  document.getElementById('commOpenReports').textContent = openRep;
  const uniqueAuthors = new Set(commThreads.map(t=>t.author)).size;
  document.getElementById('commActiveUsers').textContent = uniqueAuthors;
  const pendingCom = commComments.filter(c => c.status === 'pending').length;
  document.getElementById('commPendingComments').textContent = pendingCom;
  const badge = document.getElementById('commBadge');
  const total = openRep + pendingCom;
  if (badge) {
    if (total > 0) { badge.textContent = total; badge.style.display = ''; }
    else badge.style.display = 'none';
  }
}

function commTab(tab) {
  ['threads','reports','comments'].forEach(t => {
    document.getElementById('commPanel-' + t).style.display = t === tab ? '' : 'none';
    const btn = document.getElementById('tab-' + t);
    if (btn) {
      btn.style.color = t === tab ? 'var(--text)' : 'var(--text-dim)';
      btn.style.borderBottom = t === tab ? '2px solid var(--red)' : '2px solid transparent';
      btn.style.fontWeight = t === tab ? '500' : '400';
    }
  });
  if (tab === 'threads') filterThreads();
  if (tab === 'reports') filterReports();
  if (tab === 'comments') filterComments();
}

function filterThreads() {
  const q = (document.getElementById('commThreadSearch').value || '').toLowerCase();
  const st = document.getElementById('commThreadStatus').value;
  const cat = document.getElementById('commThreadCategory').value;
  const filtered = commThreads.filter(t =>
    AdminAI.match('threads', q, [t.title, t.author, t.category]) &&
    (!st || t.status === st) &&
    (!cat || t.category === cat)
  );
  document.getElementById('commThreadCount').textContent = filtered.length + ' threads';
  const statusColor = { open:'var(--green)', locked:'#ef4444', pinned:'var(--blue)' };
  document.getElementById('commThreadTbody').innerHTML = filtered.map(t => `
    <tr>
      <td style="max-width:220px;"><span style="font-weight:500;color:var(--text);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtmlAdm(t.title)}</span></td>
      <td><span style="color:var(--red);font-size:11px;">@${escHtmlAdm(t.author)}</span></td>
      <td><span style="background:var(--surface2);padding:2px 8px;border-radius:10px;font-size:10px;">${t.category}</span></td>
      <td>${t.replies}</td>
      <td style="color:${t.votes >= 0 ? 'var(--green)' : '#ef4444'}">${t.votes > 0 ? '+' : ''}${t.votes}</td>
      <td style="color:var(--text-dim);font-size:11px;">${t.date}</td>
      <td><span style="color:${statusColor[t.status] || 'var(--text-dim)'};font-size:11px;font-weight:500;">${t.status}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          ${t.status !== 'pinned' ? `<button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="commPinThread('${t.id}')">Pin</button>` : `<button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="commUnpinThread('${t.id}')">Unpin</button>`}
          ${t.status !== 'locked' ? `<button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="commLockThread('${t.id}')">Lock</button>` : `<button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="commUnlockThread('${t.id}')">Unlock</button>`}
          <button class="btn" style="padding:3px 8px;font-size:10px;background:#ef4444;" onclick="commDeleteThread('${t.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function _commUpdateThreadStatus(id, status) {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { error } = await sb.from('community_threads').update({ status }).eq('id', id);
    if (error) throw error;
    const t = commThreads.find(x => x.id === id);
    if (t) t.status = status;
    filterThreads();
    updateCommStats();
  } catch (e) {
    toast('Could not update thread', 'error');
  }
}

function commPinThread(id)   { _commUpdateThreadStatus(id, 'pinned'); }
function commUnpinThread(id) { _commUpdateThreadStatus(id, 'open'); }
function commLockThread(id)  { _commUpdateThreadStatus(id, 'locked'); }
function commUnlockThread(id){ _commUpdateThreadStatus(id, 'open'); }

async function commDeleteThread(id) {
  if (!confirm('Delete this thread? This cannot be undone.')) return;
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { error } = await sb.from('community_threads').delete().eq('id', id);
    if (error) throw error;
    commThreads = commThreads.filter(x => x.id !== id);
    filterThreads();
    updateCommStats();
    toast('Thread deleted');
  } catch (e) {
    toast('Could not delete thread', 'error');
  }
}

function filterReports() {
  const st = document.getElementById('commReportFilter').value;
  const tp = document.getElementById('commReportType').value;
  const filtered = commReports.filter(r =>
    (!st || r.status === st) && (!tp || r.type === tp)
  );
  document.getElementById('commReportCount').textContent = filtered.length + ' reports';
  const statusColor = { open:'#f59e0b', resolved:'var(--green)', dismissed:'var(--text-dim)' };
  document.getElementById('commReportTbody').innerHTML = filtered.map(r => `
    <tr>
      <td style="max-width:200px;"><span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;">${escHtmlAdm(r.content)}</span></td>
      <td><span style="background:var(--surface2);padding:2px 7px;border-radius:10px;font-size:10px;">${r.type}</span></td>
      <td style="color:var(--red);font-size:11px;">@${escHtmlAdm(r.reportedBy)}</td>
      <td style="font-size:11px;">${escHtmlAdm(r.reason)}</td>
      <td style="color:var(--text-dim);font-size:11px;">${r.date}</td>
      <td><span style="color:${statusColor[r.status]||'var(--text-dim)'};font-size:11px;font-weight:500;">${r.status}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          ${r.status === 'open' ? `
            <button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="commResolveReport('${r.id}')">Resolve</button>
            <button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="commDismissReport('${r.id}')">Dismiss</button>
          ` : '-'}
        </div>
      </td>
    </tr>
  `).join('');
}

async function _commUpdateReportStatus(id, status) {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { error } = await sb.from('community_reports').update({ status }).eq('id', id);
    if (error) throw error;
    const r = commReports.find(x => x.id === id);
    if (r) r.status = status;
    filterReports();
    updateCommStats();
  } catch (e) {
    toast('Could not update report', 'error');
  }
}

function commResolveReport(id) { _commUpdateReportStatus(id, 'resolved'); }
function commDismissReport(id) { _commUpdateReportStatus(id, 'dismissed'); }

function filterComments() {
  const q = (document.getElementById('commCommentSearch').value || '').toLowerCase();
  const st = document.getElementById('commCommentStatus').value;
  const filtered = commComments.filter(c =>
    AdminAI.match('comments', q, [c.text, c.author, c.thread]) &&
    (!st || c.status === st)
  );
  document.getElementById('commCommentCount').textContent = filtered.length + ' comments';
  const statusColor = { pending:'#f59e0b', approved:'var(--green)', rejected:'#ef4444' };
  document.getElementById('commCommentTbody').innerHTML = filtered.map(c => `
    <tr>
      <td style="max-width:220px;font-size:11px;">"${escHtmlAdm(c.text.length > 80 ? c.text.substring(0,80)+'…' : c.text)}"</td>
      <td style="color:var(--red);font-size:11px;">@${escHtmlAdm(c.author)}</td>
      <td style="font-size:11px;color:var(--text-dim);">${escHtmlAdm(c.thread)}</td>
      <td style="color:var(--text-dim);font-size:11px;">${c.date}</td>
      <td><span style="color:${statusColor[c.status]};font-size:11px;font-weight:500;">${c.status}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          ${c.status === 'pending' ? `
            <button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;color:var(--green);" onclick="commApproveComment('${c.id}')">Approve</button>
            <button class="btn" style="padding:3px 8px;font-size:10px;background:#ef4444;" onclick="commRejectComment('${c.id}')">Reject</button>
          ` : c.status === 'approved' ? `
            <button class="btn" style="padding:3px 8px;font-size:10px;background:#ef4444;" onclick="commRejectComment('${c.id}')">Reject</button>
          ` : '-'}
        </div>
      </td>
    </tr>
  `).join('');
}

async function _commUpdateCommentStatus(id, status) {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { error } = await sb.from('community_replies').update({ status }).eq('id', id);
    if (error) throw error;
    const c = commComments.find(x => x.id === id);
    if (c) c.status = status;
    filterComments();
    updateCommStats();
  } catch (e) {
    toast('Could not update comment', 'error');
  }
}

function commApproveComment(id) { _commUpdateCommentStatus(id, 'approved'); }
function commRejectComment(id)  { _commUpdateCommentStatus(id, 'rejected'); }


/* ════════════════════════════════════════════════════
   BLOG MANAGER
════════════════════════════════════════════════════ */

let blogPosts = [];
let blogCategories = ['Tutorial', 'News', 'CTF', 'Tools', 'Career'];
let editingBlogId = null;
let _blogLoaded = false;

async function renderBlog() {
  const tbody = document.getElementById('blogTbody');
  if (tbody && !_blogLoaded) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:24px;">Loading posts...</td></tr>';
  await loadBlogPosts();
  await loadBlogCategories();
  updateBlogStats();
  filterBlogPosts();
  renderBlogCategories();
}

async function loadBlogPosts() {
  const sb = window._supabase;
  if (!sb) { _blogLoaded = true; return; }
  try {
    const { data, error } = await sb
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    blogPosts = (data || []).map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      tags: p.tags || [],
      content: p.content || '',
      views: p.views || 0,
      status: p.status,
      publishDate: p.publish_date ? p.publish_date.slice(0,16) : '',
      image: p.image || '',
      metaTitle: p.meta_title || '',
      metaDesc: p.meta_desc || '',
    }));
    _blogLoaded = true;
  } catch (e) {
    console.error('[Admin] loadBlogPosts error:', e);
    toast('Could not load blog posts', 'error');
    _blogLoaded = true;
  }
}

async function loadBlogCategories() {
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { data, error } = await sb.from('blog_categories').select('*').order('name');
    if (error) throw error;
    if (data && data.length) blogCategories = data.map(c => c.name);
  } catch (e) {
    console.warn('[Admin] loadBlogCategories error:', e);
  }
}

function updateBlogStats() {

  document.getElementById('blogTotalPosts').textContent = blogPosts.length;
  const pub = blogPosts.filter(p => p.status === 'published').length;
  document.getElementById('blogPublishedCount').textContent = pub + ' published';
  document.getElementById('blogDraftCount').textContent = blogPosts.filter(p => p.status === 'draft').length;
  document.getElementById('blogTotalViews').textContent = blogPosts.reduce((s,p) => s + p.views, 0).toLocaleString();
  document.getElementById('blogCategories').textContent = blogCategories.length;
}

function filterBlogPosts() {
  const q = (document.getElementById('blogSearch').value || '').toLowerCase();
  const st = document.getElementById('blogStatusFilter').value;
  const cat = document.getElementById('blogCategoryFilter').value;
  const filtered = blogPosts.filter(p =>
    AdminAI.match('blog', q, [p.title, (p.tags || []).join(' '), p.category]) &&
    (!st || p.status === st) &&
    (!cat || p.category === cat)
  );
  document.getElementById('blogPostCount').textContent = filtered.length + ' posts';
  const statusColor = { published:'var(--green)', draft:'var(--text-dim)', scheduled:'#f59e0b' };
  const statusIcon = {
    published: '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 6l2 2 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    draft: '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M7.5 1.5l3 3L4 11H1V8L7.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    scheduled: '<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M6 3v3.5l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  document.getElementById('blogTbody').innerHTML = filtered.map(p => `
    <tr>
      <td style="max-width:220px;">
        <span style="font-weight:500;color:var(--text);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.title}</span>
        <span style="font-size:10px;color:var(--text-dim);">${p.slug}</span>
      </td>
      <td><span style="background:var(--surface2);padding:2px 8px;border-radius:10px;font-size:10px;">${p.category}</span></td>
      <td style="font-size:10px;color:var(--text-dim);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.tags.join(', ') || 'None'}</td>
      <td>${p.views.toLocaleString()}</td>
      <td style="color:var(--text-dim);font-size:11px;">${p.publishDate ? p.publishDate.slice(0,10) : 'Not set'}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:4px;color:${statusColor[p.status]};font-size:11px;font-weight:500;">
          ${statusIcon[p.status] || ''} ${p.status}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:6px;">
          ${p.status !== 'published' ? `<button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="publishBlogPost(${p.id})">Publish</button>` : `<button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="unpublishBlogPost(${p.id})">Unpublish</button>`}
          <button class="btn btn-ghost" style="padding:3px 8px;font-size:10px;" onclick="openBlogModal(${p.id})">Edit</button>
          <button class="btn" style="padding:3px 8px;font-size:10px;background:#ef4444;" onclick="deleteBlogPost(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:24px;">No posts found</td></tr>';
}

function renderBlogCategories() {
  document.getElementById('blogCatList').innerHTML = blogCategories.map((c,i) => `
    <span style="display:inline-flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--border);padding:4px 12px;border-radius:20px;font-size:11px;">
      ${c}
      <button onclick="removeBlogCategory(${i})" style="background:none;border:none;color:var(--text-dim);cursor:pointer;padding:0;line-height:1;font-size:13px;">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </span>
  `).join('');
}

function openBlogModal(id) {
  editingBlogId = id;
  if (id) {
    const p = blogPosts.find(x => String(x.id) === String(id));
    if (!p) return;
    document.getElementById('blogModalTitle').textContent = 'Edit Post';
    document.getElementById('blogTitle').value = p.title;
    document.getElementById('blogSlug').value = p.slug;
    document.getElementById('blogCat').value = p.category;
    document.getElementById('blogStatus').value = p.status;
    document.getElementById('blogPublishDate').value = p.publishDate || '';
    document.getElementById('blogTags').value = p.tags.join(', ');
    document.getElementById('blogImage').value = p.image || '';
    document.getElementById('blogContent').value = p.content || '';
    document.getElementById('blogMetaTitle').value = p.metaTitle || '';
    document.getElementById('blogMetaDesc').value = p.metaDesc || '';
  } else {
    document.getElementById('blogModalTitle').textContent = 'New Post';
    document.getElementById('blogTitle').value = '';
    document.getElementById('blogSlug').value = '';
    document.getElementById('blogCat').value = 'tutorial';
    document.getElementById('blogStatus').value = 'draft';
    document.getElementById('blogPublishDate').value = '';
    document.getElementById('blogTags').value = '';
    document.getElementById('blogImage').value = '';
    document.getElementById('blogContent').value = '';
    document.getElementById('blogMetaTitle').value = '';
    document.getElementById('blogMetaDesc').value = '';
  }
  toggleBlogSchedule();
  openModal('blogPostModal');
}

function toggleBlogSchedule() {
  const v = document.getElementById('blogStatus').value;
  document.getElementById('blogScheduleField').style.display = v === 'scheduled' ? '' : 'none';
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

async function saveBlogPost() {
  const sb = window._supabase;
  if (!sb) { toast('Not connected to database', 'error'); return; }

  const title = document.getElementById('blogTitle').value.trim();
  if (!title) { toast('Enter a post title', 'error'); return; }
  const slug = document.getElementById('blogSlug').value.trim() || slugify(title);
  const category = document.getElementById('blogCat').value;
  const status = document.getElementById('blogStatus').value;
  const publishDateRaw = document.getElementById('blogPublishDate').value;
  const tags = document.getElementById('blogTags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const image = document.getElementById('blogImage').value.trim();
  const content = document.getElementById('blogContent').value;
  const metaTitle = document.getElementById('blogMetaTitle').value.trim();
  const metaDesc = document.getElementById('blogMetaDesc').value.trim();

  // published posts with no explicit date get "now"; scheduled posts need one
  let publish_date = publishDateRaw ? new Date(publishDateRaw).toISOString() : null;
  if (status === 'published' && !publish_date) publish_date = new Date().toISOString();
  if (status === 'scheduled' && !publish_date) { toast('Set a publish date for scheduled posts', 'error'); return; }

  const row = {
    title, slug, category, status, tags, image, content,
    meta_title: metaTitle, meta_desc: metaDesc, publish_date
  };

  const saveBtn = document.querySelector('#blogPostModal .btn:not(.btn-ghost)');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

  try {
    let error;
    if (editingBlogId) {
      ({ error } = await sb.from('blog_posts').update(row).eq('id', editingBlogId));
      if (error) throw error;
      toast(`"${title}" updated`);
    } else {
      ({ error } = await sb.from('blog_posts').insert(row));
      if (error) throw error;
      toast(`"${title}" created`);
    }
    closeModal('blogPostModal');
    editingBlogId = null;
    _blogLoaded = false;
    await renderBlog();
  } catch (e) {
    console.error('[Admin] saveBlogPost error:', e);
    const msg = e.message && e.message.includes('duplicate') ? 'That slug is already in use' : ('Could not save post: ' + e.message);
    toast(msg, 'error');
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Post'; }
  }
}

async function publishBlogPost(id) {
  const sb = window._supabase;
  const p = blogPosts.find(x => String(x.id) === String(id));
  if (!p || !sb) return;
  try {
    const { error } = await sb.from('blog_posts')
      .update({ status: 'published', publish_date: p.publishDate ? new Date(p.publishDate).toISOString() : new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    toast(`"${p.title}" published`);
    _blogLoaded = false;
    await renderBlog();
  } catch (e) {
    toast('Could not publish: ' + e.message, 'error');
  }
}

async function unpublishBlogPost(id) {
  const sb = window._supabase;
  const p = blogPosts.find(x => String(x.id) === String(id));
  if (!p || !sb) return;
  try {
    const { error } = await sb.from('blog_posts').update({ status: 'draft' }).eq('id', id);
    if (error) throw error;
    toast(`"${p.title}" moved to drafts`);
    _blogLoaded = false;
    await renderBlog();
  } catch (e) {
    toast('Could not update: ' + e.message, 'error');
  }
}

async function deleteBlogPost(id) {
  const sb = window._supabase;
  const p = blogPosts.find(x => String(x.id) === String(id));
  if (!confirm(`Delete "${p ? p.title : 'this post'}"? This cannot be undone.`)) return;
  if (!sb) return;
  try {
    const { error } = await sb.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    blogPosts = blogPosts.filter(x => String(x.id) !== String(id));
    filterBlogPosts();
    updateBlogStats();
    toast('Post deleted');
  } catch (e) {
    toast('Could not delete post: ' + e.message, 'error');
  }
}

function openBlogCatModal() { document.getElementById('newCatName').value=''; openModal('blogCatModal'); }

async function addBlogCategory() {
  const sb = window._supabase;
  const name = document.getElementById('newCatName').value.trim();
  if (!name) { toast('Enter a category name','error'); return; }
  if (blogCategories.some(c => c.toLowerCase() === name.toLowerCase())) { toast('Already exists','error'); return; }
  if (!sb) { toast('Not connected to database', 'error'); return; }
  try {
    const { error } = await sb.from('blog_categories').insert({ name });
    if (error) throw error;
    blogCategories.push(name);
    renderBlogCategories();
    updateBlogStats();
    closeModal('blogCatModal');
    toast(`Category "${name}" added`);
  } catch (e) {
    toast('Could not add category: ' + e.message, 'error');
  }
}

async function removeBlogCategory(i) {
  const sb = window._supabase;
  const name = blogCategories[i];
  if (!name) return;
  if (!confirm(`Remove category "${name}"? Existing posts keep this value but it will disappear from filters.`)) return;
  if (!sb) return;
  try {
    const { error } = await sb.from('blog_categories').delete().eq('name', name);
    if (error) throw error;
    blogCategories.splice(i, 1);
    renderBlogCategories();
    updateBlogStats();
  } catch (e) {
    toast('Could not remove category: ' + e.message, 'error');
  }
}

// ════════════════════════════════════════
// PUBLIC PROFILES
// ════════════════════════════════════════
let activeProfileUser = null;

let _profileSearchTimer = null;
function searchProfiles() {
  clearTimeout(_profileSearchTimer);
  const q = document.getElementById('profileSearch').value.trim();
  const box = document.getElementById('profileSuggestions');
  if (!q) { box.innerHTML=''; return; }
  box.innerHTML = '<span style="font-size:12px;color:var(--text-dim);">Searching…</span>';
  _profileSearchTimer = setTimeout(() => _searchProfilesNow(q), 300);
}

// The typed text plus any AI keywords for it, as one PostgREST or() filter.
function _profileOrFilter(q) {
  const terms = [q].concat(AdminAI.keywords('profiles', q));
  return terms.map(t => {
    const e = escPostgrestFilter(t);
    return `full_name.ilike.%${e}%,username.ilike.%${e}%`;
  }).join(',');
}

async function _searchProfilesNow(q) {
  const box = document.getElementById('profileSuggestions');
  if (!_supabase) { box.innerHTML = '<span style="font-size:12px;color:var(--text-dim);">Not connected to database.</span>'; return; }

  try {
    const { data, error } = await _supabase
      .from('profiles')
      .select('id, full_name, username, role, is_banned')
      .or(_profileOrFilter(q))
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) { box.innerHTML='<span style="font-size:12px;color:var(--text-dim);">No users found</span>'; return; }

    box.innerHTML = data.map(u => {
      const name = u.full_name || u.username || 'Unknown';
      const status = u.is_banned ? 'banned' : 'active';
      return `
      <div onclick="loadProfile('${u.id}')" style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 12px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:10px;">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:11px;flex-shrink:0;">${escHtmlAdm(name[0] || '?')}</div>
        <div><div style="color:var(--text);font-weight:500;">${escHtmlAdm(name)}</div><div style="color:var(--text-dim);font-size:11px;">${escHtmlAdm(u.username || '-')}</div></div>
        <span style="margin-left:auto;font-size:10px;padding:2px 7px;border-radius:10px;background:${status==='active'?'#10b98120':'#ef444420'};color:${status==='active'?'#10b981':'#ef4444'}">${status}</span>
      </div>`;
    }).join('');
  } catch(e) {
    console.error('[Admin] Profile search error:', e);
    box.innerHTML = '<span style="font-size:12px;color:var(--text-dim);">Search failed.</span>';
  }
}

async function loadProfile(id) {
  if (!_supabase) { toast('Not connected to database', 'error'); return; }

  document.getElementById('profileEmpty').style.display = 'none';
  document.getElementById('profileCard').style.display = 'block';
  document.getElementById('profileSearch').value = '';
  document.getElementById('profileSuggestions').innerHTML = '';

  // Loading placeholders
  document.getElementById('profileName').textContent = 'Loading…';
  document.getElementById('profileEmail').textContent = '';
  ['profileXP','profileLevel','profileCTFSolves'].forEach(elId => {
    document.getElementById(elId).textContent = '-';
  });

  try {
    const { data: u, error } = await _supabase
      .from('profiles')
      .select('id, full_name, username, role, is_banned, xp, level, ctf_solves, last_login_ip, created_at')
      .eq('id', id)
      .single();

    if (error || !u) { toast('Could not load profile: ' + (error?.message || 'not found'), 'error'); return; }

    activeProfileUser = u;
    const name = u.full_name || u.username || 'Unknown';

    document.getElementById('profileAvatar').textContent = name[0] || '?';
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = u.username || '';
    document.getElementById('profileRole').innerHTML = `<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#6366f120;color:#818cf8;">${escHtmlAdm(u.role || 'user')}</span>`;
    document.getElementById('profileLastIP').textContent = u.last_login_ip ? `Last login IP: ${u.last_login_ip}` : 'Last login IP: unknown';
    document.getElementById('profileXP').textContent = (u.xp || 0).toLocaleString();
    document.getElementById('profileLevel').textContent = u.level || 1;
    document.getElementById('profileCTFSolves').textContent = u.ctf_solves || 0;

    const suspendLabel = u.is_banned ? 'Unsuspend' : 'Suspend';
    document.getElementById('profileSuspendBtn').textContent = suspendLabel;
    const btn2 = document.getElementById('profileSuspendBtn2');
    if (btn2 && btn2.childNodes[2]) btn2.childNodes[2].textContent = ' ' + suspendLabel + ' User';

    // Heatmap placeholder while we fetch real activity
    const hm = document.getElementById('profileHeatmap');
    hm.innerHTML = '<div style="font-size:11px;color:var(--text-dim);">Loading…</div>';

    // CTF solve history, real from ctf_solves + ctf_challenges
    const ctfTbody = document.getElementById('profileCTFTbody');
    ctfTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-dim);">Loading…</td></tr>';
    const { data: solves, error: solveErr } = await _supabase
      .from('ctf_solves')
      .select('points_earned, solved_at, ctf_challenges(title, category)')
      .eq('user_id', id)
      .eq('correct', true)
      .order('solved_at', { ascending: false });

    if (solveErr || !solves || solves.length === 0) {
      ctfTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-dim);">No CTF solves yet</td></tr>';
    } else {
      ctfTbody.innerHTML = solves.map(s => {
        const ch = s.ctf_challenges;
        const dateStr = s.solved_at ? new Date(s.solved_at).toLocaleDateString() : '-';
        return `<tr><td>${escHtmlAdm(ch?.title || 'Unknown')}</td><td><span class="badge">${escHtmlAdm(ch?.category || '-')}</span></td><td style="color:#f59e0b;font-weight:600;">${s.points_earned || 0}</td><td style="color:var(--text-dim);font-size:12px;">${dateStr}</td></tr>`;
      }).join('');
    }

    // Activity heatmap, real: combines chapter_progress.viewed_at (reading
    // activity) + ctf_solves.solved_at (lab activity) over the last 12 weeks.
    const { data: progressRows } = await _supabase
      .from('chapter_progress')
      .select('viewed_at')
      .eq('user_id', id);

    const activityDates = {};
    (progressRows || []).forEach(r => {
      if (!r.viewed_at) return;
      const k = r.viewed_at.slice(0, 10);
      activityDates[k] = (activityDates[k] || 0) + 1;
    });
    (solves || []).forEach(s => {
      if (!s.solved_at) return;
      const k = s.solved_at.slice(0, 10);
      activityDates[k] = (activityDates[k] || 0) + 1;
    });

    hm.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = 12 * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (totalDays - 1) - today.getDay());

    const heatColors = ['#1a1a2e', '#3730a3', '#4f46e5', '#6366f1', '#818cf8'];
    for (let w = 0; w < 12; w++) {
      const col = document.createElement('div');
      col.style.cssText = 'display:flex;flex-direction:column;gap:3px;';
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + w * 7 + d);
        const key = cellDate.toISOString().slice(0, 10);
        const count = activityDates[key] || 0;
        const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;
        const cell = document.createElement('div');
        const isFuture = cellDate > today;
        cell.style.cssText = `width:10px;height:10px;border-radius:2px;background:${isFuture ? 'transparent' : heatColors[level]};${level === 0 && !isFuture ? 'border:1px solid var(--border);' : ''}`;
        cell.title = isFuture ? '' : `${key}: ${count} activit${count === 1 ? 'y' : 'ies'}`;
        col.appendChild(cell);
      }
      hm.appendChild(col);
    }

    // Certificates, no certificates table exists yet
    document.getElementById('profileCerts').innerHTML =
      '<div style="font-size:12px;color:var(--text-dim);">Certificate tracking not set up yet.</div>';

    // Course progress, real: chapter_progress rows (distinct chapters viewed)
    // grouped by course, against content_chapters counts per course.
    document.getElementById('profileCourseProgress').innerHTML =
      '<div style="font-size:12px;color:var(--text-dim);">Loading…</div>';

    const [{ data: progByCourse }, { data: allChapters }, { data: coursesList }] = await Promise.all([
      _supabase.from('chapter_progress').select('course, chapter_slug').eq('user_id', id),
      _supabase.from('content_chapters').select('course, slug').eq('enabled', true),
      _supabase.from('courses').select('course_key, title')
    ]);

    const totalByCourse = {};
    (allChapters || []).forEach(c => { totalByCourse[c.course] = (totalByCourse[c.course] || 0) + 1; });

    const doneByCourse = {};
    (progByCourse || []).forEach(p => {
      if (!doneByCourse[p.course]) doneByCourse[p.course] = new Set();
      doneByCourse[p.course].add(p.chapter_slug);
    });

    const courseTitles = {};
    (coursesList || []).forEach(c => { courseTitles[c.course_key] = c.title; });

    const courseKeys = Object.keys(totalByCourse);
    if (courseKeys.length === 0) {
      document.getElementById('profileCourseProgress').innerHTML =
        '<div style="font-size:12px;color:var(--text-dim);">No courses configured yet.</div>';
    } else {
      document.getElementById('profileCourseProgress').innerHTML = courseKeys.map(key => {
        const total = totalByCourse[key] || 0;
        const done = doneByCourse[key] ? doneByCourse[key].size : 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const title = courseTitles[key] || key;
        return `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px;">
            <span style="color:var(--text);">${escHtmlAdm(title)}</span>
            <span style="color:var(--text-dim);">${done}/${total}</span>
          </div>
          <div style="height:6px;border-radius:3px;background:var(--bg3);overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:3px;"></div>
          </div>
        </div>`;
      }).join('');
    }

  } catch(e) {
    console.error('[Admin] loadProfile error:', e);
    toast('Failed to load profile', 'error');
  }
}

async function profileSuspend() {
  if (!activeProfileUser || !_supabase) return;
  const newBan = !activeProfileUser.is_banned;
  const { error } = await _supabase.from('profiles')
    .update({ is_banned: newBan })
    .eq('id', activeProfileUser.id);
  if (error) { toast('Could not update status: ' + error.message, 'error'); return; }

  activeProfileUser.is_banned = newBan;
  const label = newBan ? 'Unsuspend' : 'Suspend';
  document.getElementById('profileSuspendBtn').textContent = label;
  const btn2 = document.getElementById('profileSuspendBtn2');
  if (btn2 && btn2.childNodes[2]) btn2.childNodes[2].textContent = ' ' + label + ' User';
  const name = activeProfileUser.full_name || activeProfileUser.username || 'User';
  toast(newBan ? `${name} suspended` : `${name} unsuspended`);
}

async function openAwardXPModal() {
  if (!activeProfileUser || !_supabase) return;
  const amt = prompt(`Award XP to ${activeProfileUser.full_name || activeProfileUser.username}:\nEnter amount:`);
  if (!amt || isNaN(amt)) return;
  const delta = parseInt(amt);
  const newXP = Math.max(0, (activeProfileUser.xp || 0) + delta);
  const newLevel = Math.max(1, Math.floor(newXP / 500) + 1);

  const { error } = await _supabase.from('profiles')
    .update({ xp: newXP, level: newLevel })
    .eq('id', activeProfileUser.id);
  if (error) { toast('Could not award XP: ' + error.message, 'error'); return; }

  activeProfileUser.xp = newXP;
  activeProfileUser.level = newLevel;
  document.getElementById('profileXP').textContent = newXP.toLocaleString();
  document.getElementById('profileLevel').textContent = newLevel;
  toast(`${delta >= 0 ? '+' : ''}${delta} XP awarded to ${activeProfileUser.full_name || activeProfileUser.username}`);
}

// ════════════════════════════════════════
// MODERATION PANEL
// ════════════════════════════════════════
const modReports = [
  {id:1,content:'Comment: "This tutorial is garbage…"',reporter:'Rahul Sharma',type:'abuse',date:'2026-06-12',status:'open'},
  {id:2,content:'Thread: "Free premium accounts here"',reporter:'Priya Mehta',type:'spam',date:'2026-06-11',status:'open'},
  {id:3,content:'Post: "XSS doesn\'t actually work"',reporter:'Arjun Nair',type:'misinformation',date:'2026-06-10',status:'escalated'},
  {id:4,content:'Comment: "Admin is corrupt"',reporter:'Neha Kapoor',type:'abuse',date:'2026-06-09',status:'resolved'},
  {id:5,content:'Thread: "Download cracked Burp Suite"',reporter:'Rahul Sharma',type:'spam',date:'2026-06-08',status:'dismissed'},
];
const modComments = [
  {id:1,text:'Great explanation of IDOR vulnerabilities!',author:'new_user_01',thread:'IDOR Deep Dive',date:'2026-06-13',status:'pending'},
  {id:2,text:'Can someone share working SQLi payloads?',author:'hax0r99',thread:'SQL Injection Basics',date:'2026-06-13',status:'pending'},
  {id:3,text:'This course changed how I think about security.',author:'CyberNewbie',thread:'General',date:'2026-06-12',status:'approved'},
  {id:4,text:'Admin is biased towards certain students',author:'anon_22',thread:'Feedback',date:'2026-06-11',status:'rejected'},
  {id:5,text:'Loving the CTF challenges, more please!',author:'ctf_fan',thread:'CTF Discussion',date:'2026-06-10',status:'pending'},
];
const modFeedback = [
  {id:1,user:'Rahul Sharma',type:'bug',msg:'Certificate download button not working on mobile',date:'2026-06-12',status:'unread'},
  {id:2,user:'Priya Mehta',type:'suggestion',msg:'Add a dark mode toggle for mobile app',date:'2026-06-11',status:'read'},
  {id:3,user:'Neha Kapoor',type:'complaint',msg:'Course videos buffer too much on slow connections',date:'2026-06-10',status:'unread'},
  {id:4,user:'Arjun Nair',type:'praise',msg:'Best cybersecurity platform in India. Keep it up!',date:'2026-06-09',status:'read'},
];
const modLog = [
  {mod:'Pawan (Admin)',action:'Resolved report',target:'Report #4',time:'2026-06-12 18:30'},
  {mod:'Priya (Mod)',action:'Rejected comment',target:'anon_22 on Feedback',time:'2026-06-11 14:22'},
  {mod:'Priya (Mod)',action:'Dismissed report',target:'Report #5',time:'2026-06-10 09:15'},
  {mod:'Pawan (Admin)',action:'Escalated report',target:'Report #3',time:'2026-06-10 08:00'},
];

let activeModTab = 'reports';

function switchModTab(tab) {
  activeModTab = tab;
  ['reports','comments','feedback','log'].forEach(t => {
    document.getElementById(`modTab-${t}`).classList.toggle('active', t===tab);
    document.getElementById(`modPane-${t}`).style.display = t===tab ? '' : 'none';
  });
}

function renderModReports() {
  const sf = document.getElementById('modRepStatusFilter').value;
  const tf = document.getElementById('modRepTypeFilter').value;
  const rows = modReports.filter(r => (sf==='all'||r.status===sf) && (tf==='all'||r.type===tf));
  const statusColor = {open:'#f59e0b',resolved:'#10b981',dismissed:'#6b7280',escalated:'#ef4444'};
  document.getElementById('modRepTbody').innerHTML = rows.map(r => `
    <tr>
      <td style="max-width:200px;font-size:12px;">${r.content}</td>
      <td>${r.reporter}</td>
      <td><span class="badge">${r.type}</span></td>
      <td style="color:var(--text-dim);font-size:12px;">${r.date}</td>
      <td><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${statusColor[r.status]}20;color:${statusColor[r.status]};">${r.status}</span></td>
      <td>
        ${r.status==='open'||r.status==='escalated' ? `
          <button class="btn-ghost" style="font-size:11px;padding:4px 8px;color:#10b981;" onclick="modAction(${r.id},'resolve')">Resolve</button>
          <button class="btn-ghost" style="font-size:11px;padding:4px 8px;" onclick="modAction(${r.id},'escalate')">Escalate</button>
          <button class="btn-ghost" style="font-size:11px;padding:4px 8px;color:#6b7280;" onclick="modAction(${r.id},'dismiss')">Dismiss</button>
        ` : '<span style="font-size:11px;color:var(--text-dim);">-</span>'}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-dim);">No reports</td></tr>';
  updateModStats();
}

function modAction(id, action) {
  const r = modReports.find(x => x.id===id);
  if (!r) return;
  if (action==='resolve') r.status='resolved';
  else if (action==='escalate') r.status='escalated';
  else if (action==='dismiss') r.status='dismissed';
  modLog.unshift({mod:'Pawan (Admin)',action:`${action.charAt(0).toUpperCase()+action.slice(1)}d report`,target:`Report #${id}`,time:new Date().toISOString().slice(0,16).replace('T',' ')});
  renderModReports();
  toast(`Report #${id} ${action}d`);
}

function renderModComments() {
  const q = document.getElementById('modCommentSearch').value.toLowerCase();
  const f = document.getElementById('modCommentFilter').value;
  const rows = modComments.filter(c => (f==='all'||c.status===f) && AdminAI.match('modcomments', q, [c.text, c.author, c.thread]));
  const statusColor = {pending:'#f59e0b',approved:'#10b981',rejected:'#ef4444'};
  document.getElementById('modCommentTbody').innerHTML = rows.map(c => `
    <tr>
      <td style="max-width:200px;font-size:12px;">${c.text}</td>
      <td>${c.author}</td>
      <td>${c.thread}</td>
      <td style="color:var(--text-dim);font-size:12px;">${c.date}</td>
      <td><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${statusColor[c.status]}20;color:${statusColor[c.status]};">${c.status}</span></td>
      <td>
        ${c.status==='pending' ? `
          <button class="btn-ghost" style="font-size:11px;padding:4px 8px;color:#10b981;" onclick="modCommentAction(${c.id},'approved')">Approve</button>
          <button class="btn-ghost" style="font-size:11px;padding:4px 8px;color:#ef4444;" onclick="modCommentAction(${c.id},'rejected')">Reject</button>
        ` : '<span style="font-size:11px;color:var(--text-dim);">-</span>'}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-dim);">No comments</td></tr>';
  updateModStats();
}

function modCommentAction(id, status) {
  const c = modComments.find(x => x.id===id);
  if (!c) return;
  c.status = status;
  modLog.unshift({mod:'Pawan (Admin)',action:`${status==='approved'?'Approved':'Rejected'} comment`,target:`${c.author} on ${c.thread}`,time:new Date().toISOString().slice(0,16).replace('T',' ')});
  renderModComments();
  toast(`Comment ${status}`);
}

function renderModFeedback() {
  const typeColor = {bug:'#ef4444',suggestion:'#6366f1',complaint:'#f59e0b',praise:'#10b981'};
  document.getElementById('modFeedbackTbody').innerHTML = modFeedback.map(f => `
    <tr>
      <td>${f.user}</td>
      <td><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${typeColor[f.type]}20;color:${typeColor[f.type]};">${f.type}</span></td>
      <td style="max-width:220px;font-size:12px;color:var(--text-dim);">${f.msg}</td>
      <td style="color:var(--text-dim);font-size:12px;">${f.date}</td>
      <td><span style="font-size:11px;color:${f.status==='unread'?'#f59e0b':'var(--text-dim)'};">${f.status}</span></td>
      <td>
        ${f.status==='unread' ? `<button class="btn-ghost" style="font-size:11px;padding:4px 8px;" onclick="markFeedbackRead(${f.id})">Mark Read</button>` : '<span style="font-size:11px;color:var(--text-dim);">-</span>'}
      </td>
    </tr>
  `).join('');
  updateModStats();
}

function markFeedbackRead(id) {
  const f = modFeedback.find(x => x.id===id);
  if (f) { f.status='read'; renderModFeedback(); toast('Marked as read'); }
}

function renderModLog() {
  document.getElementById('modLogTbody').innerHTML = modLog.map(l => `
    <tr>
      <td style="font-weight:500;">${l.mod}</td>
      <td>${l.action}</td>
      <td style="color:var(--text-dim);">${l.target}</td>
      <td style="color:var(--text-dim);font-size:12px;">${l.time}</td>
    </tr>
  `).join('');
}

function updateModStats() {
  document.getElementById('modOpenReports').textContent = modReports.filter(r=>r.status==='open'||r.status==='escalated').length;
  document.getElementById('modPendingComments').textContent = modComments.filter(c=>c.status==='pending').length;
  document.getElementById('modFeedbackCount').textContent = modFeedback.filter(f=>f.status==='unread').length;
  document.getElementById('modActionsToday').textContent = modLog.filter(l=>l.time.startsWith('2026-06-13')).length;
}

// ════════════════════════════════════════
// BACKUP & RESTORE
// ════════════════════════════════════════
let bkSchedule = 'daily';
const bkHistory = [
  {id:'BK-2026-0613',date:'2026-06-13 02:00',size:'4.2 MB',type:'Auto',status:'success'},
  {id:'BK-2026-0612',date:'2026-06-12 02:00',size:'4.1 MB',type:'Auto',status:'success'},
  {id:'BK-2026-0611',date:'2026-06-11 14:30',size:'4.0 MB',type:'Manual',status:'success'},
  {id:'BK-2026-0610',date:'2026-06-10 02:00',size:'3.9 MB',type:'Auto',status:'success'},
  {id:'BK-2026-0607',date:'2026-06-07 02:00',size:'3.7 MB',type:'Auto',status:'failed'},
];

function renderBkHistory() {
  const tbody = document.getElementById('bkHistoryTbody');
  tbody.innerHTML = bkHistory.map(b => `
    <tr>
      <td style="font-family:monospace;font-size:12px;">${b.id}</td>
      <td style="color:var(--text-dim);font-size:12px;">${b.date}</td>
      <td>${b.size}</td>
      <td><span class="badge">${b.type}</span></td>
      <td><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${b.status==='success'?'#10b98120':'#ef444420'};color:${b.status==='success'?'#10b981':'#ef4444'};">${b.status}</span></td>
      <td>
        <button class="btn-ghost" style="font-size:11px;padding:4px 8px;" onclick="downloadBackup('${b.id}')">Download</button>
        ${b.status==='success' ? `<button class="btn-ghost" style="font-size:11px;padding:4px 8px;color:#f59e0b;" onclick="simulateRestore('${b.id}')">Restore</button>` : ''}
      </td>
    </tr>
  `).join('');
  updateBkStats();
}

function updateBkStats() {
  document.getElementById('bkTotalCount').textContent = bkHistory.length;
  const last = bkHistory.find(b=>b.status==='success');
  document.getElementById('bkLastDate').textContent = last ? last.date.split(' ')[0] : '-';
  const totalMB = bkHistory.reduce((s,b)=>s+parseFloat(b.size),0).toFixed(1);
  document.getElementById('bkTotalSize').textContent = totalMB + ' MB';
  document.getElementById('bkScheduleLabel').textContent = bkSchedule.charAt(0).toUpperCase()+bkSchedule.slice(1);
}

function updateBkSchedule(val) {
  bkSchedule = val;
  updateBkStats();
  toast(`Auto-backup schedule set to: ${val}`);
}

function triggerManualBackup() {
  toast('Backup started…');
  setTimeout(() => {
    const id = 'BK-' + new Date().toISOString().slice(0,10).replace(/-/g,'-') + '-MANUAL';
    bkHistory.unshift({id,date:new Date().toISOString().slice(0,16).replace('T',' '),size:'4.3 MB',type:'Manual',status:'success'});
    renderBkHistory();
    toast('Backup complete');
  }, 1500);
}

function downloadBackup(id) {
  const data = JSON.stringify({backup_id:id,platform:'AlexCyberX',timestamp:new Date().toISOString(),note:'Simulated backup snapshot'},null,2);
  const blob = new Blob([data],{type:'application/json'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=id+'.json'; a.click();
  toast(`Downloading ${id}`);
}

function exportData(type) {
  const maps = {
    users:'id,name,email,role,status,xp,level\n1,Rahul Sharma,rahul@example.com,student,active,4200,8',
    progress:'user,course,completion,time_spent\nRahul Sharma,Web Security Fundamentals,100%,14h',
    certs:'cert_id,user,course,issued_date\nCERT-0042,Rahul Sharma,Web Security Fundamentals,2026-04-15',
    full:null
  };
  if (type==='full') {
    const data = JSON.stringify({users:'[...]',progress:'[...]',certs:'[...]',exported_at:new Date().toISOString()},null,2);
    const blob = new Blob([data],{type:'application/json'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='alexcyberx_full_export.json'; a.click();
  } else {
    const blob = new Blob([maps[type]],{type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`alexcyberx_${type}.csv`; a.click();
  }
  toast(`Exporting ${type} data…`);
}

function simulateRestore(id) {
  if (!confirm(`Restore from ${id||'selected backup'}?\n\nThis will overwrite current data. This action cannot be undone.`)) return;
  toast('Restore initiated (simulated)…');
  setTimeout(()=>toast('Restore complete'),2000);
}

// ════════════════════════════════════════
// SUPABASE CONFIG
// ════════════════════════════════════════
const SUPABASE_URL  = 'https://rwjwjltlfkxadywfqxbs.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3andqbHRsZmt4YWR5d2ZxeGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMTY5MzgsImV4cCI6MjA5ODY5MjkzOH0.y_VTm74AdRjejT5b5cHkirctKqbkixrYY4pP4WOG_KM';

const _supabase = (typeof supabase !== 'undefined' &&
  SUPABASE_URL !== 'YOUR_SUPABASE_URL')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        storageKey: 'alexcyberx-admin-auth',
        autoRefreshToken: true,
        persistSession: true
      }
    })
  : null;

window._supabase = _supabase;

// ════════════════════════════════════════
// AUTH, Supabase Login Gate
// ════════════════════════════════════════
(function() {
  const SESSION_KEY  = 'acx_admin_auth';
  const SESSION_TTL  = 2 * 60 * 60 * 1000; // 2 hours
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_SEC  = 30;

  let failCount  = 0;
  let lockoutEnd = 0;
  let lockTimer  = null;

  // ── Real admin identity in topbar (name + avatar), replaces hardcoded name ──
  async function setTopbarAdminIdentity(authUser, sb) {
    const nameEl = document.getElementById('topbarAdminName');
    const avaEl  = document.getElementById('topbarAdminAvatar');
    let displayName = authUser.email;
    try {
      if (sb) {
        const { data: prof } = await sb.from('profiles')
          .select('full_name, username')
          .eq('id', authUser.id)
          .single();
        if (prof && (prof.full_name || prof.username)) {
          displayName = prof.full_name || prof.username;
        }
      }
    } catch (e) {
      console.error('[Admin] setTopbarAdminIdentity error:', e);
    }
    if (nameEl) nameEl.textContent = displayName;
    if (avaEl)  avaEl.textContent  = displayName.trim().charAt(0).toUpperCase() || 'A';
  }

  /* ════════════════════════════════════════════════════
     TOPBAR: real global search (users + content)
  ════════════════════════════════════════════════════ */
  (function initGlobalSearch() {
    const input   = document.getElementById('globalSearch');
    const results = document.getElementById('globalSearchResults');
    if (!input || !results) return;

    let debounceTimer = null;

    function closeResults() {
      results.style.display = 'none';
      results.innerHTML = '';
    }

    function rowHtml(iconSvg, title, subtitle) {
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-bottom:1px solid var(--border);" 
             onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background='none'">
          <div style="width:26px;height:26px;border-radius:7px;background:var(--surface3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">${iconSvg}</div>
          <div style="min-width:0;">
            <div style="font-size:12px;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
            <div style="font-size:10px;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${subtitle}</div>
          </div>
        </div>`;
    }

    const userIcon = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.2" stroke="#b0b0b8" stroke-width="1.1"/><path d="M2 10c0-2 1.8-3.2 4-3.2S10 8 10 10" stroke="#b0b0b8" stroke-width="1.1" stroke-linecap="round"/></svg>';
    const contentIcon = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="1.5" width="8" height="9" rx="1" stroke="#b0b0b8" stroke-width="1.1"/><path d="M4 4h4M4 6h4M4 8h2" stroke="#b0b0b8" stroke-width="1.1" stroke-linecap="round"/></svg>';

    async function runSearch(q) {
      const sb = window._supabase;
      if (!sb) { results.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-dim);">Not connected to database.</div>'; results.style.display = ''; return; }

      results.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-dim);">Searching…</div>';
      results.style.display = '';

      // typed text first, then any AI keywords for this exact text
      const terms = [q].concat(AdminAI.keywords('global', q));

      try {
        const [userRes, chapterRes] = await Promise.all([
          sb.from('profiles')
            .select('id, full_name, username')
            .or(terms.map(t => `full_name.ilike.%${escPostgrestFilter(t)}%,username.ilike.%${escPostgrestFilter(t)}%`).join(','))
            .limit(5),
          sb.from('content_chapters')
            .select('id, title, course')
            .or(terms.map(t => `title.ilike.%${escPostgrestFilter(t)}%`).join(','))
            .limit(5)
        ]);

        const foundUsers = userRes.data || [];
        const foundChapters = chapterRes.data || [];

        if (!foundUsers.length && !foundChapters.length) {
          results.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-dim);">No results for "' + escHtmlAdm(q) + '"</div>';
          return;
        }

        let html = '';
        if (foundUsers.length) {
          html += '<div style="padding:8px 12px 4px;font-size:10px;color:var(--text-dim);font-weight:600;letter-spacing:0.5px;">USERS</div>';
          html += foundUsers.map(u => {
            const name = escHtmlAdm(u.full_name || u.username || 'Unknown');
            return `<div onclick="globalSearchGoToUser('${u.id}')">${rowHtml(userIcon, name, escHtmlAdm(u.username || ''))}</div>`;
          }).join('');
        }
        if (foundChapters.length) {
          html += '<div style="padding:8px 12px 4px;font-size:10px;color:var(--text-dim);font-weight:600;letter-spacing:0.5px;">CONTENT</div>';
          html += foundChapters.map(c => {
            return `<div onclick="globalSearchGoToContent('${escHtmlAdm(c.course || '')}')">${rowHtml(contentIcon, escHtmlAdm(c.title || 'Untitled'), escHtmlAdm(c.course || ''))}</div>`;
          }).join('');
        }
        results.innerHTML = html;
      } catch (e) {
        console.error('[Admin] Global search error:', e);
        results.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-dim);">Search failed.</div>';
      }
    }

    input.addEventListener('input', () => {
      const q = input.value.trim();
      clearTimeout(debounceTimer);
      if (!q) { closeResults(); return; }
      debounceTimer = setTimeout(() => runSearch(q), 250);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim() && results.innerHTML) results.style.display = '';
    });

    // AI search for the topbar: when the AI answers, run the same search again with its keywords
    AdminAI.bind({
      input:    input,
      scope:    'global',
      rerender: () => { const v = input.value.trim(); if (v) runSearch(v); }
    });

    document.addEventListener('click', (e) => {
      if (!document.getElementById('globalSearchWrap').contains(e.target)) closeResults();
    });

    window.globalSearchGoToUser = function(userId) {
      closeResults();
      input.value = '';
      nav('profiles');
      setTimeout(() => {
        if (typeof loadProfile === 'function') loadProfile(userId);
      }, 50);
    };

    window.globalSearchGoToContent = function(course) {
      closeResults();
      input.value = '';
      nav('content');
      setTimeout(() => {
        const filterEl = document.getElementById('courseFilter');
        if (filterEl && course) {
          filterEl.value = course;
          if (typeof renderChapters === 'function') renderChapters();
        }
      }, 50);
    };
  })();

  /* ════════════════════════════════════════════════════
     TOPBAR: real notification bell (recent broadcasts + unread messages)
  ════════════════════════════════════════════════════ */
  window.toggleNotifDropdown = async function(e) {
    e.stopPropagation();
    const dd = document.getElementById('notifDropdown');
    if (!dd) return;
    const opening = dd.style.display === 'none';
    dd.style.display = opening ? '' : 'none';
    if (opening) await loadNotifDropdown();
  };

  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('notifBellWrap');
    const dd = document.getElementById('notifDropdown');
    if (wrap && dd && dd.style.display !== 'none' && !wrap.contains(e.target)) {
      dd.style.display = 'none';
    }
  });

  async function loadNotifDropdown() {
    const dd = document.getElementById('notifDropdown');
    if (!dd) return;
    const sb = window._supabase;
    if (!sb) { dd.innerHTML = '<div style="padding:14px;font-size:12px;color:var(--text-dim);">Not connected to database.</div>'; return; }

    dd.innerHTML = '<div style="padding:14px;font-size:12px;color:var(--text-dim);">Loading…</div>';

    try {
      const [broadcastRes, unreadRes] = await Promise.all([
        sb.from('broadcasts').select('id, title, audience, created_at').order('created_at', { ascending: false }).limit(5),
        sb.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false)
      ]);

      const items = broadcastRes.data || [];
      const unreadMsgs = unreadRes.count || 0;

      let html = '<div style="padding:10px 12px;font-size:11px;font-weight:600;color:var(--white);border-bottom:1px solid var(--border);">Notifications</div>';

      if (unreadMsgs > 0) {
        html += `<div onclick="closeNotifAndGo('messages')" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--border);" onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background='none'">
          <div style="font-size:12px;color:var(--white);">${unreadMsgs} unread contact message${unreadMsgs === 1 ? '' : 's'}</div>
          <div style="font-size:10px;color:var(--text-dim);margin-top:2px;">Click to view inbox</div>
        </div>`;
      }

      if (items.length) {
        html += items.map(b => `
          <div onclick="closeNotifAndGo('notifications')" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--border);" onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background='none'">
            <div style="font-size:12px;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtmlAdm(b.title)}</div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:2px;">${escHtmlAdm(b.audience || '')} · ${pfTimeAgoAdmin(b.created_at)}</div>
          </div>`).join('');
      }

      if (!unreadMsgs && !items.length) {
        html += '<div style="padding:14px;font-size:12px;color:var(--text-dim);">No notifications.</div>';
      }

      dd.innerHTML = html;

      const dot = document.getElementById('notifDot');
      if (dot) dot.style.display = (unreadMsgs > 0) ? '' : 'none';
    } catch (e) {
      console.error('[Admin] Notification dropdown error:', e);
      dd.innerHTML = '<div style="padding:14px;font-size:12px;color:var(--text-dim);">Could not load notifications.</div>';
    }
  }

  window.closeNotifAndGo = function(section) {
    const dd = document.getElementById('notifDropdown');
    if (dd) dd.style.display = 'none';
    nav(section);
  };

  // Refresh the unread-messages badge dot on load, without opening the dropdown
  async function refreshNotifDot() {
    const sb = window._supabase;
    const dot = document.getElementById('notifDot');
    if (!sb || !dot) return;
    try {
      const { count } = await sb.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false);
      dot.style.display = (count || 0) > 0 ? '' : 'none';
    } catch (e) { /* silent */ }
  }

  // ── Session helpers ──
  function createSession(email) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      email, exp: Date.now() + SESSION_TTL, ts: Date.now()
    }));
  }
  function checkSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (Date.now() > s.exp) { sessionStorage.removeItem(SESSION_KEY); return false; }
      return true;
    } catch(e) { return false; }
  }
  function showError(msg) {
    const el = document.getElementById('loginError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function hideError() {
    const el = document.getElementById('loginError');
    if (el) el.style.display = 'none';
  }
  function setInputsDisabled(disabled) {
    ['loginUser','loginPass','loginBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
  }
  function startLockout() {
    let remaining = LOCKOUT_SEC;
    const lockEl = document.getElementById('loginLockout');
    const btn = document.getElementById('loginBtn');
    if (lockEl) lockEl.style.display = 'block';
    if (btn) btn.disabled = true;
    setInputsDisabled(true);
    hideError();
    lockTimer = setInterval(() => {
      remaining--;
      const timerEl = document.getElementById('loginTimer');
      if (timerEl) timerEl.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(lockTimer);
        failCount = 0;
        if (lockEl) lockEl.style.display = 'none';
        if (btn) btn.disabled = false;
        setInputsDisabled(false);
        const attEl = document.getElementById('loginAttemptsMsg');
        if (attEl) attEl.textContent = '';
        const passEl = document.getElementById('loginPass');
        if (passEl) { passEl.value = ''; passEl.focus(); }
      }
    }, 1000);
  }

  function showAdminPanel() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.add('hidden');
    startSessionTimeout();

    // FIX: refresh karne pe hamesha Dashboard pe wapas chala jaata tha,
    // chahe koi bhi tab khula ho. Ab URL hash (#section) se restore karo.
    const validSections = ['dashboard','users','content','analytics','messages','security',
      'gamification','ctf','progress','resources','toolsmanager','community','blog',
      'notifications','settings','profiles','moderation','backup'];
    const hashSection = window.location.hash.replace('#', '');
    if (hashSection && validSections.includes(hashSection) && typeof nav === 'function') {
      nav(hashSection, true); // skipHash=true, isse naya history entry nahi banega
    }
  }

  function startSessionTimeout() {
    setTimeout(() => {
      sessionStorage.removeItem(SESSION_KEY);
      if (_supabase) _supabase.auth.signOut();
      const overlay = document.getElementById('loginOverlay');
      if (overlay) overlay.classList.remove('hidden');
      const passEl = document.getElementById('loginPass');
      if (passEl) passEl.value = '';
      showError('Session expired. Please sign in again.');
    }, SESSION_TTL);
  }

  // ── Real client IP (cached) via ipify, for admin activity logs ──
  let _cachedClientIP = null;
  async function getClientIP() {
    if (_cachedClientIP) return _cachedClientIP;
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const json = await res.json();
      _cachedClientIP = json.ip || 'unknown';
    } catch (e) {
      _cachedClientIP = 'unknown';
    }
    return _cachedClientIP;
  }

  // ── Log an admin activity event into security_logs via RPC ──
  async function logAdminEvent(eventType, details) {
    if (!_supabase) return;
    try {
      const ip = await getClientIP();
      await _supabase.rpc('log_admin_event', {
        p_event_type: eventType,
        p_details: details,
        p_ip: ip
      });
    } catch (e) {
      console.error('[Admin] logAdminEvent error:', e);
    }
  }

  // ── Supabase Login ──
  window.doLogin = async function() {
    if (Date.now() < lockoutEnd) return;

    const emailEl = document.getElementById('loginUser');
    const passEl  = document.getElementById('loginPass');
    const btn     = document.getElementById('loginBtn');

    const email = (emailEl ? emailEl.value : '').trim();
    const pass  = passEl ? passEl.value : '';

    if (!email || !pass) { showError('Enter email and password.'); return; }

    // Supabase not configured, block access entirely
    if (!_supabase) {
      showError('Admin auth not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Verifying…'; }

    try {
      // Step 1: Sign in with Supabase
      const { data, error } = await _supabase.auth.signInWithPassword({
        email, password: pass
      });

      if (error || !data.user) {
        throw new Error('invalid_credentials');
      }

      // Step 2: Check role in profiles table, must be 'admin'
      const { data: profile, error: profileErr } = await _supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile || profile.role !== 'admin') {
        // Not an admin, sign them out immediately
        await _supabase.auth.signOut();
        throw new Error('not_admin');
      }

      // Step 3: All good, create session and show panel
      failCount = 0;
      createSession(email);
      if (emailEl) emailEl.value = '';
      if (passEl)  passEl.value  = '';
      hideError();
      const attEl = document.getElementById('loginAttemptsMsg');
      if (attEl) attEl.textContent = '';
      showAdminPanel();

      // Update topbar with real admin identity
      await setTopbarAdminIdentity(data.user, _supabase);
      refreshNotifDot();
      logAdminEvent('admin_login', `${email} logged in`);

    } catch(err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
      if (passEl) {
        passEl.value = '';
        passEl.classList.add('error-input');
        setTimeout(() => passEl.classList.remove('error-input'), 600);
      }

      failCount++;
      const left = MAX_ATTEMPTS - failCount;

      // FIX: pehle 'not_admin' apna alag message dikhata tha ("Access
      // denied, this account does not have admin privileges") aur
      // lockout counter ke `else if` se pehle hi return kar deta tha.
      // Isse account enumeration hoti thi: is message ka matlab hai
      // email+password sahi hai bas role admin nahi hai, wrong
      // credentials se yeh distinguishable tha. Internal audit log
      // (jo sirf admins apne panel mein dekhte hain, is request ke
      // response mein kabhi nahi jaata) alag hi rakha hai taaki baad
      // mein pata chal sake. User-facing message aur lockout counting
      // ab dono cases (wrong creds / valid-but-non-admin) ke liye same hai.
      if (err.message === 'not_admin') {
        logAdminEvent('failed_login', `${email} tried to log in without admin privileges`);
      }

      if (failCount >= MAX_ATTEMPTS) {
        lockoutEnd = Date.now() + LOCKOUT_SEC * 1000;
        startLockout();
        logAdminEvent('failed_login', `${email} locked out after ${MAX_ATTEMPTS} failed attempts`);
      } else {
        showError('Invalid credentials. ' + left + ' attempt' + (left===1?'':'s') + ' remaining.');
        const attEl = document.getElementById('loginAttemptsMsg');
        if (attEl) attEl.textContent = left <= 2
          ? 'Warning: account locks after ' + left + ' more failed attempt' + (left===1?'':'s') + '.'
          : '';
        if (err.message !== 'not_admin') {
          logAdminEvent('failed_login', `Failed login attempt for ${email}`);
        }
      }
      return;
    }

    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
  };

  // ── Logout ──
  window.adminLogout = async function() {
    const nameEl = document.getElementById('topbarAdminName');
    const adminLabel = (nameEl && nameEl.textContent.trim()) || 'Admin';
    logAdminEvent('admin_logout', `${adminLabel} logged out`);

    sessionStorage.removeItem(SESSION_KEY);
    if (_supabase) await _supabase.auth.signOut();
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.remove('hidden');
    const passEl = document.getElementById('loginPass');
    const userEl = document.getElementById('loginUser');
    if (passEl) passEl.value = '';
    if (userEl) userEl.value = '';
    hideError();
  };

  // ── On page load: check session ──
  window.addEventListener('DOMContentLoaded', async () => {
    // Also verify Supabase session still valid on load
    if (checkSession() && _supabase) {
      const { data: { session } } = await _supabase.auth.getSession();
      if (session) {
        // Re-verify role
        const { data: profile } = await _supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.role === 'admin') {
          showAdminPanel();
          await setTopbarAdminIdentity(session.user, _supabase);
          refreshNotifDot();
          return;
        }
      }
      // Session invalid or role changed, clear and show login
      sessionStorage.removeItem(SESSION_KEY);
      if (_supabase) await _supabase.auth.signOut();
    }

    // No valid session, show login
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.remove('hidden');
    setTimeout(() => {
      const el = document.getElementById('loginUser');
      if (el) el.focus();
    }, 100);

    // Block right-click on login overlay
    const loginEl = document.getElementById('loginOverlay');
    if (loginEl) loginEl.addEventListener('contextmenu', e => e.preventDefault());
  });

  // ── Back button guard ──
  window.addEventListener('pageshow', async (e) => {
    if (e.persisted && !checkSession()) {
      const overlay = document.getElementById('loginOverlay');
      if (overlay) overlay.classList.remove('hidden');
    }
  });

  // ── Hash change support (browser back/forward between admin sections) ──
  window.addEventListener('hashchange', () => {
    const validSections = ['dashboard','users','content','analytics','messages','security',
      'gamification','ctf','progress','resources','toolsmanager','community','blog',
      'notifications','settings','profiles','moderation','backup'];
    const hashSection = window.location.hash.replace('#', '');
    if (hashSection && validSections.includes(hashSection) && typeof nav === 'function') {
      nav(hashSection, true);
    }
  });

})();

// ════════════════════════════════════════
// MOBILE SIDEBAR
// ════════════════════════════════════════
function toggleMobileSidebar() {
  document.getElementById('mobileSidebar').classList.toggle('open');
  document.getElementById('mobileOverlay').classList.toggle('open');
}
function closeMobileSidebar() {
  document.getElementById('mobileSidebar').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('open');
}
function mobileNav(section) {
  closeMobileSidebar();
  nav(section);
  // Update active state in mobile nav
  document.querySelectorAll('.mob-nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('onclick') && el.getAttribute('onclick').includes(`'${section}'`));
  });
}

// Init complete

/* ════════════════════════════════════════════════════
   AI SEARCH, hook every search box (see js/admin-ai-search.js)
   Typing filters at once. After a short pause, or on Enter,
   the AI adds keywords and the same list is filtered again.
════════════════════════════════════════════════════ */
function initAdminAiSearch() {
  if (!window.AdminAI) return;
  const val = sel => document.querySelector(sel)?.value || '';

  AdminAI.bind({ input: '#sec-users .search-input input', scope: 'users',
    rows: () => users, fields: u => [u.name, u.email],
    rerender: () => filterUsers() });

  AdminAI.bind({ input: '#ctfSearchInput', scope: 'ctf',
    rows: () => ctfChallenges, fields: c => [c.title, c.desc, c.category, c.difficulty],
    rerender: () => renderCTFGrid() });

  AdminAI.bind({ input: '#sec-progress .search-input input', scope: 'progress',
    rows: () => userProgress, fields: p => [p.user, p.course],
    rerender: () => filterProgress(val('#sec-progress .search-input input')) });

  AdminAI.bind({ input: '#resSearch', scope: 'resources',
    rows: () => resources, fields: r => [r.name, r.chapter, r.type],
    rerender: () => filterResources() });

  AdminAI.bind({ input: '#commThreadSearch', scope: 'threads',
    rows: () => commThreads, fields: t => [t.title, t.author, t.category],
    rerender: () => filterThreads() });

  AdminAI.bind({ input: '#commCommentSearch', scope: 'comments',
    rows: () => commComments, fields: c => [c.text, c.author, c.thread],
    rerender: () => filterComments() });

  AdminAI.bind({ input: '#blogSearch', scope: 'blog',
    rows: () => blogPosts, fields: p => [p.title, (p.tags || []).join(' '), p.category],
    rerender: () => filterBlogPosts() });

  AdminAI.bind({ input: '#modCommentSearch', scope: 'comments', key: 'modcomments',
    rows: () => modComments, fields: c => [c.text, c.author, c.thread],
    rerender: () => renderModComments() });

  AdminAI.bind({ input: '#sec-messages .search-input input', scope: 'messages',
    rows: () => _admMessages, fields: m => [m.name, m.email, m.message],
    rerender: () => _admDrawMessages() });

  // Messages had no search before, so typing must filter at once too
  const msgInput = document.querySelector('#sec-messages .search-input input');
  if (msgInput) msgInput.addEventListener('input', () => _admDrawMessages());

  AdminAI.bind({ input: '#profileSearch', scope: 'profiles',
    rerender: () => { const v = val('#profileSearch').trim(); if (v) _searchProfilesNow(v); } });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAdminAiSearch);
else initAdminAiSearch();
