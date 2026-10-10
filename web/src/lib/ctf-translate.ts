// Browser side of the CTF language support, same rules as js/translate.js:
// Hinglish = the base texts (+ its hand-written fixes), English and the
// languages with hand-written texts use those, the rest of the rooms are
// machine-translated (Google, free endpoint) and cached in localStorage under
// the same key as the old page (acx_ctf_<lang>), so both apps share it.

import type { CtfI18n, CtfText } from './ctf';

export const LANG_KEY = 'acx_lang_v4'; // js/i18n.js
export const MT_LANGS = ['hi', 'pa', 'ta', 'te', 'bn', 'mr'];

export type RoomText = { title: string; desc: string; hints: string[]; scenario: string };

function protect(text: string, terms: string[]) {
  const found: string[] = [];
  let out = text;
  [...terms].sort((a, b) => b.length - a.length).forEach((term) => {
    const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    out = out.replace(re, (m) => { const t = `zzzterm${found.length}zzz`; found.push(m); return t; });
  });
  return { out, found };
}

async function translateText(text: string, lang: string, terms: string[]): Promise<string> {
  if (!text || !text.trim()) return text;
  const { out, found } = protect(text, terms);
  // 'hi' as source: the base texts are Hinglish, 'auto' often misdetects it.
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

type Cache = Record<string, CtfText>;

export function readMtCache(lang: string): Cache {
  try { return JSON.parse(localStorage.getItem('acx_ctf_' + lang) || '{}') || {}; } catch { return {}; }
}

/** Machine-translate the given rooms (title, desc, hints); merges into the cache. */
export async function machineTranslate(
  lang: string,
  rooms: { id: string; title: string; desc: string; hints: string[] }[],
  terms: string[],
  onProgress: (done: number, total: number) => void,
): Promise<Cache> {
  const cache = readMtCache(lang);
  const total = rooms.length * 3;
  let done = 0;
  for (const r of rooms) {
    const [title, desc, ...hints] = await Promise.all([
      translateText(r.title, lang, terms),
      translateText(r.desc, lang, terms),
      ...r.hints.map((h) => translateText(h, lang, terms)),
    ]);
    cache[r.id] = { title: title || r.title, desc: desc || r.desc, hints: hints.map((h, i) => h || r.hints[i]) };
    done += 3;
    onProgress(done, total);
    await new Promise((res) => setTimeout(res, 60)); // gentle on the free endpoint
  }
  try {
    const s = JSON.stringify(cache);
    if (s.length < 300000) localStorage.setItem('acx_ctf_' + lang, s);
  } catch { /* storage full/blocked */ }
  return cache;
}

/** Text of one room in `lang` (mt = machine translations for that language). */
export function roomText(base: RoomText, id: string, lang: string, i18n: CtfI18n, mt: Cache): RoomText {
  const ov = i18n.overrides[id]?.[lang];
  const apply = (t: RoomText, o?: CtfText): RoomText => !o ? t : {
    title: o.title || t.title,
    desc: o.desc || t.desc,
    hints: o.hints && o.hints.length ? o.hints : o.hint ? [o.hint] : t.hints,
    scenario: o.scenario || t.scenario,
  };
  if (lang === 'hl' || lang === 'en') return apply(base, ov);
  if (ov) return apply(base, ov);
  if (MT_LANGS.includes(lang) && mt[id]) return apply(base, mt[id]);
  return base;
}

/** Rooms that still need a machine translation for `lang`. */
export function needsMt(ids: string[], lang: string, i18n: CtfI18n, mt: Cache): string[] {
  if (!MT_LANGS.includes(lang)) return [];
  return ids.filter((id) => !i18n.overrides[id]?.[lang] && !mt[id]);
}
