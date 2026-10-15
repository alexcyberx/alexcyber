'use client';

// AlexRecon / AlexUtils / AlexTrace on Next: the SPA's own markup (read from
// index.html, lib/legacy-tools.ts) plus the SPA's own script (js/tools/*.js),
// so every feature, API call and error message stays exactly as it was.
// This component supplies what those scripts expect from the old SPA:
//   - escapeHtml()                (js/page-scripts.js)
//   - window._currentUser         (js/auth.js), from the Next auth context
//   - showAuth('login', page)     -> the Next login modal, back to this page after
//   - the fetch wrapper that adds "Authorization: Bearer <token>" to /api/ calls
//   - jsPDF for AlexRecon's PDF export (same CDN build as index.html)
// and calls the tool's init function, as js/router.js does on the SPA.

import { memo, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { LegacyToolKey } from '@/lib/legacy-tools';
import { browserSupabase } from '@/lib/supabase';

type ToolWindow = Window & {
  _currentUser?: { id: string; email: string } | null;
  _acxToolBridge?: boolean;
  _acxScripts?: Record<string, Promise<void>>;
  escapeHtml?: (s: unknown) => string;
  showAuth?: (mode?: string, page?: string) => void;
  showPage?: (page: string) => void;
  initAlexReconPage?: () => void;
  initAlexUtilsPage?: () => void;
  initAlexTracePage?: () => void;
};

const JSPDF = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

const SCRIPTS: Record<LegacyToolKey, string[]> = {
  alexrecon: ['/js/tools/common.js', '/js/tools/alexrecon.js'],
  alexutils: ['/js/tools/common.js', '/js/tools/alexutils.js'],
  alextrace: ['/js/tools/common.js', '/js/tools/alextrace.js'],
};

const INIT: Record<LegacyToolKey, 'initAlexReconPage' | 'initAlexUtilsPage' | 'initAlexTracePage'> = {
  alexrecon: 'initAlexReconPage',
  alexutils: 'initAlexUtilsPage',
  alextrace: 'initAlexTracePage',
};

// Each script once per page load (they declare top-level consts).
function loadScript(src: string): Promise<void> {
  const w = window as ToolWindow;
  w._acxScripts = w._acxScripts || {};
  if (!w._acxScripts[src]) {
    w._acxScripts[src] = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => { delete w._acxScripts![src]; reject(new Error('could not load ' + src)); };
      document.body.appendChild(s);
    });
  }
  return w._acxScripts[src];
}

// Globals the old tool scripts use. Installed once per page load.
function installBridge() {
  const w = window as ToolWindow;
  if (w._acxToolBridge) return;
  w._acxToolBridge = true;

  // Same as escapeHtml() in js/page-scripts.js.
  if (typeof w.escapeHtml !== 'function') {
    w.escapeHtml = (str: unknown) => {
      const div = document.createElement('div');
      div.textContent = str == null ? '' : String(str);
      return div.innerHTML;
    };
  }

  // Same as the wrapper at the top of js/page-scripts.js: our /api/ routes
  // verify the Supabase access token.
  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url || '';
      const sameOriginApi = url.startsWith('/api/') || url.startsWith(window.location.origin + '/api/');
      const sb = sameOriginApi ? browserSupabase() : null;
      if (sb) {
        const { data } = await sb.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          const h = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
          if (!h.has('Authorization')) h.set('Authorization', 'Bearer ' + token);
          init = { ...init, headers: h };
        }
      }
    } catch { /* fall through to the plain request */ }
    return origFetch(input, init);
  };
}

// The markup never re-renders: the tool script owns everything inside it.
const Markup = memo(function Markup({ pageId, html }: { pageId: string; html: string }) {
  return <div id={pageId} className="page active" dangerouslySetInnerHTML={{ __html: html }} />;
});

export default function LegacyTool({ tool, pageId, path, html }: { tool: LegacyToolKey; pageId: string; path: string; html: string }) {
  const { user, ready, openAuth } = useAuth();
  const loaded = useRef<Promise<void> | null>(null);
  const openAuthRef = useRef(openAuth);
  openAuthRef.current = openAuth;

  // Bridge + scripts, once.
  useEffect(() => {
    const w = window as ToolWindow;
    installBridge();
    // The scripts ask for login with showAuth(); come back to this tool after it.
    w.showAuth = (mode?: string) => openAuthRef.current(mode === 'signup' ? 'signup' : 'login', path);
    if (typeof w.showPage !== 'function') {
      w.showPage = (page: string) => { window.location.href = page === 'tools' ? '/tools' : '/'; };
    }
    if (tool === 'alexrecon') loadScript(JSPDF).catch(() => { /* arExportPdf() shows its own message */ });
    loaded.current = SCRIPTS[tool].reduce<Promise<void>>((p, src) => p.then(() => loadScript(src)), Promise.resolve());
    loaded.current.catch((e) => console.error('[tools]', e));
  }, [tool, path]);

  // Login state -> window._currentUser, then (re)run the tool's init, like
  // showPage() does on the SPA. Logged out: the login modal, back here after.
  useEffect(() => {
    if (!ready) return;
    const w = window as ToolWindow;
    w._currentUser = user ? { id: user.id, email: user.email } : null;
    if (!user) openAuthRef.current('login', path);
    let cancelled = false;
    loaded.current?.then(() => {
      if (cancelled) return;
      const init = w[INIT[tool]];
      // AlexRecon's init only loads history + schedules, which need a user.
      if (typeof init === 'function' && (user || tool !== 'alexrecon')) init();
    }, () => {});
    return () => { cancelled = true; };
  }, [ready, user, tool, path]);

  return <Markup pageId={pageId} html={html} />;
}
