/* ═══════════════════════════════════════════════════
   js/profile.js  —  AlexCyberX Profile Dashboard
   Phase 2: read-only stats + badges + leaderboard
             + notifications + settings tab
   Depends on: _supabase (config.js), window._currentUser (auth.js),
               showPage / saveProfile / doLogout (router.js / auth.js)
═══════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────
   BADGE SVG SYSTEM (copied from admin.html so profile
   can render badge icons without importing admin)
─────────────────────────────────────────────────*/
const PF_BADGE_ICONS = {
  medal:   '<path d="M7 2l1.2 3.6H12L9.1 7.4l1.1 3.6L7 9l-3.2 2 1.1-3.6L2 5.6h3.8z" stroke="C" stroke-width="1.3" stroke-linejoin="round"/>',
  flame:   '<path d="M7 12c-2.8 0-5-1.8-5-4.5 0-1.8 1-3 2-4 .2 1.2.8 2 1.5 2.5C5.5 4.5 6.5 2 7 1c.5 2 2.5 3 2.5 5 .7-.5 1.2-1.3 1.5-2.5 1 1 2 2.2 2 4C13 10.2 9.8 12 7 12z" stroke="C" stroke-width="1.2" stroke-linejoin="round"/>',
  book:    '<path d="M3 2h7a1 1 0 011 1v9a1 1 0 01-1 1H3V2z" stroke="C" stroke-width="1.2"/><path d="M3 2a1 1 0 00-1 1v9a1 1 0 001 1" stroke="C" stroke-width="1.2"/><path d="M6 5h3M6 7.5h3M6 10h2" stroke="C" stroke-width="1.1" stroke-linecap="round"/>',
  bolt:    '<path d="M9 1.5L4 7.5h4L6 13 12 6H8L9 1.5z" stroke="C" stroke-width="1.3" stroke-linejoin="round"/>',
  shield:  '<path d="M7 1.5L2 3.5V7c0 2.8 2.2 4.8 5 5.5 2.8-.7 5-2.7 5-5.5V3.5L7 1.5z" stroke="C" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.5 7l2 2 3-3" stroke="C" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  diamond: '<path d="M7 1.5L11.5 6 7 12.5 2.5 6z" stroke="C" stroke-width="1.3" stroke-linejoin="round"/><path d="M2.5 6h9" stroke="C" stroke-width="1.1"/>',
  star:    '<path d="M7 1.5l1.5 3.5 3.5.5-2.5 2.5.6 3.5L7 9.5l-3.1 2 .6-3.5L2 5.5l3.5-.5z" stroke="C" stroke-width="1.2" stroke-linejoin="round"/>',
  trophy:  '<path d="M4 2h6v4a3 3 0 01-6 0V2z" stroke="C" stroke-width="1.2"/><path d="M4 4H2.5a1.5 1.5 0 000 3H4M10 4h1.5a1.5 1.5 0 010 3H10M7 9v2M5 11h4" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',
  target:  '<circle cx="7" cy="7" r="5.5" stroke="C" stroke-width="1.2"/><circle cx="7" cy="7" r="3" stroke="C" stroke-width="1.2"/><circle cx="7" cy="7" r="1" fill="C"/>',
  key:     '<circle cx="5" cy="6.5" r="3" stroke="C" stroke-width="1.2"/><path d="M7.5 8.5l4 4M9.5 10.5l1.5-1.5" stroke="C" stroke-width="1.3" stroke-linecap="round"/>',
  lock:    '<rect x="3" y="6" width="8" height="6" rx="1.5" stroke="C" stroke-width="1.2"/><path d="M5 6V4.5a2 2 0 014 0V6" stroke="C" stroke-width="1.2" stroke-linecap="round"/>',
  eye:     '<path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7z" stroke="C" stroke-width="1.2"/><circle cx="7" cy="7" r="1.5" stroke="C" stroke-width="1.2"/>',
};

function pfBadgeSVG(icon, color) {
  const path = PF_BADGE_ICONS[icon] || PF_BADGE_ICONS['star'];
  return `<svg width="22" height="22" viewBox="0 0 14 14" fill="none">${path.replace(/C/g, color)}</svg>`;
}

/* ───────────────────────────────────────────────
   DAILY CHALLENGE — date-seeded deterministic RNG
─────────────────────────────────────────────────*/
function pfDailyChallenge(challenges) {
  if (!challenges || !challenges.length) return null;
  // Seed: integer of today's date (YYYYMMDD)
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  // Simple LCG hash
  const idx = Math.abs((seed * 1103515245 + 12345) & 0x7fffffff) % challenges.length;
  return challenges[idx];
}

