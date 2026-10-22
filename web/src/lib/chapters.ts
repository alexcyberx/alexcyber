// Course pages (/tutorials/<course>[/<chapter>]) on Next.
//
// The lesson text is still authored in the old SPA's files, unchanged:
//   - Network Forensics: js/chapter-content/forensics-NN.js (window.chapterContentNN),
//     chapter list in js/router.js (`const chapters = [...]`)
//   - Cyber Attacks Fundamentals: js/chapters2.js (loadCyberChapter)
//   - Ethical Hacking: js/chapters3.js (loadEthicalChapter)
// chapters2/3 build their HTML inside the loader functions (template literals
// with ${[...].map(...)}), so the HTML only exists after running them. At build
// time we run those same files in a Node vm with a tiny DOM stub and capture
// what each loader writes into the content box. One source for both apps; a
// lesson text change needs a redeploy of web/ (same as the CTF rooms).
//
// Pages/learnN.html gives the course banner + sidebar header (also one source).
// The DB (content_chapters) decides which chapters are shown (admin switch),
// and holds the text of chapters that have no local file (Forensics ch. 12);
// courses.enabled switches a whole course off.

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { cache } from 'react';
import { serverSupabase } from './supabase';

export type CourseSlug = 'network-forensics' | 'cyber-attacks-fundamentals' | 'ethical-hacking';

export type CourseDef = {
  slug: CourseSlug;
  /** content_chapters.course / track_chapter_view p_course */
  key: 'forensics' | 'attacks' | 'ethical-hacking';
  /** SPA page id (js/router.js), also js/i18n.js currentPage */
  page: 'learn' | 'learn2' | 'learn3';
  /** Element ids of the SPA page, kept so i18n.js and old CSS/tests find them. */
  ids: { overlay: string; sidebar: string; list: string; main: string; content: string; nav: string; prev: string; next: string };
  /** Extra class on sidebar items (the SPA had .cyber-chapter-item for course 2). */
  itemClass: string;
  /** js/translate.js cache key infix: <lang>_<idx>, <lang>_cyber_<idx>, <lang>_ethical_<idx> */
  xlInfix: string;
  /** Page title of a chapter, same wording as the SPA's document.title */
  chapterTitle: (t: string) => string;
  /** Same as PAGE_META in js/router.js */
  meta: { title: string; desc: string };
  /** Same as the SPA: svg <text> greys lifted so diagrams stay readable. */
  svgFill: Record<string, string>;
};

const FILL_ALL = { '#444': '#8080a0', '#333': '#8080a0', '#2a2a2a': '#8080a0', '#555': '#7878a0', '#666': '#9090b0', '#777': '#9898b8', '#888': '#a8a8c0' };
const FILL_SOME = { '#444': '#8080a0', '#333': '#8080a0', '#2a2a2a': '#8080a0', '#555': '#7878a0', '#666': '#9090b0' };

