import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import ToolsHub from '@/components/ToolsHub';
import { serverSupabase } from '@/lib/supabase';
import { readDisabledTools } from '@/lib/tools';

// Admin on/off switches (tool_settings) are read again in the browser too.
export const revalidate = 60;

const TITLE = 'Cybersecurity Tools - AlexCyberX';
const DESC = 'Free cybersecurity tools by AlexCyberX: AlexRecon (attack-surface recon), AlexUtils (IP/DNS/SSL/CVE utilities), AlexTrace (OSINT digital footprint audit), and Cyber Mistake Analyzer.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/tools' },
  openGraph: { url: '/tools', title: TITLE, description: DESC },
};

export default async function ToolsPage() {
  const disabled = (await readDisabledTools(serverSupabase())) || {};

  return (
    <div id="toolsPage" className="page active">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'calc(var(--nav-h) + 32px) 16px 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--accent)', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 10, padding: '3px 14px', border: '1px solid var(--glow-border)', borderRadius: 20, background: 'var(--red-dim)', display: 'inline-block' }}>TOOLS</div>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 'clamp(24px,6vw,32px)', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 10 }}>Cybersecurity Tools</h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'var(--fg-4)', lineHeight: 1.7 }}>Tools that make your workflow easier. More coming soon.</p>
        </div>
        <ToolsHub initial={disabled} />
      </div>
      <Reveal />
    </div>
  );
}
