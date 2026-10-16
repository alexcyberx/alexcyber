'use client';

// /rooms: same markup/classes as #ctfPage in index.html (css/ctf-room.css).
// Logic from js/ctf-challenges-data.js, with these fixes:
// - "XP Earned" was always 0 after the DB sync (points_earned was never selected).
// - Lab flag submits now carry the lab's own session (marks that instance solved)
//   and the login token (the server records the solve, server/labs/recordSolve.js).
// - The lab tab opened by "View Lab" is remembered, so a solve/restart reaches it.
// - Rooms, XP and solver counts come from the DB (see lib/ctf.ts).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { authHeaders } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { browserSupabase } from '@/lib/supabase';
import type { Challenge, CtfI18n, Difficulty } from '@/lib/ctf';
import { LANG_KEY, machineTranslate, needsMt, readMtCache, roomText } from '@/lib/ctf-translate';

const LAB_SECS = 30 * 60;

// ── storage helpers (never throw) ──
const store = {
  get(s: 'l' | 's', k: string): string | null {
    try { return (s === 'l' ? localStorage : sessionStorage).getItem(k); } catch { return null; }
  },
  set(s: 'l' | 's', k: string, v: string) {
    try { (s === 'l' ? localStorage : sessionStorage).setItem(k, v); } catch { /* blocked */ }
  },
  del(s: 'l' | 's', k: string) {
    try { (s === 'l' ? localStorage : sessionStorage).removeItem(k); } catch { /* blocked */ }
  },
};

function randomId(prefix: string): string {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return prefix + Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Lab started at (ms), if it was started in the last 30 min. */
function labStartedAt(id: string): number | null {
  try {
    const d = JSON.parse(store.get('l', 'acx_lab_active_' + id) || 'null');
    if (!d || typeof d.startedAt !== 'number') return null;
    if (Date.now() - d.startedAt > LAB_SECS * 1000) { store.del('l', 'acx_lab_active_' + id); return null; }
    return d.startedAt;
  } catch { return null; }
}

function playSolveSound() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => { try { ctx.close(); } catch { /* ignore */ } }, 900);
  } catch { /* no Web Audio: visuals still play */ }
}

const fmt = (secs: number) => String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');

const Svg = ({ html, ...p }: { html: string } & React.HTMLAttributes<HTMLSpanElement>) =>
  <span {...p} dangerouslySetInnerHTML={{ __html: html }} />;
const SvgBox = ({ html, ...p }: { html: string } & React.HTMLAttributes<HTMLDivElement>) =>
  <div {...p} dangerouslySetInnerHTML={{ __html: html }} />;

