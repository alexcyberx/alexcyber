// Shared by /tutorials/<course> (opens the first chapter, like the SPA) and
// /tutorials/<course>/<chapter>.

import type { Metadata } from 'next';
import { permanentRedirect, redirect } from 'next/navigation';
import ChapterView from '@/components/ChapterView';
import { CTF_I18N } from '@/lib/ctf';
import { adjacent, chapterHtml, chapterPath, COURSE_ALIASES, getCourse, summary, type CourseData } from '@/lib/chapters';
import { abs, breadcrumb, ld, OG_IMAGE, ORG, ORG_ID, PERSON, PERSON_ID, plain } from '@/lib/seo';

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
    openGraph: { images: [OG_IMAGE], url, title, description, type: 'article' },
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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: courseLd(data, chapter ? index : null, html) }} />
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
    </>
  );
}

// schema.org for search engines and AI answer engines: the course with all its
// lessons, plus (on a chapter URL) the lesson itself and its breadcrumb.
function courseLd(data: CourseData, index: number | null, html: string): string {
  const { def } = data;
  const courseUrl = abs(chapterPath(def));
  const name = def.meta.title.replace(/^Learn with AlexCyberX:\s*/, '');
  const lessons = data.chapters.filter((c) => c.enabled && c.hasContent);
  const course = {
    '@type': 'Course',
    '@id': courseUrl + '#course',
    name,
    description: def.meta.desc,
    url: courseUrl,
    provider: { '@id': ORG_ID },
    author: { '@id': PERSON_ID },
    inLanguage: 'hi-Latn',
    isAccessibleForFree: true,
    educationalLevel: 'Beginner to Advanced',
    teaches: def.meta.desc,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR', category: 'Free' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${Math.max(1, lessons.length)}H` },
    hasPart: lessons.map((c, i) => ({ '@type': 'LearningResource', position: i + 1, name: c.title, url: abs(chapterPath(def, c.slug)) })),
  };
  const graph: Record<string, unknown>[] = [ORG, PERSON, course];
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Courses', path: '/tutorials' }, { name, path: chapterPath(def) }];
  if (index !== null) {
    const c = data.chapters[index];
    const url = abs(chapterPath(def, c.slug));
    graph.push({
      '@type': 'LearningResource',
      '@id': url + '#lesson',
      name: c.title,
      headline: c.title,
      description: summary(html) || plain(html),
      url,
      learningResourceType: 'Lesson',
      inLanguage: 'hi-Latn',
      isAccessibleForFree: true,
      isPartOf: { '@id': courseUrl + '#course' },
      position: lessons.findIndex((x) => x.slug === c.slug) + 1,
      author: { '@id': PERSON_ID },
      publisher: { '@id': ORG_ID },
    });
    crumbs.push({ name: c.title, path: chapterPath(def, c.slug) });
  }
  graph.push(breadcrumb(crumbs));
  return ld(graph);
}
