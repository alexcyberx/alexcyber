'use client';

// Keeps <html data-theme> on the saved choice (lib/theme.ts) for the whole
// life of the page. THEME_BOOT sets it before the first paint, but when Next
// renders the document in the browser (error/not-found shell, a recovered
// render) that inline script never runs and React builds a bare <html>. So:
// paint once on mount, and put it back whenever anything else changes it.

import { useLayoutEffect } from 'react';
import { paintTheme, readPref } from '@/lib/theme';

const want = () => { const p = readPref(); return p === 'green' ? 'dark' : p; };

export default function ThemeSync() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute('data-theme') !== want()) paintTheme(readPref());
    const mo = new MutationObserver(() => {
      if (html.getAttribute('data-theme') !== want()) paintTheme(readPref());
    });
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return null;
}
