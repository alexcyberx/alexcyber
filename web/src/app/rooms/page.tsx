import type { Metadata } from 'next';
import RoomsView from '@/components/RoomsView';
import { CTF_I18N, CTF_ICONS, getRooms } from '@/lib/ctf';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CTF Challenges - AlexCyberX',
  description: 'Free hands-on Capture The Flag (CTF) challenges covering SQL injection, XSS, packet analysis, log hunting, and cryptography, by AlexCyberX.',
  alternates: { canonical: '/rooms' },
};

export default async function RoomsPage() {
  const challenges = await getRooms();
  return <RoomsView challenges={challenges} icons={CTF_ICONS} i18n={CTF_I18N} />;
}
