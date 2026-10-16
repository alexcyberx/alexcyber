import CourseShell from '@/components/CourseShell';
import { CTF_I18N } from '@/lib/ctf';
import { getCourse } from '@/lib/chapters';
import { prepaintScript } from '@/lib/chapter-translate';

// The admin switches chapters on/off in content_chapters; rebuild at most every 5 minutes.
export const revalidate = 300;

// Sidebar + banner stay mounted while the reader moves between chapters.
export default async function CourseLayout({ children, params }: { children: React.ReactNode; params: Promise<{ course: string }> }) {
  const { course } = await params;
  const data = await getCourse(course);
  if (!data) return <>{children}</>; // the page redirects unknown courses
  const { def, banner, chapters, first } = data;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: prepaintScript(Object.keys(CTF_I18N.langNames)) }} />
      <CourseShell
        course={def.slug}
        page={def.page}
        ids={def.ids}
        itemClass={def.itemClass}
        header={banner.header}
        banner={banner}
        chapters={chapters.filter((c) => c.enabled).map((c) => ({ num: c.num, title: c.title, slug: c.slug }))}
        firstSlug={chapters[first].slug}
      >
        {children}
      </CourseShell>
    </>
  );
}
