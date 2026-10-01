// Extracted from js/chapters.js — Network Forensics course, chapter index 6.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent06 = `

      <h2>1. Why DNS & HTTP Are Critical?</h2>
      <p>Real-world investigations mein sabse zyada evidence DNS traffic aur HTTP/HTTPS traffic se milta hai. Kyunki lagbhag har malware, browser, app ya attacker kisi na kisi domain ya server se communicate karta hai.</p>

      <h2>2. What is DNS?</h2>
      <p>DNS ka matlab hai Domain Name System. Iska kaam hai domain name ko IP address mein convert karna.</p>
      <pre><code>google.com → 142.250.193.78
instagram.com → 157.240.x.x
attacker.com → 45.33.x.x</code></pre>

      <h2>3. Why DNS Exists?</h2>
      <p>Humans "google.com" yaad rakh sakte hain lekin systems IP addresses se communicate karte hain. DNS dono ke beech translator ka kaam karta hai.</p>

      <h2>4. DNS Resolution Process</h2>
      <pre><code>Step 1: Browser DNS server ko query bhejta hai
Step 2: DNS server request receive karta hai
Step 3: IP address return karta hai
Step 4: Browser us IP par connect karta hai</code></pre>

      <h2>5. DNS Packet Structure</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Transaction ID','Query tracking ke liye unique ID'],['Query Name','Requested domain name'],['Query Type','A, AAAA, MX etc.'],['Response Code','Success ya error']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>6. Common DNS Record Types</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['A','IPv4 Address - sabse common'],['AAAA','IPv6 Address'],['MX','Mail Server'],['NS','Name Server'],['TXT','Text Record - DNS tunneling mein misuse hota hai'],['CNAME','Alias - ek domain doosre ko point karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>7. DNS Analysis in Wireshark</h2>
      <pre><code>Filter: dns
Sab DNS traffic dikhta hai</code></pre>

      <h2>8. DNS Query Analysis</h2>
      <pre><code>Filter: dns.flags.response == 0
Sirf DNS requests dikhti hain
Kaunse domains query ho rahe hain pata chalta hai</code></pre>

      <h2>9. DNS Response Analysis</h2>
      <pre><code>Filter: dns.flags.response == 1
Sirf DNS responses dikhte hain
Resolved IPs aur DNS answers milte hain</code></pre>

      <h2>10. Why DNS Is Gold for Investigators?</h2>
      <p>DNS se ye sab reveal hota hai:</p>
      <ul>
        <li>Kaun se domains visit kiye gaye</li>
        <li>Malware ke server domains</li>
        <li>Command and Control domains</li>
        <li>Phishing sites</li>
        <li>Data exfiltration channels</li>
      </ul>

      <h2>11. Suspicious DNS Indicators</h2>
      <p>Investigators in patterns ko dhundhte hain:</p>
      <ul>
        <li>Random looking domains jaise akdh82jsn2.com</li>
        <li>Bahut lambe domains</li>
        <li>Thousands of queries ek hi time par</li>
        <li>Repeated failures NXDOMAIN responses</li>
      </ul>

      <h2>12. NXDOMAIN Analysis</h2>
      <p>NXDOMAIN ka matlab hai domain exist nahi karta.</p>
      <pre><code>Filter: dns.flags.rcode != 0</code></pre>
      <div class="info-box"><p><strong>DGA - Domain Generation Algorithm:</strong> Malware automatically fake domains generate karta hai C2 communication ke liye. Bahut saare NXDOMAIN responses DGA ka sign hai.</p></div>

      <h2>13. DGA Domains</h2>
      <p>Malware automatically domains generate karta hai detection se bachne ke liye:</p>
      <pre><code>js82kxn11.com
qk72js8a.net
xj29ska82.org</code></pre>
      <p>Ye domains random lag te hain kyunki ye actually algorithm se generate hote hain.</p>

      <h2>14. DNS Tunneling</h2>
      <p>Advanced attack technique jismein data DNS queries ke andar chhupaya jaata hai:</p>
      <pre><code>secretdata.base64encoded.attacker.com</code></pre>
      <p>Purpose: data exfiltration, command delivery, security controls bypass karna.</p>

      <h2>15. DNS Tunneling Indicators</h2>
      <ul>
        <li>Extremely long query names</li>
        <li>High DNS query volume</li>
        <li>Repeated TXT record queries</li>
        <li>Unusual domain patterns</li>
        <li>Large DNS response sizes</li>
      </ul>

      <h2>16. Useful DNS Filters</h2>
      <pre><code>dns.flags.response == 0          → Sirf queries
