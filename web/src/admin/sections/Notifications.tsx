'use client';

// Notifications: send an in-site announcement (send_broadcast RPC) to everyone,
// recently active users, new users, or one person (searched in the DB), and
// see what was sent before.

import { useCallback, useEffect, useState } from 'react';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, dateTime, likeText, num, timeAgo, useToast } from '../ui';

// Values the RPC understands (supabase: send_broadcast).
const AUDIENCES = [
  { v: 'All Users', label: 'Everyone' },
  { v: 'Active Only', label: 'Active in the last 7 days' },
  { v: 'New Users (last 7d)', label: 'Joined in the last 7 days' },
  { v: 'Specific User', label: 'One person' },
] as const;

type Sent = { id: string; title: string; body: string | null; audience: string | null; recipient_count: number | null; created_at: string };
type Person = { id: string; full_name: string | null; username: string | null };

export default function Notifications(_: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<string>('All Users');
  const [target, setTarget] = useState<Person | null>(null);
  const [find, setFind] = useState('');
  const [found, setFound] = useState<Person[]>([]);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Sent[] | null>(null);

  const loadHistory = useCallback(async () => {
    const { data, error } = await sb.from('broadcasts').select('id, title, body, audience, recipient_count, created_at').order('created_at', { ascending: false }).limit(50);
    setHistory(error ? [] : (data as Sent[]));
  }, [sb]);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Person search (real users, by name or username).
  useEffect(() => {
    const s = likeText(find);
    if (audience !== 'Specific User' || s.length < 2) { setFound([]); return; }
    const t = setTimeout(async () => {
      const { data } = await sb.from('profiles').select('id, full_name, username').or(`full_name.ilike.%${s}%,username.ilike.%${s}%`).limit(8);
      setFound((data || []) as Person[]);
    }, 250);
    return () => clearTimeout(t);
  }, [sb, find, audience]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim(), b = body.trim();
    if (!t || !b) return toast('Write a title and a message.', 'error');
    if (audience === 'Specific User' && !target) return toast('Pick the person first.', 'error');
    const label = AUDIENCES.find((a) => a.v === audience)?.label || audience;
    if (!confirm(`Send "${t}" to: ${audience === 'Specific User' ? (target?.full_name || target?.username) : label}?`)) return;
    setBusy(true);
    const { data, error } = await sb.rpc('send_broadcast', { p_title: t.slice(0, 120), p_body: b.slice(0, 1000), p_audience: audience, p_target_user_id: audience === 'Specific User' ? target!.id : null });
    setBusy(false);
    if (error) return toast('Could not send: ' + error.message, 'error');
    const n = (data as { recipient_count?: number } | null)?.recipient_count ?? 0;
    toast(`Sent to ${n} ${n === 1 ? 'person' : 'people'}`);
    logAdminEvent('admin_broadcast', `"${t.slice(0, 80)}" to ${audience} (${n})`);
    setTitle(''); setBody(''); setTarget(null); setFind('');
    loadHistory();
  }

  return (
    <div className="adm-grid-2 top">
      <Card title="Send announcement">
        <form className="adm-form" onSubmit={send} id="admBroadcastForm">
          <p className="adm-help">Shows up in the bell on the site for the people you pick.</p>
          <label className="adm-field"><span>Title</span><input maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} id="admBcTitle" /></label>
          <label className="adm-field"><span>Message</span><textarea rows={4} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} id="admBcBody" /></label>
          <label className="adm-field"><span>Send to</span>
            <select value={audience} onChange={(e) => { setAudience(e.target.value); setTarget(null); }} id="admBcAudience">
              {AUDIENCES.map((a) => <option key={a.v} value={a.v}>{a.label}</option>)}
            </select>
          </label>
          {audience === 'Specific User' && (
            target ? (
              <div className="adm-picked" id="admBcPicked">
                <span>{target.full_name || target.username}{target.username && <span className="adm-dim"> @{target.username}</span>}</span>
                <button type="button" className="adm-link" onClick={() => setTarget(null)}>Change</button>
              </div>
            ) : (
              <div>
                <label className="adm-field"><span>Find the person</span><input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Name or username" id="admBcFind" /></label>
                {!!found.length && (
                  <ul className="adm-pick-list" id="admBcResults">
                    {found.map((p) => <li key={p.id}><button type="button" onClick={() => setTarget(p)}>{p.full_name || p.username || 'No name'}{p.username && <span className="adm-dim"> @{p.username}</span>}</button></li>)}
                  </ul>
                )}
              </div>
            )
          )}
          <div className="adm-actions"><button className="adm-btn primary" disabled={busy} id="admBcSend">{busy ? 'Sending...' : 'Send'}</button></div>
        </form>
      </Card>
      <Card title="Sent before">
        {history == null ? <Empty>Loading...</Empty> : !history.length ? <Empty>Nothing sent yet.</Empty> : (
          <ul className="adm-list" id="admBcHistory">
            {history.map((h) => (
              <li key={h.id} className="adm-list-col">
                <div className="adm-list-row"><span className="adm-strong adm-list-main">{h.title}</span><span className="adm-dim adm-nowrap" title={dateTime(h.created_at)}>{timeAgo(h.created_at)}</span></div>
                {h.body && <div className="adm-dim adm-wrap">{h.body}</div>}
                <div className="adm-dim">{h.audience || 'All Users'} | {num(h.recipient_count || 0)} received</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
