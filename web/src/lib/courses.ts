import { COURSE_DEFS, getCourse } from './chapters';
import { serverSupabase } from './supabase';

export type Course = {
  course_key: string;
  page_key: string;
  icon_key: string | null;
  tag: string | null;
  title: string;
  description: string | null;
  show_on_home: boolean | null;
};

/** Chapters per course key = what the course sidebar lists: the chapters in the
 * code files minus the switched-off ones. Not the DB rows: a chapter without a
 * row is shown, a row the code does not have is not. */
export async function chapterCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const list = await Promise.all(COURSE_DEFS.map((d) => getCourse(d.slug).catch(() => null)));
  list.forEach((c) => { if (c) counts[c.def.key] = c.chapters.filter((x) => x.enabled).length; });
  return counts;
}

// Same course query as fetchCoursesWithCounts() in js/courses.js.
export async function getCoursesWithCounts(): Promise<{ courses: Course[]; counts: Record<string, number> } | null> {
  const sb = serverSupabase();
  if (!sb) return null;
  const [{ data: courses, error }, counts] = await Promise.all([
    sb.from('courses').select('course_key, page_key, icon_key, tag, title, description, show_on_home')
      .eq('enabled', true).order('display_order', { ascending: true }),
    chapterCounts(),
  ]);
  if (error) {
    console.error('[courses] fetch error:', error.message);
    return null;
  }
  return { courses: (courses as Course[]) || [], counts };
}
