// Commands for the home terminal (HeroTerminal). Plain functions, no network.

export type TermItem = { title: string; href: string; note?: string };
export type Line = { kind: 'in' | 'out' | 'dim' | 'link'; text: string; href?: string };
export type TermData = { rooms: TermItem[]; tools: TermItem[]; courses: TermItem[]; userName: string | null };
export type Result = { lines: Line[]; clear?: boolean; go?: string; login?: boolean };

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

const HELP: Line[] = [
  out('Commands:'),
  dim('  ls            sab sections dekho'),
  dim('  ctf           CTF rooms ki list'),
  dim('  tools         tools ki list'),
  dim('  courses       courses ki list'),
  dim('  open <naam>   room / tool / course kholo'),
  dim('  cd <section>  section par jao (ctf, tools, courses, blog)'),
  dim('  whoami        tum kaun ho'),
  dim('  login         login karo'),
  dim('  history, date, echo, clear'),
  dim('Tip: Tab se command poori hoti hai, arrow keys se pichhli commands.'),
];

export function run(raw: string, d: TermData, history: string[]): Result {
  const [cmd = '', ...rest] = raw.trim().split(/\s+/);
  const arg = rest.join(' ');
  switch (cmd.toLowerCase()) {
    case '': return { lines: [] };
    case 'help': return { lines: HELP };
    case 'ls': return { lines: [out('courses/   ctf/   tools/   blog/')] };
    case 'ctf': return { lines: [out(`${d.rooms.length} CTF rooms:`), ...list(d.rooms, 'Abhi koi room nahi.')] };
    case 'tools': return { lines: [out(`${d.tools.length} tools:`), ...list(d.tools, 'Abhi koi tool nahi.')] };
    case 'courses': return { lines: [out(`${d.courses.length} courses:`), ...list(d.courses, 'Abhi koi course nahi.')] };
    case 'blog': return { lines: [link('Blog kholo', '/blog')] };
    case 'whoami':
      return { lines: d.userName ? [out(d.userName)] : [out('guest'), dim("Login karke progress save karo: type 'login'")] };
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
      if (!arg) return { lines: [out("Usage: open <naam>   (e.g. open Caesar)")] };
      const it = findItem(d, arg);
      return it ? { lines: [dim(`Opening ${it.title} ...`)], go: it.href } : { lines: [out(`'${arg}' nahi mila. Try 'ctf', 'tools' or 'courses'.`)] };
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
