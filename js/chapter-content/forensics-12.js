// Extracted from js/chapters.js — Network Forensics course, chapter index 12.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent12 = `

      <h2>1. What is Log Correlation?</h2>
      <p>Log Correlation ka matlab hai alag-alag sources ke logs ko jodkar ek complete incident story banana. Single log aksar poori kahani nahi batata.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Firewall Log','Allowed/blocked connections'],['DNS Log','Domain queries'],['Proxy Log','Web activity'],['Authentication Log','Login events'],['PCAP','Raw traffic evidence']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===4?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:10px 24px;text-align:center;width:260px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
        <div style="margin-top:8px;background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.3);border-radius:10px;padding:10px 32px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">Complete Investigation</div>
        </div>
      </div>

      <h2>2. Why Log Correlation is Important?</h2>
      <p>Suppose karo ek alert aaya. Alag-alag logs mein pieces bikhari hain. Correlation se poori attack chain dikhne lagti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Firewall','Connection Allowed','#888'],['DNS','evil-domain.xyz resolved','#dc1414'],['Proxy','payload.exe downloaded','#dc1414'],['Auth Log','New login detected','#dc1414']].map(r=>`
        <div style="display:grid;grid-template-columns:110px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <code style="font-family:'Rajdhani',monospace;font-size:12px;color:${r[2]};">${r[1]}</code>
        </div>`).join('')}
      </div>

      <h2>3. Common Log Sources</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">LOG TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">PURPOSE</span>
        </div>
        ${[['Firewall Logs','Allowed/Blocked traffic'],['DNS Logs','Domain activity'],['Proxy Logs','Web activity'],['VPN Logs','Remote access'],['Authentication Logs','Login events'],['Web Server Logs','Website activity'],['IDS Logs','Security alerts'],['Endpoint Logs','Host events']].map((r,i)=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:8px;border:1px solid rgba(${i%2===0?'220,20,20,0.15':'255,255,255,0.05'});padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>4. What is a Log?</h2>
      <div class="info-box"><p><strong>A log is a recorded event.</strong> Har system apni activities record karta hai aur har connection, har login, har error ek log entry ban jaati hai.</p></div>
      <pre><code>2026-05-30 10:00:01  User Login Success</code></pre>

      <h2>5. Log Components</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">FIELD</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">MEANING</span>
        </div>
        ${[['Timestamp','Time of event'],['Source IP','Origin of connection'],['Destination IP','Target of connection'],['User','Account involved'],['Event Type','Action performed'],['Status','Success or Fail']].map(r=>`
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>6. Timestamps are Everything</h2>
      <p>Bina timestamps ke investigation almost impossible ho jaati hai. Timestamps se attack ka sequence samajh aata hai.</p>
      <pre><code>10:01  DNS Query
10:02  Download
10:03  Execution
10:05  Beaconing Started</code></pre>
      <div class="info-box"><p><strong>Ye ek timeline hai.</strong> Har event ka time pata ho toh attack reconstruct ho sakta hai.</p></div>

      <h2>7. Firewall Logs</h2>
      <p>Firewall har allowed aur blocked connection record karta hai. Investigator ke liye ye sabse pehla stop hota hai.</p>
      <pre><code>ALLOW  192.168.1.10  -->  8.8.8.8  Port 53
BLOCK  192.168.1.20  -->  185.220.1.1  Port 4444</code></pre>

      <h2>8. What Investigators Look For in Firewall Logs?</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Unknown external IPs','Unrecognized destinations especially unusual geolocations'],['Unusual ports','Non-standard ports like 4444, 1337, 31337'],['Large outbound traffic','Unexpected data leaving the network'],['Repeated connections','Same destination baar baar contact hona']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>9. DNS Logs</h2>
      <p>DNS logs record karte hain ki kaunsi machine ne kaunse domain query kiye. Malware aksar DNS se hi shuru karta hai.</p>
      <pre><code>192.168.1.10  queried  example.com       --> NOERROR
192.168.1.20  queried  kx72jds91.xyz     --> NOERROR
192.168.1.20  queried  evil-domain.com   --> NXDOMAIN</code></pre>

      <h2>10. DNS Log Investigation</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Which domains were queried?','Sabhi queried domains list karo'],['Any suspicious domains?','Random-looking ya unusual TLDs wale'],['Any DGA patterns?','Short random strings like abc82js.net'],['Any DNS tunneling?','Long subdomains ya high frequency queries']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>11. Proxy Logs</h2>
      <p>Proxy logs web browsing activity record karte hain jisme kaunsi sites visit ki, kya download hua, kaunse URLs access kiye.</p>
      <pre><code>User: alex
