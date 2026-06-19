/* ═══════════════════════════════════════════
   ADMIN PANEL — AlexCyberX
═══════════════════════════════════════════ */

/* ── Section switcher ── */
function admNav(section) {
  document.querySelectorAll('.adm-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.adm-nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('adm-' + section);
  if (sec) sec.classList.add('active');
  document.querySelectorAll('.adm-nav-item[data-section="' + section + '"]').forEach(n => n.classList.add('active'));
  const titles = {
    dashboard: 'Dashboard', users: 'User Management', content: 'Content Management',
    analytics: 'Analytics', ctf: 'CTF Challenges', leaderboard: 'Leaderboard',
    messages: 'Messages', security: 'Security Logs', announcements: 'Announcements',
    certificates: 'Certificates', settings: 'Settings'
  };
  const el = document.getElementById('admTopTitle');
  if (el) el.textContent = titles[section] || 'Admin Panel';
  // close sidebar on mobile
  document.querySelector('.adm-sidebar').classList.remove('open');
}

/* ── Sidebar toggle (mobile) ── */
function admToggleSidebar() {
  document.querySelector('.adm-sidebar').classList.toggle('open');
}

/* ── Init dashboard charts ── */
function admInitCharts() {
  // Visitor bar chart - last 14 days mock data
  const data = [42,67,53,88,71,95,110,84,120,98,135,142,118,156];
  const days = ['Jun 1','Jun 2','Jun 3','Jun 4','Jun 5','Jun 6','Jun 7','Jun 8','Jun 9','Jun 10','Jun 11','Jun 12','Jun 13','Jun 14'];
  const max = Math.max(...data);
  const wrap = document.getElementById('admVisitorChart');
  const labelsWrap = document.getElementById('admVisitorLabels');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (labelsWrap) labelsWrap.innerHTML = '';
  data.forEach((v, i) => {
    const pct = (v / max) * 100;
    const bar = document.createElement('div');
    bar.className = 'adm-bar';
    bar.style.height = pct + '%';
    bar.innerHTML = '<div class="adm-bar-tip">' + v + ' visitors</div>';
    wrap.appendChild(bar);
    if (labelsWrap && i % 2 === 0) {
      const lbl = document.createElement('div');
      lbl.className = 'adm-chart-label';
      lbl.textContent = days[i].split(' ')[1];
      labelsWrap.appendChild(lbl);
    } else if (labelsWrap) {
      const lbl = document.createElement('div');
      lbl.className = 'adm-chart-label';
      lbl.textContent = '';
      labelsWrap.appendChild(lbl);
    }
  });
}

/* ── User search filter ── */
function admFilterUsers() {
  const q = document.getElementById('admUserSearch').value.toLowerCase();
  const role = document.getElementById('admUserRole').value;
  const rows = document.querySelectorAll('#admUsersTable tr[data-role]');
  rows.forEach(row => {
    const name = row.dataset.name || '';
    const email = row.dataset.email || '';
    const rowRole = row.dataset.role || '';
    const matchQ = name.includes(q) || email.includes(q);
    const matchRole = !role || rowRole === role;
    row.style.display = (matchQ && matchRole) ? '' : 'none';
  });
}

/* ── Toggle user status ── */
function admToggleUser(btn, userId) {
  const badge = btn.closest('tr').querySelector('.adm-user-status');
  const isBanned = badge.classList.contains('banned');
  if (isBanned) {
    badge.className = 'adm-badge active'; badge.textContent = 'Active';
    btn.textContent = 'Ban'; btn.className = 'adm-btn adm-btn-danger adm-btn-xs';
  } else {
    badge.className = 'adm-badge banned'; badge.textContent = 'Banned';
    btn.textContent = 'Unban'; btn.className = 'adm-btn adm-btn-success adm-btn-xs';
  }
  admShowToast(isBanned ? 'User unbanned' : 'User banned');
}

/* ── Delete user ── */
function admDeleteUser(btn) {
  if (!confirm('Delete this user permanently?')) return;
  btn.closest('tr').style.opacity = '0';
  setTimeout(() => btn.closest('tr').remove(), 300);
  admShowToast('User deleted');
}

/* ── Toggle chapter ── */
function admToggleChapter(checkbox) {
  const row = checkbox.closest('tr');
  const badge = row.querySelector('.adm-chapter-status');
  if (checkbox.checked) {
    badge.className = 'adm-badge enabled'; badge.textContent = 'Enabled';
  } else {
    badge.className = 'adm-badge disabled'; badge.textContent = 'Disabled';
  }
}

/* ── Message read toggle ── */
function admReadMsg(btn, msgId) {
  const badge = btn.closest('tr').querySelector('.adm-msg-status');
  const isUnread = badge.classList.contains('unread');
  badge.className = isUnread ? 'adm-badge read' : 'adm-badge unread';
  badge.textContent = isUnread ? 'Read' : 'Unread';
  btn.textContent = isUnread ? 'Mark Unread' : 'Mark Read';
}

/* ── Delete message ── */
function admDeleteMsg(btn) {
  if (!confirm('Delete this message?')) return;
  btn.closest('tr').style.opacity = '0';
  setTimeout(() => btn.closest('tr').remove(), 300);
  admShowToast('Message deleted');
}

/* ── Block IP ── */
function admBlockIP(btn, ip) {
  const badge = btn.closest('tr').querySelector('.adm-ip-status');
  const isBlocked = badge.classList.contains('blocked');
  if (!isBlocked) {
    badge.className = 'adm-badge blocked'; badge.textContent = 'Blocked';
    btn.textContent = 'Unblock'; btn.className = 'adm-btn adm-btn-success adm-btn-xs';
    admShowToast('IP ' + ip + ' blocked');
  } else {
    badge.className = 'adm-badge warn'; badge.textContent = 'Watching';
    btn.textContent = 'Block'; btn.className = 'adm-btn adm-btn-danger adm-btn-xs';
    admShowToast('IP ' + ip + ' unblocked');
  }
}

/* ── CTF toggle ── */
function admToggleCTF(checkbox) {
  const card = checkbox.closest('.adm-ctf-card');
  const badge = card.querySelector('.adm-ctf-status');
  if (checkbox.checked) {
    badge.className = 'adm-badge enabled adm-ctf-status'; badge.textContent = 'Active';
  } else {
    badge.className = 'adm-badge disabled adm-ctf-status'; badge.textContent = 'Hidden';
  }
}

/* ── Send announcement ── */
function admSendAnnouncement() {
  const title = document.getElementById('admAnnTitle').value.trim();
  const msg = document.getElementById('admAnnMsg').value.trim();
  if (!title || !msg) { admShowToast('Fill title and message', 'error'); return; }
  admShowToast('Announcement sent to all users!');
  document.getElementById('admAnnTitle').value = '';
  document.getElementById('admAnnMsg').value = '';
}

/* ── Save settings ── */
function admSaveSettings() {
  admShowToast('Settings saved successfully');
}

/* ── Export CSV (mock) ── */
function admExportCSV(type) {
  admShowToast('Exporting ' + type + ' as CSV...');
}

/* ── Toast notification ── */
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

/* ── Init on page load ── */
document.addEventListener('DOMContentLoaded', function() {
  admInitCharts();
});
