'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { browserSupabase } from '@/lib/supabase';
import { displayName, levelFromXp, type LeaderRow } from '@/lib/player-utils';

// Rows are server-rendered; the refresh button re-fetches in the browser and
// the signed-in user's row gets the YOU tag (same markup as js/leaderboard.js).
export default function LeaderboardList({ initial }: { initial: LeaderRow[] | null }) {
  const { user } = useAuth();
  const [rows, setRows] = useState(initial);
  const [label, setLabel] = useState('Live');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const sb = browserSupabase();
    if (!sb) return;
    setBusy(true);
    const { data, error } = await sb.rpc('get_leaderboard', { p_limit: 50 });
    setBusy(false);
    if (error) { setLabel('Refresh failed'); return; }
    setRows((data || []).map((r: LeaderRow) => ({ ...r, xp: r.xp || 0, ctf_solves: r.ctf_solves || 0 })));
    setLabel('Updated just now');
  }, []);

  return (
    <>
      <div className="pf-lb-header">
        <div className="pf-section-label" style={{ margin: 0 }}>All-Time Ranking</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="pf-lb-live"><span className="pf-lb-live-dot"></span><span id="lbUpdatedLabel">{label}</span></div>
          <button className="pf-lb-refresh" onClick={refresh} title="Refresh" disabled={busy}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M12.5 7A5.5 5.5 0 112 4.5M2 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <div className="pf-lb-list" id="lbList">
        {rows === null ? <div className="pf-empty">Failed to load leaderboard.</div>
          : rows.length === 0 ? <div className="pf-empty">No users yet.</div>
          : rows.map((u, i) => {
            const name = displayName(u);
            const isMe = user?.id === u.id;
            return (
              <a key={u.id} className={'pf-lb-row' + (isMe ? ' pf-lb-row--me' : '')} href={`/u/${u.id}`} style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                <div className="pf-lb-rank">{i + 1}</div>
                <div className="pf-lb-avatar">{(name[0] || '?').toUpperCase()}</div>
                <div className="pf-lb-info">
                  <div className="pf-lb-name">{name}{isMe && <span className="pf-lb-you">YOU</span>}</div>
                  <div className="pf-lb-sub">Level {levelFromXp(u.xp)} · {u.ctf_solves} CTF solves</div>
                </div>
                <div className="pf-lb-xp">{u.xp.toLocaleString('en-US')} XP</div>
              </a>
            );
          })}
      </div>
    </>
  );
}
