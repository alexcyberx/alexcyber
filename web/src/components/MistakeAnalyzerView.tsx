'use client';

// /tools/mistake-analyzer: same markup as #mistakeAnalyzerPage in index.html.
// Logic from handleAnalyzeCommand() / renderAnalyzerResult() in js/page-scripts.js,
// with these fixes:
// - The model's JSON is checked and normalized before rendering (a string
//   instead of a list, "Medium", "Unrecognized" no longer end up as
//   "Network error" or the wrong colour).
// - The server's own message is shown for every error (session expired,
//   suspended, rate limit, tool switched off, timeout), also when the answer
//   is not JSON; the request gives up after 40 s.
// - The login token goes in the Authorization header (no userId in the body).

import { useEffect, useRef, useState } from 'react';
import { ToolIcon } from '@/components/ToolsHub';
import { authHeaders } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const PATH = '/tools/mistake-analyzer';
const MAX_LEN = 500; // same limit as the server
const CLIENT_TIMEOUT_MS = 40 * 1000; // the server gives Gemini 20 s

type Analysis = {
  tool: string;
  unrecognized: boolean;
  whatItDoes: string;
  didRight: string[];
  didWrong: string[];
  betterCommand: string;
  betterCommandWhy: string;
  whenToUse: string;
  risk: string; // low | medium | high, or whatever else the model said
};

const RISK_COLORS: Record<string, string> = { low: '#4ade80', medium: '#fbbf24', high: '#f87171' };

// Model output -> text. Numbers/lists become text, objects are dropped.
function text(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(text).filter(Boolean).join(' ');
  return '';
}

// "None" / "N/A" as a plain string means an empty list.
const NOTHING = /^(none|n\/?a|nothing|-+)\.?$/i;
function list(v: unknown): string[] {
  const items = Array.isArray(v) ? v.map(text) : [text(v)];
  return items.filter((s) => s && !NOTHING.test(s));
}

export function normalizeAnalysis(raw: unknown): Analysis | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  const tool = text(d.tool);
  const riskRaw = text(d.riskLevel).toLowerCase();
  const risk = riskRaw.match(/\b(low|medium|high)\b/)?.[1] || riskRaw.slice(0, 24);
  return {
    tool,
    unrecognized: tool.toLowerCase() === 'unrecognized',
    whatItDoes: text(d.whatItDoes),
    didRight: list(d.didRight),
    didWrong: list(d.didWrong),
    betterCommand: text(d.betterCommand),
    betterCommandWhy: text(d.betterCommandWhy),
    whenToUse: text(d.whenToUse),
    risk,
  };
}

// Server message first; a generic one by status if the body was not JSON
// (e.g. an HTML 502 page from the host).
function errorText(status: number, data: unknown): string {
  const msg = data && typeof data === 'object' ? text((data as { error?: unknown }).error) : '';
  if (msg) return msg;
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 429) return 'Too many requests. Please wait a few minutes and try again.';
  if (status === 504) return 'The analyzer took too long to answer. Please try again in a moment.';
  if (status === 502 || status === 503) return 'Could not reach the analyzer right now. Please try again in a moment.';
  return 'Something went wrong. Please try again.';
}

const INTER = "'Inter',sans-serif";
const RAJ = "'Rajdhani',sans-serif";
const MONO = "'JetBrains Mono',monospace";
const BOX = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 } as const;
const HEAD = { fontFamily: INTER, fontSize: 11, letterSpacing: 0.5, marginBottom: 8 } as const;

function Items({ items }: { items: string[] }) {
  if (!items.length) return <p style={{ fontFamily: INTER, fontSize: 12, color: 'var(--fg-4)' }}>None noted.</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((s, i) => <li key={i} style={{ fontFamily: INTER, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.8 }}>{s}</li>)}
    </ul>
  );
}

