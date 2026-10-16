import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import CourseIcon from '@/components/CourseIcon';
import HeroTerminal from '@/components/HeroTerminal';
import Reveal from '@/components/Reveal';
import { getCoursesWithCounts } from '@/lib/courses';
import { getRooms } from '@/lib/ctf';
import { homeJsonLd, homeSections } from '@/lib/home';
import { pathForPage } from '@/lib/routes';
import { TOOLS } from '@/lib/tools';
import { OG_IMAGE } from '@/lib/seo';

export const revalidate = 300;

const TITLE = 'AlexCyberX: Free Cybersecurity Education for Everyone';
const DESC = 'AlexCyberX is a free cybersecurity education platform by Pavan Kumar, a Certified Ethical Hacker from Rajasthan, India. Learn Ethical Hacking, Network Forensics, and Cyber Attack techniques in Hindi with hands-on CTF labs.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['Pavan Kumar', 'AlexCyberX', 'cybersecurity hindi', 'network forensics', 'ethical hacking', 'CTF', 'SQL injection', 'XSS', 'free cybersecurity course india'],
  authors: [{ name: 'Pavan Kumar (AlexCyberX)' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  openGraph: { images: [OG_IMAGE], type: 'website', url: '/', title: 'AlexCyberX - Free Cybersecurity Education in Hindi', description: 'Learn Ethical Hacking, Network Forensics, SQL Injection, XSS, MITM attacks and more. Free courses and hands-on CTF labs by Pavan Kumar from Rajasthan, India.', siteName: 'AlexCyberX', locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title: 'AlexCyberX - Free Cybersecurity Education in Hindi', description: 'Ethical Hacking, Network Forensics, CTF labs - free cybersecurity education platform by Pavan Kumar (AlexCyberX) from Rajasthan, India.' },
};

const html = (s: string) => ({ __html: s });

export default async function HomePage() {
  const s = homeSections();
  const [courses, rooms] = await Promise.all([getCoursesWithCounts(), getRooms().catch(() => [])]);
  const homeCourses = courses?.courses.filter((c) => c.show_on_home) ?? [];

  return (
    <div id="homePage" className="page active">
      {homeJsonLd().map((json, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={html(json)} />
      ))}

      <section className="hero" id="home">
        <div className="hero-inner">
          <div className="hero-left" dangerouslySetInnerHTML={html(s.heroLeft)} suppressHydrationWarning />
          <div className="hero-right">
            <HeroTerminal
              demoHtml={s.terminalDemo}
              rooms={rooms.map((r) => ({ title: r.title, href: '/rooms?open=' + encodeURIComponent(r.id), note: `${r.diff} · ${r.cat}` }))}
              tools={TOOLS.map((t) => ({ title: t.title, href: t.href, note: t.tag }))}
              courses={(courses?.courses || []).map((c) => ({ title: c.title, href: pathForPage(c.page_key, '/tutorials') }))}
            />
          </div>
        </div>
      </section>


      <section className="section" id="tutorials">
        <div className="section-label" data-i18n="courses.label" data-reveal suppressHydrationWarning>Courses</div>
        <h2 className="section-heading" data-i18n="courses.heading" data-reveal suppressHydrationWarning>Choose Your Path</h2>
        <div className="cards-grid" id="homeCoursesGrid" data-reveal>
          {homeCourses.length === 0 ? (
            <div className="empty" style={{ color: 'var(--fg-4)', fontSize: 13, padding: '20px 0' }}>Courses could not be loaded right now.</div>
          ) : homeCourses.map((c) => {
            const n = courses!.counts[c.course_key] || 0;
            return (
              <a key={c.course_key} className="tut-card" href={pathForPage(c.page_key, '/tutorials')}>
                <div className="card-icon-wrap"><CourseIcon name={c.icon_key} /></div>
                <div className="card-tag">{c.tag}</div>
                <div className="card-title">{c.title}</div>
                <p className="card-desc">{c.description}</p>
                <div className="card-footer">
                  <span className="card-chapters">{n === 1 ? '1 Chapter' : `${n} Chapters`}</span>
                  <div className="card-arrow">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 3l3 3-3 3" style={{ stroke: 'var(--accent)' }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a className="btn-secondary" href="/tutorials" data-i18n="courses.viewAll" suppressHydrationWarning>View All Courses</a>
        </div>
      </section>

      <div dangerouslySetInnerHTML={html(s.about)} suppressHydrationWarning style={{ display: 'contents' }} />

      <section className="section contact-wrap" id="contact">
        <div className="contact-grid">
          <div dangerouslySetInnerHTML={html(s.contactLeft)} suppressHydrationWarning style={{ display: 'contents' }} />
          <ContactForm />
        </div>
      </section>

      <div dangerouslySetInnerHTML={html(s.footer)} suppressHydrationWarning style={{ display: 'contents' }} />
      <Reveal />
    </div>
  );
}
