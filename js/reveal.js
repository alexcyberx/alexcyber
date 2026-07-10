/* ═══════════════════════════════════════════════════════════════
   js/reveal.js — Scroll-reveal for [data-reveal] elements
   Pairs with css/animations.css. Works across all pages: since new
   elements can appear when a page becomes active (SPA sections) or
   when JS renders content later, we (a) observe on load, and
   (b) re-scan whenever showPage() runs, picking up anything new.
═══════════════════════════════════════════════════════════════ */

(function () {
  var _observed = new WeakSet();
  var _observer = null;

  function getObserver() {
    if (_observer) return _observer;
    if (!('IntersectionObserver' in window)) return null;
    _observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          _observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    return _observer;
  }

  function scanForRevealTargets() {
    var obs = getObserver();
    var els = document.querySelectorAll('[data-reveal]');
    els.forEach(function (el) {
      if (_observed.has(el)) return;
      _observed.add(el);

      if (!obs) {
        // No IntersectionObserver support — just show it.
        el.classList.add('is-visible');
        return;
      }

      // If the element is already on-screen (e.g. the page it lives
      // in just became active and it's within the initial viewport),
      // reveal it immediately rather than waiting for a scroll event
      // that may never come.
      var rect = el.getBoundingClientRect();
      var inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (inViewport) {
        el.classList.add('is-visible');
      } else {
        obs.observe(el);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', scanForRevealTargets);

  // Re-scan after page navigation, since showPage() may reveal a
  // section (e.g. About/Contact) that wasn't in the DOM's visible
  // flow before, or dynamically-rendered content may add new
  // [data-reveal] nodes later.
  function _patchShowPageForReveal() {
    if (typeof window.showPage !== 'function') {
      setTimeout(_patchShowPageForReveal, 50);
      return;
    }
    if (window._revealPatched) return;
    window._revealPatched = true;

    var _orig = window.showPage;
    window.showPage = function (page, skipPush) {
      _orig.call(this, page, skipPush);
      setTimeout(scanForRevealTargets, 60);
    };
  }
  _patchShowPageForReveal();

  // Also catch same-page scroll (e.g. Home page's Tutorials/About/
  // Contact sections reached via smooth-scroll rather than showPage).
  window.addEventListener('scroll', function () {
    scanForRevealTargets();
  }, { passive: true });
})();