function Result({ a }: { a: Analysis }) {
  if (a.unrecognized) {
    return (
      <div style={BOX}>
        <p style={{ fontFamily: INTER, fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.7 }}>{a.whatItDoes || "Couldn't recognize this as a security/networking command."}</p>
      </div>
    );
  }
  const riskColor = RISK_COLORS[a.risk] || '#8a8a95';
  return (
    <div className="cma-box" style={{ ...BOX, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: RAJ, fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>{a.tool || 'Command'}</div>
        <span style={{ fontSize: 10, letterSpacing: 1, fontFamily: RAJ, fontWeight: 700, color: riskColor, border: `1px solid ${riskColor}55`, background: `${riskColor}15`, padding: '3px 10px', borderRadius: 20 }}>{`${(a.risk || 'low').toUpperCase()} RISK`}</span>
      </div>

      <div>
        <p style={{ fontFamily: INTER, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.7 }}>{a.whatItDoes}</p>
      </div>

      <div>
        <div style={{ ...HEAD, color: '#4ade80' }}>✓ WHAT YOU DID RIGHT</div>
        <Items items={a.didRight} />
      </div>

      <div>
        <div style={{ ...HEAD, color: 'var(--accent)' }}>✕ WHAT TO FIX</div>
        <Items items={a.didWrong} />
      </div>

      <div>
        <div style={{ ...HEAD, color: 'var(--fg-3)' }}>BETTER COMMAND</div>
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(var(--fg-rgb),0.1)', borderRadius: 8, padding: 12, fontFamily: MONO, fontSize: 13, color: 'var(--fg-1)', overflowX: 'auto', whiteSpace: 'pre' }}>{a.betterCommand}</div>
        {a.betterCommandWhy && <p style={{ fontFamily: INTER, fontSize: 12, color: 'var(--fg-4)', marginTop: 8, lineHeight: 1.6 }}>{a.betterCommandWhy}</p>}
      </div>

      <div>
        <div style={{ ...HEAD, color: 'var(--fg-3)' }}>WHEN TO USE THIS</div>
        <p style={{ fontFamily: INTER, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.7 }}>{a.whenToUse}</p>
      </div>
    </div>
  );
}

export default function MistakeAnalyzerView() {
  const { user, ready, openAuth } = useAuth();
  const [command, setCommand] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [result, setResult] = useState<Analysis | null>(null);
  // A double click lands before React re-renders the disabled button: one request at a time.
  const inFlight = useRef(false);

  // Logged out: open the login modal and come back here after it.
  useEffect(() => { if (ready && !user) openAuth('login', PATH); }, [ready, user, openAuth]);

  const fail = (t: string) => setStatus({ text: t, error: true });

  async function analyze() {
    if (inFlight.current) return;
    const cmd = command.trim();
    if (!cmd) return fail('Please enter a command first.');
    if (!user) { fail('Please log in to use the analyzer.'); openAuth('login', PATH); return; }
    if (cmd.length > MAX_LEN) { setResult(null); return fail(`Command is too long (max ${MAX_LEN} characters).`); }

    inFlight.current = true;
    setBusy(true);
    setStatus({ text: 'Analyzing...', error: false });
    setResult(null);
    try {
      const res = await fetch('/api/tools/analyze-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ command: cmd }),
        signal: typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(CLIENT_TIMEOUT_MS) : undefined,
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) return fail(errorText(res.status, data));
      const a = normalizeAnalysis(data);
      if (!a) return fail('Analyzer returned an unexpected response. Please try again.');
      setStatus({ text: '', error: false });
      setResult(a);
    } catch (e) {
      const timedOut = e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError');
      fail(timedOut ? 'The analyzer took too long to answer. Please try again in a moment.' : 'Network error. Please try again.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div id="mistakeAnalyzerPage" className="page active">
      <div className="cma-wrap" style={{ maxWidth: 720, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 16px 60px' }}>

        <div style={{ marginBottom: 20 }}>
          <a className="cma-back" href="/tools" style={{ cursor: 'pointer', fontFamily: INTER, fontSize: 12, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6H2M5.5 2.5 2 6l3.5 3.5" stroke="#8a8a95" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Tools
          </a>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--accent)', fontFamily: RAJ, fontWeight: 700, marginBottom: 14, padding: '3px 14px', border: '1px solid var(--glow-border)', borderRadius: 20, background: 'var(--red-dim)', display: 'inline-block' }}>LEARNING</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div className="card-icon-wrap" style={{ marginBottom: 0 }}><ToolIcon toolKey="mistake_analyzer" /></div>
            <h1 style={{ fontFamily: RAJ, fontSize: 'clamp(22px,6vw,30px)', fontWeight: 700, color: 'var(--fg-1)' }}>Cyber Mistake Analyzer</h1>
          </div>
          <p style={{ fontFamily: INTER, fontSize: 13, color: 'var(--fg-4)', lineHeight: 1.7 }}>Paste a command you ran or are learning, nmap, sqlmap, hydra, gobuster, whatever. Get an instant breakdown of what it does, what you got right, what to fix, and a better version.</p>
        </div>

        <div className="cma-box" style={{ ...BOX, marginBottom: 20 }}>
          <label htmlFor="cmaInput" style={{ display: 'block', fontFamily: INTER, fontSize: 11, color: 'var(--fg-3)', marginBottom: 8, letterSpacing: 0.5 }}>YOUR COMMAND</label>
          <textarea
            id="cmaInput"
            rows={3}
            placeholder="e.g. nmap -A scanme.nmap.org"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            style={{ width: '100%', background: 'var(--surface)', border: '1px solid rgba(var(--fg-rgb),0.1)', borderRadius: 8, padding: 12, fontFamily: MONO, fontSize: 13, color: 'var(--fg-1)', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              id="cmaAnalyzeBtn"
              type="button"
              onClick={analyze}
              disabled={busy}
              style={{ background: 'var(--red)', border: 'none', borderRadius: 8, padding: '10px 22px', fontFamily: RAJ, fontSize: 13, fontWeight: 700, color: 'var(--on-accent)', cursor: 'pointer', letterSpacing: 0.5, flexShrink: 0, opacity: busy ? 0.6 : 1 }}
            >Analyze</button>
            <span id="cmaStatus" role="status" style={{ fontFamily: INTER, fontSize: 12, color: status.error ? '#ef4444' : '#8a8a95', lineHeight: 1.5 }}>{status.text}</span>
          </div>
        </div>

        <div id="cmaResult" style={{ display: result ? 'block' : 'none' }}>{result && <Result a={result} />}</div>

        <p style={{ fontFamily: INTER, fontSize: 11, color: 'var(--fg-4)', lineHeight: 1.6, marginTop: 24 }}>Only run security tools against systems you own or are explicitly authorized to test. This tool is for learning, it does not run your command anywhere, it only explains it.</p>
      </div>
    </div>
  );
}
