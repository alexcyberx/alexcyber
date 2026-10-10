'use client';

import { useEffect, useRef } from 'react';

// Hides itself if the image URL is broken (same as the old onerror handler).
// The image can fail before React hydrates, so also check on mount.
export default function BlogImage(props: { className: string; src: string; alt: string; lazy?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) img.style.display = 'none';
  }, []);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      className={props.className}
      src={props.src}
      alt={props.alt}
      loading={props.lazy ? 'lazy' : undefined}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}
