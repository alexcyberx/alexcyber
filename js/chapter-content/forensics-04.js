// Extracted from js/chapters.js — Network Forensics course, chapter index 4.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent04 = `

      <h2>1. What is Wireshark?</h2>
      <p>Wireshark duniya ka sabse popular network protocol analyzer hai. Iski madad se live traffic capture, PCAP files analyze, malware traffic investigate, network issues troubleshoot aur forensic evidence collect kar sakte ho.</p>

      <h2>2. Why Wireshark is Important?</h2>
      <p>Network Forensics mein lagbhag har investigator Wireshark use karta hai kyunki ye free hai, powerful hai, thousands of protocols support karta hai, deep packet inspection karta hai aur PCAP analysis possible hai.</p>

      <h2>3. Wireshark Interface Overview</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Menu Bar','Options aur tools ke liye'],['Toolbar','Quick actions ke liye'],['Capture Interface List','Network interfaces select karne ke liye'],['Packet List Pane','Captured packets ki list'],['Packet Details Pane','Selected packet ka breakdown'],['Packet Bytes Pane','Raw hexadecimal data']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Selecting the Right Interface</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Ethernet','Wired connection'],['Wi-Fi / wlan0','Wireless connection'],['Loopback (lo)','Local machine ka apna traffic']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Rule:</strong> Jis interface par traffic dikh raha ho wahi select karo. Kali Linux mein eth0 ya wlan0 hota hai.</p></div>

      <h2>5. Starting Your First Capture</h2>
      <pre><code>Step 1: Wireshark open karo
Step 2: Wi-Fi ya Ethernet interface select karo
Step 3: Start button (blue shark fin) click karo
Step 4: Browser kholo aur koi website open karo
Step 5: Traffic generate hoga
Step 6: Red square button se capture stop karo</code></pre>

      <h2>6. Capture Filters vs Display Filters</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:10px;">Capture Filter</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Traffic capture hone se pehle lagta hai. Sirf selected traffic save hoga. BPF syntax use hoti hai.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:10px;">Display Filter</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Already captured traffic mein se filter karta hai. Investigation mein ye zyada use hota hai.</div>
        </div>
      </div>

      <h2>7. Capture Filters Examples</h2>
      <pre><code>tcp               → Sirf TCP traffic capture karo
port 80           → Sirf port 80 ka traffic
host 8.8.8.8      → Sirf is IP ka traffic
not arp           → ARP ke alawa sab capture karo</code></pre>

      <h2>8. Display Filters - Basic</h2>
      <pre><code>dns     → Sirf DNS traffic
tcp     → Sirf TCP traffic
http    → Sirf HTTP traffic
icmp    → Sirf ping traffic
udp     → Sirf UDP traffic</code></pre>

      <h2>9. Display Filters - IP Based</h2>
      <pre><code>ip.src == 192.168.1.10      → Is IP se aane wale packets
ip.dst == 8.8.8.8           → Is IP par jaane wale packets
ip.addr == 192.168.1.10     → Is IP ke sab packets
tcp.port == 443             → Port 443 ke packets
udp.port == 53              → Port 53 ke packets</code></pre>

      <h2>10. DNS Investigation Filters</h2>
      <pre><code>dns                         → Sab DNS traffic
dns.flags.response == 1     → Sirf DNS responses
dns.flags.response == 0     → Sirf DNS requests</code></pre>

      <h2>11. TCP Investigation Filters</h2>
      <pre><code>tcp.flags.syn == 1                           → SYN packets
tcp.flags.syn == 1 && tcp.flags.ack == 0     → Port scan detect
tcp.flags.reset == 1                         → Reset packets
tcp.analysis.retransmission                  → Retransmitted packets</code></pre>
      <div class="info-box"><p><strong>Port scan detect karna:</strong> Ek hi source IP se bahut saare alag ports par SYN packets aa rahe hain toh port scan chal raha hai.</p></div>

      <h2>12. HTTP Analysis Filters</h2>
      <pre><code>http.request                      → Sab HTTP requests
http.response                     → Sab HTTP responses
http.request.method == "POST"     → POST requests
http.request.method == "GET"      → GET requests</code></pre>

      <h2>13. TLS/HTTPS Filters</h2>
      <pre><code>tls               → Sab TLS/HTTPS traffic
tls.handshake     → TLS handshake packets</code></pre>
      <div class="info-box"><p><strong>TLS mein bhi kya milta hai:</strong> Server name (SNI field), certificate info, aur connection timing. Actual content decrypt nahi hota lekin metadata se bahut kuch pata chalta hai.</p></div>

      <h2>14. ICMP Investigation Filters</h2>
      <pre><code>icmp              → Sab ICMP traffic
