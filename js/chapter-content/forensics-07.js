// Extracted from js/chapters.js — Network Forensics course, chapter index 7.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent07 = `

      <h2>1. Why HTTPS Forensics is Important?</h2>
      <p>Aaj internet ka adhiktar traffic HTTPS par chalta hai - Google, YouTube, Instagram, Banking, Cloud Services sab. Problem ye hai ki HTTPS encrypted hota hai. Isliye investigator ko encrypted traffic ki metadata analysis seekhni padti hai.</p>

      <h2>2. HTTP vs HTTPS</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:12px;">HTTP</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:2;">Plain Text hai. Port 80. Asaani se padha ja sakta hai. Insecure hai.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;margin-bottom:12px;">HTTPS</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:2;">Encrypted hai. Port 443. Directly padhna mushkil. Secure hai.</div>
        </div>
      </div>

      <h2>3. SSL vs TLS</h2>
      <p>SSL (Secure Sockets Layer) purana encryption protocol tha. Aaj almost completely replace ho chuka hai TLS se. TLS (Transport Layer Security) HTTPS ka modern security protocol hai.</p>

      <h2>4. TLS Kahan Use Hota Hai?</h2>
      <ul>
        <li>Websites - HTTPS</li>
        <li>Email - SMTPS, IMAPS</li>
        <li>VPNs</li>
        <li>APIs</li>
        <li>Cloud services</li>
      </ul>

      <h2>5. TLS ke 3 Goals</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Confidentiality','Koi third party traffic nahi padh sakti'],['Integrity','Data modify hua ya nahi verify karta hai'],['Authentication','Server actually wahi hai jo claim karta hai, verify karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>6. TLS Versions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SSL 2.0','Obsolete - use mat karo'],['SSL 3.0','Obsolete - use mat karo'],['TLS 1.0','Legacy - outdated'],['TLS 1.1','Legacy - outdated'],['TLS 1.2','Common - abhi bhi use hota hai'],['TLS 1.3','Modern - latest aur most secure']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:110px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:${i<4?'#555':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:${i<4?'#444':'#888'};">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Forensics mein:</strong> Agar koi server TLS 1.0 ya 1.1 use kar raha hai toh ye suspicious hai ya misconfigured server hai.</p></div>

      <h2>7. TLS Handshake Overview</h2>
      <p>Connection shuru hone se pehle TLS handshake hota hai jismein encryption setup, key exchange aur certificate verification hota hai.</p>
      <pre><code>Client Hello    → Client capabilities bhejta hai
      ↓
Server Hello    → Server parameters select karta hai
      ↓
Certificate     → Server apna certificate bhejta hai
      ↓
Key Exchange    → Encryption keys exchange hoti hain
      ↓
Encrypted Session → Sab kuch ab encrypted hai</code></pre>

      <h2>8. Client Hello</h2>
      <p>Client pehla message bhejta hai jismein hota hai:</p>
      <ul>
        <li>TLS version jo support karta hai</li>
        <li>Supported cipher suites ki list</li>
        <li>Extensions</li>
        <li>SNI (Server Name Indication)</li>
      </ul>

      <h2>9. Server Hello</h2>
      <p>Server reply karta hai jismein hota hai:</p>
      <ul>
        <li>Selected cipher suite</li>
        <li>TLS version</li>
        <li>Session parameters</li>
      </ul>

      <h2>10. Certificate Exchange</h2>
      <p>Server apna digital certificate bhejta hai jisme hota hai: domain name, public key, issuer aur validity dates.</p>

      <h2>11. Certificate Kya Hai?</h2>
      <p>Website ka digital identity card. Certificate prove karta hai ki tum actually Google se baat kar rahe ho, kisi attacker se nahi.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Subject','Website domain name'],['Issuer','Certificate Authority ka naam'],['Valid From','Certificate kab se valid hai'],['Valid To','Certificate kab expire hoga'],['Public Key','Encryption ke liye public key']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>12. Certificate Authorities</h2>
      <p>Trusted organizations jo certificates issue karti hain: Let's Encrypt, DigiCert, GlobalSign. Agar certificate kisi unknown CA se hai toh suspicious hai.</p>

      <h2>13. TLS Wireshark Filters</h2>
      <pre><code>tls                                    → Sab TLS traffic
