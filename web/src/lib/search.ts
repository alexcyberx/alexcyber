import { COURSE_DEFS, chapterPath, getCourse } from './chapters';
import { siteRooms } from './ctf';
import { serverSupabase } from './supabase';
import { pathForPage } from './routes';
import { TOOLS, plainDesc } from './tools';

export type SearchEntry = {
  type: 'course' | 'chapter' | 'ctf' | 'tool' | 'blog';
  title: string;
  sub: string;
  href: string;
  tags: string[];
};

const words = (...parts: (string | null | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean).join(' ').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));

const cap = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Tools are not in the DB yet: the shared list (lib/tools.ts), tagged like
// buildToolSearchEntries() in js/search.js (tag + title + text + extra tags).
const TOOL_ENTRIES: SearchEntry[] = TOOLS.map((t) => ({
  type: 'tool', title: t.title, sub: `Tool • ${t.tag}`, href: t.href, tags: words(t.tag, t.title, plainDesc(t), ...t.searchTags),
}));

// One index for the nav search on every Next page (built on the server, cached).
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const out: SearchEntry[] = [];
  const sb = serverSupabase();
  if (sb) {
    const [courses, chapters, ctf, posts, lists] = await Promise.all([
      sb.from('courses').select('course_key, page_key, tag, title, description').eq('enabled', true).order('display_order'),
      sb.from('content_chapters').select('course, slug, title, description').eq('enabled', true),
      sb.from('ctf_challenges').select('slug, title, category, difficulty').or('status.eq.active,status.is.null'),
      sb.from('blog_posts').select('slug, title, category, tags').eq('status', 'published'),
      Promise.all(COURSE_DEFS.map((d) => getCourse(d.slug).catch(() => null))),
    ]);
    // Chapters = the course pages' own lists (code files, admin switches applied;
    // a switched-off course is null). A chapter's DB row only adds search words.
    const dbChapter = new Map((chapters.data || []).map((c) => [`${c.course}/${c.slug}`, c]));
    const shown = (key: string) => lists.find((l) => l?.def.key === key);
    (courses.data || []).forEach((c) => {
      const n = shown(c.course_key)?.chapters.filter((x) => x.enabled).length || 0;
      out.push({ type: 'course', title: c.title, sub: `Course • ${n} ${n === 1 ? "Chapter" : "Chapters"}`, href: pathForPage(c.page_key, '/tutorials'), tags: words(c.tag, c.title, c.description) });
    });
    (courses.data || []).forEach((c) => {
      const data = shown(c.course_key);
      if (!data) return;
      data.chapters.filter((x) => x.enabled && x.hasContent).forEach((ch) => {
        const db = dbChapter.get(`${c.course_key}/${ch.slug}`);
        out.push({
          type: 'chapter', title: ch.title, sub: `${c.title} • Ch ${Number(ch.num)}`,
          href: chapterPath(data.def, ch.slug), tags: words(ch.title, db?.title, db?.description),
        });
      });
    });
    // Only rooms the site really has (a DB-only row opens nothing), with the site's own card text.
    const rooms = new Map(siteRooms().map((r) => [r.slug, r]));
    (ctf.data || []).forEach((c) => {
      const r = rooms.get(c.slug);
      if (!r) return;
      out.push({ type: 'ctf', title: r.title, sub: `CTF • ${r.cat} • ${r.diff}`, href: `/rooms?open=${encodeURIComponent(c.slug)}`, tags: words(r.cat, r.diff, r.title, c.title) });
    });
    (posts.data || []).forEach((p) => {
      out.push({ type: 'blog', title: p.title, sub: `Blog${p.category ? ' • ' + cap(p.category) : ''}`, href: `/blog/${encodeURIComponent(p.slug)}`, tags: words(p.title, p.category, ...(p.tags || [])) });
    });
  }
  out.push(...TOOL_ENTRIES);
  return out.filter((e) => e.title && e.href);
}