dns.flags.response == 1          → Sirf responses
dns.txt                          → TXT records
dns.qry.name contains "google"   → Specific domain dhundho
dns.flags.rcode != 0             → Failed queries</code></pre>

      <h2>17. What is HTTP?</h2>
      <p>HTTP ka matlab hai HyperText Transfer Protocol. Web communication ke liye use hota hai. Ye unencrypted hota hai isliye forensics mein bahut valuable hai.</p>

      <h2>18. HTTP Communication Flow</h2>
      <pre><code>Client
  ↓
HTTP Request (GET/POST)
  ↓
Server
  ↓
HTTP Response (200 OK + Data)
  ↓
Client receives page/data</code></pre>

      <h2>19. HTTP Request Components</h2>
      <ul>
        <li>Method - GET, POST, PUT, DELETE</li>
        <li>URI - kaunsa resource chahiye</li>
        <li>Host - kaunsa server</li>
        <li>User-Agent - kaunsa client hai</li>
        <li>Cookies - session information</li>
      </ul>

      <h2>20. HTTP Methods</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['GET','Data retrieve karna, website khoolna'],['POST','Data send karna, login forms, file upload'],['PUT','Data update karna'],['DELETE','Data remove karna']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:100px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>21. GET Request Example</h2>
      <pre><code>GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0

Meaning: Server se index.html page maango</code></pre>

      <h2>22. POST Request Example</h2>
      <pre><code>POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

username=admin&password=secret123</code></pre>
      <div class="info-box"><p><strong>Forensics mein:</strong> HTTP POST requests mein credentials, uploaded files aur form data hota hai jo unencrypted HTTP mein clearly dikh jaata hai.</p></div>

      <h2>23. HTTP Response Status Codes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['200','OK - Success'],['301','Redirect - page move hua'],['403','Forbidden - access nahi hai'],['404','Not Found - page nahi mila'],['500','Server Error - server ne error diya']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>24. HTTP Analysis Filters</h2>
      <pre><code>http                              → Sab HTTP traffic
http.request                      → Sirf requests
http.response                     → Sirf responses
http.request.method == "GET"      → GET requests
http.request.method == "POST"     → POST requests</code></pre>

      <h2>25. User-Agent Investigation</h2>
      <p>User-Agent se pata chalta hai kaunsa client request kar raha hai.</p>
      <pre><code>Filter: http.user_agent

Normal browser:
Mozilla/5.0 (Windows NT 10.0; Win64; x64)

Attack tool:
python-requests/2.28.0
curl/7.68.0
Nmap Scripting Engine</code></pre>
      <div class="info-box"><p><strong>Kyun important hai:</strong> Malware aur attack tools aksar unique ya suspicious User-Agents use karte hain jo normal browsers se alag hote hain.</p></div>

      <h2>26. Credential Theft Detection</h2>
      <p>Unencrypted HTTP traffic mein credentials plain text mein hote hain:</p>
      <pre><code>POST /login HTTP/1.1
username=admin&password=secret123

ya

Authorization: Basic YWRtaW46cGFzc3dvcmQ=</code></pre>
      <p>Packet content mein "password" search karo Ctrl+F se.</p>

      <h2>27. Finding Credentials in Wireshark</h2>
      <pre><code>Ctrl + F → String search
Search: "password" ya "username"
Ya: "login" ya "credential"</code></pre>
      <div class="info-box"><p><strong>Important:</strong> Sirf authorized traffic analyze karo. Unauthorized traffic capture karna illegal hai.</p></div>

      <h2>28. File Download Detection</h2>
      <p>HTTP se files download hoti hain. Evidence:</p>
      <pre><code>Response headers mein dekho:
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="malware.exe"</code></pre>

      <h2>29. Export Downloaded Files</h2>
      <pre><code>Wireshark mein:
File → Export Objects → HTTP

