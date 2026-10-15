// Site theme: 'dark' | 'light' | 'system' in localStorage (acx_theme), applied
// as <html data-theme="dark|light">. THEME_BOOT runs inline in <head> before
// the first paint so a light page never flashes dark.
export type ThemePref = 'dark' | 'light' | 'system';
export const THEME_KEY = 'acx_theme';

export const THEME_BOOT = `(function(){try{var p=localStorage.getItem('${THEME_KEY}')||'dark';var t=p==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):(p==='light'?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export function readPref(): ThemePref {
  try {
    const p = localStorage.getItem(THEME_KEY);
    return p === 'light' || p === 'system' ? p : 'dark';
  } catch {
    return 'dark';
  }
}

export function resolve(p: ThemePref): 'dark' | 'light' {
  if (p === 'system') return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  return p;
}

export function applyPref(p: ThemePref) {
  try { localStorage.setItem(THEME_KEY, p); } catch {}
  document.documentElement.setAttribute('data-theme', resolve(p));
}
