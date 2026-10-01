// Extracted from js/chapters.js — Network Forensics course, chapter index 18.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent18 = `

      <h2>1. Yahan Se Sab Badal Jaata Hai</h2>
      <p>Parts 1 se 18 tak tumne tools, protocols, log formats aur detection techniques seekhe. Ab woh sab kaam aata hai. Real incidents mein koi script nahi hoti, koi hint nahi hota. Sirf logs hote hain, alerts hote hain, aur tumhara dimag hota hai. Is part mein hum wahi karte hain jo ek actual analyst karta hai jab incident aata hai.</p>
      <div class="info-box"><p>Investigation ki ek golden rule hai: <strong>Evidence kya kehta hai</strong> yahi poochho. Alert sahi hai ya galat, yeh baad mein pata chalta hai. Pehle evidence dekho.</p></div>

      <h2>2. Investigator Ka Dimag Kaise Kaam Karta Hai</h2>
      <p>Beginner analyst alert aata hai aur seedha conclusion pe pahunch jaata hai. Professional analyst alert ko starting point maanta hai. Phir evidence gather karta hai, validate karta hai, correlate karta hai, timeline banata hai aur tab koi baat karta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Beginner','Alert aata hai aur seedha escalate kar deta hai bina evidence ke'],['Professional','Alert aata hai, evidence gather hota hai, validate hota hai, correlate hota hai, timeline banti hai, tab jawaab aata hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Har Investigation Ka Framework</h2>
      <p>Chahe phishing ho, ransomware ho, insider threat ho ya cloud compromise: structure same rehta hai. Ye framework tumhare dimag mein permanently install ho jaana chahiye.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['WHO','Kaun involved hai? User, host, IP, account'],['WHAT','Kya hua exactly? Malware, login, download, upload'],['WHEN','Kab hua? Timeline banao. Pehle kya, baad mein kya'],['WHERE','Kaha hua? Source, destination, kaunsa system'],['HOW','Kaise hua? Attack path kya tha'],['WHY','Attacker ka goal kya tha? Data? Access? Disruption?']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Case 01: Phishing Se C2 Tak</h2>
      <p>User ne report kiya ke usne ek invoice email ka attachment open kiya. Kuch ajeeb lag raha hai system mein. Yahan se investigation shuru hoti hai.</p>
      <pre><code>Initial Report:
  "Maine ek email attachment open kiya tha.
   Ab system slow hai."

Pehla Sawaal: Kab open kiya?
Jawaab:       09:00 AM</code></pre>

      <h2>5. Case 01: Email Logs Analysis</h2>
      <p>Pehla kaam email investigate karna hai. Sender dekho, headers dekho, attachment type dekho. Ye sab mila ke bata deta hai ke actual threat tha ya kuch aur.</p>
      <pre><code>Sender:      billing@invoic3-ltd.com
Attachment:  invoice_march.docm
Received:    09:00 AM
Subject:     Invoice Pending Payment

DOCM file kyun dangerous hai?
  DOCM = Macro enabled Word document
  Macro = Code execute ho sakta hai
  Code = PowerShell, cmd, network calls</code></pre>
      <div class="info-box"><p>Sender domain mein dekho: <strong>invoic3-ltd.com</strong> mein "3" hai "e" ki jagah. Ye typosquatting hai. Attacker legitimate domain jaisi domain register karta hai taaki user dhoka kha sake.</p></div>

      <h2>6. Case 01: Endpoint Logs</h2>
      <p>Windows event logs mein process chain dikhti hai jo kisi bhi normal user ke workflow mein nahi aani chahiye. Ye sabse important finding hai.</p>
      <pre><code>Process Chain (parent se child):
  WINWORD.EXE   Word document open hua
  powershell.exe   Word ne launch kiya
  cmd.exe   PowerShell ne launch kiya
  curl.exe   Network se file fetch kiya

Kya Word normally PowerShell launch karta hai?
Nahin. Kabhi nahi.
Ye macro execution ka sign hai.</code></pre>

      <h2>7. Case 01: DNS Investigation</h2>
      <p>DNS logs mein us time ke queries dekho jab Word open hua tha. Attacker ka C2 domain yahin milega. Timestamp match karo process chain se.</p>
      <pre><code>09:00:00  Word opened