Downloaded files recover ho jaati hain
EXE, ZIP, PDF, DOCX sab extract ho sakte hain</code></pre>

      <h2>30. Malware HTTP Communication</h2>
      <p>Malware typically ye flow follow karta hai:</p>
      <pre><code>Step 1: DNS query → attacker domain resolve karo
Step 2: HTTP connection → server se connect karo
Step 3: Response receive → commands lo
Step 4: Data upload → stolen data bhejo</code></pre>

      <h2>31. Indicators of Malicious HTTP</h2>
      <ul>
        <li>Unknown domains pe repeated connections</li>
        <li>Strange ya unusual User-Agent strings</li>
        <li>Repeated POST requests at regular intervals</li>
        <li>Large uploads to unknown destinations</li>
        <li>Connections at unusual times</li>
      </ul>

      <h2>32. Follow HTTP Stream</h2>
      <pre><code>Kisi bhi HTTP packet par right click karo
Follow → TCP Stream select karo
Poora HTTP conversation text mein dikh jaata hai</code></pre>

      <h2>33. Timeline Reconstruction</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['09:00','DNS Query - attacker domain lookup'],['09:01','DNS Response - IP mila'],['09:02','HTTP Request - server se connect'],['09:03','File Download - malware download hua'],['09:04','Malware Execution - system compromise']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>34. Practical Lab 1</h2>
      <pre><code>Browser mein: http://neverssl.com kholo
Traffic capture karo
Filter: http
Requests observe karo aur GET method dekho</code></pre>

      <h2>35. Practical Lab 2</h2>
      <pre><code>Filter: dns
Identify karo:
Kaunse domains query ho rahe hain
Kaunsi IPs return ho rahi hain</code></pre>

      <h2>36. Practical Lab 3</h2>
      <pre><code>Filter: http.request.method == "POST"
POST traffic observe karo
Content dekho Follow TCP Stream se</code></pre>

      <h2>37. Practical Lab 4</h2>
      <pre><code>Kisi bhi HTTP packet par Follow TCP Stream karo
Identify karo:
Host header
Request URI
User-Agent string
Response status code</code></pre>

      <h2>38. Real Investigation Scenario</h2>
      <p>Alert: suspicious web traffic. Investigator ka approach:</p>
      <pre><code>Step 1: dns filter → kaunse domains query hue
Step 2: http filter → kaunsi HTTP requests hain
Step 3: User-Agent check → tools ya malware to nahi
Step 4: POST requests dhundho → data upload to nahi hua
Step 5: File exports check karo → koi file download to nahi hui
Step 6: Timeline banao</code></pre>

      <h2>39. Common Beginner Mistakes</h2>
      <ul>
        <li>DNS ignore karna, wahan malware domains milte hain</li>
        <li>User-Agent check na karna, attack tools expose ho jaate hain</li>
        <li>POST requests skip karna, wahan credentials hote hain</li>
        <li>File exports use na karna, malware recover ho sakta hai</li>
        <li>NXDOMAIN responses ignore karna, DGA detect nahi hoga</li>
      </ul>

      <h2>40. Part 7 Complete</h2>
      <p>DNS aur HTTP ab tumhare liye ek open book ban gayi hain. Jab bhi koi incident hoga aur tum PCAP file khologey, pehle DNS dekho aur phir HTTP - is combination se 80% cases mein story samajh aati hai.</p>
      <p>Part 8 mein HTTPS aur TLS forensics cover karenge. HTTPS encrypted hota hai lekin phir bhi bahut saara evidence milta hai TLS handshake aur metadata se.</p>

      <div class="info-box">
        <p><strong>Part 7 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>dns filter se apne network ke domains dekho</li>
          <li>http://neverssl.com visit karo aur HTTP traffic capture karo</li>
          <li>Follow TCP Stream se ek HTTP conversation reconstruct karo</li>
          <li>File → Export Objects → HTTP try karo</li>
          <li>dns.flags.rcode != 0 filter se failed queries dekho</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>DNS ka mukhya kaam kya hai?</li>
          <li>NXDOMAIN kya hota hai?</li>
          <li>DNS tunneling kya hai?</li>
          <li>GET aur POST mein kya difference hai?</li>
          <li>User-Agent kyun important hai?</li>
        </ul>
      </div>

    `;
