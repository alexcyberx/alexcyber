/* Lab page languages. The CTF page opens a lab with ?lang=<code> (the
   language picked on the site, English by default). A page calls
   ACX_I18N({ en: {...}, hi: {...}, ... }) once; it returns t(key, vars) and
   fills every element marked with:
     data-i18n="key"       textContent
     data-i18n-html="key"  innerHTML (only for texts written in this repo)
     data-i18n-ph="key"    placeholder
   Missing keys fall back to English. Rule: no emojis, no en or em dashes. */
(function () {
  var LANGS = ['en', 'hl', 'hi', 'pa', 'ta', 'te', 'bn', 'mr'];
  var HTML_LANG = { en: 'en', hl: 'hi-Latn', hi: 'hi', pa: 'pa', ta: 'ta', te: 'te', bn: 'bn', mr: 'mr' };
  var COMMON = {
    en: { stop_h: 'Instance stopped', stop_p: 'Another challenge was started, so this instance is no longer live. Go back and relaunch {id} if needed.', back: 'Back to CTF' },
    hl: { stop_h: 'Instance band ho gaya', stop_p: 'Koi doosra challenge shuru hua, isliye ye instance ab live nahi hai. Wapas jao aur zaroorat ho to {id} phir se shuru karo.', back: 'CTF par wapas' },
    hi: { stop_h: 'इंस्टेंस बंद हो गया', stop_p: 'कोई दूसरा चैलेंज शुरू हुआ, इसलिए यह इंस्टेंस अब लाइव नहीं है। वापस जाएं और ज़रूरत हो तो {id} फिर से शुरू करें।', back: 'CTF पर वापस' },
    pa: { stop_h: 'ਇੰਸਟੈਂਸ ਬੰਦ ਹੋ ਗਿਆ', stop_p: 'ਕੋਈ ਹੋਰ ਚੈਲੇਂਜ ਸ਼ੁਰੂ ਹੋਇਆ, ਇਸ ਲਈ ਇਹ ਇੰਸਟੈਂਸ ਹੁਣ ਲਾਈਵ ਨਹੀਂ। ਵਾਪਸ ਜਾਓ ਅਤੇ ਲੋੜ ਹੋਵੇ ਤਾਂ {id} ਫਿਰ ਸ਼ੁਰੂ ਕਰੋ।', back: 'CTF ਤੇ ਵਾਪਸ' },
    ta: { stop_h: 'இன்ஸ்டன்ஸ் நிறுத்தப்பட்டது', stop_p: 'வேறொரு சவால் தொடங்கப்பட்டதால் இந்த இன்ஸ்டன்ஸ் இனி இயங்காது. திரும்பிச் சென்று தேவைப்பட்டால் {id} ஐ மீண்டும் தொடங்குங்கள்.', back: 'CTF க்குத் திரும்பு' },
    te: { stop_h: 'ఇన్‌స్టెన్స్ ఆగిపోయింది', stop_p: 'మరో ఛాలెంజ్ ప్రారంభమైంది, కాబట్టి ఈ ఇన్‌స్టెన్స్ ఇక లైవ్‌లో లేదు. తిరిగి వెళ్లి అవసరమైతే {id} ని మళ్లీ ప్రారంభించండి.', back: 'CTF కి తిరిగి' },
    bn: { stop_h: 'ইনস্ট্যান্স বন্ধ হয়েছে', stop_p: 'অন্য একটি চ্যালেঞ্জ শুরু হয়েছে, তাই এই ইনস্ট্যান্স আর চালু নেই। ফিরে গিয়ে দরকার হলে {id} আবার শুরু করুন।', back: 'CTF-এ ফিরুন' },
    mr: { stop_h: 'इन्स्टन्स बंद झाला', stop_p: 'दुसरे चॅलेंज सुरू झाले, त्यामुळे हा इन्स्टन्स आता चालू नाही. परत जा आणि गरज असल्यास {id} पुन्हा सुरू करा.', back: 'CTF वर परत' },
  };
  function merge(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b || {}) o[k] = b[k]; return o; }
  window.ACX_I18N = function (dict) {
    var q = new URLSearchParams(window.location.search).get('lang');
    var lang = LANGS.indexOf(q) >= 0 ? q : 'en';
    var T = merge(merge(COMMON.en, COMMON[lang]), merge(dict.en || {}, dict[lang] || {}));
    function t(key, vars) {
      var s = T[key] != null ? String(T[key]) : key;
      return vars ? s.replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; }) : s;
    }
    document.documentElement.lang = HTML_LANG[lang];
    var id = document.body && document.body.getAttribute('data-lab-id');
    document.querySelectorAll('[data-i18n]').forEach(function (e) { e.textContent = t(e.getAttribute('data-i18n'), { id: id }); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (e) { e.innerHTML = t(e.getAttribute('data-i18n-html'), { id: id }); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (e) { e.placeholder = t(e.getAttribute('data-i18n-ph')); });
    t.lang = lang;
    return t;
  };
})();
