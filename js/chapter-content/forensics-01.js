// Extracted from js/chapters.js — Network Forensics course, chapter index 1.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent01 = `

      <h2>1. Why Networking is MOST Important?</h2>
      <p>Agar networking nahi aati, toh:</p>
      <ul>
        <li>Packets samajh nahi aayenge</li>
        <li>Wireshark useless lagega</li>
        <li>Attacks detect nahi honge</li>
        <li>Traffic analysis impossible hoga</li>
      </ul>
      <div class="info-box"><p><strong>Foundation Rule:</strong> Network Forensics ka 80% hissa networking basics par depend karta hai. Ye skip mat karo.</p></div>

      <h2>2. What is a Network?</h2>
      <p>Jab 2 ya zyada devices aapas mein connected hon aur data exchange karen - use Network kehte hain.</p>

      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['LAN','Local Area Network'],['WAN','Wide Area Network'],['MAN','Metropolitan Area Network'],['WLAN','Wireless LAN'],['PAN','Personal Area Network']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Internet Kaise Kaam Karta Hai?</h2>
      <p>Jab tum website open karte ho:</p>
      <pre><code>Step 1: Device request bhejta hai
Step 2: Router ISP ko bhejta hai
Step 3: DNS IP resolve karta hai
Step 4: Server response deta hai
Step 5: Data packets wapas aate hain</code></pre>

      <h2>4. Basic Network Components</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        ${[['Client','Request bhejta hai - Phone, Laptop, Browser'],['Server','Service deta hai - Google, Instagram, YouTube'],['Router','Different networks connect karta hai, packet forwarding, NAT'],['Switch','LAN devices ko connect karta hai'],['Firewall','Malicious traffic block karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. IP Address</h2>
      <p>Har device ka unique address. Bina IP ke internet par koi bhi communicate nahi kar sakta.</p>
      <pre><code>192.168.1.1     (Private IP)
8.8.8.8         (Google DNS - Public IP)
172.16.0.5      (Private IP)</code></pre>

      <h2>6. IPv4 Structure</h2>
      <p>IPv4 = 32-bit address, 4 octets hote hain:</p>
      <pre><code>192  .  168  .  1  .  10
 |       |      |    |
Oct1   Oct2  Oct3  Oct4
(0-255 har octet mein)</code></pre>

      <h2>7. Public vs Private IP</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
        </div>
        ${[['Public IP','Internet access - ISP assign karta hai'],['Private IP','Internal network - router assign karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <p><strong>Private IP Ranges:</strong></p>
      <pre><code>10.0.0.0, 10.255.255.255
172.16.0.0, 172.31.255.255
192.168.0.0, 192.168.255.255</code></pre>

      <h2>8. IP vs MAC Address</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">IP ADDRESS</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MAC ADDRESS</span>
        </div>
        ${[['Logical address','Physical address'],['Change ho sakta hai','Usually fixed rehta hai'],['Internet routing mein use','Local communication mein use'],['Example: 192.168.1.1','Example: 00:1A:2B:3C:4D:5E']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. Port Numbers</h2>
      <p>Ports = Communication doors. Har service ek specific port par kaam karti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 100px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PORT</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">KAAM</span>
        </div>
        ${[['20/21','FTP','File transfer'],['22','SSH','Remote login'],['23','Telnet','Remote access'],['25','SMTP','Email bhejna'],['53','DNS','Domain resolution'],['80','HTTP','Website'],['443','HTTPS','Secure website']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 100px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;color:#f4f4f5;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[2]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Forensics mein:</strong> Malware specific ports use karta hai. Port 4444 (Metasploit), 8080 (proxy), 1337 (hacker ports) - ye suspicious hote hain.</p></div>

      <h2>10. TCP Three-Way Handshake</h2>
      <p>MOST IMPORTANT TOPIC. Har TCP connection 3 steps mein establish hota hai:</p>
      <pre><code>Client ──── SYN ──────────► Server
            "Kya connect kar sakte hain?"

Client ◄─── SYN-ACK ──────── Server
            "Haan, ready hoon"

Client ──── ACK ──────────► Server
            "Connected!"</code></pre>
      <div class="info-box"><p><strong>Investigators detect karte hain:</strong> Port scans (SYN flood), failed connections (RST packets), suspicious sessions using handshake behavior.</p></div>

      <h2>11. Important Protocols</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        ${[['TCP','Reliable communication, connection-oriented, guaranteed delivery. Use: Websites, Login, Banking'],['UDP','Fast communication, no guarantee, low latency. Use: Gaming, Streaming, VoIP'],['ICMP','Ping aur diagnostics ke liye. Use: ping google.com'],['DNS','Domain to IP conversion. google.com → 142.x.x.x'],['HTTP','Normal website traffic - unencrypted'],['HTTPS','Encrypted website traffic - TLS use karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:8px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>12. DNS Resolution Process</h2>
      <p>Jab tum google.com open karte ho:</p>
      <pre><code>1. Browser DNS se puchta hai: "google.com ka IP kya hai?"
2. DNS reply karta hai: "142.250.195.46"
3. TCP connection start hota hai
4. HTTPS communication hoti hai
5. Google ka page aata hai</code></pre>
      <div class="info-box"><p><strong>DNS is GOLD in Forensics:</strong> Malware bhi domain contact karta hai. DNS logs mein suspicious domains dhundhna ek core forensic skill hai.</p></div>

      <h2>13. NAT - Network Address Translation</h2>
      <p>Router private IP ko public IP mein convert karta hai taaki internet access ho sake.</p>
      <pre><code>Private: 192.168.1.5  ──► Router ──► Public: 103.24.x.x</code></pre>
      <div class="info-box"><p><strong>Forensics mein challenge:</strong> Multiple users ek hi public IP share kar sakte hain - isliye exact person identify karna mushkil hota hai. ISP se logs lene padte hain.</p></div>

      <h2>14. Network Traffic Types</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Normal Traffic','Legitimate communication - normal browsing, emails, calls','255,255,255,0.06'],['Suspicious Traffic','Unusual behavior - excessive DNS, strange ports, unknown IPs','220,20,20,0.2'],['Malicious Traffic','Attack traffic - malware C2, exploit traffic, data theft','220,20,20,0.3']].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${r[2]});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>15. Important Forensic Indicators</h2>
      <p>Investigators ye cheezein watch karte hain:</p>
      <ul>
        <li>Unusual ports - known ports ke alawa traffic</li>
        <li>Unknown domains - suspicious DNS queries</li>
        <li>Large uploads - data exfiltration ka sign</li>
        <li>Beaconing - regular intervals par C2 contact</li>
        <li>Repeated failed connections - brute force ya scan</li>
        <li>Encrypted suspicious traffic - hidden malware communication</li>
      </ul>

      <h2>16. Wireshark Practice Tasks</h2>

      <p><strong>Task 1 - DNS Capture:</strong></p>
      <pre><code>Filter: dns
Observe: queries, domain names, responses</code></pre>

      <p><strong>Task 2 - TCP Capture:</strong></p>
      <pre><code>Filter: tcp
Observe: handshake (SYN, SYN-ACK, ACK), ports</code></pre>

      <p><strong>Task 3 - ICMP Ping:</strong></p>
      <pre><code>Terminal mein: ping google.com
Wireshark filter: icmp
Observe: Echo Request, Echo Reply</code></pre>

      <h2>17. Essential Commands</h2>
      <p><strong>Windows:</strong></p>
      <pre><code>ipconfig          # IP, Gateway, DNS dekho
ping google.com   # Connectivity test
netstat -ano      # Active connections dekho</code></pre>

      <p><strong>Linux / Kali:</strong></p>
      <pre><code>ip a              # ya: ifconfig
ss -tunap         # Active connections
ping google.com</code></pre>

      <h2>18. Packet Basics</h2>
      <p>Har packet mein 2 main parts hote hain:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PART</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['Header','Control information jaise source IP, destination IP, protocol, ports'],['Payload','Actual data jo bheja ja raha hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>19. Packet Header Kya Contain Karta Hai?</h2>
      <p>Packet header mein forensics ke liye sabse important information hoti hai:</p>
      <ul>
        <li>Source IP</li>
        <li>Destination IP</li>
        <li>Protocol</li>
        <li>Port numbers</li>
        <li>TCP Flags</li>
        <li>Sequence numbers</li>
      </ul>
      <div class="info-box"><p><strong>Forensics mein:</strong> Sirf header padhke pata chal jaata hai ki attack hua ya nahi, kahan se hua, aur kaunsa protocol use hua.</p></div>

      <h2>20. Network Layers Concept</h2>
      <p>Network communication ko samajhne ke liye 2 major models hain:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:6px;">OSI Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">7 layers hain. Theoretical model jo networking ko describe karta hai. Part 3 mein deep study hogi.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">TCP/IP Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">4 layers hain. Practical model jo actual internet par use hota hai.</div>
        </div>
      </div>

      <h2>21. Common Network Devices in Investigations</h2>
      <p>Cyber investigation mein ye devices important evidence provide karte hain:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">DEVICE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">EVIDENCE</span>
        </div>
        ${[['Router','Connection logs, NAT table'],['Firewall','Blocked traffic, allowed rules'],['Switch','MAC address mapping'],['Proxy','Browsing history, logs'],['IDS','Security alerts, attack signatures']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>22. Why Ports Important in Forensics?</h2>
      <p>Kyunki:</p>
      <ul>
        <li>Malware specific ports use karta hai jaise port 4444 Metasploit ke liye</li>
        <li>Attackers hidden services chalate hain unknown ports par</li>
        <li>Suspicious traffic port number se identify hoti hai</li>
        <li>Port scan detect karna attack ka pehla sign hota hai</li>
      </ul>
      <div class="info-box"><p><strong>Example:</strong> Agar tumhare network mein port 4444 par outbound traffic dikh rahi hai to ye almost certainly malicious hai.</p></div>

      <h2>23. MAC Address Deep</h2>
      <p>MAC address har network card ka unique hardware address hota hai. Ye factory mein assign hota hai.</p>
      <pre><code>Format: 00:1A:2B:3C:4D:5E
Pehle 3 parts: OUI (manufacturer ka code)
Aakhri 3 parts: Unique device identifier</code></pre>
      <div class="info-box"><p><strong>Forensics mein use:</strong> Local network pe kaun sa device tha ye MAC se pata chalta hai. ARP table mein IP aur MAC ka mapping hota hai.</p></div>

      <h2>24. IPv6 Basics</h2>
      <p>IPv4 ke addresses khatam ho rahe hain isliye IPv6 aaya. Forensics mein IPv6 traffic bhi aata hai.</p>
      <pre><code>IPv4: 192.168.1.1  (32-bit)
IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334  (128-bit)</code></pre>

      <h2>25. Subnetting Basics</h2>
      <p>Subnet mask network aur host portion identify karta hai.</p>
      <pre><code>IP:      192.168.1.10
Mask:    255.255.255.0  (/24)
Network: 192.168.1.0
Host:    .10</code></pre>
      <p>Forensics mein subnetting se pata chalta hai ki attacker same network par tha ya bahar se aaya.</p>

      <h2>26. ARP Protocol</h2>
      <p>ARP (Address Resolution Protocol) IP address ko MAC address mein convert karta hai local network par.</p>
      <pre><code>ARP Request:  "192.168.1.1 ka MAC address kya hai?"
ARP Reply:    "00:1A:2B:3C:4D:5E"</code></pre>
      <div class="info-box"><p><strong>ARP Spoofing Attack:</strong> Attacker fake ARP replies bhejta hai taaki traffic intercept kar sake. Wireshark mein suspicious ARP packets dikhte hain.</p></div>

      <h2>27. DHCP Protocol</h2>
      <p>DHCP automatically IP addresses assign karta hai devices ko network join karne par.</p>
      <pre><code>Device joins network
DHCP Server assigns: IP, Subnet, Gateway, DNS
Device gets: 192.168.1.105</code></pre>
      <p>Forensics mein DHCP logs se pata chalta hai ki kaunse device ko kab kaunsa IP mila.</p>

      <h2>28. Firewall Basics</h2>
      <p>Firewall network traffic ko rules ke hisaab se allow ya block karta hai.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;margin-bottom:8px;">Inbound Rules</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">Bahar se andar aane wala traffic control karta hai</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:8px;">Outbound Rules</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">Andar se bahar jaane wala traffic control karta hai</div>
        </div>
      </div>

      <h2>29. Beginner Mistakes</h2>
      <ul>
        <li>Ports ignore karna, har attack kisi port se hota hai</li>
        <li>DNS na samajhna, malware bhi DNS use karta hai</li>
        <li>TCP handshake skip karna, connection behavior samajhna zaroori hai</li>
        <li>Protocols confuse karna, TCP aur UDP ka difference clear hona chahiye</li>
        <li>Headers na padhna, packet header mein sab evidence hota hai</li>
      </ul>

      <h2>30. Part 2 Complete</h2>
      <p>Networking fundamentals ab tumhare paas hai. Ye sab concepts sirf theory nahi hain, ye wahi cheezein hain jo ek real investigator roz use karta hai jab wo kisi case par kaam karta hai.</p>
      <p>Ab jab bhi tum Wireshark kholo, ek packet dekho, ya koi suspicious traffic dekho, tum samjhoge ki wo packet kahan se aaya, kahan ja raha hai, aur kya carry kar raha hai. Ye samajh hi tumhara asli weapon hai.</p>
      <p>Part 3 mein hum OSI Model aur TCP/IP ko ek ek layer karke todenge. Har layer mein kya hota hai, attacker kaise use karta hai, aur forensic investigator kya dhundhta hai, sab kuch seedha practical angle se.</p>

      <div class="info-box">
        <p><strong>Before Part 3 Must Practice:</strong></p>
        <ul style="margin-top:8px;">
          <li>Wireshark mein DNS filter lagao aur dekho kaunse domains query ho rahe hain</li>
          <li>TCP capture karo aur handshake ke teen packets dhundho</li>
          <li>ping google.com karo aur ICMP packets observe karo</li>
          <li>Apne system ka IP address aur MAC address nikalo</li>
          <li>netstat ya ss command se active connections dekho</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>TCP aur UDP mein difference kya hai?</li>
          <li>DNS kya karta hai?</li>
          <li>Port 443 kis ke liye use hota hai?</li>
          <li>SYN packet kya hai?</li>
          <li>MAC address kya hota hai?</li>
        </ul>
      </div>

    `;
