/* ═══════════════════════════════════════════
   TRUST MARQUEE, AlexCyberX
   Courses (Supabase), CTF challenges (CTF_CHALLENGES),
   aur Tools (static list) ko combine karke ek scrolling
   marquee banata hai. Sabse recent item par "NEW" badge
   dikhta hai.
═══════════════════════════════════════════ */

// Tools abhi tak Supabase mein nahi hain, isliye static list.
// Naya tool add karte waqt yahan ek line add karo, addedAt aaj ki date ke saath.
const MARQUEE_TOOLS = [
  { title: 'AlexSync',              addedAt: '2026-09-16', page: null, onclick: "handleAlexSyncClick()" },
  { title: 'Cyber Mistake Analyzer', addedAt: '2026-09-16', page: 'mistakeAnalyzer' },
  { title: 'AlexRecon',             addedAt: '2026-09-16', page: 'alexrecon' },
  { title: 'AlexUtils',             addedAt: '2026-09-16', page: 'alexutils' },
  { title: 'AlexTrace',             addedAt: '2026-09-16', page: 'alextrace' }
];

const MARQUEE_ICONS = {
  course: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  ctf: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 13.5L11.2 16.7L18 9.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/></svg>',
  tool: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="1.6"/></svg>'
};

function marqueeEscapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

async function buildMarqueeItems() {
  const items = [];

  // Courses (Supabase)
  try {
    const sb = window._supabase;
    if (sb) {
      const { data: courses, error } = await sb
        .from('courses')
        .select('title, created_at, enabled')
        .eq('enabled', true);
      if (!error && courses) {
        courses.forEach(c => {
          if (c.title) items.push({ type: 'course', title: c.title, addedAt: c.created_at || null, href: '#courses' });
        });
      }
    }
  } catch (e) { /* Supabase unavailable, courses skipped, marquee still works with CTF + tools */ }

  // CTF challenges (global array set in index.html)
  const ctfList = window.CTF_CHALLENGES || [];
  ctfList.forEach(c => {
    items.push({ type: 'ctf', title: c.title, addedAt: c.addedAt || null, href: '/pages/ctf.html' });
  });

  // Tools (static list above)
  MARQUEE_TOOLS.forEach(t => {
    items.push({ type: 'tool', title: t.title, addedAt: t.addedAt || null, page: t.page, onclick: t.onclick });
  });

  return items;
}

function renderMarquee(items) {
  const track = document.getElementById('trustTrack');
  if (!track) return;
  if (!items.length) return; // keep whatever fallback markup is already in the DOM

  // Sabse recent addedAt wala item dhundo, usi ko NEW badge milega
  let newestIdx = -1, newestTime = -Infinity;
  items.forEach((it, i) => {
    if (!it.addedAt) return;
    const t = new Date(it.addedAt).getTime();
    if (!isNaN(t) && t > newestTime) { newestTime = t; newestIdx = i; }
  });

  const buildItemHtml = (it, i) => {
    const icon = MARQUEE_ICONS[it.type] || MARQUEE_ICONS.tool;
    const isNew = i === newestIdx;
    const badge = isNew ? '<span class="trust-new">NEW</span>' : '';
    const label = marqueeEscapeHtml(it.title);
    const attrs = it.onclick
      ? `onclick="${it.onclick}"`
      : it.page
        ? `onclick="showPage('${it.page}')"`
        : it.href
          ? `onclick="window.location.href='${it.href}'"`
          : '';
    return `<div class="trust-item"${attrs ? ' ' + attrs : ''} role="button" tabindex="0">${icon}${label}${badge}</div>`;
  };

  const itemsHtml = items.map(buildItemHtml).join('');
  // List ko duplicate karke seamless infinite-scroll loop banaya jaata hai (CSS translateX(-50%) is par depend karta hai)
  track.innerHTML = itemsHtml + itemsHtml;

  // Scroll speed ko items count se independent, constant rakhne ke liye duration
  // dynamically calculate karo (fixed 28s tha, jo zyada items aane par scroll fast kar deta tha)
  const SECONDS_PER_ITEM = 3.2;
  const duration = Math.max(18, items.length * SECONDS_PER_ITEM);
  track.style.animationDuration = duration + 's';
}

async function initMarquee() {
  const items = await buildMarqueeItems();
  renderMarquee(items);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMarquee);
} else {
  initMarquee();
}
