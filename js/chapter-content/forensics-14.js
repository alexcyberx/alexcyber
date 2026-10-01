// Extracted from js/chapters.js — Network Forensics course, chapter index 14.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent14 = `

      <h2>1. DFIR kya hai?</h2>
      <p>DFIR = Digital Forensics and Incident Response. Ye do major disciplines ka combination hai jo ek saath ek incident ko handle karte hain.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.25);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:10px;">DIGITAL FORENSICS</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.8;">Evidence collection aur analysis. Kya hua iska scientific proof banana.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.07);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#f4f4f5;letter-spacing:2px;margin-bottom:10px;">INCIDENT RESPONSE</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.8;">Attack handle karna, spread rokna, system normal karna.</div>
        </div>
      </div>

      <h2>2. Network Traffic Akele Kyun Kaafi Nahi?</h2>
      <p>PCAP bahut kuch bata sakta hai lekin kuch cheezein sirf RAM analysis se milti hain. Dono milake complete picture banate hain.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:#0e0e12;border-radius:10px;border:1px solid rgba(255,255,255,0.05);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#888;letter-spacing:2px;margin-bottom:10px;">PCAP BATA SAKTA HAI</div>
          ${[['Kaunsa IP connected tha'],['Kaunsa domain contact hua'],['Kab traffic aayi']].map(r=>`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="#4a9a5a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[0]}</span>
          </div>`).join('')}
        </div>
        <div style="background:rgba(220,20,20,0.06);border-radius:10px;border:1px solid rgba(220,20,20,0.18);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:10px;">PCAP NAHI BATA SAKTA</div>
          ${[['Kaunsa process traffic generate kar raha tha'],['Kaunsa malware active tha RAM mein'],['Injected code kahan tha']].map(r=>`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[0]}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>3. Memory Forensics kya hai?</h2>
      <p>Memory Forensics matlab RAM ka analysis. Goal hai us waqt ki complete picture banana jo attack ke time RAM mein tha.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Running processes identify karna','Kaunsa program chal raha tha attack ke time'],['Malware detect karna','Hidden ya injected code dhundhna'],['Network connections map karna','Process se connection tak trace karna'],['Credentials recover karna','Authentication tokens jo RAM mein the'],['Attack timeline banana','Events ka exact sequence reconstruct karna']].map((r,i)=>`
        <div style="display:grid;grid-template-columns:28px 1fr;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 6px;text-align:center;">${i+1}</span>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>4. RAM Kyun Important hai?</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Running processes','Attack ke time kya chal raha tha'],['Open network connections','Malware kahan connect tha'],['Encryption keys','TLS decrypt karne ke liye'],['Injected code','Malware jo legitimate process mein chhupta hai'],['Command history','Attacker ne kya commands chalaaye'],['User activity','Live session ka data']].map(r=>`
        <div style="display:grid;grid-template-columns:180px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>5. Volatile vs Non-Volatile Data</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.3);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:10px;">VOLATILE</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">RAM</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.7;">Power off hone par sab kuch erase ho jaata hai. Capture pehle karna zaroori hai.</div>
        </div>
        <div style="background:#0e0e12;border-radius:12px;border:1px solid rgba(255,255,255,0.05);padding:18px 20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#888;letter-spacing:2px;margin-bottom:10px;">NON-VOLATILE</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">Disk</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.7;">Power off ke baad bhi data rehta hai. Files, logs, registry sab disk par hote hain.</div>
        </div>
      </div>
      <div class="info-box"><p><strong>Critical Rule:</strong> Machine power off karne se pehle memory capture karo warna RAM evidence hamesha ke liye kho jaata hai.</p></div>

      <h2>6. Memory Acquisition</h2>
      <p>Memory analysis shuru karne se pehle RAM ka snapshot lena padta hai. Ise memory capture ya acquisition kehte hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['DumpIt','Windows ke liye simple aur fast memory capture tool'],['WinPMEM','Advanced Windows memory acquisition, Rekall ka part'],['FTK Imager','Popular forensic suite, memory aur disk dono capture karta hai']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>
      <pre><code>Output files:
memory.raw
memory.mem

Ye files forensic evidence ban jaati hain.</code></pre>

      <h2>7. Memory Analysis Tools</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Volatility','Sabse popular memory analysis framework, Python-based, Windows/Linux/Mac support'],['Volatility 3','Naya version, improved plugin system aur Python 3 support'],['Rekall','Alternative framework, bhi widely used hai forensic investigations mein']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i===0?'220,20,20,0.2':'255,255,255,0.06'});padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>8. Process Analysis</h2>
      <p>Memory mein sabse pehle running processes dekhe jaate hain. Normal system processes aur suspicious processes mein farq karna zaroori hai.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:#0e0e12;border-radius:10px;border:1px solid rgba(255,255,255,0.05);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#888;letter-spacing:2px;margin-bottom:10px;">NORMAL PROCESSES</div>
          ${['chrome.exe','explorer.exe','svchost.exe','lsass.exe'].map(p=>`
          <div style="font-family:'Rajdhani',monospace;font-size:13px;color:#aaa;padding:3px 0;">${p}</div>`).join('')}
        </div>
        <div style="background:rgba(220,20,20,0.06);border-radius:10px;border:1px solid rgba(220,20,20,0.2);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:10px;">SUSPICIOUS PROCESSES</div>
          ${['update123.exe','abc91.exe','svch0st.exe','winlogon32.exe'].map(p=>`
          <div style="font-family:'Rajdhani',monospace;font-size:13px;color:#dc1414;padding:3px 0;">${p}</div>`).join('')}
        </div>
      </div>

      <h2>9. Process Tree Analysis</h2>
      <p>Process tree dikhata hai kaunsa process kaunse ka child hai. Ye chain aksar attack reveal karti hai. Normal kisi bhi case mein explorer se cmd se powershell se malware nahi chalta.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['explorer.exe','Normal Windows shell','255,255,255,0.06'],['cmd.exe','Explorer ne spawn kiya','255,255,255,0.06'],['powershell.exe','cmd ne spawn kiya','220,20,20,0.2'],['malware.exe','Suspicious child process','220,20,20,0.35']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${r[2]});border-radius:10px;padding:10px 28px;width:320px;text-align:center;">
          <div style="font-family:'Rajdhani',monospace;font-size:14px;font-weight:700;color:${i>=2?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>10. Hidden Processes</h2>
      <p>Advanced malware khud ko task manager aur normal process lists se chhupata hai. Memory forensics mein aise techniques se hidden processes reveal ho jaate hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Hidden Processes','Process list mein nahi dikhte lekin RAM mein hain'],['Unlinked Processes','Normal linked list se detach ho gaye hain'],['Rootkits','OS level par khud ko completely hide karte hain']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.18);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.3"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>11. Network Connections in Memory</h2>
      <p>Memory mein open aur closed network connections dono mil sakti hain. Ye directly process se linked hoti hain jo PCAP mein mumkin nahi hota.</p>
      <pre><code>Memory connection entry example:

Process:   malware.exe  (PID: 4821)
Protocol:  TCP
Local:     192.168.1.20:52341
Remote:    185.x.x.x:443
State:     ESTABLISHED</code></pre>
      <div class="info-box"><p><strong>Ye PCAP se powerful kyun hai:</strong> PCAP sirf IP dikhata hai lekin memory bataata hai kaunsa exact process us IP se baat kar raha tha.</p></div>

      <h2>12. Memory aur Network Correlation kyun karte hain?</h2>
      <p>Jab PCAP aur memory dono ko saath dekha jata hai toh ek aisa evidence chain banta hai jo court mein bhi accepted hoti hai. Akela koi evidence itna strong nahi hota.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['PCAP: 192.168.1.20 ne 185.x.x.x se contact kiya','#888'],['Memory: malware.exe PID 4821 ne 185.x.x.x se connect kiya','#dc1414'],['Conclusion: malware.exe hi traffic generate kar raha tha','#dc1414']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'255,255,255,0.06':'220,20,20,0.25'});border-radius:10px;padding:12px 24px;width:340px;text-align:center;">
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:${r[1]};line-height:1.6;">${r[0]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>13. Process-to-Traffic Mapping</h2>
      <p>DFIR ka ek sabse powerful technique. Har network connection ko uske responsible process se link karna.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Process','Kaunsa program tha'],['Connection','Kahan connect kiya'],['Domain','Kaunsa domain resolve hua'],['Activity','Kya kiya DNS, TLS, Data']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 28px;width:280px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>14. Correlation Example</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CORRELATION CASE</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          PCAP: <span style="color:#888;">evil-domain.xyz</span> pe DNS query aur TLS connection<br>
          Memory: <span style="color:#dc1414;font-weight:600;">updater.exe</span> PID 3912 connected to <span style="color:#dc1414;font-weight:600;">evil-domain.xyz</span><br>
          DLL: <span style="color:#dc1414;font-weight:600;">malicious.dll</span> updater.exe mein loaded tha<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: updater.exe malicious hai, evil-domain.xyz C2 server hai</span>
        </div>
      </div>

      <h2>15. DLL Analysis</h2>
      <p>Malware aksar legitimate processes mein malicious DLL load karta hai. Memory analysis mein ye clearly dikhta hai.</p>
      <pre><code>Normal explorer.exe modules:
  ntdll.dll
  kernel32.dll
  shell32.dll