Time: 10:01:22
Visited: http://malicious-site.xyz/payload.exe
Size: 2.4MB  Status: 200 OK</code></pre>

      <h2>12. Why Proxy Logs Are Valuable?</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Malware downloads','Kaunsa file download hua aur kahan se'],['Phishing sites','Credential harvesting pages ki visits'],['Data uploads','POST requests se data exfiltration detect karna']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>13. Authentication Logs</h2>
      <p>Authentication logs har login attempt record karte hain chahe successful ho ya fail. Insider threats aur brute force attacks yahan dikhai dete hain.</p>
      <pre><code>2026-05-30 02:14:33  User: admin  Status: FAILED
2026-05-30 02:14:35  User: admin  Status: FAILED
2026-05-30 02:14:40  User: admin  Status: SUCCESS</code></pre>

      <h2>14. Authentication Investigation</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Multiple failures','Brute force attack ka strongest indicator'],['Impossible travel','Same user ek saath do alag countries se login'],['New devices','User ki machine se alag device se login'],['After-hours logins','Raat 3 baje login, suspicious']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>15. VPN Logs</h2>
      <p>VPN logs remote access connections record karte hain. Insider threats aur unauthorized remote access investigations mein critical hote hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['VPN connections','Kab kaunse user ne connect kiya'],['Usernames','Account jo VPN use kar raha hai'],['Source IPs','Kahan se connect kiya'],['Connection times','Duration aur timing']].map(r=>`
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>16. IDS Logs</h2>
      <p>IDS logs Snort aur Suricata jaise tools generate karte hain. Ye alerts automatically trigger hote hain jab known attack patterns match karte hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Alert name','Kaunsa rule trigger hua'],['Source IP','Attack kahan se aaya'],['Destination IP','Target kya tha'],['Severity','Critical, High, Medium, Low']].map(r=>`
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>17. Web Server Logs</h2>
      <p>Web server logs website par aane wali requests record karte hain. Web attacks aur exploitation attempts yahan clearly dikhai dete hain.</p>
      <pre><code>GET  /login.php         200  Mozilla/5.0
POST /admin/upload.php  200  Python-requests/2.28
GET  /etc/passwd        404  curl/7.81</code></pre>

      <h2>18. Endpoint Logs</h2>
      <p>Endpoint logs seedha host machines se collect hote hain. Process execution, file changes aur user actions sab record hote hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Windows Event Logs','Security, System, Application events'],['Linux Syslogs','/var/log/auth.log, syslog, messages'],['Process Execution','Kaunsa program kab chala'],['File Activity','Files create, modify, delete']].map(r=>`
        <div style="display:grid;grid-template-columns:180px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>19. What is Correlation?</h2>
      <p>Correlation ka matlab hai alag sources se aaye events ko time aur shared fields ke zariye jodna. Akele koi bhi log poori picture nahi deta.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['DNS Log: 10:00  evil.com queried','#888'],['Proxy Log: 10:01  payload.exe downloaded','#dc1414'],['Endpoint Log: 10:02  payload.exe executed','#dc1414'],['IDS Alert: 10:05  Malware Beacon Detected','#dc1414']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'255,255,255,0.06':'220,20,20,0.25'});border-radius:10px;padding:10px 20px;width:300px;text-align:center;">
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:${r[1]};">${r[0]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
        <div style="margin-top:8px;background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.3);border-radius:10px;padding:10px 32px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">Full Attack Chain Visible</div>
        </div>
      </div>

      <h2>20. Correlation Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Collect Logs','Sabhi sources se logs gather karo'],['Normalize','Common format mein convert karo'],['Sort by Time','Chronological order mein arrange karo'],['Link Events','Shared IPs, users, domains se jodo'],['Build Timeline','Complete attack sequence reconstruct karo']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===4?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:10px 24px;text-align:center;width:260px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>21. Event Normalization</h2>
      <p>Alag-alag log sources alag formats mein hoti hain. Normalization se sab ek consistent format mein aa jaate hain taaki comparison aur correlation possible ho.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Firewall field','SrcIP'],['DNS field','ClientIP'],['Normalized','Source_IP']].map((r,i)=>`
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;background:${i===2?'rgba(220,20,20,0.08)':'#0e0e12'};border-radius:8px;border:1px solid rgba(${i===2?'220,20,20,0.25':'255,255,255,0.05'});padding:10px 16px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;color:${i===2?'#dc1414':'#666'};">${r[0]}</span>
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:${i===2?'#f4f4f5':'#aaa'};">${r[1]}</code>
        </div>`).join('')}
      </div>

      <h2>22. IOC Correlation</h2>
      <p>IOC = Indicator of Compromise. Jab ek IOC multiple sources mein milta hai toh woh strong evidence ban jaata hai.</p>
      <div class="info-box"><p><strong>Example:</strong> Domain <code style="color:#dc1414;">evil-domain.xyz</code> DNS logs mein bhi hai, Proxy logs mein bhi aur IDS alert mein bhi. Ye confirmed IOC hai.</p></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Domains','evil-domain.xyz, dga-abc123.net'],['IPs','185.220.1.1, 45.33.32.156'],['URLs','/gate.php, /payload.exe'],['Hashes','MD5, SHA256 of malware files']].map(r=>`
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <code style="font-family:'Rajdhani',monospace;font-size:12px;color:#aaa;">${r[1]}</code>
        </div>`).join('')}
      </div>

      <h2>23. Multi-Source Investigation</h2>
      <div class="info-box"><p><strong>Rule:</strong> Kabhi ek source par rely mat karo. Jitne zyada sources correlate hote hain, utna confident conclusion hota hai.</p></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['PCAP','Raw packet evidence'],['DNS','Domain resolution activity'],['Firewall','Connection allow/block decisions'],['Proxy','Web requests and downloads'],['Endpoint','Host-level process and file activity']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>24. Timeline Fusion</h2>
      <p>Sabhi sources ke events ko ek unified timeline mein merge karo. Ye attack ka poora sequence dikhata hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">TIME</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">EVENT</span>
        </div>
        ${[['10:00','DNS Query for evil-domain.xyz'],['10:01','payload.exe File Download via Proxy'],['10:02','payload.exe Execution on Endpoint'],['10:03','TLS Connection to C2 Server'],['10:04','Beaconing Started  every 60 seconds']].map((r,i)=>`
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;background:${i>=2?'rgba(220,20,20,0.07)':'#0e0e12'};border-radius:8px;border:1px solid rgba(${i>=2?'220,20,20,0.2':'255,255,255,0.05'});padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>25. Why Timeline Fusion Works?</h2>
      <div class="info-box"><p>Attackers akele kisi ek system par kaam nahi karte. Har step kisi na kisi log mein record hota hai. Timeline fusion un sab traces ko ek saath dikhaata hai, isliye attackers escape nahi kar paate.</p></div>

      <h2>26. Identifying Patient Zero</h2>
      <p>Patient Zero = Pehla infected host. Investigation ka ek major goal hota hai patient zero identify karna kyunki wahi infection ka starting point hota hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Malicious domain first contact karne wala','DNS logs mein timestamps compare karo'],['Malware pehle download karne wala','Proxy logs mein earliest download dhundho'],['Pehle beacon karne wala','Firewall/PCAP mein earliest C2 connection']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>27. Lateral Movement Detection</h2>
      <p>Jab ek machine compromise hoti hai toh malware ya attacker dusri internal machines par bhi jaane ki koshish karta hai. Ise Lateral Movement kehte hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Many internal connections','Ek machine bahut saari internal IPs ko target kar rahi hai'],['New SMB traffic','Unexpected Windows file sharing activity'],['Admin logins','Administrative accounts ka unusual use']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>28. Detecting Brute Force</h2>
      <p>Authentication logs mein brute force sabse clearly dikhta hai. Ek ke baad ek failed logins, aur phir success.</p>
      <pre><code>02:14:33  admin  FAILED