// Filter buttons: same icons as index.html (currentColor).
const CAT_FILTERS: { cat: string; icon: React.ReactNode }[] = [
  { cat: 'Web', icon: <><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" /><path d="M2 10h16M10 2c2.2 2.2 3.4 5.1 3.4 8s-1.2 5.8-3.4 8c-2.2-2.2-3.4-5.1-3.4-8S7.8 4.2 10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></> },
  { cat: 'Forensics', icon: <><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4" /><path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></> },
  { cat: 'Crypto', icon: <><rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></> },
  { cat: 'OSINT', icon: <><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4" /><path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.2" /></> },
  { cat: 'Pwn', icon: <path d="M3 17L13 7M11 3l6 6-2 2-6-6 2-2zM4 16l-1 3 3-1-2-2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /> },
  { cat: 'Reversing', icon: <><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.5 4.5l1.8 1.8M13.7 13.7l1.8 1.8M15.5 4.5l-1.8 1.8M5.5 14.5l-1.8 1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></> },
  { cat: 'AI Security', icon: <><rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" /><rect x="8" y="8" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.2" /><path d="M8 2.5V5M12 2.5V5M8 15v2.5M12 15v2.5M2.5 8H5M2.5 12H5M15 8h2.5M15 12h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></> },
  { cat: 'Misc', icon: <><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" /><circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.4" /><circle cx="10" cy="10" r="1" fill="currentColor" /></> },
];

type AiCard = { hint: string; n: number };
type AiState = { cards: AiCard[]; max: number; remaining: number };
type FlagMsg = { type: 'success' | 'error'; text: string } | null;

// Same overlay as showTranslateLoader() in js/translate.js.
function TranslateLoader({ lang, done, total }: { lang: string; done: number; total: number }) {
  return (
    <div id="xlLoader" style={{ position: 'fixed', top: '30%', left: 0, right: 0, margin: '0 auto', width: 'fit-content', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'rgba(8,8,10,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 14, padding: '18px 28px' }}>
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" style={{ animation: 'xlspin 0.85s linear infinite' }}>
          <circle cx="18" cy="18" r="15" stroke="rgba(var(--accent-rgb),0.12)" strokeWidth="2.5" />
          <path d="M18 3a15 15 0 0 1 15 15" style={{ stroke: 'var(--accent)' }} strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>Translating to {lang}</div>
        <div style={{ width: 160, height: 3, background: 'rgba(var(--fg-rgb),0.07)', borderRadius: 3, overflow: 'hidden' }}>
          <div id="xlBar" style={{ height: '100%', width: (total ? Math.round(done / total * 100) : 0) + '%', background: 'linear-gradient(90deg,var(--accent),#6ee7b7)', borderRadius: 3, transition: 'width 0.12s' }}></div>
        </div>
        <div id="xlStatus" style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'var(--fg-4)' }}>{done ? `${done} / ${total} done` : 'Starting...'}</div>
      </div>
      <style>{'@keyframes xlspin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}

export default function RoomsView({ challenges: rooms, icons, i18n }: { challenges: Challenge[]; icons: Record<string, string>; i18n: CtfI18n }) {
  const { user, ready, openAuth } = useAuth();

  // ── language (js/i18n.js picks it; it calls window.applyCTFTranslation) ──
  const [lang, setLang] = useState('en');
  const [mt, setMt] = useState<ReturnType<typeof readMtCache>>({});
  const [translating, setTranslating] = useState<{ done: number; total: number } | null>(null);
  useEffect(() => {
    try { setLang(localStorage.getItem(LANG_KEY) || 'en'); } catch { /* blocked */ }
    const w = window as unknown as { applyCTFTranslation?: (l: string) => void; currentPage?: string };
    const prevPage = w.currentPage;
    w.currentPage = 'ctf';
    w.applyCTFTranslation = (l: string) => setLang(l || 'en');
    return () => { delete w.applyCTFTranslation; w.currentPage = prevPage; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const cache = readMtCache(lang);
    setMt(cache);
    const missing = needsMt(rooms.map((c) => c.id), lang, i18n, cache);
    if (!missing.length) { setTranslating(null); return; }
    setTranslating({ done: 0, total: missing.length * 3 });
    machineTranslate(lang, rooms.filter((c) => missing.includes(c.id)), i18n.protectedTerms, (done, total) => {
      if (!cancelled) setTranslating({ done, total });
    }).then((res) => { if (!cancelled) { setMt(res); setTranslating(null); } });
    return () => { cancelled = true; };
  }, [lang, rooms, i18n]);
  const challenges = useMemo(() => rooms.map((c) => ({
    ...c,
    ...roomText({ title: c.title, desc: c.desc, hints: c.hints, scenario: c.scenario }, c.id, lang, i18n, mt),
  })), [rooms, lang, i18n, mt]);
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null); // null = loading
  const [solved, setSolved] = useState<Record<string, true>>({});
  const [solvers, setSolvers] = useState<Record<string, number>>({});
  const [cat, setCat] = useState('all');
  const [diff, setDiff] = useState<Difficulty | null>(null);
  const [query, setQuery] = useState('');
  const [statsOpen, setStatsOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; sub: string }>({ show: false, sub: 'Challenge solved.' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // modal
  const [openId, setOpenId] = useState<string | null>(null);
  const [shownId, setShownId] = useState<string | null>(null); // stays set while the overlay fades out
  const current = useMemo(() => challenges.find((c) => c.id === openId) || null, [challenges, openId]);
  const shown = useMemo(() => challenges.find((c) => c.id === shownId) || null, [challenges, shownId]);
  const [hintVisible, setHintVisible] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiQ, setAiQ] = useState('');
  const [aiStates, setAiStates] = useState<Record<string, AiState>>({});
  const [aiNote, setAiNote] = useState<{ cls: string; text: string } | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null); // lab running since
  const [secsLeft, setSecsLeft] = useState(LAB_SECS);
  const [flagVisible, setFlagVisible] = useState(false);
  const [flag, setFlag] = useState('');
  const [flagCls, setFlagCls] = useState('');
  const [flagMsg, setFlagMsg] = useState<FlagMsg>(null);
  const [submitting, setSubmitting] = useState(false);
  const labUrl = useRef<string | null>(null);
  const labTab = useRef<Window | null>(null);
  const flagInput = useRef<HTMLInputElement>(null);
  const pendingOpen = useRef<string | null>(null);
  const [pendingTick, setPendingTick] = useState(0);
  const currentRef = useRef<Challenge | null>(null);
  currentRef.current = current;

  useEffect(() => { setMounted(true); }, []);

  // Logged out: login modal, then back here.
  useEffect(() => {
    if (ready && !user) openAuth('login', '/rooms' + (pendingOpen.current ? '?open=' + encodeURIComponent(pendingOpen.current) : ''));
  }, [ready, user, openAuth]);

  // Username (profile, or auth metadata like the old page) + solved rooms from the DB.
  useEffect(() => {
    if (!user) return;
    const sb = browserSupabase();
    if (!sb) return;
    let cancelled = false;
    (async () => {
      const [{ data: prof }, { data: au }] = await Promise.all([
        sb.from('profiles').select('username').eq('id', user.id).maybeSingle(),
        sb.auth.getUser(),
      ]);
      if (cancelled) return;
      setUsername(((prof?.username as string) || (au.user?.user_metadata?.username as string) || '').trim());
    })();
    const byUuid = new Map(rooms.filter((c) => c.uuid).map((c) => [c.uuid as string, c.id]));
    sb.from('ctf_solves').select('challenge_id').eq('user_id', user.id).then(({ data }) => {
      if (cancelled || !data) return;
      const s: Record<string, true> = {};
      data.forEach((r: { challenge_id: string }) => { const id = byUuid.get(r.challenge_id); if (id) s[id] = true; });
      setSolved(s);
    });
    return () => { cancelled = true; };
  }, [user, rooms]);

  const showMain = !!user && !!username;

  // ── stats / daily ──
  const solvedList = challenges.filter((c) => solved[c.id]);
  const totalXP = solvedList.reduce((sum, c) => sum + c.xp, 0);
  const categories = new Set(challenges.map((c) => c.cat)).size;
  const catCount = useMemo(() => {
    const m: Record<string, number> = {};
    challenges.forEach((c) => { m[c.cat] = (m[c.cat] || 0) + 1; });
    return m;
  }, [challenges]);
  const daily = useMemo(() => {
    if (!challenges.length) return null;
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const idx = Math.abs((seed * 1103515245 + 12345) % challenges.length);
    for (let i = 0; i < challenges.length; i++) {
      const c = challenges[(idx + i) % challenges.length];
      if (!solved[c.id]) return c;
    }
    return 'done' as const;
  }, [challenges, solved]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return challenges.filter((c) => {
      if (cat !== 'all' && c.cat !== cat) return false;
      if (diff && c.diff !== diff) return false;
      if (q && !(c.title + ' ' + c.desc + ' ' + c.cat + ' ' + c.tags.join(' ')).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [challenges, cat, diff, query]);

  // ── modal ──
  const clearOtherLabs = useCallback((keepId: string) => {
    challenges.forEach((c) => { if (c.id !== keepId) store.del('l', 'acx_lab_active_' + c.id); });
  }, [challenges]);

  const openModal = useCallback((id: string) => {
    const c = challenges.find((x) => x.id === id);
    if (!c) return;
    clearOtherLabs(id);
    const since = c.labUrl ? labStartedAt(id) : null;
    labUrl.current = null;
    if (since) {
      if (c.hasLabFlow && c.labApiPath) {
        const sid = store.get('s', 'acx_lab_direct_session_' + c.id);
        if (sid) labUrl.current = c.labApiPath + '/page?session=' + encodeURIComponent(sid);
      } else if (c.labUrl) {
        const sid = store.get('s', 'acx_lab_session_' + c.id);
        labUrl.current = c.labUrl + (sid ? (c.labUrl.includes('?') ? '&' : '?') + 'session=' + encodeURIComponent(sid) : '');
      }
    } else {
      labTab.current = null;
    }
    setOpenId(id);
    setShownId(id);
    setHintVisible(false);
    setAiOpen(false);
    setAiBusy(false);
    setAiQ('');
    setAiNote(null);
    setStartedAt(since);
    setSecsLeft(since ? Math.max(0, LAB_SECS - Math.floor((Date.now() - since) / 1000)) : LAB_SECS);
    setFlagVisible(!c.labUrl || !!since);
    setFlag('');
    setFlagCls('');
    setFlagMsg(null);
    setSubmitting(false);
  }, [challenges, clearOtherLabs]);

  const closeModal = useCallback(() => {
    setOpenId(null);
    labUrl.current = null;
  }, []);

  useEffect(() => {
    document.body.classList.toggle('ctf-modal-open', !!openId);
    if (openId) setTimeout(() => flagInput.current?.focus(), 100);
    return () => document.body.classList.remove('ctf-modal-open');
  }, [openId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal]);

  // Countdown while the lab runs (survives refresh: started time is in localStorage).
  useEffect(() => {
    if (!openId || !startedAt) return;
    const tick = () => {
      const left = Math.max(0, LAB_SECS - Math.floor((Date.now() - startedAt) / 1000));
      setSecsLeft(left);
      if (left <= 0) { store.del('l', 'acx_lab_active_' + openId); clearInterval(t); }
    };
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [openId, startedAt]);

  // ── open a room from elsewhere: ?open=<id>, return from a lab tab ──
  const requestOpen = useCallback((id: string) => {
    if (!challenges.some((c) => c.id === id)) return;
    pendingOpen.current = id;
  }, [challenges]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('open');
    if (fromQuery) {
      requestOpen(fromQuery);
      params.delete('open');
      const qs = params.toString();
      history.replaceState(history.state, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    }
    // Same-tab return from a lab page (mobile, when window.close() is blocked).
    const backId = store.get('s', 'acx_back_to_ctf');
    const backTs = parseInt(store.get('s', 'acx_back_ts') || '0', 10);
    if (backId) {
      store.del('s', 'acx_back_to_ctf');
      store.del('s', 'acx_back_ts');
      if (Date.now() - backTs < 10000) requestOpen(backId);
    }
    const legacy = store.get('s', 'ctf_return_id');
    if (legacy) { store.del('s', 'ctf_return_id'); if (!pendingOpen.current) requestOpen(legacy); }

    // Lab tab calls window.opener.acxLabReturn(id) ...
    const w = window as unknown as { acxLabReturn?: (id: string) => void };
    w.acxLabReturn = (id: string) => { window.focus(); requestOpen(id); setPendingTick((n) => n + 1); };
    // ... or sets acx_return_to_modal and closes (storage event in this tab).
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'acx_return_to_modal' || !e.newValue) return;
      const ts = parseInt(store.get('l', 'acx_return_ts') || '0', 10);
      store.del('l', 'acx_return_to_modal');
      store.del('l', 'acx_return_ts');
      if (Date.now() - ts > 6000) return;
      requestOpen(e.newValue);
      setPendingTick((n) => n + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('storage', onStorage); delete w.acxLabReturn; };
  }, [requestOpen]);

  // The id is only taken when the timer fires: a re-render in between (e.g. a
  // translation arriving) must not drop it.
  const openModalRef = useRef(openModal);
  openModalRef.current = openModal;
  useEffect(() => {
    if (!showMain || !pendingOpen.current) return;
    const t = setTimeout(() => {
      const id = pendingOpen.current;
      pendingOpen.current = null;
      if (id) openModalRef.current(id);
    }, 150);
    return () => clearTimeout(t);
  }, [showMain, pendingTick]);

  // ── labs ──
  const stopOtherInstances = (exceptId: string) => {
    challenges.forEach((c) => {
      if (c.id === exceptId || !c.hasLabFlow || !c.labApiPath) return;
      const sess = store.get('s', 'acx_lab_direct_session_' + c.id);
      if (!sess) return;
      fetch(c.labApiPath + '/instance/stop', { method: 'POST', headers: { 'X-Lab-Session': sess } }).catch(() => {});
    });
  };

  const newLabUrl = (c: Challenge): string => {
    if (c.hasLabFlow && c.labApiPath) {
      const sid = randomId('sess_');
      store.set('s', 'acx_lab_direct_session_' + c.id, sid);
      fetch(c.labApiPath + '/instance/restart', { method: 'POST', headers: { 'X-Lab-Session': sid } }).catch(() => {});
      return c.labApiPath + '/page?session=' + encodeURIComponent(sid);
    }
    const sid = randomId('sess_');
    store.set('s', 'acx_lab_session_' + c.id, sid);
    return c.labUrl + (c.labUrl!.includes('?') ? '&' : '?') + 'session=' + encodeURIComponent(sid);
  };

  const startLab = (restart: boolean) => {
    const c = current;
    if (!c || !c.labUrl) return;
    clearOtherLabs(c.id);
    stopOtherInstances(c.id);
    if (!restart && labTab.current && !labTab.current.closed) { try { labTab.current.close(); } catch { /* ignore */ } labTab.current = null; }
    const url = newLabUrl(c);
    if (restart && labTab.current && !labTab.current.closed) {
      labTab.current.location.href = url;
      labTab.current.focus();
    }
    labUrl.current = url;
    const now = Date.now();
    store.set('l', 'acx_lab_active_' + c.id, JSON.stringify({ startedAt: now, secsLeft: LAB_SECS }));
    setStartedAt(now);
    setSecsLeft(LAB_SECS);
    setFlagVisible(true);
  };

  const viewLab = (e: React.MouseEvent) => {
    e.preventDefault();
    const c = current;
    if (!c) return;
    let url = labUrl.current;
    if (!url) {
      if (c.hasLabFlow && c.labApiPath) {
        const sid = store.get('s', 'acx_lab_direct_session_' + c.id);
        url = c.labApiPath + '/page' + (sid ? '?session=' + encodeURIComponent(sid) : '');
      } else url = c.labUrl || '#';
    }
    labTab.current = window.open(url, '_blank');
  };

  const endLab = (c: Challenge) => {
    if (labTab.current && !labTab.current.closed) { try { labTab.current.close(); } catch { /* ignore */ } }
    labTab.current = null;
    store.del('s', 'acx_lab_token_' + c.id);
  };

  // ── AI hints (/api/lab/hint) ──
  const sidForHints = () => {
    let v = store.get('s', 'acx_hint_sid');
    if (!v) { v = randomId('h'); store.set('s', 'acx_hint_sid', v); }
    return v;
  };

  const askAi = async () => {
    const c = current;
    if (!c || aiBusy) return;
    setAiBusy(true);
    setAiNote({ cls: 'ctf-ai-wait', text: 'Thinking...' });
    let ok = false;
    let netFail = false;
    let data: { hint?: string; used?: number; max?: number; remaining?: number; error?: string } = {};
    try {
      const res = await fetch('/api/lab/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ challengeId: c.id, question: aiQ.trim(), sessionId: sidForHints() }),
      });
      try { data = await res.json(); } catch { /* not json */ }
      ok = res.ok && typeof data.hint === 'string' && data.hint.length > 0;
    } catch { netFail = true; }
    setAiBusy(false);
    setAiStates((all) => {
      const st = all[c.id] || { cards: [], max: data.max ?? data.remaining ?? 0, remaining: data.remaining ?? 0 };
      if (ok) return { ...all, [c.id]: { cards: [...st.cards, { hint: data.hint!, n: data.used ?? st.cards.length + 1 }], max: data.max ?? st.max, remaining: data.remaining ?? st.remaining } };
      if (!netFail && typeof data.remaining === 'number') return { ...all, [c.id]: { ...st, remaining: data.remaining } };
      return all;
    });
    if (currentRef.current?.id !== c.id) return; // another room was opened meanwhile
    if (ok) { setAiQ(''); setAiNote(null); }
    else setAiNote({ cls: 'ctf-ai-err', text: netFail ? 'Could not reach the server. Check your connection and try again.' : (data.error || 'Could not get a hint right now. Try again in a moment.') });
  };

  // ── flag submit ──
  const shake = () => { setFlagCls('wrong'); setTimeout(() => setFlagCls(''), 600); };
  const markCorrect = () => { setFlagCls('correct'); setTimeout(() => setFlagCls(''), 1500); };

  const submitFlag = async () => {
    const c = current;
    if (!c || submitting) return;
    if (!user) { setFlagMsg({ type: 'error', text: '[!] Please login to submit a flag.' }); return; }
    const f = flag.trim();
    if (!f) { setFlagMsg({ type: 'error', text: '[!] Please enter a flag.' }); flagInput.current?.focus(); return; }
    if (f.length < 4) { setFlagMsg({ type: 'error', text: '[!] Flag is too short.' }); return; }
    if (f.length > 300) { setFlagMsg({ type: 'error', text: '[!] Flag is too long.' }); return; }
    if (/<[^>]*>/.test(f)) { setFlagMsg({ type: 'error', text: '[!] Flag cannot contain HTML.' }); return; }
    if (!/^ACX\{.+\}$/.test(f)) { setFlagMsg({ type: 'error', text: '[!] Flag format should be ACX{...}' }); shake(); return; }

    const wasSolved = !!solved[c.id];
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const fail = (text: string) => { setFlagMsg({ type: 'error', text }); setSubmitting(false); };

    let correct = false;
    let already = false;
    let earned = c.xp;
    if (c.hasLabFlow && c.labApiPath) {
      // The lab server checks the flag; on success it also records the solve + XP.
      let sid = store.get('s', 'acx_lab_direct_session_' + c.id) || store.get('s', 'acx_lab_session_' + c.id);
      if (!sid) { sid = randomId('sess_'); store.set('s', 'acx_lab_session_' + c.id, sid); }
      try {
        const res = await fetch(c.labApiPath + '/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Lab-Session': sid, ...(await authHeaders()) },
          body: JSON.stringify({ flag: f }),
        });
        const data = await res.json().catch(() => ({}));
        correct = !!(res.ok && data.success);
        if (res.status === 429) return fail('[!] ' + (data.error || data.message || 'Too many attempts. Try again in a moment.'));
        if (correct && data.recorded === false && data.reason === 'suspended') {
          return fail('[!] Your account is suspended, so this solve was not counted.');
        }
        if (correct && data.recorded === false && data.reason === 'login_required') {
          return fail('[!] Correct, but your session expired. Please log in again and resubmit.');
        }
        if (correct && data.recorded) {
          already = !!data.already_solved;
          earned = data.already_solved ? 0 : (data.xp_earned || c.xp);
        }
      } catch { return fail('[!] Could not connect to server. Please try again.'); }
    } else {
      const sb = browserSupabase();
      if (!sb) return fail('[!] Could not connect to server. Please try again.');
      if (!c.uuid) return fail('[!] Could not verify this challenge right now. Please try again shortly.');
      const { data, error } = await sb.rpc('submit_ctf_flag', { p_challenge_id: c.uuid, p_flag: f });
      if (error) return fail('[!] Server error. Please try again.');
      const r = (Array.isArray(data) ? data[0] : data) || {};
      if (r.error === 'rate_limited' || r.error === 'locked' || r.error === 'suspended') return fail('[!] ' + (r.message || 'Try again in a moment.'));
      correct = !!(r.correct || r.already_solved);
      already = !!r.already_solved;
      earned = r.already_solved ? 0 : (r.xp_earned || r.points_earned || c.xp);
    }

    if (correct && (wasSolved || already)) {
      markCorrect();
      setFlag('');
      setFlagMsg({ type: 'success', text: 'Already solved. No additional XP awarded.' });
      setSolved((s) => ({ ...s, [c.id]: true }));
      endLab(c);
      setSubmitting(false);
      return;
    }
    if (correct) {
      markCorrect();
      setFlag('');
      setFlagMsg({ type: 'success', text: `✓ Correct! +${earned} XP earned!` });
      playSolveSound();
      setToast({ show: true, sub: `"${c.title}" solved.` });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
      endLab(c);
      setSolved((s) => ({ ...s, [c.id]: true }));
      setSolvers((s) => ({ ...s, [c.id]: (s[c.id] ?? c.solvers) + 1 }));
      // Lab stops: START shown again, the flag box stays for the message.
      store.del('l', 'acx_lab_active_' + c.id);
      setStartedAt(null);
      setSubmitting(false);
      return;
    }
    shake();
    fail('[X] Incorrect flag. Please try again!');
  };

  // ── username setup ──
  const [unameInput, setUnameInput] = useState('');
  const [unameMsg, setUnameMsg] = useState<{ type: string; text: string } | null>(null);
  const [unameSaving, setUnameSaving] = useState(false);
  const saveUsername = async () => {
    const u = unameInput.trim();
    if (!u) return setUnameMsg({ type: 'error', text: 'Please enter a username.' });
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(u)) return setUnameMsg({ type: 'error', text: 'Username must be 3-20 characters: letters, numbers, underscores, hyphens only.' });
    const sb = browserSupabase();
    if (!user || !sb) return setUnameMsg({ type: 'error', text: 'You must be logged in.' });
    setUnameSaving(true);
    try {
      // Case-insensitive, same check as the profile page.
      const { data: taken } = await sb.from('profiles').select('id').ilike('username', u.replace(/[%_\\]/g, '\\$&')).neq('id', user.id).limit(1);
      if (taken && taken.length) { setUnameMsg({ type: 'error', text: 'This username is already taken. Please choose another.' }); return; }
      const { error } = await sb.from('profiles').update({ username: u }).eq('id', user.id);
      const { error: metaErr } = await sb.auth.updateUser({ data: { username: u } });
      if (error && metaErr) { setUnameMsg({ type: 'error', text: error.code === '23505' ? 'This username is already taken. Please choose another.' : 'Could not save username. Please try again.' }); return; }
      setUnameMsg({ type: 'success', text: 'Username set! Loading challenges...' });
      setTimeout(() => setUsername(u), 600);
    } catch {
      setUnameMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setUnameSaving(false);
    }
  };

  const running = !!startedAt;
  const ai = shown ? aiStates[shown.id] : undefined;
  const timerCls = 'ctf-timer-val' + (secsLeft <= 300 ? ' danger' : secsLeft <= 600 ? ' warn' : '');

  return (
    <>
      <div id="ctfPage" className="page active">
        <div className="ctf-wrap">

          {/* USERNAME SETUP VIEW (logged in but no username yet) */}
          <div className="ctf-setup-view" id="ctfSetupView" style={{ display: user && username === '' ? 'block' : 'none' }}>
            <div className="ctf-setup-brand"><span className="ctf-setup-brand-accent">ALEX</span>CYBERX</div>
            <p className="ctf-setup-subtitle">Complete your profile setup</p>
            <div className="ctf-setup-card">
              <h2 className="ctf-setup-title">Choose Your Username</h2>
              <p className="ctf-setup-desc">This will be your unique identifier in the labs</p>
              <div className="ctf-setup-field">
                <label className="ctf-setup-label" htmlFor="ctfUsernameInput">Username</label>
                <input type="text" id="ctfUsernameInput" className="ctf-setup-input" placeholder="Enter your username" autoComplete="off" maxLength={20}
                  value={unameInput} onChange={(e) => setUnameInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveUsername(); }} />
                <p className="ctf-setup-hint">3-20 characters, letters, numbers, underscores, and hyphens only</p>
              </div>
              <button className="ctf-setup-btn" id="ctfUsernameSubmitBtn" onClick={saveUsername} disabled={unameSaving}>{unameSaving ? 'Saving...' : 'Complete Setup'}</button>
              <div className={'ctf-setup-msg' + (unameMsg ? ' ' + unameMsg.type : '')} id="ctfUsernameMsg">{unameMsg?.text}</div>
              <p className="ctf-setup-welcome">Welcome to the cybersecurity training platform, <span id="ctfSetupEmail">{user?.email}</span>!</p>
            </div>
            <p className="ctf-setup-note">Your username will be visible to other users in leaderboards and forums.</p>
          </div>

          {/* MAIN CTF VIEW */}
          <div id="ctfMainView" style={{ display: showMain ? 'block' : 'none' }}>
            <div className="ctf-header">
              <div className="ctf-header-top">
                <div className="ctf-title-wrap">
                  <div className="ctf-eyebrow"><span className="ctf-eyebrow-dot"></span>Capture The Flag</div>
                  <h1 className="ctf-page-title">CTF Challenges</h1>
                  <p className="ctf-page-sub">Real-world cybersecurity challenges. Find the flag, earn XP, climb the leaderboard.</p>
                </div>
              </div>

              <div className="ctf-mystats">
                <button type="button" className={'ctf-mystats-toggle' + (statsOpen ? ' open' : '')} id="ctfMyStatsToggle" onClick={() => setStatsOpen((v) => !v)}>
                  <span className="ctf-mystats-toggle-left">My Stats</span>
                  <svg id="ctfMyStatsChevron" className="ctf-mystats-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#8a8a9a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <div className="ctf-mystats-panel" id="ctfMyStatsPanel" style={{ display: statsOpen ? 'block' : 'none' }}>
                  <div className="ctf-stats">
                    {[['ctfTotalCount', challenges.length, 'Total Challenges'], ['ctfSolvedCount', solvedList.length, 'Solved'], ['ctfTotalXP', totalXP, 'XP Earned'], ['ctfCategoryCount', categories, 'Categories']].map(([id, v, l]) => (
                      <div className="ctf-stat-card" key={id as string}>
                        <div>
                          <div className="ctf-stat-val" id={id as string}>{v}</div>
                          <div className="ctf-stat-lbl">{l}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ctf-daily-row" id="ctfDailyRow" style={{ display: 'grid' }}>
                    <div className="ctf-daily-card">
                      <div className="ctf-daily-title">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#60a5fa" strokeWidth="1.3" /><path d="M7 4v3.5l2 1.5" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round" /></svg>
                        Daily Challenge
                      </div>
                      <div id="ctfDailyChallengeInner">
                        {daily === null ? (
                          <div style={{ color: 'var(--fg-4)', fontSize: 12 }}>No challenges available.</div>
                        ) : daily === 'done' ? (
                          <div className="ctf-daily-done">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 5" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            All challenges solved, great work!
                          </div>
                        ) : (
                          <>
                            <div className="ctf-daily-name">{daily.title}</div>
                            <div className="ctf-daily-meta">{daily.cat} · {daily.xp} XP</div>
                            <button className="ctf-daily-btn" onClick={() => openModal(daily.id)}>Go to challenge →</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ctf-filters">
              <button className={'ctf-filter-btn' + (cat === 'all' ? ' active' : '')} data-cat="all" onClick={() => setCat('all')}>All<span className="ctf-filter-count">{challenges.length}</span></button>
              {/* Only categories that have rooms, with how many. */}
              {CAT_FILTERS.filter((f) => catCount[f.cat]).map((f) => (
                <button key={f.cat} className={'ctf-filter-btn' + (cat === f.cat ? ' active' : '')} data-cat={f.cat} onClick={() => setCat(f.cat)}>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" style={{ verticalAlign: -2, marginRight: 4 }}>{f.icon}</svg>{f.cat}
                  <span className="ctf-filter-count">{catCount[f.cat]}</span>
                </button>
              ))}
              <div className="ctf-filter-sep"></div>
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                <button key={d} className={`ctf-diff-btn ${d.toLowerCase()}` + (diff === d ? ' active' : '')} data-diff={d} onClick={() => setDiff((v) => (v === d ? null : d))}>{d}</button>
              ))}
              <div className="ctf-search">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#6a6a7a" strokeWidth="1.2" /><path d="M9 9l2.5 2.5" stroke="#6a6a7a" strokeWidth="1.2" strokeLinecap="round" /></svg>
                <input type="text" id="ctfSearchInput" placeholder="Search challenges..." autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>

            <div className="ctf-grid" id="ctfGrid">
              {filtered.length === 0 ? (
                <div className="ctf-empty">
                  <div className="ctf-empty-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#444" strokeWidth="1.5" /><path d="M21 21l-4.35-4.35" stroke="#444" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </div>
                  <h3>No challenges found</h3>
                  <p>Try changing the filter or search query.</p>
                </div>
              ) : filtered.map((c) => (
                <div key={c.id} className={'ctf-card' + (solved[c.id] ? ' solved' : '')} onClick={() => openModal(c.id)}>
                  <div className="ctf-card-top">
                    <SvgBox className={`ctf-card-icon ${c.iconClass}`} html={icons[c.cat] || ''} />
                    <div className="ctf-card-info">
                      <div className="ctf-card-title">{c.title}</div>
                      <div className="ctf-card-cat">{c.cat}</div>
                    </div>
                  </div>
                  <div className="ctf-card-desc">{c.desc}</div>
                  <div className="ctf-card-footer">
                    <span className={`ctf-diff-badge ${c.diff.toLowerCase()}`}>{c.diff}</span>
                    <span className="ctf-points">{c.xp} <span>XP</span></span>
                    <span className="ctf-solvers">{solvers[c.id] ?? c.solvers} solvers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {mounted && createPortal(
        <>
          {translating && <TranslateLoader lang={i18n.langNames[lang] || lang} done={translating.done} total={translating.total} />}
          {/* CHALLENGE MODAL (directly under <body>, like the old page) */}
          <div className={'ctf-modal-overlay' + (current ? ' active' : '')} id="ctfModalOverlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            {shown && (
              <div className="ctf-modal" id="ctfModal">
                <button className="ctf-modal-close" onClick={closeModal}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
                <div className="ctf-modal-cat" id="modalCat">
                  <Svg style={{ display: 'inline-flex', alignItems: 'center' }} html={icons[shown.cat] || ''} /> {shown.cat}
                </div>
                <div className="ctf-modal-title" id="modalTitle">{shown.title}</div>
                <div className="ctf-modal-meta" id="modalMeta">
                  <span className={`ctf-diff-badge ${shown.diff.toLowerCase()}`}>{shown.diff}</span>
                  <span className="ctf-xp-pill">+{shown.xp} XP</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{solvers[shown.id] ?? shown.solvers} solvers</span>
                </div>

                <div id="ctfChallengeCard" style={{ display: 'block', background: 'rgba(var(--fg-rgb),0.03)', border: '1px solid rgba(var(--fg-rgb),0.06)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>CHALLENGE
                  </div>
                  <div id="modalChallengeBadges" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}></div>
                  <div id="modalChallengeAuthor" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--fg-4)', textTransform: 'uppercase', marginBottom: 12 }}>{shown.author ? `Author: ${shown.author}` : ''}</div>
                  {shown.scenario
                    ? <div id="modalChallengeScenario" style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: shown.scenario }} />
                    : <div id="modalChallengeScenario" style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.85 }}>{shown.desc}</div>}
                </div>

                <div className="ctf-modal-hint-wrap" id="ctfHintWrap" style={{ marginBottom: 16, display: shown.hints.length ? 'block' : 'none' }}>
                  <button className="ctf-hint-toggle" id="ctfHintToggle" onClick={() => setHintVisible((v) => !v)}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5a4 4 0 0 0-2 7.5v1.3h4V9a4 4 0 0 0-2-7.5z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 12h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
                    <span id="ctfHintToggleLabel">{hintVisible ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>
                  <div className={'ctf-hint-box' + (hintVisible ? ' visible' : '')} id="ctfHintBox">
                    {shown.hints.length > 1
                      ? shown.hints.map((h, i) => <div key={i} style={{ marginBottom: 6 }}><strong>Hint {i + 1}:</strong> {h}</div>)
                      : shown.hints[0]}
                  </div>
                </div>

                <div className="ctf-ai" id="ctfAi" style={{ marginBottom: 16 }}>
                  <button className="ctf-ai-toggle" id="ctfAiToggle" type="button" aria-expanded={aiOpen} onClick={() => setAiOpen((v) => !v)}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.2l3 3.3-3 3.3M6.5 10h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span id="ctfAiToggleLabel">{aiOpen ? 'Hide AI hint' : 'Ask AI for a hint'}</span>
                  </button>
                  <div className={'ctf-ai-panel' + (aiOpen ? ' visible' : '')} id="ctfAiPanel">
                    <textarea id="ctfAiQ" className="ctf-ai-q" rows={2} maxLength={300} placeholder="What have you tried so far? (optional)" value={aiQ} onChange={(e) => setAiQ(e.target.value)} />
                    <div className="ctf-ai-row">
                      <span className="ctf-ai-left" id="ctfAiLeft">{ai ? `${ai.remaining} of ${ai.max} AI hints left` : 'AI hints are limited per challenge'}</span>
                      <button className="ctf-ai-go" id="ctfAiGo" type="button" disabled={aiBusy} onClick={askAi}>Get hint</button>
                    </div>
                    <div className="ctf-ai-out" id="ctfAiOut" aria-live="polite">
                      {ai?.cards.map((card, i) => (
                        <div className="ctf-ai-card" key={i}>
                          <div className="lab">AI hint {card.n}</div>
                          <div className="txt">{card.hint}</div>
                        </div>
                      ))}
                      {aiNote && <div className={aiNote.cls}>{aiNote.text}</div>}
                    </div>
                  </div>
                </div>

                <div id="ctfLaunchWrap" style={{ display: shown.labUrl ? 'block' : 'none' }}>
                  <div id="ctfStartWrap" style={{ marginBottom: 14, display: running ? 'none' : 'block' }}>
                    <a className="ctf-launch-btn" id="ctfLaunchBtn" href="#" onClick={(e) => { e.preventDefault(); startLab(false); }}>
                      <span id="ctfLaunchLabel">START</span>
                    </a>
                  </div>
                  <div id="ctfRunningWrap" style={{ display: running ? 'block' : 'none' }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <button className="ctf-restart-btn" onClick={() => startLab(true)}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5a4 4 0 1 0 1-2.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /><path d="M2.5 2.5v2h2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Restart Instance
                      </button>
                      <a className="ctf-viewlab-btn" href="#" onClick={viewLab}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12h7A1.5 1.5 0 0 0 11 10.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M8 1h4m0 0v4m0-4L6 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        View Lab
                      </a>
                    </div>
                  </div>
                </div>

                <div className={'ctf-timer-row' + (running ? ' show' : '')} id="ctfTimerRow">
                  <div className="ctf-timer-left">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#ffffff" strokeWidth="1.2" /><path d="M6.5 3.5v3l2 1.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    Instance Time Remaining
                  </div>
                  <span className={timerCls} id="ctfTimerVal">{fmt(secsLeft)}</span>
                </div>

                <div className="ctf-flag-section" id="ctfFlagSection" style={{ display: flagVisible ? 'block' : 'none' }}>
                  <div className="ctf-flag-label">Submit Your Flag</div>
                  <div className="ctf-flag-row">
                    <input ref={flagInput} type="text" className={'ctf-flag-input' + (flagCls ? ' ' + flagCls : '')} id="ctfFlagInput" placeholder="ACX{your_flag_here}" autoComplete="off"
                      value={flag} onChange={(e) => setFlag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitFlag(); }} />
                    <button className="ctf-submit-btn" id="ctfSubmitBtn" disabled={submitting} onClick={submitFlag}>{submitting ? 'Checking...' : 'Submit'}</button>
                  </div>
                  <div className={'ctf-flag-msg' + (flagMsg ? ' ' + flagMsg.type : '')} id="ctfFlagMsg">{flagMsg?.text}</div>
                </div>
              </div>
            )}
          </div>

          {/* Solve celebration toast */}
          <div className={'ctf-solve-toast' + (toast.show ? ' show' : '')} id="ctfSolveToast">
            <div className="ctf-solve-toast-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9.5l3.5 3.5L14 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div className="ctf-solve-toast-title">Flag Captured!</div>
              <div className="ctf-solve-toast-sub" id="ctfSolveToastSub">{toast.sub}</div>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
