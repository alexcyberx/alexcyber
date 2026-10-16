import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/blog';
import { COURSE_DEFS, getCourse } from '@/lib/chapters';

export const revalidate = 3600;

// Served at /tutorials/sitemap.xml (linked from the root robots.txt): the course
// list, every course and every chapter that is switched on.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/tutorials`, changeFrequency: 'weekly', priority: 0.8 }];
  for (const def of COURSE_DEFS) {
    const data = await getCourse(def.slug);
    if (!data) continue;
    out.push({ url: `${SITE_URL}/tutorials/${def.slug}`, changeFrequency: 'monthly', priority: 0.9 });
    data.chapters.filter((c) => c.enabled && c.hasContent).forEach((c) => {
      out.push({ url: `${SITE_URL}/tutorials/${def.slug}/${c.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    });
  }
  return out;
}