09:00:12  DNS Query: invoice-check.xyz
09:00:13  DNS Response: 185.220.101.47
09:00:14  TCP connection established

Kya company kabhi is domain pe gayi thi?
Nahin. Pehli baar. Zero history.
Fresh registered malicious domain.</code></pre>

      <h2>8. Case 01: Proxy Logs aur Beaconing</h2>
      <p>Proxy logs confirm karte hain ke file download hua. Flow logs batate hain ke download ke baad kya hua. Dono milao toh attack chain complete ho jaata hai.</p>
      <pre><code>Proxy:
  09:00:15  GET http://invoice-check.xyz/update.exe
            Response: 200 OK, 2.4 MB

Flow Logs (baad mein):
  09:01:00  185.220.101.47:443  1.2KB out
  09:02:00  185.220.101.47:443  1.1KB out
  09:03:00  185.220.101.47:443  1.3KB out

Har 60 second pe same IP, same port.
Ye automated beaconing hai, human traffic nahi.</code></pre>

      <h2>9. Case 01: IOC Extraction</h2>
      <p>Investigation wrap hone se pehle sab indicators extract karo. Ye dusre systems block karne mein aur threat intel feeds mein kaam aate hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Domain','invoice-check.xyz'],['IP','185.220.101.47'],['File','update.exe'],['Sender','billing@invoic3-ltd.com'],['Process Chain','WINWORD.EXE > powershell.exe > curl.exe'],['Pattern','60-second TLS beaconing']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:140px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;color:#f4f4f5;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>10. Case 02: Data Exfiltration</h2>
      <p>SIEM alert aaya: unusually large outbound upload detected. Pehla sawaal ye nahi hai ke attack hai. Pehla sawaal hai ke normal hai ya nahi.</p>
      <pre><code>Alert:
  Host:     192.168.1.20
  Upload:   45 GB in 30 minutes
  Time:     10:00 AM to 10:30 AM

Baseline check:
  Normal upload for this host: 300 MB/day
  Today: 45 GB

Ye 150x normal se zyada hai.</code></pre>

      <h2>11. Case 02: Endpoint Timeline</h2>
      <p>Host pe kya hua upload se pehle? Endpoint logs aur file system activity dekho. Data compression before upload exfiltration ka common pattern hai.</p>
      <pre><code>10:00  User login (normal)
10:03  7z.exe executed
10:04  archive.7z created (44.8 GB)
10:08  Upload to storage-data-sync.xyz started
10:38  Upload complete
10:39  archive.7z deleted

Destination domain:
  Registered: 3 days ago
  Category: uncategorized
  Threat feeds: Flagged
  Company approved list: Nahin</code></pre>
      <div class="info-box"><p>Compression before upload data exfiltration ka classic move hai. 7z ya zip se sab ek archive mein dalo, phir ek hi request mein bahar. Content-based DLP tools is pattern pe alert karte hain.</p></div>

      <h2>12. Case 03: Insider Threat</h2>
      <p>Finance employee ke account se large file activity alert aaya. Insider threat investigation mein assumption se nahi, evidence se shuru karte hain. Correlation tab meaningful hota hai jab baseline se clear deviation ho.</p>
      <pre><code>Past 30 Days (Baseline):
  Login times:   9:02 AM to 6:17 PM
  Files accessed: Finance documents only
  USB activity:  None
  Uploads:       0 to 5 MB/day

Today:
  Login time:    11:30 PM
  Files accessed: Finance + HR + Executive folder
  USB:           Inserted 11:35 PM
  Upload:        2.1 GB to personal cloud</code></pre>

      <h2>13. Case 03: Correlation Timeline</h2>
      <p>Alag events akele normal lag sakte hain. Jab unhe ek timeline mein dekha jaata hai toh picture emerge hoti hai.</p>
      <pre><code>11:30 PM  Login after hours