02:14:35  admin  FAILED
02:14:37  admin  FAILED
02:14:39  admin  FAILED
02:14:42  admin  SUCCESS  &lt;-- Attacker in</code></pre>
      <div class="info-box"><p><strong>Ye pattern brute force ka strongest indicator hai.</strong> Especially raat ke waqt ya after-hours.</p></div>

      <h2>29. Detecting Data Exfiltration</h2>
      <p>Data exfiltration aksar multiple logs mein ek saath dikhti hai. Correlation se clearly confirm hoti hai.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['DNS: unknown-domain.com queried','#888'],['Firewall: large outbound transfer allowed','#dc1414'],['Proxy: POST request to unknown host','#dc1414']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'255,255,255,0.06':'220,20,20,0.25'});border-radius:10px;padding:10px 24px;width:290px;text-align:center;">
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:${r[1]};">${r[0]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
        <div style="margin-top:8px;background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.3);border-radius:10px;padding:10px 32px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">Possible Exfiltration Confirmed</div>
        </div>
      </div>

      <h2>30. Real Investigation Example</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Possible Malware Alert</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert: "Possible malware on workstation"<br>
          DNS: <span style="color:#dc1414;font-weight:600;">abc82js.net</span> query, DGA-like pattern<br>
          Proxy: <span style="color:#dc1414;font-weight:600;">payload.exe downloaded</span> from same domain<br>
          Endpoint: <span style="color:#dc1414;font-weight:600;">payload.exe executed</span> at 10:02<br>
          IDS: <span style="color:#dc1414;font-weight:600;">Beacon Detected</span>, 60-second intervals<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Confirmed malware infection, C2 identified, host isolated</span>
        </div>
      </div>

      <h2>31. Common Correlation Keys</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Timestamp','Events ko time se link karo'],['IP Address','Sabse common correlation field'],['Domain','DNS, Proxy, IDS mein common'],['Username','Authentication aur endpoint logs'],['Hostname','Machine identify karne ke liye'],['Hash','Same file across multiple logs']].map(r=>`
        <div style="display:grid;grid-template-columns:120px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>32. Challenges in Correlation</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Missing logs','Kuch systems logging enable nahi karte'],['Different time zones','UTC vs local time mismatch'],['Incorrect timestamps','System clocks out of sync'],['Log retention issues','Old logs delete ho chuke hain']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>33. Time Synchronization</h2>
      <div class="info-box"><p><strong>NTP = Network Time Protocol.</strong> Sabhi systems ek centralized time server se sync hone chahiye. Agar timestamps mismatch karein toh timeline breaks ho jaati hai aur investigation fail hoti hai.</p></div>
      <pre><code>Without NTP:
