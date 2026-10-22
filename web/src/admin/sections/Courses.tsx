'use client';

// Courses: one on/off switch per course and per chapter that really hides it
// from the site, "Show on home" (max 2), course card text + icon, and the
// course order. The chapter list, titles and order come from the code files
// (site.courses); the DB only switches chapters off (content_chapters.enabled,
// a chapter without a row is shown). No "Add course/chapter": a DB row alone
// never makes a page (owner decision).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CourseIcon from '@/components/CourseIcon';
import type { SectionProps } from '../AdminApp';
import type { SiteChapter, SiteCourse } from '../site-data';
import { adminSupabase, logAdminEvent } from '../sb';
import { Card, Empty, Modal, Stat, num, useToast } from '../ui';

type CourseRow = {
  id: string; course_key: string; page_key: string | null; slug: string | null; title: string; tag: string | null;
  description: string | null; icon_key: string | null; display_order: number | null; enabled: boolean | null; show_on_home: boolean | null;
};
type ChapterRow = {
  id: string; slug: string; title: string | null; description: string | null; course: string;
  chapter_order: number | null; enabled: boolean | null; has_content: boolean | null;
};
const COURSE_COLS = 'id, course_key, page_key, slug, title, tag, description, icon_key, display_order, enabled, show_on_home';
const CHAPTER_COLS = 'id, slug, title, description, course, chapter_order, enabled, has_content';

// Same keys as components/CourseIcon.tsx (an unknown key shows the shield there).
const ICONS = [
  { key: 'shield', label: 'Shield' }, { key: 'radar', label: 'Radar' }, { key: 'lock', label: 'Lock' },
  { key: 'bug', label: 'Bug' }, { key: 'code', label: 'Code' },
];
const HOME_MAX = 2; // the home grid is laid out for two cards

// Same rule as the site: only enabled === false hides (null counts as on).
const on = (v: boolean | null | undefined) => v !== false;
const byOrder = (a: CourseRow, b: CourseRow) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.title.localeCompare(b.title);

// Ethical Hacking rows still carry the old 'eh-<slug>' slugs until step 2 of
// supabase/migrations/2026-10-22_admin_phase3.sql renames them (same mapping
// here). Matching them now means a switch updates that row instead of adding
// a second one, which would make the rename (unique course + slug) fail.
const EH_RENAME: Record<string, string> = {
  'eh-evading-ids-firewalls-honeypots': 'evading-ids-firewalls-and-honeypots',
  'eh-advanced-iot-ot-security': 'advanced-iot-and-ot-security',
};
const siteSlugOf = (r: ChapterRow) =>
  r.course === 'ethical-hacking' && r.slug.startsWith('eh-') ? EH_RENAME[r.slug] || r.slug.slice(3) : r.slug;
/** A course's rows by the site slug they stand for; a row with the exact slug wins over an old one. */
function matchRows(rows: ChapterRow[]): Map<string, ChapterRow> {
  const m = new Map<string, ChapterRow>();
  rows.forEach((r) => { const k = siteSlugOf(r); if (!m.has(k) || r.slug === k) m.set(k, r); });
  return m;
}

type Sb = NonNullable<ReturnType<typeof adminSupabase>>;
/** Update one row by id; returns the error text or null. An update that RLS
 * filters out (or a row deleted meanwhile) gives no error and no rows, so
 * "no row came back" counts as a failure too, never as "saved". */
async function updateRow(sb: Sb, table: 'courses' | 'content_chapters', id: string, values: Record<string, unknown>): Promise<string | null> {
  const { data, error } = await sb.from(table).update(values).eq('id', id).select('id');
  if (error) return error.message;
  return data && data.length ? null : 'nothing was changed (the row is gone or this session may not edit it). Reload the page.';
}

/** Accessible on/off switch (a button with role="switch"). */
function OnOff({ value, onChange, id, label, onText, offText, disabled }: {
  value: boolean; onChange: (v: boolean) => void; id: string; label: string; onText: string; offText: string; disabled?: boolean;
}) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} id={id} disabled={disabled}
      className={'adm-crs-switch' + (value ? ' on' : '')} onClick={() => onChange(!value)}>
      <span className="adm-crs-track" aria-hidden="true"><span className="adm-crs-knob" /></span>
      <span>{value ? onText : offText}</span>
    </button>
  );
}

