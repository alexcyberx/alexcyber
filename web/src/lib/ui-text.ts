'use client';

// Short UI strings that React renders itself (not via data-i18n), in every
// language of the picker (js/i18n.js LANGUAGES). They follow the saved
// language and change as soon as it is switched. The first render is English,
// like the server HTML, so hydration matches.

import { useEffect, useState } from 'react';

export type UiLang = 'hl' | 'hi' | 'en' | 'bn' | 'pa' | 'te' | 'ta' | 'mr';
type Entry = Record<UiLang, string>;

const LANG_KEY = 'acx_lang_v4'; // js/i18n.js
export const LANG_EVENT = 'acx:lang'; // fired by js/i18n.js applyLanguage()

export const UI: Record<string, Entry> = {
  'notfound.title': {
    en: 'Page not found', hl: 'Page nahi mila', hi: 'पेज नहीं मिला', bn: 'পেজ পাওয়া যায়নি',
    pa: 'ਪੇਜ ਨਹੀਂ ਮਿਲਿਆ', te: 'పేజీ కనబడలేదు', ta: 'பக்கம் கிடைக்கவில்லை', mr: 'पेज सापडले नाही',
  },
  'notfound.desc': {
    en: 'This page does not exist or has been removed.', hl: 'Ye page maujood nahi hai ya hata diya gaya hai.',
    hi: 'यह पेज मौजूद नहीं है या हटा दिया गया है।', bn: 'এই পেজটি নেই অথবা সরিয়ে ফেলা হয়েছে।',
    pa: 'ਇਹ ਪੇਜ ਮੌਜੂਦ ਨਹੀਂ ਹੈ ਜਾਂ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ।', te: 'ఈ పేజీ లేదు లేదా తీసివేయబడింది.',
    ta: 'இந்தப் பக்கம் இல்லை அல்லது நீக்கப்பட்டது.', mr: 'हे पेज अस्तित्वात नाही किंवा काढून टाकले आहे.',
  },
  'notfound.home': {
    en: 'Back to Home', hl: 'Home par wapas jao', hi: 'होम पर वापस जाएं', bn: 'হোমে ফিরে যান',
    pa: 'ਹੋਮ ਤੇ ਵਾਪਸ ਜਾਓ', te: 'హోమ్‌కు తిరిగి వెళ్ళండి', ta: 'முகப்புக்குத் திரும்பு', mr: 'होमवर परत जा',
  },
  'auth.age': {
    en: 'I am 18+, or my parent/guardian has given permission',
    hl: 'Main 18+ hoon, ya mere parent/guardian ne permission di hai',
    hi: 'मैं 18+ हूं, या मेरे माता-पिता/अभिभावक ने अनुमति दी है',
    bn: 'আমার বয়স ১৮+, অথবা আমার বাবা-মা/অভিভাবক অনুমতি দিয়েছেন',
    pa: 'ਮੈਂ 18+ ਹਾਂ, ਜਾਂ ਮੇਰੇ ਮਾਤਾ-ਪਿਤਾ/ਸਰਪ੍ਰਸਤ ਨੇ ਇਜਾਜ਼ਤ ਦਿੱਤੀ ਹੈ',
    te: 'నా వయసు 18+, లేదా నా తల్లిదండ్రులు/సంరక్షకులు అనుమతి ఇచ్చారు',
    ta: 'எனக்கு 18+ வயது, அல்லது என் பெற்றோர்/பாதுகாவலர் அனுமதி அளித்துள்ளனர்',
    mr: 'माझे वय 18+ आहे, किंवा माझ्या पालकांनी परवानगी दिली आहे',
  },
  'auth.registered': {
    en: 'This email is already registered.', hl: 'Ye email already registered hai.',
    hi: 'यह ईमेल पहले से रजिस्टर्ड है।', bn: 'এই ইমেলটি আগেই রেজিস্টার করা আছে।',
    pa: 'ਇਹ ਈਮੇਲ ਪਹਿਲਾਂ ਹੀ ਰਜਿਸਟਰਡ ਹੈ।', te: 'ఈ ఈమెయిల్ ఇప్పటికే రిజిస్టర్ అయింది.',
    ta: 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.', mr: 'हा ईमेल आधीच नोंदणीकृत आहे.',
  },
};

const LANGS: UiLang[] = ['hl', 'hi', 'en', 'bn', 'pa', 'te', 'ta', 'mr'];

export function readUiLang(): UiLang {
  try { const v = localStorage.getItem(LANG_KEY) as UiLang | null; return v && LANGS.includes(v) ? v : 'en'; } catch { return 'en'; }
}

export function uiText(key: string, lang: UiLang = readUiLang()): string {
  const e = UI[key];
  return e ? e[lang] || e.en : key;
}

// Current language, kept in sync with the picker (this tab and other tabs).
export function useUiLang(): UiLang {
  const [lang, setLang] = useState<UiLang>('en');
  useEffect(() => {
    const sync = () => setLang(readUiLang());
    sync();
    const onStorage = (e: StorageEvent) => { if (e.key === LANG_KEY) sync(); };
    window.addEventListener(LANG_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(LANG_EVENT, sync); window.removeEventListener('storage', onStorage); };
  }, []);
  return lang;
}
