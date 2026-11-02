// ── Lab languages ───────────────────────────────────────────────
// The CTF page opens every lab with ?lang=<code>, the language picked on the
// site (owner rule 2026-11-02: a lab opens in that language, English by
// default). Each lab keeps its texts in its own dictionary { en: {...},
// hl: {...}, ... }; texts() fills any missing key from English. Technical
// parts of a challenge (SQL, headers, JSON, file names, flags) stay as they
// are. Rule: no emojis and no en or em dashes in lab text.
const LANGS = ['en', 'hl', 'hi', 'pa', 'ta', 'te', 'bn', 'mr'];
const HTML_LANG = { en: 'en', hl: 'hi-Latn', hi: 'hi', pa: 'pa', ta: 'ta', te: 'te', bn: 'bn', mr: 'mr' };
const LANG_NAMES = { en: 'English', hl: 'Hinglish (Hindi written in English letters)', hi: 'Hindi', pa: 'Punjabi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi' };

/** The language asked for in ?lang= (or a body field), else English. */
function langOf(req) {
  const q = req.query && req.query.lang;
  const b = req.body && typeof req.body === 'object' ? req.body.lang : undefined;
  const v = typeof q === 'string' ? q : typeof b === 'string' ? b : '';
  return LANGS.includes(v) ? v : 'en';
}

/**
 * Like langOf, but remembers the language on the lab instance: pages the
 * student opens by typing a path (robots.txt, /admin/, an API) carry no
 * ?lang=, so they use the language the lab was opened in.
 */
function langFor(req, inst) {
  const q = req.query && typeof req.query.lang === 'string' && LANGS.includes(req.query.lang) ? req.query.lang : null;
  if (q) { if (inst) inst.lang = q; return q; }
  return (inst && LANGS.includes(inst.lang) && inst.lang) || langOf(req);
}

function merge(base, over) {
  if (!over) return base;
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k of Object.keys(over)) {
    const b = base ? base[k] : undefined;
    const o = over[k];
    out[k] = b && o && typeof b === 'object' && typeof o === 'object' && !Array.isArray(b) ? merge(b, o) : o;
  }
  return out;
}

/** Texts of `dict` for `lang`, English filling any gap. Cached per dict and language. */
const cache = new WeakMap();
function texts(dict, lang) {
  let c = cache.get(dict);
  if (!c) { c = {}; cache.set(dict, c); }
  if (!c[lang]) c[lang] = lang === 'en' ? dict.en : merge(dict.en, dict[lang]);
  return c[lang];
}

/** Replace {name} placeholders. Values are inserted as given (escape them first if they come from the user). */
function fill(str, vars) { return String(str).replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m)); }

// Texts every lab uses: the page shown when the instance is not running.
const COMMON = {
  en: { na_title: 'Lab not running', na_text: 'This lab instance is not running. Go back to the room on AlexCyberX and press Start (or Restart) to begin a fresh session.' },
  hl: { na_title: 'Lab chal nahi raha', na_text: 'Ye lab instance chal nahi raha. AlexCyberX par room mein wapas jao aur Start (ya Restart) dabao.' },
  hi: { na_title: 'लैब नहीं चल रही', na_text: 'यह लैब इंस्टेंस नहीं चल रहा। AlexCyberX पर रूम में वापस जाएं और Start (या Restart) दबाएं।' },
  pa: { na_title: 'ਲੈਬ ਨਹੀਂ ਚੱਲ ਰਹੀ', na_text: 'ਇਹ ਲੈਬ ਇੰਸਟੈਂਸ ਨਹੀਂ ਚੱਲ ਰਿਹਾ। AlexCyberX ਤੇ ਰੂਮ ਵਿੱਚ ਵਾਪਸ ਜਾਓ ਅਤੇ Start (ਜਾਂ Restart) ਦਬਾਓ।' },
  ta: { na_title: 'லேப் இயங்கவில்லை', na_text: 'இந்த லேப் இயங்கவில்லை. AlexCyberX இல் அறைக்குத் திரும்பி Start (அல்லது Restart) அழுத்துங்கள்.' },
  te: { na_title: 'ల్యాబ్ నడవడం లేదు', na_text: 'ఈ ల్యాబ్ నడవడం లేదు. AlexCyberX లో రూమ్‌కు తిరిగి వెళ్లి Start (లేదా Restart) నొక్కండి.' },
  bn: { na_title: 'ল্যাব চলছে না', na_text: 'এই ল্যাব চলছে না। AlexCyberX-এ রুমে ফিরে গিয়ে Start (বা Restart) চাপুন।' },
  mr: { na_title: 'लॅब चालू नाही', na_text: 'ही लॅब चालू नाही. AlexCyberX वर रूममध्ये परत जा आणि Start (किंवा Restart) दाबा.' },
};

/** A small "lab not running" page in the request's language. `style` = optional extra CSS. */
function notActivePage(req, style = 'background:#0a0a0d;color:#e4e4ef') {
  const lang = langOf(req), T = texts(COMMON, lang);
  return `<!DOCTYPE html><html lang="${HTML_LANG[lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${T.na_title}</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;font:14px/1.6 system-ui,-apple-system,Arial,sans-serif;${style}"><div style="max-width:420px;padding:24px"><h1 style="font-size:20px">${T.na_title}</h1><p>${T.na_text}</p></div></body></html>`;
}

/** Query string for links inside a lab: session + lang. `amp` = HTML-escaped separator. */
function qs(session, lang, amp = true) { return 'session=' + encodeURIComponent(session) + (amp ? '&amp;' : '&') + 'lang=' + lang; }

module.exports = { LANGS, HTML_LANG, LANG_NAMES, COMMON, langOf, langFor, texts, fill, notActivePage, qs };
