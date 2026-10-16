import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/blog';
import { getRooms } from '@/lib/ctf';
import { TOOLS } from '@/lib/tools';

export const revalidate = 3600;

// /sitemap.xml: main pages, every CTF room page and every tool. Courses and
// chapters are in /tutorials/sitemap.xml, posts in /blog/sitemap.xml.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({ url: SITE_URL + p, priority, changeFrequency });
  const rooms = await getRooms().catch(() => []);
  return [
    u('/', 1.0, 'daily'),
    u('/tutorials', 0.9),
    u('/rooms', 0.9, 'daily'),
    ...rooms.map((r) => u(`/rooms/${r.id}`, 0.8, 'monthly')),
    u('/tools', 0.9),
    ...TOOLS.map((t) => u(t.href, 0.8, 'monthly')),
    u('/blog', 0.8, 'daily'),
    u('/resources', 0.6),
    u('/community', 0.6, 'daily'),
    u('/leaderboard', 0.5, 'daily'),
    u('/privacy-policy', 0.2, 'monthly'),
    u('/terms-of-service', 0.2, 'monthly'),
    u('/disclaimer', 0.2, 'monthly'),
    u('/cookie-notice', 0.2, 'monthly'),
  ];
}
