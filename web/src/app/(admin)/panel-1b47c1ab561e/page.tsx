import AdminApp from '@/admin/AdminApp';
import type { SiteData } from '@/admin/site-data';
import { COURSE_DEFS, staticChapters } from '@/lib/chapters';
import { siteRooms } from '@/lib/ctf';

// Public data only (chapter titles, room cards): the same text the site shows.
function siteData(): SiteData {
  return {
    courses: COURSE_DEFS.map((d) => ({
      key: d.key, slug: d.slug, title: d.meta.title.split(': ').pop() || d.slug,
      chapters: staticChapters(d.slug).map((c, index) => ({ slug: c.slug, title: c.title, index })),
    })),
    rooms: siteRooms(),
  };
}

export default function AdminPage() {
  return <AdminApp site={siteData()} />;
}
