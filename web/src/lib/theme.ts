// Site theme: 'green' (default) | 'blue' | 'red' in localStorage (acx_theme), applied as
// <html data-theme="dark|blue|red"> ("dark" = the green :root palette in
// css/variables.css). THEME_BOOT runs inline in <head> before the first paint
// so a blue/red page never flashes green. Older saved values (dark/light/system,
// from the first theme picker) fall back to green.
export type ThemePref = 'green' | 'blue' | 'red';
export const THEME_KEY = 'acx_theme';

export const THEME_BOOT = `(function(){var t='dark';try{var p=localStorage.getItem('${THEME_KEY}');if(p==='blue'||p==='red')t=p;}catch(e){}document.documentElement.setAttribute('data-theme',t);})();`;

export function readPref(): ThemePref {
  try {
    const p = localStorage.getItem(THEME_KEY);
    return p === 'blue' || p === 'red' ? p : 'green';
  } catch {
    return 'green';
  }
}

export function applyPref(p: ThemePref) {
  try { localStorage.setItem(THEME_KEY, p); } catch {}
  document.documentElement.setAttribute('data-theme', p === 'green' ? 'dark' : p);
}
