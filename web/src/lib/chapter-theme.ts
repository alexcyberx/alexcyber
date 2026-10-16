// Course chapters (js/chapters*.js, js/chapter-content/*, DB text) were written
// for the old red/near-black site with fixed colours in inline styles and SVG
// attributes. This maps them to the theme variables (css/variables.css) when
// a chapter is shown, so every chapter follows Matrix / Midnight / Crimson.
// Status colours (green #4ade80, yellow, orange) stay as they are.

const MAP: Record<string, string> = {
  // brand red -> accent
  '#dc1414': 'var(--accent)',
  '#dc6060': 'var(--accent-bright)',
  '#ff8080': 'var(--accent-bright)',
  // near-black surfaces
  '#080810': 'var(--dark)', '#0a0a0e': 'var(--dark)', '#0a0a10': 'var(--dark)',
  '#0e0e12': 'var(--surface)', '#0e0e13': 'var(--surface)', '#0e0e14': 'var(--surface)', '#0f0f13': 'var(--surface)',
  '#0f0f14': 'var(--surface2)', '#0f0f16': 'var(--surface2)', '#13131a': 'var(--surface2)',
  '#1c1c1c': 'var(--surface3)', '#2a2a2a': 'var(--line-strong)', '#333': 'var(--line-strong)', '#333333': 'var(--line-strong)',
  // greys -> text steps
  '#f4f4f5': 'var(--fg-1)', '#ddd': 'var(--fg-1)', '#dddddd': 'var(--fg-1)',
  '#aaa': 'var(--fg-2)', '#aaaaaa': 'var(--fg-2)', '#c0c0cc': 'var(--fg-2)', '#b0b0b8': 'var(--fg-2)',
  '#a0a0b8': 'var(--fg-2)', '#a8a8c0': 'var(--fg-2)', '#9898b8': 'var(--fg-2)',
  '#888': 'var(--fg-3)', '#888888': 'var(--fg-3)', '#9090b0': 'var(--fg-3)', '#8080a0': 'var(--fg-3)',
  '#7878a0': 'var(--fg-3)', '#777': 'var(--fg-3)', '#777777': 'var(--fg-3)',
  '#555': 'var(--fg-4)', '#555555': 'var(--fg-4)', '#666': 'var(--fg-4)', '#666666': 'var(--fg-4)', '#444': 'var(--fg-4)',
};

const HEX = /#(?:[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z])/gi;
const RED_HEX_ALPHA = /#dc1414([0-9a-f]{2})(?![0-9a-z])/gi; // #dc141440 = red at 25%
const RED_RGBA = /rgba\(\s*220\s*,\s*20\s*,\s*20\s*,/gi;
const WHITE_RGBA = /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/gi;

function mapColours(css: string): string {
  return css
    .replace(RED_HEX_ALPHA, (m, a: string) => `rgba(var(--accent-rgb),${Math.round((parseInt(a, 16) / 255) * 100) / 100})`)
    .replace(RED_RGBA, 'rgba(var(--accent-rgb),')
    .replace(WHITE_RGBA, 'rgba(var(--fg-rgb),')
    .replace(HEX, (h) => MAP[h.toLowerCase()] ?? h);
}

// var() is not allowed in SVG presentation attributes (fill="..."), so mapped
// colours move into the element's style.
const PRES_ATTR = /\s(fill|stroke|stop-color)="([^"]*)"/gi;

// SVG labels drawn in dark greys were lifted to lighter greys by ChapterView;
// as theme colours they all become the muted text colour.
const SVG_TEXT_DARK = new Set(['#2a2a2a', '#333', '#444', '#555', '#666', '#777', '#888']);

function mapTag(tag: string): string {
  const moved: string[] = [];
  const isText = /^<(text|tspan)\b/i.test(tag);
  let out = tag.replace(PRES_ATTR, (m, attr: string, val: string) => {
    const v = isText && attr.toLowerCase() === 'fill' && SVG_TEXT_DARK.has(val.toLowerCase()) ? 'var(--fg-3)' : mapColours(val);
    if (v === val) return m;
    moved.push(`${attr.toLowerCase()}:${v}`);
    return '';
  });
  out = out.replace(/\sstyle="([^"]*)"/i, (m, css: string) => ` style="${mapColours(css)}"`);
  if (moved.length) {
    if (/\sstyle="/i.test(out)) out = out.replace(/\sstyle="([^"]*)"/i, (m, css: string) => ` style="${moved.join(';')};${css}"`);
    else out = out.replace(/(\/?>)$/, ` style="${moved.join(';')}"$1`);
  }
  return out;
}

export function themeChapterHtml(html: string): string {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (s) => mapColours(s))
    .replace(/<[a-zA-Z][^<>]*>/g, (t) => mapTag(t));
}