11:31 PM  Searched "confidential" in file explorer
11:33 PM  HR folder accessed (no normal access right)
11:35 PM  USB device inserted
11:36 PM  Mass copy to USB: 18 GB
11:52 PM  Copy complete
11:53 PM  Upload to personal Dropbox started
12:22 AM  Upload complete
12:23 AM  Logout</code></pre>

      <h2>14. Case 04: Brute Force Attack</h2>
      <p>Authentication logs mein massive failed login volume detect hua. Ye automatic alert tha. Ab verify karna hai ke ye actual attack tha ya misconfigured application. Phir damage scope assess karo.</p>
      <pre><code>Alert:
  Source IP:     45.33.32.156 (Bulgaria)
  Target:        VPN login portal
  Failed logins: 847 in 12 minutes
  Accounts:      847 different usernames tried

Password spray (same pass, many accounts)
ya brute force (same account, many passwords)?
847 alag usernames = Password Spray</code></pre>

      <h2>15. Case 04: Login Ke Baad Kya Hua</h2>
      <p>Failed logins se bhi important hai ye: koi successful hua kya? Agar hua toh investigation bilkul alag level pe jaati hai.</p>
      <pre><code>Filter: Same source IP + EventCode 4624 (success)

Result:
  admin.it@company.com   SUCCESS at 10:47 AM

10:47  VPN connected (45.33.32.156, Bulgaria)
10:48  Internal file server accessed
10:49  /IT/Network_Diagrams/ folder opened
10:51  6 files downloaded
10:53  /IT/Credentials_Backup/ folder accessed
10:54  VPN disconnected

7 minutes. Network diagrams + credential backup gaya.
DFIR team immediately escalate karo.</code></pre>

      <h2>16. Case 05: Ransomware Investigation</h2>
      <p>Multiple users ne report kiya ke files open nahi ho rahe, extension badal gayi hai. Ransomware ka classic presentation. Investigation ka focus hai origin dhundhna aur spread assess karna.</p>
      <pre><code>User reports:
  "Files .locked extension pe hain"
  "Desktop pe README_DECRYPT.txt hai"

First action:
  Affected hosts identify karo
  Network se isolate karo: immediately
  DO NOT reboot: memory mein evidence hai
  DO NOT pay ransom before investigation</code></pre>

      <h2>17. Case 05: Patient Zero aur Lateral Movement</h2>
      <p>Ransomware kisi ek host pe shuru hota hai. Encryption timestamps compare karo toh pehla host mil jaata hai. Wahan se infection vector milega.</p>
      <pre><code>Encryption Timestamps:
  HOST-FIN-01:  10:14 AM  (first)
  HOST-FIN-02:  10:31 AM
  HOST-FIN-03:  10:44 AM
  HOST-HR-01:   11:02 AM

Patient Zero: HOST-FIN-01

HOST-FIN-01 pe 10:14 se pehle:
  10:02  invoice.exe opened from email
  10:09  DNS: ransom-key-server.xyz
  10:14  Encryption started

Lateral Movement via SMB:
  HOST-FIN-01 se HOST-FIN-02 pe (admin$ share)
  HOST-FIN-01 se HOST-FIN-03 pe (admin$ share)
  Remote service created: encryptor.exe</code></pre>

      <h2>18. Case 06: Cloud Account Compromise</h2>
      <p>AWS CloudTrail ne alert kiya ke naya IAM user create hua, administrator permissions de diya gaya. 2 AM pe. Bina change ticket ke. Ye investigate karna hai.</p>
      <pre><code>CloudTrail:
  2:13 AM  admin@company.com   login from 91.108.4.xx, Russia
  2:14 AM  CreateUser: backup-service-acct
  2:14 AM  AttachUserPolicy: AdministratorAccess
  2:15 AM  CreateAccessKey for new user
  2:16 AM  S3 ListBuckets
  2:17 AM  S3 GetObject x 2,847 objects
  2:44 AM  EC2 DescribeInstances
  2:51 AM  admin logout

Admin se verify kiya: "Maine kuch nahi kiya raat ko"

Credentials stolen. Session token reuse.
Backdoor user banaya, 2847 S3 objects download kiye.</code></pre>

      <h2>19. Case 07: DNS Tunneling</h2>
      <p>Ek workstation se DNS traffic unusually high tha. Volume alert nahi tha, manually notice kiya gaya: yahi proactive threat hunting hai.</p>
      <pre><code>Normal DNS per host: 200 to 500 queries/day
This host: 47,000 queries in 6 hours

