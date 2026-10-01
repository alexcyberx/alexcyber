
/* ══════════════════════════════════════════════
   ALEX CYBERX - OFFLINE TRANSLATION SYSTEM v4
   100% offline - pre-translated dictionary
   No API calls, works on file:// protocol
══════════════════════════════════════════════ */

/* ─── HTML ESCAPE UTILITY (XSS prevention) - defined first so available everywhere ─── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const LANG_KEY = 'acx_lang_v4';

const LANGUAGES = [
  {code:'hl', label:'Hinglish', sub:'Hinglish',  clr:'#dc1414'},
  {code:'hi', label:'हिंदी',   sub:'Hindi',     clr:'#FF9933'},
  {code:'en', label:'English', sub:'English',   clr:'#012169'},
  {code:'pa', label:'ਪੰਜਾਬੀ', sub:'Punjabi',   clr:'#00843D'},
  {code:'ta', label:'தமிழ்',  sub:'Tamil',     clr:'#FF9933'},
  {code:'te', label:'తెలుగు', sub:'Telugu',    clr:'#FF9933'},
  {code:'bn', label:'বাংলা',   sub:'Bengali',   clr:'#006A4E'},
  {code:'mr', label:'मराठी',  sub:'Marathi',   clr:'#FF9933'},
];

let selectedLang = localStorage.getItem(LANG_KEY) || 'en';

/* ─── FLAG SVG ─── */
function flagSVG(clr, code) {
  const safeClr  = escapeHtml(String(clr));
  const safeCode = escapeHtml(String(code).toUpperCase().slice(0, 2));
  return `<svg width="20" height="13" viewBox="0 0 20 13" style="border-radius:2px;flex-shrink:0;">
    <rect width="20" height="13" fill="${safeClr}" rx="2"/>
    <text x="10" y="9.5" text-anchor="middle" font-size="6.5" font-weight="700" font-family="monospace" fill="rgba(255,255,255,0.9)">${safeCode}</text>
  </svg>`;
}

/* ─── MODAL ─── */
function buildLangGrid() {
  const g = document.getElementById('langGrid');
  if (!g) return;
  g.innerHTML = '';
  LANGUAGES.forEach(l => {
    const active = l.code === selectedLang;
    const b = document.createElement('button');
    b.setAttribute('data-code', l.code);
    b.onclick = () => pickLang(l.code);
    b.style.cssText = `display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:8px;width:100%;text-align:left;cursor:pointer;transition:all 0.15s;${active?'background:rgba(220,20,20,0.13);border:1px solid rgba(220,20,20,0.45);':'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);'}`;
    b.innerHTML = `${flagSVG(l.clr, l.code)}<div><div style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:${active?'#f4f4f5':'#b0b0b8'};line-height:1.2;">${escapeHtml(l.label)}</div><div style="font-family:'Inter',sans-serif;font-size:10px;color:#505060;">${escapeHtml(l.sub)}</div></div>${active?`<svg style="margin-left:auto;flex-shrink:0;" width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.8" stroke="#dc1414" stroke-width="1.2"/><path d="M3 5.5l1.5 1.5 3-3" stroke="#dc1414" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`:''}`;
    b.onmouseover = () => { if(l.code!==selectedLang) b.style.background='rgba(255,255,255,0.06)'; };
    b.onmouseout  = () => { if(l.code!==selectedLang) b.style.background='rgba(255,255,255,0.03)'; };
    g.appendChild(b);
  });
}

function pickLang(code) { selectedLang = code; buildLangGrid(); }

function showLangModal() {
  buildLangGrid();
  const m = document.getElementById('langModal');
  const c = document.getElementById('langCard');
  m.style.display = 'flex';
  c.style.animation = 'none'; c.offsetHeight;
  c.style.animation = 'langIn 0.32s cubic-bezier(.22,1,.36,1) forwards';
}

function hideLangModal() {
  const m = document.getElementById('langModal');
  m.style.opacity = '0'; m.style.transition = 'opacity 0.22s';
  setTimeout(() => { m.style.display='none'; m.style.opacity='1'; m.style.transition=''; }, 230);
}

function updateAllLabels() {
  const l = LANGUAGES.find(x => x.code === selectedLang);
  if (!l) return;
  ['langNavLabel','lsnLangLabel','mLangLabel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = l.sub;
  });
}

/* ─── OFFLINE TRANSLATION DICTIONARY ─── */
// data-i18n attribute wale elements translate honge
// Hindi base hai, baaki 4 languages pre-translated hain