export const COURSE_DEFS: CourseDef[] = [
  {
    slug: 'network-forensics', key: 'forensics', page: 'learn',
    ids: { overlay: 'overlay', sidebar: 'sidebar', list: 'chapterList', main: 'learnMain', content: 'chapterContent', nav: 'chapterNav', prev: 'prevBtn', next: 'nextBtn' },
    itemClass: '', xlInfix: '',
    chapterTitle: (t) => `${t} on AlexCyberX Network Forensics Course`,
    meta: { title: 'Learn with AlexCyberX: Network Forensics Course', desc: 'Free Network Forensics course covering Wireshark, packet analysis, DNS/HTTP forensics, malware traffic analysis, and threat hunting.' },
    svgFill: FILL_ALL,
  },
  {
    slug: 'cyber-attacks-fundamentals', key: 'attacks', page: 'learn2',
    ids: { overlay: 'overlay2', sidebar: 'cyberSidebar', list: 'cyberChapterList', main: 'cyberLearnMain', content: 'cyberChapterContent', nav: 'cyberChapterNav', prev: 'cyberPrevBtn', next: 'cyberNextBtn' },
    itemClass: 'cyber-chapter-item', xlInfix: 'cyber_',
    chapterTitle: (t) => `${t}, AlexCyberX Cyber Attacks Course`,
    meta: { title: 'Learn with AlexCyberX: Cyber Attacks Fundamentals', desc: 'Free Cyber Attacks Fundamentals course covering SQL Injection, XSS, MITM, DoS/DDoS, DNS spoofing, and ransomware.' },
    svgFill: FILL_SOME,
  },
  {
    slug: 'ethical-hacking', key: 'ethical-hacking', page: 'learn3',
    ids: { overlay: 'overlay3', sidebar: 'ethicalSidebar', list: 'ethicalChapterList', main: 'ethicalLearnMain', content: 'ethicalChapterContent', nav: 'ethicalChapterNav', prev: 'ethicalPrevBtn', next: 'ethicalNextBtn' },
    itemClass: 'ethical-chapter-item', xlInfix: 'ethical_',
    chapterTitle: (t) => `${t}, AlexCyberX Ethical Hacking Course`,
    meta: { title: 'Learn with AlexCyberX: Ethical Hacking Complete Course', desc: 'Free complete Ethical Hacking course covering CEH v13 fundamentals, footprinting, scanning, system hacking, web and wireless security, plus AI Security, Cloud and IoT.' },
    svgFill: {},
  },
];

// Old/wrong links that should land on a course (sitemap.xml listed /tutorials/cyber-attacks).
export const COURSE_ALIASES: Record<string, CourseSlug> = { 'cyber-attacks': 'cyber-attacks-fundamentals' };

export function courseDef(slug: string): CourseDef | null {
  return COURSE_DEFS.find((c) => c.slug === slug) || null;
}

