// Extracted from js/chapters.js — Network Forensics course, chapter index 5.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent05 = `

      <h2>1. Why Protocol Forensics Matters?</h2>
      <p>Network investigator ka sabse bada kaam hai traffic dekhkar samajhna ki communication normal hai ya malicious. Iske liye TCP, UDP aur ICMP ki deep understanding zaroori hai.</p>

      <h2>2. Protocols Investigators Most Commonly Analyze</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">IMPORTANCE</span>
        </div>
        ${[['TCP','Sabse zyada important'],['UDP','Bahut important'],['ICMP','Medium-High'],['DNS','Bahut zyada important'],['HTTP/HTTPS','Bahut zyada important']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. TCP Forensics Overview</h2>
      <p>TCP ek reliable, connection-oriented protocol hai. Features: reliable delivery, ordered packets, error recovery, flow control. Investigation mein TCP sabse zyada analyze hota hai.</p>

      <h2>4. TCP Connection Lifecycle</h2>
      <pre><code>SYN       → Connection request
SYN-ACK   → Server accepts
ACK       → Connection established
DATA      → Communication hoti hai
DATA      → ...
FIN       → Close request
ACK       → Connection closed</code></pre>
      <p>Investigator ko har stage samajhni chahiye.</p>

      <h2>5. TCP Three-Way Handshake</h2>
      <pre><code>Step 1: Client  ──── SYN ────► Server
Step 2: Client  ◄── SYN-ACK── Server
Step 3: Client  ──── ACK ────► Server
                [Connected!]</code></pre>

      <h2>6. Why Handshake Analysis Important?</h2>
      <p>Handshake se ye detect hota hai:</p>
      <ul>
        <li>Port scans</li>
        <li>SYN flood attacks</li>
        <li>Failed connections</li>
        <li>Reconnaissance activity</li>
      </ul>

      <h2>7. Finding Handshakes in Wireshark</h2>
      <pre><code>Sab SYN packets:
tcp.flags.syn == 1

Sirf initial SYN (no ACK):
tcp.flags.syn == 1 && tcp.flags.ack == 0</code></pre>

      <h2>8. TCP Session Reconstruction</h2>
      <p>Goal hai complete conversation rebuild karna. Packets ek sath jod ke poori session reconstruct hoti hai.</p>
      <pre><code>Packet 1 + Packet 2 + Packet 3 + Packet 4
              ↓
       Complete Session</code></pre>

      <h2>9. Follow TCP Stream</h2>
      <p>Wireshark ka sabse powerful feature hai ye:</p>
      <pre><code>Kisi bhi TCP packet par right click karo
Follow → TCP Stream select karo</code></pre>
      <p>Web requests, credentials, malware communication aur commands reconstruct hote hain.</p>

      <h2>10. TCP Sequence Numbers</h2>
      <p>Sequence numbers se data track hota hai, order maintain hota hai aur missing packets detect hote hain.</p>
      <pre><code>Seq = 1000  → Pehla segment
Seq = 1500  → Doosra segment
Seq = 2000  → Teesra segment</code></pre>

      <h2>11. ACK Numbers</h2>
      <p>Receiver confirm karta hai ki usne kitna data receive kiya:</p>
      <pre><code>ACK = 2001
Matlab: "2000 tak data mil gaya, ab 2001 bhejo"</code></pre>

      <h2>12. TCP Retransmissions</h2>
      <p>Jab packet lost ho jaata hai toh retransmission hoti hai:</p>
      <pre><code>Filter: tcp.analysis.retransmission</code></pre>
      <p>Ye indicate kar sakta hai congestion, packet loss, attack traffic ya network issues.</p>

      <h2>13. TCP Resets</h2>
      <pre><code>Filter: tcp.flags.reset == 1</code></pre>
      <p>RST ka matlab hai connection immediately terminate karna. Possible causes: closed port, firewall action, malware behavior ya scan activity.</p>

      <h2>14. TCP FIN Analysis</h2>
      <pre><code>Filter: tcp.flags.fin == 1</code></pre>
      <p>FIN ka matlab graceful connection close. Normal traffic mein FIN aur ACK dono dikhte hain. Agar sirf FIN hai ACK nahi toh suspicious hai.</p>

      <h2>15. TCP Port Scan Detection</h2>
      <p>Attacker ports scan karta hai. Indicators:</p>
      <ul>
        <li>Ek hi source IP</li>
        <li>Multiple alag alag ports par traffic</li>
        <li>Bahut saare SYN packets</li>
        <li>Koi ya bahut kam ACK</li>
      </ul>
      <pre><code>Filter: tcp.flags.syn == 1 && tcp.flags.ack == 0</code></pre>

      <h2>16. SYN Flood Attack</h2>
      <p>Attacker baar baar SYN packets bhejta hai lekin handshake kabhi complete nahi karta. Server ke resources exhaust ho jaate hain.</p>
      <pre><code>SYN → SYN → SYN → SYN → SYN (no ACK ever)</code></pre>
      <p>SYN Flood indicators: huge SYN count, bahut kam ACKs, half-open sessions ka bada count.</p>

      <h2>17. TCP Flags Investigation Summary</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SYN','Connection attempts detect karna'],['ACK','Active sessions identify karna'],['FIN','Normal closure confirm karna'],['RST','Forced closure ya attack detect karna'],['PSH','Immediate data delivery'],['URG','Rare traffic, suspicious ho sakta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>18. Abnormal TCP Behavior</h2>
      <p>Investigators ye cheezein watch karte hain:</p>
      <ul>
        <li>Excessive SYNs without ACKs</li>
        <li>Bahut saare resets ek sath</li>
        <li>Large retransmission count</li>
        <li>Strange ya unusual ports par traffic</li>
      </ul>

      <h2>19. UDP Forensics Overview</h2>
      <p>UDP connectionless protocol hai. Koi handshake nahi, fast hai, lightweight hai. Common UDP services:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['DNS','Port 53'],['DHCP','Port 67/68'],['NTP','Port 123'],['VoIP','Various ports']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>20. UDP Investigation Challenges</h2>
      <p>UDP investigate karna TCP se mushkil hai kyunki koi session establishment nahi hota, koi ACKs nahi hote aur reliability tracking nahi hoti.</p>

      <h2>21. UDP Analysis Filter</h2>
      <pre><code>udp</code></pre>

      <h2>22. Suspicious UDP Traffic Indicators</h2>
      <ul>
        <li>Large volumes of UDP packets</li>
        <li>Unknown destinations</li>
        <li>High-frequency packets</li>
        <li>Unusual payload sizes</li>
      </ul>

      <h2>23. UDP Flood Attack</h2>
      <p>Attacker huge UDP traffic bhejta hai. Result: resource exhaustion aur service disruption. Indicators: massive UDP packets, traffic spikes, single target.</p>

      <h2>24. DNS Over UDP</h2>
      <p>Zyada tar DNS traffic UDP par hoti hai port 53 par.</p>
      <pre><code>Filter: dns</code></pre>
      <div class="info-box"><p><strong>Kyun important hai:</strong> Malware aksar DNS ke zariye communicate karta hai. DNS tunneling mein data DNS packets ke andar chhupa hota hai.</p></div>

      <h2>25. ICMP Forensics Overview</h2>
      <p>ICMP diagnostics, reachability checks aur error reporting ke liye use hota hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Type 8','Echo Request, ping bhejte waqt'],['Type 0','Echo Reply, ping ka jawab'],['Type 3','Destination Unreachable']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:130px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>26. ICMP Analysis Filter</h2>
      <pre><code>icmp</code></pre>

      <h2>27. Ping Investigation</h2>
      <pre><code>Terminal mein: ping google.com
Wireshark filter: icmp

Observe karo:
Echo Request (Type 8) jaata hai
Echo Reply (Type 0) wapas aata hai</code></pre>

      <h2>28. ICMP Reconnaissance</h2>
      <p>Attackers ping sweeps karte hain live hosts dhundhne ke liye:</p>
      <pre><code>192.168.1.1 → ping
192.168.1.2 → ping
192.168.1.3 → ping
...sequential targets</code></pre>
      <p>Indicators: sequential targets, repeated Echo Requests, koi ya bahut kam replies.</p>

      <h2>29. ICMP Tunneling</h2>
      <p>Advanced attack mein attackers data ICMP packets ke andar chhupate hain. Normal ping traffic lag raha hota hai lekin andar data transfer ho raha hota hai.</p>
      <div class="info-box"><p><strong>Kyun dangerous hai:</strong> Bahut saare firewalls ICMP allow karte hain isliye ye technique security controls bypass kар sakti hai.</p></div>

      <h2>30. ICMP Tunneling Indicators</h2>
      <ul>
        <li>Bahut bade ICMP packets normal ping se zyada size ke</li>
        <li>Repeated ICMP communication ek hi destination se</li>
        <li>Unusual payload sizes</li>
        <li>ICMP traffic unusual times par</li>
      </ul>

      <h2>31. Covert Channels</h2>
      <p>Covert channel ka matlab hai ek legitimate protocol ko secretly data transfer karne ke liye use karna. Commonly abused protocols:</p>
      <ul>
        <li>ICMP tunneling</li>
        <li>DNS tunneling</li>
        <li>HTTP covert channels</li>
        <li>HTTPS covert channels</li>
      </ul>

      <h2>32. Beaconing Detection</h2>
      <p>Malware regular intervals par C2 server se contact karta hai. Indicators:</p>
      <pre><code>Har 60 seconds par same IP par traffic
Same packet size baar baar
Same destination port consistently</code></pre>
      <div class="info-box"><p><strong>Wireshark mein detect karo:</strong> Statistics → I/O Graphs mein regular spikes dikh rahe hain toh beaconing suspected hai.</p></div>

      <h2>33. Timeline Analysis</h2>
      <p>Investigation mein timeline banana bahut important hai:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['10:00','SYN packet - connection attempt'],['10:01','DNS query - domain lookup'],['10:02','TCP connection established'],['10:03','Large upload - data exfiltration suspected']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>34. Practical Lab 1</h2>
      <pre><code>Traffic capture karo
Filter: tcp
Identify karo: SYN, ACK, FIN packets
Ek complete handshake dhundho</code></pre>

      <h2>35. Practical Lab 2</h2>
      <pre><code>Filter: tcp.analysis.retransmission
Retransmissions check karo
Kitni hain aur kaunse IP ke liye</code></pre>

      <h2>36. Practical Lab 3</h2>
      <pre><code>Terminal mein: ping google.com
Wireshark mein: icmp filter lagao
ICMP packets analyze karo</code></pre>

      <h2>37. Practical Lab 4</h2>
      <pre><code>Filter: udp
DNS traffic observe karo
Kaunse domains query ho rahe hain</code></pre>

      <h2>38. Real Investigation Scenario</h2>
      <p>Alert aaya: suspicious outbound traffic. Investigator kya check karta hai:</p>
      <pre><code>Step 1: DNS queries check karo kaunse domains
Step 2: TCP sessions analyze karo
Step 3: UDP flows dekho
Step 4: ICMP activity check karo
Step 5: Beaconing patterns dhundho
Step 6: Timeline banao
Step 7: Malware communication identify karo</code></pre>

      <h2>39. Common Beginner Mistakes</h2>
      <ul>
        <li>Sirf protocol names check karna, flags ignore karna</li>
        <li>Retransmissions ignore karna, ye network health batati hain</li>
        <li>Timing patterns miss karna, beaconing detect nahi hoga</li>
        <li>ICMP ko sirf ping samajhna, tunneling miss ho jaata hai</li>
        <li>UDP traffic ignore karna, malware aksar UDP use karta hai</li>
      </ul>

      <h2>40. Part 6 Complete</h2>
      <p>Ab tum protocols ko ek investigator ki najar se dekhte ho. TCP ka har flag, UDP ka har flow, ICMP ka har packet - sab kuch tumhe kuch na kuch bata raha hai. Normal traffic aur malicious traffic ka farq ab tumhare liye clearly samajh aata hai.</p>
      <p>Part 7 mein DNS aur HTTP forensics mein jaayenge jo ki sabse zyada evidence wale protocols hain. DNS queries se malware domains milte hain, HTTP traffic mein credentials aur files milti hain.</p>

      <div class="info-box">
        <p><strong>Part 6 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>tcp.flags.syn == 1 filter lagao aur port scans identify karo</li>
          <li>tcp.flags.reset == 1 se resets observe karo</li>
          <li>ping google.com karo aur ICMP packets analyze karo</li>
          <li>Statistics → I/O Graphs mein traffic spikes dhundho</li>
          <li>Follow TCP Stream se ek complete session reconstruct karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>SYN Flood kya hota hai?</li>
          <li>TCP retransmission kyun hoti hai?</li>
          <li>UDP investigation mushkil kyun hai?</li>
          <li>ICMP Type 8 kya hai?</li>
          <li>Beaconing kya hota hai?</li>
        </ul>
      </div>

    `;
