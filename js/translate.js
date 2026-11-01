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
const CACHE_VERSION = 'v10';
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

/* ─── PROTECTED TERMS ───
   Yeh technical/cybersecurity/proper-noun terms hain jo already English mein
   likhe gaye hain (Hinglish content ke andar). Translate karte waqt inhe
   badalna nahi chahiye - jaise "Confidentiality" ko "गोपनीयता" ya
   "White Hat" ko "सफेद टोपी" mat banao. Google translate raw text API
   HTML/notranslate tags respect nahi karta, isliye placeholder-token
   trick use karte hain: term ko ek unique marker se replace karo,
   translate karo, phir wapas asli term daal do.
   Longest-match-first order zaroori hai (e.g. "Grey Hat" pehle "Hat" se). */
const PROTECTED_TERMS = [
  // Multi-word terms first (longest match wins)
  'Rules of Engagement', 'Scope of Work', 'State Sponsored',
  'Script Kiddie', 'Insider Threat', 'White Hat', 'Black Hat', 'Grey Hat',
  'Penetration Testing', 'Gaining Access', 'Maintaining Access',
  'Covering Tracks', 'CEH Practical', 'CEH v13', 'IT Act 2000',
  'Cloud Native Security', 'Advanced IoT', 'AI Security',
  'CIA Triad', 'Section 66',
  // Single-word technical/proper-noun terms
  'Confidentiality', 'Integrity', 'Availability',
  'Reconnaissance', 'Scanning', 'Enumeration', 'Footprinting',
  'Hacktivist', 'AlexCyberX', 'CEH',
];
// Sort longest-first so multi-word terms match before their sub-words
PROTECTED_TERMS.sort((a, b) => b.length - a.length);

function protectTerms(text) {
  const found = [];
  let out = text;
  PROTECTED_TERMS.forEach((term) => {
    const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    out = out.replace(re, (match) => {
      // zzz-prefixed alphanumeric token: looks like a single word to the
      // translate engine so it usually passes through untouched, unlike
      // control characters or punctuation which can get stripped/mangled.
      const token = `zzzterm${found.length}zzz`;
      found.push(match);
      return token;
    });
  });
  return { text: out, found };
}

function restoreTerms(text, found) {
  if (!found.length) return text;
  return text.replace(/zzzterm(\d+)zzz/gi, (m, i) => found[+i] || m);
}

