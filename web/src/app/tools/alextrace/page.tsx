import LegacyToolPage, { legacyToolMetadata } from '@/components/LegacyToolPage';

export const metadata = legacyToolMetadata('alextrace');

export default function Page() {
  return <LegacyToolPage tool="alextrace" />;
}
