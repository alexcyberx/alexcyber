import type { Metadata } from 'next';
import ProfileView from '@/components/ProfileView';

export const metadata: Metadata = {
  title: 'My Profile on AlexCyberX',
  description: 'View your AlexCyberX profile, course progress, and CTF solves.',
  robots: { index: false },
};

export default function ProfilePage() {
  return <ProfileView />;
}
