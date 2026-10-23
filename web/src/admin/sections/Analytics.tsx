'use client';

// Analytics: traffic (page views, visitors, visit length, top pages, devices)
// for the last 7 or 30 days, sign-ups per day, and reading progress for every
// course on the site. Everything is counted here from the raw rows (paged
// reads, bounded, the page says so if a bound is reached), not from the two
// old RPCs: get_page_view_stats covers only 7 UTC days and its "average
// session" runs from a tab's first to its last page even days apart (a tab
// keeps its session id), and get_course_completion_stats knows only two
// courses and counts DB chapter rows instead of the site's chapters.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectionProps } from '../AdminApp';
import type { SiteCourse } from '../site-data';
import { adminSupabase } from '../sb';
import { Card, Empty, Modal, Stat, TrendChart, num } from '../ui';

type View = { id: string; page: string | null; user_id: string | null; session_id: string | null; device_type: string | null; created_at: string | null };
type Signup = { id: string; created_at: string | null };
type Read = { user_id: string; course: string; chapter_slug: string; viewed_at: string | null };
type ChapterRow = { course: string; slug: string; enabled: boolean | null };
type CourseRow = { course_key: string; title: string | null; enabled: boolean | null };
type Day = { key: string; label: string; long: string; start: number };
type Res = { data: unknown; error: { message: string } | null };

type Traffic = { views: View[]; days: Day[]; capped: boolean; oldest: number | null; total: number | null; error: string };
type Signups = { times: number[]; days: Day[]; capped: boolean; error: string };
type Reading = { reads: Read[]; chapters: ChapterRow[] | null; courses: CourseRow[] | null; since30: number; capped: boolean; error: string };

const PAGE = 1000;          // PostgREST hands out at most 1000 rows per request
const MAX_VIEWS = 30000;    // page views in 30 days; the page says so if it is reached
const MAX_SIGNUPS = 20000;
const MAX_READS = 50000;    // chapter_progress rows, all time
const GAP_MS = 30 * 60e3;   // a visit ends after 30 minutes without a new page
const TOP_PAGES = 10;
const HEAD = { count: 'exact' as const, head: true };
const DEVICES: Record<string, string> = { desktop: 'Desktop', mobile: 'Mobile', tablet: 'Tablet', unknown: 'Unknown' };
const deviceOf = (d: string | null) => (d && Object.prototype.hasOwnProperty.call(DEVICES, d) ? d : 'unknown');

// Ethical Hacking rows may still carry the old 'eh-<slug>' slugs (same mapping
// as the Courses section), so they count for the site chapter they stand for.
const EH_RENAME: Record<string, string> = {
  'eh-evading-ids-firewalls-honeypots': 'evading-ids-firewalls-and-honeypots',
  'eh-advanced-iot-ot-security': 'advanced-iot-and-ot-security',
};
const siteSlug = (course: string, slug: string) =>
  course === 'ethical-hacking' && slug.startsWith('eh-') ? EH_RENAME[slug] || slug.slice(3) : slug;

// A page path from the tracker (any visitor can send one) becomes a link only
// if it is a plain same-site path: one "/", then URL characters only (no
// spaces, tabs or backslashes, which a browser could turn into "//host").
const PATH_RE = /^\/(?![/\\])[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/;

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
/** The last n calendar days (this device's time zone), oldest first, today last. */
function lastDays(n: number): Day[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return {
      key: dayKey(d), start: d.getTime(),
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      long: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) + '%' : '-');
const width = (a: number, b: number) => (b > 0 ? Math.max(0, Math.min(100, (a / b) * 100)) : 0) + '%';
const dec = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 1 });
function duration(ms: number | null): string {
  if (ms == null) return '-';
  const s = Math.round(ms / 1000);
  if (s < 60) return s + ' s';
  const m = s / 60;
  if (m < 10) return dec(Math.round(m * 10) / 10) + ' min';
  const whole = Math.round(m); // round once, so 119.6 min reads "2 h 0 min", not "1 h 0 min"
  if (whole < 60) return whole + ' min';
  return Math.floor(whole / 60) + ' h ' + (whole % 60) + ' min';
}
const errText = (e: unknown) => (e instanceof Error ? e.message : 'Network error. Try again.');

