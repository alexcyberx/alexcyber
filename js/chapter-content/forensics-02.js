// Extracted from js/chapters.js — Network Forensics course, chapter index 2.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent02 = `

      <h2>1. Why OSI Model is EXTREMELY Important?</h2>
      <p>Agar OSI model nahi aata toh:</p>
      <ul>
        <li>Packet analysis mushkil ho jaati hai</li>
        <li>Wireshark confusing lagta hai</li>
        <li>Attacks samajh nahi aate</li>
        <li>Troubleshooting impossible ho jaati hai</li>
      </ul>
      <div class="info-box"><p><strong>Simple baat:</strong> Wireshark mein jo bhi dikh raha hai wo OSI ki kisi na kisi layer se belong karta hai. Layers samjho toh packets apne aap samajh aayenge.</p></div>

      <h2>2. OSI Model Kya Hai?</h2>
      <p>OSI ka matlab hai Open Systems Interconnection. Ye networking ka ek conceptual framework hai jo batata hai ki data network mein kaise travel karta hai.</p>

      <h2>3. OSI Model Structure</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">NAME</span>
        </div>
        ${[['7','Application'],['6','Presentation'],['5','Session'],['4','Transport'],['3','Network'],['2','Data Link'],['1','Physical']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Easy Memory Trick</h2>
      <p>Neeche se upar yaad karo: <strong>Please Do Not Throw Sausage Pizza Away</strong></p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">WORD</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
        </div>
        ${[['Please','Physical'],['Do','Data Link'],['Not','Network'],['Throw','Transport'],['Sausage','Session'],['Pizza','Presentation'],['Away','Application']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Data Flow Concept</h2>
      <p>Jab tum website open karte ho, data Application se Physical tak neeche jaata hai. Receiver side par reverse hota hai:</p>
      <pre><code>Sender:
Application Layer (7)
       ↓
Presentation Layer (6)
       ↓
Session Layer (5)
       ↓
Transport Layer (4)
       ↓
Network Layer (3)
       ↓
Data Link Layer (2)
       ↓
Physical Layer (1)
       ↓
  [Network par jaata hai]
       ↓
Receiver: reverse process</code></pre>

      <h2>6. Encapsulation</h2>
      <p>Ye MOST IMPORTANT concept hai. Jab data neeche layers mein jaata hai, har layer apna header add karti hai. Isi ko Encapsulation kehte hain.</p>
      <pre><code>[HTTP DATA]
       ↓
[TCP HEADER + DATA]
       ↓
[IP HEADER + TCP + DATA]
       ↓
[ETHERNET HEADER + IP + TCP + DATA]
       ↓
[BITS on wire]</code></pre>

      <h2>7. Decapsulation</h2>
      <p>Receiver side par har layer apna header remove karti hai jab tak actual data nahi mil jaata. Ye Encapsulation ka ulta process hai.</p>

      <h2>8. Layer 7 - Application Layer</h2>
      <p>User seedha is layer se interact karta hai. Browser, email, FTP sab yahan hote hain.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        ${[['HTTP','Normal website traffic'],['HTTPS','Encrypted website traffic'],['FTP','File transfer'],['DNS','Domain to IP resolution'],['SMTP','Email bhejna']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Forensics mein:</strong> Investigators websites visited, emails, DNS queries, aur uploaded files yahan se analyze karte hain.</p></div>

      <h2>9. Layer 6 - Presentation Layer</h2>
      <p>Data formatting, encryption, encoding aur compression yahan hota hai.</p>
      <ul>
        <li>SSL/TLS encryption yahan apply hoti hai</li>
        <li>JPEG, ASCII, UTF-8 encoding yahan hoti hai</li>
        <li>HTTPS traffic ka forensic challenge yahi se shuru hota hai kyunki data encrypt hota hai</li>
      </ul>

      <h2>10. Layer 5 - Session Layer</h2>
      <p>Session start karna, maintain karna aur terminate karna is layer ka kaam hai. Jab tum login karte ho ek session create hoti hai.</p>
      <div class="info-box"><p><strong>Forensics mein:</strong> Session hijacking, abnormal disconnects, aur unauthorized sessions yahan detect hote hain.</p></div>

      <h2>11. Layer 4 - Transport Layer</h2>
      <p>Ye MOST IMPORTANT forensic layer hai. Reliable delivery, segmentation, flow control aur error handling yahan hota hai.</p>

      <h2>12. TCP Deep Analysis</h2>
      <p>TCP provide karta hai reliability, ordered delivery aur acknowledgments.</p>
      <p><strong>TCP Header mein ye fields hote hain:</strong></p>
      <ul>
        <li>Source Port</li>
        <li>Destination Port</li>
        <li>Sequence Number</li>
        <li>ACK Number</li>
        <li>Flags</li>
      </ul>

      <h2>13. TCP Flags</h2>
      <p>Ye VERY IMPORTANT hain. Attack detection mein yahi flags kaam aate hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">FLAG</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['SYN','Connection shuru karna'],['ACK','Acknowledgment bhejana'],['FIN','Connection band karna'],['RST','Connection reset karna'],['PSH','Data turant push karna'],['URG','Urgent data hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Attack examples:</strong> SYN flood attack mein sirf SYN packets aate hain ACK nahi. Stealth scan mein abnormal flag combinations hote hain. Wireshark filter: tcp.flags.syn == 1</p></div>

      <h2>14. UDP Deep Analysis</h2>
      <p>UDP fast hai, connectionless hai aur delivery ki koi guarantee nahi hai. Gaming, streaming aur VoIP mein use hota hai.</p>
      <div class="info-box"><p><strong>Forensics mein:</strong> Malware aksar UDP use karta hai kyunki less overhead hota hai aur tracking mushkil hoti hai.</p></div>

      <h2>15. Layer 3 - Network Layer</h2>
      <p>Packets ko route karna is layer ka kaam hai. IP aur ICMP yahan kaam karte hain.</p>
      <ul>
        <li>Source IP aur Destination IP yahan hota hai</li>
        <li>ICMP ping aur diagnostics ke liye use hota hai</li>
      </ul>
      <div class="info-box"><p><strong>Forensics mein:</strong> Ping sweeps, reconnaissance aur IP tunneling yahan detect hoti hai.</p></div>

      <h2>16. Layer 2 - Data Link Layer</h2>
      <p>Local network communication MAC addresses se hoti hai. Ethernet aur ARP yahan kaam karte hain.</p>
      <pre><code>ARP Request:  "192.168.1.1 ka MAC kya hai?"
ARP Reply:    "00:1A:2B:3C:4D:5E"</code></pre>
      <div class="info-box"><p><strong>ARP Spoofing:</strong> Attacker fake ARP replies bhejta hai taaki traffic intercept kar sake. Is se MITM attack hota hai. Forensics mein duplicate MACs aur ARP poisoning detect karte hain.</p></div>

      <h2>17. Layer 1 - Physical Layer</h2>
      <p>Actual signal transmission yahan hoti hai. Cables, radio waves aur electrical signals is layer par hain. Forensics mein hardware taps aur cable interception is layer se related hai.</p>

      <h2>18. TCP/IP Model</h2>
      <p>Real-world mein TCP/IP model use hota hai jo OSI ka practical version hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TCP/IP LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">OSI EQUIVALENT</span>
        </div>
        ${[['Application','OSI Layer 5, 6, 7'],['Transport','OSI Layer 4'],['Internet','OSI Layer 3'],['Network Access','OSI Layer 1, 2']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>19. OSI vs TCP/IP</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;margin-bottom:12px;">OSI Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Theoretical model hai. 7 layers hain. Sikhne ke liye use hota hai.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:12px;">TCP/IP Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Practical model hai. 4 layers hain. Real internet par use hota hai.</div>
        </div>
      </div>

      <h2>20. Packet Journey Example</h2>
      <p>Jab tum https://google.com open karte ho:</p>
      <pre><code>Layer 7  Browser HTTP request create karta hai
       ↓
Layer 6  TLS encryption apply hoti hai
       ↓
Layer 5  Session establish hoti hai
       ↓
Layer 4  TCP segmentation hota hai
       ↓
Layer 3  IP header add hota hai
       ↓
Layer 2  MAC addresses add hote hain
       ↓
Layer 1  Bits wire par transmit hote hain</code></pre>

      <h2>21. Wireshark Layer Analysis</h2>
      <p>Wireshark mein koi bhi packet kholo aur neeche ye sections dikhenge:</p>
      <pre><code>Frame          → Physical layer info
Ethernet II    → Data Link layer
Internet Protocol → Network layer
TCP            → Transport layer
HTTP/HTTPS     → Application layer</code></pre>
      <div class="info-box"><p><strong>Practice:</strong> Koi bhi packet click karo aur har section ko expand karo. Har section ek OSI layer represent karta hai.</p></div>

      <h2>22. Important Wireshark Filters</h2>
      <pre><code>tcp       → Sirf TCP traffic
udp       → Sirf UDP traffic
dns       → Sirf DNS queries
icmp      → Sirf ping traffic
http      → Sirf HTTP traffic
tcp.flags.syn == 1   → Sirf SYN packets
arp       → Sirf ARP traffic</code></pre>

      <h2>23. Layer-wise Common Attacks</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">ATTACK</span>
        </div>
        ${[['Application','SQLi, XSS, DNS poisoning'],['Presentation','SSL stripping attacks'],['Session','Session hijacking, cookie theft'],['Transport','SYN flood, port scanning'],['Network','IP spoofing, ICMP tunneling'],['Data Link','ARP spoofing, MAC flooding'],['Physical','Cable tapping, hardware tap']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>24. Important Forensic Concepts</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Flow','Do systems ke beech complete communication stream'],['Stream Reassembly','Packets combine karke full conversation reconstruct karna'],['Beaconing','Malware ki periodic C2 server se communication']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>25. Real Investigation Example</h2>
      <p>Maan lo suspicious activity detect hui. Investigator layer by layer check karta hai:</p>
      <pre><code>Layer 7 → Kaunse domains query ho rahe hain?
Layer 4 → TCP behavior normal hai ya SYN flood?
Layer 3 → Kaunsi IPs involved hain?
Layer 2 → MAC mapping sahi hai ya ARP spoofing?</code></pre>

      <h2>26. Wireshark Practice Tasks</h2>
      <p><strong>Practice 1:</strong></p>
      <pre><code>Filter: tcp.flags.syn == 1
Observe: TCP SYN packets, port scan detect karo</code></pre>

      <p><strong>Practice 2:</strong></p>
      <pre><code>Filter: arp
Observe: ARP requests aur replies, duplicate MACs check karo</code></pre>

      <p><strong>Practice 3:</strong></p>
      <pre><code>Koi bhi packet kholo aur identify karo:
Source IP, Destination IP
Source Port, Destination Port
Protocol, TCP Flags</code></pre>

      <h2>27. Beginner Mistakes</h2>
      <ul>
        <li>Layers yaad na karna, bina layers ke packet reading mushkil hai</li>
        <li>TCP flags ignore karna, ye attack detection ka core hai</li>
        <li>ARP na samajhna, ARP spoofing bahut common attack hai</li>
        <li>Encapsulation skip karna, bina iske packet structure samajh nahi aata</li>
        <li>Headers na padhna, sab evidence headers mein hota hai</li>
      </ul>

      <h2>28. Most Important Things to Master</h2>
      <p>Is order mein master karo:</p>
      <ul>
        <li>TCP/IP model aur OSI layers</li>
        <li>TCP flags aur unka meaning</li>
        <li>Port numbers</li>
        <li>IP headers</li>
        <li>ARP protocol</li>
        <li>Encapsulation concept</li>
        <li>Wireshark mein packet reading layer by layer</li>
      </ul>

      <h2>29. Part 3 Complete</h2>
      <p>OSI model ab sirf ek diagram nahi raha, ye tumhara investigation framework ban gaya hai. Jab bhi koi attack hoga, tum directly samjhoge ki wo kaunsi layer par hua aur Wireshark mein kahan dhundhna hai.</p>
      <p>TCP flags, ARP, encapsulation, ye sab concepts ab tumhare paas hain. Part 4 mein hum Packet Analysis Fundamentals cover karenge jahan ye sab cheezein live packets mein apply hongi.</p>

      <div class="info-box">
        <p><strong>Part 3 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Wireshark mein koi bhi packet kholo aur har layer expand karo</li>
          <li>tcp.flags.syn == 1 filter lagao aur SYN packets observe karo</li>
          <li>ARP filter lagao aur local network ki ARP activity dekho</li>
          <li>Ek TCP connection follow karo aur handshake ke teeno packets dhundho</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>Encapsulation kya hai?</li>
          <li>SYN flag kyun use hota hai?</li>
          <li>ARP kya karta hai?</li>
          <li>OSI layer 3 kaunsi hai?</li>
          <li>TCP reliable kyun hai?</li>
        </ul>
      </div>

    `;
