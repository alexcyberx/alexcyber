
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
  'nav.home':       { hi:'Home',      en:'Home',      ur:'ہوم',        bn:'হোম',          pa:'ਹੋਮ',        te:'హోమ్',     ta:'முகப்பு',      mr:'मुख्यपृष्ठ', gu:'હોમ',      ar:'الرئيسية',    fr:'Accueil',   es:'Inicio',      de:'Startseite',   ru:'Главная',  zh:'首页',    id:'Beranda'   },
  'nav.tutorials':  { hi:'Tutorials', en:'Tutorials', ur:'ٹیوٹوریلز',  bn:'টিউটোরিয়াল',  pa:'ਟਿਊਟੋਰੀਅਲ', te:'ట్యుటోరియల్', ta:'பயிற்சிகள்', mr:'ट्यूटोरियल',  gu:'ટ્યુટોરિયલ', ar:'الدروس',      fr:'Tutoriels', es:'Tutoriales',  de:'Tutorials',    ru:'Уроки',    zh:'教程',    id:'Tutorial'  },
  'nav.about':      { hi:'About',     en:'About',     ur:'بارے میں',   bn:'সম্পর্কে',     pa:'ਬਾਰੇ',       te:'గురించి',  ta:'பற்றி',        mr:'बद्दल',      gu:'વિશે',     ar:'عن',          fr:'À propos',  es:'Acerca de',   de:'Über uns',     ru:'О нас',    zh:'关于',    id:'Tentang'   },
  'nav.contact':    { hi:'Contact',   en:'Contact',   ur:'رابطہ',      bn:'যোগাযোগ',      pa:'ਸੰਪਰਕ',      te:'సంప్రదించు',ta:'தொடர்பு',      mr:'संपर्क',     gu:'સંપર્ક',   ar:'اتصل بنا',    fr:'Contact',   es:'Contacto',    de:'Kontakt',      ru:'Контакты', zh:'联系',    id:'Kontak'    },
  'nav.login':      { hi:'Login',     en:'Login',     ur:'لاگ ان',     bn:'লগইন',         pa:'ਲਾਗਿਨ',      te:'లాగిన్',   ta:'உள்நுழை',      mr:'लॉगिन',      gu:'લૉગિન',    ar:'تسجيل دخول', fr:'Connexion', es:'Iniciar',     de:'Anmelden',     ru:'Войти',    zh:'登录',    id:'Masuk'     },
  'nav.signup':     { hi:'Sign Up',   en:'Sign Up',   ur:'سائن اپ',    bn:'সাইন আপ',      pa:'ਸਾਈਨ ਅੱਪ',   te:'సైన్ అప్', ta:'பதிவு செய்',   mr:'साइन अप',    gu:'સાઇન અપ',  ar:'إنشاء حساب', fr:"S'inscrire", es:'Registrarse', de:'Registrieren', ru:'Регистрация',zh:'注册',   id:'Daftar'    },
  'nav.lang':       { hi:'Hindi',     en:'English',   ur:'Urdu',       bn:'Bengali',      pa:'Punjabi',    te:'Telugu',   ta:'Tamil',        mr:'Marathi',    gu:'Gujarati', ar:'Arabic',      fr:'French',    es:'Spanish',     de:'Deutsch',      ru:'Russian',  zh:'中文',    id:'Indonesia' },

  'hero.cta1':      { hi:'Start Learning',   en:'Start Learning',   ur:'سیکھنا شروع کریں', bn:'শেখা শুরু করুন',  pa:'ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ', te:'నేర్చుకోవడం ప్రారంభించండి', ta:'கற்க தொடங்கு',  mr:'शिकणे सुरू करा',  gu:'શીખવાનું શરૂ કરો', ar:'ابدأ التعلم',     fr:'Commencer',        es:'Comenzar',        de:'Loslegen',     ru:'Начать учиться', zh:'开始学习', id:'Mulai Belajar' },
  'hero.cta2':      { hi:'Meet AlexCyberX',  en:'Meet AlexCyberX',  ur:'AlexCyberX سے ملیں', bn:'AlexCyberX জানুন', pa:'AlexCyberX ਨੂੰ ਮਿਲੋ', te:'AlexCyberX కలవండి', ta:'AlexCyberX சந்திக்கவும்', mr:'AlexCyberX ला भेटा', gu:'AlexCyberX ને મળો', ar:'تعرف على AlexCyberX', fr:'Découvrir AlexCyberX', es:'Conocer AlexCyberX', de:'AlexCyberX kennenlernen', ru:'Об AlexCyberX', zh:'了解AlexCyberX', id:'Kenali AlexCyberX' },

  'stat.students':  { hi:'Students', en:'Students', ur:'طالب علم',    bn:'শিক্ষার্থী',   pa:'ਵਿਦਿਆਰਥੀ',  te:'విద్యార్థులు', ta:'மாணவர்கள்',   mr:'विद्यार्थी', gu:'વિદ્યાર્થીઓ', ar:'طلاب',         fr:'Étudiants',  es:'Estudiantes', de:'Schüler',     ru:'Студентов', zh:'学生', id:'Siswa'     },
  'stat.chapters':  { hi:'Chapters', en:'Chapters', ur:'ابواب',        bn:'অধ্যায়',       pa:'ਅਧਿਆਏ',      te:'అధ్యాయాలు',    ta:'அத்தியாயங்கள்', mr:'अध्याय',    gu:'પ્રકરણો',      ar:'فصول',         fr:'Chapitres',  es:'Capítulos',   de:'Kapitel',     ru:'Глав',      zh:'章节', id:'Bab'       },
  'stat.free':      { hi:'Free',     en:'Free',     ur:'مفت',          bn:'বিনামূল্যে',   pa:'ਮੁਫਤ',       te:'ఉచితం',        ta:'இலவசம்',      mr:'मोफत',       gu:'મફત',           ar:'مجاني',        fr:'Gratuit',    es:'Gratis',      de:'Kostenlos',   ru:'Бесплатно', zh:'免费', id:'Gratis'    },

  'courses.title':  { hi:'Kya Seekhoge?',    en:'What Will You Learn?',  ur:'کیا سیکھیں گے؟', bn:'কী শিখবেন?',     pa:'ਕੀ ਸਿੱਖੋਗੇ?', te:'మీరు ఏమి నేర్చుకుంటారు?', ta:'என்ன கற்பீர்கள்?', mr:'काय शिकणार?', gu:'શું શીખશો?', ar:'ماذا ستتعلم؟',     fr:'Que apprendrez-vous?', es:'¿Qué aprenderás?', de:'Was werden Sie lernen?', ru:'Чему научитесь?', zh:'你将学什么？', id:'Apa yang Dipelajari?' },
  'courses.start':  { hi:'Start Course',     en:'Start Course',          ur:'کورس شروع کریں', bn:'কোর্স শুরু করুন', pa:'ਕੋਰਸ ਸ਼ੁਰੂ ਕਰੋ', te:'కోర్సు ప్రారంభించండి', ta:'படிப்பை தொடங்கு', mr:'कोर्स सुरू करा', gu:'કોર્સ શરૂ કરો', ar:'ابدأ الدورة', fr:'Commencer le cours', es:'Iniciar curso', de:'Kurs starten', ru:'Начать курс', zh:'开始课程', id:'Mulai Kursus' },
  'courses.coming': { hi:'Coming Soon',      en:'Coming Soon',           ur:'جلد آ رہا ہے',   bn:'শীঘ্রই আসছে',    pa:'ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ', te:'త్వరలో వస్తుంది', ta:'விரைவில் வருகிறது', mr:'लवकरच येत आहे', gu:'જલ્દી આવી રહ્યું છે', ar:'قريباً', fr:'Bientôt', es:'Próximamente', de:'Demnächst', ru:'Скоро', zh:'即将推出', id:'Segera Hadir' },

  'modal.title':    { hl:'Choose Your Language', hi:'अपनी भाषा चुनें', en:'Choose Your Language', ur:'اپنی زبان چنیں', bn:'আপনার ভাষা বেছে নিন', pa:'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ', te:'మీ భాషను ఎంచుకోండి', ta:'உங்கள் மொழியை தேர்ந்தெடுக்கவும்', mr:'आपली भाषा निवडा', gu:'તમારી ભાષા પસંદ કરો', ar:'اختر لغتك', fr:'Choisissez votre langue', es:'Elige tu idioma', de:'Sprache wählen', ru:'Выберите язык', zh:'选择您的语言', id:'Pilih Bahasa Anda' },
  'modal.sub':      { hl:'Website is language mein translate ho jaayegi. Nav bar se baad mein bhi change kar sakte ho.', hi:'वेबसाइट इस भाषा में अनुवाद होगी।', en:'Website will be shown in this language. You can change it later from the nav bar.', ur:'ویب سائٹ اس زبان میں دکھائی جائے گی۔ بعد میں بھی تبدیل کر سکتے ہو۔', bn:'ওয়েবসাইট এই ভাষায় দেখানো হবে।', pa:'ਵੈੱਬਸਾਈਟ ਇਸ ਭਾਸ਼ਾ ਵਿੱਚ ਦਿਖਾਈ ਦੇਵੇਗੀ।', te:'వెబ్‌సైట్ ఈ భాషలో చూపబడుతుంది.', ta:'இணையதளம் இந்த மொழியில் காட்டப்படும்.', mr:'वेबसाइट या भाषेत दाखवली जाईल.', gu:'વેબસાઇટ આ ભાષામાં બતાવવામાં આવશે.', ar:'سيتم عرض الموقع بهذه اللغة.', fr:'Le site sera affiché dans cette langue.', es:'El sitio se mostrará en este idioma.', de:'Website wird in dieser Sprache angezeigt.', ru:'Сайт будет на этом языке.', zh:'网站将以此语言显示。', id:'Website dalam bahasa ini.' },
  'modal.continue': { hl:'Continue', hi:'जारी रखें', en:'Continue', ur:'جاری رکھیں', bn:'চালিয়ে যান', pa:'ਜਾਰੀ ਰੱਖੋ', te:'కొనసాగించు', ta:'தொடர்', mr:'सुरू ठेवा', gu:'ચાલુ રાખો', ar:'متابعة', fr:'Continuer', es:'Continuar', de:'Weiter', ru:'Продолжить', zh:'继续', id:'Lanjutkan' },

  'contact.title':  { hi:'Baat Karo', en:'Get in Touch', ur:'رابطہ کریں', bn:'যোগাযোগ করুন', pa:'ਸੰਪਰਕ ਕਰੋ', te:'సంప్రదించండి', ta:'தொடர்பு கொள்ளுங்கள்', mr:'संपर्क करा', gu:'સંપર્ક કરો', ar:'تواصل معنا', fr:'Nous contacter', es:'Ponerse en contacto', de:'Kontakt aufnehmen', ru:'Связаться с нами', zh:'联系我们', id:'Hubungi Kami' },
  'contact.send':   { hi:'Send Message', en:'Send Message', ur:'پیغام بھیجیں', bn:'বার্তা পাঠান', pa:'ਸੁਨੇਹਾ ਭੇਜੋ', te:'సందేశం పంపు', ta:'செய்தி அனுப்பு', mr:'संदेश पाठवा', gu:'સંદેશ મોકલો', ar:'إرسال الرسالة', fr:'Envoyer le message', es:'Enviar mensaje', de:'Nachricht senden', ru:'Отправить сообщение', zh:'发送消息', id:'Kirim Pesan' },
  // HERO
  'hero.badge.text': { hi:'Cybersecurity Learning Platform', en:'Cybersecurity Learning Platform', ur:'سائبر سیکیورٹی لرننگ پلیٹ فارم', bn:'সাইবার নিরাপত্তা শিক্ষা প্ল্যাটফর্ম', pa:'ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਸਿੱਖਣ ਪਲੇਟਫਾਰਮ', te:'సైబర్ సెక్యూరిటీ లెర్నింగ్ ప్లాట్‌ఫారమ్', ta:'சைபர் பாதுகாப்பு கற்றல் தளம்', mr:'सायबर सुरक्षा शिक्षण व्यासपीठ', gu:'સાઇબર સુરક્ષા શિક્ષણ પ્લેટફોર્મ', ar:'منصة تعلم الأمن السيبراني', fr:'Plateforme d\u2019apprentissage cybersécurité', es:'Plataforma de aprendizaje de ciberseguridad', de:'Cybersecurity Lernplattform', ru:'Платформа обучения кибербезопасности', zh:'网络安全学习平台', id:'Platform Belajar Keamanan Siber' },
  'hero.title.line1': { hi:'Learn Cyber', en:'Learn Cyber', ur:'سائبر سیکھیں', bn:'সাইবার শিখুন', pa:'ਸਾਈਬਰ ਸਿੱਖੋ', te:'సైబర్ నేర్చుకోండి', ta:'சைபர் கற்றுக்கொள்', mr:'सायबर शिका', gu:'સાઇબર શીખો', ar:'تعلم الأمن', fr:'Apprendre le', es:'Aprende', de:'Lerne', ru:'Учись', zh:'学习', id:'Belajar' },
  'hero.title.line2': { hi:'Security', en:'Security', ur:'سیکیورٹی', bn:'নিরাপত্তা', pa:'ਸੁਰੱਖਿਆ', te:'సెక్యూరిటీ', ta:'பாதுகாப்பு', mr:'सुरक्षा', gu:'સુરક્ષા', ar:'السيبراني', fr:'Cybersécurité', es:'Ciberseguridad', de:'Cybersecurity', ru:'Кибербезопасности', zh:'网络安全', id:'Keamanan Siber' },
  'hero.title':      { hi:'Learn Cyber Security', en:'Learn Cyber Security', ur:'سائبر سیکیورٹی سیکھیں', bn:'সাইবার নিরাপত্তা শিখুন', pa:'ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਸਿੱਖੋ', te:'సైబర్ సెక్యూరిటీ నేర్చుకోండి', ta:'சைபர் பாதுகாப்பு கற்றுக்கொள்', mr:'सायबर सुरक्षा शिका', gu:'સાઇબર સુરક્ષા શીખો', ar:'تعلم الأمن السيبراني', fr:'Apprendre la cybersécurité', es:'Aprende ciberseguridad', de:'Cybersecurity lernen', ru:'Учись кибербезопасности', zh:'学习网络安全', id:'Belajar Keamanan Siber' },
  'hero.sub':        { hi:'Cybersecurity ko samjho apni language mein. Network Forensics, Ethical Hacking, aur bahut kuch sikhenge step by step.', en:'Understand cybersecurity in your language. Network Forensics, Ethical Hacking, and much more step by step.', ur:'اپنی زبان میں سائبر سیکیورٹی سمجھیں۔ نیٹ ورک فورنزکس، ایتھیکل ہیکنگ اور بہت کچھ قدم بہ قدم۔', bn:'আপনার ভাষায় সাইবার নিরাপত্তা বুঝুন। নেটওয়ার্ক ফরেনসিক্স, এথিক্যাল হ্যাকিং এবং আরো অনেক কিছু ধাপে ধাপে।', pa:'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਸਮਝੋ। ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ, ਐਥੀਕਲ ਹੈਕਿੰਗ ਅਤੇ ਹੋਰ ਬਹੁਤ ਕੁਝ ਕਦਮ ਦਰ ਕਦਮ।', te:'మీ భాషలో సైబర్ సెక్యూరిటీ అర్థం చేసుకోండి. నెట్వర్క్ ఫోరెన్సిక్స్, ఎథికల్ హ్యాకింగ్ మరియు ఇంకా చాలా ముందుకు.', ta:'உங்கள் மொழியில் சைபர் பாதுகாப்பு புரிந்துகொள்ளுங்கள். நெட்வொர்க் தடயவியல், நெறிமுறை ஹேக்கிங் மற்றும் பல படிப்படியாக.', mr:'आपल्या भाषेत सायबर सुरक्षा समजून घ्या. नेटवर्क फॉरेन्सिक्स, एथिकल हॅकिंग आणि बरेच काही टप्प्याटप्प्याने.', gu:'તમારી ભાષામાં સાઇબર સુરક્ષા સમજો. નેટવર્ક ફોરેન્સિક્સ, એથિકલ હેકિંગ અને ઘણું બધું પગલે પગલે.', ar:'افهم الأمن السيبراني بلغتك. الجنائيات الشبكية والاختراق الأخلاقي وأكثر خطوة بخطوة.', fr:'Comprendre la cybersécurité dans votre langue. Forensique réseau, hacking éthique et bien plus encore.', es:'Entiende la ciberseguridad en tu idioma. Forense de redes, hacking ético y mucho más paso a paso.', de:'Verstehe Cybersecurity in deiner Sprache. Netzwerk-Forensik, Ethical Hacking und vieles mehr Schritt für Schritt.', ru:'Пойми кибербезопасность на своём языке. Сетевая криминалистика, этичный хакинг и многое другое шаг за шагом.', zh:'用你的语言理解网络安全。网络取证、道德黑客攻击等等，循序渐进。', id:'Pahami keamanan siber dalam bahasa Anda. Forensik jaringan, ethical hacking, dan banyak lagi langkah demi langkah.' },

  // STATS
  'stat.community':  { hi:'Community', en:'Community', ur:'کمیونٹی', bn:'কমিউনিটি', pa:'ਕਮਿਊਨਿਟੀ', te:'కమ్యూనిటీ', ta:'சமூகம்', mr:'समुदाय', gu:'સમુદાય', ar:'مجتمع', fr:'Communauté', es:'Comunidad', de:'Community', ru:'Сообщество', zh:'社区', id:'Komunitas' },
  'stat.practical':  { hi:'Practical', en:'Practical', ur:'عملی', bn:'ব্যবহারিক', pa:'ਵਿਹਾਰਕ', te:'ఆచరణాత్మక', ta:'நடைமுறை', mr:'व्यावहारिक', gu:'વ્યવહારુ', ar:'عملي', fr:'Pratique', es:'Práctico', de:'Praktisch', ru:'Практично', zh:'实践', id:'Praktis' },
  'stat.always':     { hi:'Always', en:'Always', ur:'ہمیشہ', bn:'সবসময়', pa:'ਹਮੇਸ਼ਾ', te:'ఎల్లప్పుడూ', ta:'எப்போதும்', mr:'नेहमी', gu:'હંમેશા', ar:'دائماً', fr:'Toujours', es:'Siempre', de:'Immer', ru:'Всегда', zh:'永远', id:'Selalu' },

  // LEARN PAGE BANNER
  'learn.tag':   { hi:'Network Forensics', en:'Network Forensics', ur:'نیٹ ورک فورنزکس', bn:'নেটওয়ার্ক ফরেনসিক্স', pa:'ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ', te:'నెట్వర్క్ ఫోరెన్సిక్స్', ta:'நெட்வொர்க் தடயவியல்', mr:'नेटवर्क फॉरेन्सिक्स', gu:'નેટવર્ક ફોરેન્સિક્સ', ar:'الجنائيات الشبكية', fr:'Forensique Réseau', es:'Forense de Redes', de:'Netzwerk-Forensik', ru:'Сетевая криминалистика', zh:'网络取证', id:'Forensik Jaringan' },
  'learn.title': { hi:'Network Forensics', en:'Network Forensics', ur:'نیٹ ورک فورنزکس', bn:'নেটওয়ার্ক ফরেনসিক্স', pa:'ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ', te:'నెట్వర్క్ ఫోరెన్సిక్స్', ta:'நெட்வொர்க் தடயவியல்', mr:'नेटवर्क फॉरेन्सिक्स', gu:'નેટવર્ક ફોરેન્સિક્સ', ar:'الجنائيات الشبكية', fr:'Forensique Réseau', es:'Forense de Redes', de:'Netzwerk-Forensik', ru:'Сетевая криминалистика', zh:'网络取证', id:'Forensik Jaringan' },
  'learn.desc':  { hi:'Network traffic analyze karke digital evidence collect karna seekho. PCAP, Wireshark, malware traffic complete guide Hinglish mein.', en:'Learn to collect digital evidence by analyzing network traffic. PCAP, Wireshark, malware traffic complete guide.', ur:'نیٹ ورک ٹریفک تجزیہ کرکے ڈیجیٹل شواہد اکٹھا کرنا سیکھیں۔ PCAP، Wireshark مکمل گائیڈ۔', bn:'নেটওয়ার্ক ট্রাফিক বিশ্লেষণ করে ডিজিটাল প্রমাণ সংগ্রহ শিখুন। PCAP, Wireshark সম্পূর্ণ গাইড।', pa:'ਨੈੱਟਵਰਕ ਟ੍ਰੈਫਿਕ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਕੇ ਡਿਜੀਟਲ ਸਬੂਤ ਇਕੱਠਾ ਕਰਨਾ ਸਿੱਖੋ।', te:'నెట్వర్క్ ట్రాఫిక్ విశ్లేషించి ఆధారాలు సేకరించడం నేర్చుకోండి.', ta:'நெட்வொர்க் ட்ராஃபிக்கை பகுப்பாய்வு செய்து சான்றுகள் சேகரிக்க கற்றுக்கொள்ளுங்கள்.', mr:'नेटवर्क ट्रॅफिक विश्लेषण करून डिजिटल पुरावे गोळा करणे शिका.', gu:'નેટવર્ક ટ્રાફિક વિશ્લેષણ કરીને ડિજિટલ પુરાવા એકત્ર કરવાનું શીખો.', ar:'تعلم جمع الأدلة الرقمية من خلال تحليل حركة الشبكة.', fr:'Apprenez à collecter des preuves numériques en analysant le trafic réseau.', es:'Aprende a recopilar evidencias digitales analizando el tráfico de red.', de:'Lerne digitale Beweise durch Netzwerkverkehrsanalyse zu sammeln.', ru:'Учись собирать цифровые доказательства, анализируя сетевой трафик.', zh:'通过分析网络流量学习收集数字证据。', id:'Belajar mengumpulkan bukti digital dengan menganalisis lalu lintas jaringan.' },

  // COURSES SECTION
  'courses.label':   { hi:'Courses', en:'Courses', ur:'کورسز', bn:'কোর্স', pa:'ਕੋਰਸ', te:'కోర్సులు', ta:'படிப்புகள்', mr:'कोर्सेस', gu:'કોર્સ', ar:'الدورات', fr:'Cours', es:'Cursos', de:'Kurse', ru:'Курсы', zh:'课程', id:'Kursus' },
  'courses.heading': { hi:'Choose Your Path', en:'Choose Your Path', ur:'اپنا راستہ چنیں', bn:'আপনার পথ বেছে নিন', pa:'ਆਪਣਾ ਰਾਹ ਚੁਣੋ', te:'మీ మార్గాన్ని ఎంచుకోండి', ta:'உங்கள் பாதையை தேர்ந்தெடுக்கவும்', mr:'आपला मार्ग निवडा', gu:'તમારો માર્ગ પસંદ કરો', ar:'اختر مسارك', fr:'Choisissez votre voie', es:'Elige tu camino', de:'Wähle deinen Weg', ru:'Выбери свой путь', zh:'选择你的道路', id:'Pilih Jalur Anda' },
  'card.nf.title':   { hi:'Network Forensics', en:'Network Forensics', ur:'نیٹ ورک فورنزکس', bn:'নেটওয়ার্ক ফরেনসিক্স', pa:'ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ', te:'నెట్వర్క్ ఫోరెన్సిక్స్', ta:'நெட்வொர்க் தடயவியல்', mr:'नेटवर्क फॉरेन्सिक्स', gu:'નેટવર્ક ફોરેન્સિક્સ', ar:'الجنائيات الشبكية', fr:'Forensique Réseau', es:'Forense de Redes', de:'Netzwerk-Forensik', ru:'Сетевая криминалистика', zh:'网络取证', id:'Forensik Jaringan' },
  'card.nf.desc':    { hi:'Network traffic analyze karke digital evidence collect karna seekho. PCAP, Wireshark, malware traffic complete guide Hindi mein.', en:'Learn to collect digital evidence by analyzing network traffic. Complete guide on PCAP, Wireshark, malware traffic.', ur:'نیٹ ورک ٹریفک تجزیہ کرکے ڈیجیٹل ثبوت اکٹھا کرنا سیکھیں۔ PCAP، Wireshark، مالویئر ٹریفک مکمل گائیڈ۔', bn:'নেটওয়ার্ক ট্রাফিক বিশ্লেষণ করে ডিজিটাল প্রমাণ সংগ্রহ করতে শিখুন। PCAP, Wireshark সম্পূর্ণ গাইড।', pa:'ਨੈੱਟਵਰਕ ਟ੍ਰੈਫਿਕ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਕੇ ਡਿਜੀਟਲ ਸਬੂਤ ਇਕੱਠਾ ਕਰਨਾ ਸਿੱਖੋ।', te:'నెట్వర్క్ ట్రాఫిక్ విశ్లేషించి డిజిటల్ ఆధారాలు సేకరించడం నేర్చుకోండి.', ta:'நெட்வொர்க் ட்ராஃபிக்கை பகுப்பாய்வு செய்து டிஜிட்டல் சான்றுகள் சேகரிக்க கற்றுக்கொள்ளுங்கள்.', mr:'नेटवर्क ट्रॅफिक विश्लेषण करून डिजिटल पुरावे गोळा करणे शिका.', gu:'નેટવર્ક ટ્રાફિક વિશ્લેષણ કરીને ડિજિટલ પુરાવા એકત્ર કરવાનું શીખો.', ar:'تعلم جمع الأدلة الرقمية من خلال تحليل حركة الشبكة.', fr:'Apprenez à collecter des preuves numériques en analysant le trafic réseau.', es:'Aprende a recopilar evidencias digitales analizando el tráfico de red.', de:'Lerne digitale Beweise durch Netzwerkanalyse zu sammeln.', ru:'Учись собирать цифровые доказательства, анализируя сетевой трафик.', zh:'通过分析网络流量学习收集数字证据。', id:'Belajar mengumpulkan bukti digital dengan menganalisis lalu lintas jaringan.' },
  'card.nf.chapters':{ hi:'20 Chapters', en:'20 Chapters', ur:'20 ابواب', bn:'20 অধ্যায়', pa:'20 ਅਧਿਆਏ', te:'20 అధ్యాయాలు', ta:'20 அத்தியாயங்கள்', mr:'20 अध्याय', gu:'20 પ્રકરણો', ar:'20 فصلاً', fr:'20 chapitres', es:'20 capítulos', de:'20 Kapitel', ru:'20 глав', zh:'20章', id:'20 Bab' },

  'card.ca.title':   { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', ur:'سائبر حملوں کے بنیادی اصول', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स', gu:'સાયબર એટેક ફંડામેન્ટલ્સ', ar:'أساسيات الهجمات السيبرانية', fr:'Fondamentaux des cyberattaques', es:'Fundamentos de ciberataques', de:'Grundlagen von Cyberangriffen', ru:'Основы кибератак', zh:'网络攻击基础', id:'Dasar-Dasar Serangan Siber' },
  'card.ca.desc':    { hi:'Common cyber attacks samjho - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing aur unse defense karne ke tareeke.', en:'Understand common cyber attacks - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing and how to defend against them.', ur:'عام سائبر حملوں کو سمجھیں - MITM، DoS/DDoS، SQL Injection، XSS، Ransomware، DNS Spoofing اور ان سے دفاع کرنے کے طریقے۔', bn:'সাধারণ সাইবার আক্রমণ বুঝুন - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing এবং প্রতিরক্ষার উপায়।', pa:'ਆਮ ਸਾਈਬਰ ਹਮਲਿਆਂ ਨੂੰ ਸਮਝੋ - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing ਅਤੇ ਬਚਾਅ ਦੇ ਤਰੀਕੇ।', te:'సాధారణ సైబర్ దాడులను అర్థం చేసుకోండి - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing మరియు రక్షణ మార్గాలు.', ta:'பொதுவான சைபர் தாக்குதல்களை புரிந்துகொள்ளுங்கள் - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing மற்றும் பாதுகாப்பு வழிகள்.', mr:'सामान्य सायबर अटॅक्स समजून घ्या - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing आणि बचावाचे मार्ग.', gu:'સામાન્ય સાયબર એટેક સમજો - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing અને બચાવના રસ્તાઓ.', ar:'فهم الهجمات السيبرانية الشائعة - MITM وDoS/DDoS وحقن SQL وXSS وبرامج الفدية وتزوير DNS وكيفية الدفاع عنها.', fr:'Comprendre les cyberattaques courantes - MITM, DoS/DDoS, injection SQL, XSS, ransomware, usurpation DNS et comment s’en défendre.', es:'Comprende los ciberataques comunes - MITM, DoS/DDoS, inyección SQL, XSS, ransomware, suplantación de DNS y cómo defenderte.', de:'Verstehe häufige Cyberangriffe - MITM, DoS/DDoS, SQL-Injection, XSS, Ransomware, DNS-Spoofing und wie man sich schützt.', ru:'Изучи распространённые кибератаки - MITM, DoS/DDoS, SQL-инъекции, XSS, программы-вымогатели, DNS-спуфинг и способы защиты.', zh:'了解常见的网络攻击——MITM、DoS/DDoS、SQL注入、XSS、勒索软件、DNS欺骗以及如何防御。', id:'Pahami serangan siber umum - MITM, DoS/DDoS, SQL Injection, XSS, Ransomware, DNS Spoofing, dan cara bertahan.' },
  'card.ca.chapters':{ hi:'11 Chapters', en:'11 Chapters', ur:'11 ابواب', bn:'11 অধ্যায়', pa:'11 ਅਧਿਆਏ', te:'11 అధ్యాయాలు', ta:'11 அத்தியாயங்கள்', mr:'11 अध्याय', gu:'11 પ્રકરણો', ar:'11 فصلاً', fr:'11 chapitres', es:'11 capítulos', de:'11 Kapitel', ru:'11 глав', zh:'11章', id:'11 Bab' },

  'learn2.tag':   { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', ur:'سائبر حملوں کے بنیادی اصول', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स', gu:'સાયબર એટેક ફંડામેન્ટલ્સ', ar:'أساسيات الهجمات السيبرانية', fr:'Fondamentaux des cyberattaques', es:'Fundamentos de ciberataques', de:'Grundlagen von Cyberangriffen', ru:'Основы кибератак', zh:'网络攻击基础', id:'Dasar-Dasar Serangan Siber' },
  'learn2.title': { hi:'Cyber Attacks Fundamentals', en:'Cyber Attacks Fundamentals', ur:'سائبر حملوں کے بنیادی اصول', bn:'সাইবার আক্রমণের মূলনীতি', pa:'ਸਾਈਬਰ ਹਮਲਿਆਂ ਦੇ ਮੂਲ ਸਿਧਾਂਤ', te:'సైబర్ అటాక్స్ ఫండమెంటల్స్', ta:'சைபர் தாக்குதல் அடிப்படைகள்', mr:'सायबर अटॅक्स फंडामेंटल्स', gu:'સાયબર એટેક ફંડામેન્ટલ્સ', ar:'أساسيات الهجمات السيبرانية', fr:'Fondamentaux des cyberattaques', es:'Fundamentos de ciberataques', de:'Grundlagen von Cyberangriffen', ru:'Основы кибератак', zh:'网络攻击基础', id:'Dasar-Dasar Serangan Siber' },
  'learn2.desc':  { hi:'Common cyber attacks samjho - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS attacks aur unse defense karne ke tareeke, complete Hinglish mein.', en:'Understand common cyber attacks - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS attacks and how to defend against them.', ur:'عام سائبر حملوں کو سمجھیں - MITM، DoS/DDoS، SQL Injection، XSS، DNS Spoofing، Ransomware، TLS حملے اور ان سے دفاع کرنے کے طریقے۔', bn:'সাধারণ সাইবার আক্রমণ বুঝুন - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS আক্রমণ এবং প্রতিরক্ষার উপায়।', pa:'ਆਮ ਸਾਈਬਰ ਹਮਲਿਆਂ ਨੂੰ ਸਮਝੋ - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS ਹਮਲੇ ਅਤੇ ਬਚਾਅ ਦੇ ਤਰੀਕੇ।', te:'సాధారణ సైబర్ దాడులను అర్థం చేసుకోండి - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS దాడులు మరియు రక్షణ మార్గాలు.', ta:'பொதுவான சைபர் தாக்குதல்களை புரிந்துகொள்ளுங்கள் - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS தாக்குதல்கள் மற்றும் பாதுகாப்பு வழிகள்.', mr:'सामान्य सायबर अटॅक्स समजून घ्या - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS अटॅक्स आणि बचावाचे मार्ग.', gu:'સામાન્ય સાયબર એટેક સમજો - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, TLS એટેક અને બચાવના રસ્તાઓ.', ar:'فهم الهجمات السيبرانية الشائعة - MITM وDoS/DDoS وحقن SQL وXSS وتزوير DNS وبرامج الفدية وهجمات TLS وكيفية الدفاع عنها.', fr:'Comprendre les cyberattaques courantes - MITM, DoS/DDoS, injection SQL, XSS, usurpation DNS, ransomware, attaques TLS et comment s’en défendre.', es:'Comprende los ciberataques comunes - MITM, DoS/DDoS, inyección SQL, XSS, suplantación de DNS, ransomware, ataques TLS y cómo defenderte.', de:'Verstehe häufige Cyberangriffe - MITM, DoS/DDoS, SQL-Injection, XSS, DNS-Spoofing, Ransomware, TLS-Angriffe und wie man sich schützt.', ru:'Изучи распространённые кибератаки - MITM, DoS/DDoS, SQL-инъекции, XSS, DNS-спуфинг, программы-вымогатели, TLS-атаки и способы защиты.', zh:'了解常见的网络攻击——MITM、DoS/DDoS、SQL注入、XSS、DNS欺骗、勒索软件、TLS攻击以及如何防御。', id:'Pahami serangan siber umum - MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, Ransomware, serangan TLS, dan cara bertahan.' },

  // ABOUT
  'about.label':     { hi:'About', en:'About', ur:'بارے میں', bn:'সম্পর্কে', pa:'ਬਾਰੇ', te:'గురించి', ta:'பற்றி', mr:'बद्दल', gu:'વિશે', ar:'عن', fr:'À propos', es:'Acerca de', de:'Über', ru:'О нас', zh:'关于', id:'Tentang' },
  'about.whois':     { hi:'Who is', en:'Who is', ur:'کون ہے', bn:'কে হলেন', pa:'ਕੌਣ ਹੈ', te:'ఎవరు', ta:'யார்', mr:'कोण आहे', gu:'કોણ છે', ar:'من هو', fr:'Qui est', es:'Quién es', de:'Wer ist', ru:'Кто такой', zh:'谁是', id:'Siapa' },
  'about.p1':        { hi:'Pawan Tanwar (AlexCyberX), Certified Ethical Hacker from Jhalawar, Rajasthan, India. Core focus hai Network Forensics aur cyber investigation mein digital evidence dhundhna.', en:'Pawan Tanwar (AlexCyberX), Certified Ethical Hacker from Jhalawar, Rajasthan, India. Core focus is Network Forensics and cyber investigation.', ur:'سائبر سیکیورٹی کا شوقین اور محقق۔ بنیادی توجہ نیٹ ورک فورنزکس پر ہے۔', bn:'সাইবার নিরাপত্তা উৎসাহী এবং গবেষক। মূল focus হল নেটওয়ার্ক ফরেনসিক্স।', pa:'ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਉਤਸਾਹੀ ਅਤੇ ਖੋਜਕਰਤਾ। ਮੁੱਖ ਧਿਆਨ ਨੈੱਟਵਰਕ ਫੋਰੈਂਸਿਕਸ ਤੇ ਹੈ।', te:'సైబర్ సెక్యూరిటీ ఉత్సాహి మరియు పరిశోధకుడు. ప్రధాన దృష్టి నెట్వర్క్ ఫోరెన్సిక్స్ పై.', ta:'சைபர் பாதுகாப்பு ஆர்வலர் மற்றும் ஆராய்ச்சியாளர். முக்கிய கவனம் நெட்வொர்க் தடயவியலில்.', mr:'सायबर सुरक्षा उत्साही आणि संशोधक. मुख्य लक्ष नेटवर्क फॉरेन्सिक्सवर.', gu:'સાઇબર સુરક્ષા ઉત્સાહી અને સંશોધક. મુખ્ય ધ્યાન નેટવર્ક ફોરેન્સિક્સ પર.', ar:'متحمس وباحث في الأمن السيبراني. التركيز الأساسي على الجنائيات الشبكية.', fr:'Passionné et chercheur en cybersécurité. Focus principal sur la forensique réseau.', es:'Entusiasta e investigador de ciberseguridad. Enfoque principal en forense de redes.', de:'Cybersecurity-Enthusiast und Forscher. Hauptfokus auf Netzwerk-Forensik.', ru:'Энтузиаст и исследователь кибербезопасности. Основной фокус на сетевой криминалистике.', zh:'网络安全爱好者和研究员。主要专注于网络取证。', id:'Penggemar dan peneliti keamanan siber. Fokus utama pada forensik jaringan.' },
  'about.p2':        { hi:'Wireshark, Nmap, Burp Suite, Kali Linux mein hands-on experience. Cyber investigations mein help karna aur cyber police ko case analysis mein assist karna mera passion hai.', en:'Hands-on experience with Wireshark, Nmap, Burp Suite, Kali Linux. Deep interest in helping cyber investigations and assisting cyber police in case analysis. Practical over theoretical, always.', ur:'Wireshark، Nmap، Burp Suite، Kali Linux کے ساتھ عملی تجربہ۔ ہمیشہ عملی نظریاتی سے بہتر۔', bn:'Wireshark, Nmap, Burp Suite, Kali Linux-এ হাতে-কলমে অভিজ্ঞতা। তত্ত্বের চেয়ে সবসময় ব্যবহারিক।', pa:'Wireshark, Nmap, Burp Suite, Kali Linux ਨਾਲ ਹੱਥੋ-ਹੱਥ ਤਜ਼ਰਬਾ।', te:'Wireshark, Nmap, Burp Suite, Kali Linux తో ప్రత్యక్ష అనుభవం.', ta:'Wireshark, Nmap, Burp Suite, Kali Linux உடன் நடைமுறை அனுபவம்.', mr:'Wireshark, Nmap, Burp Suite, Kali Linux सह प्रत्यक्ष अनुभव.', gu:'Wireshark, Nmap, Burp Suite, Kali Linux સાથે હાથ-ઓ-હાથ અનુભવ.', ar:'خبرة عملية مع Wireshark وNmap وBurp Suite وKali Linux.', fr:'Expérience pratique avec Wireshark, Nmap, Burp Suite, Kali Linux.', es:'Experiencia práctica con Wireshark, Nmap, Burp Suite, Kali Linux.', de:'Praktische Erfahrung mit Wireshark, Nmap, Burp Suite, Kali Linux.', ru:'Практический опыт с Wireshark, Nmap, Burp Suite, Kali Linux.', zh:'实践经验包括Wireshark、Nmap、Burp Suite、Kali Linux。', id:'Pengalaman langsung dengan Wireshark, Nmap, Burp Suite, Kali Linux.' },
  'about.p3':        { hi:'Running @alex.cyberx cybersecurity community on Instagram focused on CTF writeups, tools, and real-world techniques.', en:'Running @alex.cyberx cybersecurity community on Instagram focused on CTF writeups, tools, and real-world techniques.', ur:'Instagram پر @alex.cyberx سائبر سیکیورٹی کمیونٹی چلا رہے ہیں۔', bn:'Instagram-এ @alex.cyberx সাইবার নিরাপত্তা কমিউনিটি চালাচ্ছেন।', pa:'Instagram ਤੇ @alex.cyberx ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਕਮਿਊਨਿਟੀ ਚਲਾ ਰਹੇ ਹਨ।', te:'Instagram లో @alex.cyberx సైబర్ సెక్యూరిటీ కమ్యూనిటీ నడుపుతున్నారు.', ta:'Instagram இல் @alex.cyberx சைபர் பாதுகாப்பு சமூகம் நடத்துகிறார்கள்.', mr:'Instagram वर @alex.cyberx सायबर सुरक्षा समुदाय चालवत आहेत.', gu:'Instagram પર @alex.cyberx સાઇબર સુરક્ષા સમુદાય ચલાવી રહ્યા છે.', ar:'يدير مجتمع @alex.cyberx للأمن السيبراني على Instagram.', fr:'Gestion de la communauté @alex.cyberx sur Instagram.', es:'Administrando la comunidad @alex.cyberx en Instagram.', de:'Leitet die @alex.cyberx Cybersecurity-Community auf Instagram.', ru:'Ведёт сообщество @alex.cyberx по кибербезопасности в Instagram.', zh:'在Instagram上运营@alex.cyberx网络安全社区。', id:'Mengelola komunitas keamanan siber @alex.cyberx di Instagram.' },

  // CONTACT
  'contact.label':   { hi:'Connect', en:'Connect', ur:'رابطہ', bn:'সংযোগ', pa:'ਜੁੜੋ', te:'కనెక్ట్', ta:'இணைக்க', mr:'कनेक्ट', gu:'જોડાઓ', ar:'تواصل', fr:'Contacter', es:'Conectar', de:'Verbinden', ru:'Связаться', zh:'联系', id:'Hubungi' },
  'contact.heading': { hi:'Get in Touch', en:'Get in Touch', ur:'رابطہ کریں', bn:'যোগাযোগ করুন', pa:'ਸੰਪਰਕ ਕਰੋ', te:'సంప్రదించండి', ta:'தொடர்பு கொள்ளுங்கள்', mr:'संपर्क करा', gu:'સંપર્ક કરો', ar:'تواصل معنا', fr:'Contactez-nous', es:'Ponerse en contacto', de:'Kontakt aufnehmen', ru:'Связаться с нами', zh:'联系我们', id:'Hubungi Kami' },
  'contact.sub':     { hi:'Questions, collaborations, ya kuch sikhna hai reach out karo.', en:'Questions, collaborations, or want to learn something - reach out.', ur:'سوالات، تعاون، یا کچھ سیکھنا ہے تو رابطہ کریں۔', bn:'প্রশ্ন, সহযোগিতা, বা কিছু শিখতে চান - যোগাযোগ করুন।', pa:'ਸਵਾਲ, ਸਹਿਯੋਗ, ਜਾਂ ਕੁਝ ਸਿੱਖਣਾ ਹੈ - ਸੰਪਰਕ ਕਰੋ।', te:'ప్రశ్నలు, సహకారం, లేదా ఏదైనా నేర్చుకోవాలంటే - సంప్రదించండి.', ta:'கேள்விகள், ஒத்துழைப்பு, அல்லது ஏதாவது கற்றுக்கொள்ள - தொடர்பு கொள்ளுங்கள்.', mr:'प्रश्न, सहयोग, किंवा काही शिकायचे असल्यास - संपर्क करा.', gu:'પ્રશ્નો, સહયોગ, અથવા કંઈ શીખવું છે - સંપર્ક કરો.', ar:'أسئلة أو تعاون أو تريد التعلم - تواصل معنا.', fr:'Questions, collaborations ou envie d’apprendre - contactez-nous.', es:'Preguntas, colaboraciones o quieres aprender - escríbenos.', de:'Fragen, Zusammenarbeit oder Lernen - melde dich.', ru:'Вопросы, сотрудничество или хочешь учиться - пиши.', zh:'有问题、合作或想学习 - 联系我们。', id:'Pertanyaan, kolaborasi, atau ingin belajar - hubungi kami.' },

  // CONTACT FORM
  'form.title':      { hi:'Send Message', en:'Send Message', ur:'پیغام بھیجیں', bn:'বার্তা পাঠান', pa:'ਸੁਨੇਹਾ ਭੇਜੋ', te:'సందేశం పంపు', ta:'செய்தி அனுப்பு', mr:'संदेश पाठवा', gu:'સંદેશ મોકલો', ar:'إرسال رسالة', fr:'Envoyer un message', es:'Enviar mensaje', de:'Nachricht senden', ru:'Отправить сообщение', zh:'发送消息', id:'Kirim Pesan' },
  'form.name':       { hi:'Name', en:'Name', ur:'نام', bn:'নাম', pa:'ਨਾਮ', te:'పేరు', ta:'பெயர்', mr:'नाव', gu:'નામ', ar:'الاسم', fr:'Nom', es:'Nombre', de:'Name', ru:'Имя', zh:'姓名', id:'Nama' },
  'form.name.ph':    { hi:'Aapka naam', en:'Your name', ur:'آپ کا نام', bn:'আপনার নাম', pa:'ਤੁਹਾਡਾ ਨਾਮ', te:'మీ పేరు', ta:'உங்கள் பெயர்', mr:'तुमचे नाव', gu:'તમારું નામ', ar:'اسمك', fr:'Votre nom', es:'Tu nombre', de:'Dein Name', ru:'Ваше имя', zh:'您的姓名', id:'Nama Anda' },
  'form.email.ph':   { hi:'aap@email.com', en:'your@email.com', ur:'آپ@ای میل.com', bn:'আপনার@ইমেইল.com', pa:'ਤੁਹਾਡਾ@ਈਮੇਲ.com', te:'మీ@ఇమెయిల్.com', ta:'உங்கள்@மின்னஞ்சல்.com', mr:'तुमचा@ईमेल.com', gu:'તમારો@ઈ-મેઇલ.com', ar:'أنت@بريدك.com', fr:'votre@email.com', es:'tu@email.com', de:'deine@email.com', ru:'ваш@email.com', zh:'您的@邮箱.com', id:'anda@email.com' },
  'form.email':      { hi:'Email', en:'Email', ur:'ای میل', bn:'ইমেল', pa:'ਈਮੇਲ', te:'ఇమెయిల్', ta:'மின்னஞ்சல்', mr:'ईमेल', gu:'ઈ-મેઇલ', ar:'البريد الإلكتروني', fr:'E-mail', es:'Correo', de:'E-Mail', ru:'Электронная почта', zh:'邮箱', id:'Email' },
  'form.msg':        { hi:'Message', en:'Message', ur:'پیغام', bn:'বার্তা', pa:'ਸੁਨੇਹਾ', te:'సందేశం', ta:'செய்தி', mr:'संदेश', gu:'સંદેશ', ar:'الرسالة', fr:'Message', es:'Mensaje', de:'Nachricht', ru:'Сообщение', zh:'消息', id:'Pesan' },
  'form.msg.ph':     { hi:'Yahan likho...', en:'Write here...', ur:'یہاں لکھیں...', bn:'এখানে লিখুন...', pa:'ਇੱਥੇ ਲਿਖੋ...', te:'ఇక్కడ రాయండి...', ta:'இங்கே எழுதுங்கள்...', mr:'इथे लिहा...', gu:'અહીં લખો...', ar:'اكتب هنا...', fr:'Écrivez ici...', es:'Escribe aquí...', de:'Hier schreiben...', ru:'Пишите здесь...', zh:'在此输入...', id:'Tulis di sini...' },
  'form.send':       { hi:'Send Message', en:'Send Message', ur:'پیغام بھیجیں', bn:'বার্তা পাঠান', pa:'ਸੁਨੇਹਾ ਭੇਜੋ', te:'సందేశం పంపు', ta:'செய்தி அனுப்பு', mr:'संदेश पाठवा', gu:'સંদેশ મોકલો', ar:'إرسال', fr:'Envoyer', es:'Enviar', de:'Senden', ru:'Отправить', zh:'发送', id:'Kirim' },

  // FOOTER
  'footer.copy':     { hi:'© 2025 AlexCyberX. All rights reserved.', en:'© 2025 AlexCyberX. All rights reserved.', ur:'© 2025 AlexCyberX. تمام حقوق محفوظ ہیں۔', bn:'© 2025 AlexCyberX. সর্বস্বত্ব সংরক্ষিত।', pa:'© 2025 AlexCyberX. ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।', te:'© 2025 AlexCyberX. అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.', ta:'© 2025 AlexCyberX. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', mr:'© 2025 AlexCyberX. सर्व हक्क राखीव.', gu:'© 2025 AlexCyberX. તમામ અધિકાર સુરક્ષિત.', ar:'© 2025 AlexCyberX. جميع الحقوق محفوظة.', fr:'© 2025 AlexCyberX. Tous droits réservés.', es:'© 2025 AlexCyberX. Todos los derechos reservados.', de:'© 2025 AlexCyberX. Alle Rechte vorbehalten.', ru:'© 2025 AlexCyberX. Все права защищены.', zh:'© 2025 AlexCyberX. 版权所有。', id:'© 2025 AlexCyberX. Hak cipta dilindungi.' },
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
