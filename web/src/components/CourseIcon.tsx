// Same SVGs as COURSE_ICONS in js/courses.js.
const ICONS: Record<string, React.ReactNode> = {
  radar: (
    <>
      <circle cx="10" cy="10" r="8" stroke="#10b981" strokeWidth="1.2" />
      <circle cx="10" cy="10" r="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <line x1="4" y1="10" x2="7" y2="10" stroke="#10b981" strokeWidth="1" />
      <line x1="13" y1="10" x2="16" y2="10" stroke="#10b981" strokeWidth="1" />
      <line x1="10" y1="4" x2="10" y2="7" stroke="#10b981" strokeWidth="1" />
      <line x1="10" y1="13" x2="10" y2="16" stroke="#10b981" strokeWidth="1" />
      <line x1="12.5" y1="12.5" x2="15" y2="15" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  shield: (
    <>
      <path d="M10 2.5l6.5 3v4.3c0 4-2.7 7.4-6.5 8.7-3.8-1.3-6.5-4.7-6.5-8.7V5.5l6.5-3Z" stroke="#10b981" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7.2 10l1.9 1.9 3.7-3.9" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="#10b981" strokeWidth="1.2" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="#10b981" strokeWidth="1.2" />
      <circle cx="10" cy="13" r="1.2" fill="#10b981" />
    </>
  ),
  bug: (
    <>
      <ellipse cx="10" cy="11" rx="4.5" ry="5.5" stroke="#10b981" strokeWidth="1.2" />
      <path d="M10 5.5V3.5M6.5 6.5L4.5 4.5M13.5 6.5L15.5 4.5M4 11H2M18 11H16M4.5 15.5L2.5 17.5M15.5 15.5L17.5 17.5" stroke="#10b981" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  code: <path d="M7 6L2.5 10L7 14M13 6L17.5 10L13 14" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />,
};

export default function CourseIcon({ name }: { name: string | null }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      {ICONS[name || ''] ?? ICONS.shield}
    </svg>
  );
}
