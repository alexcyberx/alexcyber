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

// Course key (content_chapters.course) -> SPA page id
const COURSE_PAGE: Record<string, string> = { forensics: 'learn', attacks: 'learn2', 'ethical-hacking': 'learn3' };

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
    const [courses, chapters, ctf, posts] = await Promise.all([
      sb.from('courses').select('course_key, page_key, tag, title, description').eq('enabled', true).order('display_order'),
      sb.from('content_chapters').select('course, slug, title, chapter_order').eq('enabled', true).order('chapter_order'),
      sb.from('ctf_challenges').select('slug, title, category, difficulty').eq('status', 'active'),
      sb.from('blog_posts').select('slug, title, category, tags').eq('status', 'published'),
    ]);
    const courseTitle: Record<string, string> = {};
    const counts: Record<string, number> = {};
    (chapters.data || []).forEach((c) => { counts[c.course] = (counts[c.course] || 0) + 1; });
    (courses.data || []).forEach((c) => {
      courseTitle[c.course_key] = c.title;
      out.push({ type: 'course', title: c.title, sub: `Course • ${counts[c.course_key] || 0} ${counts[c.course_key] === 1 ? "Chapter" : "Chapters"}`, href: pathForPage(c.page_key, '/tutorials'), tags: words(c.tag, c.title, c.description) });
    });
    const seen: Record<string, number> = {};
    (chapters.data || []).forEach((c) => {
      const n = (seen[c.course] = (seen[c.course] || 0) + 1);
      const page = COURSE_PAGE[c.course];
      if (!page) return;
      out.push({
        type: 'chapter', title: c.title, sub: `${courseTitle[c.course] || c.course} • Ch ${n}`,
        href: `${pathForPage(page)}/${encodeURIComponent(c.slug)}`, tags: words(c.title),
      });
    });
    (ctf.data || []).forEach((c) => {
      out.push({ type: 'ctf', title: c.title, sub: `CTF • ${cap(c.category)}${c.difficulty ? ' • ' + cap(c.difficulty) : ''}`, href: `/rooms?open=${encodeURIComponent(c.slug)}`, tags: words(c.category, c.difficulty, c.title) });
    });
    (posts.data || []).forEach((p) => {
      out.push({ type: 'blog', title: p.title, sub: `Blog${p.category ? ' • ' + cap(p.category) : ''}`, href: `/blog/${encodeURIComponent(p.slug)}`, tags: words(p.title, p.category, ...(p.tags || [])) });
    });
  }
  out.push(...TOOL_ENTRIES);
  return out.filter((e) => e.title && e.href);
}
