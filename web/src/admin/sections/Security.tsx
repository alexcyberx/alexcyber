'use client';

// Security: counts for the last 24 h, blocked IPs (block / unblock), and the
// security log with filters, search, paging and CSV export.

import { useCallback, useEffect, useState } from 'react';
import type { SectionProps } from '../AdminApp';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, Pager, Stat, dateTime, downloadCsv, likeText, num, timeAgo, useToast } from '../ui';

type Log = { id: string; event_type: string; details: string | null; ip: string | null; created_at: string };
type Block = { id: string; ip: string; reason: string | null; created_at: string; expires_at: string | null };

const ATTACKS = ['sqli_attempt', 'xss_attempt', 'path_traversal', 'bot_scan'];
const GROUPS: Record<string, { label: string; types?: string[] }> = {
  all: { label: 'All events' },
  attacks: { label: 'Attacks', types: ATTACKS },
  logins: { label: 'Failed logins', types: ['failed_login'] },
  admin: { label: 'Admin activity', types: ['admin_login', 'admin_logout', 'admin_user_updated', 'admin_user_invited', 'admin_user_deleted', 'export_triggered'] },
  blocks: { label: 'IP blocks', types: ['ip_blocked', 'ip_unblocked'] },
};
const PER_PAGE = 50;
// IPv4 or IPv6 (shape only; the DB stores text).
const IP_RE = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?!$)|$)){4}$|^(?=.*:)[0-9a-fA-F:.]{2,45}$/;

const tone = (t: string) => (ATTACKS.includes(t) || t === 'failed_login' ? 'danger' : t.startsWith('admin_') ? 'accent' : '');

