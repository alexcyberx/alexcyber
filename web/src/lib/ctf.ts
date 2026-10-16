import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { serverSupabase } from './supabase';

// CTF rooms. The challenge texts (scenario, hints, lab paths) still live in
// js/ctf-challenges-data.js, which the old SPA also uses, so they are read
// from that file at build time (one source while both apps exist). The DB
// (ctf_challenges_public, managed in the admin panel) decides which rooms are
// active and gives the real XP, solver count and the uuid the flag RPC needs.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Challenge = {
  id: string;            // slug, e.g. web-01
  uuid: string | null;   // ctf_challenges.id (null if not in the DB)
  cat: string;
  iconClass: string;
  title: string;
  desc: string;
  tags: string[];
  scenario: string;      // trusted HTML from our own file (<br> only)
  author: string;
  diff: Difficulty;
  xp: number;
  hints: string[];
  labUrl: string | null;
  labApiPath: string | null;
  hasLabFlow: boolean;
  solvers: number;
};

type SeedChallenge = {
  id: string; cat: string; iconClass: string; title: string; desc: string; tags?: string[]; scenario?: string; author?: string;
  diff: Difficulty; xp: number; hints?: string[]; hint?: string; labUrl?: string; labApiPath?: string;
  hasLabFlow?: boolean; solvers?: number;
};

function loadSeed(): { challenges: SeedChallenge[]; icons: Record<string, string> } {
  const file = path.join(process.cwd(), '..', 'js', 'ctf-challenges-data.js');
  const code = readFileSync(file, 'utf8') + '\n;globalThis.__icons = CTF_ICONS;';
  const noop = () => {};
  const store = { getItem: () => null, setItem: noop, removeItem: noop };
  const ctx: Record<string, unknown> = {
    window: { addEventListener: noop },
    document: { addEventListener: noop, getElementById: () => null },
    sessionStorage: store,
    localStorage: store,
    console: { log: noop, warn: noop, error: noop },
  };
  vm.runInNewContext(code, ctx, { filename: 'ctf-challenges-data.js', timeout: 2000 });
  const challenges = (ctx.window as { CTF_CHALLENGES?: SeedChallenge[] }).CTF_CHALLENGES;
  if (!Array.isArray(challenges) || !challenges.length) throw new Error('ctf-challenges-data.js: CTF_CHALLENGES not found');
  return { challenges, icons: ctx.__icons as Record<string, string> };
}

const SEED = loadSeed();

/** Category -> small SVG icon (trusted markup from our own file). */
export const CTF_ICONS: Record<string, string> = SEED.icons;

type DbRow = { id: string; slug: string | null; xp: number | null; points: number | null; solvers: number | null; status: string | null };

export async function getRooms(): Promise<Challenge[]> {
  let rows: DbRow[] | null = null;
  const sb = serverSupabase();
  if (sb) {
    const { data, error } = await sb.from('ctf_challenges_public').select('id, slug, xp, points, solvers, status');
    if (!error && data) rows = data as DbRow[];
  }
  const bySlug = new Map((rows || []).filter((r) => r.slug).map((r) => [r.slug as string, r]));

  const out: Challenge[] = [];
  for (const c of SEED.challenges) {
    const row = bySlug.get(c.id);
    // DB reachable: only rooms that exist there and are active (the flag is
    // checked against the DB, so a room missing there can't be solved).
    if (rows && (!row || (row.status && row.status !== 'active'))) continue;
    const hints = c.hints && c.hints.length ? c.hints : c.hint ? [c.hint] : [];
    out.push({
      id: c.id,
      uuid: row?.id ?? null,
      cat: c.cat,
      iconClass: c.iconClass,
      title: c.title,
      desc: c.desc,
      tags: c.tags || [],
      scenario: c.scenario || '',
      author: c.author || '',
      diff: c.diff,
      // The server awards the DB value, so show that one.
      xp: row?.xp ?? row?.points ?? c.xp,
      hints,
      labUrl: c.labUrl || null,
      labApiPath: c.labApiPath || null,
      hasLabFlow: !!c.hasLabFlow,
      solvers: row ? row.solvers || 0 : 0,
    });
  }
  return out;
}

// ── Language: same hand-written CTF texts as the old page (js/translate.js) ──
export type CtfText = { title?: string; desc?: string; hint?: string; hints?: string[]; scenario?: string };
export type CtfI18n = {
  overrides: Record<string, Record<string, CtfText>>;
  protectedTerms: string[];
  langNames: Record<string, string>;
};

function loadI18n(): CtfI18n {
  const file = path.join(process.cwd(), '..', 'js', 'translate.js');
  const code = readFileSync(file, 'utf8') + '\n;globalThis.__x = { overrides: CTF_OVERRIDES, protectedTerms: PROTECTED_TERMS, langNames: LANG_NAMES };';
  const noop = () => {};
  const ctx: Record<string, unknown> = {
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    document: { getElementById: () => null, addEventListener: noop },
    window: {},
    console: { log: noop, warn: noop, error: noop },
  };
  vm.runInNewContext(code, ctx, { filename: 'translate.js', timeout: 2000 });
  const x = ctx.__x as CtfI18n;
  if (!x || !x.overrides) throw new Error('translate.js: CTF_OVERRIDES not found');
  // Only the rooms we show.
  const ids = new Set(SEED.challenges.map((c) => c.id));
  const overrides: CtfI18n['overrides'] = {};
  Object.entries(x.overrides).forEach(([id, v]) => { if (ids.has(id)) overrides[id] = v; });
  return { overrides, protectedTerms: [...x.protectedTerms], langNames: { ...x.langNames } };
}

export const CTF_I18N: CtfI18n = loadI18n();

// ── Login-only room texts (owner: CTF stays login-only) ──
// The /rooms HTML ships only the card texts (title, desc, tags, ...). The
// scenario and hints (and their translations) come from /rooms/details
// after login, so logged-out visitors and crawlers never get them.

export type RoomDetails = {
  rooms: Record<string, { scenario: string; hints: string[] }>;
  overrides: Record<string, Record<string, Pick<CtfText, 'hint' | 'hints' | 'scenario'>>>;
};

/** Rooms without scenario/hints, for the public page. */
export function publicRooms(rooms: Challenge[]): Challenge[] {
  return rooms.map((c) => ({ ...c, scenario: '', hints: [] }));
}

/** CTF_I18N without the hint/scenario translations. */
export function publicI18n(i18n: CtfI18n): CtfI18n {
  const overrides: CtfI18n['overrides'] = {};
  Object.entries(i18n.overrides).forEach(([id, langs]) => {
    overrides[id] = {};
    Object.entries(langs).forEach(([l, t]) => { overrides[id][l] = { title: t.title, desc: t.desc }; });
  });
  return { ...i18n, overrides };
}

export function roomDetails(): RoomDetails {
  const rooms: RoomDetails['rooms'] = {};
  SEED.challenges.forEach((c) => {
    rooms[c.id] = { scenario: c.scenario || '', hints: c.hints && c.hints.length ? c.hints : c.hint ? [c.hint] : [] };
  });
  const overrides: RoomDetails['overrides'] = {};
  Object.entries(CTF_I18N.overrides).forEach(([id, langs]) => {
    overrides[id] = {};
    Object.entries(langs).forEach(([l, t]) => { overrides[id][l] = { hint: t.hint, hints: t.hints, scenario: t.scenario }; });
  });
  return { rooms, overrides };
}
