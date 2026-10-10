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

// Same queries as fetchCoursesWithCounts() in js/courses.js.
export async function getCoursesWithCounts(): Promise<{ courses: Course[]; counts: Record<string, number> } | null> {
  const sb = serverSupabase();
  if (!sb) return null;
  const [{ data: courses, error: e1 }, { data: chapters, error: e2 }] = await Promise.all([
    sb.from('courses').select('course_key, page_key, icon_key, tag, title, description, show_on_home')
      .eq('enabled', true).order('display_order', { ascending: true }),
    sb.from('content_chapters').select('course').eq('enabled', true),
  ]);
  if (e1 || e2) {
    console.error('[courses] fetch error:', (e1 || e2)?.message);
    return null;
  }
  const counts: Record<string, number> = {};
  (chapters || []).forEach((ch: { course: string }) => { counts[ch.course] = (counts[ch.course] || 0) + 1; });
  return { courses: (courses as Course[]) || [], counts };
}
