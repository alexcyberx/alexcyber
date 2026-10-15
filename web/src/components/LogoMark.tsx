// AlexCyberX "Glitch X" mark (brand/logo-mark-*.svg), inline so it follows the
// theme accent. The lower half slips a little further on hover (nav-upgrade.css).
import { useId } from 'react';

export default function LogoMark({ size = 26, className = 'logo-mark' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <clipPath id={`${id}t`}><rect x="0" y="0" width="64" height="31" /></clipPath>
        <clipPath id={`${id}b`}><rect x="0" y="33" width="64" height="31" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}t)`} stroke="var(--white)" strokeWidth="7" strokeLinecap="square"><path d="M19 17 45 47M45 17 19 47" /></g>
      <g className="lm-low" clipPath={`url(#${id}b)`}><g transform="translate(4 0)" style={{ stroke: 'var(--accent)' }} strokeWidth="7" strokeLinecap="square"><path d="M19 17 45 47M45 17 19 47" /></g></g>
      <rect className="lm-bar" x="10" y="31.2" width="9" height="1.6" style={{ fill: 'var(--accent)' }} />
      <rect x="47" y="31.2" width="7" height="1.6" style={{ fill: 'var(--white)' }} opacity=".55" />
    </svg>
  );
}