/** Reads every page of a query (newest first or append-only order), up to max rows. */
async function readPaged<T>(page: (from: number, to: number) => PromiseLike<Res>, max: number, stale: () => boolean): Promise<{ list: T[]; capped: boolean; error: string }> {
  const list: T[] = [];
  for (let from = 0; from < max; from += PAGE) {
    const { data, error } = await page(from, Math.min(from + PAGE, max) - 1);
    if (stale()) return { list, capped: false, error: '' };
    if (error) return { list, capped: false, error: error.message };
    const rows = (data || []) as T[];
    list.push(...rows);
    if (rows.length < PAGE) return { list, capped: false, error: '' };
  }
  return { list, capped: true, error: '' };
}

// Newest first: a view added while paging pushes the rest down one place, so a
// row can come twice (never get lost); the id map drops the copy.
async function loadTraffic(sb: SupabaseClient, days: Day[], stale: () => boolean): Promise<Traffic> {
  const since = new Date(days[0].start).toISOString();
  const [rows, all] = await Promise.all([
    readPaged<View>((a, b) => sb.from('page_views').select('id, page, user_id, session_id, device_type, created_at')
      .gte('created_at', since).order('created_at', { ascending: false }).order('id', { ascending: true }).range(a, b), MAX_VIEWS, stale),
    sb.from('page_views').select('id', HEAD),
  ]);
  const byId = new Map<string, View>();
  rows.list.forEach((v) => byId.set(v.id, v));
  const views = [...byId.values()];
  let oldest: number | null = null;
  views.forEach((v) => { const t = v.created_at ? Date.parse(v.created_at) : NaN; if (!Number.isNaN(t) && (oldest == null || t < oldest)) oldest = t; });
  return { views, days, capped: rows.capped, oldest, total: all.error ? null : all.count ?? 0, error: rows.error };
}

async function loadSignups(sb: SupabaseClient, days: Day[], stale: () => boolean): Promise<Signups> {
  const since = new Date(days[0].start).toISOString();
  const rows = await readPaged<Signup>((a, b) => sb.from('profiles').select('id, created_at')
    .gte('created_at', since).order('created_at', { ascending: false }).order('id', { ascending: true }).range(a, b), MAX_SIGNUPS, stale);
  const byId = new Map<string, number>();
  rows.list.forEach((r) => { const t = r.created_at ? Date.parse(r.created_at) : NaN; if (!Number.isNaN(t)) byId.set(r.id, t); });
  return { times: [...byId.values()], days, capped: rows.capped, error: rows.error };
}

// Oldest first: new reads land at the end, so paging never shifts a row.
async function loadReading(sb: SupabaseClient, since30: number, stale: () => boolean): Promise<Reading> {
  const [rows, ch, co] = await Promise.all([
    readPaged<Read>((a, b) => sb.from('chapter_progress').select('user_id, course, chapter_slug, viewed_at')
      .order('viewed_at', { ascending: true }).order('id', { ascending: true }).range(a, b), MAX_READS, stale),
    sb.from('content_chapters').select('course, slug, enabled').limit(5000),
    sb.from('courses').select('course_key, title, enabled'),
  ]);
  return {
    reads: rows.list, since30, capped: rows.capped, error: rows.error,
    chapters: ch.error ? null : (ch.data || []) as ChapterRow[],
    courses: co.error ? null : (co.data || []) as CourseRow[],
  };
}

type Report = {
  views: number; visitors: number; signedIn: number; perDay: number[]; visitorsPerDay: number[];
  visits: number; single: number; avgMs: number | null;
  pages: { page: string; views: number; visitors: number }[]; pageCount: number;
  devices: { device: string; views: number }[]; partial: boolean;
};