/* ───────────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────────*/
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
  const day = Math.floor(h / 24);
  return day + 'd ago';
}

function pfCatColor(cat) {
  const map = {
    web: '#3b82f6', network: '#10b981', forensics: '#f59e0b',
    crypto: '#a855f7', osint: '#06b6d4', binary: '#ef4444',
  };
  return map[(cat||'').toLowerCase()] || '#6a6a7a';
}

/* ───────────────────────────────────────────────
   TAB SWITCHER
─────────────────────────────────────────────────*/
function pfShowTab(tab) {
  document.querySelectorAll('.pf-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.querySelectorAll('.pf-tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === 'pfTab-' + tab)
  );
  // Lazy-load leaderboard on first open
  if (tab === 'leaderboard') pfLoadLeaderboard(false);
  // Load notifications on first open
  if (tab === 'notifications') pfLoadNotifications();
}

/* ───────────────────────────────────────────────
   RENDER STATS from get_profile_stats() result
─────────────────────────────────────────────────*/
function pfRenderStats(s) {
  // Hero numbers
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  const xp      = s.xp || 0;
  const level   = s.level || 1;
  const rank    = s.rank  || '—';
  const solved  = s.ctf_solved  || 0;
  const total   = s.ctf_total   || 0;
  const badges  = s.badge_count || 0;
  const bloods  = s.first_blood_count || 0;
  const streakC = s.streak_current || 0;
  const streakL = s.streak_longest || 0;

  setText('pfXP',            xp.toLocaleString());
  setText('pfLevel',         level);
  setText('pfRank',          rank === null ? '—' : '#' + rank);
  setText('pfSolved',        solved);
  setText('pfRemaining',     Math.max(0, total - solved));
  setText('pfBadges',        badges);
  setText('pfFirstBloods',   bloods);
  setText('pfStreakCurrent', streakC);
  setText('pfStreakLongest', streakL);

  // XP bar: 500 XP per level
  const xpInLevel   = xp % 500;
  const pct         = Math.min(100, Math.round((xpInLevel / 500) * 100));
  const fill        = document.getElementById('pfXpFill');
  const pctEl       = document.getElementById('pfXpBarPct');
  const labelEl     = document.getElementById('pfXpBarLabel');
  if (fill)   fill.style.width = pct + '%';
  if (pctEl)  pctEl.textContent = pct + '%';
  if (labelEl) labelEl.textContent = `Lv ${level} → Lv ${level + 1}`;

  // Streak dots (last 7 days visual — always show 7, fill current streak)
  const dotsEl = document.getElementById('pfStreakDots');
  if (dotsEl) {
    const filled = Math.min(7, streakC);
    dotsEl.innerHTML = Array.from({ length: 7 }, (_, i) =>
      `<div class="pf-streak-dot ${i < filled ? 'on' : ''}"></div>`
    ).join('');
  }

  // Recent solves
  pfRenderRecentSolves(s.recent_solves);
}

function pfRenderRecentSolves(solves) {
  const el = document.getElementById('pfRecentSolves');
  if (!el) return;
  if (!solves || !solves.length) {
    el.innerHTML = '<div class="pf-empty">No challenges solved yet. <button class="pf-inline-link" onclick="showPage(\'ctf\')">Start now →</button></div>';
    return;
  }
  el.innerHTML = solves.map(s => `
    <div class="pf-activity-row">
      <div class="pf-activity-dot" style="background:${pfCatColor(s.category)}"></div>
      <div class="pf-activity-info">
        <div class="pf-activity-title">${escHtml(s.title)}</div>
        <div class="pf-activity-meta">
          <span style="color:${pfCatColor(s.category)};font-size:10px;text-transform:uppercase;letter-spacing:1px;">${escHtml(s.category)}</span>
          <span class="pf-meta-sep">·</span>
          <span>+${s.points || 0} pts</span>
          <span class="pf-meta-sep">·</span>
          <span>${pfTimeAgo(s.solved_at)}</span>
        </div>
      </div>
      <div class="pf-activity-pts">+${s.points || 0} XP</div>
    </div>
  `).join('');
}

