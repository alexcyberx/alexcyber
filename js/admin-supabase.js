/* ═══════════════════════════════════════════════════════════════
   admin-supabase.js  —  AlexCyberX Admin Panel (Real Data)
   Replaces admin.js — fetches everything from Supabase.
   Drop this file in /js/ and update admin.html script tag:
     <script src="js/admin-supabase.js"></script>
   (Remove or replace the old <script src="js/admin.js">)
═══════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════
   SECTION SWITCHER
════════════════════════════════════════ */
function admNav(section) {
  document.querySelectorAll('.adm-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.adm-nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('adm-' + section);
  if (sec) sec.classList.add('active');
  document.querySelectorAll(`.adm-nav-item[data-section="${section}"]`).forEach(n => n.classList.add('active'));
  const titles = {
    dashboard:'Dashboard', users:'User Management', content:'Content Management',
    analytics:'Analytics', ctf:'CTF Challenges', leaderboard:'Leaderboard',
    messages:'Messages', security:'Security Logs', announcements:'Announcements',
    certificates:'Certificates', settings:'Settings'
  };
  const el = document.getElementById('admTopTitle');
  if (el) el.textContent = titles[section] || 'Admin Panel';
  document.querySelector('.adm-sidebar')?.classList.remove('open');
}

function admToggleSidebar() {
  document.querySelector('.adm-sidebar')?.classList.toggle('open');
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
function admShowToast(msg, type) {
  const existing = document.getElementById('admToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'admToast';
  const isErr = type === 'error';
  toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;background:' +
    (isErr ? 'rgba(220,20,20,0.95)' : '#111118') +
    ';border:1px solid ' + (isErr ? 'rgba(220,20,20,0.5)' : 'rgba(74,222,128,0.3)') +
    ';color:' + (isErr ? '#fff' : '#4ade80') +
    ';padding:10px 18px;border-radius:8px;font-size:13px;font-weight:500;font-family:Inter,sans-serif;' +
    'box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:opacity 0.3s;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2800);
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '—';
}

/* ════════════════════════════════════════
   DASHBOARD — REAL DATA
════════════════════════════════════════ */
async function admInitDashboard() {
  const sb = window._supabase;
  if (!sb) {
    console.warn('Admin: Supabase not connected');
    return;
  }

  // ── Stat cards ──────────────────────────────────────────────
  try {
    // Total users count
    const { count: totalUsers } = await sb
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active today — profiles with last_seen in last 24h
    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count: activeToday } = await sb
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', since24h);

    // Unread messages/contact submissions
    const { count: unreadMsgs } = await sb
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)
      .catch(() => ({ count: null }));

    // CTF total solves
    const { count: totalSolves } = await sb
      .from('ctf_solves')
      .select('*', { count: 'exact', head: true })
      .catch(() => ({ count: null }));

    // Update dashboard stat cards
    // The stat-value divs in sec-dashboard don't have IDs — we inject IDs or use order
    // We set them by querying the stat-grid in the dashboard section
    const dashSection = document.getElementById('sec-dashboard') || document.getElementById('adm-dashboard');
    if (dashSection) {
      const vals = dashSection.querySelectorAll('.stat-value');
      if (vals[0]) vals[0].textContent = (totalUsers ?? 0).toLocaleString();
      if (vals[1]) vals[1].textContent = (activeToday ?? 0).toLocaleString();
      if (vals[3]) vals[3].textContent = (unreadMsgs ?? 0).toLocaleString();
    }

    // Update topbar admin name
    const sbUser = (await sb.auth.getUser()).data?.user;
    if (sbUser) {
      const { data: prof } = await sb.from('profiles').select('full_name, username').eq('id', sbUser.id).single();
      const name = prof?.full_name || prof?.username || sbUser.email?.split('@')[0] || 'Admin';
      setText('topbarAdminName', name);
    }

  } catch(e) {
    console.error('Dashboard stats error:', e);
  }

  // ── Recent signups ───────────────────────────────────────────
  admLoadRecentSignups();

  // ── Visitor graph — use signups per day as proxy ─────────────
  admDrawSignupGraph('7d');
}

async function admLoadRecentSignups() {
  const sb = window._supabase;
  if (!sb) return;
  const el = document.getElementById('recentSignups');
  if (!el) return;

  el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:8px;">Loading…</div>';

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('id, full_name, username, email, created_at, avatar_url')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    if (!data || !data.length) { el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:8px;">No signups yet.</div>'; return; }

    el.innerHTML = data.map(u => {
      const name = escHtml(u.full_name || u.username || u.email?.split('@')[0] || 'User');
      const initial = (name[0] || '?').toUpperCase();
      return `
        <div class="signup-item">
          <div class="user-avatar">${initial}</div>
          <div class="signup-info">
            <div class="signup-name">${name}</div>
            <div class="signup-meta">${escHtml(u.email || '')}</div>
          </div>
          <div class="signup-time">${timeAgo(u.created_at)}</div>
        </div>`;
    }).join('');
  } catch(e) {
    console.error('Recent signups error:', e);
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:8px;">Could not load.</div>';
  }
}

/* Signup graph — last 7 or 30 days from profiles.created_at */
async function admDrawSignupGraph(mode) {
  const sb = window._supabase;
  const svg = document.getElementById('visitorSvg');
  const labelEl = document.getElementById('graphLabels');
  if (!svg || !sb) return;

  const days = mode === '7d' ? 7 : 30;
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('created_at')
      .gte('created_at', since);

    if (error) throw error;

    // Bucket by day
    const buckets = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    (data || []).forEach(r => {
      const key = r.created_at?.slice(0, 10);
      if (key && key in buckets) buckets[key]++;
    });

    const keys = Object.keys(buckets).sort();
    const vals = keys.map(k => buckets[k]);
    const lbls = keys.map(k => {
      const d = new Date(k);
      return mode === '7d'
        ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]
        : String(d.getDate());
    });

    _admDrawSVG(vals, lbls, mode);
  } catch(e) {
    console.error('Graph error:', e);
    // Fall back to empty graph
    _admDrawSVG(new Array(days).fill(0), new Array(days).fill(''), mode);
  }
}

