'use client';

// Small building blocks shared by the admin sections. Everything renders as
// React text (escaped); no innerHTML anywhere in the panel.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type Toast = { id: number; text: string; kind: 'ok' | 'error' | 'info' };
const ToastCtx = createContext<(text: string, kind?: Toast['kind']) => void>(() => {});

export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const next = useRef(1);
  const push = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    const id = next.current++;
    setList((l) => [...l, { id, text, kind }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {list.map((t) => <div key={t.id} className={'adm-toast ' + t.kind}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="adm-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={'adm-modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-modal-head">
          <h3>{title}</h3>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="adm-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="adm-stat">
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value}</div>
      {sub != null && <div className="adm-stat-sub">{sub}</div>}
    </div>
  );
}

export function Card({ title, actions, children }: { title?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="adm-card">
      {(title || actions) && <div className="adm-card-head">{title && <h2>{title}</h2>}<div className="adm-card-actions">{actions}</div></div>}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="adm-empty">{children}</div>;
}

export const num = (n: number | null | undefined) => (n == null ? '–' : n.toLocaleString('en-IN'));

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '–';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 86400 * 30) return Math.floor(s / 86400) + 'd ago';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dateTime(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–';
}

/** Simple area chart (no library). */
export function AreaChart({ points, labels }: { points: number[]; labels: string[] }) {
  if (!points.length) return <Empty>No data yet.</Empty>;
  const W = 600, H = 160, P = 8;
  const max = Math.max(1, ...points);
  const step = points.length > 1 ? (W - 2 * P) / (points.length - 1) : 0;
  const xy = points.map((v, i) => [P + i * step, H - P - (v / max) * (H - 2 * P)]);
  const line = xy.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
  return (
    <div className="adm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Trend chart">
        <path d={`${line} L ${xy[xy.length - 1][0]} ${H - P} L ${P} ${H - P} Z`} className="adm-chart-fill" />
        <path d={line} className="adm-chart-line" />
        {xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" className="adm-chart-dot"><title>{labels[i] + ': ' + points[i]}</title></circle>)}
      </svg>
      <div className="adm-chart-labels">{labels.map((l, i) => <span key={i}>{l}</span>)}</div>
    </div>
  );
}