/** Same slug rule as track_chapter_view / content_chapters.slug / the ?ch= deep links. */
export function toSlug(t: string): string {
  return String(t || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Build-time extraction from the SPA files ─────────────────────────────

const JS_DIR = path.join(process.cwd(), '..', 'js');
const CONTENT_DIR = path.join(process.cwd(), '..', 'js', 'chapter-content');
const PAGES_DIR = path.join(process.cwd(), '..', 'pages');

type Raw = { title: string; html: string | null }[];

function sandbox() {
  const els: Record<string, { innerHTML: string } | undefined> = {};
  const noop = () => {};
  const el = () => ({ innerHTML: '', textContent: '', style: {}, onclick: null, scrollTo: noop, classList: { add: noop, remove: noop, toggle: noop } });
  const ctx: Record<string, unknown> = {
    document: { getElementById: (id: string) => (els[id] = els[id] || el()), querySelectorAll: () => [] },
    setTimeout: () => 0, scrollTo: noop, innerWidth: 1200, chapterCache: {}, selectedLang: 'hl',
    console: { log: noop, warn: noop, error: noop },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  return { ctx, els };
}

function extractForensics(): Raw {
  const m = readFileSync(path.join(JS_DIR, 'router.js'), 'utf8').match(/const chapters = (\[[\s\S]*?\n\]);/);
  if (!m) throw new Error('js/router.js: forensics chapter list not found');
  const { ctx } = sandbox();
  const list = vm.runInContext(m[1], ctx, { timeout: 2000 }) as { title: string }[];
  readdirSync(CONTENT_DIR).filter((f) => /^forensics-\d+\.js$/.test(f)).forEach((f) => {
    vm.runInContext(readFileSync(path.join(CONTENT_DIR, f), 'utf8'), ctx, { filename: f, timeout: 2000 });
  });
  return list.map((c, i) => {
    const html = ctx['chapterContent' + String(i).padStart(2, '0')];
    return { title: c.title, html: typeof html === 'string' ? html : null };
  });
}

function extractByLoader(file: string, listName: string, loader: string, box: string): Raw {
  const { ctx, els } = sandbox();
  vm.runInContext('var currentCyberChapter=0,currentEthicalChapter=0;' + readFileSync(path.join(JS_DIR, file), 'utf8'), ctx, { filename: file, timeout: 5000 });
  const list = vm.runInContext(listName, ctx) as { title: string }[];
  return list.map((c, i) => {
    delete els[box];
    vm.runInContext(`${loader}(${i})`, ctx, { timeout: 2000 });
    const html = (els as Record<string, { innerHTML: string } | undefined>)[box]?.innerHTML;
    return { title: c.title, html: html && html.trim() ? html : null };
  });
}

// Banner + sidebar header from pages/learnN.html (one source with the SPA).
function extractBanner(page: string) {
  const html = readFileSync(path.join(PAGES_DIR, `${page}.html`), 'utf8');
  const text = (re: RegExp, fb: string) => {
    const m = html.match(re);
    return m ? m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() : fb;
  };
  return {
    header: text(/<div class="sidebar-header">([\s\S]*?)<\/div>/, ''),
    tag: text(/<div class="topic-banner-tag"[^>]*>([\s\S]*?)<\/div>/, ''),
    h1: text(/<div class="topic-banner">[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/, ''),
    desc: text(/<div class="topic-banner">[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/, ''),
  };
}

export type Banner = ReturnType<typeof extractBanner>;

type Extracted = Record<CourseSlug, { chapters: Raw; banner: Banner }>;

let extracted: Extracted | null = null;
function all(): Extracted {
  if (!extracted) {
    extracted = {
      'network-forensics': { chapters: extractForensics(), banner: extractBanner('learn') },
      'cyber-attacks-fundamentals': { chapters: extractByLoader('chapters2.js', 'cyberAttackChapters', 'loadCyberChapter', 'cyberChapterContent'), banner: extractBanner('learn2') },
      'ethical-hacking': { chapters: extractByLoader('chapters3.js', 'ethicalHackingChapters', 'loadEthicalChapter', 'ethicalChapterContent'), banner: extractBanner('learn3') },
    };
  }
  return extracted;
}

/** Static list (titles + slugs), for generateStaticParams and the sitemap. */
export function staticChapters(slug: CourseSlug): { title: string; slug: string }[] {
  return all()[slug].chapters.map((c) => ({ title: c.title, slug: toSlug(c.title) }));
}

// ── Per request (ISR): admin on/off switch + DB text ─────────────────────

export type ChapterItem = {
  index: number;
  num: string; // "01".. as in the SPA sidebar (fixed numbering)
  title: string;
  slug: string;
  enabled: boolean;
  /** Has text (local file or DB). Prev/Next skip chapters without text. */
  hasContent: boolean;
};

export type CourseData = {
  def: CourseDef;
  banner: Banner;
  chapters: ChapterItem[];
  /** Index of the chapter the course URL opens (first enabled one with text). */
  first: number;
  /** DB text of chapters without a local file, by slug. */
  extra: Record<string, string>;
};

type DbRow = { slug: string; enabled: boolean | null };

const dbRows = cache(async (key: string): Promise<DbRow[] | null> => {
  const sb = serverSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('content_chapters').select('slug, enabled').eq('course', key);
  if (error) { console.error('[chapters] content_chapters:', error.message); return null; }
  return (data as DbRow[]) || [];
});

// RLS lets the anon key read only enabled rows, so a switched-off chapter is
// simply missing from dbRows (like a chapter without a row, which is shown).
// get_hidden_chapters() (security definer, course + slug only) names the
// switched-off ones. Missing or failing: nothing extra is hidden (fail-safe).
const hiddenChapters = cache(async (): Promise<Set<string>> => {
  const sb = serverSupabase();
  if (!sb) return new Set();
  const { data, error } = await sb.rpc('get_hidden_chapters');
  // PGRST202 = not created yet (migration 2026-10-22 step 1), anything else is worth a log line.
  if (error && error.code !== 'PGRST202') console.error('[chapters] get_hidden_chapters:', error.message);
  if (error || !Array.isArray(data)) return new Set();
  return new Set((data as { course: string; slug: string }[]).map((r) => `${r.course}/${r.slug}`));
});

// Course switch (courses.enabled). Anon reads only enabled courses, so a course
// missing from this list is switched off. DB unreachable: null (all shown).
const enabledCourses = cache(async (): Promise<Set<string> | null> => {
  const sb = serverSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('courses').select('course_key').eq('enabled', true);
  if (error || !Array.isArray(data)) { if (error) console.error('[chapters] courses:', error.message); return null; }
  return new Set((data as { course_key: string }[]).map((r) => r.course_key));
});

// DB text, only for chapters that have no local file (the SPA's acxLoadChapterFromDb).
const dbContent = cache(async (key: string, slugs: string): Promise<Record<string, string>> => {
  const sb = serverSupabase();
  const want = slugs ? slugs.split(',') : [];
  if (!sb || !want.length) return {};
  const { data, error } = await sb.from('content_chapters').select('slug, content').eq('course', key).in('slug', want);
  if (error) { console.error('[chapters] content_chapters content:', error.message); return {}; }
  const out: Record<string, string> = {};
  ((data as { slug: string; content: string | null }[]) || []).forEach((r) => { if (want.includes(r.slug) && r.content) out[r.slug] = r.content; });
  return out;
});

/** The course with its chapters, or null for an unknown slug and for a course
 * the admin switched off (no page, list entry, search, sitemap or llms.txt line). */
export const getCourse = cache(async (slug: string): Promise<CourseData | null> => {
  const def = courseDef(slug);
  if (!def) return null;
  const { chapters: raw, banner } = all()[def.slug];
  // Fail-safe like the SPA: DB unreachable -> every chapter shown; a chapter
  // without a DB row counts as enabled.
  const missing = raw.filter((c) => !c.html).map((c) => toSlug(c.title)).join(',');
  const [on, rows, hidden, extra] = await Promise.all([enabledCourses(), dbRows(def.key), hiddenChapters(), dbContent(def.key, missing)]);
  if (on && !on.has(def.key)) return null;
  const bySlug = new Map((rows || []).map((r) => [r.slug, r]));
  const chapters = raw.map((c, i) => {
    const s = toSlug(c.title);
    return {
      index: i, num: String(i + 1).padStart(2, '0'), title: c.title, slug: s,
      enabled: bySlug.get(s)?.enabled !== false && !hidden.has(`${def.key}/${s}`),
      hasContent: Boolean(c.html || extra[s]),
    };
  });
  // First enabled chapter with text; else the first enabled one ("coming soon").
  const firstIdx = chapters.findIndex((c) => c.enabled && c.hasContent);
  const first = firstIdx >= 0 ? firstIdx : Math.max(0, chapters.findIndex((c) => c.enabled));
  return { def, banner, chapters, first, extra };
});

/** HTML of one chapter: the SPA's own string, or the DB text if there is no file. */
export function chapterHtml(course: CourseData, index: number): string | null {
  return all()[course.def.slug].chapters[index]?.html || course.extra[course.chapters[index]?.slug] || null;
}

/** Next enabled chapter with text in `dir` (+1/-1), like goToAdjacentChapter(). */
export function adjacent(course: CourseData, index: number, dir: 1 | -1): ChapterItem | null {
  for (let i = index + dir; i >= 0 && i < course.chapters.length; i += dir) {
    const c = course.chapters[i];
    if (c.enabled && c.hasContent) return c;
  }
  return null;
}

/** Plain text of the first paragraph, for the meta description. */
export function summary(html: string | null, max = 155): string {
  if (!html) return '';
  const m = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const t = (m ? m[1] : html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : t;
}

export function chapterPath(def: CourseDef, slug?: string): string {
  return `/tutorials/${def.slug}` + (slug ? `/${slug}` : '');
}