Suspicious extra module:
  malicious.dll  &lt;-- abnormal, investigate karo</code></pre>

      <h2>16. Code Injection</h2>
      <p>Attackers apna malicious code legitimate processes ke andar inject karte hain taaki signature detection se bachen.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Abnormal memory regions','Executable memory jo kisi module se linked nahi hai'],['Suspicious threads','Threads jo unexpected memory address par execute ho rahe hain'],['Process hollowing','Legitimate process ka code replace kar diya','0e0e12']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.18);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.3"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[0]}</span>
        </div>`).join('')}
      </div>

      <h2>17. Command-Line Analysis</h2>
      <p>Memory mein process arguments bhi stored hote hain jisse attacker ke commands recover ho sakte hain. Ye bahut valuable forensic evidence hai.</p>
      <pre><code>Recovered from memory:

powershell.exe
  -ExecutionPolicy Bypass
  -EncodedCommand SQBuAHYAbwBrAGUALQBXAGUAYgBSAGUAcQB1AGUAcwB0...

Translation: Encoded malicious PowerShell script execute kiya</code></pre>
      <div class="info-box"><p><strong>Kyun important:</strong> Attackers PowerShell, CMD aur WMI use karte hain kyunki ye built-in tools hain. Memory mein inke arguments mil jaate hain.</p></div>

      <h2>18. Memory-Based IOC Extraction</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['IP Address','C2 server ka direct address'],['Domain','Malware config mein hardcoded domain'],['Process Name','Malicious process ka naam'],['Mutex','Malware jo ek hi bar chalana chahta hai us ka unique identifier'],['File Path','Disk par malware ki location'],['Registry Key','Persistence mechanism location']].map(r=>`
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>19. Malware Configuration Recovery</h2>
      <p>Memory mein malware ki configuration bhi stored hoti hai. C2 domains, IP addresses, encryption keys sab RAM mein milte hain.</p>
      <pre><code>Recovered malware config from memory:

