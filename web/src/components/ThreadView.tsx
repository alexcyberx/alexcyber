'use client';

// /community/<id>: #commDetailView of index.html (css/ctf-room.css). The thread
// is server-rendered (app/community/[id]/page.tsx); votes, replies and reports
// run here. Fixes from js/community.js:
// - Locked thread: no reply box, no voting, a Locked badge (community-4). The
//   DB refuses both as well; its message is shown instead of a silent fail.
// - Logged out: the login modal comes back to this thread, not the list (community-8).
// - Report button on the thread and on every reply -> community_reports (community-12).

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { browserSupabase } from '@/lib/supabase';
import CommunityBadge from './CommunityBadge';
import { authorName, fetchThread, LIMITS, timeAgo, writeError, type ThreadWithReplies } from '@/lib/community';

const BackIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L2.5 6l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

type Note = { key: string; ok: boolean; text: string };

export default function ThreadView({ initial, now: serverNow }: { initial: ThreadWithReplies; now: number }) {
  const { user, openAuth } = useAuth();
  const [thread, setThread] = useState(initial.thread);
  const [replies, setReplies] = useState(initial.replies);
  const [now, setNow] = useState(serverNow);
  const [voting, setVoting] = useState(false);
  const [voteMsg, setVoteMsg] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replyMsg, setReplyMsg] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  // report: 'thread' or a reply id
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [reported, setReported] = useState<Record<string, true>>({});
  const [reportNote, setReportNote] = useState<Note | null>(null);

  // Server time first (no hydration mismatch), then the browser clock.
  useEffect(() => { setNow(Date.now()); }, []);

  const locked = thread.status === 'locked';
  const login = () => openAuth('login', `/community/${thread.id}`);
  const apply = (d: ThreadWithReplies) => { setThread(d.thread); setReplies(d.replies); setNow(Date.now()); };

  const vote = async (value: 1 | -1) => {
    const sb = browserSupabase();
    if (!user || !sb) return login();
    if (voting || locked) return;
    setVoting(true);
    setVoteMsg(null);
    try {
      const { data, error } = await sb.rpc('vote_thread', { p_thread_id: thread.id, p_value: value });
      if (error) {
        console.error('[Community] vote error:', error.message);
        if (/locked/i.test(error.message)) setThread((t) => ({ ...t, status: 'locked' }));
        setVoteMsg(writeError(error, 'vote'));
        return;
      }
      setThread((t) => ({ ...t, votes: Number(data) || 0 })); // the RPC returns the new total
    } finally {
      setVoting(false);
    }
  };

  const submitReply = async () => {
    const sb = browserSupabase();
    if (!user || !sb) return login();
    const body = reply.trim();
    if (posting || !body) return;
    setPosting(true);
    setReplyMsg(null);
    try {
      const { error } = await sb.from('community_replies').insert({ thread_id: thread.id, user_id: user.id, body });
      if (error) {
        console.error('[Community] submit reply error:', error.message);
        let text = writeError(error, 'reply');
        if (error.code === '42501') {
          // RLS: locked meanwhile, or a suspended account. The fresh thread tells which.
          const fresh = await fetchThread(sb, thread.id);
          if (fresh && fresh !== 'error') {
            apply(fresh);
            text = fresh.thread.status === 'locked' ? 'This thread is locked.' : 'Your account is suspended.';
          }
        }
        setReplyMsg(text);
        return;
      }
      setReply('');
      const fresh = await fetchThread(sb, thread.id);
      if (fresh && fresh !== 'error') apply(fresh);
    } finally {
      setPosting(false);
    }
  };

  const openReport = (key: string) => {
    if (!user) return login();
    setReportFor((k) => (k === key ? null : key));
    setReason('');
    setReportNote(null);
  };

  const sendReport = async () => {
    const sb = browserSupabase();
    const key = reportFor;
    if (!user || !sb || !key || sending) return;
    const text = reason.trim();
    if (!text) { setReportNote({ key, ok: false, text: 'Please write a short reason.' }); return; }
    setSending(true);
    try {
      // A reply report has only reply_id (the admin panel treats thread_id as "thread report").
      const target = key === 'thread' ? { thread_id: thread.id } : { reply_id: key };
      const { error } = await sb.from('community_reports').insert({ reporter_id: user.id, reason: text, ...target });
      if (error && error.code !== '23505') {
        console.error('[Community] report error:', error.message);
        setReportNote({ key, ok: false, text: writeError(error, 'report') });
        return;
      }
      setReported((r) => ({ ...r, [key]: true }));
      setReportFor(null);
      setReportNote({ key, ok: true, text: error ? 'You have already reported this.' : 'Thanks, a moderator will take a look.' });
    } finally {
      setSending(false);
    }
  };

  // No Report button on your own posts.
  const reportBtn = (key: string, ownerId: string | null) => (user && ownerId === user.id ? null : (
    <button className="comm-report-btn" onClick={() => openReport(key)} disabled={!!reported[key]}>{reported[key] ? 'Reported' : 'Report'}</button>
  ));

  const reportBox = (key: string) => (
    <>
      {reportFor === key && (
        <div className="comm-report-form">
          <input className="profile-input" type="text" aria-label="Report reason" placeholder="Reason (e.g. spam, abuse)" maxLength={LIMITS.reason} autoFocus
            value={reason} onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendReport(); if (e.key === 'Escape') setReportFor(null); }} />
          <button className="comm-report-send" onClick={sendReport} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
          <button className="comm-report-cancel" onClick={() => setReportFor(null)}>Cancel</button>
        </div>
      )}
      {reportNote?.key === key && <div className={'comm-msg' + (reportNote.ok ? ' ok' : '')}>{reportNote.text}</div>}
    </>
  );

  return (
    <div id="commDetailView">
      <div className="comm-toolbar">
        <a className="blog-back-btn" style={{ margin: 0 }} href="/community">
          <BackIcon />
          Back
        </a>
        <div className="pf-section-label" style={{ margin: 0 }} id="commDetailTitle">{thread.title}</div>
      </div>
      <div id="commDetailBody">
        <div className="comm-post-card">
          <div className="comm-post-meta">{`${authorName(thread.author)} · ${timeAgo(thread.created_at, now)}`}<CommunityBadge status={thread.status} /></div>
          <div className="comm-post-text">{thread.body}</div>
          <div className="comm-vote-row">
            <button className="comm-vote-btn" onClick={() => vote(1)} disabled={locked} aria-label="Upvote">&#9650;</button>
            <span className="comm-vote-count" id="commThreadVoteCount">{thread.votes}</span>
            <button className="comm-vote-btn" onClick={() => vote(-1)} disabled={locked} aria-label="Downvote">&#9660;</button>
            {reportBtn('thread', thread.author_id)}
          </div>
          {voteMsg && <div className="comm-msg">{voteMsg}</div>}
          {reportBox('thread')}
        </div>
      </div>
      {locked ? (
        <div className="comm-locked-note">🔒 This thread is locked. New replies and votes are turned off.</div>
      ) : (
        <>
          <div className="profile-field" style={{ marginTop: 20 }}>
            <label className="profile-label" htmlFor="commReplyBody">Reply</label>
            <textarea className="profile-input" id="commReplyBody" rows={3} placeholder="Write a reply..." style={{ resize: 'vertical' }} maxLength={LIMITS.reply}
              value={reply} onChange={(e) => setReply(e.target.value)} />
          </div>
          <button className="profile-save-btn" onClick={submitReply} disabled={posting}>{posting ? 'Posting…' : 'Post Reply'}</button>
          {replyMsg && <div className="profile-msg comm-msg" role="alert">{replyMsg}</div>}
        </>
      )}
      <div id="commReplies" style={{ marginTop: 20 }}>
        {replies.length === 0 ? <div className="blog-empty">No replies yet.</div> : replies.map((r) => (
          <div key={r.id} className="comm-reply-row">
            <div className="comm-post-meta">{`${authorName(r.author)} · ${timeAgo(r.created_at, now)}`}{reportBtn(r.id, r.user_id)}</div>
            <div className="comm-post-text">{r.body}</div>
            {reportBox(r.id)}
          </div>
        ))}
      </div>
    </div>
  );
}
