// /community and /community/<id>: types, DB limits, error texts and the
// server-side reads. Reading is public (threads + approved replies), so the
// pages are server-rendered with the anon key; writes happen in the browser.

import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { serverSupabase } from './supabase';

export type ThreadStatus = 'open' | 'pinned' | 'locked';

// get_community_threads(): pinned first, then newest. reply_count = approved
// replies only, author = username or full name (same as the thread page).
export type ThreadRow = {
  id: string; title: string; category: string; status: ThreadStatus; votes: number;
  created_at: string; author: string | null; author_id: string | null; reply_count: number;
};

export type Thread = {
  id: string; title: string; body: string; category: string; status: ThreadStatus; votes: number;
  created_at: string; author: string | null; author_id: string | null;
};

export type Reply = { id: string; body: string; votes: number; created_at: string; user_id: string; author: string | null };

export type ThreadWithReplies = { thread: Thread; replies: Reply[] };

// Same limits as the DB CHECK constraints (migration 2026-10-14_step5a_security.sql).
export const LIMITS = { title: 200, body: 5000, reply: 3000, reason: 200 };

export const CATEGORIES: [string, string][] = [
  ['general', 'General'], ['help', 'Help & Questions'], ['ctf', 'CTF Discussion'], ['tools', 'Tools'], ['news', 'News'],
];

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `now` comes from the server render first, so server and browser print the same text. */
export function timeAgo(iso: string | null, now: number): string {
  if (!iso) return '';
  const m = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

export const authorName = (a: string | null | undefined) => '@' + (a || 'Anonymous');

type DbError = { code?: string; message?: string } | null;

/**
 * Text for a failed write. The DB says why: rate limit trigger (P0001, its own
 * message), CHECK constraint (23514), RLS (42501: banned, or a locked thread).
 */
export function writeError(e: DbError, what: 'thread' | 'reply' | 'report' | 'vote'): string {
  const msg = e?.message || '';
  if (e?.code === 'P0001' && msg) return msg;
  if (/suspended/i.test(msg)) return 'Your account is suspended.';
  if (/locked/i.test(msg)) return 'This thread is locked.';
  if (e?.code === '23514') return what === 'reply' ? 'Your reply is too long.' : what === 'report' ? 'The reason is too long.' : 'Your post is too long or the category is invalid.';
  if (e?.code === '23505') return 'You have already reported this.';
  if (e?.code === '42501') return what === 'reply' ? 'This thread is locked or your account is suspended.' : 'Your account is suspended.';
  if (e?.code === 'PGRST301' || /JWT/i.test(msg)) return 'Your session has expired. Please log in again.';
  return {
    thread: 'Could not post thread. Please try again.',
    reply: 'Could not post reply. Please try again.',
    report: 'Could not send the report. Please try again.',
    vote: 'Could not save your vote. Please try again.',
  }[what];
}

function toRow(r: ThreadRow): ThreadRow {
  return { ...r, votes: Number(r.votes) || 0, reply_count: Number(r.reply_count) || 0 };
}

/** Latest threads (null = could not load). Used by the server page and after a new post. */
export async function fetchThreads(sb: SupabaseClient | null, limit = 50): Promise<ThreadRow[] | null> {
  if (!sb) return null;
  const { data, error } = await sb.rpc('get_community_threads', { p_limit: limit });
  if (error) { console.error('[community] threads', error.message); return null; }
  return ((data || []) as ThreadRow[]).map(toRow);
}

/** One thread + approved replies. null = no such thread; 'error' = the DB failed. */
export async function fetchThread(sb: SupabaseClient | null, id: string): Promise<ThreadWithReplies | null | 'error'> {
  if (!UUID.test(id)) return null;
  if (!sb) return 'error';
  const { data, error } = await sb.rpc('get_thread_with_replies', { p_thread_id: id });
  if (error) { console.error('[community] thread', error.message); return error.code === '22P02' ? null : 'error'; }
  if (!data || !data.thread) return null;
  const d = data as ThreadWithReplies;
  return {
    thread: { ...d.thread, votes: Number(d.thread.votes) || 0 },
    replies: (d.replies || []).map((r) => ({ ...r, votes: Number(r.votes) || 0 })),
  };
}

// Server side: one RPC per request, shared by generateMetadata and the page.
export const getThread = cache((id: string) => fetchThread(serverSupabase(), id));
export const getThreads = () => fetchThreads(serverSupabase());
