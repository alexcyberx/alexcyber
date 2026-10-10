import { readFileSync } from 'node:fs';
import path from 'node:path';

// Runs the old site's language system (js/i18n.js + the language modal from
// components/lang-modal.html) on the Next pages too, so a language picked on
// either app applies on both (same localStorage key). Elements that i18n.js
// translates carry data-i18n and suppressHydrationWarning.
const MODAL_HTML = readFileSync(path.join(process.cwd(), '..', 'components', 'lang-modal.html'), 'utf8');

// i18n.js reads these SPA globals by bare name; on Next pages they are inert.
const GLOBALS = 'var currentPage="next",currentChapter=0,currentCyberChapter=0,currentEthicalChapter=0,chapterCache={};';

export default function LegacyI18n() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: MODAL_HTML }} />
      <script dangerouslySetInnerHTML={{ __html: GLOBALS }} />
      <script src="/js/i18n.js" defer />
    </>
  );
}