export default function Courses({ site }: SectionProps) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [courses, setCourses] = useState<CourseRow[] | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [err, setErr] = useState('');
  const [rpcErr, setRpcErr] = useState('');
  const [tab, setTab] = useState(site.courses[0]?.key || '');
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const inflight = useRef(new Set<string>());
  const [editCourse, setEditCourse] = useState<CourseRow | null>(null);
  const [editChapter, setEditChapter] = useState<ChapterRow | null>(null);

  const load = useCallback(async () => {
    const [c, ch, fn] = await Promise.all([
      sb.from('courses').select(COURSE_COLS).order('display_order', { ascending: true }),
      sb.from('content_chapters').select(CHAPTER_COLS).order('chapter_order', { ascending: true }).limit(2000),
      sb.rpc('get_hidden_chapters'),
    ]);
    if (c.error || ch.error) { setErr((c.error || ch.error)!.message); setCourses([]); return; }
    setErr('');
    setCourses(((c.data || []) as CourseRow[]).sort(byOrder));
    setChapters((ch.data || []) as ChapterRow[]);
    // RLS shows visitors only enabled rows, so the site learns which chapters
    // are off through this function. If it fails (PGRST202 = it does not
    // exist yet) the site hides no chapter at all.
    setRpcErr(!fn.error ? '' : fn.error.code === 'PGRST202' ? 'missing' : 'failing (' + fn.error.message + ')');
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  // One write at a time per key: a second click while saving is ignored and
  // the key shows as busy (switch disabled).
  const run = useCallback(async (key: string, fn: () => Promise<void>) => {
    if (inflight.current.has(key)) return;
    inflight.current.add(key);
    setBusy((b) => ({ ...b, [key]: true }));
    try { await fn(); } finally {
      inflight.current.delete(key);
      setBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  }, []);

  const siteCourse = useCallback((key: string) => site.courses.find((s) => s.key === key) || null, [site]);
  const rowsOf = useCallback((key: string) => chapters.filter((r) => r.course === key), [chapters]);
  const visibleCount = useCallback((sc: SiteCourse) => {
    const rows = matchRows(rowsOf(sc.key));
    return sc.chapters.filter((ch) => on(rows.get(ch.slug)?.enabled)).length;
  }, [rowsOf]);

  const list = courses || [];
  const courseTitle = (key: string) => list.find((c) => c.course_key === key)?.title || siteCourse(key)?.title || key;
  const homeCount = list.filter((c) => c.show_on_home).length;
  const shownCourses = list.filter((c) => on(c.enabled) && siteCourse(c.course_key)).length;
  const shownChapters = site.courses.reduce((n, sc) => n + (list.find((c) => c.course_key === sc.key && on(c.enabled)) ? visibleCount(sc) : 0), 0);
  const noRow = courses && !err ? site.courses.filter((sc) => !list.some((c) => c.course_key === sc.key)) : [];

  async function patchCourse(c: CourseRow, values: Partial<CourseRow>, what: string, ok: string, key = 'course-' + c.id) {
    await run(key, async () => {
      const bad = await updateRow(sb, 'courses', c.id, { ...values, updated_at: new Date().toISOString() });
      if (bad) { toast('Could not save: ' + bad, 'error'); return; }
      setCourses((l) => (l || []).map((x) => (x.id === c.id ? { ...x, ...values } : x)));
      logAdminEvent('admin_course_updated', `"${c.title}" (${c.course_key}): ${what}`);
      toast(ok);
    });
  }

  function setVisible(c: CourseRow, v: boolean) {
    const noPages = siteCourse(c.course_key) ? '' : '\n\nThis row has no course pages in the code, so its card only links to the course list.';
    // The DB trigger trg_notify_course announces a course every time it is switched on.
    const msg = v
      ? `Show "${c.title}" on the site again?\n\nEvery user gets a "New course" notification when a course is switched on.${noPages}`
      : `Hide "${c.title}" from the site?\n\nIt leaves the course list, the home page, search, the sitemap and llms.txt, and its course and chapter pages show "not found". Reading progress is kept. You can switch it back on any time.`;
    if (!confirm(msg)) return;
    patchCourse(c, { enabled: v }, v ? 'shown on the site' : 'hidden from the site', v ? `${c.title} is visible on the site` : `${c.title} is hidden from the site`);
  }

  // All home switches share one key, so a second course cannot be added while
  // the first save is running (homeCount only changes after the save).
  function setHome(c: CourseRow, v: boolean) {
    if (v && homeCount >= HOME_MAX) return toast(`The home page shows at most ${HOME_MAX} courses. Turn one off first.`, 'error');
    patchCourse(c, { show_on_home: v }, v ? 'added to the home page' : 'removed from the home page', v ? 'Added to the home page' : 'Removed from the home page', 'home');
  }

  // Swap with the neighbour, then number the list 0, 1, 2... and save only the
  // rows whose number changed (usually the two). Swapping the two numbers
  // alone does nothing visible when a third course shares one of them.
  async function move(i: number, dir: -1 | 1) {
    const sorted = [...list];
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    [sorted[i], sorted[j]] = [sorted[j], a];
    const changed = sorted.map((c, k) => ({ ...c, display_order: k })).filter((c) => c.display_order !== list.find((x) => x.id === c.id)?.display_order);
    await run('order', async () => {
      const res = await Promise.all(changed.map((c) => updateRow(sb, 'courses', c.id, { display_order: c.display_order, updated_at: new Date().toISOString() })));
      const bad = res.find(Boolean);
      if (bad) { toast('Could not change the order: ' + bad, 'error'); load(); return; }
      // Only the order changes: a switch saved meanwhile must not be undone by this older copy.
      const order = new Map(changed.map((c) => [c.id, c.display_order]));
      setCourses((l) => (l || []).map((x) => (order.has(x.id) ? { ...x, display_order: order.get(x.id)! } : x)).sort(byOrder));
      logAdminEvent('admin_course_updated', `"${a.title}" (${a.course_key}) moved ${dir < 0 ? 'up' : 'down'}`);
      toast('Order saved');
    });
  }

  async function setChapter(sc: SiteCourse, ch: SiteChapter, row: ChapterRow | null, v: boolean) {
    await run('ch-' + sc.key + '/' + ch.slug, async () => {
      if (row) {
        const bad = await updateRow(sb, 'content_chapters', row.id, { enabled: v, updated_at: new Date().toISOString() });
        if (bad) { toast('Could not save: ' + bad, 'error'); return; }
        setChapters((l) => l.map((r) => (r.id === row.id ? { ...r, enabled: v } : r)));
      } else {
        if (v) return; // no row = already visible
        // No row yet (always shown so far): add one that is switched off.
        const { data, error } = await sb.from('content_chapters')
          .insert({ slug: ch.slug, title: ch.title, course: sc.key, chapter_order: ch.index + 1, enabled: false, has_content: true })
          .select(CHAPTER_COLS).single();
        if (error) {
          // 23505 = duplicate. While content_chapters.slug is unique site-wide
          // (before the per-course constraint migration), a slug another course
          // uses cannot get a row here; otherwise the row was made meanwhile.
          const other = error.code === '23505' ? chapters.find((r) => r.slug === ch.slug && r.course !== sc.key) : undefined;
          toast(error.code !== '23505' ? 'Could not hide: ' + error.message
            : other ? `Could not hide: ${courseTitle(other.course)} already has a database row with the slug "${ch.slug}", and the database allows each slug only once.`
              : 'Could not hide: a database row for this chapter already exists. Reload the page.', 'error');
          return;
        }
        setChapters((l) => [...l, data as ChapterRow]);
      }
      logAdminEvent('admin_chapter_updated', `"${ch.title}" (${sc.key}/${ch.slug}): ${v ? 'shown on the site' : 'hidden from the site'}`);
      toast(v ? `${ch.title} is visible` : `${ch.title} is hidden`);
    });
  }

  // Chapter progress and XP need a row (track_chapter_view only counts real,
  // switched-on chapters), so a chapter added to the code later gets one here.
  async function addMissing(sc: SiteCourse, list: SiteChapter[]) {
    await run('missing-' + sc.key, async () => {
      if (!confirm(`Add database rows for ${list.length} chapter${list.length === 1 ? '' : 's'} of ${sc.title}?\n\nThey stay visible. Readers then get progress and chapter XP for them.`)) return;
      const made: ChapterRow[] = [];
      const failed: string[] = [];
      for (const ch of list) {
        const { data, error } = await sb.from('content_chapters')
          .insert({ slug: ch.slug, title: ch.title, course: sc.key, chapter_order: ch.index + 1, enabled: true, has_content: true })
          .select(CHAPTER_COLS).single();
        if (error || !data) failed.push(ch.slug + (error?.code === '23505' ? ' (slug already used by another course until the database update runs)' : error ? ` (${error.message})` : ''));
        else made.push(data as ChapterRow);
      }
      if (made.length) setChapters((l) => [...l, ...made]);
      if (made.length) logAdminEvent('admin_chapter_updated', `${sc.key}: added rows for ${made.map((r) => r.slug).join(', ')}`);
      toast(failed.length ? `Added ${made.length}, failed ${failed.length}: ${failed.join(', ')}` : `Added ${made.length} row${made.length === 1 ? '' : 's'}`, failed.length ? 'error' : 'ok');
    });
  }

  async function setDbOnly(r: ChapterRow, v: boolean) {
    await run('row-' + r.id, async () => {
      const bad = await updateRow(sb, 'content_chapters', r.id, { enabled: v, updated_at: new Date().toISOString() });
      if (bad) { toast('Could not save: ' + bad, 'error'); return; }
      setChapters((l) => l.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)));
      logAdminEvent('admin_chapter_updated', `DB-only row "${r.title || r.slug}" (${r.course}/${r.slug}): ${v ? 'on' : 'off'}`);
      toast(v ? 'Switched on' : 'Switched off');
    });
  }

  const sc = siteCourse(tab);
  const tabRow = list.find((c) => c.course_key === tab) || null;

  return (
    <div className="adm-stack">
      <p className="adm-help" id="admCourseCacheNote">
        The site picks up changes within about 5 minutes (course pages, the course list and the home page are rebuilt at most every 5 minutes).
        Search can take up to 10 minutes, the sitemap and llms.txt up to 1 hour.
      </p>
      <div className="adm-stats">
        <Stat label="Courses on the site" value={courses ? `${num(shownCourses)} of ${num(site.courses.length)}` : '...'} />
        <Stat label="On the home page" value={courses ? `${num(homeCount)} of ${HOME_MAX}` : '...'} />
        <Stat label="Chapters on the site" value={courses ? num(shownChapters) : '...'} sub="in visible courses" />
      </div>

      <Card title="Courses">
        {courses == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load courses: {err}</Empty> : !list.length ? <Empty>No courses in the database.</Empty> : (
          <div className="adm-table-wrap">
            <table className="adm-table" id="admCourses">
              <thead><tr><th>Order</th><th>Course</th><th>Chapters</th><th>On the site</th><th>Home page</th><th /></tr></thead>
              <tbody>
                {list.map((c, i) => {
                  const s = siteCourse(c.course_key);
                  return (
                    <tr key={c.id} className="static" id={'admCourse-' + c.course_key}>
                      <td>
                        <div className="adm-crs-order">
                          <button className="adm-btn ghost" onClick={() => move(i, -1)} disabled={i === 0 || !!busy.order} aria-label={`Move ${c.title} up`} title="Move up" id={'admCourseUp-' + c.course_key}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 7.5L6 4.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <button className="adm-btn ghost" onClick={() => move(i, 1)} disabled={i === list.length - 1 || !!busy.order} aria-label={`Move ${c.title} down`} title="Move down" id={'admCourseDown-' + c.course_key}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5L6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="adm-user-cell">
                          <span className="adm-crs-icon" aria-hidden="true"><CourseIcon name={c.icon_key} /></span>
                          <span className="adm-crs-name">
                            <span><span className="adm-strong">{c.title}</span>{c.tag && <span className="adm-pill">{c.tag}</span>}</span>
                            <span className="adm-dim adm-crs-keys">key <code>{c.course_key}</code> page <code>{c.page_key || '-'}</code>{s && <> url <code>/tutorials/{s.slug}</code></>}</span>
                          </span>
                        </div>
                      </td>
                      <td className="adm-num">{s ? `${visibleCount(s)} of ${s.chapters.length} visible` : <span className="adm-pill danger" title="This row has no course pages in the code">not in the code</span>}</td>
                      <td>
                        <OnOff value={on(c.enabled)} onChange={(v) => setVisible(c, v)} disabled={!!busy['course-' + c.id]} id={'admCourseVisible-' + c.course_key}
                          label={`${c.title} visible on the site`} onText="Visible" offText="Hidden" />
                      </td>
                      <td>
                        <OnOff value={!!c.show_on_home} onChange={(v) => setHome(c, v)} disabled={!!busy.home} id={'admCourseHome-' + c.course_key}
                          label={`${c.title} on the home page`} onText="On home" offText="Off" />
                        {c.show_on_home && !on(c.enabled) && <div className="adm-dim">Not shown while hidden</div>}
                      </td>
                      <td><button className="adm-btn" onClick={() => setEditCourse(c)} id={'admCourseEdit-' + c.course_key}>Edit</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {courses && !err && (
          <p className="adm-help adm-crs-foot" id="admCourseHomeNote">
            The home page shows up to {HOME_MAX} visible courses ({homeCount} picked now). Course key, page and URL are tied to the code and cannot be changed here.
          </p>
        )}
        {noRow.length > 0 && (
          <p className="adm-error adm-crs-foot" id="admCourseNoRow">
            In the code but without a database row, so the site hides {noRow.length === 1 ? 'it' : 'them'}: {noRow.map((x) => x.title).join(', ')}.
          </p>
        )}
      </Card>

      <Card title="Chapters" actions={
        <select className="adm-input adm-select" value={tab} onChange={(e) => setTab(e.target.value)} aria-label="Course" id="admCourseChapterSelect">
          {site.courses.map((s) => <option key={s.key} value={s.key}>{courseTitle(s.key)}</option>)}
        </select>
      }>
        {courses == null ? <Empty>Loading...</Empty> : err ? <Empty>Could not load chapters: {err}</Empty> : !sc ? <Empty>No course.</Empty> : (
          <ChapterList
            sc={sc} course={tabRow} rows={rowsOf(sc.key)} busy={busy} rpcErr={rpcErr}
            onToggle={setChapter} onToggleRow={setDbOnly} onEdit={setEditChapter} onAddMissing={addMissing}
          />
        )}
      </Card>

      {editCourse && <CourseForm c={editCourse} site={siteCourse(editCourse.course_key)} onClose={() => setEditCourse(null)}
        onSaved={(v) => { setCourses((l) => (l || []).map((x) => (x.id === editCourse.id ? { ...x, ...v } : x))); setEditCourse(null); }} />}
      {editChapter && <ChapterForm r={editChapter} onClose={() => setEditChapter(null)}
        onSaved={(v) => { setChapters((l) => l.map((x) => (x.id === editChapter.id ? { ...x, ...v } : x))); setEditChapter(null); }} />}
    </div>
  );
}

function ChapterList({ sc, course, rows, busy, rpcErr, onToggle, onToggleRow, onEdit, onAddMissing }: {
  sc: SiteCourse; course: CourseRow | null; rows: ChapterRow[]; busy: Record<string, boolean>; rpcErr: string;
  onAddMissing: (sc: SiteCourse, list: SiteChapter[]) => void;
  onToggle: (sc: SiteCourse, ch: SiteChapter, row: ChapterRow | null, v: boolean) => void;
  onToggleRow: (r: ChapterRow, v: boolean) => void;
  onEdit: (r: ChapterRow) => void;
}) {
  const bySlug = useMemo(() => matchRows(rows), [rows]);
  const siteSlugs = useMemo(() => new Set(sc.chapters.map((c) => c.slug)), [sc]);
  // Rows no code chapter uses (other slug, or an old slug next to a row with the new one).
  const dbOnly = rows.filter((r) => !siteSlugs.has(siteSlugOf(r)) || bySlug.get(siteSlugOf(r)) !== r);
  const missing = sc.chapters.filter((ch) => !bySlug.has(ch.slug));
  return (
    <div className="adm-stack">
      <p className="adm-help">
        The chapter list, titles and order come from the course files in the code. Here you switch a chapter on or off.
        A chapter without a database row is visible but gives readers no progress or XP; switching it off adds a row for it.
        Edit changes the database title and description, which only add words to the site search.
      </p>
      {course && !on(course.enabled) && <p className="adm-error" id="admCourseChHiddenNote">This whole course is hidden, so none of its chapters show on the site right now.</p>}
      {!!missing.length && (
        <div className="adm-row-form" id="admCourseMissing">
          <p className="adm-error">{missing.length} chapter{missing.length === 1 ? ' has' : 's have'} no database row. {missing.length === 1 ? 'It shows' : 'They show'} on the site, but readers get no progress or chapter XP until the row exists.</p>
          <button className="adm-btn" onClick={() => onAddMissing(sc, missing)} disabled={!!busy['missing-' + sc.key]} id="admCourseAddMissing">{busy['missing-' + sc.key] ? 'Adding...' : 'Add missing rows'}</button>
        </div>
      )}
      {rpcErr && (
        <p className="adm-error" id="admCourseRpcWarn">
          Chapter switches do not reach the site yet: the database function get_hidden_chapters is {rpcErr}, so the site still shows chapters that are switched off here. Course switches already work.
        </p>
      )}
      <div className="adm-table-wrap">
        <table className="adm-table" id="admCourseChapters">
          <thead><tr><th>#</th><th>Chapter</th><th>Database row</th><th>On the site</th><th /></tr></thead>
          <tbody>
            {sc.chapters.map((ch) => {
              const row = bySlug.get(ch.slug) || null;
              return (
                <tr key={ch.index + '-' + ch.slug} className="static" id={'admCourseCh-' + ch.slug}>
                  <td className="adm-num adm-dim">{String(ch.index + 1).padStart(2, '0')}</td>
                  <td className="adm-wrap">
                    <div className="adm-strong">{ch.title}</div>
                    <div className="adm-dim">
                      <code>{ch.slug}</code>
                      {row && row.slug !== ch.slug && <> | old database slug <code>{row.slug}</code>, renamed by the pending database update</>}
                      {row?.title && row.title !== ch.title && <> | database title: {row.title}</>}
                    </div>
                  </td>
                  <td>{row ? <span className="adm-pill">yes</span> : <span className="adm-dim">no</span>}</td>
                  <td>
                    <OnOff value={on(row?.enabled)} onChange={(v) => onToggle(sc, ch, row, v)} disabled={!!busy['ch-' + sc.key + '/' + ch.slug]} id={'admCourseChOn-' + ch.slug}
                      label={`${ch.title} visible on the site`} onText="Visible" offText="Hidden" />
                  </td>
                  <td>{row && <button className="adm-btn ghost" onClick={() => onEdit(row)} id={'admCourseChEdit-' + ch.slug}>Edit</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {dbOnly.length > 0 && (
        <section>
          <h4 className="adm-h4">Only in the database (not shown on the site)</h4>
          <p className="adm-help">These rows have no chapter in the code (different slug), so the site never shows them and their switch changes nothing there.</p>
          <ul className="adm-list" id="admCourseDbOnly">
            {dbOnly.map((r) => (
              <li key={r.id}>
                <span className="adm-list-main">{r.title || r.slug} <span className="adm-dim"><code>{r.slug}</code></span></span>
                <OnOff value={on(r.enabled)} onChange={(v) => onToggleRow(r, v)} disabled={!!busy['row-' + r.id]} id={'admCourseDbOn-' + r.slug}
                  label={`${r.title || r.slug} switched on`} onText="On" offText="Off" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CourseForm({ c, site, onClose, onSaved }: { c: CourseRow; site: SiteCourse | null; onClose: () => void; onSaved: (v: Partial<CourseRow>) => void }) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [title, setTitle] = useState(c.title || '');
  const [tag, setTag] = useState(c.tag || '');
  const [desc, setDesc] = useState(c.description || '');
  const [icon, setIcon] = useState(ICONS.some((i) => i.key === c.icon_key) ? (c.icon_key as string) : 'shield');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    // tag and description are NOT NULL in the DB: empty means ''.
    const v = { title: title.trim().slice(0, 80), tag: tag.trim().slice(0, 40), description: desc.trim().slice(0, 300), icon_key: icon };
    if (!v.title) return setErr('Title is required.');
    setBusy(true); setErr('');
    const bad = await updateRow(sb, 'courses', c.id, { ...v, updated_at: new Date().toISOString() });
    setBusy(false);
    if (bad) { setErr('Could not save: ' + bad); toast('Could not save: ' + bad, 'error'); return; }
    logAdminEvent('admin_course_updated', `"${v.title}" (${c.course_key}): card text/icon edited`);
    toast('Course saved');
    onSaved(v);
  }

  return (
    <Modal title={'Edit ' + c.title} onClose={onClose}>
      <form className="adm-form" onSubmit={save}>
        <p className="adm-help">This is the course card on the course list and the home page, and the course name in search. The lessons themselves come from the code.</p>
        <label className="adm-field"><span>Title</span><input required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus id="admCourseTitle" /></label>
        <label className="adm-field"><span>Tag (small label above the title)</span><input maxLength={40} value={tag} onChange={(e) => setTag(e.target.value)} id="admCourseTag" /></label>
        <label className="adm-field"><span>Description (shown on the card)</span><textarea maxLength={300} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} id="admCourseDesc" /></label>
        <div className="adm-field">
          <span>Icon</span>
          <div className="adm-crs-icons" role="group" aria-label="Icon">
            {ICONS.map((i) => (
              <button key={i.key} type="button" aria-pressed={icon === i.key} className={'adm-crs-icon-opt' + (icon === i.key ? ' on' : '')}
                onClick={() => setIcon(i.key)} id={'admCourseIcon-' + i.key}>
                <span className="adm-crs-icon" aria-hidden="true"><CourseIcon name={i.key} /></span>{i.label}
              </button>
            ))}
          </div>
        </div>
        <div className="adm-field">
          <span>Tied to the code (read only)</span>
          <div className="adm-dim adm-crs-keys">key <code>{c.course_key}</code> page <code>{c.page_key || '-'}</code> url <code>{site ? '/tutorials/' + site.slug : 'none'}</code></div>
        </div>
        {err && <p className="adm-error" id="admCourseErr">{err}</p>}
        <div className="adm-actions"><button className="adm-btn primary" disabled={busy} id="admCourseSave">{busy ? 'Saving...' : 'Save'}</button><button type="button" className="adm-btn ghost" onClick={onClose}>Cancel</button></div>
      </form>
    </Modal>
  );
}

function ChapterForm({ r, onClose, onSaved }: { r: ChapterRow; onClose: () => void; onSaved: (v: Partial<ChapterRow>) => void }) {
  const sb = adminSupabase()!;
  const toast = useToast();
  const [title, setTitle] = useState(r.title || '');
  const [desc, setDesc] = useState(r.description || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const v = { title: title.trim().slice(0, 120), description: desc.trim().slice(0, 300) };
    if (!v.title) return setErr('Title is required.');
    setBusy(true); setErr('');
    const bad = await updateRow(sb, 'content_chapters', r.id, { ...v, updated_at: new Date().toISOString() });
    setBusy(false);
    if (bad) { setErr('Could not save: ' + bad); toast('Could not save: ' + bad, 'error'); return; }
    logAdminEvent('admin_chapter_updated', `"${v.title}" (${r.course}/${r.slug}): title/description edited`);
    toast('Chapter saved');
    onSaved(v);
  }

  return (
    <Modal title="Edit chapter" onClose={onClose}>
      <form className="adm-form" onSubmit={save}>
        <p className="adm-help">The course page shows the title and order from the code files. The title and description here only add words to the site search.</p>
        <label className="adm-field"><span>Title</span><input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus id="admCourseChTitle" /></label>
        <label className="adm-field"><span>Description</span><textarea maxLength={300} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} id="admCourseChDesc" /></label>
        <div className="adm-dim">slug <code>{r.slug}</code></div>
        {err && <p className="adm-error" id="admCourseChErr">{err}</p>}
        <div className="adm-actions"><button className="adm-btn primary" disabled={busy} id="admCourseChSave">{busy ? 'Saving...' : 'Save'}</button><button type="button" className="adm-btn ghost" onClick={onClose}>Cancel</button></div>
      </form>
    </Modal>
  );
}
