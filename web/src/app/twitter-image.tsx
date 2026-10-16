import { ImageResponse } from 'next/og';

// Default X (Twitter) card image (1200x630) for every page without its own:
// WhatsApp, X, LinkedIn, Google Discover and AI answer cards show it.
export const alt = 'AlexCyberX: free cybersecurity courses, CTF labs and tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '72px 84px', background: 'linear-gradient(135deg,#0b0d0d 0%,#0f1f1a 60%,#0b0d0d 100%)', color: '#f2f5f4', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 34 }}>
          <svg width="74" height="74" viewBox="0 0 32 32"><path d="M6 6 L26 26 M26 6 L6 26" stroke="#10b981" strokeWidth="5" strokeLinecap="round" /></svg>
          <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, letterSpacing: -1 }}>Alex<span style={{ color: '#10b981' }}>CyberX</span></div>
        </div>
        <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.2, maxWidth: 980 }}>Learn cybersecurity free: courses in Hinglish, hands-on CTF labs and security tools</div>
        <div style={{ marginTop: 30, fontSize: 26, color: '#8f9894' }}>Ethical Hacking · Network Forensics · Cyber Attacks · CTF · OSINT</div>
      </div>
    ),
    size,
  );
}
