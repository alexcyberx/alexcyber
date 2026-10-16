// Sidebar icons (same drawings as the old panel's sidebar). 14x14, currentColor.

const P: Record<string, React.ReactNode> = {
  dashboard: <><rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/> <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/> <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/> <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></>,
  analytics: <><path d="M2 11.5L5 7.5 7.5 9 11 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/> <circle cx="11" cy="4.5" r="1" fill="currentColor"/></>,
  users: <><circle cx="5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.3"/> <path d="M1 12c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/> <path d="M10 6.5a2 2 0 000-4M13 12c0-2-1.3-3-3-3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  messages: <><rect x="1" y="2" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/> <path d="M4 5.5l3 2.5 3-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>,
  notifications: <><path d="M7 1.5A4 4 0 003 5.5v1.8L2 9h10l-1-1.7V5.5A4 4 0 007 1.5z" stroke="currentColor" strokeWidth="1.2"/> <path d="M5.5 10.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  community: <><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/> <circle cx="10" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/> <path d="M1 11c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/> <path d="M10 8c1.5 0 3 .9 3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  content: <><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/> <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  blog: <><rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/> <path d="M4 4.5h6M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>,
  resources: <><path d="M2 2.5h10v9H2z" stroke="currentColor" strokeWidth="1.2"/> <path d="M4.5 5.5h5M4.5 7.5h5M4.5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/> <path d="M2 2.5L7 1l5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>,
  ctf: <><rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/> <path d="M5 3V2M9 3V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/> <path d="M4.5 7.5l1.5 1.5L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>,
  toolsmanager: <><path d="M9.5 1.5a2.7 2.7 0 00-2.7 3.4L2 10.7a1.3 1.3 0 001.8 1.8l5.8-4.8a2.7 2.7 0 003.4-2.7l-2 2-1.5-1.5 2-2a2.7 2.7 0 00-1.9-.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></>,
  gamification: <><path d="M7 1l1.5 3.5H12L9 6.5l1 3.5L7 8l-3 2 1-3.5L2 4.5h3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></>,
  security: <><path d="M7 1L2 3.5V7c0 2.8 2.2 4.5 5 5.5 2.8-1 5-2.7 5-5.5V3.5L7 1z" stroke="currentColor" strokeWidth="1.3"/> <path d="M4.5 7l2 2L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>,
  backup: <><path d="M7 9V2M4.5 4.5L7 2l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/> <path d="M2 9.5v1.5a1 1 0 001 1h8a1 1 0 001-1V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
  settings: <><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/> <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M11.5 2.5l-1 1M3.5 10.5l-1 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>,
};

export function Icon({ name }: { name: string }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">{P[name]}</svg>;
}
