import type { Metadata } from 'next';
import CourseIcon from '@/components/CourseIcon';
import { getCoursesWithCounts } from '@/lib/courses';
import { pathForPage } from '@/lib/routes';

// Courses change from the admin panel; rebuild at most every 5 minutes.
export const revalidate = 300;

const TITLE = 'All Courses - AlexCyberX';
const DESC = 'Browse all free cybersecurity courses on AlexCyberX: Network Forensics and Cyber Attacks Fundamentals, taught in Hindi with hands-on labs.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/tutorials' },
  openGraph: { url: '/tutorials', title: TITLE, description: DESC },
};

export default async function CoursesPage() {
  const data = await getCoursesWithCounts();

  return (
    <div id="coursesPage" className="page active">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 16px 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#dc1414', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 10, padding: '3px 14px', border: '1px solid #dc141433', borderRadius: 20, background: '#dc14140a', display: 'inline-block' }} data-i18n="allcourses.label" suppressHydrationWarning>COURSES</div>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 'clamp(24px,6vw,32px)', fontWeight: 700, color: '#f4f4f5', marginBottom: 10 }} data-i18n="allcourses.heading" suppressHydrationWarning>All Courses</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#666', lineHeight: 1.7 }} data-i18n="allcourses.desc" suppressHydrationWarning>Saare courses ek jagah. Jitna time milta hai utna naye courses add karte rehte hain, yahan hamesha latest list milegi.</p>
        </div>

        <div className="cards-grid" id="allCoursesGrid">
          {!data || data.courses.length === 0 ? (
            <div className="empty" style={{ color: '#666', fontSize: 13, padding: '20px 0' }}>Courses could not be loaded right now.</div>
          ) : (
            data.courses.map((c) => {
              const n = data.counts[c.course_key] || 0;
              // Course pages are still in the SPA; it asks for login there if needed.
              return (
                <a key={c.course_key} className="tut-card" href={pathForPage(c.page_key, '/tutorials')}>
                  <div className="card-icon-wrap"><CourseIcon name={c.icon_key} /></div>
                  <div className="card-tag">{c.tag}</div>
                  <div className="card-title">{c.title}</div>
                  <p className="card-desc">{c.description}</p>
                  <div className="card-footer">
                    <span className="card-chapters">{n === 1 ? '1 Chapter' : `${n} Chapters`}</span>
                    <div className="card-arrow">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" stroke="#dc1414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
