'use client';

import { useEffect } from 'react';

// Scroll-reveal for [data-reveal] (css/animations.css), like js/reveal.js.
export default function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
      else obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return null;
}