export default function Security(_: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [stats, setStats] = useState<{ failed: number | null; attacks: number | null } | null>(null);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [total, setTotal] = useState(0);
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ip, setIp] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => { setQuery(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const loadTop = useCallback(async () => {
    const day = new Date(Date.now() - 86400e3).toISOString();
    const head = { count: 'exact' as const, head: true };
    const [f, a, b] = await Promise.all([
      sb.from('security_logs').select('id', head).eq('event_type', 'failed_login').gte('created_at', day),
      sb.from('security_logs').select('id', head).in('event_type', ATTACKS).gte('created_at', day),
      sb.from('blocked_ips').select('id, ip, reason, created_at, expires_at').order('created_at', { ascending: false }).limit(500),
    ]);
    setStats({ failed: f.error ? null : f.count || 0, attacks: a.error ? null : a.count || 0 });
    const now = Date.now();
    setBlocks(((b.data || []) as Block[]).filter((x) => !x.expires_at || new Date(x.expires_at).getTime() > now));
  }, [sb]);

  const build = useCallback(() => {
    let r = sb.from('security_logs').select('id, event_type, details, ip, created_at', { count: 'exact' });
    const types = GROUPS[group]?.types;
    if (types) r = r.in('event_type', types);
    const s = likeText(query);
    if (s) r = r.or(`details.ilike.%${s}%,ip.ilike.%${s}%,event_type.ilike.%${s}%`);
    return r.order('created_at', { ascending: false });
  }, [sb, group, query]);

  const loadLogs = useCallback(async () => {
    const from = (page - 1) * PER_PAGE;
    const { data, error, count } = await build().range(from, from + PER_PAGE - 1);
    if (error) { setLogs([]); toast('Could not load the log: ' + error.message, 'error'); return; }
    setLogs(data as Log[]);
    setTotal(count || 0);
  }, [build, page, toast]);

  useEffect(() => { loadTop(); }, [loadTop]);
  useEffect(() => { loadLogs(); }, [loadLogs]);

  async function block(e: React.FormEvent) {
    e.preventDefault();
    const v = ip.trim();
    if (!IP_RE.test(v)) return toast('Enter a valid IPv4 or IPv6 address.', 'error');
    setBusy(true);
    const { error } = await sb.rpc('block_ip', { p_ip: v, p_reason: reason.trim().slice(0, 200) || 'Manually blocked' });
    setBusy(false);
    if (error) return toast('Could not block: ' + error.message, 'error');
    setIp(''); setReason('');
    toast(`${v} blocked`);
    loadTop(); loadLogs();
  }

  async function unblock(b: Block) {
    if (!confirm(`Unblock ${b.ip}?`)) return;
    const { error } = await sb.rpc('unblock_ip', { p_ip: b.ip });
    if (error) return toast('Could not unblock: ' + error.message, 'error');
    toast(`${b.ip} unblocked`);
    loadTop(); loadLogs();
  }

  async function exportCsv() {
    const { data, error } = await build().range(0, 4999);
    if (error) return toast('Export failed: ' + error.message, 'error');
    const list = (data || []) as Log[];
    downloadCsv(`alexcyberx-security-${new Date().toISOString().slice(0, 10)}.csv`, [['Time', 'Event', 'IP', 'Details'], ...list.map((l) => [l.created_at, l.event_type, l.ip, l.details])]);
    logAdminEvent('export_triggered', `security log CSV (${GROUPS[group]?.label || group}, ${list.length} rows)`);
  }

  return (
    <div className="adm-stack">
      <div className="adm-stats">
        <Stat label="Failed logins (24 h)" value={num(stats?.failed)} />
        <Stat label="Attack attempts (24 h)" value={num(stats?.attacks)} />
        <Stat label="Blocked IPs" value={blocks ? num(blocks.length) : '...'} />
      </div>
      <Card title="Blocked IPs">
        <form className="adm-row-form" onSubmit={block}>
          <input className="adm-input" placeholder="IP address" value={ip} onChange={(e) => setIp(e.target.value)} maxLength={45} id="admBlockIp" />
          <input className="adm-input" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} />
          <button className="adm-btn danger" disabled={busy || !ip.trim()} id="admBlockBtn">Block IP</button>
        </form>
        {blocks == null ? <Empty>Loading...</Empty> : !blocks.length ? <Empty>No IPs are blocked.</Empty> : (
          <ul className="adm-list" id="admBlocks">
            {blocks.map((b) => (
              <li key={b.id}>
                <code>{b.ip}</code>
                <span className="adm-list-main adm-dim">{b.reason || 'No reason'}{b.expires_at ? ` | auto, until ${dateTime(b.expires_at)}` : ' | permanent'}</span>
                <span className="adm-dim adm-nowrap">{timeAgo(b.created_at)}</span>
                <button className="adm-btn ghost" onClick={() => unblock(b)}>Unblock</button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Security log" actions={<>
        <input className="adm-input" placeholder="Search details, IP, event" value={q} onChange={(e) => setQ(e.target.value)} id="admLogSearch" />
        <select className="adm-input adm-select" value={group} onChange={(e) => { setGroup(e.target.value); setPage(1); }} aria-label="Event type" id="admLogGroup">
          {Object.entries(GROUPS).map(([k, g]) => <option key={k} value={k}>{g.label}</option>)}
        </select>
        <button className="adm-btn" onClick={exportCsv}>Export CSV</button>
      </>}>
        {logs == null ? <Empty>Loading...</Empty> : !logs.length ? <Empty>No events.</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admLogs">
              <thead><tr><th>Time</th><th>Event</th><th>IP</th><th>Details</th></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="static">
                    <td className="adm-dim adm-nowrap" title={dateTime(l.created_at)}>{timeAgo(l.created_at)}</td>
                    <td><span className={'adm-pill ' + tone(l.event_type)}>{l.event_type}</span></td>
                    <td><code>{l.ip || '-'}</code></td>
                    <td className="adm-wrap">{l.details || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={Math.max(1, Math.ceil(total / PER_PAGE))} total={total} onPage={setPage} />
      </Card>
    </div>
  );
}