function _admDrawSVG(data, lbls, mode) {
  const svg = document.getElementById('visitorSvg');
  const labelEl = document.getElementById('graphLabels');
  if (!svg) return;

  const max = Math.max(...data, 1);
  const W = 600, H = 110, pad = 10;
  const xs = data.map((_, i) => pad + i * ((W - pad * 2) / Math.max(data.length - 1, 1)));
  const ys = data.map(v => H - pad - (v / max) * (H - pad * 2));

  let path = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
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
    ${xs.map((x, i) => `<circle class="graph-dot" cx="${x}" cy="${ys[i]}" r="3"><title>${lbls[i]}: ${data[i]} signups</title></circle>`).join('')}
  `;

  if (labelEl) {
    const step = mode === '7d' ? 1 : 5;
    labelEl.innerHTML = lbls
      .filter((_, i) => i % step === 0 || i === lbls.length - 1)
      .map(l => `<span>${l}</span>`).join('');
  }
}

let _currentGraph = '7d';
function switchGraph(mode) {
  _currentGraph = mode;
  document.getElementById('btn7d')?.classList.toggle('active', mode === '7d');
  document.getElementById('btn30d')?.classList.toggle('active', mode === '30d');
  admDrawSignupGraph(mode);
}

/* ════════════════════════════════════════
   USERS — REAL DATA
════════════════════════════════════════ */
let _adminUsers = [];
let _usersPage = 1;
let _filteredUsers = [];
const USERS_PER_PAGE = 8;

async function admLoadUsers() {
  const sb = window._supabase;
  if (!sb) return;
  const tbody = document.getElementById('usersTbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text-dim);text-align:center;padding:16px;">Loading…</td></tr>';

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('id, full_name, username, email, role, created_at, last_seen, is_banned, xp, level')
      .order('created_at', { ascending: false });

    if (error) throw error;

    _adminUsers = (data || []).map(u => ({
      id:         u.id,
      name:       u.full_name || u.username || u.email?.split('@')[0] || 'User',
      email:      u.email || '—',
      role:       u.role || 'user',
      status:     u.is_banned ? 'banned' : 'active',
      joined:     u.created_at?.slice(0, 10) || '—',
      lastActive: timeAgo(u.last_seen),
      xp:         u.xp || 0,
      level:      u.level || 1,
    }));
    _filteredUsers = [..._adminUsers];
    _usersPage = 1;
    admRenderUsersTable();
  } catch(e) {
    console.error('Load users error:', e);
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="color:#ef4444;text-align:center;padding:16px;">Failed to load users.</td></tr>';
  }
}

function admRenderUsersTable() {
  const tbody = document.getElementById('usersTbody');
  if (!tbody) return;

  const start = (_usersPage - 1) * USERS_PER_PAGE;
  const page  = _filteredUsers.slice(start, start + USERS_PER_PAGE);

  if (!page.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text-dim);text-align:center;padding:16px;">No users found.</td></tr>';
  } else {
    tbody.innerHTML = page.map(u => `
      <tr data-uid="${escHtml(u.id)}">
        <td>
          <div class="user-cell">
            <div class="user-avatar">${(u.name[0] || '?').toUpperCase()}</div>
            <div>
              <div class="user-name">${escHtml(u.name)}</div>
              <div class="user-email">${escHtml(u.email)}</div>
            </div>
          </div>
        </td>
        <td>${escHtml(u.joined)}</td>
        <td>${escHtml(u.lastActive)}</td>
        <td><span class="badge ${escHtml(u.role)}">${escHtml(u.role)}</span></td>
        <td><span class="badge ${escHtml(u.status)}">${escHtml(u.status)}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn icon-only ${u.status === 'banned' ? 'green' : 'red'}" title="${u.status === 'banned' ? 'Unban' : 'Ban'}"
              onclick="admToggleBan('${escHtml(u.id)}', '${escHtml(u.name)}', ${u.status === 'banned'})">
              ${u.status === 'banned'
                ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 3l6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`}
            </button>
            <button class="btn icon-only red" title="Delete" onclick="admDeleteUser('${escHtml(u.id)}', '${escHtml(u.name)}')">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 5v4M8 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </td>
      </tr>`).join('');
  }

  // Pagination
  const total = Math.ceil(_filteredUsers.length / USERS_PER_PAGE);
  const pg = document.getElementById('userPagination');
  if (pg) {
    pg.innerHTML = `<span class="page-info">${_filteredUsers.length} users</span>`;
    for (let i = 1; i <= total; i++) {
      pg.innerHTML += `<div class="page-btn ${i === _usersPage ? 'active' : ''}" onclick="admUsersGoPage(${i})">${i}</div>`;
    }
  }
}

