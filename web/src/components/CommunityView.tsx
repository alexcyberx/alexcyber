'use client';

// /community: #commListView + #commNewThreadView of index.html (css/ctf-room.css).
// Logic from js/community.js, with these fixes:
// - One RPC (get_community_threads) instead of 3 queries: pinned threads come
//   first, reply counts are approved replies only, same author name as the
//   thread page (community-5, 9, 10). Rows are server-rendered.
// - Rows are real links to /community/<id> (deep links + reload work, no
//   hand-made history handling: community-2, 11).
// - Locked/pinned threads get a badge; the DB limits are maxLength on the
//   inputs, and the DB's own error (rate limit, suspended) is shown inline.

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { browserSupabase, supabaseConfigured } from '@/lib/supabase';
import CommunityBadge from './CommunityBadge';
import { authorName, CATEGORIES, fetchThreads, LIMITS, timeAgo, writeError, type ThreadRow } from '@/lib/community';

const BackIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L2.5 6l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function CommunityView({ initial, now: serverNow }: { initial: ThreadRow[] | null; now: number }) {
  const { user, openAuth } = useAuth();
  const [threads, setThreads] = useState(initial);
  const [now, setNow] = useState(serverNow);
  const [view, setView] = useState<'list' | 'new'>('list');
  const [form, setForm] = useState({ title: '', category: 'general', body: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const wantNew = useRef(false); // "+ New Thread" clicked while logged out

  // Server time first (no hydration mismatch), then the browser clock.
  useEffect(() => { setNow(Date.now()); }, []);

  const openForm = () => {
    setForm({ title: '', category: 'general', body: '' });
    setMsg(null);
    setView('new');
  };

  // After the login modal: straight to the form the user asked for.
  useEffect(() => {
    if (user && wantNew.current) { wantNew.current = false; openForm(); }
  }, [user]);

  const newThread = () => {
    if (!user) { wantNew.current = true; openAuth('login', '/community'); return; }
    openForm();
  };

  const submit = async () => {
    if (posting) return;
    const sb = browserSupabase();
    if (!user || !sb) { wantNew.current = true; openAuth('login', '/community'); return; }
    const title = form.title.trim(), body = form.body.trim();
    if (!title || !body) { setMsg('Please fill in both title and message.'); return; }
    const category = CATEGORIES.some(([v]) => v === form.category) ? form.category : 'general';
    setPosting(true);
    setMsg(null);
    try {
      const { error } = await sb.from('community_threads').insert({ user_id: user.id, title, body, category });
      if (error) { console.error('[Community] submit thread error:', error.message); setMsg(writeError(error, 'thread')); return; }
      const fresh = await fetchThreads(sb);
      if (fresh) setThreads(fresh);
      setNow(Date.now());
      setView('list');
    } finally {
      setPosting(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      {/* Thread list view */}
      <div id="commListView" style={{ display: view === 'list' ? '' : 'none' }}>
        <div className="blog-hero" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--accent)', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 14, padding: '3px 14px', border: '1px solid var(--glow-border)', borderRadius: 20, background: 'var(--red-dim)', display: 'inline-block' }}>COMMUNITY</div>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 34, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 12 }}>Discussion Forum</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7 }}>Ask questions, share writeups, and talk shop with the community.</p>
        </div>
        <div className="comm-toolbar">
          <div className="pf-section-label" style={{ margin: 0 }}>All Threads</div>
          <button className="nav-btn fill" style={{ fontSize: 12, padding: '8px 16px' }} onClick={newThread}>+ New Thread</button>
        </div>
        <div id="commThreadList" className="comm-thread-list">
          {!supabaseConfigured() ? <div className="blog-empty">Community is temporarily unavailable. Please check back soon.</div>
            : threads === null ? <div className="blog-empty">Could not load threads.</div>
            : threads.length === 0 ? <div className="blog-empty">No threads yet. Be the first to post!</div>
            : threads.map((t) => (
              <a key={t.id} className="comm-thread-row" href={`/community/${t.id}`}>
                <div className="comm-thread-icon">{t.status === 'pinned' ? '📌' : t.status === 'locked' ? '🔒' : '💬'}</div>
                <div className="comm-thread-body">
                  <div className="comm-thread-title">{t.title}<CommunityBadge status={t.status} /></div>
                  {/* one text node, like the old innerHTML (split nodes shift the glyphs by a subpixel) */}
                  <div className="comm-thread-meta">{`${authorName(t.author)} · ${t.reply_count} replies · ${t.votes} votes · ${timeAgo(t.created_at, now)}`}</div>
                </div>
              </a>
            ))}
        </div>
      </div>

      {/* New thread form */}
      <div id="commNewThreadView" style={{ display: view === 'new' ? '' : 'none' }}>
        <div className="comm-toolbar">
          <button className="blog-back-btn" style={{ margin: 0 }} onClick={() => setView('list')}>
            <BackIcon />
            Back
          </button>
          <div className="pf-section-label" style={{ margin: 0 }}>New Thread</div>
        </div>
        <div className="profile-field">
          <label className="profile-label" htmlFor="commNewThreadTitle">Title</label>
          <input className="profile-input" id="commNewThreadTitle" type="text" placeholder="Thread title..." maxLength={LIMITS.title} value={form.title} onChange={set('title')} />
        </div>
        <div className="profile-field">
          <label className="profile-label" htmlFor="commNewThreadCategory">Category</label>
          <select className="profile-input" id="commNewThreadCategory" value={form.category} onChange={set('category')}>
            {CATEGORIES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
        <div className="profile-field">
          <label className="profile-label" htmlFor="commNewThreadBody">Message</label>
          <textarea className="profile-input" id="commNewThreadBody" rows={6} placeholder="What's on your mind?" style={{ resize: 'vertical' }} maxLength={LIMITS.body} value={form.body} onChange={set('body')} />
        </div>
        <button className="profile-save-btn" onClick={submit} disabled={posting}>{posting ? 'Posting…' : 'Post Thread'}</button>
        {msg && <div className="profile-msg comm-msg" role="alert">{msg}</div>}
      </div>
    </>
  );
}
