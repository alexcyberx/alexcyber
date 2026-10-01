// Extracted from js/chapters.js — Network Forensics course, chapter index 20.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent20 = `

      <h2>1. Home Lab Kyun Zaroori Hai</h2>
      <p>Cybersecurity mein 90 percent beginners fail isliye nahi hote ke intelligent nahi hote. Fail isliye hote hain kyunki sirf theory padhte hain, practical zero hoti hai. Interview mein recruiter kabhi nahi puchega ke tumne kitne videos dekhe. Puchega: tumne kya build kiya, kya investigate kiya.</p>

      <h2>2. Theory Aur Practical Ka Sahi Cycle</h2>
      <p>Bahut beginners sochte hain pehle 2 saal theory, phir practical karenge. Ye wrong hai. Sahi cycle hai: thodi theory, phir practice, phir thodi aur theory, phir aur practice. Dono saath saath chalne chahiye.</p>
      <pre><code>Wrong:  Theory (2 years) --> Practical
Correct: Theory --> Practical --> Theory --> Practical</code></pre>

      <h2>3. Minimum Hardware Requirements</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['8 GB RAM','Beginner level. Kali Linux, Ubuntu, Wireshark practice. CPU i3 ya Ryzen 3. Storage 256 GB SSD.'],
          ['16 GB RAM','Recommended setup. Kali, Windows, Ubuntu, Wazuh SIEM, chhota AD lab. Storage 512 GB SSD.'],
          ['32 GB RAM','Professional. Multiple servers, Active Directory, Splunk, full SOC lab. Storage 1 TB SSD.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:110px 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p>SSD strongly recommended hai. PCAP files, VM snapshots, aur log files bahut space aur speed maangti hain. HDD pe lab bahut slow ho jaata hai aur frustration hoti hai.</p></div>

      <h2>4. VirtualBox vs VMware</h2>
      <p>VirtualBox Oracle ka free tool hai, beginners ke liye best choice hai. Lightweight hai aur easy setup hai. VMware Workstation zyaada smooth experience deta hai lekin paid hai. Beginner ke liye VirtualBox se shuru karo, baad mein VMware explore kar sakte ho.</p>

      <h2>5. VM Setup Order</h2>
      <pre><code>Step 1: VirtualBox install karo (Oracle, free)
Step 2: Ubuntu VM banao
        Reason: Linux fundamentals build honge
        Seekho: ip addr, ping, netstat, ss, tcpdump
Step 3: Kali Linux VM banao
        Reason: Security tools available honge
        Note: Kali sirf tools ka collection hai
Step 4: Windows 10 ya 11 VM banao
        Reason: Most enterprise environments Windows use karte hain
        Seekho: Event Viewer, Services, Task Scheduler, PowerShell
Step 5: Sab VMs ek virtual network pe daalo
Step 6: Ping each machine, confirm connectivity</code></pre>

      <h2>6. First Network Lab</h2>
      <p>Kali, Windows, aur Ubuntu ko same virtual network pe daalo. Ab ping each machine. Ye simple exercise networking ka foundation banati hai aur real lab jaisi feel deti hai.</p>

      <h2>7. Wireshark Lab</h2>
      <p>Ubuntu pe Wireshark install karo. Browser open karo, google.com visit karo. Wireshark pe capture karo aur observe karo:</p>
      <pre><code>Sequence jo tumhe dikhega:
  DNS query      (google.com kahan hai?)
  DNS response   (IP address mila)
  TCP handshake  (connection banao)
  TLS handshake  (encryption setup)
  HTTPS data     (actual content, encrypted)

Ye sequence samajhna bahut important hai.
Investigators daily ye dekhte hain.</code></pre>

      <h2>8. DNS Investigation Lab</h2>
      <pre><code>Capture karo aur answer karo:
  Kaunsa domain query hua?
  Kaunsa DNS server use hua?
  Response kya tha?
  Kitna time laga (TTL)?
  Koi failed query (NXDOMAIN) thi?</code></pre>

      <h2>9. HTTP Investigation Lab</h2>
      <pre><code>http://example.com visit karo aur observe karo:
  GET request kahan gayi?
  Response code kya tha? (200 OK)
  Headers mein kya tha?
  Content-Type kya tha?
  Server kaunsa tha?</code></pre>

      <h2>10. TLS Investigation Lab</h2>
      <pre><code>https://google.com visit karo aur observe karo:
  Client Hello (browser ne kya bheja)
  Server Hello (server ne kya respond kiya)
  Certificate (kaun issue kiya, kab expire)
  TLS version (1.2 ya 1.3?)

TLS understanding future mein malware
analysis mein bahut kaam aayegi.</code></pre>

      <h2>11. Log Analysis Lab</h2>
      <pre><code>Ubuntu mein:
  /var/log/auth.log     (authentication events)
  /var/log/syslog       (system events)
  /var/log/apache2/     (web server logs)

Windows mein Event Viewer:
  Security logs        (login events, EventID 4624, 4625)
  System logs          (service start/stop)
  Application logs     (process execution)</code></pre>

      <h2>12. Wazuh SIEM Lab</h2>
      <p>Wazuh free hai aur real SOC jaisa environment deta hai. Windows VM pe agent install karo, Wazuh server pe logs jaate hain, dashboard pe alerts milte hain.</p>
      <pre><code>Wazuh Architecture:
  Windows VM     (Wazuh agent installed)
  Wazuh Server   (log collection aur analysis)
  Dashboard      (alerts, rules, monitoring)

Ab real SOC analyst jaisi feeling aayegi.
Authentication events, process execution,
file changes sab monitor hoga real time mein.</code></pre>

      <h2>13. Active Directory Lab</h2>
      <p>Zyaadatar companies Active Directory use karti hain. Real attacks AD ko target karte hain. Ye lab enterprise environment samajhne ke liye essential hai.</p>
      <pre><code>AD Lab Machines:
  Domain Controller   (Windows Server)
  Windows Client      (domain joined)
  Kali Linux          (attacker machine)

Practice scenarios:
  Password spraying detection
  Kerberoasting attempt logging
  Lateral movement via SMB
  Credential dumping detection</code></pre>

      <h2>14. Snapshot Kya Hota Hai</h2>
      <p>VM Snapshot matlab current state save karna. Koi experiment kiya aur fail hua? Snapshot restore karo, sab wapas normal. Professional labs mein snapshots bahut use hote hain. Infected machine banao, investigate karo, phir clean snapshot pe wapas jao.</p>

      <h2>15. Malware Traffic Analysis Practice</h2>
      <p>malware-traffic-analysis.net pe real malware ke PCAPs freely available hain. Har PCAP ek real incident ka hissa tha. Ye sabse valuable free resource hai network forensics practice ke liye.</p>
      <pre><code>Har PCAP investigate karte waqt:
  Infected host kaunsa tha?
  Malware ne kaunsa domain contact kiya?
  Kaunsi file download hui?
  Beaconing hua ya nahi?
  Final IOC list kya hai?

Target: 100 se zyaada PCAPs investigate karo.
Ye number interview mein strong impression deta hai.</code></pre>

      <h2>16. Lab Documentation</h2>
      <p>Sabse zyaada ignore ki jaane wali skill. Har lab ke baad likho: objective kya tha, kaunse tools use kiye, kya mila, screenshots kahan hain, kya seekha. Ye sab GitHub pe daalo. Portfolio banta hai recruiter khud dhundh ke aate hain.</p>

      <h2>17. Build Your First SOC</h2>
      <p>Wazuh install karo, Windows pe agent lagao, alerts dekho, rules tune karo, dashboards banao. Ab tumhara ghar hi SOC ban jaata hai. Ye experience real job se bilkul milta julta hai.</p>

      <h2>18. Weekly Practice Schedule</h2>
      <pre><code>Monday     Networking concepts review
Tuesday    Wireshark PCAP investigation
Wednesday  Log analysis (Windows aur Linux)
Thursday   Wazuh SIEM alerts aur rule tuning
Friday     Threat hunting exercise
Saturday   Full malware PCAP case study
Sunday     Documentation aur GitHub writeup</code></pre>

      <h2>19. Biggest Home Lab Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['100 Tools Install','Sirf collect karna, use kuch nahi. Focus karo, mastery karo.'],
          ['Lab Banake Chord Dena','Build karke use na karna. Daily practice zaroori hai.'],
          ['No Documentation','Bina writeup ke sab kuch bhool jaate ho. Document karo.'],
          ['Sirf Tutorials Dekhna','Passive learning se skill nahi aati. Khud karo.'],
          ['No Investigations','Tools sikhna alag baat hai, actually investigate karna alag.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:180px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <div class="info-box"><p>Golden Rule: Sawaal ye nahi poochho ke kaunsa tool seekhun. Sawaal ye poochho: kaunsi problem solve karni hai. Tools baad mein aate hain, problem understanding pehle aati hai.</p></div>

    `;
