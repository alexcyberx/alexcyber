// Extracted from js/chapters.js — Network Forensics course, chapter index 13.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent13 = `

      <h2>1. Threat Hunting kya hai?</h2>
      <p>Threat Hunting ka matlab hai network, logs, endpoints aur traffic mein proactively hidden attackers ya malware ko dhundhna bhale hi koi alert generate na hua ho. Ye reactive nahi, balki ek intentional, hypothesis-driven search hai.</p>

      <h2>2. Threat Hunting vs Incident Response</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#888;letter-spacing:2px;margin-bottom:10px;">INCIDENT RESPONSE</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.8;">Alert ke baad investigate karna. Kuch hua tab jaana.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.25);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:10px;">THREAT HUNTING</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.8;">Alert se pehle hunt karna. Khud evidence dhundhna.</div>
        </div>
      </div>

      <h2>3. Threat Hunting kyun zaruri hai?</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Har attack IDS detect nahi karta','Attackers advanced evasion use karte hain'],['Har malware ki signature nahi hoti','Unknown threats rule-based systems se bachte hain'],['Attackers detection avoid karte hain','Fileless, living-off-the-land techniques common hain']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.18);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.3"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>4. Hunter Mindset</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:#0e0e12;border-radius:10px;border:1px solid rgba(255,255,255,0.05);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#555;letter-spacing:2px;margin-bottom:10px;">SOC ANALYST</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#666;font-style:italic;line-height:1.7;">"Alert kya keh raha hai?"</div>
        </div>
        <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.3);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:10px;">THREAT HUNTER</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#f4f4f5;line-height:1.7;">"Koi attacker hai jo abhi tak detect nahi hua?"</div>
        </div>
      </div>

      <h2>5. Hunting Goals</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Hidden malware find karna','Already compromised systems identify karo'],['Lateral movement detect karna','Attacker ka internal movement pakdo'],['Persistence detect karna','Backdoors aur scheduled tasks dhundho'],['C2 communication identify karna','Malware ka server connection pakdo'],['Insider threats detect karna','Internal misuse identify karo']].map((r,i)=>`
        <div style="display:grid;grid-template-columns:28px 1fr;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 6px;text-align:center;">${i+1}</span>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>6. Hunting Process Overview</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Hypothesis','Assumption banao kya ho sakta hai'],['Data Collect','Relevant sources gather karo'],['Evidence Search','Indicators dhundho'],['Validate Findings','Evidence confirm karo'],['Create Detection','Automated rule banao'],['Report','Document aur share karo']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 28px;width:300px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>7. Hypothesis kya hoti hai?</h2>
      <p>Threat hunt hamesha ek hypothesis se shuru hoti hai. Ye ek educated assumption hai ki kya ho sakta hai, jiske baad hunter evidence dhundhta hai.</p>
      <pre><code>Example Hypothesis:
Koi host hidden C2 server se communicate kar raha hai.</code></pre>
      <div class="info-box"><p><strong>Hypothesis ke baad:</strong> Ab hunter DNS, TLS, PCAP, aur logs mein us assumption ko prove ya disprove karne ki koshish karta hai.</p></div>

      <h2>8. Types of Threat Hunting</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['IOC Based','Known indicators jaise domains, IPs, hashes pe hunt karo'],['TTP Based','Attacker behavior pe hunt karo, technique-level'],['Anomaly Based','Unusual ya rare activity pe focus karo']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i===0?'220,20,20,0.2':i===1?'255,255,255,0.06':'255,255,255,0.04'});box-shadow:0 4px 20px rgba(0,0,0,0.3);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. IOC-Based Hunting</h2>
      <p>Known indicators ke basis pe search karo. Ye sabse direct hunting method hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Domains','Malicious ya suspicious domain names'],['IP Addresses','Known attacker infrastructure'],['URLs','Specific malicious links'],['File Hashes','Known malware files']].map(r=>`
        <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>
      <pre><code>IOC Example:
