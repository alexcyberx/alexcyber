'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SectionProps } from '../AdminApp';
import { adminSupabase } from '../sb';
import { Card, Empty, Stat, TrendChart, num, timeAgo, useToast } from '../ui';

type Stats = { users: number | null; new7: number | null; active: number | null; solves: number | null; unread: number | null };
type Views = { total: number; today: number; trend: { views: number; date?: string; day?: string }[] } | null;
type Signup = { id: string; full_name: string | null; username: string | null; created_at: string };

const count = (r: { count: number | null; error: unknown }) => (r.error ? null : r.count ?? 0);

export default function Dashboard({ go, setBadge }: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [views, setViews] = useState<Views | undefined>(undefined);
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const [maint, setMaint] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const day = new Date(Date.now() - 86400e3).toISOString();
    const week = new Date(Date.now() - 7 * 86400e3).toISOString();
    const head = { count: 'exact' as const, head: true };
    const [u, n, a, s, m, pv, su, st] = await Promise.all([
      sb.from('profiles').select('id', head),
      sb.from('profiles').select('id', head).gte('created_at', week),
      sb.from('profiles').select('id', head).gte('last_seen', day),
      sb.from('ctf_solves').select('id', head).eq('correct', true),
      sb.from('contact_messages').select('id', head).eq('is_read', false),
      sb.rpc('get_page_view_stats'),
      sb.from('profiles').select('id, full_name, username, created_at').order('created_at', { ascending: false }).limit(6),
      sb.rpc('get_site_settings'),
    ]);
    setStats({ users: count(u), new7: count(n), active: count(a), solves: count(s), unread: count(m) });
    if (!m.error) setBadge('messages', m.count || 0);
    setViews(pv.error ? null : (pv.data as Views));
    setSignups(su.error ? [] : (su.data as Signup[]));
    setMaint(st.error ? null : !!(st.data as { maintenance_mode?: boolean } | null)?.maintenance_mode);
  }, [sb, setBadge]);

  useEffect(() => { load(); }, [load]);

  async function toggleMaintenance() {
    if (maint == null || busy) return;
    const on = !maint;
    if (on && !confirm('Turn ON maintenance mode? Visitors will see a "down for maintenance" screen.')) return;
    setBusy(true);
    const { data: cur, error: e1 } = await sb.rpc('get_site_settings');
    const { error } = e1 ? { error: e1 } : await sb.rpc('save_site_settings', { p_settings: { ...(cur as object || {}), maintenance_mode: on } });
    setBusy(false);
    if (error) return toast('Could not save: ' + error.message, 'error');
    setMaint(on);
    toast(on ? 'Maintenance mode is ON' : 'Maintenance mode is OFF');
  }

  const trend = views?.trend || [];
  return (
    <div className="adm-stack">
      <div className="adm-stats">
        <Stat label="Total users" value={num(stats?.users)} sub={stats?.new7 != null ? `+${num(stats.new7)} this week` : undefined} />
        <Stat label="Active (24 h)" value={num(stats?.active)} />
        <Stat label="CTF solves" value={num(stats?.solves)} />
        <Stat label="Unread messages" value={num(stats?.unread)} sub={stats?.unread ? <button className="adm-link" onClick={() => go('messages')}>Open inbox</button> : undefined} />
        <Stat label="Page views" value={views ? num(views.total) : views === null ? '-' : '...'} sub={views ? `${num(views.today)} today` : undefined} />
      </div>
      <Card title="Visitor Trend" actions={<span className="adm-dim">Last 7 days</span>}>
        {views === undefined ? <Empty>Loading...</Empty> : views === null ? <Empty>Could not load visitor trend.</Empty> : (
          <TrendChart points={trend.map((t) => t.views || 0)} labels={trend.map((t) => (t.date || t.day || '').slice(5))} />
        )}
      </Card>
      <div className="adm-grid-2">
        <Card title="Recent Signups" actions={<button className="adm-link" onClick={() => go('users')}>All users</button>}>
          {signups == null ? <Empty>Loading...</Empty> : !signups.length ? <Empty>No sign-ups yet.</Empty> : (
            <ul className="adm-list" id="admSignups">
              {signups.map((s) => (
                <li key={s.id}>
                  <span className="adm-avatar" aria-hidden="true">{(s.full_name || s.username || '?').trim().charAt(0).toUpperCase()}</span>
                  <span className="adm-list-main">{s.full_name || s.username || 'No name'}{s.username && <span className="adm-dim"> @{s.username}</span>}</span>
                  <span className="adm-dim">{timeAgo(s.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Quick Actions">
          <div className="adm-quick">
            <button className="adm-btn" onClick={() => go('notifications')}>Send announcement</button>
            <button className="adm-btn" onClick={() => go('blog')}>Write blog post</button>
            <button className="adm-btn" onClick={() => go('ctf')}>Manage CTF</button>
            <button className="adm-btn" onClick={() => go('messages')}>Open inbox</button>
            <button className={'adm-btn' + (maint ? ' danger' : '')} onClick={toggleMaintenance} disabled={maint == null || busy} id="admMaint">
              {maint == null ? 'Maintenance mode' : maint ? 'Maintenance is ON (turn off)' : 'Maintenance mode: off'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