/* ───────────────────────────────────────────────
   RENDER BADGES
─────────────────────────────────────────────────*/
function pfRenderBadges(earnedBadges, allBadges) {
  const earnedEl  = document.getElementById('pfBadgeGrid');
  const lockedEl  = document.getElementById('pfBadgeGridLocked');
  if (!earnedEl || !lockedEl) return;

  const earnedIds = new Set((earnedBadges || []).map(b => b.badge_id));

  // Earned
  if (!earnedBadges || !earnedBadges.length) {
    earnedEl.innerHTML = '<div class="pf-empty">No badges earned yet. Keep going!</div>';
  } else {
    earnedEl.innerHTML = earnedBadges.map(b => `
      <div class="pf-badge-card earned" title="Earned ${pfTimeAgo(b.earned_at)}">
        <div class="pf-badge-icon" style="background:${escHtml(b.color)}22">${pfBadgeSVG(b.icon, b.color)}</div>
        <div class="pf-badge-name">${escHtml(b.name)}</div>
        <div class="pf-badge-date">${pfTimeAgo(b.earned_at)}</div>
      </div>
    `).join('');
  }

  // Locked — show all badges not yet earned
  const locked = (allBadges || []).filter(b => !earnedIds.has(b.id));
  if (!locked.length) {
    lockedEl.innerHTML = '<div class="pf-empty">You have earned every badge! 🎉</div>';
  } else {
    lockedEl.innerHTML = locked.map(b => `
      <div class="pf-badge-card locked" title="${escHtml(b.description || '')}">
        <div class="pf-badge-icon pf-badge-icon--locked">${pfBadgeSVG(b.icon, '#3a3a4a')}</div>
        <div class="pf-badge-name pf-badge-name--locked">${escHtml(b.name)}</div>
        <div class="pf-badge-rule">${pfBadgeRule(b)}</div>
      </div>
    `).join('');
  }
}

function pfBadgeRule(b) {
  switch (b.rule) {
    case 'xp':       return `Earn ${(b.value||0).toLocaleString()} XP`;
    case 'ctf':      return `Solve ${b.value} challenge${b.value > 1 ? 's' : ''}`;
    case 'streak':   return `${b.value}-day streak`;
    case 'chapters': return `Complete ${b.value} chapters`;
    case 'manual':   return 'Admin award';
    default:         return b.description || '';
  }
}

/* ───────────────────────────────────────────────
   LEADERBOARD (on-demand fetch)
─────────────────────────────────────────────────*/
let _pfLbLoaded = false;

async function pfLoadLeaderboard(force) {
  if (_pfLbLoaded && !force) return;
  const el = document.getElementById('pfLeaderboard');
  if (!el || !_supabase) return;

  el.innerHTML = '<div class="pf-empty">Loading…</div>';

  try {
    const { data, error } = await _supabase.rpc('get_leaderboard', { p_limit: 50 });
    if (error) throw error;

    _pfLbLoaded = true;

    if (!data || !data.length) {
      el.innerHTML = '<div class="pf-empty">No players yet.</div>';
      return;
    }

    const myId = window._currentUser?.id;

    el.innerHTML = data.map((u, i) => {
      const isMe  = u.user_id === myId;
      const rank  = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
      const name  = escHtml(u.username || u.full_name || 'Anonymous');
      return `
        <div class="pf-lb-row ${isMe ? 'pf-lb-row--me' : ''}">
          <div class="pf-lb-rank">${medal || rank}</div>
          <div class="pf-lb-avatar">${(name[0] || '?').toUpperCase()}</div>
          <div class="pf-lb-info">
            <div class="pf-lb-name">${name}${isMe ? ' <span class="pf-lb-you">you</span>' : ''}</div>
            <div class="pf-lb-sub">Lv ${u.level} · ${u.ctf_solves} solved · ${u.badge_count} badges</div>
          </div>
          <div class="pf-lb-xp">${(u.xp||0).toLocaleString()} XP</div>
        </div>
      `;
    }).join('');
  } catch(e) {
    el.innerHTML = '<div class="pf-empty">Could not load leaderboard.</div>';
  }
}

/* ───────────────────────────────────────────────
   NOTIFICATIONS
─────────────────────────────────────────────────*/
let _pfNotifsLoaded = false;

