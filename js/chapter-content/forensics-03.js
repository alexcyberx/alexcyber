// Extracted from js/chapters.js — Network Forensics course, chapter index 3.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent03 = `

      <h2>1. What is Packet Analysis?</h2>
      <p>Packet Analysis ka matlab hai network mein travel kar rahe packets ko capture karke unka detailed examination karna. Investigator packet dekhkar pata laga sakta hai:</p>
      <ul>
        <li>Kaun communicate kar raha hai</li>
        <li>Kaunsa protocol use ho raha hai</li>
        <li>Kaunsi website access hui</li>
        <li>Data transfer hua ya nahi</li>
        <li>Attack hua ya nahi</li>
      </ul>

      <h2>2. Why Packet Analysis Important?</h2>
      <p>Network Forensics ki poori foundation packet analysis par tiki hai. Packets mein ye evidence milta hai:</p>
      <ul>
        <li>Source IP aur Destination IP</li>
        <li>Ports aur Protocols</li>
        <li>Payload yani actual data</li>
        <li>Session details</li>
      </ul>

      <h2>3. Packet Structure Overview</h2>
      <p>Ek packet kai layers ka combination hota hai:</p>
      <pre><code>Ethernet Header
    IP Header
      TCP/UDP Header
        Payload (Actual Data)</code></pre>

      <h2>4. Data Unit Names</h2>
      <p>OSI layer ke hisaab se data ka naam badalta hai:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">DATA UNIT</span>
        </div>
        ${[['Application','Data'],['Transport','Segment (TCP)'],['Network','Packet'],['Data Link','Frame'],['Physical','Bits']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Ethernet Frame</h2>
      <p>Network mein sabse pehle Ethernet Frame dikhta hai. Iska structure:</p>
      <pre><code>Destination MAC  |  Source MAC  |  Type  |  Data  |  FCS</code></pre>

      <h2>6. Ethernet Header Fields</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Destination MAC','Packet kis device ke liye hai. Example: 00:11:22:33:44:55'],['Source MAC','Packet kis device ne bheja. Example: AA:BB:CC:DD:EE:FF'],['EtherType','Andar kaunsa protocol hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">VALUE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
        </div>
        ${[['0x0800','IPv4'],['0x86DD','IPv6'],['0x0806','ARP']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>7. IP Header Introduction</h2>
      <p>Layer 3 par IP Header add hota hai jisme source IP, destination IP, TTL, protocol aur length hoti hai.</p>

      <h2>8. IPv4 Header Fields</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">FIELD</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
        </div>
        ${[['Version','IPv4 ya IPv6 identify karna'],['Header Length','Header ka size'],['Total Length','Poore packet ka size'],['TTL','Packet ki lifetime'],['Protocol','TCP, UDP ya ICMP'],['Source IP','Bhejne wala'],['Destination IP','Receive karne wala']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. TTL - Time To Live</h2>
      <p>TTL packet ki life hoti hai. Har router par 1 kam hota hai. Jab TTL = 0 ho jaata hai packet drop ho jaata hai.</p>
      <div class="info-box"><p><strong>Forensics mein:</strong> TTL se routing problems, spoofing attempts aur scanning behavior detect hoti hai. OS fingerprinting bhi TTL se hoti hai. Windows default TTL = 128, Linux = 64.</p></div>

      <h2>10. Protocol Field Numbers</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">NUMBER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
        </div>
        ${[['1','ICMP'],['6','TCP'],['17','UDP']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>11. TCP Header Deep Analysis</h2>
      <p>Transport Layer ka sabse important header. Ismein ye hota hai: Source Port, Destination Port, Sequence Number, ACK Number, Flags aur Window Size.</p>

      <h2>12. Sequence aur ACK Numbers</h2>
      <p>TCP reliability ka secret hai Sequence Number. Har byte track kiya jaata hai.</p>
      <pre><code>Seq = 1000  → Pehla segment
Seq = 1500  → Doosra segment
Seq = 2000  → Teesra segment

ACK = 2001  → "Mujhe 2000 tak data mil gaya, ab 2001 bhejo"</code></pre>
      <div class="info-box"><p><strong>Investigators use karte hain:</strong> Session reconstruction ke liye, missing packets detect karne ke liye, aur attack analysis ke liye.</p></div>

      <h2>13. TCP Flags Review</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">FLAG</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['SYN','Connection start'],['ACK','Confirmation'],['FIN','Connection close'],['RST','Connection reset'],['PSH','Data turant push'],['URG','Urgent data']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>14. TCP Connection Flow</h2>
      <pre><code>Client ──── SYN ──────► Server
Client ◄─── SYN ACK ── Server
Client ──── ACK ──────► Server
         [Data Exchange]
Client ──── FIN ──────► Server
Client ◄─── ACK ─────── Server
         [Connection Closed]</code></pre>

      <h2>15. UDP Header</h2>
      <p>UDP header bahut simple hota hai TCP ke comparison mein. Sirf 4 fields hote hain:</p>
      <pre><code>Source Port
Destination Port
Length
Checksum</code></pre>
      <div class="info-box"><p><strong>Attackers UDP kyun prefer karte hain:</strong> Fast hai, logging kam hoti hai, koi handshake nahi hota, aur abuse karna aasaan hai.</p></div>

      <h2>16. ICMP Packet Structure</h2>
      <p>ICMP ping aur diagnostics ke liye use hota hai. Ismein Type, Code aur Checksum hote hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['0','Echo Reply'],['8','Echo Request'],['3','Destination Unreachable']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:14px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>17. Payload</h2>
      <p>Payload MOST IMPORTANT evidence area hai. Ismein actual data hota hai jaise website request, login data, commands ya files.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:10px;">Header</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Control information. Routing ke liye. Metadata.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:10px;">Payload</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Actual data. Content. Real evidence.</div>
        </div>
      </div>

      <h2>18. Wireshark ke 3 Sections</h2>
      <p>Jab Wireshark mein koi packet click karo, 3 sections dikhte hain:</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Section 1 - Packet List','Time, Source, Destination, Protocol aur Info dikhta hai'],['Section 2 - Packet Details','Ethernet, IP, TCP sab expand hote hain layer by layer'],['Section 3 - Packet Bytes','Raw hexadecimal data dikhta hai, actual wire par kya tha']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>19. Packet Timing Analysis</h2>
      <p>Investigators timing check karte hain kyunki:</p>
      <ul>
        <li>Response delays suspicious hote hain</li>
        <li>Beacon intervals malware identify karte hain</li>
        <li>Repeated connections ek pattern batate hain</li>
      </ul>

      <h2>20. Stream Analysis</h2>
      <p>Multiple packets mil ke ek Stream banate hain. Jaise browser aur server ke beech kai packets exchange hote hain jo ek poori conversation banate hain.</p>

      <h2>21. Follow TCP Stream</h2>
      <p>Ye Wireshark ka bahut powerful feature hai:</p>
      <pre><code>Kisi bhi TCP packet par Right Click karo
Follow TCP Stream select karo
Poori conversation text mein dikh jaati hai</code></pre>
      <div class="info-box"><p><strong>Use hota hai:</strong> Web requests reconstruct karne ke liye, chats dekhne ke liye, aur malware communication analyze karne ke liye.</p></div>

      <h2>22. Important Wireshark Filters</h2>
      <pre><code>http                    → HTTP traffic
tls                     → HTTPS/TLS traffic
tcp                     → TCP traffic
udp                     → UDP traffic
icmp                    → ICMP ping traffic
arp                     → ARP traffic
tcp.flags.syn == 1      → Sirf SYN packets
tcp.flags.reset == 1    → Reset packets (attack sign)
ip.addr == 192.168.1.10 → Specific IP ke packets
tcp.port == 443         → Specific port ke packets</code></pre>

      <h2>23. Suspicious Packet Indicators</h2>
      <p>Investigators in cheezein dhundhte hain:</p>
      <ul>
        <li>Unknown IPs jinka source pata na ho</li>
        <li>Strange ports jaise 4444, 1337, 8443</li>
        <li>Excessive DNS queries ek hi domain ke liye</li>
        <li>Large uploads data exfiltration ka sign</li>
        <li>Beaconing patterns regular interval par traffic</li>
        <li>Repeated SYN packets port scan ya SYN flood</li>
      </ul>

      <h2>24. Packet Reconstruction</h2>
      <p>Goal hota hai packets se poori communication rebuild karna:</p>
      <pre><code>Packet 1 + Packet 2 + Packet 3 + Packet 4
              ↓
       Complete Session</code></pre>

      <h2>25. Real Investigation Example</h2>
      <p>Maan lo alert aaya: Data theft suspected. Investigator kya check karta hai:</p>
      <pre><code>Source IP   → Kaun bhej raha hai?
Destination IP → Kahan ja raha hai?
Port        → Kaunsi service use ho rahi hai?
Payload     → Kya data transfer hua?
Timing      → Kitne time tak session tha?</code></pre>
      <div class="info-box"><p>Agar large payload kisi unknown bahar ke IP par ja raha hai unusual port par, ye data exfiltration ka strong indicator hai.</p></div>

      <h2>26. Practical Lab Tasks</h2>
      <p><strong>Task 1:</strong></p>
      <pre><code>Traffic capture karo
Identify karo: Source IP, Destination IP, Protocol, Port</code></pre>

      <p><strong>Task 2:</strong></p>
      <pre><code>Google.com kholo
Filter lagao: dns
DNS packets observe karo</code></pre>

      <p><strong>Task 3:</strong></p>
      <pre><code>Filter: tcp.flags.syn == 1
Handshakes observe karo</code></pre>

      <p><strong>Task 4:</strong></p>
      <pre><code>Kisi TCP packet par right click karo
Follow TCP Stream select karo
Poori conversation padho</code></pre>

      <h2>27. Beginner Mistakes</h2>
      <ul>
        <li>Sirf protocol names dekhna, headers ignore karna</li>
        <li>Payload check na karna, wahan real evidence hota hai</li>
        <li>Streams analyze na karna, single packet akela kuch nahi batata</li>
        <li>Timing ignore karna, beaconing detect nahi hoga</li>
        <li>Hex bytes section ignore karna</li>
      </ul>

      <h2>28. Skills to Master Before Part 5</h2>
      <ul>
        <li>Ethernet Frame structure</li>
        <li>IP Header fields aur TTL</li>
        <li>TCP Header aur Sequence Numbers</li>
        <li>ACK Numbers ka matlab</li>
        <li>Payload analysis</li>
        <li>Wireshark filters</li>
        <li>Follow TCP Stream feature</li>
      </ul>

      <h2>29. Part 4 Complete</h2>
      <p>Ab tum ek packet ko uski poori depth mein samajh sakte ho. Ethernet header se lekar payload tak, har field ka matlab aur forensics mein kya role hai, ye sab tumhare paas hai.</p>
      <p>Ye wahi knowledge hai jo ek real investigator PCAP file kholta hai toh use immediately dikh jaata hai kya normal hai aur kya suspicious. Part 5 mein Wireshark ko poori tarah master karenge beginner se advanced tak.</p>

      <div class="info-box">
        <p><strong>Part 4 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Wireshark mein koi bhi packet kholo aur teen sections explore karo</li>
          <li>IP header mein TTL value check karo</li>
          <li>TCP packet mein Sequence aur ACK numbers dekho</li>
          <li>Follow TCP Stream use karke ek web request reconstruct karo</li>
          <li>tcp.flags.reset == 1 filter lagao aur reset packets dekho</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>TTL kya hota hai?</li>
          <li>Sequence Number kyun zaroori hai?</li>
          <li>Payload kya hota hai?</li>
          <li>TCP aur UDP header mein kya difference hai?</li>
          <li>Follow TCP Stream kis kaam aata hai?</li>
        </ul>
      </div>

    `;
