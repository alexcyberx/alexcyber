// server/seoMeta.js
//
// AlexCyberX ek client-side SPA hai - server har clean URL (/tutorials/*,
// /tools/*) pe wahi index.html bhejta hai (server/index.js ka catch-all),
// asli content JS router client-side render karta hai. Non-JS crawlers
// (aur kai AI answer-engine bots jaise OAI-SearchBot/PerplexityBot jo
// speed ke liye JS execute nahi karte) is wajah se HAR route pe EXACT
// same homepage <title>/description/canonical/schema dekhte hain - koi
// bhi specific course/tool page apni alag identity crawler ko nahi
// deta, chahe homepage ka schema kitna hi comprehensive kyun na ho.
//
// Ye module un known routes ke liye ACTUAL distinct SEO tags deta hai.
// server/index.js ka catch-all applyRouteSeo() call karke index.html
// bhejne se pehle in tags ko splice kar deta hai - taaki bina JS execute
// kiye bhi crawler ko sahi, page-specific info mile.
//
// SCOPE: ye sirf title/description/canonical/og/twitter/schema level ka
// fix hai (discoverability + correct identification). Actual lesson TEXT
// (js/chapters.js, chapters2.js, chapters3.js mein, ~900KB combined) ab
// bhi sirf client-side render hoti hai - AI ko wo seedha quote/paraphrase
// karne ke liye alag, bada kaam chahiye (static/server-rendered content
// generation), ye is fix ka scope nahi hai.

const SITE = 'https://alexcyberx.com';

const ROUTES = {
  '/tutorials': {
    title: 'Cybersecurity Tutorials - AlexCyberX',
    description: 'Free cybersecurity courses in Hindi by Pavan Kumar (AlexCyberX): Network Forensics, Ethical Hacking, and Cyber Attacks Fundamentals, with hands-on CTF labs.'
  },
  '/tutorials/network-forensics': {
    title: 'Network Forensics Course - AlexCyberX',
    description: 'Free Network Forensics course by Pavan Kumar (AlexCyberX): Wireshark and packet-analysis techniques, in Hindi, with hands-on CTF labs.',
    jsonLd: {
      '@type': 'Course',
      name: 'Network Forensics',
      description: 'Course covering Network Forensics and Wireshark packet analysis.',
      provider: { '@type': 'Person', name: 'Pavan Kumar' },
      inLanguage: 'hi',
      isAccessibleForFree: true,
      teaches: ['Network Forensics', 'Wireshark']
    }
  },
  '/tutorials/ethical-hacking': {
    title: 'Ethical Hacking Course - AlexCyberX',
    description: 'Free Ethical Hacking course by Pavan Kumar (AlexCyberX): Kali Linux, Nmap, Burp Suite, and ethical hacking methodology, in Hindi, with hands-on CTF labs.',
    jsonLd: {
      '@type': 'Course',
      name: 'Ethical Hacking',
      description: 'Course covering Kali Linux, Nmap, Burp Suite, and ethical hacking methodology.',
      provider: { '@type': 'Person', name: 'Pavan Kumar' },
      inLanguage: 'hi',
      isAccessibleForFree: true,
      teaches: ['Kali Linux', 'Nmap', 'Burp Suite', 'Ethical Hacking']
    }
  },
  '/tutorials/cyber-attacks-fundamentals': {
    title: 'Cyber Attacks Fundamentals Course - AlexCyberX',
    description: 'Covers real-world cyber attack types including MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, and Ransomware with visual diagrams and practical examples.',
    jsonLd: {
      '@type': 'Course',
      name: 'Cyber Attacks Fundamentals',
      description: 'Covers real-world cyber attack types including MITM, DoS/DDoS, SQL Injection, XSS, DNS Spoofing, and Ransomware with visual diagrams and practical examples.',
      provider: { '@type': 'Person', name: 'Pavan Kumar' },
      inLanguage: 'hi',
      isAccessibleForFree: true,
      teaches: ['SQL Injection', 'XSS', 'MITM', 'DoS', 'DNS Spoofing', 'Ransomware']
    }
  },
  '/tools': {
    title: 'Cybersecurity Tools - AlexCyberX',
    description: 'Free cybersecurity tools by AlexCyberX: AlexRecon (reconnaissance), AlexUtils (utilities), AlexTrace (OSINT/digital-footprint audit), Cyber Mistake Analyzer, and AlexSync.'
  },
  '/tools/alexrecon': {
    title: 'AlexRecon - Free Reconnaissance Tool - AlexCyberX',
    description: 'Attack-surface reconnaissance tool: DNS, SSL, subdomain enumeration, port scanning, and tech stack detection for any domain. Free, by AlexCyberX.',
    jsonLd: {
      '@type': 'SoftwareApplication',
      name: 'AlexRecon',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any (Web-based)',
      description: 'Attack-surface reconnaissance tool: DNS, SSL, subdomain enumeration, port scanning, and tech stack detection for any domain.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      author: { '@type': 'Person', name: 'Pavan Kumar' }
    }
  },
  '/tools/alexutils': {
    title: 'AlexUtils - Cybersecurity Utility Toolkit - AlexCyberX',
    description: 'Cybersecurity utility toolkit: IP/DNS lookup, SSL checker, hash generator, Base64 encode/decode, subnet calculator, and CVE search. Free, by AlexCyberX.',
    jsonLd: {
      '@type': 'SoftwareApplication',
      name: 'AlexUtils',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any (Web-based)',
      description: 'Cybersecurity utility toolkit: IP/DNS lookup, SSL checker, hash generator, Base64 encode/decode, subnet calculator, and CVE search.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      author: { '@type': 'Person', name: 'Pavan Kumar' }
    }
  },
  '/tools/alextrace': {
    title: 'AlexTrace - Free Digital Footprint / OSINT Audit Tool - AlexCyberX',
    description: 'Digital footprint and OSINT audit tool: cross-platform username check, email breach lookup, and photo metadata scan with an exposure score. Free, by AlexCyberX.',
    jsonLd: {
      '@type': 'SoftwareApplication',
      name: 'AlexTrace',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any (Web-based)',
      description: 'Digital footprint and OSINT audit tool: cross-platform username check, email breach lookup, and photo metadata scan with an exposure score.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      author: { '@type': 'Person', name: 'Pavan Kumar' }
    }
  },
  '/tools/mistake-analyzer': {
    title: 'Cyber Mistake Analyzer - AlexCyberX',
    description: 'Paste a security command and get instant feedback on what is right, what is wrong, and a corrected version. Free tool by AlexCyberX.',
    jsonLd: {
      '@type': 'SoftwareApplication',
      name: 'Cyber Mistake Analyzer',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any (Web-based)',
      description: 'Paste a security command and get instant feedback on what is right, what is wrong, and a corrected version.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      author: { '@type': 'Person', name: 'Pavan Kumar' }
    }
  },
  '/tools/alexsync': {
    title: 'AlexSync - Wake & Play Music Automation - AlexCyberX',
    description: 'Automation tool that wakes a laptop and starts music automatically at a scheduled time. By AlexCyberX.',
    jsonLd: {
      '@type': 'SoftwareApplication',
      name: 'AlexSync',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Windows',
      description: 'Automation tool that wakes a laptop and starts music automatically at a scheduled time.',
      offers: { '@type': 'Offer', price: '12', priceCurrency: 'INR' },
      author: { '@type': 'Person', name: 'Pavan Kumar' }
    }
  }
};