icmp.type == 8    → Echo Request (ping bheja)
icmp.type == 0    → Echo Reply (ping ka jawab)</code></pre>

      <h2>15. ARP Analysis</h2>
      <pre><code>arp               → Sab ARP traffic</code></pre>
      <div class="info-box"><p><strong>ARP Spoofing detect karna:</strong> Agar ek hi IP ke liye alag alag MAC addresses ARP replies mein aa rahe hain toh ye ARP poisoning ka sign hai.</p></div>

      <h2>16. Packet Coloring Rules</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Green','TCP traffic'],['Blue','DNS traffic'],['Black ya Red','Errors aur problems'],['Light Purple','UDP traffic'],['Yellow','ARP traffic']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:130px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>17. Packet Details Analysis</h2>
      <ul>
        <li>Frame - capture information, interface, size</li>
        <li>Ethernet - source aur destination MAC addresses</li>
        <li>IP - source aur destination IP, TTL</li>
        <li>TCP - ports, flags, sequence numbers</li>
        <li>Application Protocol - HTTP, DNS, TLS content</li>
      </ul>

      <h2>18. Expert Information</h2>
      <pre><code>Menu: Analyze → Expert Information</code></pre>
      <p>Warnings, errors, retransmissions aur suspicious activity automatically dikhata hai. Investigation shuru karte waqt ye pehle check karo.</p>

      <h2>19. Conversations Analysis</h2>
      <pre><code>Menu: Statistics → Conversations</code></pre>
      <p>Kaun kis se baat kar raha tha, kitne bytes transfer hue aur packet count milta hai. Top talkers immediately pata chal jaate hain.</p>

      <h2>20. Endpoints Analysis</h2>
      <pre><code>Menu: Statistics → Endpoints</code></pre>
      <p>Sab IPs aur MACs dikhti hain traffic volume ke saath. Unknown external IPs yahan immediately identify hoti hain.</p>

      <h2>21. Protocol Hierarchy</h2>
      <pre><code>Menu: Statistics → Protocol Hierarchy

Example output:
Ethernet
  IP
    TCP (45%)
      HTTP (10%)
      TLS (35%)
    UDP (55%)
      DNS (50%)</code></pre>

      <h2>22. IO Graphs</h2>
      <pre><code>Menu: Statistics → I/O Graphs</code></pre>
      <p>Traffic ko visually graph mein dikhata hai. DDoS attacks, beaconing patterns aur unusual traffic spikes clearly dikh jaate hain.</p>

      <h2>23. Follow TCP Stream</h2>
      <pre><code>Kisi bhi TCP packet par right click karo
Follow → TCP Stream select karo</code></pre>
      <p>Web requests, credentials, malware traffic aur chats reconstruct hote hain is feature se.</p>

      <h2>24. Follow UDP Stream</h2>
      <pre><code>Kisi bhi UDP packet par right click karo
Follow → UDP Stream select karo</code></pre>
      <p>UDP based C2 communication investigate karne ke liye useful hai.</p>

      <h2>25. Export Objects</h2>
      <pre><code>Menu: File → Export Objects → HTTP</code></pre>
      <p>HTTP traffic se files extract kar sakte ho jaise images, documents, executables. Malware analysis mein bahut kaam aata hai.</p>

      <h2>26. Searching Inside Packets</h2>
      <pre><code>Shortcut: Ctrl + F

Search kar sakte ho:
Strings jaise "password" ya "login"
IP addresses
Domain names
Payload content</code></pre>

      <h2>27. Finding Large Transfers</h2>
      <pre><code>Statistics → Conversations → TCP tab
Bytes column par sort karo
Sabse bade transfers upar aayenge</code></pre>
      <p>Data exfiltration detect karne ka ye sabse aasaan tarika hai.</p>

      <h2>28. Detecting Beaconing</h2>
      <pre><code>Signs of beaconing:
Har 60 seconds par same IP par traffic
Same packet size baar baar
Same destination port repeatedly</code></pre>
      <div class="info-box"><p><strong>IO Graph use karo:</strong> Statistics → I/O Graphs mein regular spikes dikh rahe hain toh beaconing suspected hai.</p></div>

      <h2>29. Detecting Port Scans</h2>
      <pre><code>Filter: tcp.flags.syn == 1 && tcp.flags.ack == 0