/* ─── GOOGLE TRANSLATE - single text, no batching ─── */
async function googleTranslateText(text, targetLang) {
  if (!text || !text.trim()) return text;
  // Protect technical/proper-noun terms before sending to translate API
  const { text: guarded, found } = protectTerms(text);
  // Use 'hi' as source - Hinglish is Hindi-script mix, 'auto' often misdetects it
  const srcLang = 'hi';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(guarded)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data && data[0]) {
      const translated = data[0].map(chunk => (chunk && chunk[0]) || '').join('');
      return restoreTerms(translated, found);
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
  const isEthicalPage = typeof currentPage !== 'undefined' && currentPage === 'learn3';
  const box = document.getElementById(isEthicalPage ? 'ethicalChapterContent' : (isCyberPage ? 'cyberChapterContent' : 'chapterContent'));
  const learnMain = document.getElementById('learnMain') || document.body;

  const loader = document.createElement('div');
  loader.id = 'xlLoader';

  if (box) {
    const rect = box.getBoundingClientRect();

    // Fixed to viewport - stays put while scrolling
    // Positioned over the content box horizontally, top portion vertically
    loader.style.cssText = [
      'position:fixed',
      'z-index:99999',
      'pointer-events:none',
      'left:' + Math.max(rect.left, 0) + 'px',
      'width:' + rect.width + 'px',
      'top:' + Math.round(rect.top + 16) + 'px',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'gap:10px',
    ].join(';') + ';';
  } else {
    // CTF page ya koi aur page jahan chapterContent nahi, screen ke center mein
    loader.style.cssText = 'position:fixed;top:30%;left:0;right:0;margin:0 auto;width:fit-content;z-index:99999;display:flex;flex-direction:column;align-items:center;gap:10px;';
  }

  loader.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;background:rgba(8,8,10,0.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:14px;padding:18px 28px;">
      <svg width="32" height="32" viewBox="0 0 36 36" fill="none" style="animation:xlspin 0.85s linear infinite;">
        <circle cx="18" cy="18" r="15" stroke="rgba(var(--accent-rgb),0.12)" stroke-width="2.5"/>
        <path style="stroke:var(--accent)" d="M18 3a15 15 0 0 1 15 15" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <div style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#e0e0e0;letter-spacing:0.3px;white-space:nowrap;">Translating to ${escapeHtml(langName)}</div>
      <div style="width:160px;height:3px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;">
        <div id="xlBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--accent-bright));border-radius:3px;transition:width 0.12s;"></div>
      </div>
      <div id="xlStatus" style="font-family:'Inter',sans-serif;font-size:11px;color:#484858;">Starting...</div>
    </div>
    <style>@keyframes xlspin{to{transform:rotate(360deg)}}</style>
  `;

  document.body.appendChild(loader);
  return loader;
}

/* ─── MAIN TRANSLATE FUNCTION ───
   hideBox: agar diya gaya hai, translation complete hone tak yeh element
   visually hidden rahega, taaki original (Hinglish) content ek pal ke liye
   bhi flash na ho. Loader ke peeche se raw text dikhna avoid karne ke liye. */
async function doTranslate(htmlContent, lang, langName, cacheKeyOverride, hideBox) {
  if (lang === 'hl') return htmlContent;

  const cacheKey = cacheKeyOverride || `${lang}_${currentChapter}`;
  if (chapterCache[cacheKey]) return chapterCache[cacheKey];

  const loader = showTranslateLoader(langName || lang);
  const bar = document.getElementById('xlBar');
  const status = document.getElementById('xlStatus');

  const prevVisibility = hideBox ? hideBox.style.visibility : null;
  if (hideBox) hideBox.style.visibility = 'hidden';

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
    if (hideBox) hideBox.style.visibility = prevVisibility || '';
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
    // DOMParser fail hone pe, sirf script tags strip karo, baaki HTML intact raho
    box.innerHTML = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  }
}

/* ─── APPLY CHAPTER TRANSLATION ───
   courseTag: true/false (legacy, cyber attacks) OR 'ethical' (new course).
   Kept backward compatible, isCyber === true still works exactly as before. */
async function applyChapterTranslation(lang, courseTag) {
  if (lang === 'hl') return;

  const isCyber = courseTag === true;
  const isEthical = courseTag === 'ethical';

  const boxId = isEthical ? 'ethicalChapterContent' : (isCyber ? 'cyberChapterContent' : 'chapterContent');
  const box = document.getElementById(boxId);
  if (!box) return;

  const langName = LANG_NAMES[lang];
  if (!langName) return;

  const prefix = isEthical ? 'ethical_orig_' : (isCyber ? 'cyber_orig_' : 'orig_');
  const idx = isEthical ? currentEthicalChapter : (isCyber ? currentCyberChapter : currentChapter);

  // Store original Hinglish content (once per chapter load)
  const origKey = prefix + idx;
  if (!chapterCache[origKey]) chapterCache[origKey] = box.innerHTML;

  const original = chapterCache[origKey];
  const cacheKeyOverride = isEthical ? `${lang}_ethical_${idx}` : (isCyber ? `${lang}_cyber_${idx}` : `${lang}_${idx}`);
  const translated = await doTranslate(original, lang, langName, cacheKeyOverride, box);
  injectTranslated(box, translated);
}

/* ─── CTF PAGE TRANSLATION ─── */

// Store original Hinglish CTF data (once), yeh base/default language hai
let _ctfOriginals = null;

function storeCTFOriginals() {
  if (_ctfOriginals) return;
  _ctfOriginals = {};
  if (typeof ctfChallenges === 'undefined') return;
  ctfChallenges.forEach(c => {
    _ctfOriginals[c.id] = { title: c.title, desc: c.desc, hint: c.hint, hints: c.hints, scenario: c.scenario };
  });
}

function restoreCTFOriginal() {
  if (typeof ctfChallenges === 'undefined') return;
  // Agar originals kabhi store nahi hue (direct hinglish select), toh kuch restore nahi karna
  // bas ctfRender() call karo taaki current (already hinglish) data re-render ho
  if (!_ctfOriginals) {
    if (typeof ctfRender === 'function') ctfRender();
    refreshOpenCTFModal();
    return;
  }
  ctfChallenges.forEach(c => {
    const orig = _ctfOriginals[c.id];
    if (!orig) return;
    c.title = orig.title;
    c.desc  = orig.desc;
    c.hint  = orig.hint;
    c.hints = orig.hints;
    c.scenario = orig.scenario;
  });
  if (typeof ctfRender === 'function') ctfRender();
  refreshOpenCTFModal();
}

function refreshOpenCTFModal() {
  if (typeof ctfCurrentChallenge === 'undefined' || !ctfCurrentChallenge) return;
  const c = ctfChallenges.find(x => x.id === ctfCurrentChallenge.id);
  if (!c) return;
  ctfCurrentChallenge = c;
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) titleEl.textContent = c.title;
  // Description renders into modalChallengeScenario whether it's a real
  // scenario (innerHTML) or the plain-desc fallback (textContent), there
  // is no separate modalDesc element in this modal.
  const scenarioEl = document.getElementById('modalChallengeScenario');
  if (scenarioEl) {
    if (c.scenario) scenarioEl.innerHTML = c.scenario;
    else scenarioEl.textContent = c.desc || '';
  }
  const hintBoxEl   = document.getElementById('ctfHintBox');
  const hintLabelEl = document.getElementById('ctfHintToggleLabel');
  if (hintBoxEl) {
    const hintList = c.hints && c.hints.length ? c.hints : (c.hint ? [c.hint] : []);
    hintBoxEl.innerHTML = hintList.map((h, i) => hintList.length > 1 ? `<div style="margin-bottom:6px;"><strong>Hint ${i+1}:</strong> ${h}</div>` : h).join('');
  }
  if (hintLabelEl && typeof ctfHintVisible !== 'undefined') {
    hintLabelEl.textContent = ctfHintVisible ? 'Hide Hint' : 'Show Hint';
  }
}

// Hand-written translations for the 5 live challenges, base content
// (ctfChallenges array) is Hinglish. English aur baaki 6 languages (Hindi,
// Punjabi, Tamil, Telugu, Bengali, Marathi) yahan hand-written hain, taaki
// machine translation ki zarurat na pade in jaane-mane challenges ke liye.
const CTF_OVERRIDES = {
  'for-01': {
    hl: {
      desc: 'CorpX LAN pe ek machine unusual outbound DNS activity ke liye flag hua. Egress point pe 20-second ka packet capture liya gaya. PCAP download karo, suspicious traffic isolate karo, aur pata karo kya exfiltrate kiya gaya.',
      hints: [
        'Wireshark mein dns filter lagao. Ek internal IP baar baar ek external domain query kar raha hai aur har baar NXDOMAIN aa raha hai.',
        'Parent domain hai data.corpx-sync.net. 4 subdomain labels ko timestamp order mein collect karo.',
        'Labels join karo, uppercase karo, = signs se multiple of 8 tak pad karo, phir Base32 decode karo. CyberChef iske liye best hai.'
      ]
    },
    en: {
      desc: 'A machine on the CorpX LAN was flagged for unusual outbound DNS activity. A 20-second packet capture was taken at the egress point. Download the PCAP, isolate the suspicious traffic, and reconstruct what was exfiltrated.',
      hints: [
        'Filter by dns in Wireshark. One internal IP is querying an external domain repeatedly and getting NXDOMAIN every time.',
        'The parent domain is data.corpx-sync.net. Collect the 4 subdomain labels in timestamp order.',
        'Join the labels, convert to uppercase, pad to a multiple of 8 with = signs, then Base32 decode. CyberChef works well for this.'
      ]
    },
    hi: {
      desc: 'CorpX LAN पर एक मशीन को असामान्य outbound DNS activity के लिए flag किया गया। Egress point पर 20-second का packet capture लिया गया। PCAP download करो, suspicious traffic isolate करो, और पता करो क्या exfiltrate किया गया।',
      hints: [
        'Wireshark में dns filter लगाओ। एक internal IP बार-बार एक external domain query कर रहा है और हर बार NXDOMAIN मिल रहा है।',
        'Parent domain है data.corpx-sync.net। 4 subdomain labels को timestamp order में collect करो।',
        'Labels join करो, uppercase करो, = signs से multiple of 8 तक pad करो, फिर Base32 decode करो। CyberChef इसके लिए बेस्ट है।'
      ]
    },
    pa: {
      desc: 'CorpX LAN ਤੇ ਇੱਕ machine ਨੂੰ unusual outbound DNS activity ਲਈ flag ਕੀਤਾ ਗਿਆ। Egress point ਤੇ 20-second ਦਾ packet capture ਲਿਆ ਗਿਆ। PCAP download ਕਰੋ, suspicious traffic isolate ਕਰੋ, ਅਤੇ ਪਤਾ ਕਰੋ ਕੀ exfiltrate ਕੀਤਾ ਗਿਆ।',
      hints: [
        'Wireshark ਵਿੱਚ dns filter ਲਗਾਓ। ਇੱਕ internal IP ਵਾਰ-ਵਾਰ ਇੱਕ external domain query ਕਰ ਰਿਹਾ ਹੈ ਅਤੇ ਹਰ ਵਾਰ NXDOMAIN ਮਿਲਦਾ ਹੈ।',
        'Parent domain ਹੈ data.corpx-sync.net। 4 subdomain labels ਨੂੰ timestamp order ਵਿੱਚ collect ਕਰੋ।',
        'Labels join ਕਰੋ, uppercase ਕਰੋ, = signs ਨਾਲ multiple of 8 ਤੱਕ pad ਕਰੋ, ਫਿਰ Base32 decode ਕਰੋ। CyberChef ਇਸ ਲਈ ਬੈਸਟ ਹੈ।'
      ]
    },
    ta: {
      desc: 'CorpX LAN-இல் ஒரு machine அசாதாரண outbound DNS செயல்பாட்டிற்காக flag செய்யப்பட்டது. Egress point-இல் 20-second packet capture எடுக்கப்பட்டது. PCAP பதிவிறக்கி, suspicious traffic-ஐ தனிமைப்படுத்தி, என்ன exfiltrate செய்யப்பட்டது என்று கண்டறியுங்கள்.',
      hints: [
        'Wireshark-இல் dns filter போடுங்கள். ஒரு internal IP திரும்பத்திரும்ப ஒரு external domain-ஐ query செய்கிறது, ஒவ்வொரு முறையும் NXDOMAIN வருகிறது.',
        'Parent domain data.corpx-sync.net. 4 subdomain labels-ஐ timestamp வரிசையில் சேகரியுங்கள்.',
        'Labels-ஐ join செய்து, uppercase-ஆக மாற்றி, = signs-ஆல் 8-இன் மடங்காக pad செய்து, Base32 decode செய்யுங்கள். CyberChef இதற்கு சிறந்தது.'
      ]
    },
    te: {
      desc: 'CorpX LAN‌లో ఒక machine అసాధారణ outbound DNS కార్యకలాపానికి flag చేయబడింది. Egress point‌లో 20-second packet capture తీసుకోబడింది. PCAP డౌన్‌లోడ్ చేసి, suspicious traffic‌ను వేరుచేసి, ఏమి exfiltrate చేయబడిందో కనుగొనండి.',
      hints: [
        'Wireshark‌లో dns filter వేయండి. ఒక internal IP పదే పదే ఒక external domain‌ను query చేస్తోంది మరియు ప్రతిసారి NXDOMAIN వస్తోంది.',
        'Parent domain data.corpx-sync.net. 4 subdomain labels‌ను timestamp క్రమంలో సేకరించండి.',
        'Labels‌ను join చేసి, uppercase‌కు మార్చి, = signs‌తో 8 యొక్క గుణకంగా pad చేసి, Base32 decode చేయండి. CyberChef దీనికి బాగా పనిచేస్తుంది.'
      ]
    },
    bn: {
      desc: 'CorpX LAN-এ একটি machine অস্বাভাবিক outbound DNS কার্যকলাপের জন্য flag হয়েছে। Egress point-এ 20-second packet capture নেওয়া হয়েছে। PCAP download করুন, suspicious traffic আলাদা করুন, এবং কী exfiltrate করা হয়েছে তা পুনর্গঠন করুন।',
      hints: [
        'Wireshark-এ dns filter দিন। একটি internal IP বারবার একটি external domain query করছে এবং প্রতিবার NXDOMAIN পাচ্ছে।',
        'Parent domain হল data.corpx-sync.net। 4 subdomain labels টাইমস্ট্যাম্প ক্রমে সংগ্রহ করুন।',
        'Labels জোড়া দিন, uppercase করুন, = signs দিয়ে 8-এর গুণিতক পর্যন্ত pad করুন, তারপর Base32 decode করুন। CyberChef এর জন্য ভালো।'
      ]
    },
    mr: {
      desc: 'CorpX LAN वर एक machine ला असामान्य outbound DNS क्रियाकलापासाठी flag केले गेले. Egress point वर 20-second चे packet capture घेतले. PCAP download करा, suspicious traffic वेगळा करा, आणि काय exfiltrate केले गेले ते शोधा.',
      hints: [
        'Wireshark मध्ये dns filter लावा. एक internal IP वारंवार एक external domain query करत आहे आणि प्रत्येक वेळी NXDOMAIN मिळत आहे.',
        'Parent domain आहे data.corpx-sync.net. 4 subdomain labels timestamp क्रमाने गोळा करा.',
        'Labels join करा, uppercase करा, = signs ने 8 च्या पटीत pad करा, मग Base32 decode करा. CyberChef यासाठी उत्तम आहे.'
      ]
    }
  },
  'web-01': {
    hl: {
      desc: "Lumio naya laptop launch karne wala hai. Uska online store jaldi mein live hua aur developers launch se pehle ki safai bhool gaye. Jo unhone chhod diya wo dhoondo aur launch code nikalo.",
      scenario: "Lumio laptops aur desktops online bechta hai. Store dekhne mein poora taiyaar lagta hai, par launch se pehle ki aakhri safai nahi hui. Browser jo files download karta hai, unme kahin developers ne ek staging key aur ek internal API ka ishara chhod diya hai.<br><br>Key dhoondo, nayi Lumio Book Pro ka internal pre-order API kholo, aur launch code padho. Wahi code flag hai.",
      hints: [
        "Website jitna dikhati hai, browser ko usse zyada bhejti hai. Page source kholo (Ctrl+U, ya phone par view-source:) aur upar ke comments padho.",
        "Comment ek JavaScript file ki taraf ishara karta hai. js/store.js ko browser mein seedha kholo aur config dekho.",
        "store.js mein ek staging key aur ek internal API ka rasta hai. Store ke address mein page?session=... ki jagah wo rasta lagao, aur ?key= ke baad key daalo."
      ]
    },
    en: {
      desc: "Lumio is about to launch a new laptop. Its online store went live in a hurry and the developers forgot the cleanup before go-live. Find what they left behind and get the launch code.",
      scenario: "Lumio sells laptops and desktops online. The store looks finished, but it went live without the final cleanup. Somewhere in the files your browser downloads, the developers left a staging key and a pointer to an internal API.<br><br>Find the key, call the internal pre-order API for the unreleased Lumio Book Pro, and read the launch code. That code is the flag.",
      hints: [
        "Websites send your browser more than they show. Open the page source (Ctrl+U, or view-source: on a phone) and read the comments at the top.",
        "The comment points to a JavaScript file. Open js/store.js directly in the browser and look at the config.",
        "store.js has a staging key and the path of an internal API. In the store's address, replace page?session=... with that path and put the key after ?key=."
      ]
    },
    hi: {
      desc: "Lumio एक नया laptop launch करने वाला है। उसका online store जल्दी में live हुआ और developers launch से पहले की सफाई भूल गए। जो उन्होंने छोड़ दिया वो ढूंढो और launch code निकालो।",
      scenario: "Lumio laptops और desktops online बेचता है। Store देखने में पूरा तैयार लगता है, पर launch से पहले की आखिरी सफाई नहीं हुई। Browser जो files download करता है, उनमें कहीं developers ने एक staging key और एक internal API का इशारा छोड़ दिया है।<br><br>Key ढूंढो, नई Lumio Book Pro का internal pre-order API खोलो, और launch code पढ़ो। वही code flag है।",
      hints: [
        "Website जितना दिखाती है, browser को उससे ज़्यादा भेजती है। Page source खोलो (Ctrl+U, या phone पर view-source:) और ऊपर के comments पढ़ो।",
        "Comment एक JavaScript file की तरफ इशारा करता है। js/store.js को browser में सीधा खोलो और config देखो।",
        "store.js में एक staging key और एक internal API का रास्ता है। Store के address में page?session=... की जगह वो रास्ता लगाओ, और ?key= के बाद key डालो।"
      ]
    },
    pa: {
      desc: "Lumio ਇੱਕ ਨਵਾਂ laptop launch ਕਰਨ ਵਾਲਾ ਹੈ। ਉਸਦਾ online store ਜਲਦੀ ਵਿੱਚ live ਹੋਇਆ ਅਤੇ developers launch ਤੋਂ ਪਹਿਲਾਂ ਦੀ ਸਫਾਈ ਭੁੱਲ ਗਏ। ਜੋ ਉਹਨਾਂ ਨੇ ਛੱਡ ਦਿੱਤਾ ਉਹ ਲੱਭੋ ਅਤੇ launch code ਕੱਢੋ।",
      scenario: "Lumio laptops ਅਤੇ desktops online ਵੇਚਦਾ ਹੈ। Store ਦੇਖਣ ਵਿੱਚ ਪੂਰਾ ਤਿਆਰ ਲੱਗਦਾ ਹੈ, ਪਰ launch ਤੋਂ ਪਹਿਲਾਂ ਦੀ ਆਖਰੀ ਸਫਾਈ ਨਹੀਂ ਹੋਈ। Browser ਜੋ files download ਕਰਦਾ ਹੈ, ਉਹਨਾਂ ਵਿੱਚ ਕਿਤੇ developers ਨੇ ਇੱਕ staging key ਅਤੇ ਇੱਕ internal API ਦਾ ਇਸ਼ਾਰਾ ਛੱਡ ਦਿੱਤਾ ਹੈ।<br><br>Key ਲੱਭੋ, ਨਵੀਂ Lumio Book Pro ਦਾ internal pre-order API ਖੋਲ੍ਹੋ, ਅਤੇ launch code ਪੜ੍ਹੋ। ਉਹੀ code flag ਹੈ।",
      hints: [
        "Website ਜਿੰਨਾ ਦਿਖਾਉਂਦੀ ਹੈ, browser ਨੂੰ ਉਸ ਤੋਂ ਵੱਧ ਭੇਜਦੀ ਹੈ। Page source ਖੋਲ੍ਹੋ (Ctrl+U, ਜਾਂ phone ਤੇ view-source:) ਅਤੇ ਉੱਪਰ ਦੇ comments ਪੜ੍ਹੋ।",
        "Comment ਇੱਕ JavaScript file ਵੱਲ ਇਸ਼ਾਰਾ ਕਰਦਾ ਹੈ। js/store.js ਨੂੰ browser ਵਿੱਚ ਸਿੱਧਾ ਖੋਲ੍ਹੋ ਅਤੇ config ਦੇਖੋ।",
        "store.js ਵਿੱਚ ਇੱਕ staging key ਅਤੇ ਇੱਕ internal API ਦਾ ਰਸਤਾ ਹੈ। Store ਦੇ address ਵਿੱਚ page?session=... ਦੀ ਥਾਂ ਉਹ ਰਸਤਾ ਲਗਾਓ, ਅਤੇ ?key= ਤੋਂ ਬਾਅਦ key ਪਾਓ।"
      ]
    },
    ta: {
      desc: "Lumio ஒரு புதிய laptop-ஐ launch செய்யப் போகிறது. அதன் online store அவசரமாக live ஆனது, developers launch-க்கு முன் செய்ய வேண்டிய சுத்தம் செய்வதை மறந்துவிட்டனர். அவர்கள் விட்டுச் சென்றதைக் கண்டுபிடித்து launch code-ஐ எடுங்கள்.",
      scenario: "Lumio laptops மற்றும் desktops-ஐ online-இல் விற்கிறது. Store முழுமையாக தயாராக இருப்பது போல் தெரிகிறது, ஆனால் launch-க்கு முன் கடைசி சுத்தம் செய்யப்படவில்லை. உங்கள் browser download செய்யும் files-இல் எங்கோ developers ஒரு staging key-யையும் ஒரு internal API பற்றிய குறிப்பையும் விட்டுச் சென்றுள்ளனர்.<br><br>Key-ஐ கண்டுபிடித்து, வெளிவராத Lumio Book Pro-வின் internal pre-order API-ஐ அழைத்து, launch code-ஐ படியுங்கள். அந்த code தான் flag.",
      hints: [
        "Website காட்டுவதை விட அதிகமாக உங்கள் browser-க்கு அனுப்புகிறது. Page source-ஐ திறந்து (Ctrl+U, அல்லது phone-இல் view-source:) மேலே உள்ள comments-ஐ படியுங்கள்.",
        "அந்த comment ஒரு JavaScript file-ஐ சுட்டிக்காட்டுகிறது. js/store.js-ஐ browser-இல் நேரடியாக திறந்து config-ஐ பாருங்கள்.",
        "store.js-இல் ஒரு staging key-யும் ஒரு internal API பாதையும் உள்ளன. Store address-இல் page?session=... இருக்கும் இடத்தில் அந்த பாதையை வைத்து, ?key= க்குப் பிறகு key-ஐ சேருங்கள்."
      ]
    },
    te: {
      desc: "Lumio ఒక కొత్త laptop‌ను launch చేయబోతోంది. దాని online store తొందరగా live అయింది, developers launch‌కు ముందు చేయాల్సిన శుభ్రతను మర్చిపోయారు. వారు వదిలేసినది కనుగొని launch code తీయండి.",
      scenario: "Lumio laptops, desktops‌ను online‌లో అమ్ముతుంది. Store పూర్తిగా సిద్ధంగా ఉన్నట్టు కనిపిస్తుంది, కానీ launch‌కు ముందు చివరి శుభ్రత జరగలేదు. మీ browser download చేసే files‌లో ఎక్కడో developers ఒక staging key‌ను, ఒక internal API గురించిన సూచనను వదిలేశారు.<br><br>Key‌ను కనుగొని, ఇంకా రాని Lumio Book Pro యొక్క internal pre-order API‌ను పిలిచి, launch code చదవండి. ఆ code నే flag.",
      hints: [
        "Website చూపించే దానికంటే ఎక్కువ మీ browser‌కు పంపుతుంది. Page source తెరిచి (Ctrl+U, లేదా phone‌లో view-source:) పైన ఉన్న comments చదవండి.",
        "ఆ comment ఒక JavaScript file వైపు సూచిస్తుంది. js/store.js‌ను browser‌లో నేరుగా తెరిచి config చూడండి.",
        "store.js‌లో ఒక staging key, ఒక internal API దారి ఉన్నాయి. Store address‌లో page?session=... ఉన్న చోట ఆ దారిని పెట్టి, ?key= తర్వాత key జోడించండి."
      ]
    },
    bn: {
      desc: "Lumio একটি নতুন laptop launch করতে চলেছে। তার online store তাড়াহুড়ো করে live হয়েছে আর developers launch-এর আগের পরিষ্কার করতে ভুলে গেছে। তারা যা রেখে গেছে তা খুঁজে launch code বের করুন।",
      scenario: "Lumio online-এ laptops আর desktops বিক্রি করে। Store দেখতে পুরো তৈরি মনে হয়, কিন্তু launch-এর আগে শেষ পরিষ্কার করা হয়নি। আপনার browser যে files download করে, তার কোথাও developers একটি staging key আর একটি internal API-এর ইঙ্গিত রেখে গেছে।<br><br>Key খুঁজুন, এখনও না আসা Lumio Book Pro-এর internal pre-order API খুলুন, আর launch code পড়ুন। সেই code-ই flag।",
      hints: [
        "Website যতটা দেখায়, browser-কে তার চেয়ে বেশি পাঠায়। Page source খুলুন (Ctrl+U, বা phone-এ view-source:) আর উপরের comments পড়ুন।",
        "Comment একটি JavaScript file-এর দিকে ইঙ্গিত করে। js/store.js browser-এ সরাসরি খুলে config দেখুন।",
        "store.js-এ একটি staging key আর একটি internal API-এর পথ আছে। Store-এর address-এ page?session=...-এর জায়গায় সেই পথ বসান, আর ?key=-এর পরে key দিন।"
      ]
    },
    mr: {
      desc: "Lumio एक नवीन laptop launch करणार आहे. त्याचे online store घाईत live झाले आणि developers launch आधीची साफसफाई विसरले. त्यांनी जे सोडले ते शोधा आणि launch code काढा.",
      scenario: "Lumio laptops आणि desktops online विकतो. Store दिसायला पूर्ण तयार वाटते, पण launch आधीची शेवटची साफसफाई झाली नाही. तुमचा browser ज्या files download करतो, त्यात कुठेतरी developers नी एक staging key आणि एका internal API चा इशारा सोडला आहे.<br><br>Key शोधा, अजून न आलेल्या Lumio Book Pro चा internal pre-order API उघडा, आणि launch code वाचा. तोच code flag आहे.",
      hints: [
        "Website जितकी दाखवते, त्यापेक्षा जास्त browser ला पाठवते. Page source उघडा (Ctrl+U, किंवा phone वर view-source:) आणि वरचे comments वाचा.",
        "Comment एका JavaScript file कडे इशारा करतो. js/store.js browser मध्ये थेट उघडा आणि config बघा.",
        "store.js मध्ये एक staging key आणि एका internal API चा रस्ता आहे. Store च्या address मध्ये page?session=... च्या जागी तो रस्ता लावा, आणि ?key= नंतर key टाका."
      ]
    }
  },
  'web-02': {
    en: {
      desc: 'NovaCorp Employee Portal blindly trusts its session cookies. A leaked employee account has been found. Can you escalate your privileges and access the Admin Control Panel?',
      hints: ['Check DevTools Application tab and inspect all cookies set after login.', 'One cookie is Base64 encoded JSON. Decode it with atob() in browser console.', 'The server checks more than one cookie. Changing only one triggers a security alert.']
    },
    hi: {
      desc: 'NovaCorp Employee Portal अपनी session cookies पर आंख बंद करके भरोसा करता है। एक leaked employee account मिल गया है। क्या आप अपनी privileges बढ़ाकर Admin Control Panel तक पहुंच सकते हैं?',
      hints: ['DevTools के Application tab में जाकर login के बाद set हुई सभी cookies चेक करो।', 'एक cookie Base64 encoded JSON है। ब्राउज़र console में atob() से decode करो।', 'Server एक से ज्यादा cookie चेक करता है। सिर्फ एक बदलने पर security alert आ जाता है।']
    },
    pa: {
      desc: 'NovaCorp Employee Portal ਆਪਣੀਆਂ session cookies ਤੇ ਅੱਖਾਂ ਬੰਦ ਕਰਕੇ ਭਰੋਸਾ ਕਰਦਾ ਹੈ। ਇੱਕ leaked employee account ਮਿਲ ਗਿਆ ਹੈ। ਕੀ ਤੁਸੀਂ ਆਪਣੀਆਂ privileges ਵਧਾ ਕੇ Admin Control Panel ਤੱਕ ਪਹੁੰਚ ਸਕਦੇ ਹੋ?',
      hints: ['DevTools ਦੇ Application tab ਵਿੱਚ ਜਾ ਕੇ login ਤੋਂ ਬਾਅਦ set ਹੋਈਆਂ ਸਾਰੀਆਂ cookies ਚੈੱਕ ਕਰੋ।', 'ਇੱਕ cookie Base64 encoded JSON ਹੈ। ਬ੍ਰਾਊਜ਼ਰ console ਵਿੱਚ atob() ਨਾਲ decode ਕਰੋ।', 'Server ਇੱਕ ਤੋਂ ਵੱਧ cookie ਚੈੱਕ ਕਰਦਾ ਹੈ। ਸਿਰਫ਼ ਇੱਕ ਬਦਲਣ ਤੇ security alert ਆ ਜਾਂਦਾ ਹੈ।']
    },
    ta: {
      desc: 'NovaCorp Employee Portal தனது session cookies-ஐ கண்மூடித்தனமாக நம்புகிறது. கசிந்த ஒரு பணியாளர் கணக்கு கண்டுபிடிக்கப்பட்டுள்ளது. உங்கள் அதிகாரங்களை உயர்த்தி Admin Control Panel-ஐ அணுக முடியுமா?',
      hints: ['DevTools-இன் Application tab-ஐ சரிபார்த்து login செய்த பிறகு அமைக்கப்பட்ட அனைத்து cookies-ஐயும் ஆராயுங்கள்.', 'ஒரு cookie Base64 encoded JSON ஆகும். பிரௌசர் console-இல் atob() மூலம் decode செய்யுங்கள்.', 'Server ஒன்றுக்கும் மேற்பட்ட cookie-ஐ சரிபார்க்கிறது. ஒன்றை மட்டும் மாற்றினால் security alert வரும்.']
    },
    te: {
      desc: 'NovaCorp Employee Portal తన session cookies‌ను గుడ్డిగా నమ్ముతుంది. లీక్ అయిన ఒక ఉద్యోగి ఖాతా దొరికింది. మీ అధికారాలను పెంచుకుని Admin Control Panel‌ను యాక్సెస్ చేయగలరా?',
      hints: ['DevTools లోని Application tab చెక్ చేసి login తర్వాత సెట్ అయిన అన్ని cookies‌ను పరిశీలించండి.', 'ఒక cookie Base64 encoded JSON. బ్రౌజర్ console లో atob() తో decode చేయండి.', 'Server ఒకటి కంటే ఎక్కువ cookie చెక్ చేస్తుంది. ఒక్కటి మాత్రమే మార్చితే security alert వస్తుంది.']
    },
    bn: {
      desc: 'NovaCorp Employee Portal তার session cookies-কে চোখ বুজে বিশ্বাস করে। একটি leaked employee account পাওয়া গেছে। আপনি কি আপনার প্রিভিলেজ বাড়িয়ে Admin Control Panel অ্যাক্সেস করতে পারবেন?',
      hints: ['DevTools-এর Application tab চেক করে লগইনের পর সেট হওয়া সব cookies পরীক্ষা করুন।', 'একটি cookie Base64 encoded JSON। ব্রাউজার consoleতে atob() দিয়ে decode করুন।', 'Server একটির বেশি cookie চেক করে। শুধু একটি বদলালে security alert আসে।']
    },
    mr: {
      desc: 'NovaCorp Employee Portal आपल्या session cookies वर डोळे झाकून विश्वास ठेवते. एक leaked employee account सापडले आहे. तुम्ही तुमचे अधिकार वाढवून Admin Control Panel मध्ये प्रवेश करू शकता का?',
      hints: ['DevTools च्या Application tab मध्ये जाऊन लॉगिन नंतर सेट झालेल्या सर्व cookies तपासा.', 'एक cookie Base64 encoded JSON आहे. ब्राउझर console मध्ये atob() ने decode करा.', 'Server एकापेक्षा जास्त cookie तपासते. फक्त एक बदलल्यास security alert येतो.']
    }
  },
  'web-03': {
    en: {
      desc: 'VaultBank Employee Portal has a vulnerable search feature. Extract the flag from a hidden database table using UNION-based SQL injection.',
      hints: ['Add a single quote to the search field to trigger a SQL error and confirm the injection point.', 'Use ORDER BY to count columns, then UNION SELECT NULL to find which column accepts strings.', 'Query information_schema.tables to find hidden tables, then extract data from vault_secrets.']
    },
    hi: {
      desc: 'VaultBank Employee Portal के search feature में vulnerability है। UNION-based SQL injection से hidden database table से flag निकालो।',
      hints: ['Search field में single quote डालकर SQL error trigger करो और injection point confirm करो।', 'ORDER BY से columns count करो, फिर UNION SELECT NULL से देखो कौन सा column strings accept करता है।', 'information_schema.tables query करके hidden tables ढूंढो, फिर vault_secrets से data निकालो।']
    },
    pa: {
      desc: 'VaultBank Employee Portal ਦੇ search feature ਵਿੱਚ vulnerability ਹੈ। UNION-based SQL injection ਨਾਲ hidden database table ਤੋਂ flag ਕੱਢੋ।',
      hints: ['Search field ਵਿੱਚ single quote ਪਾ ਕੇ SQL error trigger ਕਰੋ ਅਤੇ injection point confirm ਕਰੋ।', 'ORDER BY ਨਾਲ columns count ਕਰੋ, ਫਿਰ UNION SELECT NULL ਨਾਲ ਦੇਖੋ ਕਿਹੜਾ column strings accept ਕਰਦਾ ਹੈ।', 'information_schema.tables query ਕਰਕੇ hidden tables ਲੱਭੋ, ਫਿਰ vault_secrets ਤੋਂ data ਕੱਢੋ।']
    },
    ta: {
      desc: 'VaultBank Employee Portal-இன் search feature-இல் ஒரு பாதிப்பு உள்ளது. UNION-அடிப்படையிலான SQL injection மூலம் மறைக்கப்பட்ட database table-இலிருந்து flag-ஐ எடுங்கள்.',
      hints: ['Search field-இல் ஒரு single quote சேர்த்து SQL error-ஐ ஏற்படுத்தி injection point-ஐ உறுதிப்படுத்துங்கள்.', 'ORDER BY பயன்படுத்தி columns-ஐ எண்ணுங்கள், பின் UNION SELECT NULL மூலம் எந்த column strings ஏற்கும் என்று கண்டறியுங்கள்.', 'information_schema.tables-ஐ query செய்து மறைக்கப்பட்ட tables-ஐ கண்டறிந்து, vault_secrets-இலிருந்து தரவை எடுங்கள்.']
    },
    te: {
      desc: 'VaultBank Employee Portal యొక్క search feature‌లో ఒక లోపం ఉంది. UNION-ఆధారిత SQL injection ఉపయోగించి దాచిన database table నుండి flag‌ను తీసుకోండి.',
      hints: ['Search field‌లో ఒక single quote చేర్చి SQL error ట్రిగ్గర్ చేసి injection point నిర్ధారించండి.', 'ORDER BY ఉపయోగించి columns లెక్కించండి, తర్వాత UNION SELECT NULL ద్వారా ఏ column strings అంగీకరిస్తుందో కనుగొనండి.', 'information_schema.tables క్వరీ చేసి దాచిన tables కనుగొని, తర్వాత vault_secrets నుండి డేటా తీసుకోండి.']
    },
    bn: {
      desc: 'VaultBank Employee Portal-এর search feature-এ একটি দুর্বলতা আছে। UNION-ভিত্তিক SQL injection দিয়ে লুকানো database table থেকে flag বের করুন।',
      hints: ['Search field-এ একটি single quote দিয়ে SQL error trigger করুন এবং injection point নিশ্চিত করুন।', 'ORDER BY দিয়ে columns গুনুন, তারপর UNION SELECT NULL দিয়ে দেখুন কোন column strings গ্রহণ করে।', 'information_schema.tables query করে লুকানো tables খুঁজুন, তারপর vault_secrets থেকে ডেটা বের করুন।']
    },
    mr: {
      desc: 'VaultBank Employee Portal च्या search feature मध्ये एक त्रुटी आहे. UNION-आधारित SQL injection वापरून लपलेल्या database table मधून flag काढा.',
      hints: ['Search field मध्ये एक single quote टाकून SQL error ट्रिगर करा आणि injection point निश्चित करा.', 'ORDER BY वापरून columns मोजा, नंतर UNION SELECT NULL ने कोणता column strings स्वीकारतो ते शोधा.', 'information_schema.tables क्वेरी करून लपलेल्या tables शोधा, नंतर vault_secrets मधून डेटा काढा.']
    }
  },
  'web-04': {
    en: {
      desc: 'NexaCloud has misconfigured its crawler directives. The robots.txt file reveals hidden internal paths. One of them leads to a vault that holds the flag.',
      hints: ['Every website has a robots.txt at /robots.txt. Always check it during recon.', 'The Disallow entries list paths that are meant to stay hidden. Visit each one.', 'The vault needs a passcode. Check the page source of the homepage carefully.']
    },
    hi: {
      desc: 'NexaCloud ने अपने crawler directives गलत configure कर दिए हैं। robots.txt file छिपे हुए internal paths दिखा देती है। उनमें से एक vault तक ले जाता है जिसमें flag है।',
      hints: ['हर website के पास /robots.txt पर एक robots.txt होती है। recon के दौरान हमेशा चेक करो।', 'Disallow entries उन paths की list देती हैं जो छिपे रहने चाहिए। हर एक को visit करो।', 'Vault को एक passcode चाहिए। homepage का page source ध्यान से देखो।']
    },
    pa: {
      desc: 'NexaCloud ਨੇ ਆਪਣੇ crawler directives ਗਲਤ configure ਕਰ ਦਿੱਤੇ ਹਨ। robots.txt file ਛੁਪੇ internal paths ਦਿਖਾ ਦਿੰਦੀ ਹੈ। ਉਨ੍ਹਾਂ ਵਿੱਚੋਂ ਇੱਕ vault ਤੱਕ ਲੈ ਜਾਂਦਾ ਹੈ ਜਿਸ ਵਿੱਚ flag ਹੈ।',
      hints: ['ਹਰ website ਕੋਲ /robots.txt ਤੇ ਇੱਕ robots.txt ਹੁੰਦੀ ਹੈ। recon ਦੌਰਾਨ ਹਮੇਸ਼ਾ ਚੈੱਕ ਕਰੋ।', 'Disallow entries ਉਨ੍ਹਾਂ paths ਦੀ list ਦਿੰਦੀਆਂ ਹਨ ਜੋ ਛੁਪੇ ਰਹਿਣੇ ਚਾਹੀਦੇ ਹਨ। ਹਰ ਇੱਕ ਨੂੰ visit ਕਰੋ।', 'Vault ਨੂੰ ਇੱਕ passcode ਚਾਹੀਦਾ ਹੈ। homepage ਦਾ page source ਧਿਆਨ ਨਾਲ ਦੇਖੋ।']
    },
    ta: {
      desc: 'NexaCloud தனது crawler directives-ஐ தவறாக configure செய்துள்ளது. robots.txt கோப்பு மறைக்கப்பட்ட internal paths-ஐ வெளிப்படுத்துகிறது. அவற்றில் ஒன்று flag வைத்திருக்கும் vault-க்கு வழிவகுக்கிறது.',
      hints: ['ஒவ்வொரு வெப்சைட்டிற்கும் /robots.txt-இல் ஒரு robots.txt உள்ளது. recon செய்யும்போது எப்போதும் சரிபார்க்கவும்.', 'Disallow entries மறைந்திருக்க வேண்டிய paths-ஐ பட்டியலிடுகின்றன. ஒவ்வொன்றையும் சென்று பாருங்கள்.', 'Vault-க்கு ஒரு passcode தேவை. முகப்புப் பக்கத்தின் page source-ஐ கவனமாக பார்க்கவும்.']
    },
    te: {
      desc: 'NexaCloud తన crawler directives‌ను తప్పుగా కాన్ఫిగర్ చేసింది. robots.txt ఫైల్ దాచిన internal paths‌ను బహిర్గతం చేస్తుంది. వాటిలో ఒకటి flag ఉన్న vault‌కు దారితీస్తుంది.',
      hints: ['ప్రతి వెబ్‌సైట్‌కు /robots.txt వద్ద ఒక robots.txt ఉంటుంది. recon సమయంలో ఎల్లప్పుడూ చెక్ చేయండి.', 'Disallow entries దాచి ఉండాల్సిన paths జాబితాను ఇస్తాయి. ప్రతి దాన్ని సందర్శించండి.', 'Vault‌కు ఒక passcode అవసరం. హోమ్‌పేజీ page source‌ను జాగ్రత్తగా చూడండి.']
    },
    bn: {
      desc: 'NexaCloud তার crawler directives ভুলভাবে configure করেছে। robots.txt ফাইল লুকানো internal paths প্রকাশ করে। তার মধ্যে একটি একটি vault-এ নিয়ে যায় যেখানে flag আছে।',
      hints: ['প্রতিটি ওয়েবসাইটের /robots.txt-এ একটি robots.txt থাকে। recon করার সময় সবসময় চেক করুন।', 'Disallow entries সেই paths-এর তালিকা দেয় যা লুকিয়ে থাকার কথা। প্রতিটিতে যান।', 'Vault-এর একটি passcode প্রয়োজন। হোমপেজের page source মনোযোগ দিয়ে দেখুন।']
    },
    mr: {
      desc: 'NexaCloud ने आपले crawler directives चुकीचे कॉन्फिगर केले आहेत. robots.txt फाईल लपलेले internal paths उघड करते. त्यापैकी एक vault कडे घेऊन जातो ज्यात flag आहे.',
      hints: ['प्रत्येक वेबसाइटकडे /robots.txt वर एक robots.txt असते. recon करताना नेहमी तपासा.', 'Disallow entries त्या paths ची यादी देतात ज्या लपलेल्या असायला हव्या. प्रत्येकाला भेट द्या.', 'Vault ला एक passcode हवा आहे. होमपेजचा page source काळजीपूर्वक पाहा.']
    }
  },
  'for-02': {
    en: {
      desc: 'Someone shared an image on PixelDrop. The image looks normal but was flagged during a metadata review. Download it and extract the EXIF data to find the hidden flag.',
      hints: ['Image files store hidden data called EXIF metadata beyond just pixels.', 'Use exiftool or an online viewer like exifinfo.net to read all fields.', 'The flag is split across 4 fields. Find them all and figure out the correct order.']
    },
    hi: {
      desc: 'किसी ने PixelDrop पर एक image share की है। image normal लगती है लेकिन metadata review में flag हो गई थी। उसे download करो और EXIF data निकालकर hidden flag ढूंढो।',
      hints: ['Image files में pixels के अलावा EXIF metadata नाम का hidden data store होता है।', 'सारे fields पढ़ने के लिए exiftool या exifinfo.net जैसा online viewer use करो।', 'Flag 4 fields में बंटा हुआ है। सबको ढूंढो और सही order पता करो।']
    },
    pa: {
      desc: 'ਕਿਸੇ ਨੇ PixelDrop ਤੇ ਇੱਕ image share ਕੀਤੀ ਹੈ। image normal ਲੱਗਦੀ ਹੈ ਪਰ metadata review ਵਿੱਚ flag ਹੋ ਗਈ ਸੀ। ਉਸਨੂੰ download ਕਰੋ ਅਤੇ EXIF data ਕੱਢ ਕੇ hidden flag ਲੱਭੋ।',
      hints: ['Image files ਵਿੱਚ pixels ਤੋਂ ਇਲਾਵਾ EXIF metadata ਨਾਮ ਦਾ hidden data store ਹੁੰਦਾ ਹੈ।', 'ਸਾਰੇ fields ਪੜ੍ਹਨ ਲਈ exiftool ਜਾਂ exifinfo.net ਵਰਗਾ online viewer use ਕਰੋ।', 'Flag 4 fields ਵਿੱਚ ਵੰਡਿਆ ਹੋਇਆ ਹੈ। ਸਭ ਨੂੰ ਲੱਭੋ ਅਤੇ ਸਹੀ order ਪਤਾ ਕਰੋ।']
    },
    ta: {
      desc: 'யாரோ PixelDrop-இல் ஒரு படத்தை பகிர்ந்துள்ளனர். படம் சாதாரணமாக தோன்றுகிறது, ஆனால் metadata review-இல் flag செய்யப்பட்டது. அதை பதிவிறக்கி EXIF தரவை எடுத்து மறைக்கப்பட்ட flag-ஐ கண்டறியுங்கள்.',
      hints: ['Image கோப்புகள் pixels தாண்டி EXIF metadata எனப்படும் மறைக்கப்பட்ட தரவை சேமிக்கின்றன.', 'அனைத்து fields-ஐயும் படிக்க exiftool அல்லது exifinfo.net போன்ற online viewer-ஐ பயன்படுத்துங்கள்.', 'Flag 4 fields-களாக பிரிக்கப்பட்டுள்ளது. அனைத்தையும் கண்டறிந்து சரியான வரிசையை கண்டுபிடியுங்கள்.']
    },
    te: {
      desc: 'ఎవరో PixelDrop‌లో ఒక చిత్రాన్ని షేర్ చేశారు. చిత్రం సాధారణంగా అనిపిస్తుంది కానీ metadata review‌లో ఫ్లాగ్ చేయబడింది. దానిని డౌన్‌లోడ్ చేసి EXIF డేటాను తీసుకుని దాచిన flag‌ను కనుగొనండి.',
      hints: ['Image ఫైళ్లు pixels‌తో పాటు EXIF metadata అనే దాచిన డేటాను నిల్వ చేస్తాయి.', 'అన్ని fields చదవడానికి exiftool లేదా exifinfo.net వంటి online viewer ఉపయోగించండి.', 'Flag 4 fields‌లో విభజించబడింది. అన్నింటినీ కనుగొని సరైన క్రమాన్ని తెలుసుకోండి.']
    },
    bn: {
      desc: 'কেউ PixelDrop-এ একটি ছবি শেয়ার করেছে। ছবিটি স্বাভাবিক দেখায় কিন্তু metadata review-তে flag হয়ে গিয়েছিল। এটি ডাউনলোড করে EXIF ডেটা বের করে লুকানো flag খুঁজুন।',
      hints: ['Image ফাইলগুলো pixels ছাড়াও EXIF metadata নামক লুকানো ডেটা সংরক্ষণ করে।', 'সব fields পড়তে exiftool বা exifinfo.net-এর মতো online viewer ব্যবহার করুন।', 'Flag 4টি fields-এ বিভক্ত। সবগুলো খুঁজে সঠিক ক্রম বের করুন।']
    },
    mr: {
      desc: 'कोणीतरी PixelDrop वर एक इमेज शेअर केली आहे. इमेज सामान्य दिसते पण metadata review मध्ये ती flag झाली होती. ती डाउनलोड करा आणि EXIF डेटा काढून लपलेला flag शोधा.',
      hints: ['Image फाइल्समध्ये pixels शिवाय EXIF metadata नावाचा लपलेला डेटा साठवला जातो.', 'सर्व fields वाचण्यासाठी exiftool किंवा exifinfo.net सारखा online viewer वापरा.', 'Flag 4 fields मध्ये विभागलेला आहे. सर्व शोधा आणि योग्य क्रम शोधा.']
    }
  },
  'web-08': {
    hl: {
      desc: "Gharkart Indore ki ek chhoti online grocery store hai. Aapke paas ek normal customer account hai. Owner ne pichhle hafte ek order kiya tha, aur uski delivery note sirf delivery boy ke liye thi. Wahi note padho.",
      scenario: "Aap Gharkart par ek normal customer, Rahul, ke roop mein signed in ho. Apna koi ek order kholo aur kholte waqt web address ko dhyan se dekho.<br><br>Store owner ka bhi ek order hai, aur uski delivery note mein ek code hai jo aapko kabhi nahi dikhna chahiye tha. Wo order dhundho.",
      hints: [
        "Jab aap apna koi order kholte ho, to web address dekho. Uska aakhri hissa kya hai?",
        "Address mein order number bas ek number hai. Use thoda aage-peeche badal kar page dobara load karo.",
        "Site number dekh kar koi bhi order dikha deti hai, chahe wo aapka na ho. Apne order ke aas-paas ke number ek-ek karke dekho jab tak store owner ka order na mil jaye, phir uski delivery note padho."
      ]
    },
    en: {
      desc: "Gharkart is a small online grocery store in Indore. You have a normal customer account. The owner placed an order last week, and its delivery note was meant for the delivery boy only. Read that note.",
      scenario: "You are signed in to Gharkart as a regular customer, Rahul. Open one of your own orders and look closely at the web address while you do it.<br><br>The store owner has an order too, and its delivery note holds a code you were never meant to see. Find that order.",
      hints: [
        "When you open one of your own orders, watch the web address. What is the last part of it?",
        "The order number in the address is just a number. Try changing it to a nearby one and load the page again.",
        "The site shows any order you ask for by number, even one that is not yours. Walk the numbers near your own until you find the store owner's order, and read its delivery note."
      ]
    },
    hi: {
      desc: "Gharkart Indore की एक छोटी online grocery store है। आपके पास एक normal customer account है। Owner ने पिछले हफ्ते एक order किया था, और उसकी delivery note सिर्फ delivery boy के लिए थी। वही note पढ़ो।",
      scenario: "आप Gharkart पर एक normal customer, Rahul, के रूप में signed in हो। अपना कोई एक order खोलो और खोलते वक्त web address को ध्यान से देखो।<br><br>Store owner का भी एक order है, और उसकी delivery note में एक code है जो आपको कभी नहीं दिखना चाहिए था। वो order ढूंढो।",
      hints: [
        "जब आप अपना कोई order खोलते हो, तो web address देखो। उसका आखिरी हिस्सा क्या है?",
        "Address में order number बस एक number है। उसे थोड़ा आगे-पीछे बदल कर page दोबारा load करो।",
        "Site number देखकर कोई भी order दिखा देती है, चाहे वो आपका न हो। अपने order के आस-पास के number एक-एक करके देखो जब तक store owner का order न मिल जाए, फिर उसकी delivery note पढ़ो।"
      ]
    },
    pa: {
      desc: "Gharkart Indore ਦੀ ਇੱਕ ਛੋਟੀ online grocery store ਹੈ। ਤੁਹਾਡੇ ਕੋਲ ਇੱਕ normal customer account ਹੈ। Owner ਨੇ ਪਿਛਲੇ ਹਫ਼ਤੇ ਇੱਕ order ਕੀਤਾ ਸੀ, ਅਤੇ ਉਸਦੀ delivery note ਸਿਰਫ਼ delivery boy ਲਈ ਸੀ। ਉਹੀ note ਪੜ੍ਹੋ।",
      scenario: "ਤੁਸੀਂ Gharkart ਤੇ ਇੱਕ normal customer, Rahul, ਵਜੋਂ signed in ਹੋ। ਆਪਣਾ ਕੋਈ ਇੱਕ order ਖੋਲ੍ਹੋ ਅਤੇ ਖੋਲ੍ਹਦੇ ਵੇਲੇ web address ਨੂੰ ਧਿਆਨ ਨਾਲ ਦੇਖੋ।<br><br>Store owner ਦਾ ਵੀ ਇੱਕ order ਹੈ, ਅਤੇ ਉਸਦੀ delivery note ਵਿੱਚ ਇੱਕ code ਹੈ ਜੋ ਤੁਹਾਨੂੰ ਕਦੇ ਨਹੀਂ ਦਿਖਣਾ ਚਾਹੀਦਾ ਸੀ। ਉਹ order ਲੱਭੋ।",
      hints: [
        "ਜਦੋਂ ਤੁਸੀਂ ਆਪਣਾ ਕੋਈ order ਖੋਲ੍ਹਦੇ ਹੋ, ਤਾਂ web address ਦੇਖੋ। ਉਸਦਾ ਆਖਰੀ ਹਿੱਸਾ ਕੀ ਹੈ?",
        "Address ਵਿੱਚ order number ਬੱਸ ਇੱਕ number ਹੈ। ਉਸਨੂੰ ਥੋੜ੍ਹਾ ਅੱਗੇ-ਪਿੱਛੇ ਬਦਲ ਕੇ page ਦੁਬਾਰਾ load ਕਰੋ।",
        "Site number ਦੇਖ ਕੇ ਕੋਈ ਵੀ order ਦਿਖਾ ਦਿੰਦੀ ਹੈ, ਭਾਵੇਂ ਉਹ ਤੁਹਾਡਾ ਨਾ ਹੋਵੇ। ਆਪਣੇ order ਦੇ ਆਲੇ-ਦੁਆਲੇ ਦੇ number ਇੱਕ-ਇੱਕ ਕਰਕੇ ਦੇਖੋ ਜਦੋਂ ਤੱਕ store owner ਦਾ order ਨਾ ਮਿਲੇ, ਫਿਰ ਉਸਦੀ delivery note ਪੜ੍ਹੋ।"
      ]
    },
    ta: {
      desc: "Gharkart என்பது இந்தூரில் உள்ள ஒரு சிறிய online grocery store. உங்களிடம் ஒரு normal customer account உள்ளது. Owner கடந்த வாரம் ஒரு order செய்தார், அதன் delivery note delivery boy-க்கு மட்டுமே. அந்த note-ஐ படியுங்கள்.",
      scenario: "நீங்கள் Gharkart-இல் ஒரு சாதாரண customer, Rahul, ஆக signed in ஆகியுள்ளீர்கள். உங்கள் order ஒன்றைத் திறந்து, திறக்கும்போது web address-ஐ கவனமாகப் பாருங்கள்.<br><br>Store owner-க்கும் ஒரு order உள்ளது, அதன் delivery note-இல் நீங்கள் பார்க்கக் கூடாத ஒரு code உள்ளது. அந்த order-ஐக் கண்டறியுங்கள்.",
      hints: [
        "உங்கள் order ஒன்றைத் திறக்கும்போது, web address-ஐப் பாருங்கள். அதன் கடைசிப் பகுதி என்ன?",
        "Address-இல் உள்ள order number வெறும் ஒரு number. அதை அருகிலுள்ள ஒன்றாக மாற்றி page-ஐ மீண்டும் load செய்யுங்கள்.",
        "Site, number கொடுத்தால் எந்த order-ஐயும் காட்டும், அது உங்களுடையதாக இல்லாவிட்டாலும். உங்கள் order-க்கு அருகிலுள்ள number-களை ஒவ்வொன்றாகப் பாருங்கள், store owner-இன் order கிடைக்கும் வரை, பிறகு அதன் delivery note-ஐப் படியுங்கள்."
      ]
    },
    te: {
      desc: "Gharkart అనేది ఇండోర్‌లోని ఒక చిన్న online grocery store. మీకు ఒక normal customer account ఉంది. Owner గత వారం ఒక order చేశారు, దాని delivery note delivery boy కోసం మాత్రమే. ఆ note చదవండి.",
      scenario: "మీరు Gharkart‌లో ఒక సాధారణ customer, Rahul‌గా signed in అయ్యారు. మీ order ఒకదాన్ని తెరిచి, తెరుస్తున్నప్పుడు web address‌ను జాగ్రత్తగా చూడండి.<br><br>Store owner‌కు కూడా ఒక order ఉంది, దాని delivery note‌లో మీరు ఎప్పటికీ చూడకూడని ఒక code ఉంది. ఆ order‌ను కనుగొనండి.",
      hints: [
        "మీ order ఒకదాన్ని తెరిచినప్పుడు, web address చూడండి. దాని చివరి భాగం ఏమిటి?",
        "Address‌లోని order number కేవలం ఒక number. దాన్ని దగ్గరలోని దానికి మార్చి page‌ను మళ్ళీ load చేయండి.",
        "Site, number ఇస్తే ఏ order‌నైనా చూపిస్తుంది, అది మీది కాకపోయినా. మీ order దగ్గరలోని number‌లను ఒక్కొక్కటిగా చూడండి, store owner‌ order దొరికే వరకు, తర్వాత దాని delivery note చదవండి."
      ]
    },
    bn: {
      desc: "Gharkart হল ইন্দোরের একটি ছোট online grocery store। আপনার একটি normal customer account আছে। Owner গত সপ্তাহে একটি order করেছিলেন, এবং তার delivery note শুধু delivery boy-এর জন্য ছিল। সেই note পড়ুন।",
      scenario: "আপনি Gharkart-এ একজন সাধারণ customer, Rahul হিসেবে signed in আছেন। আপনার নিজের একটি order খুলুন এবং খোলার সময় web address মনোযোগ দিয়ে দেখুন।<br><br>Store owner-এরও একটি order আছে, এবং তার delivery note-এ একটি code আছে যা আপনার কখনও দেখার কথা ছিল না। সেই order খুঁজুন।",
      hints: [
        "আপনি যখন নিজের একটি order খোলেন, তখন web address দেখুন। তার শেষ অংশটি কী?",
        "Address-এ order number শুধু একটি number। এটি কাছাকাছি একটিতে পরিবর্তন করে page আবার load করুন।",
        "Site number দিয়ে যেকোনো order দেখায়, এমনকি যেটি আপনার নয়। আপনার order-এর কাছাকাছি number একটি একটি করে দেখুন যতক্ষণ না store owner-এর order পান, তারপর তার delivery note পড়ুন।"
      ]
    },
    mr: {
      desc: "Gharkart हे इंदूरमधील एक छोटे online grocery store आहे. तुमच्याकडे एक normal customer account आहे. Owner ने गेल्या आठवड्यात एक order केली होती, आणि तिची delivery note फक्त delivery boy साठी होती. तीच note वाचा.",
      scenario: "तुम्ही Gharkart वर एक normal customer, Rahul म्हणून signed in आहात. तुमची एखादी order उघडा आणि उघडताना web address काळजीपूर्वक बघा.<br><br>Store owner ची पण एक order आहे, आणि तिच्या delivery note मध्ये एक code आहे जो तुम्हाला कधीच दिसायला नको होता. ती order शोधा.",
      hints: [
        "जेव्हा तुम्ही तुमची एखादी order उघडता, तेव्हा web address बघा. त्याचा शेवटचा भाग काय आहे?",
        "Address मधील order number फक्त एक number आहे. तो जवळच्या एका number मध्ये बदलून page पुन्हा load करा.",
        "Site number बघून कोणतीही order दाखवते, जरी ती तुमची नसली तरी. तुमच्या order च्या जवळचे number एक-एक करून बघा जोपर्यंत store owner ची order मिळत नाही, मग तिची delivery note वाचा."
      ]
    }
  },
  'for-04': {
    hl: {
      desc: "Kal raat Paynova ke IDS ne ek VPN server par bahut saare failed SSH logins dekhe, aur phir ek login jo theek nahi lagta. Aapke paas server ki auth.log hai. Pata karo ki andar kaun ghusa.",
      scenario: "Aap Paynova SOC mein night shift ke analyst ho. Server vpn-gw01 ka ek case khula hai, aur uski auth.log hi saboot hai. Ise ek analyst ki tarah padho: kaun se IP fail hue, aur kya unme se koi andar aa gaya?<br><br>Incident report mein teen cheezein bharo: attacker ka IP, jo account toda gaya, aur us login ka exact time. Teeno sahi hone par case close hoga aur flag milega.",
      hints: [
        "Shuru \"Failed password\" wali lines se karo. Kaun se IP baar baar aa rahe hain?",
        "Sabse zyada fail hone wala IP hamesha andar nahi aaya hota. \"Accepted\" wali lines bhi dekho.",
        "Attacker wo bahar ka IP hai jiski failed lines ke baad ek \"Accepted password\" line aati hai. Usi line mein account aur time dono mil jayenge."
      ]
    },
    en: {
      desc: "Last night Paynova's IDS saw a big burst of failed SSH logins on a VPN server, and then one login that looks wrong. You have the server's auth.log. Find out who got in.",
      scenario: "You are the analyst on the night shift in the Paynova SOC. A case is open for the server vpn-gw01, and its auth.log is the evidence. Read it like an analyst: which IPs failed, and did any of them get in?<br><br>File the incident report with three things: the attacker's IP, the account they broke into, and the exact time of that login. When all three are right, the case closes and you get the flag.",
      hints: [
        "Start with the \"Failed password\" lines. Which IPs show up again and again?",
        "The IP with the most failures did not always get in. Check the \"Accepted\" lines too.",
        "The attacker is the outside IP whose run of failures ends in an \"Accepted password\" line. That one line gives you the account and the time."
      ]
    },
    hi: {
      desc: "कल रात Paynova के IDS ने एक VPN server पर बहुत सारे failed SSH logins देखे, और फिर एक login जो ठीक नहीं लगता। आपके पास server की auth.log है। पता करो कि अंदर कौन घुसा।",
      scenario: "आप Paynova SOC में night shift के analyst हो। Server vpn-gw01 का एक case खुला है, और उसकी auth.log ही सबूत है। इसे एक analyst की तरह पढ़ो: कौन से IP fail हुए, और क्या उनमें से कोई अंदर आ गया?<br><br>Incident report में तीन चीज़ें भरो: attacker का IP, जो account तोड़ा गया, और उस login का exact time। तीनों सही होने पर case close होगा और flag मिलेगा।",
      hints: [
        "शुरुआत \"Failed password\" वाली lines से करो। कौन से IP बार बार आ रहे हैं?",
        "सबसे ज़्यादा fail होने वाला IP हमेशा अंदर नहीं आया होता। \"Accepted\" वाली lines भी देखो।",
        "Attacker वो बाहर का IP है जिसकी failed lines के बाद एक \"Accepted password\" line आती है। उसी line में account और time दोनों मिल जाएंगे।"
      ]
    },
    pa: {
      desc: "ਕੱਲ੍ਹ ਰਾਤ Paynova ਦੇ IDS ਨੇ ਇੱਕ VPN server ਤੇ ਬਹੁਤ ਸਾਰੇ failed SSH logins ਦੇਖੇ, ਅਤੇ ਫਿਰ ਇੱਕ login ਜੋ ਠੀਕ ਨਹੀਂ ਲੱਗਦਾ। ਤੁਹਾਡੇ ਕੋਲ server ਦੀ auth.log ਹੈ। ਪਤਾ ਕਰੋ ਕਿ ਅੰਦਰ ਕੌਣ ਵੜਿਆ।",
      scenario: "ਤੁਸੀਂ Paynova SOC ਵਿੱਚ night shift ਦੇ analyst ਹੋ। Server vpn-gw01 ਦਾ ਇੱਕ case ਖੁੱਲ੍ਹਾ ਹੈ, ਅਤੇ ਉਸਦੀ auth.log ਹੀ ਸਬੂਤ ਹੈ। ਇਸਨੂੰ ਇੱਕ analyst ਵਾਂਗ ਪੜ੍ਹੋ: ਕਿਹੜੇ IP fail ਹੋਏ, ਅਤੇ ਕੀ ਉਹਨਾਂ ਵਿੱਚੋਂ ਕੋਈ ਅੰਦਰ ਆ ਗਿਆ?<br><br>Incident report ਵਿੱਚ ਤਿੰਨ ਚੀਜ਼ਾਂ ਭਰੋ: attacker ਦਾ IP, ਜੋ account ਤੋੜਿਆ ਗਿਆ, ਅਤੇ ਉਸ login ਦਾ exact time। ਤਿੰਨੇ ਸਹੀ ਹੋਣ ਤੇ case close ਹੋਵੇਗਾ ਅਤੇ flag ਮਿਲੇਗਾ।",
      hints: [
        "ਸ਼ੁਰੂਆਤ \"Failed password\" ਵਾਲੀਆਂ lines ਤੋਂ ਕਰੋ। ਕਿਹੜੇ IP ਵਾਰ ਵਾਰ ਆ ਰਹੇ ਹਨ?",
        "ਸਭ ਤੋਂ ਵੱਧ fail ਹੋਣ ਵਾਲਾ IP ਹਮੇਸ਼ਾ ਅੰਦਰ ਨਹੀਂ ਆਇਆ ਹੁੰਦਾ। \"Accepted\" ਵਾਲੀਆਂ lines ਵੀ ਦੇਖੋ।",
        "Attacker ਉਹ ਬਾਹਰ ਦਾ IP ਹੈ ਜਿਸਦੀਆਂ failed lines ਤੋਂ ਬਾਅਦ ਇੱਕ \"Accepted password\" line ਆਉਂਦੀ ਹੈ। ਉਸੇ line ਵਿੱਚ account ਅਤੇ time ਦੋਵੇਂ ਮਿਲ ਜਾਣਗੇ।"
      ]
    },
    ta: {
      desc: "நேற்று இரவு Paynova-வின் IDS ஒரு VPN server-இல் நிறைய failed SSH logins-ஐயும், பிறகு சரியாகத் தெரியாத ஒரு login-ஐயும் கண்டது. உங்களிடம் server-இன் auth.log உள்ளது. உள்ளே யார் நுழைந்தார்கள் என்று கண்டறியுங்கள்.",
      scenario: "நீங்கள் Paynova SOC-இல் night shift analyst. Server vpn-gw01-க்கு ஒரு case திறந்துள்ளது, அதன் auth.log தான் ஆதாரம். அதை ஒரு analyst போல படியுங்கள்: எந்த IP-கள் fail ஆயின, அவற்றில் ஏதாவது உள்ளே வந்ததா?<br><br>Incident report-இல் மூன்று விஷயங்களை நிரப்புங்கள்: attacker-இன் IP, உடைக்கப்பட்ட account, அந்த login-இன் சரியான time. மூன்றும் சரியானால் case close ஆகும், flag கிடைக்கும்.",
      hints: [
        "\"Failed password\" lines-இலிருந்து தொடங்குங்கள். எந்த IP-கள் மீண்டும் மீண்டும் வருகின்றன?",
        "அதிகமாக fail ஆன IP எப்போதும் உள்ளே வந்திருக்காது. \"Accepted\" lines-ஐயும் பாருங்கள்.",
        "Attacker என்பது failed lines-க்குப் பிறகு ஒரு \"Accepted password\" line வரும் வெளி IP. அந்த ஒரே line-இல் account-உம் time-உம் கிடைக்கும்."
      ]
    },
    te: {
      desc: "నిన్న రాత్రి Paynova IDS ఒక VPN server‌పై చాలా failed SSH logins‌ను, తర్వాత సరిగ్గా అనిపించని ఒక login‌ను చూసింది. మీ దగ్గర server యొక్క auth.log ఉంది. లోపలికి ఎవరు వచ్చారో కనుగొనండి.",
      scenario: "మీరు Paynova SOC‌లో night shift analyst. Server vpn-gw01 కోసం ఒక case తెరిచి ఉంది, దాని auth.log నే సాక్ష్యం. దాన్ని ఒక analyst లాగా చదవండి: ఏ IP‌లు fail అయ్యాయి, వాటిలో ఏదైనా లోపలికి వచ్చిందా?<br><br>Incident report‌లో మూడు విషయాలు నింపండి: attacker IP, విరగ్గొట్టిన account, ఆ login యొక్క exact time. మూడూ సరైతే case close అవుతుంది, flag వస్తుంది.",
      hints: [
        "\"Failed password\" lines‌తో మొదలుపెట్టండి. ఏ IP‌లు మళ్ళీ మళ్ళీ వస్తున్నాయి?",
        "ఎక్కువగా fail అయిన IP ఎప్పుడూ లోపలికి వచ్చి ఉండదు. \"Accepted\" lines కూడా చూడండి.",
        "Attacker అంటే failed lines తర్వాత ఒక \"Accepted password\" line వచ్చే బయటి IP. ఆ ఒక్క line‌లోనే account, time రెండూ దొరుకుతాయి."
      ]
    },
    bn: {
      desc: "গত রাতে Paynova-র IDS একটি VPN server-এ অনেক failed SSH logins দেখেছে, তারপর একটি login যা ঠিক মনে হচ্ছে না। আপনার কাছে server-এর auth.log আছে। ভেতরে কে ঢুকেছে খুঁজে বের করুন।",
      scenario: "আপনি Paynova SOC-এ night shift-এর analyst। Server vpn-gw01-এর জন্য একটি case খোলা আছে, আর তার auth.log-ই প্রমাণ। এটি একজন analyst-এর মতো পড়ুন: কোন IP-গুলো fail করেছে, আর তাদের মধ্যে কেউ কি ভেতরে ঢুকেছে?<br><br>Incident report-এ তিনটি জিনিস লিখুন: attacker-এর IP, যে account ভাঙা হয়েছে, আর সেই login-এর exact time। তিনটিই সঠিক হলে case close হবে আর flag পাবেন।",
      hints: [
        "\"Failed password\" lines দিয়ে শুরু করুন। কোন IP-গুলো বারবার আসছে?",
        "সবচেয়ে বেশি fail করা IP সবসময় ভেতরে ঢোকেনি। \"Accepted\" lines-ও দেখুন।",
        "Attacker হল সেই বাইরের IP যার failed lines-এর পরে একটি \"Accepted password\" line আসে। সেই line-এই account আর time দুটোই পাবেন।"
      ]
    },
    mr: {
      desc: "काल रात्री Paynova च्या IDS ने एका VPN server वर खूप failed SSH logins पाहिले, आणि मग एक login जो बरोबर वाटत नाही. तुमच्याकडे server ची auth.log आहे. आत कोण घुसले ते शोधा.",
      scenario: "तुम्ही Paynova SOC मध्ये night shift चे analyst आहात. Server vpn-gw01 साठी एक case उघडलेली आहे, आणि तिची auth.log हाच पुरावा आहे. ती एका analyst सारखी वाचा: कोणते IP fail झाले, आणि त्यापैकी कोणी आत आले का?<br><br>Incident report मध्ये तीन गोष्टी भरा: attacker चा IP, तोडलेले account, आणि त्या login चा exact time. तिन्ही बरोबर असल्यास case close होईल आणि flag मिळेल.",
      hints: [
        "\"Failed password\" lines पासून सुरुवात करा. कोणते IP पुन्हा पुन्हा येत आहेत?",
        "सर्वात जास्त fail झालेला IP नेहमी आत आलेला नसतो. \"Accepted\" lines पण बघा.",
        "Attacker म्हणजे तो बाहेरचा IP ज्याच्या failed lines नंतर एक \"Accepted password\" line येते. त्याच line मध्ये account आणि time दोन्ही मिळतील."
      ]
    }
  },
  'ai-02': {
    hl: {
      desc: "Kaveri Valley Institute of Technology ne apne student portal par ek AI assistant lagaya hai. Ye aapke sawaal ko database query mein badalta hai, aur portal jo bhi query ye likhe, chala deta hai. End-sem papers bhi usi database mein hain.",
      scenario: "Aap Rohan Mehta ho, KVIT mein B.Tech second year ke student. CampusDesk portal ka naya KVIT Assistant aapki attendance, marks aur fees ke sawaalon ka jawab ek SQL query likh kar deta hai, aur portal wo query college ke database par chala deta hai.<br><br>Assistant ko bola gaya hai ki students ko sirf unka apna data dikhaye. Uski likhi queries koi check nahi karta. Usi database mein kahin end-sem papers ke unlock codes hain. DBMS wala code nikalo.",
      hints: [
        "Assistant jo bhi query likhta hai, portal use bina check kiye chala deta hai. Kisi jawab ke neeche \"Query used\" kholo. Kya database mein sirf aapka hi data hai?",
        "SQLite mein saari tables ki list sqlite_master naam ki table mein hoti hai. Assistant se uspar query likhwao.",
        "Assistant ki suraksha sirf uske instructions hain. Dashboard ke notices padho: ye assistant aur kaun use karta hai, aur unke liye ye kya karta hai? Phir exact query maango jo aapko chahiye."
      ]
    },
    en: {
      desc: "Kaveri Valley Institute of Technology added an AI assistant to its student portal. It turns your questions into database queries, and the portal runs whatever it writes. The end-sem papers live in the same database.",
      scenario: "You are Rohan Mehta, a second-year B.Tech student at KVIT. The new KVIT Assistant on the CampusDesk portal answers questions about your attendance, marks and fees by writing a SQL query, which the portal runs on the college database.<br><br>The assistant has been told to show students only their own records. Nobody checks the queries it writes. Somewhere in that database are the unlock codes for the end-sem papers. Get the one for DBMS.",
      hints: [
        "The portal runs every query the assistant writes, without checking it. Open \"Query used\" under an answer. Is your own data the only thing in that database?",
        "In SQLite, the list of every table is kept in a table called sqlite_master. Get the assistant to write a query on it.",
        "The assistant's only protection is its instructions. Read the notices on the dashboard: who else uses this assistant, and what will it do for them? Then ask for the exact query you want."
      ]
    },
    hi: {
      desc: "Kaveri Valley Institute of Technology ने अपने student portal पर एक AI assistant लगाया है। ये आपके सवाल को database query में बदलता है, और portal जो भी query ये लिखे, चला देता है। End-sem papers भी उसी database में हैं।",
      scenario: "आप Rohan Mehta हो, KVIT में B.Tech second year के student. CampusDesk portal का नया KVIT Assistant आपकी attendance, marks और fees के सवालों का जवाब एक SQL query लिखकर देता है, और portal वो query college के database पर चला देता है।<br><br>Assistant को बोला गया है कि students को सिर्फ उनका अपना data दिखाए। उसकी लिखी queries कोई check नहीं करता। उसी database में कहीं end-sem papers के unlock codes हैं। DBMS वाला code निकालो।",
      hints: [
        "Assistant जो भी query लिखता है, portal उसे बिना check किए चला देता है। किसी जवाब के नीचे \"Query used\" खोलो। क्या database में सिर्फ आपका ही data है?",
        "SQLite में सारी tables की list sqlite_master नाम की table में होती है। Assistant से उस पर query लिखवाओ।",
        "Assistant की सुरक्षा सिर्फ उसके instructions हैं। Dashboard के notices पढ़ो: ये assistant और कौन use करता है, और उनके लिए ये क्या करता है? फिर exact query मांगो जो आपको चाहिए।"
      ]
    },
    pa: {
      desc: "Kaveri Valley Institute of Technology ਨੇ ਆਪਣੇ student portal ਤੇ ਇੱਕ AI assistant ਲਗਾਇਆ ਹੈ। ਇਹ ਤੁਹਾਡੇ ਸਵਾਲ ਨੂੰ database query ਵਿੱਚ ਬਦਲਦਾ ਹੈ, ਅਤੇ portal ਜੋ ਵੀ query ਇਹ ਲਿਖੇ, ਚਲਾ ਦਿੰਦਾ ਹੈ। End-sem papers ਵੀ ਉਸੇ database ਵਿੱਚ ਹਨ।",
      scenario: "ਤੁਸੀਂ Rohan Mehta ਹੋ, KVIT ਵਿੱਚ B.Tech second year ਦੇ student. CampusDesk portal ਦਾ ਨਵਾਂ KVIT Assistant ਤੁਹਾਡੀ attendance, marks ਅਤੇ fees ਦੇ ਸਵਾਲਾਂ ਦਾ ਜਵਾਬ ਇੱਕ SQL query ਲਿਖ ਕੇ ਦਿੰਦਾ ਹੈ, ਅਤੇ portal ਉਹ query college ਦੇ database ਤੇ ਚਲਾ ਦਿੰਦਾ ਹੈ।<br><br>Assistant ਨੂੰ ਕਿਹਾ ਗਿਆ ਹੈ ਕਿ students ਨੂੰ ਸਿਰਫ਼ ਉਹਨਾਂ ਦਾ ਆਪਣਾ data ਦਿਖਾਏ। ਉਸਦੀਆਂ ਲਿਖੀਆਂ queries ਕੋਈ check ਨਹੀਂ ਕਰਦਾ। ਉਸੇ database ਵਿੱਚ ਕਿਤੇ end-sem papers ਦੇ unlock codes ਹਨ। DBMS ਵਾਲਾ code ਕੱਢੋ।",
      hints: [
        "Assistant ਜੋ ਵੀ query ਲਿਖਦਾ ਹੈ, portal ਉਸਨੂੰ ਬਿਨਾਂ check ਕੀਤੇ ਚਲਾ ਦਿੰਦਾ ਹੈ। ਕਿਸੇ ਜਵਾਬ ਦੇ ਹੇਠਾਂ \"Query used\" ਖੋਲ੍ਹੋ। ਕੀ database ਵਿੱਚ ਸਿਰਫ਼ ਤੁਹਾਡਾ ਹੀ data ਹੈ?",
        "SQLite ਵਿੱਚ ਸਾਰੀਆਂ tables ਦੀ list sqlite_master ਨਾਮ ਦੀ table ਵਿੱਚ ਹੁੰਦੀ ਹੈ। Assistant ਤੋਂ ਉਸ ਤੇ query ਲਿਖਵਾਓ।",
        "Assistant ਦੀ ਸੁਰੱਖਿਆ ਸਿਰਫ਼ ਉਸਦੇ instructions ਹਨ। Dashboard ਦੇ notices ਪੜ੍ਹੋ: ਇਹ assistant ਹੋਰ ਕੌਣ use ਕਰਦਾ ਹੈ, ਅਤੇ ਉਹਨਾਂ ਲਈ ਇਹ ਕੀ ਕਰਦਾ ਹੈ? ਫਿਰ exact query ਮੰਗੋ ਜੋ ਤੁਹਾਨੂੰ ਚਾਹੀਦੀ ਹੈ।"
      ]
    },
    ta: {
      desc: "Kaveri Valley Institute of Technology தனது student portal-இல் ஒரு AI assistant-ஐ சேர்த்துள்ளது. அது உங்கள் கேள்விகளை database query-களாக மாற்றுகிறது, அது எழுதும் எந்த query-ஐயும் portal இயக்கிவிடுகிறது. End-sem papers-உம் அதே database-இல் உள்ளன.",
      scenario: "நீங்கள் Rohan Mehta, KVIT-இல் B.Tech இரண்டாம் ஆண்டு மாணவர். CampusDesk portal-இன் புதிய KVIT Assistant உங்கள் attendance, marks, fees பற்றிய கேள்விகளுக்கு ஒரு SQL query எழுதி பதில் தருகிறது, அந்த query-ஐ portal college database-இல் இயக்குகிறது.<br><br>மாணவர்களுக்கு அவர்களுடைய data-வை மட்டும் காட்டும்படி assistant-க்கு சொல்லப்பட்டுள்ளது. அது எழுதும் query-களை யாரும் சரிபார்ப்பதில்லை. அதே database-இல் எங்கோ end-sem papers-இன் unlock codes உள்ளன. DBMS code-ஐ எடுங்கள்.",
      hints: [
        "Assistant எழுதும் ஒவ்வொரு query-ஐயும் portal சரிபார்க்காமல் இயக்குகிறது. ஒரு பதிலுக்குக் கீழே \"Query used\"-ஐ திறங்கள். Database-இல் உங்கள் data மட்டும் தான் உள்ளதா?",
        "SQLite-இல் எல்லா tables-இன் பட்டியலும் sqlite_master என்ற table-இல் இருக்கும். அதன் மீது ஒரு query எழுதும்படி assistant-ஐ செய்யுங்கள்.",
        "Assistant-இன் ஒரே பாதுகாப்பு அதன் instructions தான். Dashboard-இல் உள்ள notices-ஐ படியுங்கள்: இந்த assistant-ஐ வேறு யார் பயன்படுத்துகிறார்கள், அவர்களுக்கு அது என்ன செய்யும்? பிறகு உங்களுக்கு வேண்டிய சரியான query-ஐ கேளுங்கள்."
      ]
    },
    te: {
      desc: "Kaveri Valley Institute of Technology తన student portal‌లో ఒక AI assistant‌ను పెట్టింది. అది మీ ప్రశ్నలను database query‌లుగా మారుస్తుంది, అది రాసే ఏ query‌నైనా portal నడిపిస్తుంది. End-sem papers కూడా అదే database‌లో ఉన్నాయి.",
      scenario: "మీరు Rohan Mehta, KVIT‌లో B.Tech రెండో సంవత్సరం విద్యార్థి. CampusDesk portal‌లోని కొత్త KVIT Assistant మీ attendance, marks, fees గురించిన ప్రశ్నలకు ఒక SQL query రాసి జవాబిస్తుంది, ఆ query‌ను portal college database‌పై నడిపిస్తుంది.<br><br>విద్యార్థులకు వారి సొంత data మాత్రమే చూపించమని assistant‌కు చెప్పారు. అది రాసే queries‌ను ఎవరూ check చేయరు. అదే database‌లో ఎక్కడో end-sem papers unlock codes ఉన్నాయి. DBMS code‌ను తీయండి.",
      hints: [
        "Assistant రాసే ప్రతి query‌ను portal check చేయకుండా నడిపిస్తుంది. ఒక జవాబు కింద \"Query used\" తెరవండి. Database‌లో మీ data మాత్రమే ఉందా?",
        "SQLite‌లో అన్ని tables జాబితా sqlite_master అనే table‌లో ఉంటుంది. దానిపై ఒక query రాయమని assistant‌కు చెప్పండి.",
        "Assistant‌కు ఉన్న రక్షణ దాని instructions మాత్రమే. Dashboard‌లోని notices చదవండి: ఈ assistant‌ను ఇంకా ఎవరు వాడతారు, వారి కోసం ఇది ఏం చేస్తుంది? తర్వాత మీకు కావలసిన exact query అడగండి."
      ]
    },
    bn: {
      desc: "Kaveri Valley Institute of Technology তাদের student portal-এ একটি AI assistant যোগ করেছে। এটি আপনার প্রশ্নকে database query-তে বদলে দেয়, আর portal এটি যা লেখে তাই চালিয়ে দেয়। End-sem papers-ও সেই একই database-এ আছে।",
      scenario: "আপনি Rohan Mehta, KVIT-এর B.Tech দ্বিতীয় বর্ষের ছাত্র। CampusDesk portal-এর নতুন KVIT Assistant আপনার attendance, marks আর fees-এর প্রশ্নের উত্তর একটি SQL query লিখে দেয়, আর portal সেই query college-এর database-এ চালায়।<br><br>Assistant-কে বলা হয়েছে students-দের শুধু তাদের নিজেদের data দেখাতে। এর লেখা queries কেউ check করে না। সেই database-এর কোথাও end-sem papers-এর unlock codes আছে। DBMS-এর code বের করুন।",
      hints: [
        "Assistant যে query লেখে, portal তা check না করেই চালিয়ে দেয়। কোনো উত্তরের নিচে \"Query used\" খুলুন। Database-এ কি শুধু আপনার data-ই আছে?",
        "SQLite-এ সব tables-এর তালিকা sqlite_master নামের table-এ থাকে। Assistant-কে দিয়ে তার উপর query লেখান।",
        "Assistant-এর একমাত্র সুরক্ষা তার instructions। Dashboard-এর notices পড়ুন: এই assistant আর কে ব্যবহার করে, আর তাদের জন্য এটি কী করে? তারপর আপনার দরকারি exact query চান।"
      ]
    },
    mr: {
      desc: "Kaveri Valley Institute of Technology ने आपल्या student portal वर एक AI assistant लावला आहे. तो तुमचे प्रश्न database query मध्ये बदलतो, आणि portal तो जी query लिहील ती चालवतो. End-sem papers सुद्धा त्याच database मध्ये आहेत.",
      scenario: "तुम्ही Rohan Mehta आहात, KVIT मध्ये B.Tech second year चे विद्यार्थी. CampusDesk portal चा नवा KVIT Assistant तुमच्या attendance, marks आणि fees च्या प्रश्नांची उत्तरे एक SQL query लिहून देतो, आणि portal ती query college च्या database वर चालवतो.<br><br>Assistant ला सांगितले आहे की students ना फक्त त्यांचा स्वतःचा data दाखवावा. त्याने लिहिलेल्या queries कोणी check करत नाही. त्याच database मध्ये कुठेतरी end-sem papers चे unlock codes आहेत. DBMS चा code काढा.",
      hints: [
        "Assistant जी query लिहितो, portal ती check न करता चालवतो. एखाद्या उत्तराखाली \"Query used\" उघडा. Database मध्ये फक्त तुमचाच data आहे का?",
        "SQLite मध्ये सर्व tables ची यादी sqlite_master नावाच्या table मध्ये असते. Assistant कडून तिच्यावर query लिहून घ्या.",
        "Assistant ची सुरक्षा फक्त त्याचे instructions आहेत. Dashboard वरचे notices वाचा: हा assistant आणखी कोण वापरतो, आणि त्यांच्यासाठी तो काय करतो? मग तुम्हाला हवी ती exact query मागा."
      ]
    }
  },
};

function applyCTFStaticOverride(lang) {
  if (typeof ctfChallenges === 'undefined') return false;
  storeCTFOriginals();
  let appliedAny = false;
  ctfChallenges.forEach(c => {
    const ov = CTF_OVERRIDES[c.id] && CTF_OVERRIDES[c.id][lang];
    if (!ov) return; // is challenge ke liye hand-written translation nahi hai
    if (ov.desc)  c.desc  = ov.desc;
    if (ov.hint)  c.hint  = ov.hint;
    if (ov.hints) c.hints = ov.hints;
    if (ov.scenario) c.scenario = ov.scenario;
    appliedAny = true;
  });
  if (appliedAny) {
    if (typeof ctfRender === 'function') ctfRender();
    refreshOpenCTFModal();
  }
  return appliedAny;
}

async function applyCTFTranslation(lang) {
  if (typeof ctfChallenges === 'undefined') return;
  if (lang === 'hl') { restoreCTFOriginal(); applyCTFStaticOverride('hl'); return; }

  storeCTFOriginals();

  // Pehle hand-written translation check karo (en + 6 languages ke liye hai)
  applyCTFStaticOverride(lang);

  // Jo challenges hand-written map mein nahi hain (CTF_OVERRIDES mein koi
  // entry nahi), unke liye agar lang Google Translate wali list mein hai
  // to baaki bacha hua content machine-translate karo.
  if (lang === 'en') return; // English ke liye sab 5 live challenges cover hain, machine translate ki zarurat nahi

  const challengesNeedingMT = ctfChallenges.filter(c => !(CTF_OVERRIDES[c.id] && CTF_OVERRIDES[c.id][lang]));
  if (challengesNeedingMT.length === 0) return; // sab hand-written se cover ho gaya

  const langName = LANG_NAMES[lang] || lang;
  const cacheKey = 'ctf_' + lang;

  // Check cache
  if (chapterCache[cacheKey]) {
    const cached = chapterCache[cacheKey];
    challengesNeedingMT.forEach(c => {
      if (cached[c.id]) {
        c.title = cached[c.id].title || c.title;
        c.desc  = cached[c.id].desc  || c.desc;
        c.hint  = cached[c.id].hint  || c.hint;
        if (cached[c.id].hints) c.hints = cached[c.id].hints;
      }
    });
    if (typeof ctfRender === 'function') ctfRender();
    refreshOpenCTFModal();
    return;
  }

  // Show loader
  const loader = showTranslateLoader(langName);
  const bar    = document.getElementById('xlBar');
  const status = document.getElementById('xlStatus');

  try {
    const total = challengesNeedingMT.length * 3; // title + desc + hint(s) per challenge
    let done = 0;
    const translated = {};

    for (const c of challengesNeedingMT) {
      const orig = _ctfOriginals[c.id];
      if (!orig) continue;

      const hintsToTranslate = orig.hints && orig.hints.length ? orig.hints : [orig.hint || ''];

      const [tTitle, tDesc, ...tHints] = await Promise.all([
        googleTranslateText(orig.title, lang),
        googleTranslateText(orig.desc,  lang),
        ...hintsToTranslate.map(h => googleTranslateText(h, lang)),
      ]);

      c.title = tTitle || orig.title;
      c.desc  = tDesc  || orig.desc;
      if (orig.hints && orig.hints.length) {
        c.hints = tHints.map((h, i) => h || orig.hints[i]);
      } else {
        c.hint = tHints[0] || orig.hint;
      }

      translated[c.id] = { title: c.title, desc: c.desc, hint: c.hint, hints: c.hints };
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
    refreshOpenCTFModal();

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
