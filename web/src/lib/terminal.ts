// Commands for the home terminal (HeroTerminal). Plain functions, no network.

export type TermItem = { title: string; href: string; note?: string };
export type Line = { kind: 'in' | 'out' | 'dim' | 'link'; text: string; href?: string };
export type TermData = { rooms: TermItem[]; tools: TermItem[]; courses: TermItem[]; userName: string | null };
export type Result = { lines: Line[]; clear?: boolean; go?: string; login?: boolean };
// Site language: 'hl' (Hinglish) gets Hinglish text, every other language English.
export type Lang = 'en' | 'hl';

export const COMMANDS = ['help', 'ls', 'ctf', 'tools', 'courses', 'blog', 'open', 'cd', 'whoami', 'login', 'date', 'echo', 'history', 'clear'];

export const out = (text: string): Line => ({ kind: 'out', text });
export const dim = (text: string): Line => ({ kind: 'dim', text });
export const link = (text: string, href: string): Line => ({ kind: 'link', text, href });

const PLACES: Record<string, string> = {
  ctf: '/rooms', rooms: '/rooms', tools: '/tools', courses: '/tutorials',
  tutorials: '/tutorials', blog: '/blog', profile: '/profile', leaderboard: '/leaderboard', home: '/',
};

function list(items: TermItem[], empty: string): Line[] {
  if (!items.length) return [dim(empty)];
  return items.map((it) => link(it.note ? `${it.title}  [${it.note}]` : it.title, it.href));
}

export function findItem(d: TermData, q: string): TermItem | null {
  const s = q.trim().toLowerCase();
  if (!s) return null;
  const all = [...d.rooms, ...d.tools, ...d.courses];
  return all.find((i) => i.title.toLowerCase() === s) || all.find((i) => i.title.toLowerCase().includes(s)) || null;
}

const T = {
  en: {
    help: [
      '  ls            show all sections',
      '  ctf           list of CTF rooms',
      '  tools         list of tools',
      '  courses       list of courses',
      '  open <name>   open a room / tool / course',
      '  cd <section>  go to a section (ctf, tools, courses, blog)',
      '  whoami        who you are',
      '  login         log in',
      '  history, date, echo, clear',
    ],
    tip: 'Tip: Tab completes a command, arrow keys bring back earlier commands.',
    intro: "AlexCyberX terminal. Type 'help' for commands.",
    hint: ['Click here and type', 'help'],
    noRooms: 'No rooms yet.', noTools: 'No tools yet.', noCourses: 'No courses yet.',
    blog: 'Open the blog',
    guest: "Log in to save your progress: type 'login'",
    usage: 'Usage: open <name>   (e.g. open Caesar)',
    notFound: (a: string) => `'${a}' not found. Try 'ctf', 'tools' or 'courses'.`,
  },
  hl: {
    help: [
      '  ls            sab sections dekho',
      '  ctf           CTF rooms ki list',
      '  tools         tools ki list',
      '  courses       courses ki list',
      '  open <naam>   room / tool / course kholo',
      '  cd <section>  section par jao (ctf, tools, courses, blog)',
      '  whoami        tum kaun ho',
      '  login         login karo',
      '  history, date, echo, clear',
    ],
    tip: 'Tip: Tab se command poori hoti hai, arrow keys se pichhli commands.',
    intro: "AlexCyberX terminal. Commands ke liye 'help' likho.",
    hint: ['Yahan click karke likho', 'help'],
    noRooms: 'Abhi koi room nahi.', noTools: 'Abhi koi tool nahi.', noCourses: 'Abhi koi course nahi.',
    blog: 'Blog kholo',
    guest: "Login karke progress save karo: type 'login'",
    usage: 'Usage: open <naam>   (jaise open Caesar)',
    notFound: (a: string) => `'${a}' nahi mila. Try 'ctf', 'tools' or 'courses'.`,
  },
};

export const text = (lang: Lang) => T[lang];

// Words that start with a descender letter (g, j, p, q) are shown with that
// letter in capitals, e.g. "ping" -> "Ping". Display only: commands still work.
export const showTyped = (s: string) => s.replace(/(^|\s)([gjpq])/g, (_m, sp: string, c: string) => sp + c.toUpperCase());

export function run(raw: string, d: TermData, history: string[], lang: Lang = 'en'): Result {
  const t = T[lang];
  const [cmd = '', ...rest] = raw.trim().split(/\s+/);
  const arg = rest.join(' ');
  switch (cmd.toLowerCase()) {
    case '': return { lines: [] };
    case 'help': return { lines: [out('Commands:'), ...t.help.map(dim), dim(t.tip)] };
    case 'ls': return { lines: [out('courses/   ctf/   tools/   blog/')] };
    case 'ctf': return { lines: [out(`${d.rooms.length} CTF rooms:`), ...list(d.rooms, t.noRooms)] };
    case 'tools': return { lines: [out(`${d.tools.length} tools:`), ...list(d.tools, t.noTools)] };
    case 'courses': return { lines: [out(`${d.courses.length} courses:`), ...list(d.courses, t.noCourses)] };
    case 'blog': return { lines: [link(t.blog, '/blog')] };
    case 'whoami':
      return { lines: d.userName ? [out(d.userName)] : [out('guest'), dim(t.guest)] };
    case 'login':
      return d.userName ? { lines: [out(`Already logged in as ${d.userName}.`)] } : { lines: [dim('Opening login...')], login: true };
    case 'date': return { lines: [out(new Date().toString())] };
    case 'echo': return { lines: [out(arg)] };
    case 'history': return { lines: history.map((h, i) => dim(`${String(i + 1).padStart(3)}  ${h}`)) };
    case 'clear': return { lines: [], clear: true };
    case 'cd': {
      const where = PLACES[arg.toLowerCase().replace(/\/$/, '')];
      if (!arg || arg === '~' || arg === '.') return { lines: [] };
      return where ? { lines: [dim(`Opening ${where} ...`)], go: where } : { lines: [out(`cd: ${arg}: No such directory. Try 'ls'.`)] };
    }
    case 'open': {
      if (!arg) return { lines: [out(t.usage)] };
      const it = findItem(d, arg);
      return it ? { lines: [dim(`Opening ${it.title} ...`)], go: it.href } : { lines: [out(t.notFound(arg))] };
    }
    default:
      return { lines: [out(`${cmd}: command not found. Type 'help'.`)] };
  }
}

// Tab: finish the command, or the item name after "open ".
export function complete(input: string, d: TermData): string {
  const m = input.match(/^open\s+(.*)$/i);
  if (m) {
    const it = findItem(d, m[1]);
    return it ? `open ${it.title}` : input;
  }
  const hits = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()));
  return hits.length === 1 ? hits[0] + ' ' : input;
}