/**
 * baseHtml (poora index.html string) aur routePath (req.path) le kar,
 * agar routePath known SEO route hai to title/description/canonical/
 * og/twitter tags us route ke hisaab se replace karta hai, aur (agar
 * route.jsonLd diya hai) ek focused JSON-LD block </head> se pehle add
 * karta hai. Route na mile to baseHtml bilkul unchanged return hota hai.
 */
function applyRouteSeo(baseHtml, routePath) {
  const route = ROUTES[routePath];
  if (!route) return baseHtml;

  const canonicalUrl = SITE + routePath;
  let html = baseHtml;

  html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?">/,
    `<meta name="description" content="${route.description}">`
  );
  html = html.replace(
    /<link rel="canonical" href=".*?">/,
    `<link rel="canonical" href="${canonicalUrl}">`
  );
  html = html.replace(
    /<meta property="og:title" content=".*?">/,
    `<meta property="og:title" content="${route.title}">`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?">/,
    `<meta property="og:description" content="${route.description}">`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?">/,
    `<meta property="og:url" content="${canonicalUrl}">`
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?">/,
    `<meta name="twitter:title" content="${route.title}">`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?">/,
    `<meta name="twitter:description" content="${route.description}">`
  );

  if (route.jsonLd) {
    const fullJsonLd = {
      '@context': 'https://schema.org',
      '@id': canonicalUrl,
      url: canonicalUrl,
      ...route.jsonLd
    };
    const block = `<script type="application/ld+json">\n${JSON.stringify(fullJsonLd, null, 2)}\n</script>\n</head>`;
    html = html.replace('</head>', block);
  }

  return html;
}

module.exports = { applyRouteSeo, ROUTES };
