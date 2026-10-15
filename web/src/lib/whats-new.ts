import { serverSupabase } from './supabase';
import { pathForPage } from './routes';
import { TOOLS } from './tools';

export type NewItem = { type: 'course' | 'ctf' | 'tool'; title: string; addedAt: string; href: string };

// Home "New on AlexCyberX": the newest courses, active CTF rooms and tools,
// each linking straight to the thing itself.
export async function getNewItems(limit = 3): Promise<NewItem[]> {
  const items: NewItem[] = TOOLS.map((t) => ({ type: 'tool', title: t.title, addedAt: t.addedAt, href: t.href }));
  const sb = serverSupabase();
  if (sb) {
    const [courses, ctf] = await Promise.all([
      sb.from('courses').select('title, page_key, created_at').eq('enabled', true),
      sb.from('ctf_challenges').select('title, slug, created_at').eq('status', 'active'),
    ]);
    (courses.data || []).forEach((c) => c.title && c.created_at && items.push({ type: 'course', title: c.title, addedAt: c.created_at, href: pathForPage(c.page_key, '/tutorials') }));
    (ctf.data || []).forEach((c) => c.title && c.created_at && items.push({ type: 'ctf', title: c.title, addedAt: c.created_at, href: '/rooms?open=' + encodeURIComponent(c.slug) }));
  }
  return items
    .filter((it) => !isNaN(new Date(it.addedAt).getTime()))
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, limit);
}
