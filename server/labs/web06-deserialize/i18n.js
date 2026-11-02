// web-06 / web-07 NovaSat server messages (8 site languages, English
// fallback). The cookie and its contents stay as they are.
module.exports = {
  en: { no_cookie: 'No session cookie found. Log in first.', bad_cookie: 'Malformed session cookie.', deser: 'Session cookie failed to deserialize: ' },
  hl: { no_cookie: 'Koi session cookie nahi mili. Pehle log in karo.', bad_cookie: 'Session cookie kharab hai.', deser: 'Session cookie deserialize nahi hui: ' },
  hi: { no_cookie: 'कोई सेशन कुकी नहीं मिली। पहले लॉग इन करें।', bad_cookie: 'सेशन कुकी खराब है।', deser: 'सेशन कुकी डीसीरियलाइज़ नहीं हुई: ' },
  pa: { no_cookie: 'ਕੋਈ ਸੈਸ਼ਨ ਕੂਕੀ ਨਹੀਂ ਮਿਲੀ। ਪਹਿਲਾਂ ਲੌਗ ਇਨ ਕਰੋ।', bad_cookie: 'ਸੈਸ਼ਨ ਕੂਕੀ ਖ਼ਰਾਬ ਹੈ।', deser: 'ਸੈਸ਼ਨ ਕੂਕੀ ਡੀਸੀਰੀਅਲਾਈਜ਼ ਨਹੀਂ ਹੋਈ: ' },
  ta: { no_cookie: 'Session cookie கிடைக்கவில்லை. முதலில் உள்நுழையுங்கள்.', bad_cookie: 'Session cookie சிதைந்துள்ளது.', deser: 'Session cookie ஐ deserialize செய்ய முடியவில்லை: ' },
  te: { no_cookie: 'Session cookie దొరకలేదు. ముందు లాగిన్ అవ్వండి.', bad_cookie: 'Session cookie పాడైంది.', deser: 'Session cookie deserialize కాలేదు: ' },
  bn: { no_cookie: 'কোনো session cookie পাওয়া যায়নি। আগে লগ ইন করুন।', bad_cookie: 'Session cookie নষ্ট।', deser: 'Session cookie deserialize করা যায়নি: ' },
  mr: { no_cookie: 'Session cookie सापडली नाही. आधी लॉग इन करा.', bad_cookie: 'Session cookie बिघडलेली आहे.', deser: 'Session cookie deserialize झाली नाही: ' },
};