function trafficReport(t: Traffic, range: number): Report {
  const days = t.days.slice(-range);
  const start = days[0].start;
  const index = new Map(days.map((d, i) => [d.key, i]));
  const perDay: number[] = Array(range).fill(0);
  const dayPeople = days.map(() => new Set<string>());
  const people = new Set<string>();
  const signed = new Set<string>();
  const pages = new Map<string, { views: number; people: Set<string> }>();
  const devices = new Map<string, number>();
  const sessions = new Map<string, number[]>();
  // A tab that signs in part way keeps its session id, so its signed-out pages
  // belong to that user too (else one person counts as two visitors).
  const tabUser = new Map<string, string>();
  t.views.forEach((v) => { if (v.session_id && v.user_id && !tabUser.has(v.session_id)) tabUser.set(v.session_id, v.user_id); });
  let views = 0;
  for (const v of t.views) {
    const ts = v.created_at ? Date.parse(v.created_at) : NaN;
    if (!(ts >= start)) continue;
    const i = index.get(dayKey(new Date(ts)));
    if (i == null) continue; // later than today by this device's clock
    views++;
    perDay[i]++;
    // A visitor: the signed-in user, else the tab's session id (an estimate).
    const uid = v.user_id || (v.session_id ? tabUser.get(v.session_id) : undefined);
    const who = uid ? 'u:' + uid : v.session_id ? 's:' + v.session_id : '';
    if (who) { people.add(who); dayPeople[i].add(who); }
    if (uid) signed.add(uid);
    const path = (v.page || '').trim() || '(no page)';
    const p = pages.get(path) || { views: 0, people: new Set<string>() };
    p.views++;
    if (who) p.people.add(who);
    pages.set(path, p);
    const dev = deviceOf(v.device_type);
    devices.set(dev, (devices.get(dev) || 0) + 1);
    if (v.session_id) { const l = sessions.get(v.session_id) || []; l.push(ts); sessions.set(v.session_id, l); }
  }
  // Split each tab's views into visits at a 30 minute gap. A one-page visit has
  // no measurable length, so the average uses visits with 2 or more pages.
  let visits = 0, single = 0, multi = 0, totalMs = 0;
  sessions.forEach((l) => {
    l.sort((a, b) => a - b);
    let first = l[0], last = l[0], count = 1;
    const close = () => { visits++; if (count === 1) single++; else { multi++; totalMs += last - first; } };
    for (let k = 1; k < l.length; k++) {
      if (l[k] - last > GAP_MS) { close(); first = last = l[k]; count = 1; } else { last = l[k]; count++; }
    }
    close();
  });
  const pageList = [...pages.entries()].map(([page, p]) => ({ page, views: p.views, visitors: p.people.size }))
    .sort((a, b) => b.views - a.views || a.page.localeCompare(b.page));
  return {
    views, visitors: people.size, signedIn: signed.size, perDay, visitorsPerDay: dayPeople.map((s) => s.size),
    visits, single, avgMs: multi ? totalMs / multi : null,
    pages: pageList.slice(0, TOP_PAGES), pageCount: pageList.length,
    devices: Object.keys(DEVICES).map((device) => ({ device, views: devices.get(device) || 0 })).filter((d) => d.views > 0),
    // Newest first and cut at the bound: the range is whole only if the oldest row read is older than its start.
    partial: t.capped && (t.oldest == null || t.oldest >= start),
  };
}

type ChapterStat = { slug: string; title: string; num: string; shown: boolean; recorded: boolean; readers: number };
type CourseStat = {
  key: string; title: string; hidden: boolean | null; onSite: number; total: number; unrecorded: number;
  readers: number; everyone: number; active: number; finished: number; avg: number | null; chapters: ChapterStat[];
};
type ReadingReport = { list: CourseStat[]; people: number; finishers: number; active: number; reads: number; other: number; switchesKnown: boolean; coursesKnown: boolean };