evil-domain.xyz
Sab systems find karo jinhone is domain ko contact kiya.</code></pre>

      <h2>10. TTP-Based Hunting</h2>
      <p>TTP matlab Tactics, Techniques aur Procedures. Ye attacker behavior pe focus karta hai, specific IOC pe nahi. Zyada advanced aur effective method hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['DNS Tunneling','DNS protocol mein data chhupana'],['Beaconing','Regular interval par C2 se check-in'],['PowerShell Abuse','Malicious scripts execute karna'],['Lateral Movement','Internal network mein move karna']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" style="flex-shrink:0;"><circle cx="3" cy="3" r="3" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>11. Anomaly-Based Hunting</h2>
      <p>Normal behavior se alag kuch bhi hunt karo. Baseline pata hona chahiye tabhi anomaly identify hogi.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Bahut zyada DNS requests','Normal host itne queries nahi karta'],['Large outbound uploads','Data exfiltration ka sign'],['Unusual login times','Raat ko ya off-hours logins'],['Rare protocols','Uncommon ports ya protocols ka use']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.15);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M8 1l7 13H1L8 1z" stroke="#dc1414" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6v4M8 12v.5" stroke="#dc1414" stroke-width="1.3" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>12. MITRE ATT&amp;CK Framework</h2>
      <p>MITRE ATT&amp;CK ek comprehensive database hai real-world attacker techniques ka. Threat hunters isko map karte hain apni findings ke saath.</p>
      <div class="info-box"><p><strong>MITRE ATT&amp;CK kya karta hai:</strong> Observed activity ko known attacker technique se link karta hai, phir us technique ko specific threat actors se connect karta hai.</p></div>

      <h2>13. ATT&amp;CK Techniques Examples</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['T1566','Phishing initial access technique'],['T1055','Process Injection stealth execution'],['T1071','Application Layer Protocol C2 communication'],['T1021','Remote Services lateral movement'],['T1041','Exfiltration Over C2 Channel']].map(r=>`
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>14. ATT&amp;CK Mapping Flow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Observed Activity','Kya dikh raha hai network mein','#888'],['ATT&amp;CK Technique','Known technique se match karo','#aaa'],['Threat Actor Behavior','Specific group ki TTP se compare karo','#dc1414']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===2?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 28px;width:300px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${r[2]};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>15. Network Hunting Data Sources</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['PCAPs','Raw packet captures sabse detailed source'],['DNS Logs','Domain queries gold mine for hunters'],['Firewall Logs','Allowed aur blocked connections'],['Proxy Logs','Web traffic aur HTTP requests'],['TLS Logs','Certificate aur SNI information'],['IDS Alerts','Detection system ki findings'],['Endpoint Logs','Host-level activity aur process data']].map(r=>`
        <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>16. DNS Hunting</h2>
      <p>DNS hunting sabse valuable hunting method hai. Lagbhag har malware, C2 communication aur exfiltration DNS se guzarti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Strange domains?','Normal nahi dikhne wale domain names'],['DGA domains?','Algorithm-generated random names'],['Excessive DNS?','Unusually high query volume'],['TXT record abuse?','Data chhupane ke liye TXT fields']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" style="flex-shrink:0;"><circle cx="3" cy="3" r="3" fill="#dc1414"/></svg>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:11px;color:#555;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>17. DGA Domain Hunting</h2>
      <p>DGA Domain Generation Algorithm. Malware automatically random domains generate karta hai C2 ke liye detection se bachne ke waste.</p>
      <pre><code>DGA Examples:
kx82js91.com
qjx72ksa.net
xm29ska82.org

Indicators:
Random character patterns
Bahut saare failed DNS resolutions (NXDOMAIN)
High entropy domain names</code></pre>

      <h2>18. DNS Tunneling Hunting</h2>
      <p>Advanced exfiltration technique jisme data DNS queries ke andar encode ho ke bahar jaata hai.</p>
      <pre><code>Example:
verylongbase64data.hidden.attacker.com

Indicators:
Extremely long query names
TXT record queries ka zyada use
Unusually high DNS frequency
Unusual subdomains pattern</code></pre>

      <h2>19. TLS Hunting</h2>
      <p>Modern malware TLS use karta hai communication hide karne ke liye. Payload decrypt nahi hota lekin TLS metadata bahut kuch batata hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SNI','Server Name Indication kaunse domain se connect ho raha hai'],['Certificates','Self-signed ya unknown issuer suspicious hote hain'],['JA3','TLS client fingerprint malware identify karne ke liye'],['Timing','Connection interval aur duration patterns']].map(r=>`
        <div style="display:grid;grid-template-columns:110px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>20. Suspicious TLS Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Self-signed certificates','Legitimate services rarely use these'],['Unknown certificate issuers','Not trusted CA se signed'],['Rare or new domains','Young domain age with TLS traffic'],['Repeated connections same host','Beaconing pattern']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.15);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.3"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>21. Beaconing Hunt</h2>
      <p>Beaconing sabse common malware behavior hai. Malware regularly apne C2 server ko check-in karta hai fixed intervals par.</p>
      <pre><code>Pattern Example:
10:00:00  →  attacker.com
10:01:00  →  attacker.com
10:02:00  →  attacker.com
10:03:00  →  attacker.com

Every 60 seconds same destination yahi beaconing hai.</code></pre>

      <h2>22. Beaconing Characteristics</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Fixed Interval','60 sec, 120 sec, 300 sec regular pattern'],['Same Destination','Ek hi IP ya domain pe repeated connections'],['Similar Packet Size','Har connection mein similar data size'],['Consistent Timing','Time-of-day pattern bhi hota hai']].map(r=>`
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>23. HTTP Hunting</h2>
      <p>HTTP traffic mein hunter in cheezein dhundhta hai:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Strange User-Agents','Malware custom agents use karta hai'],['Frequent POST requests','Regular intervals par data bheja ja raha hai'],['Unknown destinations','Unrecognized domains pe connections'],['Encoded data','Base64 ya obfuscated content in requests']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="none" style="flex-shrink:0;"><circle cx="3" cy="3" r="3" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:4px;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>24. User-Agent Hunting</h2>
      <pre><code>Normal Browser Agent:
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

Suspicious Agents:
UpdaterBot
CustomAgent/1.0
python-requests/2.28.0</code></pre>
      <div class="info-box"><p><strong>Kyun important hai:</strong> Malware aur custom tools aksar generic ya fake User-Agents set karte hain jo normal browsers se clearly alag hote hain.</p></div>

      <h2>25. Large Upload Hunting</h2>
      <p>Kaunsa host sabse zyada data bahar bhej raha hai? Ye data exfiltration ka strong indicator hai. Hunter ye sawaal poochta hai:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Kaunsa host sabse zyada upload kar raha hai?'],['Upload destination kahan hai?'],['Kya ye expected business traffic hai?'],['Transfer kis time hua?']].map((q,i)=>`
        <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
          <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 6px;">Q${i+1}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
        </div>`).join('')}
      </div>

      <h2>26. Authentication Hunting</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Multiple failures','Brute force ya credential stuffing'],['Success after many failures','Attacker successfully logged in'],['New location login','Impossible travel geographically impossible'],['New device login','Unfamiliar device accessing account']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.15);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M8 1l7 13H1L8 1z" stroke="#dc1414" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6v4M8 12v.5" stroke="#dc1414" stroke-width="1.3" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>27. Lateral Movement Hunting</h2>
      <p>Jab attacker ek machine compromise karta hai, woh internal network mein aage badhta hai. Ise Lateral Movement kehte hain. Hunter in indicators ko dhundhta hai:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['New SMB connections','Unexpected Windows file sharing activity'],['Admin account usage','Privileged accounts ka unusual use'],['Many internal connections','Ek host bahut saari internal machines ko target kar raha hai'],['PsExec ya remote tools','Remote execution indicators']].map(r=>`
        <div style="display:grid;grid-template-columns:220px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>28. Port Scan Hunting</h2>
      <p>Attacker aksar reconnaissance ke liye port scan karta hai. Network mein port scan identify karna lateral movement ka first step pakad sakta hai.</p>
      <pre><code>Filter in Wireshark:
tcp.flags.syn == 1 && tcp.flags.ack == 0

Indicators:
Ek host → bahut saari IPs
Bahut saare ports → same target
Short time window mein hundreds of SYN packets</code></pre>

      <h2>29. Threat Hunting with PCAPs</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['1','Hosts identify karo','Top talkers aur unusual endpoints'],['2','DNS analyze karo','DGA, tunneling, excessive queries'],['3','HTTP/TLS analyze karo','User-agents, certificates, SNI'],['4','Anomalies identify karo','Beaconing, timing patterns'],['5','IOCs extract karo','Domains, IPs, hashes'],['6','Timeline build karo','Chronological attack story']].map(r=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${r[0]}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[1]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-top:2px;">${r[2]}</div></div>
        </div>`).join('')}
      </div>

      <h2>30. Hunt Example Malware Beacon</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">HUNT: Malware C2 Beacon</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Hypothesis: <span style="color:#f4f4f5;font-weight:600;">Koi host C2 se communicate kar raha hai</span><br>
          DNS: <span style="color:#dc1414;font-weight:600;">random-domain.xyz</span> queried repeatedly<br>
          TLS: <span style="color:#dc1414;font-weight:600;">Every 60 seconds</span> same destination<br>
          HTTP: <span style="color:#dc1414;font-weight:600;">POST requests</span> at regular intervals<br>
          Upload: <span style="color:#dc1414;font-weight:600;">Small data packets</span> sent consistently<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Malware beacon confirmed, C2 server identified</span>
        </div>
      </div>

      <h2>31. Hunt Example Insider Threat</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">HUNT: Insider Threat</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          After-hours access: <span style="color:#dc1414;font-weight:600;">2 AM login</span> detected<br>
          Large uploads: <span style="color:#dc1414;font-weight:600;">500MB</span> bahar gaya personal cloud par<br>
          Sensitive data access: <span style="color:#dc1414;font-weight:600;">Customer records</span> queried<br>
          Investigate: <span style="color:#f4f4f5;font-weight:600;">User + Host + Destination sabko correlate karo</span>
        </div>
      </div>

      <h2>32. Hunt Example DNS Tunneling</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">HUNT: DNS Tunneling</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Long DNS queries: <span style="color:#dc1414;font-weight:600;">200+ character</span> subdomain names<br>
          Volume: <span style="color:#dc1414;font-weight:600;">Thousands of DNS requests</span> in short time<br>
          TXT records: <span style="color:#dc1414;font-weight:600;">TXT queries</span> unusually high<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Possible data exfiltration via DNS tunneling</span>
        </div>
      </div>

      <h2>33. Threat Hunting Metrics</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Top Talkers','Sabse zyada traffic generate karne wale hosts'],['Top Domains','Sabse zyada queried domains'],['Top Uploads','Sabse zyada bahar bheja data'],['Failed Logins','Authentication failures volume'],['Rare Protocols','Uncommon ya unexpected protocols']].map(r=>`
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>34. Detection Engineering</h2>
      <p>Jab hunter koi nayi threat pattern find karta hai, use automated detection mein convert kiya jaata hai taaki future mein manually hunt na karna pade.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['New Beacon Pattern Found','Hunter ne manually pakda'],['IDS Rule Create karo','Pattern ko automated detection mein convert karo'],['Future mein auto-detect','Rule trigger karega jab bhi pattern mile']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 28px;width:320px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>35. Threat Hunting Cycle</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Hunt','Proactively evidence dhundho'],['Threat Find karo','Hidden attacker ya malware identify karo'],['Detection Create karo','Automated rule banao'],['Security Improve karo','Gaps patch karo'],['Phir Hunt karo','Cycle repeat hoti hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 28px;width:300px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>36. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Hypothesis ke bina hunt karna','Random dhundh doge, results nahi milenge'],['Sirf alerts par trust karna','Un threats ko miss kar doge jo alert nahi generate karte'],['DNS ignore karna','Sabse important source ko chhodna badi galti hai'],['Timing patterns miss karna','Beaconing tab tak nahi dikhega'],['Findings document na karna','Evidence kho jaata hai aur future hunts ineffective hote hain']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.1);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>37. Skills to Master</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Threat Hunting Process','Hypothesis se report tak complete workflow'],['Hypothesis Creation','Assumption-based structured hunting'],['DNS Hunting','DGA, tunneling, excessive queries detect karna'],['TLS Hunting','Certificates, SNI, JA3 analyze karna'],['Beacon Detection','Timing patterns aur regular intervals pakadna'],['Lateral Movement Hunting','Internal network movement identify karna'],['ATT&amp;CK Mapping','Findings ko known techniques se link karna'],['Detection Engineering','Hunt results ko automated rules mein convert karna']].map(r=>`
        <div style="display:grid;grid-template-columns:220px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
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
              <circle cx="24" cy="24" r="20" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.6"/>
              <path d="M24 14c-2 0-4 1-5 2.5L14 24l5 7.5c1 1.5 3 2.5 5 2.5s4-1 5-2.5l5-7.5-5-7.5C29 15 27 14 24 14z" fill="rgba(220,20,20,0.15)" stroke="#dc1414" stroke-width="1.4" stroke-linejoin="round"/>
              <circle cx="24" cy="24" r="3" fill="#dc1414"/>
            </svg>
          </div>
          <div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 14 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Threat Hunting &amp; Network Hunting Methodology</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">Ab tum sirf alerts ka intezaar nahi karte. Ab tum khud proactively hunt karte ho hypothesis banate ho, DNS se TLS tak analyze karte ho, beaconing pakad te ho, aur findings ko automated detections mein convert karte ho.</p>
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
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 15 mein Memory aur Network Correlation aur DFIR Integration seekhenge. DFIR fundamentals, memory forensics basics, RAM artifacts, memory-network correlation, process-to-traffic mapping, aur malware investigation workflow.</p>
        </div>
      </div>

      <!-- PRACTICE ACTIONS -->
      <div class="info-box">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="16" height="16" rx="5" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/>
            <path d="M5 9l3 3 5-5" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;letter-spacing:0.5px;">Part 14 ke baad ye zaroor karo</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            'DNS logs analyze karo DGA-like domains identify karo',
            'TLS logs mein self-signed certificates dhundho',
            'Beaconing identify karo regular time intervals wale connections',
            'DNS, TLS, aur Proxy logs correlate karke attack timeline banao',
            'Ek hypothesis banao aur evidence dhundho usse prove karne ke liye',
            'MITRE ATT&amp;CK website par jaao aur ek technique detail mein padho'
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
            'Threat Hunting aur Incident Response mein kya difference hai?',
            'Hypothesis kya hoti hai aur kyun zaruri hai?',
            'IOC-based hunting kya hai?',
            'Beaconing ke indicators kya hote hain?',
            'MITRE ATT&amp;CK kyun useful hai threat hunters ke liye?'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
