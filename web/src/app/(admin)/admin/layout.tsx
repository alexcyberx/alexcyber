import type { Metadata, Viewport } from 'next';

// Admin panel: its own root layout (no site nav, cookie banner or page-view
// tracking). Data access is protected by RLS + two-step login (aal2), not by
// this page; see brain/rules/permissions.md.
export const metadata: Metadata = {
  title: 'Admin - AlexCyberX',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#0b0d0d', colorScheme: 'dark' };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="adm-body">{children}</body>
    </html>
  );
}
