// Extracted from js/chapters.js — Network Forensics course, chapter index 9.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent09 = `

      <h2>1. What is a PCAP Investigation?</h2>
      <p>PCAP Investigation ka matlab hai captured network traffic file ko analyze karke kisi incident, malware activity, attacker behavior ya data theft ki poori story reconstruct karna. Ye professional network forensics ka core skill hai.</p>

      <h2>2. What is a PCAP File?</h2>
      <div class="info-box"><p><strong>PCAP = Packet Capture.</strong> Ye ek file hoti hai jisme network ka poora recorded traffic hota hai. Jaise video camera traffic record karta hai, PCAP network traffic record karta hai har packet ke saath.</p></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 28px;">
        ${[['Packets','Har ek network packet'],['Protocols','TCP, UDP, DNS, HTTP, TLS'],['IP Addresses','Source aur destination'],['DNS Requests','Kaunse domains query kiye'],['TCP Sessions','Connection details'],['HTTP/TLS Traffic','Web requests aur encrypted sessions']].map(r=>`
        <div style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.22);border-radius:8px;padding:8px 14px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-top:2px;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Investigation Goals</h2>
      <p>Jab PCAP mile toh investigator sabse pehle ye sawaal answer karta hai. Bina goal ke investigation inefficient hoti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['What happened?','Kya incident hua, malware download, data theft ya scanning'],['When happened?','Timeline kya thi, kab shuru hua kab khatam'],['Who was involved?','Kaunse hosts involved the, internal ya external'],['Which systems communicated?','Kaunse IPs aapas mein baat kar rahe the'],['Was malware present?','Koi suspicious download ya C2 communication tha'],['Was data stolen?','Large uploads ya unusual destinations the']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>4. Professional Investigation Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Receive PCAP','PCAP file collect karo incident se'],['Initial Triage','Quick overview, size, duration, protocols'],['Protocol Analysis','Traffic distribution dekho'],['Host Identification','Internal aur external hosts identify karo'],['Timeline Creation','Events ki sequence banao'],['IOC Extraction','IPs, domains, URLs, hashes collect karo'],['Malware Analysis','Suspicious behavior investigate karo'],['Evidence Correlation','Saare findings jodo ek story mein'],['Reporting','Professional report banao']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0||i===8?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:10px 24px;text-align:center;width:260px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===8?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>5. Step 1: Initial Triage</h2>
      <p>Triage matlab quick overview. PCAP khol te hi sabse pehle basic information gather karo. Directly deep dive mat karo, pehle scope samjho.</p>
      <pre><code>Triage mein check karo:

PCAP file size        Kitna bada hai, lamba session tha
Capture duration      Kitne time ka traffic record hai
Number of hosts       Kitne unique IPs hain
Major protocols       Kaunse protocols dominant hain
Time range            Investigation ka window kya hai</code></pre>
      <div class="info-box"><p><strong>Wireshark mein:</strong> Statistics menu kholo aur Protocol Hierarchy select karo. Ye sabse pehla kaam hai jo har investigator karta hai.</p></div>

      <h2>6. Protocol Hierarchy Analysis</h2>
      <p>Protocol Hierarchy ek overview deta hai ki traffic ka distribution kya hai. Kaunsa protocol kitna percent use ho raha hai ye dekh ke investigator understand karta hai ki kya investigate karna hai.</p>
      <pre><code>Statistics  Protocol Hierarchy

Example output:
Protocol        Packets   Percent
TCP             8420      70.2%
UDP             2400      20.0%
DNS             600        5.0%
TLS             480        4.0%
HTTP            120        1.0%

Agar TLS bahut zyada hai: encrypted traffic investigate karo
Agar DNS bahut zyada hai: DNS tunneling check karo
Agar HTTP hai: plaintext requests mein credentials ho sakte hain</code></pre>

      <h2>7. Step 2: Identify Top Hosts</h2>
      <p>Endpoints analysis se pata chalta hai ki kaunse hosts ne sabse zyada traffic generate kiya. Unusual hosts ya unknown IPs investigation ke liye priority hoti hain.</p>
      <pre><code>Statistics  Endpoints  IPv4 tab

Information milti hai:
IP Address        Har unique host ka address
MAC Address       Physical hardware address
Packets Sent      Kitne packets bheje
Packets Received  Kitne packets receive kiye
Bytes Sent        Kitna data upload kiya
Bytes Received    Kitna data download kiya

Kya dhundhna hai:
Host jo sabse zyada upload kar raha ho  data exfiltration
Unknown external IPs                    C2 ya attacker
Unusual MAC addresses                   Impersonation</code></pre>

      <h2>8. Step 3: Analyze Conversations</h2>
      <p>Conversations analysis source aur destination ke beech ke connections dikhata hai. Ye data exfiltration, malware C2, aur internal scanning detect karne mein use hota hai.</p>
      <pre><code>Statistics  Conversations  TCP tab

Columns:
Address A       Source IP
Address B       Destination IP
Packets A to B  Ek direction mein packets
Bytes A to B    Ek direction mein data
Duration        Connection kitni der chal ti rahi</code></pre>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Data Exfiltration','Internal host bahut zyada data external IP ko bhej raha hai'],['Malware C2','Fixed intervals par same destination se connection'],['Suspicious Uploads','Large POST requests ya FTP uploads'],['Internal Scanning','Ek host bahut saare internal IPs se connect kar raha hai']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>9. Step 4: Identify Internal vs External Hosts</h2>
      <p>Investigation mein sabse pehle ye samajhna zaroori hai ki kaunse hosts internal network ke hain aur kaunse bahar ke. Private IP ranges internal hoti hain.</p>
      <pre><code>Internal IP Ranges (Private):
10.0.0.0     to  10.255.255.255
172.16.0.0   to  172.31.255.255
192.168.0.0  to  192.168.255.255

External IPs: Baki sab public internet ke hain

Common legitimate external IPs:
8.8.8.8       Google DNS
1.1.1.1       Cloudflare DNS
Baaki unknown IPs ko investigate karo</code></pre>

      <h2>10. Step 5: DNS Investigation</h2>
      <p>DNS sabse important investigation point hai. Malware bhi domain name use karta hai C2 server se connect karne ke liye. DNS queries se pata chalta hai ki machine ne kaunse domains contact karne ki koshish ki.</p>
      <pre><code>Filter: dns

Look for:
Queried domains          Kaunse domains request kiye gaye
Failed resolutions       NXDOMAIN responses, domain exist nahi karta
High frequency queries   Ek domain ko baar baar query karna
DGA domains              random-a7x9k2.xyz jaise random looking names
Long subdomains          data.encoded.evil.com jaise DNS tunneling</code></pre>
      <div class="info-box"><p><strong>DGA = Domain Generation Algorithm.</strong> Malware automatically random domain names generate karta hai C2 server se connect karne ke liye. randomstring123.xyz jaisi domains suspicious hoti hain.</p></div>

      <h2>11. IOC Meaning</h2>
      <p>IOC yaani Indicator of Compromise wo evidence hai jo batata hai ki koi system compromise hua hai. PCAP investigation mein nikaale gaye IOCs dusre systems ki investigation mein bhi use hote hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">IOC TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">EXAMPLE</span>
        </div>
        ${[['IP Address','192.168.1.100, 45.33.32.156'],['Domain','evil-malware-c2.xyz, randomdomain.ru'],['URL','/payload.exe, /gate.php, /upload'],['File Hash','abc123def456... (MD5 ya SHA256)'],['Email','attacker@suspicious-domain.com'],['Port','4444, 1337, 9001 (unusual ports)']].map(r=>`
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>12. Step 6: HTTP Investigation</h2>
      <p>HTTP traffic unencrypted hota hai isliye investigators ke liye goldmine hai. Downloads, uploads, credentials, aur malware requests sab visible hoti hain.</p>
      <pre><code>Filter: http
Sabse basic filter, sab HTTP traffic dikhaata hai

Filter: http.request
Sirf outgoing requests dikhaata hai

Filter: http.request.method == "POST"
POST requests dekho, data upload ya login attempts

Filter: http.request.uri contains ".exe"
Executable file downloads dhundhna

Filter: http.response.code == 200
Successful responses, actual content mile</code></pre>
      <p>GET requests mein URL dekho, POST requests mein body dekho, File downloads mein extension dekho aur response size dekho.</p>

      <h2>13. Investigate POST Requests</h2>
      <p>POST requests investigation mein bahut important hote hain kyunki malware data exfiltrate karne ke liye POST use karta hai. Login credentials bhi POST mein hote hain.</p>
      <pre><code>Filter: http.request.method == "POST"

Kya dekho POST mein:
Destination URL         Kahan data ja raha hai
Request body size       Kitna data bheja ja raha hai
Content-Type header     Kis format mein data bheja ja raha hai
Frequency               Kitni baar POST ho raha hai

Follow TCP Stream se POST body dekh sakte hain
Right click  Follow  TCP Stream</code></pre>

      <h2>14. Step 7: HTTPS / TLS Investigation</h2>
      <p>HTTPS traffic encrypted hota hai isliye content directly nahi dekha ja sakta. Lekin metadata se bahut information milti hai jo investigation mein kaam aati hai.</p>
      <pre><code>Filter: tls
Sabse basic TLS filter

Filter: tls.handshake.type == 1
Client Hello packets, connection attempt

Filter: tls.handshake.extensions_server_name
SNI field se destination domain pata chalta hai
Encrypted traffic mein bhi domain visible hota hai

Check karo:
SNI                Destination domain name
Certificate        Kaunsa certificate use ho raha hai
Timing             Connection kitni baar aur kab hoti hai
Destination IP     IP investigate karo WHOIS se</code></pre>
      <div class="info-box"><p><strong>SNI = Server Name Indication.</strong> TLS handshake mein plaintext mein hota hai. Encrypted traffic mein bhi destination domain is se pata chalta hai.</p></div>

      <h2>15. Step 8: Host Profiling</h2>
      <p>Har suspect host ke liye ek profile banao. Profile mein us host ki saari activity record karo. Ye evidence correlation mein help karta hai.</p>
      <pre><code>Host Profile: 192.168.1.20

DNS Activity:
  evil-domain.xyz query kiya        suspicious
  google.com query kiya             normal

HTTP Activity:
  GET /payload.exe downloaded       malicious
  POST /gate.php data sent          C2 communication

TLS Activity:
  evil-c2.ru se connection          C2 server
  Har 60 seconds mein reconnect     beaconing pattern

Upload Behavior:
  500KB data POST kiya              data exfiltration possible</code></pre>

      <h2>16. Host Profiling Table</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;padding:10px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">HOST</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">OBSERVED ACTIVITY</span>
        </div>
        ${[['192.168.1.5','Normal browser, Google DNS, HTTPS sites, no suspicious behavior','#f4f4f5'],['192.168.1.7','DNS only, no HTTP or TLS, unusual for a workstation','#b0b0b8'],['192.168.1.20','Suspicious uploads, C2 beaconing, malware download detected','#dc1414']].map(r=>`
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:${r[2]};">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>17. Step 9: Timeline Creation</h2>
      <p>Timeline investigation ka backbone hai. Events ki sequence banao taaki pata chale ki pehle kya hua aur baad mein kya. Bina timeline ke investigation incomplete hoti hai.</p>
      <pre><code>Example Timeline:

10:00:15  DNS query for evil-domain.xyz
10:00:16  DNS response received, IP = 45.33.32.156
10:00:17  TCP connection to 45.33.32.156:80
10:00:18  HTTP GET /payload.exe
10:00:22  File download complete, 245KB
10:02:00  New process behavior detected in traffic
10:02:01  DNS query for c2-server.ru
10:02:02  TCP connection every 60 seconds starts (beaconing)
10:15:30  HTTP POST /gate.php, 480KB data sent</code></pre>
      <p>Timeline se pata chalta hai: pehle DNS hua, phir download hua, phir C2 connection shuru hua, phir data exfil hua. Ye poori attack story hai.</p>

      <h2>18. Step 10: Detect Beaconing</h2>
      <p>Beaconing matlab malware C2 server ko fixed intervals par check-in karta rehta hai. Ye ek strong malware indicator hai. Legitimate software usually itni regularity se connect nahi karta.</p>
      <pre><code>Beaconing patterns:
Fixed time intervals    Har 30, 60, 120 seconds mein connection
Same destination        Hamesha same IP ya domain
Same packet size        Har packet approximately same size
Consistent timing       Night mein bhi same pattern</code></pre>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Fixed Intervals','Har 60 seconds mein exactly same destination ko connection'],['Same Destination','Ek hi IP ya domain ko baar baar'],['Same Packet Size','Check-in packets approximately same size hote hain'],['Off-hours Activity','Raat ko ya weekend mein bhi same pattern']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>19. Detecting Data Exfiltration</h2>
      <p>Data exfiltration ka matlab hai sensitive data bahar bheja ja raha hai. PCAP mein ye large uploads, unusual destinations ya repeated POST requests ke form mein dikh ta hai.</p>
      <pre><code>Signs of Data Exfiltration:

Large upload sessions      Bytes sent >> bytes received
Unusual external IPs       Unknown destinations ko data
Repeated POST requests     Baar baar data bheja ja raha hai
Long duration sessions     Connection ghanto tak open rehti hai
After-hours uploads        Business hours ke baad uploads

Filter for large uploads:
Statistics  Conversations mein Bytes A to B dekho
Jo host sabse zyada data bhej raha hai wo suspect hai</code></pre>

      <h2>20. Detecting Malicious Downloads</h2>
      <p>Malware delivery aksar file download se hoti hai. PCAP mein HTTP ya FTP se downloaded files ke evidence milte hain.</p>
      <pre><code>Filter: http.request.uri contains ".exe"
Filter: http.request.uri contains ".zip"
Filter: http.request.uri contains ".dll"
Filter: http.request.uri contains ".docm"

File Export:
File  Export Objects  HTTP

Ye sab downloaded files extract kar deta hai PCAP se
Extracted files ko VirusTotal par check karo</code></pre>

      <h2>21. Step 11: Follow TCP Streams</h2>
      <p>TCP stream follow karne se do hosts ke beech ki poori conversation reconstruct hoti hai. Ye commands, credentials, URLs aur data sabhi dekhne ke liye use hota hai.</p>
      <pre><code>Koi bhi packet par right click karo
Follow  TCP Stream

Color coding:
Red text    Client se server ko bheja gaya data
Blue text   Server se client ko aaya data

Kya dhundhna hai:
Commands       Shell commands ya malware instructions
Credentials    Username password plaintext mein
URLs           Download ya C2 URLs
File content   Downloaded file ka content</code></pre>

      <h2>22. Step 12: Find Suspicious Ports</h2>
      <p>Common services standard ports use karte hain. Agar koi service unusual port par chal rahi hai toh ye suspicious ho sakta hai. Malware aksar non-standard ports use karta hai detection se bachne ke liye.</p>
      <pre><code>Common legitimate ports:
80    HTTP
443   HTTPS
53    DNS
25    SMTP
22    SSH

Suspicious or unusual ports:
4444  Metasploit default
1337  Common malware port
9001  Tor relay
8080  Alternate HTTP, could be proxy
8443  Alternate HTTPS

Filter: tcp.port == 4444
Filter: tcp.port == 1337

Note: Unusual port alone proof nahi hai, investigate further karo</code></pre>

      <h2>23. Step 13: Check for Network Scanning</h2>
      <p>Network scanning tab hota hai jab koi attacker ya malware network mein targets dhundh raha hota hai. Bahut saare SYN packets bina ACK ke scanning ka indicator hai.</p>
      <pre><code>Filter: tcp.flags.syn == 1 && tcp.flags.ack == 0

Ye filter SYN packets dikhata hai jo ACK ke bina hain
Scanning mein attacker SYN bhejta hai lekin connection complete nahi karta

Scanning indicators:
Same source IP se bahut saari SYN packets
Different destination IPs ya ports
Short time mein hundreds of attempts
No complete TCP handshakes</code></pre>

      <h2>24. Step 14: Check for Failed Connections</h2>
      <p>TCP RST yaani reset packets tab aate hain jab connection reject ho jaata hai. Bahut saare RST packets scanning, reconnaissance ya malware retry attempts indicate karte hain.</p>
      <pre><code>Filter: tcp.flags.reset == 1

RST packets indicate kar sakte hain:
Closed ports      Port band hai, service nahi chal rahi
Reconnaissance    Attacker ports scan kar raha hai
Malware retries   C2 se connect nahi ho pa raha, baar baar try kar raha</code></pre>

      <h2>25. Step 15: Check ARP Activity</h2>
      <p>ARP yaani Address Resolution Protocol network mein IP se MAC address resolve karta hai. ARP poisoning attack mein attacker fake ARP replies bhejta hai taaki traffic intercept kar sake.</p>
      <pre><code>Filter: arp

Normal ARP:
Who has 192.168.1.1? Tell 192.168.1.5
192.168.1.1 is at aa:bb:cc:dd:ee:ff

ARP Poisoning indicators:
Duplicate MAC addresses     Same IP ke liye alag MACs
Gratuitous ARP spam         Bina request ke baar baar ARP broadcast
IP-MAC mismatch             Known host ki MAC badal gayi</code></pre>

      <h2>26. Investigation Checklist</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['WHO?','Source host kaun hai, internal ya external IP'],['WHAT?','Malware, download, exfiltration, scanning, C2'],['WHEN?','Exact timestamps, pehle kya hua baad mein kya'],['WHERE?','Destination IPs, domains, countries'],['HOW?','Kaunsa protocol use hua, kaunsa port, kaunsa method']].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.15);padding:12px 16px;display:grid;grid-template-columns:70px 1fr;gap:8px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>27. Evidence Correlation</h2>
      <p>Investigation ke end mein saare findings ko milao ek complete story banane ke liye. Akela ek finding weak hota hai, lekin saath mein strong case banta hai.</p>
      <pre><code>Correlation example:

DNS query for evil-domain.xyz at 10:00:15
    +
HTTP download of payload.exe at 10:00:18 from same IP
    +
Beaconing to evil-domain.xyz every 60s from 10:02 onwards
    +
POST request with 480KB data to evil-domain.xyz at 10:15

= Complete malware infection story confirmed</code></pre>

      <h2>28. Sample Investigation</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Possible Malware Infection Alert</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert received: "Possible malware on 192.168.1.20"<br>
          Protocol Hierarchy: Unusual DNS + HTTP spike<br>
          DNS: <span style="color:#dc1414;font-weight:600;">random-domain.xyz</span> query, NXDOMAIN initially, then resolved<br>
          HTTP: GET <span style="color:#dc1414;font-weight:600;">/payload.exe</span> downloaded from resolved IP<br>
          TLS: <span style="color:#dc1414;font-weight:600;">Beaconing</span> har 60 seconds mein c2-server.ru ko<br>
          POST: <span style="color:#dc1414;font-weight:600;">480KB data</span> upload kiya /gate.php ko<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Confirmed malware infection, C2 communication aur data exfiltration detected</span>
        </div>
      </div>

      <h2>29. Reporting</h2>
      <p>Professional investigation report mein har section clear hona chahiye. Report non-technical management bhi padhti hai isliye simple language mein likhni chahiye evidence ke saath.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Summary','Kya hua, ek paragraph mein, non-technical language mein'],['Evidence','IPs, domains, timestamps, all collected IOCs with context'],['Findings','Observed activity ki detailed explanation'],['Impact','Risk level kitna hai, kya data gaya, kaunse systems affected'],['Recommendations','Mitigation steps, blocks, patches, monitoring']].map((r,i)=>`
        <div style="background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:12px 16px;display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>30. IOC Collection Sheet</h2>
      <pre><code>IOC Collection Template:

Type       Value                    Source
Domain     evil-domain.xyz          DNS query at 10:00:15
IP         45.33.32.156             Resolved from evil-domain.xyz
URL        /payload.exe             HTTP GET at 10:00:18
IP         c2-server.ru resolved    TLS beaconing destination
URL        /gate.php                POST data exfiltration
Hash       abc123def456...          Extracted payload.exe file

Ye IOCs block karo firewall aur proxy mein
SIEM mein alert rules banao inke liye</code></pre>

      <h2>31. Common Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Conclusions pe seedha jump karna','Pehle triage karo, phir step by step investigate karo'],['DNS ignore karna','Malware C2 domain DNS mein hi milta hai sabse pehle'],['Timeline nahi banana','Bina timeline ke attack sequence samajh nahi aata'],['Conversations ignore karna','Data exfiltration conversations mein hi visible hoti hai'],['Evidence document nahi karna','Investigation ke waqt timestamps aur findings note karo'],['Single IOC pe rely karna','Saare findings correlate karo strong case ke liye']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>32. Real Investigator Mindset</h2>
      <p>Professional investigator kabhi assume nahi karta. Har claim ko evidence se verify karta hai. Mindset yahi hona chahiye: jo dikhta hai wo prove karo, jo nahi dikhta wo nahi likho.</p>
      <div class="info-box"><p><strong>Never assume. Always verify.</strong> IP suspicious lagta hai toh WHOIS se verify karo. Domain malicious lagta hai toh VirusTotal se check karo. Timestamp note karo har finding ke saath.</p></div>

      <h2>33. Practical Lab</h2>
      <p>Koi bhi free PCAP file lo malware-traffic-analysis.net ya pakettotal.com se aur ye steps follow karo.</p>
      <pre><code>Step 1  Statistics  Protocol Hierarchy
Step 2  Statistics  Endpoints  top hosts identify karo
Step 3  Statistics  Conversations  suspicious sessions dekho
Step 4  Filter: dns  queried domains nikalo
Step 5  Filter: http  HTTP activity dekho
Step 6  Filter: tls  TLS connections dekho
Step 7  Timeline banao har event ka with timestamps
Step 8  IOC sheet mein sab collect karo
Step 9  Export Objects se files extract karo
Step 10 VirusTotal par files aur domains check karo</code></pre>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>IOC kya hota hai?</li>
          <li>Protocol Hierarchy kyun useful hai?</li>
          <li>Timeline kyun banate hain?</li>
          <li>Beaconing kya indicate kar sakta hai?</li>
          <li>PCAP investigation ka pehla step kya hai?</li>
        </ul>
      </div>

    `;