function readingReport(r: Reading, courses: SiteCourse[]): ReadingReport {
  // course -> user -> site chapter slugs read; plus who read anything in 30 days.
  const byCourse = new Map<string, Map<string, Set<string>>>();
  const recent = new Map<string, Set<string>>();
  const known = new Map(courses.map((c) => [c.key, new Set(c.chapters.map((ch) => ch.slug))]));
  let other = 0;
  for (const x of r.reads) {
    const slugs = known.get(x.course);
    const slug = siteSlug(x.course, x.chapter_slug);
    if (!slugs || !slugs.has(slug)) { other++; continue; }
    const users = byCourse.get(x.course) || new Map<string, Set<string>>();
    const set = users.get(x.user_id) || new Set<string>();
    set.add(slug);
    users.set(x.user_id, set);
    byCourse.set(x.course, users);
    const t = x.viewed_at ? Date.parse(x.viewed_at) : NaN;
    if (t >= r.since30) { const s = recent.get(x.course) || new Set<string>(); s.add(x.user_id + '|' + slug); recent.set(x.course, s); }
  }
  const people = new Set<string>(), finishers = new Set<string>(), activeAll = new Set<string>();
  let reads = 0;
  const list = courses.map((sc): CourseStat => {
    // Same rules as the site: a chapter is off only when its row says enabled = false.
    const rows = new Map<string, ChapterRow>();
    (r.chapters || []).filter((c) => c.course === sc.key).forEach((c) => {
      const k = siteSlug(c.course, c.slug);
      if (!rows.has(k) || c.slug === k) rows.set(k, c);
    });
    const shown = new Set(sc.chapters.filter((ch) => rows.get(ch.slug)?.enabled !== false).map((ch) => ch.slug));
    // track_chapter_view records a read only for a chapter with a row of that
    // exact slug (an old eh- row does not match) and enabled = true, so a shown
    // chapter without one can never be read here; counting it would make
    // "finished" impossible. Unknown switches: every shown chapter counts.
    const recorded = (slug: string) => { const x = rows.get(slug); return !r.chapters || (!!x && x.slug === slug && x.enabled === true); };
    const counted = new Set([...shown].filter(recorded));
    const row = r.courses?.find((c) => c.course_key === sc.key);
    const users = byCourse.get(sc.key) || new Map<string, Set<string>>();
    const perChapter = new Map<string, number>();
    let readers = 0, finished = 0, sum = 0;
    const activeHere = new Set<string>();
    users.forEach((set, uid) => {
      set.forEach((s) => perChapter.set(s, (perChapter.get(s) || 0) + 1));
      let n = 0;
      set.forEach((s) => { if (counted.has(s)) n++; });
      if (!n) return;
      readers++;
      sum += n;
      reads += n;
      people.add(uid);
      if (n >= counted.size) { finished++; finishers.add(uid); }
    });
    (recent.get(sc.key) || new Set<string>()).forEach((k) => {
      const [uid, s] = k.split('|');
      if (counted.has(s)) { activeHere.add(uid); activeAll.add(uid); }
    });
    return {
      key: sc.key, title: row?.title || sc.title, onSite: shown.size, total: counted.size, unrecorded: shown.size - counted.size,
      // No row (or enabled = false) hides the whole course on the site; unknown if the read failed.
      hidden: r.courses ? !row || row.enabled === false : null,
      // everyone: also people who read only chapters hidden now (the base of the per-chapter list).
      readers, everyone: users.size, active: activeHere.size, finished, avg: readers ? sum / readers : null,
      chapters: sc.chapters.map((ch) => ({
        slug: ch.slug, title: ch.title, num: String(ch.index + 1).padStart(2, '0'),
        shown: shown.has(ch.slug), recorded: recorded(ch.slug), readers: perChapter.get(ch.slug) || 0,
      })),
    };
  });
  return {
    list, people: people.size, finishers: finishers.size, active: activeAll.size, reads, other,
    switchesKnown: r.chapters != null, coursesKnown: r.courses != null,
  };
}

/** Date labels under a TrendChart, at the same x as its dots (viewBox 600, pad 10). */
function Ticks({ labels, show }: { labels: string[]; show: number }) {
  const n = labels.length;
  if (!n) return null;
  const idx = n <= show ? labels.map((_, i) => i) : [...new Set(Array.from({ length: show }, (_, k) => Math.round((k * (n - 1)) / (show - 1))))];
  return (
    <div className="adm-ana-ticks" aria-hidden="true">
      {idx.map((i) => (i === 0 || i === n - 1
        ? <span key={i} className={i === 0 ? 'first' : 'last'}>{labels[i]}</span>
        : <span key={i} style={{ left: (10 + (i * 580) / (n - 1)) / 6 + '%' }}>{labels[i]}</span>))}
    </div>
  );
}

function Bar({ label, value, part, whole }: { label: React.ReactNode; value: React.ReactNode; part: number; whole: number }) {
  return (
    <li className="adm-progress">
      <div className="adm-progress-top"><span className="adm-ana-label">{label}</span><span className="adm-dim adm-num">{value}</span></div>
      <div className="adm-bar"><span style={{ width: width(part, whole) }} /></div>
    </li>
  );
}

