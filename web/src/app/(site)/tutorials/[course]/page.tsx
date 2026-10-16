import type { Metadata } from 'next';
import { COURSE_DEFS } from '@/lib/chapters';
import { ChapterPage, chapterMetadata } from './chapter';

// Same as the layout: chapter on/off switches and DB text, at most 5 minutes old.
export const revalidate = 300;

export function generateStaticParams() {
  return COURSE_DEFS.map((c) => ({ course: c.slug }));
}

type Params = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { course } = await params;
  return chapterMetadata(course);
}

// /tutorials/<course>: the first chapter, like the SPA. Old ?ch=<slug> links are
// redirected to /tutorials/<course>/<slug> by Express (and by CourseShell).
export default async function CoursePage({ params }: Params) {
  const { course } = await params;
  return <ChapterPage course={course} />;
}