async function pfLoadNotifications() {
  if (_pfNotifsLoaded) return;
  const el = document.getElementById('pfNotifList');
  if (!el || !_supabase || !window._currentUser) return;

  el.innerHTML = '<div class="pf-empty">Loading…</div>';

  try {
    // Fetch own notifications + broadcasts (user_id IS NULL handled by RLS)
    const { data, error } = await _supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${window._currentUser.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
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
    el.innerHTML = '<div class="pf-empty">Could not load notifications.</div>';
  }
}

async function pfMarkNotifsRead() {
  if (!_supabase || !window._currentUser) return;
  try {
    await _supabase.rpc('mark_notifications_read', { p_user_id: window._currentUser.id });
    _pfNotifsLoaded = false; // force re-render
    pfUpdateNotifDot(false);
    pfLoadNotifications();
  } catch(e) {}
}

function pfUpdateNotifDot(show) {
  const dot = document.getElementById('pfNotifDot');
  if (dot) dot.style.display = show ? '' : 'none';
}

/* ───────────────────────────────────────────────
   DAILY CHALLENGE RENDER
─────────────────────────────────────────────────*/
function pfRenderDailyChallenge(challenges) {
  const el = document.getElementById('pfDailyInner');
  if (!el) return;

  const ch = pfDailyChallenge(challenges);
  if (!ch) {
    el.innerHTML = '<div class="pf-daily-loading">No challenges available.</div>';
    return;
  }

  el.innerHTML = `
    <div class="pf-daily-cat" style="color:${pfCatColor(ch.category)}">${escHtml(ch.category || '').toUpperCase()}</div>
    <div class="pf-daily-title">${escHtml(ch.title)}</div>
    <div class="pf-daily-meta">
      <span class="pf-daily-diff pf-daily-diff--${(ch.difficulty||'').toLowerCase()}">${escHtml(ch.difficulty || '')}</span>
      <span>·</span>
      <span>${ch.points || 0} pts</span>
    </div>
    <button class="pf-daily-btn" onclick="showPage('ctf')">Go to challenge →</button>
  `;
}

/* ───────────────────────────────────────────────
   MAIN INIT — called by showPage('profile')
─────────────────────────────────────────────────*/
async function initProfilePage() {
  if (!window._currentUser || !_supabase) return;

  const userId = window._currentUser.id;

  // Update login streak (fire-and-forget)
  _supabase.rpc('update_login_streak', { p_user_id: userId }).catch(() => {});

  // Load all data in parallel
  const [statsRes, badgesRes, allBadgesRes, challengesRes] = await Promise.allSettled([
    _supabase.rpc('get_profile_stats', { p_user_id: userId }),
    _supabase.from('user_badges')
      .select('badge_id, earned_at, badges(id, name, icon, color, rule, value, description)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false }),
    _supabase.from('badges').select('*').order('created_at'),
    _supabase.from('ctf_challenges').select('id,title,category,difficulty,points').eq('status','active'),
  ]);

  // Stats
  if (statsRes.status === 'fulfilled' && !statsRes.value.error) {
    pfRenderStats(statsRes.value.data || {});
  }

  // Badges
  const earnedBadges = (badgesRes.status === 'fulfilled' && !badgesRes.value.error)
    ? (badgesRes.value.data || []).map(r => ({
        badge_id:    r.badge_id,
        earned_at:   r.earned_at,
        name:        r.badges?.name,
        icon:        r.badges?.icon,
        color:       r.badges?.color,
      }))
    : [];
  const allBadges = (allBadgesRes.status === 'fulfilled' && !allBadgesRes.value.error)
    ? (allBadgesRes.value.data || [])
    : [];
  pfRenderBadges(earnedBadges, allBadges);

  // Daily challenge
  const challenges = (challengesRes.status === 'fulfilled' && !challengesRes.value.error)
    ? (challengesRes.value.data || [])
    : [];
  pfRenderDailyChallenge(challenges);

  // Notifications dot (quick unread count — don't load full list yet)
  try {
    const { count } = await _supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('read', false);
    pfUpdateNotifDot(count > 0);
  } catch(e) {}
}

/* ───────────────────────────────────────────────
   HOOK INTO router.js showPage('profile')
   We patch showPage to call initProfilePage after
   the original function runs.
─────────────────────────────────────────────────*/
(function patchShowPage() {
  const _orig = window.showPage;
  if (typeof _orig !== 'function') {
    // router.js not yet loaded — retry once scripts are deferred
    window.addEventListener('DOMContentLoaded', patchShowPage);
    return;
  }
  window.showPage = function(page, skipPush) {
    _orig.call(this, page, skipPush);
    if (page === 'profile') {
      // Reset tab state to activity on each open
      pfShowTab('activity');
      // Reset lazy-load flags so data refreshes each visit
      _pfLbLoaded    = false;
      _pfNotifsLoaded = false;
      initProfilePage();
    }
  };
})();
