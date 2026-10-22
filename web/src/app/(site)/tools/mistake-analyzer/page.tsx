import type { Metadata } from 'next';
import MistakeAnalyzerView from '@/components/MistakeAnalyzerView';
import { TOOLS } from '@/lib/tools';
import { OG_IMAGE, toolLd } from '@/lib/seo';

const TITLE = 'Cyber Mistake Analyzer - AlexCyberX';
const DESC = 'Paste a command like nmap -A scanme.nmap.org and get instant feedback on what is right, what is wrong, and a corrected version. Free learning tool by AlexCyberX.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/tools/mistake-analyzer' },
  openGraph: { images: [OG_IMAGE], url: '/tools/mistake-analyzer', title: TITLE, description: DESC },
};

export default function MistakeAnalyzerPage() {
  const card = TOOLS.find((t) => t.href === '/tools/mistake-analyzer');
  return (
    <>
      {card && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toolLd(card) }} />}
      <MistakeAnalyzerView />
    </>
  );
}
