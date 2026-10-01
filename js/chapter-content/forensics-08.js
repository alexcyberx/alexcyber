// Extracted from js/chapters.js — Network Forensics course, chapter index 8.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent08 = `

      <h2>1. What is Email Forensics?</h2>
      <p>Email Forensics ka matlab hai emails ko collect, analyze aur investigate karna taaki pata lagaya ja sake ki email kahan se aaya, sender asli hai ya fake, phishing attack hua ya nahi, attachment malicious hai ya nahi, aur email ka route kya tha.</p>

      <h2>2. Why Email Forensics is Important?</h2>
      <p>Aaj bhi adhikansh cyber attacks ki shuruaat email se hoti hai. Email sabse common attack vector hai kyunki har koi email use karta hai aur phishing detect karna difficult hota hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Phishing','Fake emails jo credentials churate hain'],['Malware Delivery','Malicious attachments ya links'],['Ransomware','Email se ransomware deliver karna'],['CEO Fraud','Executive ko impersonate karna'],['BEC','Business Email Compromise via wire fraud']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>3. Email Architecture</h2>
      <p>Jab koi email bheja jaata hai, woh kai servers se guzarta hai. Har server ek entry header mein add karta hai jo investigators ke liye evidence hoti hai.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Sender','Email compose karta hai'],['SMTP Server','Email bhejta hai'],['Internet Routing','Mail servers ke through travel'],['Recipient Mail Server','Email receive karta hai'],['Recipient','Email padta hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0||i===4?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:240px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${i===0||i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="20" viewBox="0 0 16 20" fill="none" style="margin:2px 0;"><path d="M8 2v14M3 12l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>4. Important Email Protocols</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SMTP','Simple Mail Transfer Protocol','25, 465, 587','Email bhejne ke liye use hota hai'],['POP3','Post Office Protocol v3','110, 995','Email download karta hai, server se remove kar deta hai'],['IMAP','Internet Message Access Protocol','143, 993','Email sync karta hai, server par rakhta hai']].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(255,255,255,0.06);padding:14px 18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</span>
            <span style="font-family:'Rajdhani',monospace;font-size:12px;color:#555;">Port: ${r[2]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:4px;">${r[3]}</div>
        </div>`).join('')}
      </div>

      <h2>5. SMTP Overview</h2>
      <p>SMTP yaani Simple Mail Transfer Protocol email bhejne ka primary protocol hai. Jab bhi koi email send karta hai toh SMTP kaam karta hai. Mail servers ke beech communication bhi SMTP se hoti hai.</p>
      <div class="info-box"><p><strong>Port 25</strong> server-to-server ke liye, <strong>Port 587</strong> client submission ke liye, <strong>Port 465</strong> encrypted SMTP ke liye use hota hai.</p></div>

      <h2>6. POP3 Overview</h2>
      <p>POP3 yaani Post Office Protocol v3 email download karne ke liye use hota hai. Jab POP3 use hota hai toh email server se download hoke local machine par aa jaata hai aur aksar server se delete ho jaata hai. Forensics mein ye isliye important hai kyunki email sirf ek jagah hota hai.</p>

      <h2>7. IMAP Overview</h2>
      <p>IMAP yaani Internet Message Access Protocol email synchronize karta hai. Email server par rehta hai aur multiple devices se access ho sakta hai. Modern email clients mostly IMAP use karte hain. Forensics mein server par sab emails milte hain.</p>

      <h2>8. Email Components</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Header','Metadata jaise sender, receiver, route, timestamps, authentication'],['Body','Actual message content jo user ko dikh ta hai'],['Attachments','Files jo email ke saath bheje jaate hain']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. Why Headers Are Important?</h2>
      <p>Email ka body user dikhta hai lekin forensic evidence header mein hoti hai. Header mein poora email ka safar record hota hai. Investigators header se pata lagate hain ki email kahan se aaya, kahan kahan se guzra, authentication pass hua ya fail hua.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Sender path','Email kahan se chala aur kahan kahan gaya'],['Mail servers','Konse servers se guzra email'],['Timestamps','Har server par kitne baje pahuncha'],['Authentication results','SPF, DKIM, DMARC pass hua ya fail'],['Routing information','Poori journey ka record']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>10. Common Email Header Fields</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;padding:10px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">HEADER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
        </div>
        ${[['From','Claimed sender address, spoofed ho sakta hai'],['To','Recipient ka address'],['Subject','Email ka topic'],['Date','Email kab send hua'],['Message-ID','Har email ka unique identifier'],['Received','Mail route, har server entry add karta hai'],['Return-Path','Bounce address, real sender se related'],['Reply-To','Reply kahan jaaye, spoofing mein use hota hai'],['X-Originating-IP','Original sender ka IP address']].map(r=>`
        <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>11. Most Important Header: Received</h2>
      <p>Received header sabse important forensic evidence hai. Jab bhi email kisi server se guzarta hai, woh server ek Received entry add kar deta hai. Isse email ki poori journey track ki ja sakti hai.</p>
      <div class="info-box"><p><strong>Rule:</strong> Received headers ko <span style="color:#dc1414;font-weight:700;">bottom se top</span> padho. Sabse neeche wali entry original source hai, sabse upar wali last server hai.</p></div>
      <pre><code>Received: from smtp.relay.net
        by victim-mx.com; 10:00:00         (sabse upar = last hop)

Received: from attacker-server.ru (192.168.1.100)
        by smtp.relay.net; 09:58:00        (sabse neeche = original source)

Bottom entry = Attacker ka original IP: 192.168.1.100</code></pre>

      <h2>12. How to Trace an Email</h2>
      <p>Email trace karne ka process hamesha Received headers par depend karta hai. Investigator sabse pehle bottom Received entry dhundhta hai jo original IP batata hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Step 1','Full headers collect karo','Gmail mein Show Original, Outlook mein View Source'],['Step 2','Sabse neeche ka Received dekho','Ye original sender ka server hai'],['Step 3','IP address nikalo','Attacker ka actual IP yahan hota hai'],['Step 4','IP ko reverse lookup karo','Kaunse country ya ISP se aaya pata chalega'],['Step 5','Authentication check karo','SPF DKIM DMARC results verify karo']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(255,255,255,0.06);padding:12px 16px;display:grid;grid-template-columns:60px 140px 1fr;gap:8px;align-items:center;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;text-align:center;">${r[0]}</span>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[2]}</div>
        </div>`).join('')}
      </div>

      <h2>13. Email Spoofing</h2>
      <p>Email spoofing matlab hai From field mein koi bhi fake address likhna. SMTP protocol mein From field verify nahi hota by default. Isliye attacker CEO ka address likh ke email bhej sakta hai aur recipient ko asli lagta hai.</p>
      <pre><code>Displayed From: ceo@yourcompany.com
Actually sent by: attacker@evil.ru (192.168.1.100)

From field = Jhooth bol sakta hai
Received header = Real truth hai</code></pre>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['From aur Return-Path mismatch','Dono alag hain toh suspicious hai'],['SPF ya DKIM fail hua','Authentication fail ka matlab unauthorized sender'],['Unusual relay servers','Unexpected countries ke servers se guzra'],['Strange routing path','Normal path se bahut alag route']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>14. SPF</h2>
      <div class="info-box"><p><strong>SPF = Sender Policy Framework.</strong> Domain ke DNS mein record hota hai jo batata hai ki kaunse IP addresses us domain ke liye email bhej sakte hain. Jab email aata hai toh receiving server SPF check karta hai.</p></div>
      <p>Agar attacker gmail.com ka naam lekar email bheje lekin Gmail ke authorized servers se na bheje, SPF fail ho jaayega.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Pass','Sender IP domain ke liye authorized hai, valid sender','#f4f4f5'],['Fail','Sender IP authorized nahi hai, unauthorized sender','#dc1414'],['SoftFail','Suspicious sender, soft warning, investigate karo','#b0b0b8'],['Neutral','Domain ne koi strong decision nahi diya','#555']].map(r=>`
        <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',monospace;font-size:14px;font-weight:700;color:${r[2]};">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>15. DKIM</h2>
      <div class="info-box"><p><strong>DKIM = DomainKeys Identified Mail.</strong> Email bhejne wala server email mein ek digital signature add karta hai. Receiving server us signature ko verify karta hai taaki pata chale ki email modify toh nahi hua aur sender domain authentic hai.</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.2);padding:16px;text-align:center;">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="margin-bottom:8px;"><circle cx="14" cy="14" r="12" stroke="#dc1414" stroke-width="1.5"/><path d="M8 14l4 4 8-8" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;color:#f4f4f5;">Message not modified</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.2);padding:16px;text-align:center;">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="margin-bottom:8px;"><circle cx="14" cy="14" r="12" stroke="#dc1414" stroke-width="1.5"/><path d="M8 14l4 4 8-8" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;color:#f4f4f5;">Sender domain authentic</div>
        </div>
      </div>
      <p>Agar DKIM fail hota hai toh ya toh email modify kiya gaya ya sender ka domain fake hai.</p>

      <h2>16. DMARC</h2>
      <div class="info-box"><p><strong>DMARC = Domain-based Message Authentication, Reporting and Conformance.</strong> SPF aur DKIM dono ke saath kaam karta hai. Domain owner policy set karta hai ki SPF ya DKIM fail hone par email ka kya karna hai.</p></div>
      <pre><code>Authentication-Results: mx.google.com;
  spf=pass      smtp.mailfrom=sender.com
  dkim=pass     header.d=sender.com
  dmarc=pass    header.from=sender.com

Sab pass = Legitimate email

spf=fail dkim=fail dmarc=fail = Strong phishing indicator</code></pre>
      <p>DMARC policies teen hoti hain: none sirf monitor karta hai, quarantine spam mein daalta hai, reject email block kar deta hai.</p>

      <h2>17. Authentication Results Header</h2>
      <p>Email headers mein Authentication-Results header hota hai jisme SPF, DKIM aur DMARC ke results ek saath likhe hote hain. Investigator yahan ek hi jagah se saari authentication information dekh sakta hai.</p>
      <pre><code>Authentication-Results: mx.victim.com;
  spf=fail (ip4:192.168.1.100 is not authorized)
    smtp.mailfrom=ceo@company.com
  dkim=none (no signature found)
  dmarc=fail

Iska matlab: Email spoofed hai, investigate karo immediately</code></pre>

      <h2>18. What is Phishing?</h2>
      <p>Phishing ek fraudulent email hota hai jo user ko trick karne ke liye design kiya jaata hai. Attacker ka goal hota hai credentials churana, malware install karna ya financial information collect karna. Phishing aaj bhi sabse successful attack vector hai.</p>

      <h2>19. Common Phishing Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Urgent Language','Your account will be closed within 24 hours, act now'],['Fake Domains','paypa1.com, arnazon.com, g00gle.com, micros0ft.com'],['Suspicious Links','Displayed text alag, actual URL alag hota hai'],['Unexpected Attachments','Invoice.docm, Statement.zip, Receipt.exe jo kabhi expect nahi tha'],['Generic Greeting','Dear Customer, Dear User jaise non-personal greetings'],['Auth Failures','SPF fail plus DKIM fail ek saath strong phishing signal hai']].map(r=>`
        <div style="display:grid;grid-template-columns:180px 1fr;gap:10px;background:rgba(220,20,20,0.05);border-radius:8px;border:1px solid rgba(220,20,20,0.15);padding:10px 16px;align-items:center;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><path d="M7 1L13 13H1L7 1z" stroke="#dc1414" stroke-width="1.3" stroke-linejoin="round"/><path d="M7 6v3M7 10.5h.01" stroke="#dc1414" stroke-width="1.3" stroke-linecap="round"/></svg>
            <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>20. Link Analysis</h2>
      <p>Phishing emails mein displayed link aur actual URL alag hote hain. Koi bhi link click karne se pehle hover karke real URL dekho. Attackers typosquatting use karte hain jaise bank.com ki jagah bnak.com ya b4nk.com.</p>
      <pre><code>Displayed text:  Click here to verify your account at bank.com
Actual URL:      http://evil-attacker-site.ru/steal/credentials

Aise links pe kabhi seedha click mat karo
Hover karke status bar mein actual URL check karo</code></pre>
      <div class="info-box"><p><strong>Safe practice:</strong> Kisi bhi suspicious link ko directly browser mein type karo ya official website par seedha jao. Email ke link par trust mat karo.</p></div>

      <h2>21. Attachment Analysis</h2>
      <p>Malicious attachments email delivery ka common method hai. Attacker innocent-looking files bhejta hai jo actually malware hoti hain. Macro-enabled documents sabse dangerous hote hain kyunki unhe open karte hi malware execute ho sakta hai.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px;">
        ${[['EXE','Direct executable, seedha chalta hai'],['ZIP','Compressed malware, scanning se bachta hai'],['ISO','Disk image, security bypass karta hai'],['DOCM','Macro-enabled Word, bahut common'],['XLSM','Macro-enabled Excel'],['JS','JavaScript dropper'],['LNK','Windows shortcut exploit'],['PDF','Embedded malicious scripts']].map(r=>`
        <div style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.22);border-radius:8px;padding:8px 14px;text-align:center;">
          <div style="font-family:'Rajdhani',monospace;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:10px;color:#888;margin-top:3px;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>22. Dangerous Macro Documents</h2>
      <p>DOCM aur XLSM files mein macros hote hain jo automatically execute ho sakte hain. Attackers invoice.docm ya statement.xlsm jaisi files bhejte hain jo real document lagti hain lekin open karte hi malware download karna shuru kar deti hain.</p>
      <pre><code>invoice.docm kholta hai user
      ↓
Macro automatically run hota hai
      ↓
PowerShell ya cmd se malware download hota hai
      ↓
System compromise ho jaata hai</code></pre>
      <div class="info-box"><p><strong>Rule:</strong> Unexpected email se aaya koi bhi attachment mat kholo. VirusTotal par check karo ya sandbox mein analyze karo.</p></div>

      <h2>23. Email Malware Delivery Flow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Phishing Email','Attacker bhejta hai'],['Attachment Opened','User click karta hai'],['Malware Download','Background mein download'],['Command and Control','Malware C2 se connect karta hai'],['System Compromise','Attacker ka access mil jaata hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':i===4?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:11px 24px;text-align:center;width:250px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="20" viewBox="0 0 16 20" fill="none" style="margin:2px 0;"><path d="M8 2v14M3 12l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>24. Email Tracing Investigation</h2>
      <p>Email trace karna ek systematic process hai. Investigator ko ye sawaal answer karne hote hain: koi bhi decision lene se pehle headers se facts nikalne padte hain.</p>
      <pre><code>Who sent it?          Received headers ka bottom IP
Which server?         Received chain mein har server entry
Which IP?             Original IP sabse neeche Received mein
Authentication?       SPF DKIM DMARC results check karo
Domain legitimate?    From address aur Return-Path compare karo</code></pre>

      <h2>25. Business Email Compromise</h2>
      <div class="info-box"><p><strong>BEC</strong> ek high-value attack hai jisme CEO, Manager ya Finance staff ko impersonate kiya jaata hai. Goal hota hai wire transfer fraud ya sensitive information leak karna.</p></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Domain Lookalikes','company.co vs company.com, barely noticeable difference'],['Urgent Wire Transfer','Abhi payment karo, audit chal raha hai, CEO ka order hai'],['Authority Impersonation','From: CEO, board meeting mein hun, call mat karna'],['Unusual Timing','Weekend ya late night requests jab verification mushkil ho']].map(r=>`
        <div style="display:flex;align-items:flex-start;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.18);border-radius:8px;padding:12px 14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="flex-shrink:0;margin-top:1px;"><path d="M9 2L16 15H2L9 2z" stroke="#dc1414" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 8v3M9 13h.01" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>26. Email Header Investigation Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:0 0 28px;">
        ${[['Step 1','Collect Headers','Gmail Show original se full headers copy karo'],['Step 2','Read Received Chain','Bottom se top padho, original IP nikalo'],['Step 3','Check SPF','Sender IP authorized hai ya nahi'],['Step 4','Check DKIM','Message tampered hua ya nahi'],['Step 5','Check DMARC','Policy pass hua ya fail'],['Step 6','Analyze Links','Hover karke actual URL verify karo'],['Step 7','Scan Attachments','VirusTotal ya sandbox mein analyze karo']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'255,255,255,0.08':'220,20,20,0.15'});border-radius:10px;padding:10px 20px;width:300px;display:flex;align-items:center;gap:12px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[1]}</div><div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[2]}</div></div>
        </div>${i<a.length-1?'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin:2px 0;"><path d="M8 2v10M4 9l4 4 4-4" stroke="#333" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>27. SMTP Traffic in Wireshark</h2>
      <p>Wireshark mein SMTP traffic filter karke email ka poora conversation dekha ja sakta hai. Ye tab possible hai jab email unencrypted ho yaani plain SMTP use ho raha ho.</p>
      <pre><code>Filter: smtp

Observe hoga:
EHLO mail.sender.com        Greeting, sender identify karta hai
MAIL FROM: user@sender.com  Sender declare karta hai
RCPT TO: victim@target.com  Recipient specify karta hai
DATA                        Message body shuru hoti hai
.                           Message body khatam
QUIT                        Session band karta hai

Status codes:
220 = Service ready
250 = OK, command accepted
354 = Start mail input
550 = Rejected, delivery failed</code></pre>

      <h2>28. POP3 Traffic in Wireshark</h2>
      <p>POP3 traffic mein email retrieval observe hoti hai. Agar POP3 unencrypted ho toh credentials aur email content Wireshark mein dikh sakti hai.</p>
      <pre><code>Filter: pop

Commands jo dikh sakte hain:
USER username     Login attempt
PASS password     Password, unencrypted mein visible
LIST              Available emails list karo
RETR 1            Email number 1 retrieve karo
DELE 1            Email delete karo
QUIT              Session end</code></pre>

      <h2>29. IMAP Traffic in Wireshark</h2>
      <p>IMAP traffic mein synchronization activity observe hoti hai. Folders, messages aur sync operations dikh te hain.</p>
      <pre><code>Filter: imap

Observe hoga:
LOGIN username password    Authentication
SELECT INBOX               Folder select karna
FETCH 1 BODY[]             Email content fetch karna
SEARCH UNSEEN              Unread emails dhundhna
LOGOUT                     Session end</code></pre>
      <div class="info-box"><p><strong>Note:</strong> Modern email mostly TLS encrypted hota hai isliye credentials aur content directly nahi dikh te. Port 993 IMAPS aur Port 995 POP3S encrypted hote hain.</p></div>

      <h2>30. Practical Lab 1</h2>
      <p>SMTP traffic capture karo lab environment mein.</p>
      <pre><code>Step 1: Wireshark open karo
Step 2: Interface select karo
Step 3: Filter lagao: smtp
Step 4: Lab mein email send karo
Step 5: EHLO, MAIL FROM, RCPT TO commands observe karo
Step 6: Server responses dekho: 220, 250, 354</code></pre>

      <h2>31. Practical Lab 2</h2>
      <p>Koi bhi apna email lo aur headers manually inspect karo.</p>
      <pre><code>Gmail mein:
3-dot menu par click karo
Show original select karo
Poora raw header copy karo

Inspect karo:
From aur Return-Path compare karo
Received chain bottom se top padho
SPF DKIM DMARC results dhundho
Message-ID verify karo</code></pre>

      <h2>32. Practical Lab 3</h2>
      <p>Phishing email analyze karo. Sample phishing emails freely available hain online resources par.</p>
      <pre><code>mxtoolbox.com par jao
Email Header Analyzer use karo
Headers paste karo

Identify karo:
Suspicious IP addresses
Failed authentication results
Unusual relay servers
Domain mismatches</code></pre>

      <h2>33. Real Investigation Example</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="16" height="12" rx="2" stroke="#dc1414" stroke-width="1.4"/><path d="M1 6l8 5 8-5" stroke="#dc1414" stroke-width="1.4" stroke-linejoin="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Suspicious Invoice Email</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          User reports: "CEO ne invoice email bheja hai."<br>
          Received chain: Russia ke server se aaya tha<br>
          SPF = <span style="color:#dc1414;font-weight:600;">FAIL</span>, sender IP domain ke liye authorized nahi tha<br>
          DKIM = <span style="color:#dc1414;font-weight:600;">FAIL</span>, signature missing tha, message verified nahi<br>
          Domain = <span style="color:#dc1414;font-weight:600;">company.co</span> tha jabki real domain company.com hai<br>
          Attachment = <span style="color:#dc1414;font-weight:600;">invoice.docm</span>, macro-enabled malware tha<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: BEC phishing attack confirmed, finance team ko wire transfer rok diya</span>
        </div>
      </div>

      <h2>34. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Sirf From field trust karna','From spoofed ho sakta hai, headers check karna zaroori hai'],['Received headers ignore karna','Original source aur route miss ho jaayega'],['SPF check na karna','Unauthorized sender nahi pakda jaayega'],['Links bina hover ke click karna','Fake URLs trap hote hain, pehle check karo'],['DKIM ignore karna','Message tampering detect nahi hogi'],['Attachment seedha kholna','Pehle VirusTotal par scan karo']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>35. Skills to Master</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Email Headers','From, To, Subject, Date, Message-ID, Received, Return-Path'],['SMTP Basics','Commands, ports, server communication'],['SPF','DNS record check, sender IP authorization'],['DKIM','Digital signature verification, message integrity'],['DMARC','Policy enforcement, reporting, spoofing prevention'],['Phishing Analysis','Indicators, link analysis, urgency detection'],['Attachment Analysis','File types, macros, VirusTotal scanning'],['Email Tracing','Received chain analysis, IP extraction, geolocation']].map(r=>`
        <div style="display:grid;grid-template-columns:150px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <div class="info-box">
        <p><strong>Part 9 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Gmail mein ek email open karo, 3-dot menu se Show original select karo</li>
          <li>Received chain bottom se top padho aur original IP dhundho</li>
          <li>SPF, DKIM, DMARC results identify karo</li>
          <li>mxtoolbox.com par Email Header Analyzer use karo</li>
          <li>Wireshark mein smtp filter lagao aur commands observe karo</li>
          <li>Kisi bhi suspicious email mein link hover karke real URL check karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>SMTP ka kaam kya hai?</li>
          <li>Received header kyun important hai?</li>
          <li>SPF kya verify karta hai?</li>
          <li>DKIM kya verify karta hai?</li>
          <li>BEC attack kya hota hai?</li>
        </ul>
      </div>

    `;