Query pattern:
  aGVsbG8gd29ybGQ.data-sync.xyz
  dGhpcyBpcyBkYXRh.data-sync.xyz
  dHVubmVsaW5n.data-sync.xyz

Decode karo (base64):
  aGVsbG8gd29ybGQ   decoded: "hello world"
  dGhpcyBpcyBkYXRh  decoded: "this is data"
  dHVubmVsaW5n      decoded: "tunneling"

DNS ko data channel ki tarah use kiya ja raha hai.
Firewall DNS block nahi kar sakta.
Issi wajah se ye technique effective hai.</code></pre>

      <h2>20. Case 08: Beaconing Without Signatures</h2>
      <p>Koi antivirus alert nahi. Koi malware signature match nahi. Phir bhi ek host ka behavior suspicious tha. Behavioral analysis kaam aata hai jab signatures fail karte hain.</p>
      <pre><code>Flow logs:
  08:00:00  192.168.1.55 to 91.240.118.xx:443   1.1KB outbound
  08:02:00  192.168.1.55 to 91.240.118.xx:443   1.2KB outbound
  08:04:00  192.168.1.55 to 91.240.118.xx:443   1.0KB outbound
  08:06:00  192.168.1.55 to 91.240.118.xx:443   1.1KB outbound

Har 120 second pe, same IP, same port, same size.

TLS Certificate:
  Issuer: Self signed (not CA issued)
  Subject: CN=localhost
  Registered: 3 days ago
  JA3 hash: Known malware fingerprint (3 samples)

Self signed cert on public IP.
CN=localhost public infrastructure pe.
Ye attacker-controlled C2 hai.</code></pre>

      <h2>21. Multi-Source Correlation</h2>
      <p>Ek source kabhi poori kahani nahi batata. Har source ek piece deta hai. Investigator ka kaam hai sab pieces milake complete picture banana.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Email Logs','Initial vector. Sender, attachment type, timing'],['DNS Logs','C2 domain resolution. Pehle contact ka timestamp'],['Proxy Logs','Payload download URL. File name, size, response code'],['Endpoint Logs','Process chain. Parent-child. Macro execution proof'],['Flow Logs','Beaconing pattern. Outbound volume. Data exfil'],['Auth Logs','Credential use. Lateral movement. After-hours access']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:140px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>22. Professional Analyst Ki Soch</h2>
      <p>Real investigations mein har alert attack nahi hota. Aur har attack mein alert nahi aata. Professional analyst dono situations handle karta hai bina panic kiye aur bina dismiss kiye.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Alert aaya, evidence nahi mila','False positive. Document karo kyun FP tha, rule improve karo'],['Alert nahi aaya, behavior suspicious tha','Threat hunt se mila. Detection gap hai. Rule banao'],['Alert aaya, evidence confirm hua','True positive. Escalate, contain, deep investigate'],['Multiple hosts same pattern','Scope assess karo. Mass compromise possible'],['Evidence incomplete','Aur sources dhundho. Conclusion mat banao adhoore data pe']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>23. Master Checklist</h2>
      <p>Koi bhi investigation complete nahi hoti jab tak ye checklist puri na ho. Chahe chota incident ho ya bada, structure same rehta hai.</p>
      <pre><code>Investigation Complete Karne Se Pehle:

  Timeline banayi?
    Pehla event kab, kya sequence mein hua

  IOC extract hue?
    Domains, IPs, hashes, filenames, process names

  Source identify hua?
    Kahan se aaya: email, RDP, supply chain, USB

  Destination identify hua?
    Data kahan gayi, C2 server kahan tha

  Root cause mila?
    Kaise andar aaya: initial access vector

  Scope clear hai?
    Kitne hosts, kitne accounts affected

  Evidence preserve hua?
    Logs export, PCAP save, memory dump if needed

  Report ready hai?
    Incident ID, timeline, IOCs, actions taken</code></pre>

      <h2>24. Incident Documentation Format</h2>
      <p>Investigation khatam hoti hai tab jab report complete ho. Legal ho ya internal: documentation hi future mein kaam aata hai.</p>
      <pre><code>Incident ID   : INC-2024-0587
Date          : 2024-05-18
Analyst       : [Name], Tier 2
Severity      : Critical

