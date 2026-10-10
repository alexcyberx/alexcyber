import type { Metadata } from 'next';
import LeaderboardList from '@/components/LeaderboardList';
import { getLeaderboard } from '@/lib/players';

export const revalidate = 60;

const TITLE = 'Leaderboard - AlexCyberX';
const DESC = 'See the top ranked AlexCyberX learners by XP, level, and CTF solves.';
export const metadata: Metadata = { title: TITLE, description: DESC, alternates: { canonical: '/leaderboard' }, openGraph: { url: '/leaderboard', title: TITLE, description: DESC } };

export default async function LeaderboardPage() {
  const rows = await getLeaderboard(50);
  return (
    <div id="leaderboardPage" className="page active">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'calc(var(--nav-h) + 24px) 16px 60px' }}>
        <div className="blog-hero" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#dc1414', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 14, padding: '3px 14px', border: '1px solid #dc141433', borderRadius: 20, background: '#dc14140a', display: 'inline-block' }}>LEADERBOARD</div>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 34, fontWeight: 700, color: '#f4f4f5', marginBottom: 12 }}>Top Hackers</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#8a8a95', lineHeight: 1.7 }}>Ranked by XP earned across courses and CTF labs.</p>
        </div>
        <LeaderboardList initial={rows} />
      </div>
    </div>
  );
}
