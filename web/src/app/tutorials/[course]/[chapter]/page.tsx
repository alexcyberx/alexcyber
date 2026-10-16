import type { Metadata } from 'next';
import { COURSE_DEFS, staticChapters } from '@/lib/chapters';
import { ChapterPage, chapterMetadata } from '../chapter';

export const revalidate = 300;

// Every chapter of every course is built ahead (59 pages, the HTML is local).
export function generateStaticParams() {
  return COURSE_DEFS.flatMap((c) => staticChapters(c.slug).map((ch) => ({ course: c.slug, chapter: ch.slug })));
}

type Params = { params: Promise<{ course: string; chapter: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { course, chapter } = await params;
  return chapterMetadata(course, chapter);
}

export default async function CourseChapterPage({ params }: Params) {
  const { course, chapter } = await params;
  return <ChapterPage course={course} chapter={decodeURIComponent(chapter)} />;
}
