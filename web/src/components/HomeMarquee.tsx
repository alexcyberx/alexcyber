import type { MarqueeItem } from '@/lib/marquee';

const ICONS: Record<MarqueeItem['type'], React.ReactNode> = {
  course: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  ctf: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 13.5L11.2 16.7L18 9.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" /></svg>,
  tool: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.6" /></svg>,
};

// "Skills covered" strip. The list is rendered twice for the seamless CSS loop
// (translateX(-50%)); the newest item gets the NEW badge. Same as js/marquee.js.
export default function HomeMarquee({ items }: { items: MarqueeItem[] }) {
  let newest = -1, newestT = -Infinity;
  items.forEach((it, i) => {
    const t = it.addedAt ? new Date(it.addedAt).getTime() : NaN;
    if (!isNaN(t) && t > newestT) { newestT = t; newest = i; }
  });
  const duration = Math.max(18, items.length * 3.2);
  const row = (copy: number) => items.map((it, i) => (
    <a key={`${copy}-${i}`} className="trust-item" href={it.href} tabIndex={copy ? -1 : 0} aria-hidden={copy ? true : undefined}>
      {ICONS[it.type]}{it.title}{i === newest && <span className="trust-new">NEW</span>}
    </a>
  ));
  return (
    <div className="trust-strip">
      <div className="trust-label" data-i18n="trust.label" suppressHydrationWarning>Skills covered across the platform</div>
      <div className="trust-track-wrap">
        <div className="trust-track" id="trustTrack" style={{ animationDuration: `${duration}s` }}>
          {items.length ? <>{row(0)}{row(1)}</> : <div className="trust-item">Loading...</div>}
        </div>
      </div>
    </div>
  );
}
