import { SITE_URL } from '@/lib/blog';
import { COURSE_DEFS, getCourse, chapterPath } from '@/lib/chapters';
import { TOOLS, plainDesc } from '@/lib/tools';

export const revalidate = 3600;

// /llms.txt (llmstxt.org): a plain-Markdown map of the site for AI assistants
// and agents. Cheap to serve; search engines ignore it.
export async function GET() {
  const L: string[] = [];
  L.push('# AlexCyberX', '');
  L.push('> Free cybersecurity education platform for Indian students by Pavan Kumar (AlexCyberX): full courses in Hinglish (Hindi + English), hands-on Capture The Flag (CTF) labs, and free security tools. Everything is free; an account only saves progress and XP.', '');
  L.push('Courses are written in Hinglish and can be read in English, Hindi, Punjabi, Tamil, Telugu, Bengali and Marathi through the site language picker.', '');
  L.push('## Courses', '');
  for (const def of COURSE_DEFS) {
    const data = await getCourse(def.slug).catch(() => null);
    if (!data) continue;
    L.push(`### [${def.meta.title.replace(/^Learn with AlexCyberX:\s*/, '')}](${SITE_URL}${chapterPath(def)})`, '', def.meta.desc, '');
    data.chapters.filter((c) => c.enabled && c.hasContent).forEach((c) => L.push(`- [${c.title}](${SITE_URL}${chapterPath(def, c.slug)})`));
    L.push('');
  }
  L.push('## CTF challenges', '', `Hands-on Capture The Flag labs (web, forensics, crypto, AI). Free account required to play: ${SITE_URL}/rooms`, '');
  L.push('', '## Tools', '');
  TOOLS.forEach((t) => L.push(`- [${t.title}](${SITE_URL}${t.href}): ${plainDesc(t)}`));
  L.push('', '## More', '');
  L.push(`- [Blog](${SITE_URL}/blog): articles, news and CTF writeups`);
  L.push(`- [Resources](${SITE_URL}/resources): cheat sheets and downloads`);
  L.push(`- [Community](${SITE_URL}/community): discussion forum`);
  L.push(`- [Leaderboard](${SITE_URL}/leaderboard)`);
  L.push(`- [About the founder](${SITE_URL}/#about)`);
  return new Response(L.join('\n') + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
