
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
  'stat.chapters':  { hi:'Chapters', en:'Chapters',        bn:'অধ্যায়',       pa:'ਅਧਿਆਏ',      te:'అధ్యాయాలు',    ta:'அத்தியாயங்கள்', mr:'अध्याय'       },
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

  // STATS
  'stat.community':  { hi:'Community', en:'Community', bn:'কমিউনিটি', pa:'ਕਮਿਊਨਿਟੀ', te:'కమ్యూనిటీ', ta:'சமூகம்', mr:'समुदाय' },
  'stat.practical':  { hi:'Practical', en:'Practical', bn:'ব্যবহারিক', pa:'ਵਿਹਾਰਕ', te:'ఆచరణాత్మక', ta:'நடைமுறை', mr:'व्यावहारिक' },
  'stat.always':     { hi:'Always', en:'Always', bn:'সবসময়', pa:'ਹਮੇਸ਼ਾ', te:'ఎల్లప్పుడూ', ta:'எப்போதும்', mr:'नेहमी' },

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

  'learn2.tag':   { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स' },
  'learn2.title': { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स' },
  'learn2.desc':  { hi:'Common cyber attacks samjho - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS attacks aur unse defense karne ke tareeke, complete Hinglish mein.', en:'Understand common cyber attacks - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS attacks and how to defend against them.', bn:'সাধারণ সাইবার আক্রমণ বুঝুন - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS আক্রমণ এবং প্রতিরক্ষার উপায়।', pa:'ਆਮ ਸਾਈਬਰ ਹਮਲਿਆਂ ਨੂੰ ਸਮਝੋ - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS ਹਮਲੇ ਅਤੇ ਬਚਾਅ ਦੇ ਤਰੀਕੇ।', te:'సాధారణ సైబర్ దాడులను అర్థం చేసుకోండి - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS దాడులు మరియు రక్షణ మార్గాలు.', ta:'பொதுவான சைபர் தாக்குதல்களை புரிந்துகொள்ளுங்கள் - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS தாக்குதல்கள் மற்றும் பாதுகாப்பு வழிகள்.', mr:'सामान्य सायबर अटॅक्स समजून घ्या - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS अटॅक्स आणि बचावाचे मार्ग.' },

  // ABOUT
  'about.label':     { hi:'About', en:'About', bn:'সম্পর্কে', pa:'ਬਾਰੇ', te:'గురించి', ta:'பற்றி', mr:'बद्दल' },
  'about.whois':     { hi:'Who is', en:'Who is', bn:'কে হলেন', pa:'ਕੌਣ ਹੈ', te:'ఎవరు', ta:'யார்', mr:'कोण आहे' },
  'about.p1':        { hl:'Hi, main Pawan hoon (AlexCyberX), Jhalawar, Rajasthan se ek Certified Ethical Hacker. Mujhe network forensics mein interest hai, basically yeh samajhna ki kisi attack ke dauran actually kya hua tha.', hi:'मैं Pawan हूं (AlexCyberX), Jhalawar, Rajasthan से एक Certified Ethical Hacker। मुझे Network Forensics में दिलचस्पी है, यानी किसी attack के दौरान असल में क्या हुआ था यह पता लगाना।', en:'Hi, I am Pawan (AlexCyberX), a Certified Ethical Hacker from Jhalawar, Rajasthan. I am into network forensics, basically figuring out what actually happened during an attack.', bn:'হাই, আমি পবন (AlexCyberX), রাজস্থানের ঝালাওয়ার থেকে একজন Certified Ethical Hacker। আমার নেটওয়ার্ক ফরেনসিক্সে আগ্রহ আছে, মূলত একটি অ্যাটাকের সময় আসলে কী ঘটেছিল তা বের করা।', pa:'ਹੈਲੋ, ਮੈਂ ਪਵਨ ਹਾਂ (AlexCyberX), ਝਾਲਾਵਾੜ, ਰਾਜਸਥਾਨ ਤੋਂ ਇੱਕ Certified Ethical Hacker। ਮੈਨੂੰ ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ ਵਿੱਚ ਦਿਲਚਸਪੀ ਹੈ, ਯਾਨੀ ਇਹ ਪਤਾ ਲਗਾਉਣਾ ਕਿ ਹਮਲੇ ਦੌਰਾਨ ਅਸਲ ਵਿੱਚ ਕੀ ਹੋਇਆ।', te:'హాయ్, నేను పవన్ (AlexCyberX), రాజస్థాన్‌లోని ఝాలావార్ నుండి ఒక Certified Ethical Hacker. నాకు నెట్‌వర్క్ ఫోరెన్సిక్స్‌పై ఆసక్తి ఉంది, అంటే ఒక అటాక్ సమయంలో నిజంగా ఏం జరిగిందో కనుగొనడం.', ta:'வணக்கம், நான் பவன் (AlexCyberX), ராஜஸ்தான், ஜலாவாரிலிருந்து ஒரு Certified Ethical Hacker. நெட்வொர்க் தடயவியலில் எனக்கு ஆர்வம் உண்டு, அதாவது ஒரு தாக்குதலின் போது உண்மையில் என்ன நடந்தது என்பதைக் கண்டறிவது.', mr:'हाय, मी पवन (AlexCyberX), जालावर, राजस्थानमधील एक Certified Ethical Hacker आहे. मला नेटवर्क फॉरेन्सिक्समध्ये रस आहे, म्हणजे हल्ल्यादरम्यान खरंच काय घडलं हे शोधणं.' },
  'about.p2':        { hl:'Mujhe attacks ko padhne se zyada yeh samajhna pasand hai ki woh actually kaam kaise karte hain. Aage chal kar main real cyber crime cases pe kaam karna chahta hoon aur case analysis mein madad karna chahta hoon.', hi:'मुझे attacks के बारे में पढ़ने से ज्यादा यह समझना पसंद है कि वे असल में कैसे काम करते हैं। आगे चलकर मैं real cyber crime cases पर काम करना चाहता हूं और case analysis में मदद करना चाहता हूं।', en:'I like understanding how attacks actually work instead of just reading about them. Long term, I want to work on real cyber crime cases and help with case analysis.', bn:'আমি অ্যাটাক সম্পর্কে শুধু পড়ার চেয়ে এটা আসলে কীভাবে কাজ করে তা বুঝতে পছন্দ করি। দীর্ঘমেয়াদে, আমি আসল সাইবার ক্রাইম কেসে কাজ করতে চাই এবং কেস অ্যানালিসিসে সাহায্য করতে চাই।', pa:'ਮੈਨੂੰ ਹਮਲਿਆਂ ਬਾਰੇ ਸਿਰਫ਼ ਪੜ੍ਹਨ ਨਾਲੋਂ ਇਹ ਸਮਝਣਾ ਪਸੰਦ ਹੈ ਕਿ ਉਹ ਅਸਲ ਵਿੱਚ ਕਿਵੇਂ ਕੰਮ ਕਰਦੇ ਹਨ। ਅੱਗੇ ਜਾ ਕੇ ਮੈਂ ਅਸਲ ਸਾਈਬਰ ਕ੍ਰਾਈਮ ਕੇਸਾਂ ਤੇ ਕੰਮ ਕਰਨਾ ਚਾਹੁੰਦਾ ਹਾਂ ਅਤੇ ਕੇਸ ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਮਦਦ ਕਰਨਾ ਚਾਹੁੰਦਾ ਹਾਂ।', te:'దాడుల గురించి చదవడం కంటే అవి నిజంగా ఎలా పనిచేస్తాయో అర్థం చేసుకోవడం నాకు ఇష్టం. భవిష్యత్తులో, నేను నిజమైన సైబర్ క్రైమ్ కేసులపై పని చేయాలని, కేస్ విశ్లేషణలో సహాయం చేయాలని అనుకుంటున్నాను.', ta:'தாக்குதல்களைப் பற்றி படிப்பதைவிட அவை உண்மையில் எவ்வாறு செயல்படுகின்றன என்பதைப் புரிந்துகொள்வதே எனக்குப் பிடிக்கும். நீண்ட காலத்தில், நிஜமான சைபர் கிரைம் வழக்குகளில் பணியாற்றவும், வழக்கு பகுப்பாய்வில் உதவவும் விரும்புகிறேன்.', mr:'हल्ल्यांबद्दल फक्त वाचण्यापेक्षा ते खरंच कसे काम करतात हे समजून घ्यायला मला आवडतं. पुढे जाऊन मला खऱ्या सायबर क्राइम केसेसवर काम करायचं आहे आणि केस अॅनालिसिसमध्ये मदत करायची आहे.' },
  'about.p3':        { hl:'Main Instagram pe @alex.cyberx bhi chalata hoon, jahan CTF writeups aur jo bhi naya seekh raha hoon woh share karta hoon.', hi:'मैं Instagram पर @alex.cyberx भी चलाता हूं, जहां मैं CTF writeups और जो भी नया सीख रहा हूं वह शेयर करता हूं।', en:'I also run @alex.cyberx on Instagram, where I share CTF writeups and whatever I am learning along the way.', bn:'আমি Instagram-এ @alex.cyberx-ও চালাই, যেখানে আমি CTF writeups এবং যা কিছু শিখছি তা শেয়ার করি।', pa:'ਮੈਂ Instagram ਤੇ @alex.cyberx ਵੀ ਚਲਾਉਂਦਾ ਹਾਂ, ਜਿੱਥੇ ਮੈਂ CTF writeups ਅਤੇ ਜੋ ਵੀ ਨਵਾਂ ਸਿੱਖ ਰਿਹਾ ਹਾਂ ਉਹ ਸਾਂਝਾ ਕਰਦਾ ਹਾਂ।', te:'నేను Instagramలో @alex.cyberx కూడా నడుపుతున్నాను, అక్కడ నేను CTF writeups మరియు నేను నేర్చుకుంటున్నవి షేర్ చేస్తాను.', ta:'நான் Instagram-இல் @alex.cyberx-ஐயும் நடத்துகிறேன், அங்கு CTF writeups மற்றும் நான் கற்றுக்கொள்வதை பகிர்கிறேன்.', mr:'मी Instagram वर @alex.cyberx देखील चालवतो, जिथे मी CTF writeups आणि मी जे काही शिकत आहे ते शेअर करतो.' },

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

  // FOOTER
  'footer.copy':     { hi:'© 2025 AlexCyberX. All rights reserved.', en:'© 2025 AlexCyberX. All rights reserved.', bn:'© 2025 AlexCyberX. সর্বস্বত্ব সংরক্ষিত।', pa:'© 2025 AlexCyberX. ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।', te:'© 2025 AlexCyberX. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.', ta:'© 2025 AlexCyberX. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', mr:'© 2025 AlexCyberX. सर्व हक्क राखीव.' },
};

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
  } else {
    const box = document.getElementById('chapterContent');
    const origKey = 'orig_' + currentChapter;
    if (box && chapterCache[origKey]) box.innerHTML = chapterCache[origKey];
  }

  // Then translate if needed and on a learn page
  if (selectedLang !== 'en' && selectedLang !== 'hl') {
    if (currentPage === 'learn') {
      applyChapterTranslation(selectedLang);
    } else if (currentPage === 'learn2') {
      applyChapterTranslation(selectedLang, true);
    } else if (currentPage === 'ctf') {
      applyCTFTranslation(selectedLang);
    } else if (typeof applyLabTranslation === 'function') {
      applyLabTranslation(selectedLang);
    }
  } else if (currentPage === 'ctf') {
    // Hinglish/English selected — restore original text
    restoreCTFOriginal();
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
    if (selectedLang !== 'en' && selectedLang !== 'hl' && typeof applyLabTranslation === 'function') {
      applyLabTranslation(selectedLang);
    }
  }
});
