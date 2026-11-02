// web-01 Lumio store texts (8 site languages, English fallback). Product
// names, the HTML comments and js/store.js stay in English: they are the
// developers' code and part of the challenge.
const R = '&#8377;';
module.exports = {
  en: {
    title: 'Lumio Store: Lumio Book Air, Lumio One and more',
    nav: ['Store', 'Accessories', 'Support'], search: 'Search Store', cart: 'Cart',
    h1: 'The new Lumio Book Air.<br />Thinner than ever.', hero_p: `14-inch display. All-day battery. Starting at ${R}89,900.`,
    buy: 'Buy now', film: 'Watch the film', from: 'From {p}',
    news_label: 'Hot News:', news: ['Free engraving on every Lumio Book.', `Student offer: save ${R}10,000 with a valid college ID.`, 'Something big is coming on 20 November.'],
    foot: 'Copyright &copy; 2026 Lumio Inc. A fictional store built for AlexCyberX Labs. All rights reserved.',
    foot_links: ['Site Map', 'Hot News', 'Contact Us', 'Privacy Policy'],
  },
  hl: {
    nav: ['Store', 'Accessories', 'Support'], search: 'Store mein dhoondho', cart: 'Cart',
    h1: 'Naya Lumio Book Air.<br />Ab tak ka sabse patla.', hero_p: `14-inch display. Poore din ki battery. ${R}89,900 se shuru.`,
    buy: 'Abhi khareedo', film: 'Film dekho', from: '{p} se',
    news_label: 'Taaza khabar:', news: ['Har Lumio Book par free engraving.', `Student offer: valid college ID par ${R}10,000 bachao.`, '20 November ko kuch bada aa raha hai.'],
    foot: 'Copyright &copy; 2026 Lumio Inc. AlexCyberX Labs ke liye banaya gaya ek kaalpanik store.',
    foot_links: ['Site Map', 'Taaza khabar', 'Humse baat karo', 'Privacy Policy'],
  },
  hi: {
    nav: ['स्टोर', 'एक्सेसरीज़', 'सहायता'], search: 'स्टोर में खोजें', cart: 'कार्ट',
    h1: 'नया Lumio Book Air।<br />अब तक का सबसे पतला।', hero_p: `14-इंच डिस्प्ले। पूरे दिन की बैटरी। ${R}89,900 से शुरू।`,
    buy: 'अभी खरीदें', film: 'फ़िल्म देखें', from: '{p} से',
    news_label: 'ताज़ा खबर:', news: ['हर Lumio Book पर मुफ़्त नक्काशी।', `छात्र ऑफ़र: मान्य कॉलेज ID पर ${R}10,000 बचाएं।`, '20 नवंबर को कुछ बड़ा आ रहा है।'],
    foot: 'कॉपीराइट &copy; 2026 Lumio Inc. AlexCyberX Labs के लिए बनाया गया एक काल्पनिक स्टोर।',
    foot_links: ['साइट मैप', 'ताज़ा खबर', 'संपर्क करें', 'गोपनीयता नीति'],
  },
  pa: {
    nav: ['ਸਟੋਰ', 'ਐਕਸੈਸਰੀਜ਼', 'ਸਹਾਇਤਾ'], search: 'ਸਟੋਰ ਵਿੱਚ ਲੱਭੋ', cart: 'ਕਾਰਟ',
    h1: 'ਨਵਾਂ Lumio Book Air।<br />ਹੁਣ ਤੱਕ ਦਾ ਸਭ ਤੋਂ ਪਤਲਾ।', hero_p: `14-ਇੰਚ ਡਿਸਪਲੇ। ਪੂਰੇ ਦਿਨ ਦੀ ਬੈਟਰੀ। ${R}89,900 ਤੋਂ ਸ਼ੁਰੂ।`,
    buy: 'ਹੁਣੇ ਖਰੀਦੋ', film: 'ਫ਼ਿਲਮ ਦੇਖੋ', from: '{p} ਤੋਂ',
    news_label: 'ਤਾਜ਼ਾ ਖ਼ਬਰ:', news: ['ਹਰ Lumio Book ਤੇ ਮੁਫ਼ਤ ਨੱਕਾਸ਼ੀ।', `ਵਿਦਿਆਰਥੀ ਆਫ਼ਰ: ਯੋਗ ਕਾਲਜ ID ਨਾਲ ${R}10,000 ਬਚਾਓ।`, '20 ਨਵੰਬਰ ਨੂੰ ਕੁਝ ਵੱਡਾ ਆ ਰਿਹਾ ਹੈ।'],
    foot: 'ਕਾਪੀਰਾਈਟ &copy; 2026 Lumio Inc. AlexCyberX Labs ਲਈ ਬਣਾਇਆ ਇੱਕ ਕਾਲਪਨਿਕ ਸਟੋਰ।',
    foot_links: ['ਸਾਈਟ ਮੈਪ', 'ਤਾਜ਼ਾ ਖ਼ਬਰ', 'ਸੰਪਰਕ ਕਰੋ', 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ'],
  },
  ta: {
    nav: ['ஸ்டோர்', 'துணைப் பொருட்கள்', 'உதவி'], search: 'ஸ்டோரில் தேடுங்கள்', cart: 'கார்ட்',
    h1: 'புதிய Lumio Book Air.<br />இதுவரை இல்லாத மெலிவு.', hero_p: `14-இன்ச் திரை. நாள் முழுவதும் பேட்டரி. ${R}89,900 முதல்.`,
    buy: 'இப்போது வாங்குங்கள்', film: 'படத்தைப் பாருங்கள்', from: '{p} முதல்',
    news_label: 'சூடான செய்தி:', news: ['ஒவ்வொரு Lumio Book இலும் இலவச பொறிப்பு.', `மாணவர் சலுகை: செல்லுபடியாகும் கல்லூரி ID உடன் ${R}10,000 சேமியுங்கள்.`, 'நவம்பர் 20 அன்று பெரிய ஒன்று வருகிறது.'],
    foot: 'பதிப்புரிமை &copy; 2026 Lumio Inc. AlexCyberX Labs க்காக உருவாக்கப்பட்ட கற்பனைக் கடை.',
    foot_links: ['தள வரைபடம்', 'சூடான செய்தி', 'தொடர்பு கொள்ள', 'தனியுரிமைக் கொள்கை'],
  },
  te: {
    nav: ['స్టోర్', 'యాక్సెసరీలు', 'సహాయం'], search: 'స్టోర్‌లో వెతకండి', cart: 'కార్ట్',
    h1: 'కొత్త Lumio Book Air.<br />ఇప్పటివరకు అత్యంత పలుచనిది.', hero_p: `14-అంగుళాల డిస్‌ప్లే. రోజంతా బ్యాటరీ. ${R}89,900 నుండి.`,
    buy: 'ఇప్పుడే కొనండి', film: 'సినిమా చూడండి', from: '{p} నుండి',
    news_label: 'తాజా వార్తలు:', news: ['ప్రతి Lumio Book పై ఉచిత చెక్కడం.', `విద్యార్థి ఆఫర్: చెల్లుబాటు అయ్యే కాలేజీ ID తో ${R}10,000 ఆదా చేయండి.`, 'నవంబర్ 20న ఏదో పెద్దది రాబోతోంది.'],
    foot: 'కాపీరైట్ &copy; 2026 Lumio Inc. AlexCyberX Labs కోసం తయారుచేసిన కల్పిత స్టోర్.',
    foot_links: ['సైట్ మ్యాప్', 'తాజా వార్తలు', 'సంప్రదించండి', 'గోప్యతా విధానం'],
  },
  bn: {
    nav: ['স্টোর', 'অ্যাক্সেসরিজ', 'সহায়তা'], search: 'স্টোরে খুঁজুন', cart: 'কার্ট',
    h1: 'নতুন Lumio Book Air।<br />এখন পর্যন্ত সবচেয়ে পাতলা।', hero_p: `14-ইঞ্চি ডিসপ্লে। সারাদিনের ব্যাটারি। ${R}89,900 থেকে শুরু।`,
    buy: 'এখনই কিনুন', film: 'ফিল্ম দেখুন', from: '{p} থেকে',
    news_label: 'গরম খবর:', news: ['প্রতিটি Lumio Book-এ ফ্রি খোদাই।', `ছাত্র অফার: বৈধ কলেজ ID দেখিয়ে ${R}10,000 বাঁচান।`, '20 নভেম্বর বড় কিছু আসছে।'],
    foot: 'কপিরাইট &copy; 2026 Lumio Inc. AlexCyberX Labs-এর জন্য তৈরি একটি কাল্পনিক দোকান।',
    foot_links: ['সাইট ম্যাপ', 'গরম খবর', 'যোগাযোগ', 'গোপনীয়তা নীতি'],
  },
  mr: {
    nav: ['स्टोअर', 'ॲक्सेसरीज', 'मदत'], search: 'स्टोअरमध्ये शोधा', cart: 'कार्ट',
    h1: 'नवीन Lumio Book Air.<br />आजवरचा सर्वात पातळ.', hero_p: `14-इंच डिस्प्ले. दिवसभर बॅटरी. ${R}89,900 पासून.`,
    buy: 'आता खरेदी करा', film: 'फिल्म पाहा', from: '{p} पासून',
    news_label: 'ताज्या बातम्या:', news: ['प्रत्येक Lumio Book वर मोफत कोरीव काम.', `विद्यार्थी ऑफर: वैध कॉलेज ID ने ${R}10,000 वाचवा.`, '20 नोव्हेंबरला काहीतरी मोठे येत आहे.'],
    foot: 'कॉपीराइट &copy; 2026 Lumio Inc. AlexCyberX Labs साठी बनवलेले एक काल्पनिक दुकान.',
    foot_links: ['साइट मॅप', 'ताज्या बातम्या', 'संपर्क करा', 'गोपनीयता धोरण'],
  },
};