function admUsersGoPage(p) { _usersPage = p; admRenderUsersTable(); }

function admFilterUsers() {
  const q      = (document.getElementById('admUserSearch')?.value || '').toLowerCase();
  const role   = document.getElementById('admUserRole')?.value || '';
  _filteredUsers = _adminUsers.filter(u => {
    const matchQ    = !q    || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !role || u.role === role;
    return matchQ && matchRole;
  });
  _usersPage = 1;
  admRenderUsersTable();
}

async function admToggleBan(userId, name, currentlyBanned) {
  const sb = window._supabase;
  if (!sb) return;
  const newBanned = !currentlyBanned;
  try {
    const { error } = await sb.from('profiles').update({ is_banned: newBanned }).eq('id', userId);
    if (error) throw error;
    // Update local cache
    const u = _adminUsers.find(u => u.id === userId);
    if (u) u.status = newBanned ? 'banned' : 'active';
    admFilterUsers(); // re-render
    admShowToast(`${name} ${newBanned ? 'banned' : 'unbanned'}`);
  } catch(e) {
    console.error('Toggle ban error:', e);
    admShowToast('Action failed: ' + e.message, 'error');
  }
}

async function admDeleteUser(userId, name) {
  if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
  const sb = window._supabase;
  if (!sb) return;
  try {
    const { error } = await sb.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    _adminUsers = _adminUsers.filter(u => u.id !== userId);
    _filteredUsers = _filteredUsers.filter(u => u.id !== userId);
    admRenderUsersTable();
    admShowToast(`${name} deleted`);
  } catch(e) {
    admShowToast('Delete failed: ' + e.message, 'error');
  }
}

