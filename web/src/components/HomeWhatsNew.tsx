import type { NewItem } from '@/lib/whats-new';

const TYPE_LABEL: Record<NewItem['type'], string> = { course: 'Course', ctf: 'CTF Room', tool: 'Tool' };

// "Added 3 days ago", or the date once it is older than a month.
function added(iso: string, now: number): string {
  const days = Math.floor((now - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Added today';
  if (days === 1) return 'Added yesterday';
  if (days < 30) return `Added ${days} days ago`;
  return 'Added ' + new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Replaces the old auto-scrolling "Skills covered" strip: the 3 newest things,
// static cards with a real date and a direct link.
export default function HomeWhatsNew({ items, now }: { items: NewItem[]; now: number }) {
  if (!items.length) return null;
  return (
    <section className="section whats-new" id="whats-new">
      <div className="section-label" data-i18n="new.label" suppressHydrationWarning>Latest</div>
      <h2 className="section-heading" data-i18n="new.title" suppressHydrationWarning>New on AlexCyberX</h2>
      <div className="whats-new-grid">
        {items.map((it, i) => (
          <a key={it.href} className="whats-new-card" href={it.href}>
            <span className={`whats-new-type whats-new-type--${it.type}`}>{TYPE_LABEL[it.type]}</span>
            <span className="whats-new-title">{it.title}</span>
            <span className="whats-new-date">{added(it.addedAt, now)}{i === 0 && <span className="whats-new-badge">NEW</span>}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
