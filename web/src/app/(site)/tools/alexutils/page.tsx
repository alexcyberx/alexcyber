import LegacyToolPage, { legacyToolMetadata } from '@/components/LegacyToolPage';

export const metadata = legacyToolMetadata('alexutils');

export default function Page() {
  return <LegacyToolPage tool="alexutils" />;
}
