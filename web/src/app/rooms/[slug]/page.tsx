import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CTF_ICONS, getRooms, type Challenge } from '@/lib/ctf';
import { abs, breadcrumb, ld, OG_IMAGE, ORG, ORG_ID, PERSON_ID, plain } from '@/lib/seo';

// One public page per CTF room (/rooms/<slug>), so every challenge can be found
// in search and quoted by AI answer engines. Playing still happens on /rooms
// (the "Start" button opens the room there); no flag or answer is on this page.

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

async function room(slug: string): Promise<Challenge | null> {
  const rooms = await getRooms().catch(() => [] as Challenge[]);
  return rooms.find((r) => r.id === slug) || null;
}

export async function generateStaticParams() {
  const rooms = await getRooms().catch(() => [] as Challenge[]);
  return rooms.map((r) => ({ slug: r.id }));
}

const LEVEL: Record<string, string> = { Easy: 'Beginner', Medium: 'Intermediate', Hard: 'Advanced' };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await room((await params).slug);
  if (!r) return { title: 'CTF room not found - AlexCyberX', robots: { index: false } };
  const title = `${r.title}: Free ${r.cat} CTF Challenge (${r.diff}) - AlexCyberX`;
  const description = `${r.desc} Free hands-on ${r.cat.toLowerCase()} lab, ${r.diff.toLowerCase()} level, ${r.xp} XP.`.slice(0, 300);
  const url = `/rooms/${r.id}`;
  return { title, description, alternates: { canonical: url }, openGraph: { images: [OG_IMAGE], url, title, description, type: 'article' } };
}

export default async function RoomPage({ params }: Params) {
  const r = await room((await params).slug);
  if (!r) notFound();
  const url = `/rooms/${r.id}`;
  const scenarioText = plain(r.scenario, 1000);
  const json = ld([
    ORG,
    {
      '@type': 'LearningResource',
      '@id': abs(url) + '#room',
      name: r.title,
      description: r.desc,
      url: abs(url),
      learningResourceType: 'Capture The Flag challenge',
      educationalUse: 'hands-on practice',
      educationalLevel: LEVEL[r.diff] || r.diff,
      teaches: [r.cat, ...r.tags].join(', '),
      keywords: ['CTF', r.cat, ...r.tags].join(', '),
      inLanguage: 'en',
      isAccessibleForFree: true,
      interactivityType: 'active',
      provider: { '@id': ORG_ID },
      author: { '@id': PERSON_ID },
    },
    breadcrumb([{ name: 'Home', path: '/' }, { name: 'CTF Challenges', path: '/rooms' }, { name: r.title, path: url }]),
  ]);

  return (
    <div className="page active">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <article style={{ maxWidth: 820, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 24px 80px' }}>
        <div role="navigation" aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--fg-4)', marginBottom: 18 }}>
          <a href="/rooms" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>CTF Challenges</a> <span aria-hidden="true">›</span> <span>{r.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <span className={`ctf-card-icon ${r.iconClass}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: CTF_ICONS[r.cat] || '' }} />
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>{r.cat} · {r.diff} · {r.xp} XP</div>
        </div>
        <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 34, fontWeight: 700, color: 'var(--fg-1)', margin: '0 0 12px' }}>{r.title}</h1>
        <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.75, margin: '0 0 22px' }}>{r.desc}</p>
        <a className="nav-btn fill" href={`/rooms?open=${encodeURIComponent(r.id)}`} style={{ display: 'inline-flex', textDecoration: 'none' }}>Start this room</a>
        <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--fg-4)' }}>Free · {r.solvers} solved{r.author ? ` · by ${r.author}` : ''}</span>

        {scenarioText && (
          <section style={{ marginTop: 34 }}>
            <h2 style={{ fontSize: 20, color: 'var(--fg-1)', margin: '0 0 10px' }}>Scenario</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.8 }}>{scenarioText}</p>
          </section>
        )}

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20, color: 'var(--fg-1)', margin: '0 0 10px' }}>What you will practise</h2>
          <ul style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.9, paddingLeft: 20 }}>
            <li>{r.cat} skills at {r.diff.toLowerCase()} level{r.tags.length ? `: ${r.tags.join(', ')}` : ''}.</li>
            <li>Working in a safe, legal lab built for this challenge{r.labUrl || r.labApiPath ? ' (a private 30-minute lab instance)' : ''}.</li>
            <li>Finding the flag (format <code>ACX{'{...}'}</code>) and submitting it to earn {r.xp} XP on the leaderboard.</li>
          </ul>
        </section>

        {r.hints.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 20, color: 'var(--fg-1)', margin: '0 0 10px' }}>Hints</h2>
            {r.hints.map((h, i) => (
              <details key={i} style={{ marginBottom: 8, border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', background: 'var(--surface)' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--fg-2)', fontSize: 13 }}>Hint {i + 1}</summary>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.7 }}>{h}</p>
              </details>
            ))}
          </section>
        )}

        <p style={{ marginTop: 34, fontSize: 13, color: 'var(--fg-4)' }}>
          New to CTFs? Learn the basics in the free <a href="/tutorials" style={{ color: 'var(--accent)' }}>AlexCyberX courses</a>, then come back and try this room.
        </p>
      </article>
    </div>
  );
}
