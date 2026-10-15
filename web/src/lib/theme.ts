// Site theme: 'green' (default) | 'blue' in localStorage (acx_theme), applied as
// <html data-theme="dark|blue"> ("dark" = the green :root palette in
// css/variables.css). THEME_BOOT runs inline in <head> before the first paint
// so a blue page never flashes green. Older saved values (dark/light/system,
// from the first theme picker) fall back to green.
export type ThemePref = 'green' | 'blue';
export const THEME_KEY = 'acx_theme';

export const THEME_BOOT = `(function(){var t='dark';try{if(localStorage.getItem('${THEME_KEY}')==='blue')t='blue';}catch(e){}document.documentElement.setAttribute('data-theme',t);})();`;

export function readPref(): ThemePref {
  try {
    return localStorage.getItem(THEME_KEY) === 'blue' ? 'blue' : 'green';
  } catch {
    return 'green';
  }
}

export function applyPref(p: ThemePref) {
  try { localStorage.setItem(THEME_KEY, p); } catch {}
  document.documentElement.setAttribute('data-theme', p === 'blue' ? 'blue' : 'dark');
}
