'use client';

// Home hero terminal. It first shows the same demo screen as before (markup
// from index.html). Typing turns the same box (same size) into a small shell
// that links into the site; commands are answered by lib/terminal.ts.

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { complete, run, type Line, type TermItem } from '@/lib/terminal';

type Props = { demoHtml: string; rooms: TermItem[]; tools: TermItem[]; courses: TermItem[] };

export default function HeroTerminal({ demoHtml, rooms, tools, courses }: Props) {
  const { user, openAuth } = useAuth();
  const [session, setSession] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const [height, setHeight] = useState<number | undefined>();
  const demoRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prompt = `${user ? user.name.split(' ')[0].toLowerCase() : 'guest'}@alexcyberx:~$`;
  const data = { rooms, tools, courses, userName: user?.name || null };

  // Keep the newest line in view inside the box.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, session]);

  // Switch from the demo screen to the shell, keeping the box height.
  function startSession() {
    if (session) return;
    if (demoRef.current) setHeight(demoRef.current.offsetHeight);
    setLines([{ kind: 'dim', text: "AlexCyberX terminal. Type 'help' for commands." }]);
    setSession(true);
  }

  function submit() {
    const cmd = input.trim();
    const res = run(cmd, data, hist);
    const echo: Line = { kind: 'in', text: `${prompt} ${input}` };
    if (cmd) setHist((h) => [...h, cmd].slice(-50));
    setHi(-1);
    setInput('');
    if (res.clear) { setLines([]); return; }
    setLines((l) => [...l, echo, ...res.lines].slice(-200));
    if (res.login) openAuth('login');
    if (res.go) setTimeout(() => { window.location.href = res.go!; }, 300);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); startSession(); submit(); return; }
    if (e.key === 'Tab') { e.preventDefault(); startSession(); setInput((v) => complete(v, data)); return; }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!hist.length) return;
      e.preventDefault();
      const next = e.key === 'ArrowUp' ? (hi < 0 ? hist.length - 1 : Math.max(0, hi - 1)) : (hi < 0 ? -1 : hi + 1);
      if (next < 0 || next >= hist.length) { setHi(-1); setInput(''); return; }
      setHi(next);
      setInput(hist[next]);
    }
  }

  const focus = () => inputRef.current?.focus({ preventScroll: true });

  return (
    <div className="hero-terminal ht-interactive" onClick={focus}>
      <div className="ht-bar">
        <div className="dot r"></div><div className="dot y"></div><div className="dot g"></div>
        <span className="ht-title">root@alexcyberx ~ $</span>
      </div>
      {!session ? (
        <div ref={demoRef} className="ht-body ht-body-split" dangerouslySetInnerHTML={{ __html: demoHtml }} suppressHydrationWarning />
      ) : (
        <div className="ht-body ht-body-split ht-session" style={{ height }}>
          <div className="ht-col-left ht-session-col" ref={scrollRef}>
            {lines.map((l, i) => (
              <div key={i} className={'ht-line ht-out-' + l.kind}>
                {l.href ? <a href={l.href} onClick={(e) => e.stopPropagation()}>{l.text}</a> : l.text}
              </div>
            ))}
            <div className="ht-line ht-prompt-line">
              <span className="ht-pr">{prompt}</span> <span className="ht-c">{input}</span><span className="ht-cursor2"></span>
            </div>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        className="ht-hidden-input"
        value={input}
        onChange={(e) => { startSession(); setInput(e.target.value.slice(0, 200)); }}
        onKeyDown={onKey}
        aria-label="Terminal: type a command, for example help"
        autoComplete="off" autoCapitalize="off" spellCheck={false}
      />
      {!session && <div className="ht-type-hint">Click here and type <b>help</b></div>}
    </div>
  );
}