const DICT = {
  'nav.home':       { hi:'Home',      en:'Home',        bn:'হোম',          pa:'ਹੋਮ',        te:'హోమ్',     ta:'முகப்பு',      mr:'मुख्यपृष्ठ'   },
  'nav.tutorials':  { hi:'Tutorials', en:'Tutorials',  bn:'টিউটোরিয়াল',  pa:'ਟਿਊਟੋਰੀਅਲ', te:'ట్యుటోరియల్', ta:'பயிற்சிகள்', mr:'ट्यूटोरियल'  },
  'nav.about':      { hi:'About',     en:'About',   bn:'সম্পর্কে',     pa:'ਬਾਰੇ',       te:'గురించి',  ta:'பற்றி',        mr:'बद्दल'   },
  'nav.contact':    { hi:'Contact',   en:'Contact',      bn:'যোগাযোগ',      pa:'ਸੰਪਰਕ',      te:'సంప్రదించు',ta:'தொடர்பு',      mr:'संपर्क'    },
  'nav.login':      { hi:'Login',     en:'Login',     bn:'লগইন',         pa:'ਲਾਗਿਨ',      te:'లాగిన్',   ta:'உள்நுழை',      mr:'लॉगिन'     },
  'nav.signup':     { hi:'Sign Up',   en:'Sign Up',    bn:'সাইন আপ',      pa:'ਸਾਈਨ ਅੱਪ',   te:'సైన్ అప్', ta:'பதிவு செய்',   mr:'साइन अप', fr:"S'inscrire"    },
  'nav.lang':       { hi:'Hindi',     en:'English',       bn:'Bengali',      pa:'Punjabi',    te:'Telugu',   ta:'Tamil',        mr:'Marathi' },

  'hero.cta1':      { hi:'Start Learning',   en:'Start Learning', bn:'শেখা শুরু করুন',  pa:'ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ', te:'నేర్చుకోవడం ప్రారంభించండి', ta:'கற்க தொடங்கு',  mr:'शिकणे सुरू करा' },
  'hero.cta2':      { hi:'Meet AlexCyberX',  en:'Meet AlexCyberX', bn:'AlexCyberX জানুন', pa:'AlexCyberX ਨੂੰ ਮਿਲੋ', te:'AlexCyberX కలవండి', ta:'AlexCyberX சந்திக்கவும்', mr:'AlexCyberX ला भेटा' },

  'stat.students':  { hi:'Students', en:'Students',    bn:'শিক্ষার্থী',   pa:'ਵਿਦਿਆਰਥੀ',  te:'విద్యార్థులు', ta:'மாணவர்கள்',   mr:'विद्यार्थी'     },
  'stat.free':      { hi:'Free',     en:'Free',          bn:'বিনামূল্যে',   pa:'ਮੁਫਤ',       te:'ఉచితం',        ta:'இலவசம்',      mr:'मोफत'    },

  'courses.title':  { hi:'Kya Seekhoge?',    en:'What Will You Learn?', bn:'কী শিখবেন?',     pa:'ਕੀ ਸਿੱਖੋਗੇ?', te:'మీరు ఏమి నేర్చుకుంటారు?', ta:'என்ன கற்பீர்கள்?', mr:'काय शिकणार?' },
  'courses.start':  { hi:'Start Course',     en:'Start Course', bn:'কোর্স শুরু করুন', pa:'ਕੋਰਸ ਸ਼ੁਰੂ ਕਰੋ', te:'కోర్సు ప్రారంభించండి', ta:'படிப்பை தொடங்கு', mr:'कोर्स सुरू करा' },
  'courses.coming': { hi:'Coming Soon',      en:'Coming Soon',   bn:'শীঘ্রই আসছে',    pa:'ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ', te:'త్వరలో వస్తుంది', ta:'விரைவில் வருகிறது', mr:'लवकरच येत आहे' },

  'modal.title':    { hl:'Choose Your Language', hi:'अपनी भाषा चुनें', en:'Choose Your Language', bn:'আপনার ভাষা বেছে নিন', pa:'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ', te:'మీ భాషను ఎంచుకోండి', ta:'உங்கள் மொழியை தேர்ந்தெடுக்கவும்', mr:'आपली भाषा निवडा' },
  'modal.sub':      { hl:'Website is language mein translate ho jaayegi. Nav bar se baad mein bhi change kar sakte ho.', hi:'वेबसाइट इस भाषा में अनुवाद होगी।', en:'Website will be shown in this language. You can change it later from the nav bar.', bn:'ওয়েবসাইট এই ভাষায় দেখানো হবে।', pa:'ਵੈੱਬਸਾਈਟ ਇਸ ਭਾਸ਼ਾ ਵਿੱਚ ਦਿਖਾਈ ਦੇਵੇਗੀ।', te:'వెబ్‌సైట్ ఈ భాషలో చూపబడుతుంది.', ta:'இணையதளம் இந்த மொழியில் காட்டப்படும்.', mr:'वेबसाइट या भाषेत दाखवली जाईल.' },
  'modal.continue': { hl:'Continue', hi:'जारी रखें', en:'Continue', bn:'চালিয়ে যান', pa:'ਜਾਰੀ ਰੱਖੋ', te:'కొనసాగించు', ta:'தொடர்', mr:'सुरू ठेवा' },

  'contact.title':  { hi:'Baat Karo', en:'Get in Touch', bn:'যোগাযোগ করুন', pa:'ਸੰਪਰਕ ਕਰੋ', te:'సంప్రదించండి', ta:'தொடர்பு கொள்ளுங்கள்', mr:'संपर्क करा' },
  'contact.send':   { hi:'Send Message', en:'Send Message', bn:'বার্তা পাঠান', pa:'ਸੁਨੇਹਾ ਭੇਜੋ', te:'సందేశం పంపు', ta:'செய்தி அனுப்பு', mr:'संदेश पाठवा' },
  // HERO
  'hero.badge.text': { hi:'Cybersecurity Learning Platform', en:'Cybersecurity Learning Platform', bn:'সাইবার নিরাপত্তা শিক্ষা প্ল্যাটফর্ম', pa:'ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਸਿੱਖਣ ਪਲੇਟਫਾਰਮ', te:'సైబర్ సెక్యూరిటీ లెర్నింగ్ ప్లాట్‌ఫారమ్', ta:'சைபர் பாதுகாப்பு கற்றல் தளம்', mr:'सायबर सुरक्षा शिक्षण व्यासपीठ' },
  'hero.title.line1': { hi:'Learn Cyber', en:'Learn Cyber', bn:'সাইবার শিখুন', pa:'ਸਾਈਬਰ ਸਿੱਖੋ', te:'సైబర్ నేర్చుకోండి', ta:'சைபர் கற்றுக்கொள்', mr:'सायबर शिका' },
  'hero.title.line2': { hi:'Security', en:'Security', bn:'নিরাপত্তা', pa:'ਸੁਰੱਖਿਆ', te:'సెక్యూరిటీ', ta:'பாதுகாப்பு', mr:'सुरक्षा' },
  'hero.title':      { hi:'Learn Cyber Security', en:'Learn Cyber Security', bn:'সাইবার নিরাপত্তা শিখুন', pa:'ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਸਿੱਖੋ', te:'సైబర్ సెక్యూరిటీ నేర్చుకోండి', ta:'சைபர் பாதுகாப்பு கற்றுக்கொள்', mr:'सायबर सुरक्षा शिका' },
  'hero.sub':        { hi:'Cybersecurity ko samjho apni language mein. Network Forensics, Ethical Hacking, aur bahut kuch sikhenge step by step.', en:'Understand cybersecurity in your language. Network Forensics, Ethical Hacking, and much more step by step.', bn:'আপনার ভাষায় সাইবার নিরাপত্তা বুঝুন। নেটওয়ার্ক ফরেনসিক্স, এথিক্যাল হ্যাকিং এবং আরো অনেক কিছু ধাপে ধাপে।', pa:'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਸਮਝੋ। ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ, ਐਥੀਕਲ ਹੈਕਿੰਗ ਅਤੇ ਹੋਰ ਬਹੁਤ ਕੁਝ ਕਦਮ ਦਰ ਕਦਮ।', te:'మీ భాషలో సైబర్ సెక్యూరిటీ అర్థం చేసుకోండి. నెట్వర్క్ ఫోరెన్సిక్స్, ఎథికల్ హ్యాకింగ్ మరియు ఇంకా చాలా ముందుకు.', ta:'உங்கள் மொழியில் சைபர் பாதுகாப்பு புரிந்துகொள்ளுங்கள். நெட்வொர்க் தடயவியல், நெறிமுறை ஹேக்கிங் மற்றும் பல படிப்படியாக.', mr:'आपल्या भाषेत सायबर सुरक्षा समजून घ्या. नेटवर्क फॉरेन्सिक्स, एथिकल हॅकिंग आणि बरेच काही टप्प्याटप्प्याने.' },
  'hero.roadmap':    { hi:'Cybersecurity mein naye ho? Community roadmap follow karo, jaano aage kya seekhna hai', en:'New to cybersecurity? Follow the community roadmap to know what to learn next', bn:'সাইবার নিরাপত্তায় নতুন? কমিউনিটি রোডম্যাপ অনুসরণ করে জানুন এরপর কী শিখবেন', pa:'ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਵਿੱਚ ਨਵੇਂ ਹੋ? ਕਮਿਊਨਿਟੀ ਰੋਡਮੈਪ ਫਾਲੋ ਕਰੋ ਅਤੇ ਜਾਣੋ ਅੱਗੇ ਕੀ ਸਿੱਖਣਾ ਹੈ', te:'సైబర్ సెక్యూరిటీలో కొత్తగా వచ్చారా? తర్వాత ఏమి నేర్చుకోవాలో తెలుసుకోవడానికి కమ్యూనిటీ రోడ్‌మ్యాప్‌ను అనుసరించండి', ta:'சைபர் பாதுகாப்பில் புதியவரா? அடுத்து என்ன கற்க வேண்டும் என்பதை அறிய கம்யூனிட்டி ரோட்மேப்பைப் பின்பற்றுங்கள்', mr:'सायबर सुरक्षेत नवीन आहात? पुढे काय शिकायचे हे जाणून घेण्यासाठी कम्युनिटी रोडमॅप फॉलो करा' },

  // TRUST MARQUEE
  'trust.label':     { hi:'Platform par ye skills cover hoti hain', en:'Skills covered across the platform', bn:'প্ল্যাটফর্মে এই দক্ষতাগুলি কভার করা হয়', pa:'ਪਲੇਟਫਾਰਮ ਤੇ ਇਹ ਹੁਨਰ ਕਵਰ ਕੀਤੇ ਜਾਂਦੇ ਹਨ', te:'ప్లాట్‌ఫారమ్‌లో ఈ నైపుణ్యాలు కవర్ చేయబడతాయి', ta:'தளத்தில் இந்த திறன்கள் உள்ளடக்கப்பட்டுள்ளன', mr:'प्लॅटफॉर्मवर ही कौशल्ये समाविष्ट आहेत' },

  // LEARN PAGE BANNER
  'learn.tag':   { hi:'Network Forensics', en:'Network Forensics', bn:'নেটওয়ার্ক ফরেনসিক্স', pa:'ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ', te:'నెట్వర్క్ ఫోరెన్సిక్స్', ta:'நெட்வொர்க் தடயவியல்', mr:'नेटवर्क फॉरेन्सिक्स' },
  'learn.title': { hi:'Network Forensics', en:'Network Forensics', bn:'নেটওয়ার্ক ফরেনসিক্স', pa:'ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ', te:'నెట్వర్క్ ఫోరెన్సిక్స్', ta:'நெட்வொர்க் தடயவியல்', mr:'नेटवर्क फॉरेन्सिक्स' },
  'learn.desc':  { hi:'Network traffic analyze karke digital evidence collect karna seekho. PCAP, Wireshark, malware traffic complete guide Hinglish mein.', en:'Learn to collect digital evidence by analyzing network traffic. PCAP, Wireshark, malware traffic complete guide.', bn:'নেটওয়ার্ক ট্রাফিক বিশ্লেষণ করে ডিজিটাল প্রমাণ সংগ্রহ শিখুন। PCAP, Wireshark সম্পূর্ণ গাইড।', pa:'ਨੈੱਟਵਰਕ ਟ੍ਰੈਫਿਕ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਕੇ ਡਿਜੀਟਲ ਸਬੂਤ ਇਕੱਠਾ ਕਰਨਾ ਸਿੱਖੋ।', te:'నెట్వర్క్ ట్రాఫిక్ విశ్లేషించి ఆధారాలు సేకరించడం నేర్చుకోండి.', ta:'நெட்வொர்க் ட்ராஃபிக்கை பகுப்பாய்வு செய்து சான்றுகள் சேகரிக்க கற்றுக்கொள்ளுங்கள்.', mr:'नेटवर्क ट्रॅफिक विश्लेषण करून डिजिटल पुरावे गोळा करणे शिका.' },

  // COURSES SECTION
  'courses.label':   { hi:'Courses', en:'Courses', bn:'কোর্স', pa:'ਕੋਰਸ', te:'కోర్సులు', ta:'படிப்புகள்', mr:'कोर्सेस' },
  'courses.heading': { hi:'Choose Your Path', en:'Choose Your Path', bn:'আপনার পথ বেছে নিন', pa:'ਆਪਣਾ ਰਾਹ ਚੁਣੋ', te:'మీ మార్గాన్ని ఎంచుకోండి', ta:'உங்கள் பாதையை தேர்ந்தெடுக்கவும்', mr:'आपला मार्ग निवडा' },
  'card.nf.title':   { hi:'Network Forensics', en:'Network Forensics', bn:'নেটওয়ার্ক ফরেনসিক্স', pa:'ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ', te:'నెట్వర్క్ ఫోరెన్సిక్స్', ta:'நெட்வொர்க் தடயவியல்', mr:'नेटवर्क फॉरेन्सिक्स' },
  'card.nf.desc':    { hi:'Network traffic analyze karke digital evidence collect karna seekho. PCAP, Wireshark, malware traffic complete guide Hindi mein.', en:'Learn to collect digital evidence by analyzing network traffic. Complete guide on PCAP, Wireshark, malware traffic.', bn:'নেটওয়ার্ক ট্রাফিক বিশ্লেষণ করে ডিজিটাল প্রমাণ সংগ্রহ করতে শিখুন। PCAP, Wireshark সম্পূর্ণ গাইড।', pa:'ਨੈੱਟਵਰਕ ਟ੍ਰੈਫਿਕ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਕੇ ਡਿਜੀਟਲ ਸਬੂਤ ਇਕੱਠਾ ਕਰਨਾ ਸਿੱਖੋ।', te:'నెట్వర్క్ ట్రాఫిక్ విశ్లేషించి డిజిటల్ ఆధారాలు సేకరించడం నేర్చుకోండి.', ta:'நெட்வொர்க் ட்ராஃபிக்கை பகுப்பாய்வு செய்து டிஜிட்டல் சான்றுகள் சேகரிக்க கற்றுக்கொள்ளுங்கள்.', mr:'नेटवर्क ट्रॅफिक विश्लेषण करून डिजिटल पुरावे गोळा करणे शिका.' },
  'card.nf.chapters':{ hi:'20 Chapters', en:'20 Chapters', bn:'20 অধ্যায়', pa:'20 ਅਧਿਆਏ', te:'20 అధ్యాయాలు', ta:'20 அத்தியாயங்கள்', mr:'20 अध्याय' },

  'card.ca.title':   { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स' },
  'card.ca.desc':    { hi:'Common cyber attacks samjho - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing aur unse defense karne ke tareeke.', en:'Understand common cyber attacks - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing and how to defend against them.', bn:'সাধারণ সাইবার আক্রমণ বুঝুন - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing এবং প্রতিরক্ষার উপায়।', pa:'ਆਮ ਸਾਈਬਰ ਹਮਲਿਆਂ ਨੂੰ ਸਮਝੋ - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing ਅਤੇ ਬਚਾਅ ਦੇ ਤਰੀਕੇ।', te:'సాధారణ సైబర్ దాడులను అర్థం చేసుకోండి - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing మరియు రక్షణ మార్గాలు.', ta:'பொதுவான சைபர் தாக்குதல்களை புரிந்துகொள்ளுங்கள் - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing மற்றும் பாதுகாப்பு வழிகள்.', mr:'सामान्य सायबर अटॅक्स समजून घ्या - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing आणि बचावाचे मार्ग.' },
  'card.ca.chapters':{ hi:'11 Chapters', en:'11 Chapters', bn:'11 অধ্যায়', pa:'11 ਅਧਿਆਏ', te:'11 అధ్యాయాలు', ta:'11 அத்தியாயங்கள்', mr:'11 अध्याय' },

  'courses.viewAll':  { hi:'View All Courses', en:'View All Courses', bn:'সব কোর্স দেখুন', pa:'ਸਾਰੇ ਕੋਰਸ ਵੇਖੋ', te:'అన్ని కోర్సులు చూడండి', ta:'அனைத்து படிப்புகளையும் காண்க', mr:'सर्व कोर्सेस पहा' },
  'allcourses.label':   { hi:'Courses', en:'Courses', bn:'কোর্স', pa:'ਕੋਰਸ', te:'కోర్సులు', ta:'படிப்புகள்', mr:'कोर्सेस' },
  'allcourses.heading': { hi:'All Courses', en:'All Courses', bn:'সব কোর্স', pa:'ਸਾਰੇ ਕੋਰਸ', te:'అన్ని కోర్సులు', ta:'அனைத்து படிப்புகளும்', mr:'सर्व कोर्सेस' },
  'allcourses.desc':    { hi:'Saare courses ek jagah. Jitna time milta hai utna naye courses add karte rehte hain, yahan hamesha latest list milegi.', en:'All courses in one place. New courses get added regularly, this page always shows the latest list.', bn:'সব কোর্স এক জায়গায়। নতুন কোর্স নিয়মিত যোগ করা হয়, এখানে সবসময় সর্বশেষ তালিকা পাবেন।', pa:'ਸਾਰੇ ਕੋਰਸ ਇੱਕ ਥਾਂ ਤੇ। ਨਵੇਂ ਕੋਰਸ ਨਿਯਮਿਤ ਤੌਰ ਤੇ ਸ਼ਾਮਲ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।', te:'అన్ని కోర్సులు ఒకే చోట. కొత్త కోర్సులు క్రమం తప్పకుండా జోడించబడతాయి.', ta:'அனைத்து படிப்புகளும் ஒரே இடத்தில். புதிய படிப்புகள் தொடர்ந்து சேர்க்கப்படும்.', mr:'सर्व कोर्सेस एकाच ठिकाणी. नवीन कोर्सेस नियमितपणे जोडले जातात.' },

  'card.alexsync.title':   { hi:'AlexSync', en:'AlexSync', bn:'AlexSync', pa:'AlexSync', te:'AlexSync', ta:'AlexSync', mr:'AlexSync' },
  'card.alexsync.desc':    { hi:'Set a time once. AlexSync wakes your laptop and starts music automatically at your chosen schedule.', en:'Set a time once. AlexSync wakes your laptop and starts music automatically at your chosen schedule.', bn:'Set a time once. AlexSync wakes your laptop and starts music automatically at your chosen schedule.', pa:'Set a time once. AlexSync wakes your laptop and starts music automatically at your chosen schedule.', te:'Set a time once. AlexSync wakes your laptop and starts music automatically at your chosen schedule.', ta:'Set a time once. AlexSync wakes your laptop and starts music automatically at your chosen schedule.', mr:'Set a time once. AlexSync wakes your laptop and starts music automatically at your chosen schedule.' },
  'card.alexsync.price':   { hi:'₹12/month', en:'₹12/month', bn:'₹12/month', pa:'₹12/month', te:'₹12/month', ta:'₹12/month', mr:'₹12/month' },

  'learn2.tag':   { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स' },
  'learn2.title': { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स' },
  'learn2.desc':  { hi:'Common cyber attacks samjho - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS attacks aur unse defense karne ke tareeke, complete Hinglish mein.', en:'Understand common cyber attacks - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS attacks and how to defend against them.', bn:'সাধারণ সাইবার আক্রমণ বুঝুন - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS আক্রমণ এবং প্রতিরক্ষার উপায়।', pa:'ਆਮ ਸਾਈਬਰ ਹਮਲਿਆਂ ਨੂੰ ਸਮਝੋ - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS ਹਮਲੇ ਅਤੇ ਬਚਾਅ ਦੇ ਤਰੀਕੇ।', te:'సాధారణ సైబర్ దాడులను అర్థం చేసుకోండి - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS దాడులు మరియు రక్షణ మార్గాలు.', ta:'பொதுவான சைபர் தாக்குதல்களை புரிந்துகொள்ளுங்கள் - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS தாக்குதல்கள் மற்றும் பாதுகாப்பு வழிகள்.', mr:'सामान्य सायबर अटॅक्स समजून घ्या - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS अटॅक्स आणि बचावाचे मार्ग.' },

  'learn3.tag':   { hi:'Ethical Hacking Complete Course', en:'Ethical Hacking Complete Course', bn:'এথিক্যাল হ্যাকিং সম্পূর্ণ কোর্স', pa:'ਐਥੀਕਲ ਹੈਕਿੰਗ ਕੰਪਲੀਟ ਕੋਰਸ', te:'ఎథికల్ హ్యాకింగ్ కంప్లీట్ కోర్స్', ta:'எத்திக்கல் ஹேக்கிங் முழுமையான பாடநெறி', mr:'एथिकल हॅकिंग कम्प्लीट कोर्स' },
  'learn3.title': { hi:'Ethical Hacking Complete Course', en:'Ethical Hacking Complete Course', bn:'এথিক্যাল হ্যাকিং সম্পূর্ণ কোর্স', pa:'ਐਥੀਕਲ ਹੈਕਿੰਗ ਕੰਪਲੀਟ ਕੋਰਸ', te:'ఎథికల్ హ్యాకింగ్ కంప్లీట్ కోర్స్', ta:'எத்திக்கல் ஹேக்கிங் முழுமையான பாடநெறி', mr:'एथिकल हॅकिंग कम्प्लीट कोर्स' },
  'learn3.desc':  { hi:'Complete CEH v13 based Ethical Hacking course, basic se advance tak, saath mein AI Security, Cloud Native Security aur IoT Security, poora Hinglish mein.', en:'Complete CEH v13 based Ethical Hacking course, basic to advance, along with AI Security, Cloud Native Security and IoT Security.', bn:'সম্পূর্ণ CEH v13 ভিত্তিক এথিক্যাল হ্যাকিং কোর্স, বেসিক থেকে অ্যাডভান্স, সাথে AI Security, Cloud Native Security এবং IoT Security।', pa:'ਪੂਰਾ CEH v13 ਆਧਾਰਿਤ ਐਥੀਕਲ ਹੈਕਿੰਗ ਕੋਰਸ, ਬੇਸਿਕ ਤੋਂ ਐਡਵਾਂਸ ਤੱਕ, ਨਾਲ AI Security, Cloud Native Security ਅਤੇ IoT Security।', te:'పూర్తి CEH v13 ఆధారిత ఎథికల్ హ్యాకింగ్ కోర్స్, బేసిక్ నుండి అడ్వాన్స్ వరకు, AI Security, Cloud Native Security మరియు IoT Security‌తో పాటు.', ta:'முழுமையான CEH v13 அடிப்படையிலான எத்திக்கல் ஹேக்கிங் பாடநெறி, அடிப்படையிலிருந்து மேம்பட்ட நிலை வரை, AI Security, Cloud Native Security மற்றும் IoT Security உடன்.', mr:'संपूर्ण CEH v13 आधारित एथिकल हॅकिंग कोर्स, बेसिक ते अॅडव्हान्स पर्यंत, AI Security, Cloud Native Security आणि IoT Security सह.' },

  // ABOUT
  'about.label':     { hi:'About', en:'About', bn:'সম্পর্কে', pa:'ਬਾਰੇ', te:'గురించి', ta:'பற்றி', mr:'बद्दल' },
  'about.whois':     { hi:'Who is', en:'Who is', bn:'কে হলেন', pa:'ਕੌਣ ਹੈ', te:'ఎవరు', ta:'யார்', mr:'कोण आहे' },
  'about.p1':        { hl:'Hi, Main Pavan Kumar Hoon, Jo Online AlexCyberX Ke Naam Se Jaana Jaata Hoon. Main Jhalawar, Rajasthan Se Hoon Aur University Of Kota Mein BCA Kar Raha Hoon. Main AlexCyberX Ka Founder Hoon, Yahi Cybersecurity Education Platform Jispe Abhi Tum Ho, Jahan Main Tutorials, Tools Aur Hands-On CTF Labs Banata Hoon Jo Networking Aur Cybersecurity Concepts Practical Tarike Se Sikhate Hain. Main Instagram Par @alex.cyberx Ke Naam Se Networking Aur Cybersecurity Related Educational Content Bhi Banata Hoon, Concepts Ko Simple Aur Samajhne Layak Tarike Se Explain Karta Hoon.', hi:'नमस्ते, मैं Pavan Kumar हूं, जिसे ऑनलाइन AlexCyberX के नाम से जाना जाता है। मैं Jhalawar, Rajasthan से हूं और University of Kota से BCA कर रहा हूं। मैं AlexCyberX का founder हूं, यही cybersecurity education platform जिस पर तुम अभी हो, जहां मैं tutorials, tools और hands-on CTF labs बनाता हूं जो networking और cybersecurity concepts को practical तरीके से सिखाते हैं। मैं Instagram पर @alex.cyberx के नाम से networking और cybersecurity से जुड़ा educational content भी बनाता हूं, concepts को simple और समझने लायक तरीके से explain करता हूं।', en:'Hi, I Am Pavan Kumar, Known Online As AlexCyberX. I Am From Jhalawar, Rajasthan, And Currently Pursuing A BCA At The University Of Kota. I Am The Founder Of AlexCyberX, The Cybersecurity Education Platform You Are On Right Now, Where I Build The Tutorials, Tools, And Hands-On CTF Labs That Teach Networking And Cybersecurity Concepts In A Practical Way. I Also Create Networking And Cybersecurity Educational Content On Instagram Under @alex.cyberx, Breaking Down Concepts In A Simple, Easy-To-Follow Way.', bn:'হাই, আমি Pavan Kumar, যিনি অনলাইনে AlexCyberX নামে পরিচিত। আমি রাজস্থানের ঝালাওয়ার থেকে এবং বর্তমানে University of Kota থেকে BCA করছি। আমি AlexCyberX-এর founder, এই cybersecurity education platform যেখানে তুমি এখন আছো, যেখানে আমি টিউটোরিয়াল, টুলস এবং hands-on CTF labs তৈরি করি যা networking এবং cybersecurity concepts প্র্যাক্টিক্যালভাবে শেখায়। আমি Instagram-এ @alex.cyberx নামে networking এবং cybersecurity সম্পর্কিত educational content-ও তৈরি করি, concepts গুলো সহজ ও বোঝার মতো করে ব্যাখ্যা করি।', pa:'ਹੈਲੋ, ਮੈਂ Pavan Kumar ਹਾਂ, ਜਿਸਨੂੰ ਆਨਲਾਈਨ AlexCyberX ਵਜੋਂ ਜਾਣਿਆ ਜਾਂਦਾ ਹੈ। ਮੈਂ ਝਾਲਾਵਾੜ, ਰਾਜਸਥਾਨ ਤੋਂ ਹਾਂ ਅਤੇ ਇਸ ਵੇਲੇ University of Kota ਤੋਂ BCA ਕਰ ਰਿਹਾ ਹਾਂ। ਮੈਂ AlexCyberX ਦਾ founder ਹਾਂ, ਇਹੀ cybersecurity education platform ਜਿਸ ਤੇ ਤੁਸੀਂ ਹੁਣ ਹੋ, ਜਿੱਥੇ ਮੈਂ tutorials, tools ਅਤੇ hands-on CTF labs ਬਣਾਉਂਦਾ ਹਾਂ ਜੋ networking ਅਤੇ cybersecurity concepts ਨੂੰ practical ਤਰੀਕੇ ਨਾਲ ਸਿਖਾਉਂਦੇ ਹਨ। ਮੈਂ Instagram ਤੇ @alex.cyberx ਨਾਮ ਹੇਠ networking ਅਤੇ cybersecurity ਨਾਲ ਜੁੜਿਆ educational content ਵੀ ਬਣਾਉਂਦਾ ਹਾਂ, concepts ਨੂੰ ਸਧਾਰਨ ਅਤੇ ਸਮਝਣ ਯੋਗ ਤਰੀਕੇ ਨਾਲ ਸਮਝਾਉਂਦਾ ਹਾਂ।', te:'హాయ్, నేను Pavan Kumar, ఆన్‌లైన్‌లో AlexCyberX గా పరిచయం. నేను రాజస్థాన్‌లోని ఝాలావార్ నుండి వచ్చాను మరియు ప్రస్తుతం University of Kota నుండి BCA చదువుతున్నాను. నేను AlexCyberX యొక్క founder, మీరు ఇప్పుడు ఉన్న ఈ cybersecurity education platform, ఇక్కడ నేను tutorials, tools మరియు hands-on CTF labs నిర్మిస్తాను, ఇవి networking మరియు cybersecurity concepts ను practical గా నేర్పిస్తాయి. నేను Instagramలో @alex.cyberx పేరుతో networking మరియు cybersecurity సంబంధిత educational content కూడా సృష్టిస్తాను, concepts ను సరళంగా, సులభంగా అర్థమయ్యేలా వివరిస్తాను.', ta:'வணக்கம், நான் Pavan Kumar, AlexCyberX என்ற பெயரில் ஆன்லைனில் அறியப்படுகிறேன். நான் ராஜஸ்தான், ஜலாவாரைச் சேர்ந்தவன், தற்போது University of Kota-வில் BCA படித்து வருகிறேன். நான் AlexCyberX-இன் founder, நீங்கள் இப்போது இருக்கும் இந்த cybersecurity education platform, இங்கு நெட்வொர்க்கிங் மற்றும் சைபர் பாதுகாப்பு கருத்துகளை நடைமுறை ரீதியாகக் கற்பிக்கும் tutorials, tools மற்றும் hands-on CTF labs-ஐ நான் உருவாக்குகிறேன். நான் Instagram-இல் @alex.cyberx என்ற பெயரில் நெட்வொர்க்கிங் மற்றும் சைபர் பாதுகாப்பு தொடர்பான கல்வி உள்ளடக்கத்தையும் உருவாக்குகிறேன், கருத்துகளை எளிமையாகவும் புரிந்துகொள்ளக்கூடியதாகவும் விளக்குகிறேன்.', mr:'नमस्कार, मी Pavan Kumar आहे, जो ऑनलाइन AlexCyberX म्हणून ओळखला जातो. मी जालावर, राजस्थानचा आहे आणि सध्या University of Kota मधून BCA करत आहे. मी AlexCyberX चा founder आहे, हेच cybersecurity education platform ज्यावर तुम्ही आता आहात, जिथे मी tutorials, tools आणि hands-on CTF labs बनवतो जे networking आणि cybersecurity concepts प्रॅक्टिकल पद्धतीने शिकवतात. मी Instagram वर @alex.cyberx या नावाने networking आणि cybersecurity संबंधित शैक्षणिक कंटेंट देखील तयार करतो, संकल्पना सोप्या आणि समजण्याजोग्या पद्धतीने समजावतो.' },

  // CONTACT
  'contact.label':   { hi:'Connect', en:'Connect', bn:'সংযোগ', pa:'ਜੁੜੋ', te:'కనెక్ట్', ta:'இணைக்க', mr:'कनेक्ट' },
  'contact.heading': { hi:'Get in Touch', en:'Get in Touch', bn:'যোগাযোগ করুন', pa:'ਸੰਪਰਕ ਕਰੋ', te:'సంప్రదించండి', ta:'தொடர்பு கொள்ளுங்கள்', mr:'संपर्क करा' },
  'contact.sub':     { hi:'Questions, collaborations, ya kuch sikhna hai reach out karo.', en:'Questions, collaborations, or want to learn something - reach out.', bn:'প্রশ্ন, সহযোগিতা, বা কিছু শিখতে চান - যোগাযোগ করুন।', pa:'ਸਵਾਲ, ਸਹਿਯੋਗ, ਜਾਂ ਕੁਝ ਸਿੱਖਣਾ ਹੈ - ਸੰਪਰਕ ਕਰੋ।', te:'ప్రశ్నలు, సహకారం, లేదా ఏదైనా నేర్చుకోవాలంటే - సంప్రదించండి.', ta:'கேள்விகள், ஒத்துழைப்பு, அல்லது ஏதாவது கற்றுக்கொள்ள - தொடர்பு கொள்ளுங்கள்.', mr:'प्रश्न, सहयोग, किंवा काही शिकायचे असल्यास - संपर्क करा.' },

  // CONTACT FORM
  'form.title':      { hi:'Send Message', en:'Send Message', bn:'বার্তা পাঠান', pa:'ਸੁਨੇਹਾ ਭੇਜੋ', te:'సందేశం పంపు', ta:'செய்தி அனுப்பு', mr:'संदेश पाठवा' },
  'form.name':       { hi:'Name', en:'Name', bn:'নাম', pa:'ਨਾਮ', te:'పేరు', ta:'பெயர்', mr:'नाव' },
  'form.name.ph':    { hi:'Aapka naam', en:'Your name', bn:'আপনার নাম', pa:'ਤੁਹਾਡਾ ਨਾਮ', te:'మీ పేరు', ta:'உங்கள் பெயர்', mr:'तुमचे नाव' },
  'form.email.ph':   { hi:'aap@email.com', en:'your@email.com', bn:'আপনার@ইমেইল.com', pa:'ਤੁਹਾਡਾ@ਈਮੇਲ.com', te:'మీ@ఇమెయిల్.com', ta:'உங்கள்@மின்னஞ்சல்.com', mr:'तुमचा@ईमेल.com' },
  'form.email':      { hi:'Email', en:'Email', bn:'ইমেল', pa:'ਈਮੇਲ', te:'ఇమెయిల్', ta:'மின்னஞ்சல்', mr:'ईमेल' },
  'form.msg':        { hi:'Message', en:'Message', bn:'বার্তা', pa:'ਸੁਨੇਹਾ', te:'సందేశం', ta:'செய்தி', mr:'संदेश' },
  'form.msg.ph':     { hi:'Yahan likho...', en:'Write here...', bn:'এখানে লিখুন...', pa:'ਇੱਥੇ ਲਿਖੋ...', te:'ఇక్కడ రాయండి...', ta:'இங்கே எழுதுங்கள்...', mr:'इथे लिहा...' },
  'form.send':       { hi:'Send Message', en:'Send Message', bn:'বার্তা পাঠান', pa:'ਸੁਨੇਹਾ ਭੇਜੋ', te:'సందేశం పంపు', ta:'செய்தி அனுப்பு', mr:'संदेश पाठवा' },

  // CONTACT FORM - STATUS / VALIDATION MESSAGES
  'form.status.nameRequired':   { hi:'Apna naam daalo.', en:'Please enter your name.', bn:'আপনার নাম লিখুন।', pa:'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ।', te:'మీ పేరు నమోదు చేయండి.', ta:'உங்கள் பெயரை உள்ளிடவும்.', mr:'तुमचे नाव टाका.' },
  'form.status.nameTooLong':    { hi:'Naam bahut lamba hai.', en:'Name is too long.', bn:'নাম অনেক বড়।', pa:'ਨਾਮ ਬਹੁਤ ਲੰਬਾ ਹੈ।', te:'పేరు చాలా పొడవుగా ఉంది.', ta:'பெயர் மிக நீளமாக உள்ளது.', mr:'नाव खूप लांब आहे.' },
  'form.status.emailInvalid':   { hi:'Valid email daalo.', en:'Please enter a valid email.', bn:'একটি সঠিক ইমেল লিখুন।', pa:'ਸਹੀ ਈਮੇਲ ਦਰਜ ਕਰੋ।', te:'సరైన ఇమెయిల్ నమోదు చేయండి.', ta:'சரியான மின்னஞ்சலை உள்ளிடவும்.', mr:'वैध ईमेल टाका.' },
  'form.status.msgTooShort':    { hi:'Message kam se kam 10 characters ka hona chahiye.', en:'Message must be at least 10 characters.', bn:'বার্তা কমপক্ষে ১০ অক্ষরের হতে হবে।', pa:'ਸੁਨੇਹਾ ਘੱਟੋ-ਘੱਟ 10 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।', te:'సందేశం కనీసం 10 అక్షరాలు ఉండాలి.', ta:'செய்தி குறைந்தது 10 எழுத்துகள் இருக்க வேண்டும்.', mr:'संदेश किमान 10 अक्षरांचा असावा.' },
  'form.status.msgTooLong':     { hi:'Message 1000 characters se zyada nahi ho sakta.', en:'Message cannot exceed 1000 characters.', bn:'বার্তা ১০০০ অক্ষরের বেশি হতে পারে না।', pa:'ਸੁਨੇਹਾ 1000 ਅੱਖਰਾਂ ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋ ਸਕਦਾ।', te:'సందేశం 1000 అక్షరాలు మించకూడదు.', ta:'செய்தி 1000 எழுத்துகளுக்கு மேல் இருக்கக்கூடாது.', mr:'संदेश 1000 अक्षरांपेक्षा जास्त असू शकत नाही.' },
  'form.status.noHtml':         { hi:'Special characters allowed nahi hain.', en:'Special characters are not allowed.', bn:'বিশেষ অক্ষর অনুমোদিত নয়।', pa:'ਖ਼ਾਸ ਅੱਖਰਾਂ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਹੈ।', te:'ప్రత్యేక అక్షరాలు అనుమతించబడవు.', ta:'சிறப்பு எழுத்துக்கள் அனுமதிக்கப்படாது.', mr:'विशेष अक्षरांना परवानगी नाही.' },
  'form.status.sendError':      { hi:'Message send nahi hua. Dobara try karo.', en:'Message could not be sent. Please try again.', bn:'বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।', pa:'ਸੁਨੇਹਾ ਭੇਜਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', te:'సందేశం పంపబడలేదు. మళ్లీ ప్రయత్నించండి.', ta:'செய்தி அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', mr:'संदेश पाठवता आला नाही. पुन्हा प्रयत्न करा.' },
  'form.status.sendErrorRetry': { hi:'Message send nahi hua. Thodi der mein dobara try karo.', en:'Message could not be sent. Please try again in a moment.', bn:'বার্তা পাঠানো যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।', pa:'ਸੁਨੇਹਾ ਭੇਜਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', te:'సందేశం పంపబడలేదు. కొద్ది సేపటిలో మళ్లీ ప్రయత్నించండి.', ta:'செய்தி அனுப்ப முடியவில்லை. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்.', mr:'संदेश पाठवता आला नाही. थोड्या वेळाने पुन्हा प्रयत्न करा.' },
  'form.status.success':        { hi:'Message mil gaya! Jaldi reply karenge.', en:'Message received! We will reply soon.', bn:'বার্তা পাওয়া গেছে! শীঘ্রই উত্তর দেব।', pa:'ਸੁਨੇਹਾ ਮਿਲ ਗਿਆ! ਜਲਦੀ ਜਵਾਬ ਦੇਵਾਂਗੇ।', te:'సందేశం అందింది! త్వరలో సమాధానం ఇస్తాము.', ta:'செய்தி கிடைத்தது! விரைவில் பதிலளிப்போம்.', mr:'संदेश मिळाला! लवकरच उत्तर देऊ.' },

  // FOOTER
  'footer.copy':     { hi:'© 2025 AlexCyberX. All rights reserved.', en:'© 2025 AlexCyberX. All rights reserved.', bn:'© 2025 AlexCyberX. সর্বস্বত্ব সংরক্ষিত।', pa:'© 2025 AlexCyberX. ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।', te:'© 2025 AlexCyberX. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.', ta:'© 2025 AlexCyberX. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', mr:'© 2025 AlexCyberX. सर्व हक्क राखीव.' },
};

/* ─── GET SINGLE DICT STRING (for dynamic messages like form status) ─── */
function getDictText(key, lang) {
  const useLang = lang || selectedLang;
  const entry = DICT[key];
  if (!entry) return null;
  return entry[useLang] || (useLang === 'hl' ? entry['hi'] : null) || entry['en'] || null;
}

/* ─── APPLY TRANSLATIONS ─── */
function applyDictTranslations(lang) {
  const get = k => DICT[k] && (DICT[k][lang] || (lang==='hl' ? DICT[k]['hi'] : null));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = get(el.getAttribute('data-i18n')); if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = get(el.getAttribute('data-i18n-placeholder')); if (v) el.placeholder = v;
  });
}

/* ─── APPLY LANGUAGE (called from modal + nav) ─── */
function applyLanguage() {
  localStorage.setItem(LANG_KEY, selectedLang);
  // Mark that modal has been seen - never auto-show again
  localStorage.setItem('acx_lang_seen', '1');
  hideLangModal();
  updateAllLabels();
  applyDictTranslations(selectedLang);

  // RTL support for Arabic/Urdu
  if (selectedLang === 'ar' || selectedLang === 'ur') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
  }

  // Restore original Hinglish first
  if (currentPage === 'learn2') {
    const box2 = document.getElementById('cyberChapterContent');
    const origKey2 = 'cyber_orig_' + currentCyberChapter;
    if (box2 && chapterCache[origKey2]) box2.innerHTML = chapterCache[origKey2];
  } else if (currentPage === 'learn3') {
    const box3 = document.getElementById('ethicalChapterContent');
    const origKey3 = 'ethical_orig_' + currentEthicalChapter;
    if (box3 && chapterCache[origKey3]) box3.innerHTML = chapterCache[origKey3];
  } else {
    const box = document.getElementById('chapterContent');
    const origKey = 'orig_' + currentChapter;
    if (box && chapterCache[origKey]) box.innerHTML = chapterCache[origKey];
  }

  // Then translate if needed (English included) and on a learn page
  if (selectedLang !== 'hl') {
    if (currentPage === 'learn') {
      applyChapterTranslation(selectedLang);
    } else if (currentPage === 'learn2') {
      applyChapterTranslation(selectedLang, true);
    } else if (currentPage === 'learn3') {
      applyChapterTranslation(selectedLang, 'ethical');
    } else if (currentPage === 'ctf') {
      applyCTFTranslation(selectedLang);
    } else if (typeof applyLabTranslation === 'function') {
      applyLabTranslation(selectedLang);
    }
  } else if (currentPage === 'ctf') {
    // Hinglish selected, applyCTFTranslation khud decide karta hai
    // ki original Hinglish dikhana hai
    if (typeof applyCTFTranslation === 'function') applyCTFTranslation(selectedLang);
  } else if (typeof restoreLabTranslation === 'function') {
    restoreLabTranslation();
  }
}

/* ─── INIT on page load ─── */
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(LANG_KEY);
  const modalSeen = localStorage.getItem('acx_lang_seen');

  if (!saved && !modalSeen) {
    // First ever visit - show modal once
    setTimeout(showLangModal, 700);
  } else {
    // Returning visitor - apply saved lang, never show modal automatically
    if (saved) selectedLang = saved;
    updateAllLabels();
    applyDictTranslations(selectedLang);
    if (selectedLang !== 'hl' && typeof applyLabTranslation === 'function') {
      applyLabTranslation(selectedLang);
    }
    if (currentPage === 'ctf' && typeof applyCTFTranslation === 'function') {
      applyCTFTranslation(selectedLang);
    }
  }
});
