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
    // CTF page ya koi aur page jahan chapterContent nahi — screen ke center mein
    loader.style.cssText = 'position:fixed;top:30%;left:0;right:0;margin:0 auto;width:fit-content;z-index:99999;display:flex;flex-direction:column;align-items:center;gap:10px;';
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

// Store original Hinglish CTF data (once) — yeh base/default language hai
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
  // scenario (innerHTML) or the plain-desc fallback (textContent) — there
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

// Hand-written translations for the 5 live challenges — base content
// (ctfChallenges array) is Hinglish. English aur baaki 6 languages (Hindi,
// Punjabi, Tamil, Telugu, Bengali, Marathi) yahan hand-written hain, taaki
// machine translation ki zarurat na pade in jaane-mane challenges ke liye.
const CTF_OVERRIDES = {
  'web-01': {
    en: {
      desc: 'There is a website with something hidden in its source code. Carefully look at the page source. Developers sometimes leave a lot behind in comments.',
      hint: 'Press Ctrl+U (View Source) in the browser and look for HTML comments <!-- -->.',
      scenario: 'CorpX Ltd. pushed their internal portal to production without a final cleanup. The surface looks clean but the developers left traces behind.<br><br>The flag is split across three locations. Look beyond what the browser renders.'
    },
    hi: {
      desc: 'एक वेबसाइट है जिसके सोर्स कोड में कुछ छिपा हुआ है। पेज का सोर्स ध्यान से देखो। डेवलपर्स कभी-कभी कमेंट्स में बहुत कुछ छोड़ देते हैं।',
      hint: 'ब्राउज़र में Ctrl+U (View Source) दबाओ और HTML comments <!-- --> ढूंढो।',
      scenario: 'CorpX Ltd. का internal portal final cleanup के बिना production में push हुआ। Surface पर सब clean दिखता है लेकिन developers ने कुछ traces छोड़ दिए।<br><br>Flag तीन अलग जगहों में छुपा है। सिर्फ जो render होता है वो मत देखो।'
    },
    pa: {
      desc: 'ਇੱਕ ਵੈੱਬਸਾਈਟ ਹੈ ਜਿਸਦੇ ਸੋਰਸ ਕੋਡ ਵਿੱਚ ਕੁਝ ਛੁਪਿਆ ਹੋਇਆ ਹੈ। ਪੇਜ ਦਾ ਸੋਰਸ ਧਿਆਨ ਨਾਲ ਦੇਖੋ। ਡਿਵੈਲਪਰ ਕਦੇ-ਕਦੇ ਕਮੈਂਟਸ ਵਿੱਚ ਬਹੁਤ ਕੁਝ ਛੱਡ ਦਿੰਦੇ ਹਨ।',
      hint: 'ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ Ctrl+U (View Source) ਦਬਾਓ ਅਤੇ HTML comments <!-- --> ਲੱਭੋ।',
      scenario: 'CorpX Ltd. ਦਾ internal portal final cleanup ਤੋਂ ਬਿਨਾਂ production ਵਿੱਚ push ਹੋਇਆ। Surface ਤੇ ਸਭ clean ਦਿਖਦਾ ਹੈ ਪਰ developers ਨੇ ਕੁਝ traces ਛੱਡੇ ਹਨ।<br><br>Flag ਤਿੰਨ ਵੱਖ ਜਗ੍ਹਾਂ ਵਿੱਚ ਛੁਪਿਆ ਹੈ। ਸਿਰਫ਼ ਜੋ render ਹੁੰਦਾ ਹੈ ਉਹ ਨਾ ਦੇਖੋ।'
    },
    ta: {
      desc: 'அதன் சோர்ஸ் கோடில் ஏதோ மறைக்கப்பட்ட ஒரு வெப்சைட் உள்ளது. பக்கத்தின் சோர்ஸை கவனமாக பார்க்கவும். டெவலப்பர்கள் சில நேரங்களில் கமெண்ட்களில் நிறைய விட்டுச் செல்வார்கள்.',
      hint: 'பிரௌசரில் Ctrl+U (View Source) அழுத்தி HTML comments <!-- --> ஐ தேடுங்கள்.',
      scenario: 'CorpX Ltd. இன் internal portal final cleanup இல்லாமல் production-க்கு push ஆனது. Surface சுத்தமாக தெரிகிறது ஆனால் developers சில traces விட்டுச் சென்றனர்.<br><br>Flag மூன்று இடங்களில் மறைக்கப்பட்டுள்ளது. browser render ஆவதை மட்டும் பார்க்காதீர்கள்.'
    },
    te: {
      desc: 'దాని సోర్స్ కోడ్‌లో ఏదో దాచబడిన ఒక వెబ్‌సైట్ ఉంది. పేజీ సోర్స్‌ను జాగ్రత్తగా చూడండి. డెవలపర్లు కొన్నిసార్లు కామెంట్‌లలో చాలా వదిలేస్తారు.',
      hint: 'బ్రౌజర్‌లో Ctrl+U (View Source) నొక్కి HTML comments <!-- --> కోసం చూడండి.',
      scenario: 'CorpX Ltd. యొక్క internal portal final cleanup లేకుండా production కి push అయింది. Surface clean గా కనిపిస్తుంది కానీ developers కొన్ని traces వదిలారు.<br><br>Flag మూడు చోట్ల దాచబడింది. browser render అయ్యేది మాత్రమే చూడకండి.'
    },
    bn: {
      desc: 'একটি ওয়েবসাইট আছে যার সোর্স কোডে কিছু লুকানো আছে। পেজের সোর্স মনোযোগ দিয়ে দেখুন। ডেভেলপাররা অনেক সময় কমেন্টে অনেক কিছু রেখে দেয়।',
      hint: 'ব্রাউজারে Ctrl+U (View Source) চাপুন এবং HTML comments <!-- --> খুঁজুন।',
      scenario: 'CorpX Ltd.-এর internal portal final cleanup ছাড়াই production-এ push হয়েছে. Surface পরিষ্কার দেখাচ্ছে কিন্তু developers কিছু traces রেখে গেছে।<br><br>Flag তিনটি জায়গায় লুকানো আছে. browser-এ যা render হয় তার বাইরেও দেখুন।'
    },
    mr: {
      desc: 'एक वेबसाइट आहे ज्याच्या सोर्स कोडमध्ये काहीतरी लपलेले आहे. पेजचा सोर्स काळजीपूर्वक पाहा. डेव्हलपर्स कधीकधी कमेंट्समध्ये बरेच काही सोडून देतात.',
      hint: 'ब्राउझरमध्ये Ctrl+U (View Source) दाबा आणि HTML comments <!-- --> शोधा.',
      scenario: 'CorpX Ltd. चा internal portal final cleanup शिवाय production मध्ये push झाला. Surface स्वच्छ दिसते पण developers काही traces सोडून गेले.<br><br>Flag तीन ठिकाणी लपवला आहे. फक्त browser मध्ये render होते तेच पाहू नका.'
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
  }
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
  if (lang === 'hl') { restoreCTFOriginal(); return; }

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