C2 Server:  c2.evil-domain.xyz
Port:       443
Interval:   60 seconds
Key:        [encryption key bytes]

Ye malware ke andar hardcoded tha, disk par nahi tha.</code></pre>

      <h2>20. Unified Timeline banana</h2>
      <p>DFIR ka sabse important output ek unified timeline hai jo memory, PCAP aur logs ko combine karta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 100px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">TIME</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">SOURCE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">EVENT</span>
        </div>
        ${[['09:00','Email Log','Phishing email received'],['09:01','Endpoint','Attachment opened'],['09:02','Memory','malware.exe process created'],['09:03','DNS','evil-domain.xyz query sent'],['09:04','PCAP','TLS connection established'],['09:05','PCAP','Beaconing started']].map((r,i)=>`
        <div style="display:grid;grid-template-columns:80px 100px 1fr;gap:8px;background:${i>=2?'rgba(220,20,20,0.07)':'#0e0e12'};border-radius:8px;border:1px solid rgba(${i>=2?'220,20,20,0.2':'255,255,255,0.05'});padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:12px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;color:#888;">${r[1]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[2]}</span>
        </div>`).join('')}
      </div>

      <h2>21. Incident Response Lifecycle</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Preparation','Tools, playbooks aur team ready karna'],['Identification','Kya ye actually incident hai confirm karna'],['Containment','Spread rokna, isolate karna'],['Eradication','Threat hatana, malware remove karna'],['Recovery','Systems normal operation par laana'],['Lessons Learned','Post-incident review aur improvements']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 28px;width:340px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>22. Identification Phase</h2>
      <p>Incident response ka pehla real step hai confirm karna ki ye actually incident hai ya false alarm.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Kya ye malware hai?','Process behavior, network connections dekho'],['Kaunse hosts affected hain?','Network mein spread check karo'],['Kya evidence exist karta hai?','PCAP, memory, logs collect karo']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">Q</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>23. Containment Phase</h2>
      <p>Goal hai attack ko aage failne se rokna. Jitni jaldi containment utna kam damage.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Host isolate karo','Network se disconnect karo lekin power on rakho'],['Malicious domains block karo','DNS aur firewall level par block'],['C2 IPs block karo','Outbound connections firewall se block karo'],['User account disable karo','Agar credential compromise tha']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[0]}</span>
        </div>`).join('')}
      </div>

      <h2>24. Eradication Phase</h2>
      <p>Threat completely remove karna. Sirf malware delete karna kaafi nahi, persistence bhi hatana padta hai.</p>
      <pre><code>Eradication Checklist:

[ ] Malware files delete karo
[ ] Malicious scheduled tasks remove karo
[ ] Registry persistence entries hatao
[ ] Backdoor accounts close karo
[ ] Vulnerable systems patch karo
[ ] Passwords reset karo</code></pre>

      <h2>25. Malware Investigation Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Alert Receive','C2 activity alert aaya'],['PCAP Collect','Network traffic capture karo'],['Memory Collect','RAM image lao pehle power off se'],['Process Analyze','Suspicious processes identify karo'],['Connections Analyze','Process-to-IP mapping karo'],['Evidence Correlate','Memory plus PCAP plus Logs combine karo'],['IOCs Extract','Domains, IPs, hashes list banao'],['Report','Findings document karo']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:10px 28px;width:340px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>26. Real Investigation Example</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Possible C2 Activity</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert: <span style="color:#888;">Unusual outbound TLS traffic detected</span><br>
          PCAP: <span style="color:#dc1414;font-weight:600;">abc-malware.xyz</span> pe TLS beaconing 60-second intervals<br>
          Memory: <span style="color:#dc1414;font-weight:600;">update.exe</span> PID 5522 connected to <span style="color:#dc1414;font-weight:600;">abc-malware.xyz</span><br>
          DLL: <span style="color:#dc1414;font-weight:600;">helper32.dll</span> loaded, unsigned, suspicious path<br>
          <span style="color:#f4f4f5;font-weight:600;">Result: Confirmed malware process, host isolated, IOCs extracted</span>
        </div>
      </div>

      <h2>27. Memory Forensics Challenges</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Bada memory image','Modern systems mein 16GB plus RAM image handle karna mushkil hai'],['Encrypted malware','Kuch malware khud decrypt hoke RAM mein chalti hai capture ke baad fir decrypt karna padta hai'],['Anti-forensics','Malware khud memory wipe karne ki koshish karta hai'],['Rootkits','OS level par evidence hide karte hain standard tools se nahi dikhta']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>28. Practical Lab 1</h2>
      <p>Sample memory image lo aur basic process analysis karo.</p>
      <pre><code>Volatility commands:

vol.py -f memory.raw imageinfo
vol.py -f memory.raw --profile=Win10x64 pslist
vol.py -f memory.raw --profile=Win10x64 pstree

Dekho: Kaunse processes hain aur parent-child chain kya hai?</code></pre>

      <h2>29. Practical Lab 2</h2>
      <p>Memory se network connections extract karo.</p>
      <pre><code>vol.py -f memory.raw --profile=Win10x64 netscan

Output mein dekho:
- ESTABLISHED connections
- Listening ports
- Suspicious remote IPs
- Kaunsa process connected hai</code></pre>

      <h2>30. Practical Lab 3</h2>
      <p>PCAP aur memory dono ko correlate karo aur responsible process identify karo.</p>
      <pre><code>Step 1: PCAP mein suspicious domain dhundho
Step 2: Us domain ka IP note karo
Step 3: Memory netscan mein same IP dhundho
Step 4: PID note karo
Step 5: pslist mein PID se process naam find karo
Step 6: pstree mein us process ka parent dekho

Result: Complete process-to-traffic mapping</code></pre>

      <h2>31. Practical Lab 4</h2>
      <p>Memory, logs aur PCAP combine karke attack ka complete timeline banao.</p>
      <pre><code>Step 1: DNS log se domain query time
Step 2: PCAP se TLS connection time
Step 3: Memory se process creation time
Step 4: Endpoint log se file execution time

Order: DNS Query --&gt; Process Start --&gt; TLS Connect --&gt; Beacon</code></pre>

      <h2>32. Recovery Phase</h2>
      <p>Eradication ke baad systems ko wapis normal operation par laana hota hai. Is phase mein verify karte hain ki threat completely gone hai.</p>
      <pre><code>Recovery Steps:

[ ] Clean backups se restore karo
[ ] Systems monitor karo 48-72 ghante tak
[ ] Verify karo malware wapis nahi aaya
[ ] Users ko inform karo
[ ] Systems production par wapis laao</code></pre>
      <div class="info-box"><p><strong>Important:</strong> Recovery ke baad bhi monitoring karo. Kuch attackers secondary backdoors chhod jaate hain jo eradication ke waqt miss ho jaate hain.</p></div>

      <h2>33. Lessons Learned</h2>
      <p>Har incident ke baad ek post-incident review hoti hai jisme puri team milke analyze karti hai ki kya hua, kyun hua aur future mein kaise rokein.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Kya hua?','Complete attack timeline reconstruct karo'],['Kyun hua?','Root cause identify karo, kya vulnerability exploit hua'],['Detection mein kitna waqt laga?','Dwell time measure karo attacker kitne time tak tha'],['Response effective tha?','Containment aur eradication kitni jaldi hui'],['Future mein kaise rokein?','Controls, monitoring, patching improvements']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>34. Credential Artifacts in Memory</h2>
      <p>RAM mein authentication se related data bhi stored hota hai. Ye investigators ke liye valuable hota hai kyunki attacker bhi same credentials use karta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Authentication Tokens','Active login sessions ke tokens RAM mein hote hain'],['Session Data','Browser aur application sessions'],['Cached Credentials','Windows LSASS process mein hashed passwords'],['Kerberos Tickets','Domain authentication tickets jo pass-the-ticket attack mein use hote hain']].map(r=>`
        <div style="display:grid;grid-template-columns:200px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Legal Note:</strong> Credential artifacts bahut sensitive hote hain. Inhe hamesha lawfully aur proper chain of custody ke saath handle karo.</p></div>

      <h2>35. Browser Artifacts in Memory</h2>
      <p>Jis waqt browser RAM mein hota hai us waqt bahut saari information directly memory se recover ho sakti hai jo disk par encrypted ho sakti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Open Tabs','Attack ke time kaunse pages open the'],['URLs','Visited pages even in private mode'],['Downloads','Files jo download ki gayi'],['Sessions','Active login sessions browser mein'],['Form Data','Input fields mein jo data tha']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>36. Anti-Forensics Techniques</h2>
      <p>Advanced attackers forensic investigation ko mushkil banana chahte hain. In techniques ko samajhna investigators ke liye zaroori hai taaki inhe counter kar sakein.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Process Hiding','Rootkits use karke processes ko visibility se remove karna'],['Memory Wiping','Sensitive data ko memory se overwrite karna before capture'],['Log Deletion','Event logs aur audit trails delete karna'],['Timestomping','File timestamps modify karna timeline ko confuse karne ke liye'],['Fileless Malware','Disk par kuch bhi nahi likhna, sirf RAM mein rehna']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>37. Without Memory vs With Memory</h2>
      <p>Memory forensics ke bina aur saath mein investigation mein kitna farq padta hai ye ek comparison se clearly samajh aata hai.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:#0e0e12;border-radius:10px;border:1px solid rgba(255,255,255,0.05);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#555;letter-spacing:2px;margin-bottom:12px;">SIRF PCAP KE SAATH</div>
          <div style="font-family:'Rajdhani',monospace;font-size:13px;color:#666;line-height:2;">IP Address<br>Domain Name<br>Traffic Type<br><span style="color:#444;">Process = Unknown</span><br><span style="color:#444;">Malware = Unknown</span></div>
        </div>
        <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.3);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:12px;">MEMORY + PCAP KE SAATH</div>
          <div style="font-family:'Rajdhani',monospace;font-size:13px;color:#f4f4f5;line-height:2;">IP Address<br>Domain Name<br>Traffic Type<br><span style="color:#dc1414;">Process = malware.exe</span><br><span style="color:#dc1414;">Family = Identified</span></div>
        </div>
      </div>

      <h2>38. Investigator Mindset</h2>
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:24px;margin:0 0 28px;">
        <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;letter-spacing:2px;margin-bottom:14px;">DFIR INVESTIGATOR SOCHTA HAI</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${['"Sirf alert pe mat ruko, evidence dhundho"','"Memory aur PCAP dono dekho, akela koi kaafi nahi"','"Timeline banao pehle, phir conclusions"','"Har process ka parent check karo"','"Ek IOC se start karo, saare sources mein dhundho"'].map(q=>`
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;margin-top:2px;"><path d="M3 7l3 3 5-6" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;font-style:italic;line-height:1.5;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>39. Practice Actions</h2>
      <div class="info-box">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="16" height="16" rx="5" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/>
            <path d="M5 9l3 3 5-5" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;letter-spacing:0.5px;">Part 15 ke baad ye zaroor karo</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            'Volatility download karo aur sample memory image par pslist run karo',
            'Process tree banao aur suspicious parent-child chains identify karo',
            'Netscan se network connections nikalo aur PCAP se correlate karo',
            'cmdline plugin se command-line arguments recover karo',
            'MemLabs ya CyberDefenders pe memory forensics challenges try karo',
            'Ek sample incident ka unified timeline banao Memory plus PCAP plus Logs milake'
          ].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M10 5l3 3-3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>40. Why Memory Matters in Network Forensics?</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Sirf Network Evidence','IP aur domain pata chala lekin kaunsa process responsible tha nahi pata'],['Memory Add karo','Process naam, PID, DLL, command-line arguments sab mil gaya'],['Combine karo','Process ne kaunsa domain contact kiya aur kyun sab clear ho gaya'],['Malware Family Identify','C2 config memory se nikali, malware family confirm']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===3?'220,20,20,0.35':i===0?'255,255,255,0.06':'255,255,255,0.08'});border-radius:10px;padding:12px 24px;width:340px;text-align:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===3?'#dc1414':i===0?'#666':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#555;margin-top:3px;line-height:1.5;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>41. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Sirf PCAP dekhna','Process information miss ho jaati hai, investigation incomplete rehti hai'],['Process tree ignore karna','Parent-child chain attack ka sabse clear indicator hai'],['Command-line arguments ignore karna','PowerShell aur cmd arguments mein attack clearly likha hota hai'],['RAM artifacts ignore karna','Memory mein encryption keys aur config bhi mil sakte hain'],['Timeline nahi banana','Bina sequence ke findings meaningful nahi hote']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>42. Skills to Master</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['DFIR Fundamentals','Digital Forensics aur Incident Response ka complete workflow'],['Memory Acquisition','DumpIt, WinPMEM, FTK se RAM capture karna'],['Volatility Basics','pslist, pstree, netscan, cmdline plugins use karna'],['Process Analysis','Normal vs suspicious processes identify karna'],['Process-to-Traffic Mapping','Memory connection ko PCAP se link karna'],['IOC Extraction','Domains, IPs, hashes, mutex memory se nikalna'],['Incident Response Workflow','6-phase lifecycle Preparation se Lessons Learned tak']].map(r=>`
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
              <path d="M16 24l6 6 10-12" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 15 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Memory + Network Correlation &amp; DFIR Integration</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">Ab tum sirf PCAP nahi dekhte. Ab tum memory aur network dono correlate karte ho, process-to-traffic mapping karte ho, unified timeline banate ho aur DFIR lifecycle follow karte ho. Ye skills real incident response mein daily use hoti hain.</p>
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
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 16 mein Wireless Network Forensics seekhenge. Wi-Fi architecture, 802.11 frames, Management aur Control aur Data frames, WPA aur WPA2 aur WPA3 basics, wireless attacks, Rogue AP detection, Evil Twin detection aur wireless packet analysis.</p>
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
            'DFIR ka full form kya hai aur iske do main parts kya hain?',
            'Memory Forensics kyun important hai PCAP ke hote hue bhi?',
            'Process-to-traffic mapping kya hoti hai aur kaise ki jaati hai?',
            'Incident Response lifecycle ke 6 phases kaunse hain?',
            'PCAP aur Memory correlation se kya advantage milta hai?'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
