import type { Metadata } from 'next';
import LegacyTool from '@/components/LegacyTool';
import { LEGACY_TOOLS, legacyToolMarkup, type LegacyToolKey } from '@/lib/legacy-tools';

// Server part of /tools/alexrecon|alexutils|alextrace (see LegacyTool.tsx).

export function legacyToolMetadata(key: LegacyToolKey): Metadata {
  const t = LEGACY_TOOLS[key];
  return {
    title: t.title,
    description: t.desc,
    alternates: { canonical: t.path },
    openGraph: { url: t.path, title: t.title, description: t.desc },
  };
}

export default function LegacyToolPage({ tool }: { tool: LegacyToolKey }) {
  const t = LEGACY_TOOLS[tool];
  return (
    <>
      {/* The tool's own stylesheet (served by Express from /css), only on its page. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href={`/css/${tool}.css`} precedence="default" />
      <LegacyTool tool={tool} pageId={t.pageId} path={t.path} html={legacyToolMarkup(tool)} />
    </>
  );
}
