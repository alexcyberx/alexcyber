import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LEGAL_PAGES, loadLegalHtml, type LegalKey } from '@/lib/legal';
import { OG_IMAGE } from '@/lib/seo';

// Only the known legal URLs exist; anything else under / is a 404 here.
export const dynamicParams = false;

const BY_SLUG = Object.fromEntries(
  Object.entries(LEGAL_PAGES).map(([key, p]) => [p.path.slice(1), key as LegalKey]),
) as Record<string, LegalKey>;

type Props = { params: Promise<{ legal: string }> };

export function generateStaticParams() {
  return Object.keys(BY_SLUG).map((legal) => ({ legal }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = BY_SLUG[(await params).legal];
  if (!key) return {};
  const p = LEGAL_PAGES[key];
  return {
    title: p.title,
    description: p.desc,
    alternates: { canonical: p.path },
    openGraph: { images: [OG_IMAGE], url: p.path, title: p.title, description: p.desc },
  };
}

export default async function LegalPage({ params }: Props) {
  const key = BY_SLUG[(await params).legal];
  if (!key) notFound();
  return (
    <div
      id={`${key}Page`}
      className="legal-page active"
      // Trusted repo file, cleaned in loadLegalHtml (no scripts / inline handlers).
      dangerouslySetInnerHTML={{ __html: loadLegalHtml(key) }}
    />
  );
}