tls.handshake                          → Handshake packets
tls.handshake.certificate             → Certificate packets
tls.handshake.extensions_server_name  → SNI field</code></pre>

      <h2>14. Investigators Encrypted Traffic Mein Bhi Kya Dekh Sakte Hain?</h2>
      <p>HTTPS encrypted hone ke bawajood ye sab dikh sakta hai:</p>
      <ul>
        <li>Source IP aur Destination IP</li>
        <li>Domain name SNI field se</li>
        <li>TLS version</li>
        <li>Certificate information</li>
        <li>Connection timing</li>
        <li>Traffic volume</li>
      </ul>

      <h2>15. SNI - Server Name Indication</h2>
      <p>Client TLS handshake mein destination domain batata hai. Ye field aksar unencrypted hoti hai aur investigators ise dekh sakte hain.</p>
      <pre><code>Filter: tls.handshake.extensions_server_name

Example SNI value: youtube.com
Matlab: client youtube.com se connect karne ki koshish kar raha hai</code></pre>

      <h2>16. SNI Kyun Important Hai?</h2>
      <p>SNI se pata chalta hai:</p>
      <ul>
        <li>Destination website kaun si thi</li>
        <li>Malware ka server domain</li>
        <li>Suspicious domains</li>
      </ul>
      <div class="info-box"><p><strong>Practical use:</strong> Agar SNI mein random domain dikh raha hai jaise jx82ksla92.com toh ye malware C2 ka sign ho sakta hai.</p></div>

      <h2>17. Suspicious Domains Detect Karna</h2>
      <ul>
        <li>Random looking domains jaise jx82ksla92.com</li>
        <li>Newly registered domains</li>
        <li>Unknown infrastructure IPs</li>
        <li>Domains jo threat intelligence mein listed hain</li>
      </ul>

      <h2>18. JA3 Fingerprinting</h2>
      <p>Advanced forensic technique hai. JA3 TLS Client Hello se ek unique fingerprint banata hai based on TLS version, cipher suites aur extensions.</p>
      <div class="info-box"><p><strong>Kyun useful hai:</strong> Alag alag applications unique TLS fingerprints produce karte hain. Is se malware families, custom tools aur known software identify ho sakti hai.</p></div>

      <h2>19. Malware HTTPS Communication</h2>
      <pre><code>Step 1: DNS query → C2 domain resolve karo
Step 2: TLS connection → encrypted session establish karo
Step 3: Commands receive karo encrypted mein
Step 4: Stolen data bhejo encrypted mein</code></pre>
      <p>Payload encrypted hone ki wajah se directly nahi dekh sakte lekin metadata se bahut kuch pata chalta hai.</p>

      <h2>20. HTTPS Investigation Challenge</h2>
      <p>Payload hidden hota hai. Directly nahi dekh sakte:</p>
      <ul>
        <li>Commands jo server bhej raha hai</li>
        <li>Stolen data jo upload ho raha hai</li>
        <li>Credentials</li>
      </ul>
      <p>Lekin metadata analysis se bahut kuch reveal hota hai.</p>

      <h2>21. Metadata Se Kya Reveal Hota Hai?</h2>
      <ul>
        <li>Timing patterns beaconing detect karte hain</li>
        <li>Connection frequency suspicious behavior batati hai</li>
        <li>Domain reputation se malware servers pata chalte hain</li>
        <li>JA3 fingerprint se tool identify hota hai</li>
        <li>SNI se destination domain milta hai</li>
        <li>Traffic volume se data exfiltration ka pata chalta hai</li>
      </ul>

      <h2>22. Beaconing Over HTTPS</h2>
      <pre><code>Har 60 seconds par same domain par TLS connection
Same packet size
Same destination IP

Ye malware C2 beaconing ka classic sign hai</code></pre>

      <h2>23. Beaconing Detect Karna</h2>
      <ul>
        <li>Fixed intervals par repeated TLS sessions</li>
        <li>Consistent packet sizes</li>
        <li>Same destination IP aur port</li>
        <li>Unusual times par connections</li>
      </ul>

      <h2>24. Self-Signed Certificates</h2>
      <p>Certificate jo khud apne aap sign hota hai, kisi trusted CA se nahi. Often use hota hai:</p>
      <ul>
        <li>Internal labs mein</li>
        <li>Malware infrastructure mein</li>
        <li>Fake services mein</li>
      </ul>
      <div class="info-box"><p><strong>Red flag:</strong> Agar koi website self-signed certificate use kar rahi hai aur wo koi known service nahi hai toh ye suspicious hai.</p></div>

      <h2>25. Expired Certificates</h2>
      <p>Expired certificate possible indicator hai:</p>
      <ul>
        <li>Misconfigured servers</li>
        <li>Neglected attacker servers</li>
        <li>Suspicious infrastructure</li>
      </ul>

      <h2>26. TLS Hunting Workflow</h2>
      <pre><code>Step 1: tls filter lagao → TLS traffic dhundho
