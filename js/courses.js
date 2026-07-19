/* ═══════════════════════════════════════════════════════════════
   js/courses.js, Course cards ab Supabase 'courses' table se
   dynamically render hote hain (home page + /tutorials All Courses
   page dono). Naya course admin panel se add karne pe yahan bhi
   automatically dikhega, koi HTML edit karne ki zaroorat nahi.

   Chapter count bhi live 'content_chapters' table se count hota
   hai, isliye kabhi galat/purana number nahi dikhega.
═══════════════════════════════════════════════════════════════ */

// Course card icons, course row ke icon_key se match hote hain.
// Naya icon chahiye ho to bas yahan ek naya key add karo.
const COURSE_ICONS = {
  radar: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="#dc1414" stroke-width="1.2"/>
    <circle cx="10" cy="10" r="3" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
    <line x1="4" y1="10" x2="7" y2="10" stroke="#dc1414" stroke-width="1"/>
    <line x1="13" y1="10" x2="16" y2="10" stroke="#dc1414" stroke-width="1"/>
    <line x1="10" y1="4" x2="10" y2="7" stroke="#dc1414" stroke-width="1"/>
    <line x1="10" y1="13" x2="10" y2="16" stroke="#dc1414" stroke-width="1"/>
    <line x1="12.5" y1="12.5" x2="15" y2="15" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M10 2.5l6.5 3v4.3c0 4-2.7 7.4-6.5 8.7-3.8-1.3-6.5-4.7-6.5-8.7V5.5l6.5-3Z" stroke="#dc1414" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M7.2 10l1.9 1.9 3.7-3.9" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  lock: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="#dc1414" stroke-width="1.2"/>
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="#dc1414" stroke-width="1.2"/>
    <circle cx="10" cy="13" r="1.2" fill="#dc1414"/>
  </svg>`,
  bug: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <ellipse cx="10" cy="11" rx="4.5" ry="5.5" stroke="#dc1414" stroke-width="1.2"/>
    <path d="M10 5.5V3.5M6.5 6.5L4.5 4.5M13.5 6.5L15.5 4.5M4 11H2M18 11H16M4.5 15.5L2.5 17.5M15.5 15.5L17.5 17.5" stroke="#dc1414" stroke-width="1.1" stroke-linecap="round"/>
  </svg>`,
  code: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M7 6L2.5 10L7 14M13 6L17.5 10L13 14" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

let _coursesCache = null;
let _chapterCountsCache = null;

// Fetch every enabled course, plus a live chapter count per course_key.
// Cached in-memory for the session, homePage/coursesPage dono isi cache
// ko reuse karte hain taaki baar-baar DB hit na ho.
async function fetchCoursesWithCounts() {
  if (_coursesCache && _chapterCountsCache) {
    return { courses: _coursesCache, counts: _chapterCountsCache };
  }

  const sb = window._supabase;
  if (!sb) return { courses: [], counts: {} };

  try {
    const { data: courses, error: coursesErr } = await sb
      .from('courses')
      .select('*')
      .eq('enabled', true)
      .order('display_order', { ascending: true });
    if (coursesErr) throw coursesErr;

    const { data: chapters, error: chErr } = await sb
      .from('content_chapters')
      .select('course')
      .eq('enabled', true);
    if (chErr) throw chErr;

    const counts = {};
    (chapters || []).forEach(ch => {
      counts[ch.course] = (counts[ch.course] || 0) + 1;
    });

    _coursesCache = courses || [];
    _chapterCountsCache = counts;
    return { courses: _coursesCache, counts: _chapterCountsCache };
  } catch (e) {
    console.error('[Courses] Fetch error:', e);
    return { courses: [], counts: {} };
  }
}

// Force a fresh fetch next time (call this after admin adds/edits/removes
// a course or chapter, so the cards update without a full page reload).
function invalidateCoursesCache() {
  _coursesCache = null;
  _chapterCountsCache = null;
  // Nav search (js/search.js) caches its own copy of course entries built
  // from this same data, refresh it too so a course added just now shows
  // up in search immediately, without a page reload.
  if (typeof window.refreshSearchData === 'function') window.refreshSearchData();
}
window.invalidateCoursesCache = invalidateCoursesCache;

function escHtmlCourse(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function buildCourseCardHTML(course, chapterCount) {
  const icon = COURSE_ICONS[course.icon_key] || COURSE_ICONS.shield;
  const chapterLabel = chapterCount === 1 ? '1 Chapter' : `${chapterCount} Chapters`;
  return `
    <div class="tut-card" onclick="handleCourseClickFor('${course.page_key}')" role="button" tabindex="0"
         onkeypress="if(event.key==='Enter')handleCourseClickFor('${course.page_key}')" data-reveal>
      <div class="card-icon-wrap">${icon}</div>
      <div class="card-tag">${escHtmlCourse(course.tag)}</div>
      <div class="card-title">${escHtmlCourse(course.title)}</div>
      <p class="card-desc">${escHtmlCourse(course.description)}</p>
      <div class="card-footer">
        <span class="card-chapters">${chapterLabel}</span>
        <div class="card-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6.5 3l3 3-3 3" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>`;
}

// Renders into any container id that should show the full course list
// (home page's "Choose Your Path" grid, and the /tutorials All Courses grid).
// opts.onlyHome: only render courses flagged show_on_home = true (used for
// the home page grid, where admin picks exactly which courses appear).
async function renderCourseCardsInto(containerId, options) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const opts = options || {};
  const limit = opts.limit || null;

  const { courses, counts } = await fetchCoursesWithCounts();

  if (!courses.length) {
    el.innerHTML = '<div class="empty" style="color:#666;font-size:13px;padding:20px 0;">Courses could not be loaded right now.</div>';
    return;
  }

  let list = opts.onlyHome ? courses.filter(c => c.show_on_home) : courses;
  if (limit) list = list.slice(0, limit);
  el.innerHTML = list.map(c => buildCourseCardHTML(c, counts[c.course_key] || 0)).join('');
}

// Also keeps the "Courses" stat number on the home page accurate
// (was previously just counting hardcoded .tut-card elements in the DOM).
async function updateCourseCountStat() {
  const el = document.getElementById('statCourseCount');
  if (!el) return;
  const { courses } = await fetchCoursesWithCounts();
  if (courses.length) el.textContent = String(courses.length);
}

function initHomeCourseCards() {
  renderCourseCardsInto('homeCoursesGrid', { onlyHome: true });
  updateCourseCountStat();
}

function initAllCoursesPage() {
  renderCourseCardsInto('allCoursesGrid');
}

document.addEventListener('DOMContentLoaded', function () {
  // Home page cards render immediately (home is the default active page).
  initHomeCourseCards();
});
