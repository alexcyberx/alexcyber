'use client';

// CTF page "My stats": progress ring, XP, difficulty and category progress, and
// the daily challenge with a countdown to the next one. Numbers count up and
// bars fill on load; prefers-reduced-motion skips the motion (css/ctf-room.css .ctfx).

import { useEffect, useMemo, useState } from 'react';
import type { Challenge, Difficulty } from '@/lib/ctf';

type Props = {
  challenges: Challenge[];
  solved: Record<string, boolean>;
  daily: Challenge | 'done' | null;
  onOpen: (id: string) => void;
  cats: string[];
};

const DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const R = 52;
const C = 2 * Math.PI * R;

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Counts from 0 to `target` (ease-out) once the panel has mounted.
function useCountUp(target: number, run: boolean, ms = 1100): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reducedMotion() || target === 0) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return v;
}

// Time left until local midnight, when the daily pick changes.
function useMidnightCountdown(): string {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const upd = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
      const p = (n: number) => String(n).padStart(2, '0');
      setLeft(`${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`);
    };
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

export default function CtfStats({ challenges, solved, daily, onOpen, cats }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = challenges.length;
  const done = challenges.filter((c) => solved[c.id]);
  const xp = done.reduce((s, c) => s + c.xp, 0);
  const pct = total ? Math.round((done.length / total) * 100) : 0;

  const byDiff = useMemo(() => DIFFS.map((d) => {
    const all = challenges.filter((c) => c.diff === d);
    return { d, t: all.length, s: all.filter((c) => solved[c.id]).length };
  }), [challenges, solved]);

  const byCat = useMemo(() => cats
    .map((cat) => {
      const all = challenges.filter((c) => c.cat === cat);
      return { cat, t: all.length, s: all.filter((c) => solved[c.id]).length };
    })
    .filter((x) => x.t > 0), [challenges, solved, cats]);

  const pctN = useCountUp(pct, ready);
  const solvedN = useCountUp(done.length, ready, 900);
  const xpN = useCountUp(xp, ready, 1300);
  const countdown = useMidnightCountdown();

  const w = (s: number, t: number) => (ready && t ? `${(s / t) * 100}%` : '0%');

  return (
    <section className={'ctfx' + (ready ? ' in' : '')} aria-label="My stats">
      <div className="ctfx-main">
        <div className="ctfx-ring" role="img" aria-label={`${done.length} of ${total} challenges solved`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="ctfx-ring-bg" cx="60" cy="60" r={R} />
            <circle className="ctfx-ring-fg" cx="60" cy="60" r={R}
              strokeDasharray={C} strokeDashoffset={ready ? C * (1 - pct / 100) : C} transform="rotate(-90 60 60)" />
          </svg>
          <div className="ctfx-ring-c"><b>{pctN}%</b><span>done</span></div>
        </div>
        <div className="ctfx-nums">
          <div className="ctfx-kicker">My stats</div>
          <div className="ctfx-solved"><b>{solvedN}</b><span>/ {total} solved</span></div>
          <div className="ctfx-xp">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" fill="currentColor" /></svg>
            <b>{xpN.toLocaleString('en-IN')}</b> XP earned
          </div>
        </div>
        <div className="ctfx-diff">
          {byDiff.map(({ d, s, t }, i) => (
            <div className={'ctfx-d ' + d.toLowerCase()} key={d}>
              <div className="ctfx-d-r"><span>{d}</span><em>{s}/{t}</em></div>
              <i><u style={{ width: w(s, t), transitionDelay: `${0.25 + i * 0.1}s` }} /></i>
            </div>
          ))}
        </div>
      </div>

      <div className="ctfx-cats">
        {byCat.map(({ cat, s, t }, i) => (
          <div className="ctfx-cat" key={cat}>
            <div className="ctfx-cat-t">
              <div className="ctfx-cat-r"><b>{cat}</b><em>{s}/{t}</em></div>
              <i><u style={{ width: w(s, t), transitionDelay: `${0.35 + i * 0.08}s` }} /></i>
            </div>
          </div>
        ))}
      </div>

      <div className="ctfx-daily">
        <div className="ctfx-daily-in">
          <div className="ctfx-daily-top">
            <span className="ctfx-kicker">Daily challenge</span>
            {daily && daily !== 'done' && <span className="ctfx-cd" title="Time until the next daily challenge">New in {countdown}</span>}
          </div>
          {daily === null ? (
            <p className="ctfx-daily-note">No challenges available.</p>
          ) : daily === 'done' ? (
            <p className="ctfx-daily-note ok">All challenges solved. Great work!</p>
          ) : (
            <>
              <div className="ctfx-daily-name">{daily.title}</div>
              <div className="ctfx-daily-meta">{daily.cat} · {daily.diff} · +{daily.xp} XP</div>
              <button type="button" className="ctfx-daily-btn" onClick={() => onOpen(daily.id)}>
                Play now
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
