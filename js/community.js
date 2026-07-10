/* ═══════════════════════════════════════════
   PUBLIC COMMUNITY PAGE
   Standalone page — anyone can read threads. Posting a thread,
   replying, or voting requires login (same auth gate pattern as CTF).
═══════════════════════════════════════════ */

let _commThreads = [];
let _commCurrentThreadId = null;

function commTimeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function escCommHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function initCommunityPage() {
  // If URL points at a specific thread (/community/thread-id), open it directly.
  const path = window.location.pathname.replace(/\/$/, '');
  if (path.startsWith('/community/')) {
    const id = path.slice('/community/'.length);
    if (id) { openCommThread(id); return; }
  }
  showCommThreadList();
  loadCommThreads();
}

async function loadCommThreads() {
  const sb = window._supabase;
  const el = document.getElementById('commThreadList');
  if (!el || !sb) {
    if (el) el.innerHTML = `<div class="blog-empty">Community is temporarily unavailable. Please check back soon.</div>`;
    return;
  }

  showCommThreadList();
  el.innerHTML = '<div class="blog-empty">Loading threads…</div>';

  try {
    const { data, error } = await sb
      .from('community_threads')
      .select('id, title, category, status, votes, created_at, user_id')
      .order('status', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    _commThreads = data || [];

    if (!_commThreads.length) {
      el.innerHTML = '<div class="blog-empty">No threads yet. Be the first to post!</div>';
      return;
    }

    const { data: replies } = await sb.from('community_replies').select('thread_id');
    const counts = {};
    (replies || []).forEach(r => { counts[r.thread_id] = (counts[r.thread_id]||0) + 1; });

    const userIds = [...new Set(_commThreads.map(t => t.user_id))];
    const { data: profiles } = await sb.from('profiles').select('id, username, full_name').in('id', userIds);
    const nameMap = {};
    (profiles || []).forEach(p => { nameMap[p.id] = p.username || p.full_name || 'Anonymous'; });

    el.innerHTML = _commThreads.map(t => `
      <div class="comm-thread-row" onclick="openCommThread('${t.id}')">
        <div class="comm-thread-icon">${t.status==='pinned' ? '📌' : '💬'}</div>
        <div class="comm-thread-body">
          <div class="comm-thread-title">${escCommHtml(t.title)}</div>
          <div class="comm-thread-meta">@${escCommHtml(nameMap[t.user_id]||'Anonymous')} &middot; ${counts[t.id]||0} replies &middot; ${t.votes||0} votes &middot; ${commTimeAgo(t.created_at)}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('[Community] load error:', e);
    el.innerHTML = '<div class="blog-empty">Could not load threads.</div>';
  }
}

function commRequireLogin() {
  if (window._currentUser) return true;
  if (typeof showAuth === 'function') showAuth('login', 'community');
  return false;
}

function showCommNewThreadForm() {
  if (!commRequireLogin()) return;
  document.getElementById('commListView').style.display = 'none';
  document.getElementById('commNewThreadView').style.display = '';
  document.getElementById('commDetailView').style.display = 'none';
  document.getElementById('commNewThreadTitle').value = '';
  document.getElementById('commNewThreadBody').value = '';
  document.getElementById('commNewThreadCategory').value = 'general';
}

function hideCommNewThreadForm() {
  loadCommThreads();
}

async function submitCommThread() {
  const sb = window._supabase;
  const user = window._currentUser;
  if (!sb || !commRequireLogin()) return;

  const title = document.getElementById('commNewThreadTitle').value.trim();
  const body = document.getElementById('commNewThreadBody').value.trim();
  const category = document.getElementById('commNewThreadCategory').value;

  if (!title || !body) { alert('Please fill in both title and message.'); return; }

  try {
    const { error } = await sb.from('community_threads').insert({
      user_id: user.id, title, body, category
    });
    if (error) throw error;
    loadCommThreads();
  } catch (e) {
    console.error('[Community] submit thread error:', e);
    alert('Could not post thread. Please try again.');
  }
}

async function openCommThread(threadId) {
  const sb = window._supabase;
  if (!sb) return;
  _commCurrentThreadId = threadId;

  showCommThreadDetail();
  document.getElementById('commDetailBody').innerHTML = '<div class="blog-empty">Loading…</div>';
  document.getElementById('commReplies').innerHTML = '';

  const path = '/community/' + threadId;
  if (window.location.pathname !== path) {
    history.pushState({ page: 'community', threadId }, '', path);
  }

  try {
    const { data, error } = await sb.rpc('get_thread_with_replies', { p_thread_id: threadId });
    if (error) throw error;
    if (!data || !data.thread) {
      document.getElementById('commDetailBody').innerHTML = '<div class="blog-empty">Thread not found.</div>';
      return;
    }

    const t = data.thread;
    document.getElementById('commDetailTitle').textContent = t.title;
    document.title = t.title + ' - AlexCyberX Community';
    document.getElementById('commDetailBody').innerHTML = `
      <div class="comm-post-card">
        <div class="comm-post-meta">@${escCommHtml(t.author||'Anonymous')} &middot; ${commTimeAgo(t.created_at)}</div>
        <div class="comm-post-text">${escCommHtml(t.body)}</div>
        <div class="comm-vote-row">
          <button class="comm-vote-btn" onclick="voteCommThread('${t.id}',1)">&#9650;</button>
          <span class="comm-vote-count" id="commThreadVoteCount">${t.votes||0}</span>
          <button class="comm-vote-btn" onclick="voteCommThread('${t.id}',-1)">&#9660;</button>
        </div>
      </div>
    `;

    const repliesEl = document.getElementById('commReplies');
    const replies = data.replies || [];
    if (!replies.length) {
      repliesEl.innerHTML = '<div class="blog-empty">No replies yet.</div>';
    } else {
      repliesEl.innerHTML = replies.map(r => `
        <div class="comm-reply-row">
          <div class="comm-post-meta">@${escCommHtml(r.author||'Anonymous')} &middot; ${commTimeAgo(r.created_at)}</div>
          <div class="comm-post-text">${escCommHtml(r.body)}</div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('[Community] open thread error:', e);
    document.getElementById('commDetailBody').innerHTML = '<div class="blog-empty">Could not load thread.</div>';
  }
}

async function voteCommThread(threadId, value) {
  if (!commRequireLogin()) return;
  const sb = window._supabase;
  try {
    const { data, error } = await sb.rpc('vote_thread', { p_thread_id: threadId, p_value: value });
    if (error) throw error;
    const el = document.getElementById('commThreadVoteCount');
    if (el) el.textContent = data;
  } catch (e) {
    console.error('[Community] vote error:', e);
  }
}

async function submitCommReply() {
  if (!commRequireLogin()) return;
  const sb = window._supabase;
  const user = window._currentUser;
  if (!sb || !user || !_commCurrentThreadId) return;

  const body = document.getElementById('commReplyBody').value.trim();
  if (!body) return;

  try {
    const { error } = await sb.from('community_replies').insert({
      thread_id: _commCurrentThreadId, user_id: user.id, body
    });
    if (error) throw error;
    document.getElementById('commReplyBody').value = '';
    openCommThread(_commCurrentThreadId);
  } catch (e) {
    console.error('[Community] submit reply error:', e);
    alert('Could not post reply. Please try again.');
  }
}

function backToCommThreadList() {
  _commCurrentThreadId = null;
  const path = '/community';
  if (window.location.pathname !== path) {
    history.pushState({ page: 'community' }, '', path);
  }
  document.title = 'Community - AlexCyberX';
  loadCommThreads();
}

function showCommThreadList() {
  const list = document.getElementById('commListView');
  const newForm = document.getElementById('commNewThreadView');
  const detail = document.getElementById('commDetailView');
  if (list) list.style.display = '';
  if (newForm) newForm.style.display = 'none';
  if (detail) detail.style.display = 'none';
}

function showCommThreadDetail() {
  const list = document.getElementById('commListView');
  const newForm = document.getElementById('commNewThreadView');
  const detail = document.getElementById('commDetailView');
  if (list) list.style.display = 'none';
  if (newForm) newForm.style.display = 'none';
  if (detail) detail.style.display = '';
}

// Handle browser Back/Forward for community sub-paths
window.addEventListener('popstate', function () {
  if (currentPage !== 'community') return;
  const path = window.location.pathname.replace(/\/$/, '');
  if (path.startsWith('/community/')) {
    const id = path.slice('/community/'.length);
    if (id) { openCommThread(id); return; }
  }
  backToCommThreadList();
});
