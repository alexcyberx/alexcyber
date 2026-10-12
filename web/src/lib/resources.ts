// /resources: shared bits for the resource library (same values as js/resources.js).

export type Resource = {
  id: string;
  name: string;
  type: string | null;
  file_path: string | null;
  file_size: number | null;
  chapter_tag: string | null;
  downloads: number | null;
  uploaded_at: string | null;
};

export const RES_TYPE_ICONS: Record<string, string> = {
  cheatsheet: '📋', pcap: '📡', pdf: '📄', script: '⚙️', wordlist: '📝', other: '📁',
};

export const RES_TYPE_LABELS: Record<string, string> = {
  cheatsheet: 'Cheatsheet', pcap: 'PCAP', pdf: 'PDF', script: 'Script', wordlist: 'Wordlist', other: 'Other',
};

export const resIcon = (type: string | null) => RES_TYPE_ICONS[type || ''] || RES_TYPE_ICONS.other;
export const resLabel = (type: string | null) => RES_TYPE_LABELS[type || ''] || type || '';

export function formatSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