export default function Analytics({ site }: SectionProps) {
  const sb = adminSupabase()!;
  const [range, setRange] = useState<7 | 30>(7);
  const [metric, setMetric] = useState<'views' | 'visitors'>('views');
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [signups, setSignups] = useState<Signups | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const seq = useRef(0); // the latest load; older ones (and any after unmount) are dropped

  useEffect(() => () => { seq.current++; }, []);

  const load = useCallback(async () => {
    const my = ++seq.current;
    const stale = () => my !== seq.current;
    setLoading(true);
    const days = lastDays(30);
    const guard = <T,>(p: Promise<T>, done: (v: T) => void, fail: (msg: string) => void) =>
      p.then((v) => { if (!stale()) done(v); }, (e) => { if (!stale()) fail(errText(e)); });
    await Promise.all([
      guard(loadTraffic(sb, days, stale), setTraffic, (error) => setTraffic({ views: [], days, capped: false, oldest: null, total: null, error })),
      guard(loadSignups(sb, days, stale), setSignups, (error) => setSignups({ times: [], days, capped: false, error })),
      guard(loadReading(sb, days[0].start, stale), setReading, (error) => setReading({ reads: [], chapters: null, courses: null, since30: days[0].start, capped: false, error })),
    ]);
    if (!stale()) setLoading(false);
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  const rep = useMemo(() => (traffic && !traffic.error ? trafficReport(traffic, range) : null), [traffic, range]);
  const sign = useMemo(() => {
    if (!signups || signups.error) return null;
    const d = signups.days;
    const index = new Map(d.map((x, i) => [x.key, i]));
    const per: number[] = Array(d.length).fill(0);
    signups.times.forEach((t) => { const i = index.get(dayKey(new Date(t))); if (i != null && t >= d[0].start) per[i]++; });
    const sum = (n: number) => per.slice(-n).reduce((a, b) => a + b, 0);
    return { d7: sum(7), d30: sum(30), d14: per.slice(-14), days14: d.slice(-14) };
  }, [signups]);
  const read = useMemo(() => (reading && !reading.error ? readingReport(reading, site.courses) : null), [reading, site]);
  const closeModal = useCallback(() => setOpen(null), []);

  const days = traffic ? traffic.days.slice(-range) : [];
  const rangeText = range === 7 ? 'last 7 days' : 'last 30 days';
  const trafficVal = (v: (r: Report) => React.ReactNode) => (!traffic ? '...' : rep ? v(rep) : '-');
  const points = rep ? (metric === 'views' ? rep.perDay : rep.visitorsPerDay) : [];
  const chartTotal = rep ? rep.views : 0;
  const maxPage = rep?.pages[0]?.views || 0;
  const course = open && read ? read.list.find((c) => c.key === open) || null : null;

  return (
    <div className="adm-stack">
      <div className="adm-ana-bar">
        <div className="adm-seg" role="group" aria-label="Range" id="admAnaRange">
          <button className={range === 7 ? 'on' : ''} aria-pressed={range === 7} onClick={() => setRange(7)} id="admAnaRange7">Last 7 days</button>
          <button className={range === 30 ? 'on' : ''} aria-pressed={range === 30} onClick={() => setRange(30)} id="admAnaRange30">Last 30 days</button>
        </div>
        <span className="adm-dim">Today counts as one day so far. Days follow this device&apos;s clock.</span>
        <button className="adm-btn ghost" onClick={load} disabled={loading} id="admAnaRefresh">{loading ? 'Loading...' : 'Refresh'}</button>
      </div>

      <div className="adm-stats" id="admAnaStats">
        <Stat label={'Page views, ' + rangeText} value={trafficVal((r) => num(r.views))}
          sub={traffic?.total != null ? `${num(traffic.total)} all time` : undefined} />
        <Stat label={'Unique visitors, ' + rangeText} value={trafficVal((r) => num(r.visitors))}
          sub={rep ? `${num(rep.signedIn)} signed in` : undefined} />
        <Stat label="Average visit" value={trafficVal((r) => duration(r.avgMs))}
          sub={rep && rep.visits ? `${pct(rep.single, rep.visits)} of ${num(rep.visits)} visits saw one page` : undefined} />
        <Stat label={'Sign-ups, ' + rangeText} value={!signups ? '...' : sign ? num(range === 7 ? sign.d7 : sign.d30) : '-'}
          sub={sign ? (range === 7 ? `${num(sign.d30)} in 30 days` : `${num(sign.d7)} in 7 days`) : undefined} />
      </div>
      {traffic?.error && <p className="adm-error" id="admAnaTrafficErr">Could not load page views: {traffic.error}</p>}
      {rep?.partial && (
        <p className="adm-help adm-ana-warn" id="admAnaCapped">
          More than {num(MAX_VIEWS)} page views in 30 days: only the newest {num(MAX_VIEWS)} are counted, so the oldest days read low.
        </p>
      )}
      <p className="adm-help">
        A visitor is a signed-in user, or one browser tab for people who are not signed in (an estimate). A visit ends after
        30 minutes without a new page. Average visit is the time from the first to the last page, over visits with 2 or more
        pages, since one page has no length.
      </p>

      <Card title="Visitor trend" actions={
        <div className="adm-seg" role="group" aria-label="Chart" id="admAnaMetric">
          <button className={metric === 'views' ? 'on' : ''} aria-pressed={metric === 'views'} onClick={() => setMetric('views')} id="admAnaMetricViews">Views</button>
          <button className={metric === 'visitors' ? 'on' : ''} aria-pressed={metric === 'visitors'} onClick={() => setMetric('visitors')} id="admAnaMetricVisitors">Visitors</button>
        </div>
      }>
        {!traffic ? <Empty>Loading...</Empty> : !rep ? <Empty>Could not load page views.</Empty> : !chartTotal ? <Empty>No page views in the {rangeText}.</Empty> : (
          <div className="adm-ana-chart" id="admAnaTrend">
            <TrendChart points={points} labels={days.map((d) => d.long)} unit={metric === 'views' ? 'views' : 'visitors'} />
            <Ticks labels={days.map((d) => d.label)} show={range === 7 ? 7 : 6} />
          </div>
        )}
        <p className="adm-help adm-ana-note">{metric === 'views' ? 'Page views' : 'Unique visitors'} per day, {rangeText}.</p>
      </Card>

      <div className="adm-grid-2 top">
        <Card title="Top pages">
          {!traffic ? <Empty>Loading...</Empty> : !rep ? <Empty>Could not load page views.</Empty> : !rep.pages.length ? <Empty>No page views in the {rangeText}.</Empty> : (
            <ul className="adm-ana-bars" id="admAnaPages">
              {rep.pages.map((p) => (
                <Bar key={p.page} part={p.views} whole={maxPage}
                  label={PATH_RE.test(p.page) ? <a href={p.page} target="_blank" rel="noopener noreferrer" title={p.page}>{p.page}</a> : <span title={p.page}>{p.page}</span>}
                  value={`${num(p.views)} views, ${num(p.visitors)} visitors`} />
              ))}
            </ul>
          )}
          <p className="adm-help adm-ana-note">{rep ? `Top ${Math.min(TOP_PAGES, rep.pageCount)} of ${num(rep.pageCount)} pages` : 'Top pages'} by views, {rangeText}.</p>
        </Card>
        <Card title="Devices">
          {!traffic ? <Empty>Loading...</Empty> : !rep ? <Empty>Could not load page views.</Empty> : !rep.devices.length ? <Empty>No page views in the {rangeText}.</Empty> : (
            <ul className="adm-ana-bars" id="admAnaDevices">
              {rep.devices.map((d) => (
                <Bar key={d.device} label={DEVICES[d.device]} part={d.views} whole={rep.views} value={`${pct(d.views, rep.views)} (${num(d.views)})`} />
              ))}
            </ul>
          )}
          <p className="adm-help adm-ana-note">Share of page views by screen size, {rangeText}.</p>
        </Card>
      </div>

      <Card title="New sign-ups" actions={sign ? <span className="adm-dim" id="admAnaSignups14">{num(sign.d14.reduce((a, b) => a + b, 0))} in 14 days</span> : undefined}>
        {!signups ? <Empty>Loading...</Empty> : signups.error ? <p className="adm-error" id="admAnaSignupErr">Could not load sign-ups: {signups.error}</p> : !sign ? null : !sign.d14.some((n) => n) ? <Empty>No sign-ups in the last 14 days.</Empty> : (
          <div className="adm-ana-chart" id="admAnaSignupChart">
            <TrendChart points={sign.d14} labels={sign.days14.map((d) => d.long)} unit="sign-ups" />
            <Ticks labels={sign.days14.map((d) => d.label)} show={5} />
          </div>
        )}
        {signups?.capped && <p className="adm-help adm-ana-warn">More than {num(MAX_SIGNUPS)} sign-ups in 30 days: only the newest are counted.</p>}
        <p className="adm-help adm-ana-note">New accounts per day, last 14 days.</p>
      </Card>

      <Card title="Course reading">
        {!reading ? <Empty>Loading...</Empty> : reading.error ? <p className="adm-error" id="admAnaReadErr">Could not load course progress: {reading.error}</p> : !read ? null : !read.list.length ? <Empty>No courses on the site.</Empty> : (
          <>
            <div className="adm-stats small" id="admAnaReadStats">
              <Stat label="Readers" value={num(read.people)} />
              <Stat label="Active, last 30 days" value={num(read.active)} />
              <Stat label="Finished a course" value={num(read.finishers)} sub={read.people ? pct(read.finishers, read.people) + ' of readers' : undefined} />
              <Stat label="Chapters read" value={num(read.reads)} />
            </div>
            <div className="adm-table-wrap adm-ana-courses">
              <table className="adm-table" id="admAnaCourses">
                <thead><tr><th>Course</th><th>Readers</th><th>Active, 30 days</th><th>Finished</th><th>Average read</th><th><span className="adm-ana-sr">Chapters</span></th></tr></thead>
                <tbody>
                  {read.list.map((c) => (
                    <tr key={c.key} className="static" data-course={c.key}>
                      <td>
                        <div className="adm-strong">{c.title}</div>
                        <div className="adm-dim">{num(c.onSite)} chapters on the site{c.hidden ? ' | course hidden on the site' : ''}</div>
                        {c.unrecorded > 0 && (
                          <div className="adm-dim adm-ana-warn">
                            {num(c.unrecorded)} with no database row, so reads are not recorded and {c.unrecorded === 1 ? 'it is' : 'they are'} left out. Add the rows in Courses.
                          </div>
                        )}
                      </td>
                      <td className="adm-num">{num(c.readers)}</td>
                      <td className="adm-num">{num(c.active)}</td>
                      <td>
                        <div className="adm-ana-fin">
                          <span className="adm-num"><span className="adm-strong">{pct(c.finished, c.readers)}</span> <span className="adm-dim">{num(c.finished)} of {num(c.readers)}</span></span>
                          <div className="adm-bar"><span style={{ width: width(c.finished, c.readers) }} /></div>
                        </div>
                      </td>
                      <td className="adm-num">{c.avg == null ? '-' : `${dec(c.avg)} of ${num(c.total)}`}</td>
                      <td><button className="adm-btn ghost" onClick={() => setOpen(c.key)} id={'admAnaChap-' + c.key}>Chapters</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {reading?.capped && <p className="adm-help adm-ana-warn">More than {num(MAX_READS)} chapter reads: only the first {num(MAX_READS)} are counted.</p>}
        {read && !read.switchesKnown && <p className="adm-help adm-ana-warn">Could not read which chapters are switched off, so every chapter of the site is counted.</p>}
        {read && !read.coursesKnown && <p className="adm-help adm-ana-warn">Could not read the course switches, so a hidden course is not marked.</p>}
        <p className="adm-help adm-ana-note">
          All time, signed-in users only (visitors are not tracked). A reader opened at least one chapter; finished means every
          chapter shown on the site now. Active: opened a new chapter in the last 30 days.
          {read && read.other > 0 ? ` ${num(read.other)} reads of chapters that are no longer on the site are left out.` : ''}
        </p>
      </Card>

      {course && (
        <Modal title={course.title + ': readers per chapter'} onClose={closeModal} wide>
          <p className="adm-help">
            How many of the {num(course.everyone)} people who opened a chapter of this course opened each one, all time. Where the bars drop is where readers stop.
          </p>
          {!course.chapters.length ? <Empty>This course has no chapters.</Empty> : (
            <ul className="adm-ana-bars adm-ana-modal" id="admAnaChapList">
              {course.chapters.map((ch) => (
                <Bar key={ch.num + '-' + ch.slug} part={ch.readers} whole={course.everyone}
                  label={<><span className="adm-dim">{ch.num}</span> {ch.title}
                    {!ch.shown ? <span className="adm-pill">Hidden</span> : !ch.recorded && <span className="adm-pill danger">Not recorded</span>}</>}
                  value={`${num(ch.readers)} (${pct(ch.readers, course.everyone)})`} />
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}
