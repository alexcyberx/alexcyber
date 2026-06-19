/* ═══════════════════════════════════════════════════
   ALEX CYBERX - CHAPTER TRANSLATION SYSTEM v7
   Google Translate (free, no key) + localStorage cache
   - ONE TEXT NODE = ONE API CALL (no separator splitting bugs)
   - Skips <pre><code> blocks completely
   - Concurrent requests with rate limiting
═══════════════════════════════════════════════════ */

/* ─── CACHE HELPERS ─── */
const chapterCache = {};

// Cache version - bump to clear old wrong translations
const CACHE_VERSION = 'v8';
const CACHE_VER_KEY = 'acx_cache_ver';


(function restoreCache() {
  try {
    // If cache version changed, wipe all old cached translations (fixes wrong translations)
    const savedVer = localStorage.getItem(CACHE_VER_KEY);
    if (savedVer !== CACHE_VERSION) {
      Object.keys(localStorage).forEach(k => {
        if (/^acx_ch_/.test(k)) localStorage.removeItem(k);
      });
      localStorage.setItem(CACHE_VER_KEY, CACHE_VERSION);
      return; // fresh start
    }
    // Restore valid cached translations
    Object.keys(localStorage).forEach(k => {
      if (/^acx_ch_[a-z]{2,3}_\d+$/.test(k))
        chapterCache[k.replace('acx_ch_', '')] = localStorage.getItem(k);
    });
  } catch(e) {}
})();

function lsSave(key, html) {
  try {
    if (html.length < 500000) localStorage.setItem('acx_ch_' + key, html);
  } catch(e) {
    try {
      const old = Object.keys(localStorage).find(k => k.startsWith('acx_ch_'));
      if (old) { localStorage.removeItem(old); localStorage.setItem('acx_ch_' + key, html); }
    } catch(_) {}
  }
}

/* ─── LANG NAME MAP ─── */
const LANG_NAMES = {
  hi: 'Hindi',
  en: 'English',
  pa: 'Punjabi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  mr: 'Marathi',
};

/* ─── GOOGLE TRANSLATE - single text, no batching ─── */
async function googleTranslateText(text, targetLang) {
  if (!text || !text.trim()) return text;
  // Use 'hi' as source - Hinglish is Hindi-script mix, 'auto' often misdetects it
  const srcLang = 'hi';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map(chunk => (chunk && chunk[0]) || '').join('');
    }
    return text;
  } catch(e) {
    console.warn('Translation failed:', e);
    return text;
  }
}

/* ─── CHECK IF NODE IS INSIDE CODE/PRE BLOCK ─── */
function isInsideCodeBlock(node) {
  let el = node.parentElement;
  while (el) {
    const tag = el.tagName && el.tagName.toLowerCase();
    if (tag === 'pre' || tag === 'code') return true;
    if (el.hasAttribute && el.hasAttribute('data-no-translate')) return true;
    el = el.parentElement;
  }
  return false;
}