Kya Hua:
  HOST-FIN-01 phishing email se compromise hua.
  Ransomware 3 aur hosts pe phail gaya via SMB.

Timeline:
  10:02  Phishing email opened
  10:05  invoice.exe execute hua
  10:09  C2 connection: ransom-key-server.xyz
  10:14  Encryption started
  10:31  Lateral movement to HOST-FIN-02

IOCs:
  Domain:  ransom-key-server.xyz
  IP:      185.220.x.x
  File:    invoice.exe

Affected:
  HOST-FIN-01, 02, 03, HOST-HR-01

Actions:
  4 hosts isolated from network
  Credentials reset
  DFIR team engaged
  Backups verified clean</code></pre>

      <h2>25. Interview Questions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Patient zero kya hota hai?','Woh pehla host jo infection ka starting point tha. Investigation mein sabse pehle dhundhna hota hai'],['IOC aur IOA mein kya fark?','IOC: compromise ke baad mila evidence (hash, domain). IOA: attack ke dauran behavior (process chain, lateral move)'],['Beaconing detect kaise karte hain?','Flow logs mein same IP pe regular intervals pe connections. Statistical jitter analysis se pattern confirm hota hai'],['Lateral movement ke indicators?','Admin shares access, PsExec use, new service creation remote se, WMI remote execution'],['Ransomware investigation mein reboot kyun mana?','Memory mein encryption keys aur attacker artifacts hote hain jo reboot pe destroy ho jaate hain'],['DNS tunneling normal DNS se alag kaise?','Long subdomains, high entropy, TXT record use, volume anomaly, same base domain pe thousands of queries'],['Cloud compromise mein kya dhundho?','Unusual IAM actions, new user creation, policy attach, S3 mass download, after-hours login from foreign IP']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;min-width:40px;text-align:center;">Q${i+1}</span>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span>
            <span style="font-family:'Inter',sans-serif;font-size:11px;color:#777;">${r[1]}</span>
          </div>
        </div>`).join('')}
      </div>

      <!-- PART 19 COMPLETE BANNER -->
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.3);border-radius:14px;padding:28px 24px;margin:0 0 28px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;right:0;width:180px;height:180px;background:radial-gradient(circle,rgba(220,20,20,0.07) 0%,transparent 70%);pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          <div style="flex-shrink:0;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.6"/>
              <path d="M16 24l6 6 10-12" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 19 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Real Incident Case Studies</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">8 real-world cases investigate kiye: phishing se C2 tak, data exfiltration, insider threat, brute force, ransomware, cloud compromise, DNS tunneling, aur behavioral beaconing. Ab tum sirf theory nahi jaante: tum sochna jaante ho.</p>
      </div>

      <!-- WHAT'S NEXT -->
      <div style="background:#0e0e13;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 22px;margin:0 0 28px;display:flex;align-items:flex-start;gap:14px;">
        <div style="flex-shrink:0;margin-top:2px;">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="8" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.25)" stroke-width="1.2"/>
            <path d="M11 16h10M18 13l3 3-3 3" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;margin-bottom:6px;letter-spacing:0.5px;">Aage kya aayega</div>
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 20 mein Expert Network Forensics Roadmap cover hoga. Complete career path 0 se expert tak, certifications, home lab setup, TryHackMe aur HackTheBox paths, SOC aur DFIR roadmap, aur 1-year mastery plan.</p>
        </div>
      </div>

      <!-- MINI ASSIGNMENT -->
      <div class="info-box">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/>
            <path d="M9 6v4M9 12v.5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;letter-spacing:0.5px;">Mini Assignment</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            'Case 01 mein WINWORD.EXE ne PowerShell kyu launch kiya? Normal scenario mein ye kab hota hai?',
            'DNS tunneling aur normal DNS queries mein volume ke alawa kya aur dekha jaata hai identification ke liye?',
            'Ransomware investigation mein reboot karna kyun mana hota hai? Memory mein kya milta hai?',
            'Insider threat aur compromised account mein indicators overlap karte hain: kaise differentiate karte hain?',
            'Self signed TLS certificate public IP pe suspicious kyun hai? Legitimate use cases kya hote hain?',
            'Ek phishing incident ka complete timeline likho: email aane se C2 beaconing confirm hone tak.'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
