// Site theme: 'green' (default) | 'blue' | 'red', applied as
// <html data-theme="dark|blue|red"> ("dark" = the green :root palette in
// css/variables.css). THEME_BOOT runs inline in <head> before the first paint
// so a blue/red page never flashes green. index.html (old SPA, 404s) carries
// a copy of THEME_BOOT: keep the two in sync.
//
// Saved under acx_theme2. The first picker (dark/light/system) used
// acx_theme, and tabs still running that code rewrote acx_theme to "dark"
// whenever another tab changed it, flipping Blue back to Green. A new key is
// invisible to them; a blue/red value left in acx_theme is carried over once.
export type ThemePref = 'green' | 'blue' | 'red';
export const THEME_KEY = 'acx_theme2';
const OLD_KEY = 'acx_theme';

export const THEME_BOOT = `(function(){var t='dark';try{var p=localStorage.getItem('${THEME_KEY}');if(p===null){var o=localStorage.getItem('${OLD_KEY}');if(o==='blue'||o==='red'){p=o;localStorage.setItem('${THEME_KEY}',o);}}if(p==='blue'||p==='red')t=p;}catch(e){}document.documentElement.setAttribute('data-theme',t);})();`;

const norm = (v: string | null): ThemePref => (v === 'blue' || v === 'red' ? v : 'green');

export function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return norm(v === null ? localStorage.getItem(OLD_KEY) : v);
  } catch {
    return 'green';
  }
}

// Only paints the page; never writes the setting.
export function paintTheme(p: ThemePref) {
  document.documentElement.setAttribute('data-theme', p === 'green' ? 'dark' : p);
}

// The user picked a theme here: save it and paint.
export function applyPref(p: ThemePref) {
  try { localStorage.setItem(THEME_KEY, p); } catch {}
  paintTheme(p);
}
