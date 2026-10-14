import { serverSupabase } from './supabase';
import { TOOLS } from './tools';

export type MarqueeItem = { type: 'course' | 'ctf' | 'tool'; title: string; addedAt: string | null; href: string };

// Same sources as js/marquee.js, but CTF rooms come from the DB
// (ctf_challenges) instead of the client-side data file. Tools: lib/tools.ts.
const TOOL_ITEMS: MarqueeItem[] = TOOLS.map((t) => ({ type: 'tool', title: t.title, addedAt: t.addedAt, href: t.href }));

export async function getMarqueeItems(): Promise<MarqueeItem[]> {
  const items: MarqueeItem[] = [];
  const sb = serverSupabase();
  if (sb) {
    const [courses, ctf] = await Promise.all([
      sb.from('courses').select('title, created_at').eq('enabled', true).order('display_order'),
      sb.from('ctf_challenges').select('title, created_at').eq('status', 'active').order('created_at'),
    ]);
    (courses.data || []).forEach((c) => c.title && items.push({ type: 'course', title: c.title, addedAt: c.created_at, href: '/tutorials' }));
    (ctf.data || []).forEach((c) => c.title && items.push({ type: 'ctf', title: c.title, addedAt: c.created_at, href: '/rooms' }));
  }
  return items.concat(TOOL_ITEMS);
}
