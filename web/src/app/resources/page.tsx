import type { Metadata } from 'next';
import ResourcesView from '@/components/ResourcesView';

const TITLE = 'Resources - AlexCyberX';
const DESC = 'Curated cybersecurity learning resources from AlexCyberX.';
export const metadata: Metadata = { title: TITLE, description: DESC, alternates: { canonical: '/resources' }, openGraph: { url: '/resources', title: TITLE, description: DESC } };

// Rows are only visible to logged-in users (RLS), so the list loads in the browser.
export default function ResourcesPage() {
  return (
    <div id="resourcesPage" className="page active">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 24px 80px' }}>
        <div className="blog-hero">
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--accent)', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 14, padding: '3px 14px', border: '1px solid var(--glow-border)', borderRadius: 20, background: 'var(--red-dim)', display: 'inline-block' }}>RESOURCES</div>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 34, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 12 }}>Resource Library</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7 }}>Cheatsheets, PCAPs, scripts and wordlists to support your learning.</p>
        </div>
        <ResourcesView />
      </div>
    </div>
  );
}
