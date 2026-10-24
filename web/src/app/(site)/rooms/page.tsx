import type { Metadata } from 'next';
import RoomsView from '@/components/RoomsView';
import { CTF_I18N, CTF_ICONS, getRooms, publicI18n, publicRooms } from '@/lib/ctf';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CTF Challenges - AlexCyberX',
  description: 'Free hands-on Capture The Flag (CTF) challenges with live labs: SQL injection, cookies, recon, packet analysis, metadata, cryptography and more. Free account required to play.',
  alternates: { canonical: '/rooms' },
};

// The labs server (docs/LABS.md, env LAB_ORIGIN on the main service); '' = labs on this site.
function labOrigin(): string {
  const v = (process.env.LAB_ORIGIN || '').trim();
  if (!v) return '';
  try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin : ''; } catch { return ''; }
}

export default async function RoomsPage() {
  // Scenario + hints load after login (/rooms/details), not in this HTML.
  const challenges = publicRooms(await getRooms());
  return <RoomsView challenges={challenges} icons={CTF_ICONS} i18n={publicI18n(CTF_I18N)} labOrigin={labOrigin()} />;
}