/* ─── TRANSLATE HTML CONTENT ─── */
async function translateHtmlContent(html, targetLang, onProgress) {
  const parser = new DOMParser();
  const doc = parser.parseFromString('<div id="root">' + html + '</div>', 'text/html');
  const root = doc.getElementById('root');

  // Collect all translatable text nodes
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      if (/^\d+(\.\d+)?$/.test(text)) return NodeFilter.FILTER_REJECT; // pure numbers
      if (/^\$\{/.test(text)) return NodeFilter.FILTER_REJECT;          // template literals
      if (isInsideCodeBlock(node)) return NodeFilter.FILTER_REJECT;     // code blocks
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while (walker.nextNode()) textNodes.push(walker.currentNode);
  if (textNodes.length === 0) return html;

  // Translate each node one by one - no separator splitting bugs
  const CONCURRENT = 4;  // max parallel requests
  let done = 0;

  for (let i = 0; i < textNodes.length; i += CONCURRENT) {
    const slice = textNodes.slice(i, i + CONCURRENT);

    await Promise.all(slice.map(async (node) => {
      const original = node.textContent;
      const translated = await googleTranslateText(original, targetLang);
      // Only update if translation looks valid (not empty, not same as separator artifact)
      if (translated && translated.trim() && translated !== original) {
        node.textContent = translated;
      }
      done++;
    }));

    if (onProgress) onProgress(done, textNodes.length);
    // Small delay between batches to avoid rate limiting
    if (i + CONCURRENT < textNodes.length) {
      await new Promise(r => setTimeout(r, 80));
    }
  }

  return root.innerHTML;
}

/* ─── SHOW LOADING UI ─── */
function showTranslateLoader(langName) {
  const existing = document.getElementById('xlLoader');
  if (existing) existing.remove();

  // Get chapterContent bounding box to position loader over it
  const isCyberPage = typeof currentPage !== 'undefined' && currentPage === 'learn2';
  const box = document.getElementById(isCyberPage ? 'cyberChapterContent' : 'chapterContent');
  const learnMain = document.getElementById('learnMain') || document.body;

  const loader = document.createElement('div');
  loader.id = 'xlLoader';

  if (box) {
    const rect = box.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Fixed to viewport - stays put while scrolling
    // Positioned over the chapterContent area horizontally, top 30% of viewport vertically
    loader.style.cssText = [
      'position:fixed',
      'z-index:99999',
      'pointer-events:none',
      // Horizontally match the content box
      'left:' + Math.max(rect.left, 0) + 'px',
      'width:' + rect.width + 'px',
      // Vertically: sit in upper portion of viewport over the content
      'top:' + Math.round(rect.top + 16) + 'px',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'gap:10px',
    ].join(';') + ';';
  } else {
    loader.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:10px;';
  }

  loader.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;background:rgba(8,8,10,0.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:18px 28px;">
      <svg width="32" height="32" viewBox="0 0 36 36" fill="none" style="animation:xlspin 0.85s linear infinite;">
        <circle cx="18" cy="18" r="15" stroke="rgba(220,20,20,0.12)" stroke-width="2.5"/>
        <path d="M18 3a15 15 0 0 1 15 15" stroke="#dc1414" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <div style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#e0e0e0;letter-spacing:0.3px;white-space:nowrap;">Translating to ${escapeHtml(langName)}</div>
      <div style="width:160px;height:3px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;">
        <div id="xlBar" style="height:100%;width:0%;background:linear-gradient(90deg,#dc1414,#ff5555);border-radius:3px;transition:width 0.12s;"></div>
      </div>
      <div id="xlStatus" style="font-family:'Inter',sans-serif;font-size:11px;color:#484858;">Starting...</div>
    </div>
    <style>@keyframes xlspin{to{transform:rotate(360deg)}}</style>
  `;

  document.body.appendChild(loader);
  return loader;
}

/* ─── MAIN TRANSLATE FUNCTION ─── */
async function doTranslate(htmlContent, lang, langName, cacheKeyOverride) {
  if (lang === 'hl') return htmlContent;

  const cacheKey = cacheKeyOverride || `${lang}_${currentChapter}`;
  if (chapterCache[cacheKey]) return chapterCache[cacheKey];

  const loader = showTranslateLoader(langName || lang);
  const bar = document.getElementById('xlBar');
  const status = document.getElementById('xlStatus');

  try {
    if (status) status.textContent = 'Translating...';

    const translated = await translateHtmlContent(htmlContent, lang, (done, total) => {
      if (bar) bar.style.width = Math.round(done / total * 100) + '%';
      if (status) status.textContent = `${done} / ${total} done`;
    });

    chapterCache[cacheKey] = translated;
    lsSave(cacheKey, translated);
    return translated;

  } catch(e) {
    console.error('Translation error:', e);
    return htmlContent;
  } finally {
    loader.remove();
  }
}

/* ─── SANITIZE HTML (XSS prevention) ─── */
function injectTranslated(box, html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script').forEach(s => s.remove());
    const evts = ['onload','onerror','onclick','onmouseover','onfocus','oninput','onkeydown','onkeyup','onsubmit',
                  'onpointerdown','onpointerup','ontouchstart','onwheel','oncopy','onpaste','oncut','oncontextmenu'];
    doc.querySelectorAll('*').forEach(el => {
      evts.forEach(ev => el.removeAttribute(ev));
      ['href','src'].forEach(a => {
        const v = el.getAttribute(a);
        if (v && /^\s*javascript:/i.test(v)) el.removeAttribute(a);
      });
    });
    box.innerHTML = doc.body.innerHTML;
  } catch(e) {
    // DOMParser fail hone pe — sirf script tags strip karo, baaki HTML intact raho
    box.innerHTML = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  }
}

/* ─── APPLY CHAPTER TRANSLATION ─── */
async function applyChapterTranslation(lang, isCyber) {
  if (lang === 'hl') return;

  const boxId = isCyber ? 'cyberChapterContent' : 'chapterContent';
  const box = document.getElementById(boxId);
  if (!box) return;

  const langName = LANG_NAMES[lang];
  if (!langName) return;

  // Store original Hinglish content (once per chapter load)
  const origKey = (isCyber ? 'cyber_orig_' : 'orig_') + (isCyber ? currentCyberChapter : currentChapter);
  if (!chapterCache[origKey]) chapterCache[origKey] = box.innerHTML;

  const original = chapterCache[origKey];
  const cacheKeyOverride = isCyber ? `${lang}_cyber_${currentCyberChapter}` : `${lang}_${currentChapter}`;
  const translated = await doTranslate(original, lang, langName, cacheKeyOverride);
  injectTranslated(box, translated);
}

/* ─── CTF PAGE TRANSLATION ─── */

// Store original Hinglish CTF data (once)
let _ctfOriginals = null;

function storeCTFOriginals() {
  if (_ctfOriginals) return;
  _ctfOriginals = {};
  if (typeof ctfChallenges === 'undefined') return;
  ctfChallenges.forEach(c => {
    _ctfOriginals[c.id] = { title: c.title, desc: c.desc, hint: c.hint };
  });
}

function restoreCTFOriginal() {
  if (!_ctfOriginals || typeof ctfChallenges === 'undefined') return;
  ctfChallenges.forEach(c => {
    if (_ctfOriginals[c.id]) {
      c.title = _ctfOriginals[c.id].title;
      c.desc  = _ctfOriginals[c.id].desc;
      c.hint  = _ctfOriginals[c.id].hint;
    }
  });
  if (typeof ctfRender === 'function') ctfRender();
}

async function applyCTFTranslation(lang) {
  if (typeof ctfChallenges === 'undefined') return;
  if (lang === 'hl' || lang === 'en') { restoreCTFOriginal(); return; }

  storeCTFOriginals();

  const langName = LANG_NAMES[lang] || lang;
  const cacheKey = 'ctf_' + lang;

  // Check cache
  if (chapterCache[cacheKey]) {
    const cached = chapterCache[cacheKey];
    ctfChallenges.forEach(c => {
      if (cached[c.id]) {
        c.title = cached[c.id].title || c.title;
        c.desc  = cached[c.id].desc  || c.desc;
        c.hint  = cached[c.id].hint  || c.hint;
      }
    });
    if (typeof ctfRender === 'function') ctfRender();
    // Also update open modal description if it's showing a translated challenge
    if (typeof ctfCurrentChallenge !== 'undefined' && ctfCurrentChallenge) {
      const descEl = document.getElementById('modalDesc');
      const titleEl = document.getElementById('modalTitle');
      const tr = cached[ctfCurrentChallenge.id];
      if (tr && descEl) descEl.textContent = tr.desc || ctfCurrentChallenge.desc;
      if (tr && titleEl) titleEl.textContent = tr.title || ctfCurrentChallenge.title;
    }
    return;
  }

  // Show loader
  const loader = showTranslateLoader(langName);
  const bar    = document.getElementById('xlBar');
  const status = document.getElementById('xlStatus');

  try {
    const total = ctfChallenges.length * 3; // title + desc + hint per challenge
    let done = 0;
    const translated = {};

    for (const c of ctfChallenges) {
      const orig = _ctfOriginals[c.id];
      if (!orig) continue;

      const [tTitle, tDesc, tHint] = await Promise.all([
        googleTranslateText(orig.title, lang),
        googleTranslateText(orig.desc,  lang),
        googleTranslateText(orig.hint,  lang),
      ]);

      c.title = tTitle || orig.title;
      c.desc  = tDesc  || orig.desc;
      c.hint  = tHint  || orig.hint;

      translated[c.id] = { title: c.title, desc: c.desc, hint: c.hint };
      done += 3;

      if (bar)    bar.style.width = Math.round(done / total * 100) + '%';
      if (status) status.textContent = done + ' / ' + total + ' done';

      // Small delay between challenges to avoid rate limiting
      await new Promise(r => setTimeout(r, 60));
    }

    // Cache it
    chapterCache[cacheKey] = translated;
    try {
      if (JSON.stringify(translated).length < 300000)
        localStorage.setItem('acx_ctf_' + lang, JSON.stringify(translated));
    } catch(e) {}

    if (typeof ctfRender === 'function') ctfRender();

  } catch(e) {
    console.warn('CTF translation error:', e);
  } finally {
    if (loader) loader.remove();
  }
}

// Restore CTF translations from localStorage cache on init
(function restoreCTFCache() {
  const langs = ['hi', 'pa', 'ta', 'te', 'bn', 'mr'];
  langs.forEach(lang => {
    try {
      const raw = localStorage.getItem('acx_ctf_' + lang);
      if (raw) chapterCache['ctf_' + lang] = JSON.parse(raw);
    } catch(e) {}
  });
})();
