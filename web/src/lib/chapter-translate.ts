// Chapter translation on the Next course pages: a port of the chapter part of
// js/translate.js (v7/v8), same rules and the same localStorage cache, so a
// chapter translated on either app is instant on the other.
//   - Hinglish ('hl') is the original text. Every other language in
//     LANG_NAMES is machine-translated (Google, free endpoint), one text node
//     per request, 4 at a time, <pre>/<code>/[data-no-translate] skipped.
//   - Technical terms (PROTECTED_TERMS in translate.js, read at build time)
//     are swapped for tokens before translating and put back after.
//   - Cache: localStorage acx_ch_<lang>_<idx> | <lang>_cyber_<idx> |
//     <lang>_ethical_<idx>, wiped when acx_cache_ver is not CACHE_VERSION.

export const LANG_KEY = 'acx_lang_v4'; // js/i18n.js
const CACHE_VERSION = 'v8';
const CACHE_VER_KEY = 'acx_cache_ver';
const PREFIX = 'acx_ch_';

/** Inline in the course layout, before the lesson is parsed: hide it if there
 *  is no saved session (the login gate will show) or if it will be translated
 *  (no Hinglish flash). ChapterView removes the classes; compat.css has a
 *  timeout fallback in case scripts fail. */
export function prepaintScript(langs: string[]): string {
  // Lessons are public (search engines and visitors read them); only a
  // translation in progress hides the box until the translated text is in.
  return `(function(){try{var d=document.documentElement;` +
    `var l=localStorage.getItem('${LANG_KEY}')||'en';if(l!=='hl'&&${JSON.stringify(langs)}.indexOf(l)>-1)d.classList.add('acx-xl-wait');` +
    `}catch(e){}})();`;
}

/** The language i18n.js uses: saved choice, else English (its default). */
export function currentLang(): string {
  try { return localStorage.getItem(LANG_KEY) || 'en'; } catch { return 'en'; }
}

let versionChecked = false;
function checkVersion() {
  if (versionChecked) return;
  versionChecked = true;
  try {
    if (localStorage.getItem(CACHE_VER_KEY) === CACHE_VERSION) return;
    Object.keys(localStorage).forEach((k) => { if (k.startsWith(PREFIX)) localStorage.removeItem(k); });
    localStorage.setItem(CACHE_VER_KEY, CACHE_VERSION);
  } catch { /* storage blocked */ }
}

const memory = new Map<string, string>();

export function readCache(key: string): string | null {
  checkVersion();
  if (memory.has(key)) return memory.get(key)!;
  try { return localStorage.getItem(PREFIX + key); } catch { return null; }
}

function saveCache(key: string, html: string) {
  memory.set(key, html);
  try {
    if (html.length < 500000) localStorage.setItem(PREFIX + key, html);
  } catch {
    try {
      const old = Object.keys(localStorage).find((k) => k.startsWith(PREFIX));
      if (old) { localStorage.removeItem(old); localStorage.setItem(PREFIX + key, html); }
    } catch { /* full */ }
  }
}

function protect(text: string, terms: string[]) {
  const found: string[] = [];
  let out = text;
  terms.forEach((term) => {
    const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    out = out.replace(re, (m) => { const t = `zzzterm${found.length}zzz`; found.push(m); return t; });
  });
  return { out, found };
}

async function translateText(text: string, lang: string, terms: string[]): Promise<string> {
  if (!text || !text.trim()) return text;
  const { out, found } = protect(text, terms);
  // 'hi' as source: Hinglish is a Hindi mix, 'auto' often misdetects it.
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(out)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (!data || !data[0]) return text;
    const t = (data[0] as unknown[][]).map((chunk) => (chunk && (chunk[0] as string)) || '').join('');
    return found.length ? t.replace(/zzzterm(\d+)zzz/gi, (m, i) => found[+i] || m) : t;
  } catch {
    return text;
  }
}

function insideCode(node: Node): boolean {
  let el = node.parentElement;
  while (el) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'pre' || tag === 'code' || el.hasAttribute('data-no-translate')) return true;
    el = el.parentElement;
  }
  return false;
}

/** Translate every text node of `html`; same filters as translateHtmlContent(). */
async function translateHtml(html: string, lang: string, terms: string[], onProgress: (done: number, total: number) => void, cancelled: () => boolean): Promise<string | null> {
  const doc = new DOMParser().parseFromString('<div id="root">' + html + '</div>', 'text/html');
  const root = doc.getElementById('root')!;
  const nodes: Text[] = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = (node.textContent || '').trim();
      if (!t || t.length < 2) return NodeFilter.FILTER_REJECT;
      if (/^\d+(\.\d+)?$/.test(t)) return NodeFilter.FILTER_REJECT;
      if (/^\$\{/.test(t)) return NodeFilter.FILTER_REJECT;
      if (insideCode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  if (!nodes.length) return html;
  const CONCURRENT = 4;
  let done = 0;
  for (let i = 0; i < nodes.length; i += CONCURRENT) {
    if (cancelled()) return null;
    await Promise.all(nodes.slice(i, i + CONCURRENT).map(async (node) => {
      const original = node.textContent || '';
      const tr = await translateText(original, lang, terms);
      if (tr && tr.trim() && tr !== original) node.textContent = tr;
      done++;
    }));
    onProgress(done, nodes.length);
    if (i + CONCURRENT < nodes.length) await new Promise((r) => setTimeout(r, 80));
  }
  return root.innerHTML;
}

/** Same clean-up as injectTranslated(): no scripts, no on* handlers, no javascript: links. */
export function sanitize(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script').forEach((s) => s.remove());
    doc.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((a) => { if (/^on/i.test(a.name)) el.removeAttribute(a.name); });
      ['href', 'src'].forEach((a) => { const v = el.getAttribute(a); if (v && /^\s*javascript:/i.test(v)) el.removeAttribute(a); });
    });
    return doc.body.innerHTML;
  } catch {
    return html.replace(/<script[\s\S]*?<\/script>/gi, '');
  }
}

/** Translate a chapter (or take it from the cache). null = cancelled. */
export async function translateChapter(
  html: string, lang: string, cacheKey: string, terms: string[],
  onProgress: (done: number, total: number) => void, cancelled: () => boolean,
): Promise<string | null> {
  const hit = readCache(cacheKey);
  if (hit) return sanitize(hit);
  const out = await translateHtml(html, lang, terms, onProgress, cancelled);
  if (out === null) return null;
  saveCache(cacheKey, out);
  return sanitize(out);
}
