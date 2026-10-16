import type { Metadata } from 'next';
import LegacyTool from '@/components/LegacyTool';
import { LEGACY_TOOLS, legacyToolMarkup, type LegacyToolKey } from '@/lib/legacy-tools';
import { OG_IMAGE, toolLd } from '@/lib/seo';
import { TOOLS } from '@/lib/tools';

// Server part of /tools/alexrecon|alexutils|alextrace (see LegacyTool.tsx).

export function legacyToolMetadata(key: LegacyToolKey): Metadata {
  const t = LEGACY_TOOLS[key];
  return {
    title: t.title,
    description: t.desc,
    alternates: { canonical: t.path },
    openGraph: { images: [OG_IMAGE], url: t.path, title: t.title, description: t.desc },
  };
}

export default function LegacyToolPage({ tool }: { tool: LegacyToolKey }) {
  const t = LEGACY_TOOLS[tool];
  const card = TOOLS.find((x) => x.href === t.path);
  return (
    <>
      {card && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toolLd(card) }} />}
      {/* The tool's own stylesheet (served by Express from /css), only on its page. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href={`/css/${tool}.css`} precedence="default" />
      <LegacyTool tool={tool} pageId={t.pageId} path={t.path} html={legacyToolMarkup(tool)} />
    </>
  );
}
