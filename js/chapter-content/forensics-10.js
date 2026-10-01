// Extracted from js/chapters.js — Network Forensics course, chapter index 10.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent10 = `

      <h2>1. What is Malware Traffic Analysis?</h2>
      <p>Malware Traffic Analysis ka matlab hai malware dwara generate kiye gaye network traffic ko analyze karke uske behavior, communication, commands aur objectives ko samajhna. Ye skill investigator ko batati hai ki malware kya kar raha hai, kahan se commands le raha hai aur kya data chura raha hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Malware detect karna','Traffic patterns se infection identify karna'],['C2 servers identify karna','Attacker ka infrastructure dhundhna'],['IOCs extract karna','IPs, domains, URLs, hashes collect karna'],['Data theft detect karna','Exfiltration activity pakadna'],['Infection timeline banana','Attack ka poora sequence reconstruct karna']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>2. Why Malware Uses the Network?</h2>
      <p>Aaj ka almost har modern malware network use karta hai. Pure offline malware bahut rare hai. Network communication ke bina malware attacker ke liye useful nahi hota.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Commands receive karna','Attacker batata hai ki kya karna hai'],['Data upload karna','Stolen credentials, files, screenshots bhejta hai'],['Updates lena','Naya malware version ya modules download karna'],['Additional payload download karna','Stage 2 malware install karna'],['Persistence maintain karna','C2 se connected rehna taaki attacker control na khoye']].map(r=>`
        <div style="display:grid;grid-template-columns:200px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>3. Malware Communication Lifecycle</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Infection','Phishing ya exploit se machine compromise hoti hai'],['DNS Query','Malware C2 domain resolve karta hai'],['C2 Connection','Infected machine attacker ke server se connect hoti hai'],['Command Received','Attacker commands bhejta hai kya karna hai'],['Data Collection','Malware system se data gather karta hai'],['Data Exfiltration','Stolen data C2 server ko bheja jaata hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0||i===5?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:10px 24px;text-align:center;width:260px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===5?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>4. What is C2?</h2>
      <div class="info-box"><p><strong>C2 = Command and Control.</strong> Ye attacker ka server hota hai jo infected machine ko commands bhejta hai aur data receive karta hai. Jab tak C2 connection active hai, attacker ka machine par control rehta hai.</p></div>
      <pre><code>Victim PC (infected machine)
       ↕  encrypted communication
C2 Server (attacker controls this)

Attacker C2 par baitha hai aur commands type karta hai
Malware victim PC par execute karta hai aur results wapas bhejta hai</code></pre>

      <h2>5. Why C2 Detection is Critical?</h2>
      <p>Agar C2 detect ho gaya toh investigation ka scope bahut badh jaata hai. Ek C2 server kai victims ko control kar sakta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Attacker infrastructure identify hoti hai','C2 IP aur domain se aur bhi affected systems milte hain'],['Malware family identify hoti hai','C2 pattern se malware type pata chalta hai'],['Further compromise roka ja sakta hai','C2 block karo toh malware commands nahi milenge'],['Other victims dhundhe ja sakte hain','Same C2 se connected aur machines identify ho sakti hain']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>6. Common Malware Network Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Unknown domains','Koi bhi domain jo normal browsing mein nahi hona chahiye'],['Unknown IPs','Unrecognized external IPs especially from unusual countries'],['Beaconing','Fixed intervals par same destination ko regular connections'],['Strange User-Agents','HTTP mein non-standard browser strings'],['Repeated DNS queries','Same suspicious domain ko baar baar query karna'],['Suspicious uploads','Large POST requests ya unusual data outbound']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>7. Beaconing</h2>
      <p>Beaconing malware ka sabse important aur common network behavior hai. Malware C2 server ko fixed intervals par check-in karta rehta hai taaki naye commands mile. Investigator ke liye ye strongest malware indicator hai.</p>
      <div class="info-box"><p><strong>Malware beaconing isliye karta hai:</strong> "Do you have any new commands for me?" Attacker wahan wait karta hai aur jab koi command deta hai toh malware execute karta hai.</p></div>
      <pre><code>Normal traffic pattern:
Irregular timings, different destinations, variable sizes

Beaconing pattern:
10:00:00  192.168.1.20  -->  45.33.32.156:443
10:01:00  192.168.1.20  -->  45.33.32.156:443
10:02:00  192.168.1.20  -->  45.33.32.156:443
10:03:00  192.168.1.20  -->  45.33.32.156:443

