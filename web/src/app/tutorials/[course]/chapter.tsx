// Shared by /tutorials/<course> (opens the first chapter, like the SPA) and
// /tutorials/<course>/<chapter>.

import type { Metadata } from 'next';
import { permanentRedirect, redirect } from 'next/navigation';
import ChapterView from '@/components/ChapterView';
import { CTF_I18N } from '@/lib/ctf';
import { adjacent, chapterHtml, chapterPath, COURSE_ALIASES, getCourse, summary, type CourseData } from '@/lib/chapters';

type Resolved = { data: CourseData; index: number };

/** Course + chapter for a URL, or a redirect (unknown course/chapter, disabled chapter). */
export async function resolve(course: string, chapter?: string): Promise<Resolved> {
  const alias = COURSE_ALIASES[course];
  if (alias) permanentRedirect(`/tutorials/${alias}${chapter ? '/' + chapter : ''}`);
  const data = await getCourse(course);
  if (!data) redirect('/tutorials');
  if (!chapter) return { data, index: data.first };
  const index = data.chapters.findIndex((c) => c.slug === chapter);
  if (index < 0) redirect(chapterPath(data.def));
  // Switched off by the admin: go to the next chapter that is on (as the SPA did).
  if (!data.chapters[index].enabled) {
    const next = adjacent(data, index, 1) || adjacent(data, index, -1);
    redirect(chapterPath(data.def, next ? next.slug : undefined));
  }
  return { data, index };
}

export async function chapterMetadata(course: string, chapter?: string): Promise<Metadata> {
  const data = await getCourse(COURSE_ALIASES[course] || course);
  if (!data) return {};
  const { def } = data;
  const c = chapter ? data.chapters.find((x) => x.slug === chapter) : null;
  const url = chapterPath(def, c?.slug);
  const title = c ? def.chapterTitle(c.title) : def.meta.title;
  const description = c ? summary(chapterHtml(data, c.index)) || def.meta.desc : def.meta.desc;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { url, title, description, type: 'article' },
  };
}

export async function ChapterPage({ course, chapter }: { course: string; chapter?: string }) {
  const { data, index } = await resolve(course, chapter);
  const { def } = data;
  const c = data.chapters[index];
  const html = chapterHtml(data, index)
    || '<p style="color:var(--text-dim);">This chapter is coming soon.</p>';
  const nav = (dir: 1 | -1) => {
    const t = adjacent(data, index, dir);
    return t ? { title: t.title, href: chapterPath(def, t.slug) } : null;
  };
  return (
    <ChapterView
      key={c.slug}
      courseKey={def.key}
      page={def.page}
      index={index}
      slug={c.slug}
      path={chapterPath(def, chapter ? c.slug : undefined)}
      title={c.title}
      html={html}
      ids={def.ids}
      xlInfix={def.xlInfix}
      svgFill={def.svgFill}
      prev={nav(-1)}
      next={nav(1)}
      terms={CTF_I18N.protectedTerms}
      langNames={CTF_I18N.langNames}
    />
  );
}
