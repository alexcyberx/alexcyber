/* ═══════════════════════════════════════════════════════════════
   js/leaderboard.js, Public Leaderboard + Public Profile pages
   Both are real Supabase-backed (profiles + ctf_solves are publicly
   readable via RLS). chapter_progress is NOT public (RLS restricts
   it to the owner/admin), so public profiles intentionally do not
   show per-chapter course progress, only XP/level/CTF stats.
═══════════════════════════════════════════════════════════════ */

function lbEscHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/* ── LEADERBOARD PAGE ─────────────────────────────────────────*/
async function loadLeaderboard() {
  const list = document.getElementById('lbList');
  const updatedLabel = document.getElementById('lbUpdatedLabel');
  if (!list) return;
  list.innerHTML = '<div class="pf-empty">Loading…</div>';

  if (!window._supabase) {
    list.innerHTML = '<div class="pf-empty">Not connected to database.</div>';
    return;
  }

  try {
    const { data, error } = await window._supabase
      .from('profiles')
      .select('id, full_name, username, xp, level, ctf_solves')
      .order('xp', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!data || data.length === 0) {
      list.innerHTML = '<div class="pf-empty">No users yet.</div>';
      return;
    }

    const meId = window._currentUser ? window._currentUser.id : null;

    list.innerHTML = data.map((u, idx) => {
      const rank = idx + 1;
      const name = u.full_name || u.username || 'Anonymous';
      const isMe = meId && u.id === meId;
      const level = Math.max(1, Math.floor((u.xp || 0) / 500) + 1);
      return `
      <div class="pf-lb-row ${isMe ? 'pf-lb-row--me' : ''}" style="cursor:pointer;" onclick="viewPublicProfile('${u.id}')">
        <div class="pf-lb-rank">${rank}</div>
        <div class="pf-lb-avatar">${lbEscHtml((name[0] || '?').toUpperCase())}</div>
        <div class="pf-lb-info">
          <div class="pf-lb-name">${lbEscHtml(name)}${isMe ? '<span class="pf-lb-you">YOU</span>' : ''}</div>
          <div class="pf-lb-sub">Level ${level} · ${u.ctf_solves || 0} CTF solves</div>
        </div>
        <div class="pf-lb-xp">${(u.xp || 0).toLocaleString()} XP</div>
      </div>`;
    }).join('');

    if (updatedLabel) updatedLabel.textContent = 'Updated just now';
  } catch (e) {
    console.error('[Leaderboard] load error:', e);
    list.innerHTML = '<div class="pf-empty">Failed to load leaderboard.</div>';
  }
}

/* ── PUBLIC PROFILE PAGE ──────────────────────────────────────*/
let _publicProfileId = null;

function viewPublicProfile(userId) {
  _publicProfileId = userId;
  if (window.location.pathname !== '/u/' + userId) {
    history.pushState({ page: 'publicProfile', userId }, '', '/u/' + userId);
  }
  showPage('publicProfile', true); // skipPush: URL already set above
}

// Deep-link support: if the page was opened directly at /u/:id (fresh load
// or back/forward navigation), pull the id out of the URL.
function _publicProfileIdFromUrl() {
  const m = window.location.pathname.match(/^\/u\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function loadPublicProfile(userId) {
  const notFound = document.getElementById('ppNotFound');
  const content = document.getElementById('ppContent');
  if (notFound) notFound.style.display = 'none';
  if (content) content.style.display = 'block';

  ['ppDisplayName'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 'Loading…'; });
  ['ppXP', 'ppLevel', 'ppCTFSolves'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '-'; });

  if (!window._supabase || !userId) {
    if (notFound) notFound.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }

  try {
    const { data: u, error } = await window._supabase
      .from('profiles')
      .select('id, full_name, username, bio, xp, level, ctf_solves')
      .eq('id', userId)
      .maybeSingle();

    if (error || !u) {
      if (notFound) notFound.style.display = 'block';
      if (content) content.style.display = 'none';
      return;
    }

    const name = u.full_name || u.username || 'Anonymous';
    const level = Math.max(1, Math.floor((u.xp || 0) / 500) + 1);

    document.getElementById('ppAvatar').textContent = (name[0] || '?').toUpperCase();
    document.getElementById('ppDisplayName').textContent = name;
    document.getElementById('ppUsernameTag').textContent = u.username ? '@' + u.username : '';
    document.getElementById('ppBioDisplay').textContent = u.bio || '';
    document.getElementById('ppXP').textContent = (u.xp || 0).toLocaleString();
    document.getElementById('ppLevel').textContent = level;
    document.getElementById('ppCTFSolves').textContent = u.ctf_solves || 0;

    // Rank: count how many users have strictly more XP
    const rankRow = document.getElementById('ppRankRow');
    rankRow.textContent = 'Loading…';
    const { count, error: rankErr } = await window._supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt('xp', u.xp || 0);
    rankRow.textContent = rankErr ? 'Rank unavailable' : `#${(count || 0) + 1} on the leaderboard`;

    // CTF solve history, public via RLS
    const ctfList = document.getElementById('ppCTFList');
    ctfList.innerHTML = '<div class="pf-empty">Loading…</div>';
    const { data: solves, error: solveErr } = await window._supabase
      .from('ctf_solves')
      .select('points_earned, solved_at, ctf_challenges(title, category)')
      .eq('user_id', userId)
      .eq('correct', true)
      .order('solved_at', { ascending: false })
      .limit(20);

    if (solveErr || !solves || solves.length === 0) {
      ctfList.innerHTML = '<div class="pf-empty">No CTF solves yet.</div>';
    } else {
      ctfList.innerHTML = solves.map(s => {
        const ch = s.ctf_challenges;
        const dateStr = s.solved_at ? new Date(s.solved_at).toLocaleDateString() : '-';
        return `
        <div class="pf-lb-row">
          <div class="pf-lb-info">
            <div class="pf-lb-name">${lbEscHtml(ch?.title || 'Unknown challenge')}</div>
            <div class="pf-lb-sub">${lbEscHtml(ch?.category || '-')} · ${dateStr}</div>
          </div>
          <div class="pf-lb-xp">+${s.points_earned || 0}</div>
        </div>`;
      }).join('');
    }
  } catch (e) {
    console.error('[PublicProfile] load error:', e);
    if (notFound) notFound.style.display = 'block';
    if (content) content.style.display = 'none';
  }
}