Exactly 60 seconds, same IP, same port = Beaconing confirmed</code></pre>

      <h2>8. Beaconing Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">INDICATOR</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">EXAMPLE</span>
        </div>
        ${[['Fixed interval','Har exactly 30, 60, 120 seconds mein connection'],['Same destination IP','Baar baar same IP ya domain ko contact karna'],['Same packet size','Har check-in packet approximately same size hota hai'],['Off-hours activity','Raat 3 baje bhi same pattern chal raha hai'],['No human interaction','User ne kuch nahi kiya lekin traffic chal raha hai']].map(r=>`
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>9. DNS-Based Malware Communication</h2>
      <p>Malware aksar DNS se shuru karta hai. C2 domain resolve karne ke liye pehle DNS query hoti hai. Investigator DNS traffic mein hi pehla clue dhundhta hai.</p>
      <pre><code>Filter: dns

Kya dhundhna hai:
Random-looking domain names    kx72jds91.com
Unusual TLDs                   .xyz .ru .top .pw
High frequency queries         Same domain baar baar
Failed resolutions             NXDOMAIN responses
Long subdomain strings         a1b2c3d4.evil.com</code></pre>

      <h2>10. DGA Malware</h2>
      <div class="info-box"><p><strong>DGA = Domain Generation Algorithm.</strong> Malware automatically random domain names generate karta hai. Har din alag domains generate hote hain. Attacker sirf un domains ko register karta hai jo kaam ke hain. Baaki sab NXDOMAIN dete hain.</p></div>
      <pre><code>DGA domain examples:
kx72jds91.com
ab91kdj22.net
mxq9p2la73.xyz
rt81vkds42.ru

Legitimate domain comparison:
google.com      readable, makes sense
amazon.com      readable, makes sense
kx72jds91.com   random, high entropy = DGA suspect</code></pre>
      <p>DGA isliye use hota hai taaki security teams domain block na kar sake. Agar ek domain block hua toh malware agla generated domain use karta hai.</p>

      <h2>11. Detecting DGA Domains</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Random character strings','Domain mein koi readable word nahi hota, pure random'],['High entropy names','Characters ka distribution bohot random hota hai'],['Many failed resolutions','Malware bahut saare domains try karta hai, mostly NXDOMAIN'],['Unusual TLDs','.xyz .top .pw .cc jaise cheap TLDs common hain DGA mein'],['Short domain age','Naye registered domains DGA ke liye use hote hain']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>12. DNS Tunneling Malware</h2>
      <p>Kuch advanced malware data ko DNS requests ke andar chhupaata hai. Ye DNS tunneling kehlata hai. Data ko subdomain mein encode karke bheja jaata hai taaki firewall DNS block na kare kyunki DNS generally allowed rehta hai.</p>
      <pre><code>Normal DNS query:
google.com

DNS Tunneling example:
dGhpcyBpcyBzdG9sZW4gZGF0YQ==.evil-server.com
aGVsbG8gd29ybGQ=.attacker.com

Indicators:
Extremely long subdomain strings
TXT record requests
Base64-like strings in subdomains
Unusual DNS traffic volume
Same authoritative server repeatedly</code></pre>

      <h2>13. HTTP-Based Malware</h2>
      <p>Bahut saari malware families HTTP use karti hain C2 communication ke liye. HTTP isliye use hota hai kyunki port 80 almost har network par allowed hota hai aur normal web traffic mein blend ho jaata hai.</p>
      <pre><code>HTTP malware communication flow:

DNS query: evil-domain.xyz resolved
     ↓
HTTP GET /check-in.php
     ↓
Server response: {"cmd": "screenshot", "upload_to": "/gate.php"}
     ↓
Malware executes command
     ↓
HTTP POST /gate.php  (screenshot data upload)

Filter: http
Filter: http.request</code></pre>

      <h2>14. Indicators of Malicious HTTP</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Unknown domains','Domain jo suspicious hai ya recently registered'],['Repeated POST requests','Data baar baar upload ho raha hai C2 ko'],['Strange User-Agent','Browser identify karne wala string unusual hai'],['Encoded data','Base64 ya hex encoded content POST body mein'],['Unusual URI paths','/gate.php, /cmd.php, /update.php jaise paths'],['No Referer header','Browser normally Referer bhejta hai, malware nahi bhejta']].map(r=>`
        <div style="display:grid;grid-template-columns:200px 1fr;gap:10px;background:rgba(220,20,20,0.05);border-radius:8px;border:1px solid rgba(220,20,20,0.15);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>15. User-Agent Analysis</h2>
      <p>HTTP User-Agent header batata hai ki request kaunse software ne ki. Legitimate browsers standard User-Agent use karte hain. Malware aksar ya toh fake User-Agent use karta hai ya bilkul nahi bhejta.</p>
      <pre><code>Normal browser User-Agent:
Mozilla/5.0 (Windows NT 10.0; Win64; x64)
AppleWebKit/537.36 (KHTML, like Gecko)
Chrome/120.0.0.0 Safari/537.36

Suspicious malware User-Agents:
Updater_v1
BotClient/2.3
CustomAgent
python-requests/2.28
Go-http-client/1.1    (scripts ya custom tools)
Empty string           (no User-Agent at all)

Filter to find unusual User-Agents:
http.user_agent contains "Bot"
http.user_agent contains "python"</code></pre>

      <h2>16. HTTP POST Abuse</h2>
      <p>Malware data exfiltration ke liye POST requests use karta hai. HTTP GET se data receive karta hai commands ke liye, POST se data upload karta hai.</p>
      <pre><code>Filter: http.request.method == "POST"

POST request analysis mein dekho:
Destination URL       Kahan data ja raha hai
Body size             Kitna data bheja ja raha hai
Content-Type          Data format kya hai
Frequency             Kitni baar POST ho rahi hai
Timing pattern        Regular intervals = beaconing

Follow TCP Stream se POST body decode karo
Encoded data base64 decode karke dekho</code></pre>

      <h2>17. TLS-Based Malware</h2>
      <p>Modern malware zyada tar HTTPS use karta hai kyunki encrypted traffic mein content directly nahi dekha ja sakta. Attackers HTTPS isliye prefer karte hain taaki NGFWs aur proxies content inspect na kar sakein.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Encryption','Traffic content encrypted hai, directly nahi dekha ja sakta'],['Harder detection','Content-based signatures kaam nahi karti'],['Blends with normal traffic','Port 443 normal HTTPS ki tarah dikhta hai'],['Certificate bypass','Self-signed certificates bhi use ho sakte hain']].map(r=>`
        <div style="display:grid;grid-template-columns:180px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>18. TLS Malware Indicators</h2>
      <p>Content nahi dekh sakte lekin TLS metadata se bahut kuch pata chalata hai. Investigator SNI, certificates, timing aur traffic volume analyze karta hai.</p>
      <pre><code>TLS metadata jo analyze karte hain:

SNI (Server Name Indication)
  tls.handshake.extensions_server_name
  Destination domain plaintext mein hota hai

Certificate information
  Self-signed certificates suspicious hain
  Unknown certificate authorities
  Short validity periods

Timing analysis
  Fixed intervals = beaconing
  Off-hours connections

Traffic volume
  Small regular packets = check-in
  Large sudden upload = exfiltration</code></pre>

      <h2>19. Suspicious TLS Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Self-signed certificates','Legitimate sites paid certificates use karti hain, malware nahi karta'],['Unknown domains in SNI','Suspicious ya recently registered domains'],['Repeated TLS sessions','Fixed intervals par same destination se reconnect'],['Fixed interval reconnects','Exactly same time gap = automated malware behavior'],['Certificate mismatch','Domain aur certificate ka naam match nahi karta']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>20. RAT Traffic Analysis</h2>
      <div class="info-box"><p><strong>RAT = Remote Access Trojan.</strong> Attacker ko infected machine ka full remote control deta hai. Attacker screen dekh sakta hai, files access kar sakta hai, keystrokes capture kar sakta hai, commands run kar sakta hai.</p></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Continuous communication','RAT C2 se hamesha connected rehta hai, connection cut nahi hoti'],['Command polling','Regular intervals par commands check karta hai'],['File transfer activity','Files download ya upload kiye ja rahe hain'],['Screenshot uploads','Large periodic uploads screen captures hain'],['Keylogger data','Regular small POST requests typed data bhej rahe hain'],['Reverse shell traffic','Interactive commands aur responses visible hote hain']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>21. Typical RAT Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Victim','Machine infected hai RAT se'],['Connects to C2','RAT attacker ke server se connect hoti hai'],['Receives Commands','Attacker commands bhejta hai screenshot lo, files do'],['Executes Commands','RAT victim machine par commands execute karta hai'],['Returns Results','Output aur data C2 ko wapas bheja jaata hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0||i===4?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:10px 24px;text-align:center;width:260px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>22. Trojan Traffic Analysis</h2>
      <p>Trojan legitimate software ki tarah dikhta hai lekin background mein malicious kaam karta hai. Traffic pattern mein typically initial download, C2 connection setup, persistence, aur phir regular beaconing hoti hai.</p>
      <pre><code>Trojan infection traffic sequence:

1. Initial download
   HTTP GET /invoice-viewer.exe   (legitimate lagta hai)

2. C2 server contact
   DNS query: update-service.xyz
   TCP connection to 185.220.x.x:443

3. Persistence setup
   Malware registry ya startup mein khud ko add karta hai
   Traffic mein ye directly nahi dikhta

4. Regular beaconing
   TLS connection har 2 minutes mein
   Small check-in packets</code></pre>

      <h2>23. Staged Malware Infection</h2>
      <p>Modern sophisticated malware ek hi step mein nahi aata. Stages mein aata hai taaki detection se bachay. Pehle chhota downloader aata hai phir actual malware download hota hai.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Phishing Email','User ko deliver kiya jaata hai'],['DOCM File','Macro-enabled attachment open hoti hai'],['Downloader','Stage 1 chhota malware download hota hai'],['Malware Payload','Actual malware Stage 2 download hota hai'],['C2 Connection','Full malware C2 se connect ho jaata hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.25':i===4?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:10px 24px;text-align:center;width:250px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>24. Malware Download Detection</h2>
      <p>Malware aksar initial infection ke baad aur payloads download karta hai. HTTP traffic mein file downloads dhundhna investigators ka important task hai.</p>
      <pre><code>HTTP filter for downloads:
http.request.uri contains ".exe"
http.request.uri contains ".dll"
http.request.uri contains ".zip"
http.request.uri contains ".iso"

File export:
File  Export Objects  HTTP
Ye sab downloaded files PCAP se extract kar deta hai

Extracted files:
VirusTotal par upload karke check karo
SHA256 hash IOC list mein add karo</code></pre>

      <h2>25. Detecting Data Exfiltration</h2>
      <p>Data exfiltration detection ka matlab hai stolen data ki outbound journey track karna. Malware ne data collect kiya, ab wo use C2 ko bhejna chahta hai. Ye investigate karna zaroori hai kyunki isse pata chalta hai ki kya data gaya.</p>
      <pre><code>Exfiltration ke signs:

Large upload sessions
  Statistics  Conversations mein Bytes A-to-B dekho
  Jo host sabse zyada data bhej raha hai wo suspect

Unusual destinations
  Internal host unknown external IP ko data bhej raha hai

Repeated POST requests
  http.request.method == "POST"
  Baar baar POST = data trickle exfiltration

Long sessions
  Connection ghanton tak open rehti hai
  Slow aur steady exfiltration pattern</code></pre>

      <h2>26. Exfiltration Channels</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px;">
        ${[['HTTP','Port 80, POST requests mein data'],['HTTPS','Port 443, encrypted exfiltration'],['DNS','Subdomain mein data encode karke'],['FTP','File transfer protocol se'],['SMTP','Email ke through data bhejta hai'],['Custom protocol','Non-standard ports par custom protocol']].map(r=>`
        <div style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.22);border-radius:8px;padding:8px 14px;text-align:center;">
          <div style="font-family:'Rajdhani',monospace;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-top:3px;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>27. Malware Timeline Creation</h2>
      <p>Timeline malware investigation ka sabse important deliverable hai. Iske bina attack ka sequence samajhna mushkil hota hai.</p>
      <pre><code>Example Malware Timeline:

09:00:00  User ne invoice.docm attachment khola
09:00:12  DNS query: downloader-stage1.xyz
09:00:13  HTTP GET /loader.exe downloaded
09:00:45  DNS query: c2-server.ru (DGA-like domain)
09:00:46  TLS connection to c2-server.ru:443
09:01:00  First beaconing check-in (60s interval starts)
09:05:30  HTTP POST /gate.php (credentials upload, 12KB)
09:10:00  TLS large transfer (screenshot, 480KB)
09:60:00  Beaconing continues every 60 seconds</code></pre>

      <h2>28. IOC Extraction</h2>
      <p>IOC extraction malware analysis ka final step hai jahan se practically useful intelligence nikalta hai. Ye IOCs dusre systems ki protection mein use hote hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">IOC TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">VALUE FROM INVESTIGATION</span>
        </div>
        ${[['Domain','evil-c2.xyz, downloader-stage1.xyz, c2-server.ru'],['IP','123.123.123.123 (C2 server resolved IP)'],['URL','/loader.exe, /gate.php, /update (malware paths)'],['File Hash','SHA256 of extracted loader.exe file'],['User-Agent','Updater_v1 (malware HTTP identifier)'],['Port','Custom port used by malware e.g. 4444']].map(r=>`
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>29. Malware Traffic Investigation Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:0 0 28px;">
        ${[['Step 1','Infected host identify karo','Beaconing ya suspicious DNS wala host'],['Step 2','DNS analyze karo','DGA domains, repeated queries, failed resolutions'],['Step 3','HTTP traffic analyze karo','Downloads, POST requests, User-Agents'],['Step 4','TLS traffic analyze karo','SNI, certificates, timing patterns'],['Step 5','C2 identify karo','IP aur domain confirm karo VirusTotal se'],['Step 6','IOCs extract karo','Domains, IPs, URLs, hashes collect karo'],['Step 7','Timeline banao','Har event timestamp ke saath document karo']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'255,255,255,0.08':'220,20,20,0.15'});border-radius:10px;padding:10px 20px;width:320px;display:flex;align-items:center;gap:12px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[1]}</div><div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[2]}</div></div>
        </div>${i<a.length-1?'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin:2px 0;"><path d="M8 2v10M4 9l4 4 4-4" stroke="#333" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>30. Host Profiling Example</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">HOST</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">OBSERVATION</span>
        </div>
        ${[['192.168.1.5','Normal browsing, Google aur known sites, no suspicious DNS','#f4f4f5'],['192.168.1.20','Repeated TLS beaconing har 60s, self-signed cert, suspicious','#dc1414'],['192.168.1.30','Large uploads to unknown IP, POST requests with encoded data','#dc1414']].map(r=>`
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:${r[2]};">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>31. Useful Wireshark Filters</h2>
      <pre><code>DNS analysis:
dns

HTTP all traffic:
http

HTTP requests only:
http.request

POST requests (exfiltration):
http.request.method == "POST"

TLS traffic:
tls

SNI field:
tls.handshake.extensions_server_name

SYN packets (scanning):
tcp.flags.syn == 1 && tcp.flags.ack == 0

Specific IP:
ip.addr == 192.168.1.20

Specific destination port:
tcp.dstport == 4444</code></pre>

      <h2>32. Real Investigation Example</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Possible Malware Alert on 192.168.1.20</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert: "Suspicious traffic from workstation"<br>
          DNS: <span style="color:#dc1414;font-weight:600;">kx72jd91.net</span> query, DGA-like domain confirmed<br>
          TLS: Self-signed certificate, <span style="color:#dc1414;font-weight:600;">60-second beaconing</span> to 185.220.x.x<br>
          HTTP POST: <span style="color:#dc1414;font-weight:600;">/gate.php</span> ko 12KB data, credentials suspected<br>
          Large TLS: <span style="color:#dc1414;font-weight:600;">480KB upload</span> once per hour, screenshot pattern<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: RAT infection confirmed, C2 identified, IOCs extracted, machine isolated</span>
        </div>
      </div>

      <h2>33. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Har unknown domain ko malicious manna','Verify karo VirusTotal se, context dekho'],['Beaconing ignore karna','Fixed interval traffic strongest malware indicator hai'],['Timeline nahi banana','Bina sequence ke attack samajh nahi aata'],['Uploads ignore karna','Exfiltration sabse important finding hoti hai'],['IOCs extract nahi karna','Bina IOCs ke investigation incomplete hai'],['Single indicator pe conclusion dena','Multiple indicators correlate karke confirm karo']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>35. Practical Lab 1</h2>
      <p>Malware PCAP sample lo malware-traffic-analysis.net se aur infected host identify karo.</p>
      <pre><code>Step 1: Statistics  Protocol Hierarchy
Step 2: Statistics  Endpoints  unusual hosts dekho
Step 3: Kaunsa host DNS mein suspicious domains query kar raha hai
Step 4: Kaunsa host beaconing pattern show kar raha hai
Step 5: Host IP note karo, ye infected machine hai</code></pre>

      <h2>36. Practical Lab 2</h2>
      <p>DNS investigation karke suspicious domains list karo.</p>
      <pre><code>Filter: dns

Karo ye kaam:
NXDOMAIN responses dhundho
Random-looking domain names list karo
Same domain ki repetition count karo
Long subdomain strings identify karo
Domains ko VirusTotal par verify karo</code></pre>

      <h2>37. Practical Lab 3</h2>
      <p>POST request analysis karke data uploads dhundho.</p>
      <pre><code>Filter: http.request.method == "POST"

Analyze karo:
Destination URL kya hai
POST body size kitna hai
Content-Type header kya hai
Kitni baar POST ho rahi hai

Follow TCP Stream se body content dekho
Base64 encoded data decode karke padho</code></pre>

      <h2>38. Practical Lab 4</h2>
      <p>TLS traffic analyze karke beaconing aur unknown destinations identify karo.</p>
      <pre><code>Filter: tls

Karo ye kaam:
SNI fields collect karo sabhi connections ke
Timing dekho fixed intervals ke liye
Self-signed certificates dhundho
Unknown domains list karo
Traffic volume pattern analyze karo</code></pre>

      <h2>39. Skills to Master</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['C2 Detection','Beaconing patterns, C2 IPs aur domains identify karna'],['Beaconing Analysis','Fixed interval traffic detect karna, timing measure karna'],['Malware Timelines','Attack sequence reconstruct karna timestamps ke saath'],['IOC Extraction','Domains, IPs, URLs, hashes systematically collect karna'],['DNS Investigation','DGA detection, DNS tunneling, repeated queries analyze karna'],['HTTP/TLS Investigation','User-Agent analysis, POST requests, SNI checking'],['Host Profiling','Har suspect host ki activity document karna'],['Evidence Correlation','Multiple findings combine karke complete story banana']].map(r=>`
        <div style="display:grid;grid-template-columns:180px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>40. Part 11 Complete</h2>

      <!-- PART COMPLETE BANNER -->
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.3);border-radius:14px;padding:28px 24px;margin:0 0 28px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;right:0;width:180px;height:180px;background:radial-gradient(circle,rgba(220,20,20,0.07) 0%,transparent 70%);pointer-events:none;"></div>

        <!-- Shield SVG sticker -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          <div style="flex-shrink:0;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L8 10v14c0 10 7.2 18.6 16 21 8.8-2.4 16-11 16-21V10L24 4z" fill="rgba(220,20,20,0.15)" stroke="#dc1414" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M16 24l5 5 11-11" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 11 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Malware Traffic Analysis</div>
          </div>
        </div>

        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;margin-bottom:0;">Ab tum sirf network traffic nahi dekh rahe, tum malware ki bhasha padhna seekh gaye ho. Beaconing, DGA domains, C2 communication, RAT behavior aur data exfiltration tumhare liye ab unknown nahi hain.</p>
      </div>

      <!-- WHAT'S NEXT -->
      <div style="background:#0e0e13;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 22px;margin:0 0 28px;display:flex;align-items:flex-start;gap:14px;">
        <div style="flex-shrink:0;margin-top:2px;">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="30" height="30" rx="8" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.25)" stroke-width="1.2"/>
            <path d="M11 16h10M18 13l3 3-3 3" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;margin-bottom:6px;letter-spacing:0.5px;">Aage kya aayega</div>
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 12 mein IDS aur IPS ka deep analysis karenge. Snort aur Suricata ke rules samjhenge, alert analysis karenge aur real-world intrusion detection workflows sikhenge. Ye knowledge Part 11 ke saath mila ke tumhe ek complete defender banayegi.</p>
        </div>
      </div>

      <!-- PRACTICE ACTIONS -->
      <div class="info-box">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="16" height="16" rx="5" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/>
            <path d="M5 9l3 3 5-5" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;letter-spacing:0.5px;">Part 11 ke baad ye zaroor karo</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            ['malware-traffic-analysis.net se ek free PCAP lo aur infected host identify karo','<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'],
            ['Filter: dns lagao aur DGA-like domains dhundho','<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'],
            ['Filter: http.request.method == "POST" lagao aur uploads dekho','<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'],
            ['TLS traffic mein SNI fields collect karo aur timing pattern analyze karo','<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'],
            ['Ek IOC collection sheet banao sab findings ke saath','<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'],
            ['Kisi bhi suspicious domain ko VirusTotal par verify karo','<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>']
          ].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;">${r[1]}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[0]}</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- MINI ASSIGNMENT -->
      <div class="info-box">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7.5" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/>
            <path d="M9 6v4M9 12v.5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;letter-spacing:0.5px;">Mini Assignment</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            'C2 server kya hota hai?',
            'Beaconing kyun important indicator hai?',
            'DGA kya hai?',
            'Malware POST requests kyun use kar sakta hai?',
            'IOC extraction kyun zaroori hai?'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
