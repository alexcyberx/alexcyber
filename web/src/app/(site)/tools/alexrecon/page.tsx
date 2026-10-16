import LegacyToolPage, { legacyToolMetadata } from '@/components/LegacyToolPage';

export const metadata = legacyToolMetadata('alexrecon');

export default function Page() {
  return <LegacyToolPage tool="alexrecon" />;
}
