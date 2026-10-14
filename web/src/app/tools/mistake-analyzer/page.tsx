import type { Metadata } from 'next';
import MistakeAnalyzerView from '@/components/MistakeAnalyzerView';

const TITLE = 'Cyber Mistake Analyzer - AlexCyberX';
const DESC = 'Paste a command like nmap -A target.com and get instant feedback on what is right, what is wrong, and a corrected version. Free learning tool by AlexCyberX.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: '/tools/mistake-analyzer' },
  openGraph: { url: '/tools/mistake-analyzer', title: TITLE, description: DESC },
};

export default function MistakeAnalyzerPage() {
  return <MistakeAnalyzerView />;
}
