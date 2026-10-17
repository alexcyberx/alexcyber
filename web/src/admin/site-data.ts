// What the site itself is built from (code files, not the DB), passed from the
// server to the admin panel so it can show the real chapter and room lists:
// a chapter or room that exists only in the DB never appears on the site.

export type SiteChapter = { slug: string; title: string; index: number };
export type SiteCourse = { key: string; slug: string; title: string; chapters: SiteChapter[] };
export type SiteRoom = { slug: string; title: string; cat: string; diff: 'Easy' | 'Medium' | 'Hard'; xp: number; hasLab: boolean };
export type SiteData = { courses: SiteCourse[]; rooms: SiteRoom[] };