Step 2: SNI check karo → kaunse domains hain
Step 3: Certificates review karo → issuer aur validity
Step 4: Destination IPs check karo → threat intel mein
Step 5: Timing analyze karo → beaconing toh nahi
Step 6: JA3 fingerprint check karo → tool identify karo</code></pre>

      <h2>27. Practical Lab 1</h2>
      <pre><code>https://google.com kholo
Traffic capture karo
Filter: tls
TLS packets observe karo</code></pre>

      <h2>28. Practical Lab 2</h2>
      <pre><code>Filter: tls.handshake
Identify karo:
Client Hello packet
Server Hello packet
Certificate packet</code></pre>

      <h2>29. Practical Lab 3</h2>
      <pre><code>Kisi bhi Certificate packet par click karo
Expand karo: Transport Layer Security
Certificate fields dekho:
Subject, Issuer, Expiration date</code></pre>

      <h2>30. Practical Lab 4</h2>
      <pre><code>Filter: tls.handshake.extensions_server_name
Observe karo kaunse domains SNI mein hain
Unknown ya suspicious domains note karo</code></pre>

      <h2>31. Real Investigation Example</h2>
      <p>Alert: suspected malware communication. Investigator findings:</p>
      <pre><code>Finding 1: Repeated TLS sessions har 60 seconds par
Finding 2: Unknown domain SNI mein - jx82k.io
Finding 3: Self-signed certificate
Finding 4: Fixed packet size har baar

Conclusion: Command and Control beaconing hai</code></pre>

      <h2>32. Skill: Certificate Analysis</h2>
      <pre><code>Wireshark mein certificate packet kholte waqt:
tls.handshake.certificate

Dekho:
Subject → kaunsa domain
Issuer → kaunsi CA
Valid From / To → dates
Serial Number → unique identifier</code></pre>

      <h2>33. TLS Version Detection</h2>
      <pre><code>Filter: tls.record.version

Agar TLS 1.0 ya SSL 3.0 dikh raha hai:
Ye outdated aur suspicious hai
Modern systems TLS 1.2 ya 1.3 use karte hain</code></pre>

      <h2>34. Combining DNS + TLS Investigation</h2>
      <pre><code>Step 1: dns filter → kaunse domains query hue
Step 2: Suspicious domain mila → note karo IP
Step 3: ip.addr == [suspicious IP] → us IP ka traffic
Step 4: tls filter → kya TLS connection hua
Step 5: SNI confirm karo → same domain hai kya
Step 6: Beaconing check karo</code></pre>

      <h2>35. Beginner Mistakes</h2>
      <ul>
        <li>Sochna ki HTTPS investigate hi nahi ho sakta</li>
        <li>Metadata ignore karna, wahan evidence milta hai</li>
        <li>Certificates check na karna, self-signed miss ho jaata hai</li>
        <li>Timing analysis ignore karna, beaconing detect nahi hogi</li>
        <li>SNI ignore karna, destination domain miss ho jaata hai</li>
      </ul>

      <h2>36. Skills to Master</h2>
      <ul>
        <li>TLS handshake process samajhna</li>
        <li>Certificates analyze karna</li>
        <li>SNI se domains identify karna</li>
        <li>TLS Wireshark filters use karna</li>
        <li>Beaconing patterns detect karna</li>
        <li>Metadata investigation</li>
      </ul>

      <h2>37. Part 8 Complete</h2>
      <p>HTTPS ab tumhare liye ek closed door nahi rahi. Encrypted traffic ke andar directly nahi dekh sakte lekin metadata, certificates, SNI, timing aur JA3 fingerprints se investigator bahut kuch reveal kar leta hai.</p>
      <p>Ye skills real SOC analysts aur forensic investigators daily use karte hain. Malware jo HTTPS use karta hai woh bhi in techniques se pakda jaata hai. Part 9 mein Email Forensics cover karenge.</p>

      <div class="info-box">
        <p><strong>Part 8 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>https://google.com visit karo aur tls filter se handshake observe karo</li>
          <li>tls.handshake.certificate se certificate details dekho</li>
          <li>tls.handshake.extensions_server_name se SNI values check karo</li>
          <li>Statistics → I/O Graphs mein TLS connection patterns dekho</li>
          <li>tls.record.version se TLS versions identify karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>SSL aur TLS mein kya difference hai?</li>
          <li>SNI kya hota hai?</li>
          <li>Certificate kyun zaroori hai?</li>
          <li>HTTPS investigation mein kaunsi metadata useful hoti hai?</li>
          <li>Beaconing kya indicate kar sakta hai?</li>
        </ul>
      </div>

    `;
