import type { Metadata } from 'next';
import { displayName, getPublicProfile, levelFromXp } from '@/lib/players';

export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

// Rendered on first visit, then cached (ISR) like the other pages.
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = await getPublicProfile((await params).id);
  if (!u) return { title: 'User Profile - AlexCyberX', robots: { index: false } };
  const name = displayName(u);
  return {
    title: `${name} - AlexCyberX`,
    description: `${name} on AlexCyberX: level ${levelFromXp(u.xp)}, ${u.xp} XP, ${u.ctf_solves} CTF solves.`,
    alternates: { canonical: `/u/${u.id}` },
    // Student profiles stay out of search results (privacy); links still followed.
    robots: { index: false, follow: true },
  };
}

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 11, padding: 14, textAlign: 'center' as const };
const num = (color: string) => ({ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 700, color });

export default async function PublicProfilePage({ params }: Props) {
  const u = await getPublicProfile((await params).id);
  const name = u ? displayName(u) : '-';
  return (
    <div id="publicProfilePage" className="page active">
      <div className="pf-shell" style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px', paddingTop: 'calc(var(--nav-h) + 16px)' }}>
        <div className="pf-banner">
          <div className="pf-banner-glow"></div>
          <a className="pf-back-btn" href="/leaderboard" style={{ textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back
          </a>
          <div className="pf-identity">
            <div className="pf-avatar" id="ppAvatar">{u ? (name[0] || '?').toUpperCase() : 'A'}</div>
            <div className="pf-identity-text">
              <div className="pf-display-name" id="ppDisplayName">{name}</div>
              <div className="pf-display-meta"><span className="pf-username-tag" id="ppUsernameTag">{u?.username ? '@' + u.username : ''}</span></div>
              <div className="pf-bio-display" id="ppBioDisplay">{u?.bio || ''}</div>
            </div>
          </div>
        </div>

        {!u ? (
          <div id="ppNotFound" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)', fontSize: 13 }}>User not found.</div>
        ) : (
          <div id="ppContent">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 20 }}>
              <div style={card}><div id="ppXP" style={num('#818cf8')}>{u.xp.toLocaleString('en-US')}</div><div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Total XP</div></div>
              <div style={card}><div id="ppLevel" style={num('#4ade80')}>{levelFromXp(u.xp)}</div><div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Level</div></div>
              <div style={card}><div id="ppCTFSolves" style={num('var(--accent)')}>{u.ctf_solves}</div><div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>CTF Solves</div></div>
            </div>
            <div style={{ marginTop: 24 }}>
              <div className="pf-section-label">Rank</div>
              <div id="ppRankRow" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 11, padding: '14px 16px', fontSize: 13, color: 'var(--text-dim)', marginTop: 10 }}>
                {u.staff ? 'AlexCyberX team account, not on the leaderboard' : u.rank ? `#${u.rank} on the leaderboard` : 'Rank unavailable'}
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <div className="pf-section-label">CTF History</div>
              <div id="ppCTFList" className="pf-lb-list" style={{ marginTop: 10 }}>
                {u.solves.length === 0 ? <div className="pf-empty">No CTF solves yet.</div> : u.solves.map((s, i) => (
                  <div key={i} className="pf-lb-row">
                    <div className="pf-lb-info">
                      <div className="pf-lb-name">{s.title}</div>
                      <div className="pf-lb-sub">{s.category || '-'} · {s.solved_at ? new Date(s.solved_at).toLocaleDateString('en-IN') : '-'}</div>
                    </div>
                    <div className="pf-lb-xp">+{s.points}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