function admExportCSV() {
  const headers = ['Name', 'Email', 'Joined', 'Last Active', 'Role', 'Status', 'XP', 'Level'];
  const rows = _adminUsers.map(u => [u.name, u.email, u.joined, u.lastActive, u.role, u.status, u.xp, u.level]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv,' + encodeURIComponent(csv);
  a.download = 'alexcyberx-users.csv';
  a.click();
  admShowToast('CSV exported — ' + _adminUsers.length + ' users');
}

/* ════════════════════════════════════════
   LEADERBOARD — REAL DATA
════════════════════════════════════════ */
async function admLoadLeaderboard() {
  const sb = window._supabase;
  const el = document.getElementById('admLeaderboard') || document.querySelector('#adm-leaderboard .adm-table-wrap');
  if (!sb || !el) return;

  el.innerHTML = '<div style="color:var(--text-dim);padding:16px;font-size:13px;">Loading…</div>';

  try {
    // Try RPC first, fall back to direct query
    let data;
    const rpcRes = await sb.rpc('get_leaderboard', { p_limit: 50 }).catch(() => null);
    if (rpcRes && !rpcRes.error && rpcRes.data) {
      data = rpcRes.data;
    } else {
      // Fallback: direct profiles query
      const { data: profiles, error } = await sb
        .from('profiles')
        .select('id, full_name, username, xp, level, ctf_solves, badge_count')
        .order('xp', { ascending: false })
        .limit(50);
      if (error) throw error;
      data = (profiles || []).map((u, i) => ({
        rank: i + 1,
        username: u.username || u.full_name || 'Anonymous',
        xp: u.xp || 0,
        level: u.level || 1,
        ctf_solves: u.ctf_solves || 0,
        badge_count: u.badge_count || 0,
      }));
    }

    if (!data.length) { el.innerHTML = '<div style="color:var(--text-dim);padding:16px;">No players yet.</div>'; return; }

    el.innerHTML = `
      <table class="adm-table">
        <thead><tr><th>#</th><th>Player</th><th>XP</th><th>Level</th><th>Solves</th><th>Badges</th></tr></thead>
        <tbody>
          ${data.map((u, i) => {
            const rank = u.rank || i + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
            return `<tr>
              <td>${medal}</td>
              <td><div class="user-cell"><div class="user-avatar">${(u.username?.[0] || '?').toUpperCase()}</div><div class="user-name">${escHtml(u.username || 'Anonymous')}</div></div></td>
              <td>${(u.xp || 0).toLocaleString()}</td>
              <td>Lv ${u.level || 1}</td>
              <td>${u.ctf_solves || 0}</td>
              <td>${u.badge_count || 0}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  } catch(e) {
    console.error('Leaderboard error:', e);
    el.innerHTML = '<div style="color:#ef4444;padding:16px;">Could not load leaderboard.</div>';
  }
}

/* ════════════════════════════════════════
   GAMIFICATION STATS — REAL DATA
════════════════════════════════════════ */
async function admLoadGamification() {
  const sb = window._supabase;
  if (!sb) return;

  try {
    // Total XP across all users
    const { data: xpData } = await sb.from('profiles').select('xp');
    const totalXP = (xpData || []).reduce((sum, u) => sum + (u.xp || 0), 0);
    setText('gamTotalXP', totalXP.toLocaleString());

    // Active badge count (in badges table)
    const { count: badgeCount } = await sb.from('badges').select('*', { count: 'exact', head: true });
    setText('gamBadgeCount', badgeCount ?? 0);

    // Active streaks (users with streak_current > 0)
    const { count: activeStreaks } = await sb
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('streak_current', 0);
    setText('gamActiveStreaks', activeStreaks ?? 0);

  } catch(e) {
    console.error('Gamification stats error:', e);
  }
}

/* ════════════════════════════════════════
   SECURITY LOGS — REAL DATA (from ctf_attempts or custom table)
════════════════════════════════════════ */
async function admLoadSecurity() {
  const sb = window._supabase;
  const logsEl = document.getElementById('securityLogs');
  const blockedEl = document.getElementById('blockedIPs');
  if (!sb) return;

  if (logsEl) logsEl.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:8px;">Loading…</div>';

  try {
    // Try security_logs table first
    const { data: logs, error } = await sb
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
      .catch(() => ({ data: null, error: true }));

    if (!error && logs && logsEl) {
      logsEl.innerHTML = logs.map(l => `
        <div class="adm-log-row adm-log-${escHtml(l.type || 'info')}">
          <div class="adm-log-dot"></div>
          <div class="adm-log-body">
            <div class="adm-log-title">${escHtml(l.title || l.event || '')}</div>
            <div class="adm-log-sub">${escHtml(l.detail || l.message || '')}</div>
          </div>
          <div class="adm-log-time">${timeAgo(l.created_at)}</div>
        </div>`).join('') || '<div style="color:var(--text-dim);padding:8px;">No logs found.</div>';

      // Update failed logins stat
      const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const failedLogins = logs.filter(l => l.type === 'warn' && new Date(l.created_at) > new Date(since24h)).length;
      const secSection = document.getElementById('adm-security') || document.getElementById('sec-security');
      if (secSection) {
        const vals = secSection.querySelectorAll('.stat-value');
        if (vals[0]) vals[0].textContent = failedLogins;
      }
    } else if (logsEl) {
      // Fallback: show ctf flag submission attempts as activity
      const { data: attempts } = await sb
        .from('ctf_solves')
        .select('user_id, challenge_id, solved_at, profiles(username, full_name)')
        .order('solved_at', { ascending: false })
        .limit(20);

      if (attempts && attempts.length) {
        logsEl.innerHTML = attempts.map(a => {
          const uname = a.profiles?.username || a.profiles?.full_name || 'User';
          return `
            <div class="adm-log-row adm-log-info">
              <div class="adm-log-dot"></div>
              <div class="adm-log-body">
                <div class="adm-log-title">CTF Solved</div>
                <div class="adm-log-sub">${escHtml(uname)} solved challenge #${a.challenge_id}</div>
              </div>
              <div class="adm-log-time">${timeAgo(a.solved_at)}</div>
            </div>`;
        }).join('');
      } else {
        logsEl.innerHTML = '<div style="color:var(--text-dim);padding:8px;">No security logs table found. Create a <code>security_logs</code> table in Supabase to enable this.</div>';
      }
    }

    // Blocked IPs from blocked_ips table (if exists)
    if (blockedEl) {
      const { data: ips } = await sb
        .from('blocked_ips')
        .select('ip, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
        .catch(() => ({ data: null }));

      if (ips && ips.length) {
        blockedEl.innerHTML = ips.map(ip => `
          <div style="background:#1a1a22;border:1px solid #2a2a3a;border-radius:6px;padding:6px 12px;display:flex;align-items:center;gap:10px;font-size:12px;">
            <span style="color:#ef4444;font-family:monospace;">${escHtml(ip.ip)}</span>
            <span style="color:var(--text-dim)">${escHtml(ip.reason || 'Blocked')}</span>
            <button class="adm-btn adm-btn-xs" onclick="admUnblockIP('${escHtml(ip.ip)}')">Unblock</button>
          </div>`).join('');

        // Update blocked count stat
        const secSection = document.getElementById('adm-security') || document.getElementById('sec-security');
        if (secSection) {
          const vals = secSection.querySelectorAll('.stat-value');
          if (vals[1]) vals[1].textContent = ips.length;
        }
      } else {
        blockedEl.innerHTML = '<div style="color:var(--text-dim);font-size:12px;">No blocked IPs. (Create a <code>blocked_ips</code> table to manage this.)</div>';
      }
    }

  } catch(e) {
    console.error('Security logs error:', e);
    if (logsEl) logsEl.innerHTML = '<div style="color:#ef4444;padding:8px;">Could not load security data.</div>';
  }
}

async function admUnblockIP(ip) {
  const sb = window._supabase;
  if (!sb) return;
  if (!confirm(`Unblock ${ip}?`)) return;
  try {
    await sb.from('blocked_ips').delete().eq('ip', ip);
    admShowToast(`${ip} unblocked`);
    admLoadSecurity();
  } catch(e) {
    admShowToast('Failed to unblock IP', 'error');
  }
}

/* ════════════════════════════════════════
   NOTIFICATIONS / ANNOUNCEMENTS — REAL
════════════════════════════════════════ */
async function admLoadBroadcastHistory() {
  const sb = window._supabase;
  const el = document.getElementById('broadcastHistory');
  if (!sb || !el) return;

  try {
    const { data, error } = await sb
      .from('notifications')
      .select('title, body, created_at')
      .is('user_id', null)           // global notifications have null user_id
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data || !data.length) {
      el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;">No announcements sent yet.</div>';
      return;
    }
    el.innerHTML = data.map(n => `
      <div style="border:1px solid #2a2a3a;border-radius:8px;padding:10px 14px;margin-bottom:8px;">
        <div style="font-weight:600;font-size:13px;">${escHtml(n.title)}</div>
        ${n.body ? `<div style="color:var(--text-dim);font-size:12px;margin-top:4px;">${escHtml(n.body)}</div>` : ''}
        <div style="color:var(--text-dim);font-size:11px;margin-top:6px;">${timeAgo(n.created_at)}</div>
      </div>`).join('');
  } catch(e) {
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;">Could not load history.</div>';
  }
}

async function admSendAnnouncement() {
  const sb = window._supabase;
  const title = document.getElementById('admAnnTitle')?.value.trim() || document.getElementById('notifTitle')?.value.trim();
  const msg   = document.getElementById('admAnnMsg')?.value.trim()   || document.getElementById('notifMsg')?.value.trim();

  if (!title || !msg) { admShowToast('Fill title and message', 'error'); return; }

  if (!sb) {
    admShowToast('Supabase not configured', 'error');
    return;
  }

  try {
    // Insert a global notification (user_id = null)
    const { error } = await sb.from('notifications').insert({
      user_id:    null,
      title:      title,
      body:       msg,
      type:       'announcement',
      read:       false,
    });
    if (error) throw error;

    admShowToast('Announcement sent to all users!');
    if (document.getElementById('admAnnTitle'))  document.getElementById('admAnnTitle').value  = '';
    if (document.getElementById('admAnnMsg'))    document.getElementById('admAnnMsg').value    = '';
    if (document.getElementById('notifTitle'))   document.getElementById('notifTitle').value   = '';
    if (document.getElementById('notifMsg'))     document.getElementById('notifMsg').value     = '';
    admLoadBroadcastHistory();
  } catch(e) {
    admShowToast('Failed to send: ' + e.message, 'error');
  }
}

/* ════════════════════════════════════════
   MESSAGES — REAL DATA
════════════════════════════════════════ */
async function admLoadMessages() {
  const sb = window._supabase;
  const el = document.getElementById('messagesList');
  if (!sb || !el) return;

  el.innerHTML = '<div style="color:var(--text-dim);padding:16px;font-size:13px;">Loading…</div>';

  try {
    const { data, error } = await sb
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Update unread badge count in nav
    const unreadCount = (data || []).filter(m => !m.read).length;
    const commBadge = document.getElementById('commBadge');
    if (commBadge) { commBadge.textContent = unreadCount; commBadge.style.display = unreadCount > 0 ? '' : 'none'; }

    if (!data || !data.length) {
      el.innerHTML = '<div style="color:var(--text-dim);padding:16px;">No messages yet.</div>';
      return;
    }

    el.innerHTML = `
      <table class="adm-table">
        <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${data.map(m => `
            <tr>
              <td>${escHtml(m.name || m.from_name || '—')}</td>
              <td>${escHtml(m.email || m.from_email || '—')}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(m.subject || m.message?.slice(0, 50) || '—')}</td>
              <td>${timeAgo(m.created_at)}</td>
              <td><span class="badge ${m.read ? 'active' : 'unread'}">${m.read ? 'Read' : 'Unread'}</span></td>
              <td>
                <div class="action-btns">
                  <button class="btn icon-only" onclick="admToggleMsg('${m.id}', ${!!m.read})" title="${m.read ? 'Mark Unread' : 'Mark Read'}">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3l5 4 5-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="1" y="3" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>
                  </button>
                  <button class="btn icon-only red" onclick="admDeleteMsg('${m.id}')" title="Delete">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2h2v1M4 5v4M8 5v4M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch(e) {
    console.error('Messages error:', e);
    el.innerHTML = '<div style="color:#ef4444;padding:16px;">Could not load messages. (Make sure a <code>contact_messages</code> table exists in Supabase.)</div>';
  }
}

async function admToggleMsg(id, currentlyRead) {
  const sb = window._supabase;
  if (!sb) return;
  try {
    await sb.from('contact_messages').update({ read: !currentlyRead }).eq('id', id);
    admLoadMessages();
  } catch(e) { admShowToast('Update failed', 'error'); }
}

async function admDeleteMsg(id) {
  if (!confirm('Delete this message?')) return;
  const sb = window._supabase;
  if (!sb) return;
  try {
    await sb.from('contact_messages').delete().eq('id', id);
    admShowToast('Message deleted');
    admLoadMessages();
  } catch(e) { admShowToast('Delete failed', 'error'); }
}

/* ════════════════════════════════════════
   SECTION ROUTER — hooks into nav clicks
════════════════════════════════════════ */
const _admSectionLoaders = {
  dashboard:     admInitDashboard,
  users:         admLoadUsers,
  leaderboard:   admLoadLeaderboard,
  security:      admLoadSecurity,
  gamification:  admLoadGamification,
  messages:      admLoadMessages,
  announcements: admLoadBroadcastHistory,
  notifications: admLoadBroadcastHistory,
};

// Wrap the original admNav to also trigger data loading
(function() {
  const _origNav = window.admNav || admNav;
  window.admNav = function(section) {
    _origNav(section);
    if (_admSectionLoaders[section]) {
      _admSectionLoaders[section]();
    }
  };
})();

/* ════════════════════════════════════════
   INIT on DOMContentLoaded
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to let Supabase auth resolve first
  setTimeout(() => {
    admInitDashboard();
    admLoadGamification();
  }, 300);
});
