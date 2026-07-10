/* ═══════════════════════════════════════════════════════════════
   js/profile.js  —  AlexCyberX Profile Dashboard
   Simplified: sirf Notifications aur Settings tabs.
   XP/Level/Badges/Streak/Leaderboard system yahan se hata diya gaya
   hai — ye ab profile page ka hissa nahi hai (CTF page ka "My Stats"
   panel alag se apna stats khud handle karta hai, isse chhua nahi gaya).
═══════════════════════════════════════════════════════════════ */

/* ── HELPERS ──────────────────────────────────────────────────*/
function escHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#x27;');
}

function pfTimeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

/* ── TAB SWITCHER ─────────────────────────────────────────────*/
function pfShowTab(tab) {
  // FIX: pehle document.querySelectorAll tha — unscoped global query.
  // Agar kisi aur page pe bhi .pf-tab class hoti toh dono affect hote.
  // Ab #profilePage ke andar scope karo.
  const pfPage = document.getElementById('profilePage') || document;
  pfPage.querySelectorAll('.pf-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  pfPage.querySelectorAll('.pf-tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === 'pfTab-' + tab)
  );
  if (tab === 'notifications') pfLoadNotifications();
}

/* ── NOTIFICATIONS ────────────────────────────────────────────*/
let _pfNotifsLoaded = false;

async function pfLoadNotifications() {
  if (_pfNotifsLoaded) return;
  const el = document.getElementById('pfNotifList');
  const sb = window._supabase;
  const user = window._currentUser;
  if (!el || !sb || !user) return;

  el.innerHTML = '<div class="pf-empty">Loading…</div>';

  try {
    const userId = user.id;
    const res = await sb.rpc('get_notifications', { p_user_id: userId, p_limit: 30 });

    const data = res.data;
    const err  = res.error;
    if (err) throw err;

    _pfNotifsLoaded = true;

    if (!data || !data.length) {
      el.innerHTML = '<div class="pf-empty">No notifications yet.</div>';
      return;
    }

    const unread = data.filter(n => !n.read).length;
    pfUpdateNotifDot(unread > 0);

    el.innerHTML = data.map(n => `
      <div class="pf-notif-row ${n.read ? '' : 'pf-notif-row--unread'}">
        <div class="pf-notif-type-dot pf-notif-type-dot--${escHtml(n.type)}"></div>
        <div class="pf-notif-body">
          <div class="pf-notif-title">${escHtml(n.title)}</div>
          ${n.body ? `<div class="pf-notif-text">${escHtml(n.body)}</div>` : ''}
          <div class="pf-notif-time">${pfTimeAgo(n.created_at)}</div>
        </div>
        ${!n.read ? '<div class="pf-notif-unread-pip"></div>' : ''}
      </div>
    `).join('');
  } catch(e) {
    console.error('Notifications error:', e);
    el.innerHTML = '<div class="pf-empty">Could not load notifications.</div>';
  }
}

async function pfMarkNotifsRead() {
  const sb = window._supabase;
  const user = window._currentUser;
  if (!sb || !user) return;
  try {
    await sb.rpc('mark_notifications_read', { p_user_id: user.id });
    _pfNotifsLoaded = false;
    pfUpdateNotifDot(false);
    pfLoadNotifications();
  } catch(e) {}
}

function pfUpdateNotifDot(show) {
  const dot = document.getElementById('pfNotifDot');
  if (dot) dot.style.display = show ? '' : 'none';
}

/* ── MAIN INIT ────────────────────────────────────────────────*/
let _pfInitRunning = false;

async function initProfilePage() {
  if (_pfInitRunning) return; // Prevent concurrent duplicate calls
  _pfInitRunning = true;

  const sb   = window._supabase;
  const user = window._currentUser;
  if (!user || !sb) {
    console.warn('initProfilePage: no user or supabase', { user, sb });
    _pfInitRunning = false;
    return;
  }

  const userId = user.id;

  // Notif dot
  try {
    const res = await sb.rpc('get_notifications', { p_user_id: userId, p_limit: 30 });
    const unread = (res.data || []).filter(n => !n.read).length;
    pfUpdateNotifDot(unread > 0);
  } catch(e) {}

  _pfInitRunning = false;
}

/* ── PATCH showPage — with retry if router not ready ──────────*/
let _pfPatched = false;

function _pfPatchShowPage() {
  if (typeof window.showPage !== 'function') {
    // router.js not ready yet — retry
    setTimeout(_pfPatchShowPage, 50);
    return;
  }
  if (_pfPatched) return; // Double-patch guard
  _pfPatched = true;

  const _orig = window.showPage;
  window.showPage = function(page, skipPush) {
    _orig.call(this, page, skipPush);
    if (page === 'profile') {
      pfShowTab('notifications');
      _pfNotifsLoaded = false;
      // FIX JS-2: pehle _pfInitRunning = false PEHLE setTimeout se set hota tha.
      // 50ms ke andar koi aur trigger (auth SIGNED_IN event, loadUserProfile hook)
      // initProfilePage() call karta toh DONO concurrent chalte — double fetch,
      // double render, stale data fresh ko overwrite kar sakta tha.
      // Ab sirf setTimeout ke andar reset karo taaki ek waqt mein sirf ek hi run ho.
      setTimeout(() => {
        _pfInitRunning = false;
        initProfilePage();
      }, 50);
    }
  };
}



_pfPatchShowPage();
document.addEventListener('DOMContentLoaded', () => {
  // Apply patch if not done yet (in case router.js loaded late)
  _pfPatchShowPage();

  // If current URL is /profile on first load, init once user is available
  const path = window.location.pathname;
  if (path === '/profile' || path.startsWith('/profile')) {
    // Auth will trigger initProfilePage via loadUserProfile hook in auth.js.
    // This is a fallback in case the user was already set before DOMContentLoaded.
    setTimeout(() => {
      if (window._currentUser && window._supabase) {
        pfShowTab('notifications');
        initProfilePage();
      }
    }, 600);
  }
});
