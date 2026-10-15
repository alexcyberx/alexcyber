/* Mouse spotlight: a soft green glow follows the cursor on cards (CSS in
   css/variables.css: .spot-on, .cursor-glow). Mouse only; touch is ignored.
   Loaded by index.html and by the Next layout. */
(function () {
  if (window.__acxSpot) return;
  window.__acxSpot = true;
  var SEL = '.tut-card, .blog-card, .ctf-card, .ctf-stat-card, .ctf-daily-card, .ctf-setup-card, .pf-card, ' +
    '.comm-post-card, .cma-box, .hero-terminal, .contact-form, .auth-card, .lb-row, .search-result-item, [data-spot]';
  var cur = null, glow = null, x = 0, y = 0, raf = 0;

  function paint() {
    raf = 0;
    if (glow) glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
  }

  function onMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    if (!glow && document.body) {
      glow = document.createElement('div');
      glow.className = 'cursor-glow';
      glow.setAttribute('aria-hidden', 'true');
      document.body.appendChild(glow);
    }
    if (glow) glow.classList.add('on');
    if (!raf) raf = requestAnimationFrame(paint);

    var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (cur && cur !== el) cur.classList.remove('spot-on');
    cur = el;
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (x - r.left) + 'px');
    el.style.setProperty('--my', (y - r.top) + 'px');
    el.classList.add('spot-on');
  }

  function onLeave() {
    if (cur) cur.classList.remove('spot-on');
    cur = null;
    if (glow) glow.classList.remove('on');
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
})();