Firewall says: 10:00  but  DNS says: 09:55  (5 min drift)
Timeline becomes unreliable

With NTP:
All systems report 10:00 exactly
Perfect correlation possible</code></pre>

      <h2>34. Investigative Questions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['WHO?','Kaunsa user ya host involved hai?'],['WHAT?','Exactly kya activity hui?'],['WHEN?','Exact timestamp kya hai?'],['WHERE?','Destination kahan tha?'],['HOW?','Attack method kya tha?'],['WHY?','Attacker ka objective kya tha?']].map(r=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>35. Practical Lab 1</h2>
      <p>DNS log aur Firewall log lo. IP address aur time ke zariye correlate karo aur dekho kaunsi machine suspicious domain par gayi aur connection allowed hua ya block.</p>
      <pre><code>Step 1: DNS log mein suspicious domains list karo
Step 2: Un domains ki client IPs note karo
Step 3: Firewall log mein same IPs dhundho
Step 4: Connection allow tha ya block?
Step 5: Timeline banao: kab query, kab connection</code></pre>

      <h2>36. Practical Lab 2</h2>
      <p>Multiple log sources se top IOCs identify karo.</p>
      <pre><code>Top domains:     DNS log mein most queried
Top IPs:         Firewall log mein most contacted
Failed logins:   Auth log mein FAILED status filter karo

Correlate: Koi IP jo teeno mein hai?</code></pre>

      <h2>37. Practical Lab 3</h2>
      <p>Ek complete attack timeline reconstruct karo.</p>
      <pre><code>Step 1: DNS log -- malicious domain query time note karo
Step 2: Proxy log -- download time note karo
Step 3: Endpoint log -- execution time note karo
Step 4: IDS log -- beacon alert time note karo

Timeline:
[DNS Query] --> [Download] --> [Execution] --> [Beacon]</code></pre>

      <h2>38. Practical Lab 4</h2>
      <p>Multiple log sources se Patient Zero identify karo.</p>
      <pre><code>Step 1: DNS logs -- pehla malicious domain query karne wala IP
Step 2: Proxy logs -- pehla download karne wala user
Step 3: Endpoint logs -- pehla execution

Earliest event wali machine = Patient Zero</code></pre>

      <h2>39. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Sirf ek log dekhna','Single source se incomplete picture milti hai'],['Timestamps ignore karna','Bina time ke correlation impossible hai'],['Logs normalize nahi karna','Alag formats mein comparison nahi ho sakta'],['Usernames ignore karna','User-based attacks miss ho jaate hain'],['Hostnames ignore karna','Machine identification fail ho jaati hai']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>40. Investigator Mindset</h2>
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:24px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.4"/><path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="16" r="2" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">Sahi Sawaal Poochho</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:14px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc6060;letter-spacing:2px;margin-bottom:6px;">GALAT SAWAAL</div>
            <div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;font-style:italic;">"Ye log kya keh raha hai?"</div>
          </div>
          <div style="background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.3);padding:14px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:6px;">SAHI SAWAAL</div>
            <div style="font-family:'Inter',sans-serif;font-size:12px;color:#f4f4f5;font-weight:500;">"Ye log baaki sabse kaise connect hota hai?"</div>
          </div>
        </div>
      </div>

      <h2>41. Skills to Master</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Firewall Logs','Allowed/blocked traffic analysis'],['DNS Logs','Domain investigation aur DGA detection'],['Proxy Logs','Web activity aur download analysis'],['Authentication Logs','Brute force aur impossible travel'],['IOC Correlation','Indicators across multiple sources'],['Timeline Fusion','Multi-source chronological reconstruction'],['Patient Zero Detection','First infected host identification'],['Multi-Source Investigation','Never rely on one source']].map(r=>`
        <div style="display:grid;grid-template-columns:200px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <!-- PART COMPLETE BANNER -->
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.3);border-radius:14px;padding:28px 24px;margin:0 0 28px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;right:0;width:180px;height:180px;background:radial-gradient(circle,rgba(220,20,20,0.07) 0%,transparent 70%);pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          <div style="flex-shrink:0;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L8 10v14c0 10 7.2 18.6 16 21 8.8-2.4 16-11 16-21V10L24 4z" fill="rgba(220,20,20,0.15)" stroke="#dc1414" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M16 24l5 5 11-11" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 13 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Log Correlation & Multi-Source Investigation</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">Ab tum raw logs ko sirf read nahi karte. Ab tum unhe correlate karke poori attack story reconstruct karte ho. Firewall, DNS, Proxy, Auth, Endpoint sab ek saath mila ke tumhare paas complete evidence hota hai.</p>
      </div>

      <!-- WHAT'S NEXT -->
      <div style="background:#0e0e13;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 22px;margin:0 0 28px;display:flex;align-items:flex-start;gap:14px;">
        <div style="flex-shrink:0;margin-top:2px;">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="8" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.25)" stroke-width="1.2"/>
            <path d="M11 16h10M18 13l3 3-3 3" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;margin-bottom:6px;letter-spacing:0.5px;">Aage kya aayega</div>
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 14 mein Threat Hunting aur Network Hunting Methodology seekhenge. Hypothesis-driven hunting, DNS/TLS/PCAP se hunting, MITRE ATT&amp;CK usage aur advanced hunting workflows. Sab Part 14 mein.</p>
        </div>
      </div>

      <!-- PRACTICE ACTIONS -->
      <div class="info-box">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="16" height="16" rx="5" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/>
            <path d="M5 9l3 3 5-5" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;letter-spacing:0.5px;">Part 13 ke baad ye zaroor karo</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            'DNS log aur Firewall log ko IP se correlate karo',
            'Authentication log mein multiple failed logins dhundho',
            'Proxy log mein POST requests filter karo',
            'Ek complete attack timeline banao: DNS se beacon tak',
            'Patient Zero identify karo timestamps compare karke',
            'Ek IOC list banao: domains, IPs, hashes'
          ].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- MINI ASSIGNMENT -->
      <div class="info-box">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/>
            <path d="M9 6v4M9 12v.5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;letter-spacing:0.5px;">Mini Assignment</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            'Log Correlation kya hai?',
            'Timeline Fusion kyun important hai?',
            'Patient Zero kya hota hai?',
            'IOC Correlation kya hai?',
            'Authentication logs mein brute force kaise detect karte hain?'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
