'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionProps } from '../AdminApp';
import { adminSupabase } from '../sb';
import { Card, Empty, Modal, dateTime, timeAgo, useToast } from '../ui';

type Msg = { id: string; name: string | null; email: string | null; message: string | null; is_read: boolean; created_at: string };

export default function Messages({ setBadge }: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [list, setList] = useState<Msg[] | null>(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [open, setOpen] = useState<Msg | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await sb.from('contact_messages').select('id, name, email, message, is_read, created_at').order('created_at', { ascending: false }).limit(200);
    if (error) { setErr(error.message); setList([]); return; }
    setErr('');
    setList(data as Msg[]);
  }, [sb]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (list) setBadge('messages', list.filter((m) => !m.is_read).length); }, [list, setBadge]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (list || []).filter((m) => (filter === 'all' || !m.is_read)
      && (!s || [m.name, m.email, m.message].some((v) => (v || '').toLowerCase().includes(s))));
  }, [list, q, filter]);

  async function view(m: Msg) {
    setOpen(m);
    if (!m.is_read) {
      const { error } = await sb.from('contact_messages').update({ is_read: true }).eq('id', m.id);
      if (!error) setList((l) => (l || []).map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
    }
  }

  async function markUnread(m: Msg) {
    const { error } = await sb.from('contact_messages').update({ is_read: false }).eq('id', m.id);
    if (error) return toast('Could not update: ' + error.message, 'error');
    setList((l) => (l || []).map((x) => (x.id === m.id ? { ...x, is_read: false } : x)));
    setOpen(null);
  }

  async function remove(m: Msg) {
    if (!confirm(`Delete the message from ${m.name || m.email || 'this sender'}? This cannot be undone.`)) return;
    const { error } = await sb.from('contact_messages').delete().eq('id', m.id);
    if (error) return toast('Could not delete: ' + error.message, 'error');
    setList((l) => (l || []).filter((x) => x.id !== m.id));
    setOpen(null);
    toast('Message deleted');
  }

  const unread = (list || []).filter((m) => !m.is_read).length;
  const replyHref = (m: Msg) => 'mailto:' + encodeURIComponent(m.email || '') + '?subject=' + encodeURIComponent('Re: your message to AlexCyberX');

  return (
    <Card title={`Inbox (${unread} unread)`} actions={<>
      <input className="adm-input" placeholder="Search name, email, text" value={q} onChange={(e) => setQ(e.target.value)} id="admMsgSearch" />
      <div className="adm-seg" role="group" aria-label="Filter">
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'unread' ? 'on' : ''} onClick={() => setFilter('unread')} id="admMsgUnread">Unread</button>
      </div>
      <button className="adm-btn ghost" onClick={load}>Refresh</button>
    </>}>
      {list == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load messages: {err}</Empty> : !shown.length ? <Empty>{list.length ? 'No messages match.' : 'No messages yet.'}</Empty> : (
        <ul className="adm-inbox" id="admInbox">
          {shown.map((m) => (
            <li key={m.id} className={m.is_read ? '' : 'unread'}>
              <button className="adm-inbox-row" onClick={() => view(m)}>
                <span className="adm-avatar" aria-hidden="true">{(m.name || m.email || '?').trim().charAt(0).toUpperCase()}</span>
                <span className="adm-inbox-text">
                  <span className="adm-inbox-from">{m.name || 'No name'} <span className="adm-dim">{m.email}</span></span>
                  <span className="adm-inbox-preview">{(m.message || '').slice(0, 140)}</span>
                </span>
                <span className="adm-dim adm-nowrap">{timeAgo(m.created_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <Modal title={'Message from ' + (open.name || open.email || 'unknown')} onClose={() => setOpen(null)}>
          <p className="adm-dim">{open.email}<br />{dateTime(open.created_at)}</p>
          <div className="adm-msg-body" id="admMsgBody">{open.message}</div>
          <div className="adm-actions">
            {open.email && <a className="adm-btn primary" href={replyHref(open)}>Reply by email</a>}
            <button className="adm-btn" onClick={() => markUnread(open)}>Mark unread</button>
            <button className="adm-btn danger" onClick={() => remove(open)}>Delete</button>
          </div>
        </Modal>
      )}
    </Card>
  );
}