Agar ek hi source IP se bahut saare alag alag
destination ports par SYN packets hain
ye port scan hai</code></pre>

      <h2>30. Detecting Suspicious DNS</h2>
      <p>Suspicious DNS ke indicators:</p>
      <ul>
        <li>Bahut lambe domain names</li>
        <li>Random looking domains jaise xk2jf93.xyz</li>
        <li>Bahut zyada queries ek hi domain ke liye</li>
        <li>NXDOMAIN responses baar baar</li>
      </ul>
      <pre><code>Filter: dns</code></pre>

      <h2>31. Practical Lab 1</h2>
      <pre><code>Traffic capture karo
Ye websites kholo: Google, YouTube, GitHub
Identify karo:
  DNS packets kaunse domains ke liye hain
  TLS connections kahan ja rahe hain
  TCP sessions kitne hain</code></pre>

      <h2>32. Practical Lab 2</h2>
      <pre><code>Terminal mein: ping google.com
Wireshark filter: icmp
ICMP Echo Request aur Echo Reply observe karo</code></pre>

      <h2>33. Practical Lab 3</h2>
      <pre><code>Filter: tcp.flags.syn == 1
Observe karo kaunse ports par SYN ja rahe hain
Handshake complete ho raha hai ya nahi</code></pre>

      <h2>34. Practical Lab 4</h2>
      <pre><code>Statistics → Endpoints par jao
Top IPs list karo
Koi unknown external IP hai kya check karo</code></pre>

      <h2>35. Practical Lab 5</h2>
      <pre><code>Statistics → Protocol Hierarchy par jao
Dekho HTTP, TLS aur DNS ka percentage kitna hai</code></pre>

      <h2>36. Professional Investigator Workflow</h2>
      <pre><code>Step 1:  PCAP file open karo
Step 2:  Protocol Hierarchy dekho
Step 3:  Endpoints check karo
Step 4:  Conversations analyze karo
Step 5:  DNS analysis karo
Step 6:  HTTP ya TLS analysis karo
Step 7:  Suspicious streams follow karo
Step 8:  Objects export karo
Step 9:  Timeline banao
Step 10: Report likho</code></pre>

      <h2>37. Beginner Mistakes</h2>
      <ul>
        <li>Sirf packet list dekhna aur statistics ignore karna</li>
        <li>Streams follow na karna, single packets akele kuch nahi batate</li>
        <li>Endpoints check na karna, top talkers miss ho jaate hain</li>
        <li>DNS ignore karna, malware DNS se pata chalta hai</li>
        <li>Expert Information check na karna</li>
      </ul>

      <h2>38. Skills to Master Before Part 6</h2>
      <ul>
        <li>Display filters confidently likhna</li>
        <li>Conversations aur Endpoints use karna</li>
        <li>Protocol Hierarchy samajhna</li>
        <li>TCP Streams follow karna</li>
        <li>DNS analysis karna</li>
        <li>TLS metadata analyze karna</li>
        <li>Objects export karna</li>
      </ul>

      <h2>39. Mini Investigation Exercise</h2>
      <p>Ek capture kholo aur ye sawalo ke jawab dhundho:</p>
      <ul>
        <li>Sabse zyada traffic kaunsi IP ne generate kiya?</li>
        <li>Sabse zyada use hone wala protocol kaunsa hai?</li>
        <li>Kitni DNS queries hain?</li>
        <li>Kitne TLS connections hain?</li>
        <li>Sabse badi conversation kitne bytes ki hai?</li>
      </ul>

      <h2>40. Part 5 Complete</h2>
      <p>Wireshark ab tumhara weapon hai. Interface se lekar professional workflow tak, tum ab wahi karte ho jo ek real SOC analyst ya forensic investigator karta hai jab ek PCAP file unke haath aati hai.</p>
      <p>Part 6 mein TCP, UDP aur ICMP ko forensics ke angle se bahut deep mein dekhenge. SYN flood, port scans, ICMP tunneling, UDP abuse aur covert channels sab real attack traffic mein analyze karenge.</p>

      <div class="info-box">
        <p><strong>Part 5 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Statistics → Conversations kholo aur top talkers identify karo</li>
          <li>Kisi bhi TCP packet par Follow TCP Stream use karo</li>
          <li>Protocol Hierarchy se apne traffic ka breakdown dekho</li>
          <li>File → Export Objects → HTTP se koi file extract karo</li>
          <li>Analyze → Expert Information check karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>Capture filter aur display filter mein kya difference hai?</li>
          <li>Follow TCP Stream kis kaam aata hai?</li>
          <li>Beaconing kaise detect karte hain?</li>
          <li>Port scan ka Wireshark filter kya hai?</li>
          <li>Conversations tab mein kya milta hai?</li>
        </ul>
      </div>

    `;
