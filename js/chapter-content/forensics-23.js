// Extracted from js/chapters.js — Network Forensics course, chapter index 23.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent23 = `

      <h2>1. DFIR Kya Hota Hai</h2>
      <p>DFIR ka matlab Digital Forensics and Incident Response hai. Ye cybersecurity ki sabse high-pressure field hai. Digital Forensics mein evidence collect karte hain, analyze karte hain, sach pata karte hain. Incident Response mein attack ke baad damage rokna, threat remove karna, aur business recover karna hota hai.</p>
      <pre><code>SOC Analyst poochta hai:
  Alert kya hai?

DFIR Investigator poochta hai:
  Attack kaise hua?
  Kab hua?
  Kitna damage hua?
  Data gaya kya?
  Wapas aane ka raasta hai attacker ke paas?</code></pre>

      <h2>2. Incident Response Lifecycle</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Preparation','Attack aane se pehle: logging, monitoring, SIEM, backups, playbooks. Sabse ignored lekin sabse zaroori phase.'],
          ['Identification','Evidence se confirm karo ke attack actually hua hai. SIEM alert, IDS alert, user report sab valid sources hain.'],
          ['Containment','Infected host ko network se alag karo. Spread rokna priority hai. Containment karne ke baad investigation shuru hoti hai.'],
          ['Eradication','Malware, backdoors, malicious accounts sab hatao. Root cause pehle samjho warna attacker wapas aayega.'],
          ['Recovery','Clean system restore karo, patch karo, closely monitor karo initial period mein.'],
          ['Lessons Learned','Kaise hua, kya miss hua, future mein kaise rokna hai. Zyaadatar organizations ye ignore karte hain. Big mistake.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:130px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Forensic Evidence Types</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Network Evidence','PCAP files, flow logs, firewall logs, proxy logs, DNS logs'],
          ['Memory Evidence','RAM dump (memory.raw). Running processes, network connections, passwords, malware.'],
          ['Disk Evidence','Hard drive ya SSD image. Files, browser history, registry, deleted files.'],
          ['Cloud Evidence','CloudTrail, VPC flow logs, IAM logs, S3 access logs']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Memory Forensics</h2>
      <p>RAM mein woh cheezein hoti hain jo disk pe nahi milti: running processes, active network connections, passwords, malware jo khud ko disk pe nahi likhta, aur encryption keys. System reboot hote hi ye sab chala jaata hai. Isliye infected machine kabhi pehle reboot nahi karte.</p>
      <pre><code>Memory Acquisition Tools:
  WinPMEM    (Windows, free)
  DumpIt     (Windows, quick)
  Output:    memory.raw

Volatility 3 Commands:
  windows.pslist    running processes
  windows.netstat   active connections
  windows.malfind   suspicious injected code
  windows.cmdline   command line arguments
  windows.dlllist   loaded DLLs per process</code></pre>

      <h2>5. Process Tree Analysis</h2>
      <pre><code>Suspicious parent-child chains:
  WINWORD.EXE    spawns  powershell.exe
  excel.exe      spawns  cmd.exe
  mshta.exe      spawns  powershell.exe
  wscript.exe    spawns  cmd.exe

Normal examples:
  explorer.exe   spawns  chrome.exe
  chrome.exe     spawns  chrome.exe (renderer)

Rule: Office applications kabhi
      command line tools spawn nahi karte
      legitimately. Ye dekha toh investigate karo.</code></pre>

      <h2>6. Disk Forensics</h2>
      <p>Memory batata hai abhi kya ho raha hai. Disk batata hai pehle kya hua tha. Disk pe evidence milta hai jo attacker ne delete kiya lekin forensic tools recover kar lete hain.</p>
      <pre><code>Evidence on Disk:
  Malware files (even deleted ones recoverable)
  Browser history (sites visited, downloads)
  Recent files list (what was opened)
  Registry (persistence mechanisms, run keys)
  Prefetch files (what programs ran, when)
  Event logs (authentication, process execution)

Rule: Kabhi original disk pe investigate mat karo.
      Pehle forensic image banao, tab analyze karo.</code></pre>

      <h2>7. Hash Verification</h2>
      <pre><code>Evidence integrity ke liye:
  MD5     (fast, less secure)
  SHA1    (common, good)
  SHA256  (recommended, most secure)

Usage:
  Evidence collect karo
  Hash calculate karo: 4a8bc2...
  Store karo documentation mein
  Baad mein verify karo: hash match hona chahiye

Agar hash match nahi karta:
  Evidence tamper ho sakti hai
  Chain of custody broken hai</code></pre>

      <h2>8. Chain of Custody</h2>
      <pre><code>Forensic evidence handling:
  Collected by:   [Analyst], 2024-05-18, 10:30 AM
  Location:       Finance dept, Desk 14
  Hash SHA256:    4a8bc2...
  Stored in:      Evidence bag 47, locked cabinet
  Analyzed by:    [Analyst], 2024-05-18, 2:00 PM
  Hash verified:  Match confirmed

Every step documented.
Agar chain break ho: court mein problem.</code></pre>

      <h2>9. Root Cause Analysis</h2>
      <pre><code>Bad conclusion:
  Malware mila, clean kiya, done.

Good conclusion:
  Phishing email aaya
  User ne DOCM attachment open kiya
  Macro execute hua
  PowerShell ne payload download kiya
  Malware install hua, C2 connect hua

Ab root cause pata hai:
  Phishing awareness training
  Email filtering improve karo
  Macro blocking enforce karo</code></pre>

      <h2>10. Ransomware Investigation</h2>
      <pre><code>Ransomware Investigation Steps:
  1. Affected hosts identify karo
  2. Network se isolate karo immediately
  3. DO NOT reboot (memory evidence jayega)
  4. Patient zero dhundho (encryption timestamps)
  5. Initial vector identify karo (email, RDP, USB)
  6. Data exfiltration check karo (steal first, encrypt later)
  7. Lateral movement trace karo
  8. Backups verify karo (clean hain ya nahi)
  9. Eradication plan banao with root cause
  10. Recovery execute karo</code></pre>

      <h2>11. Patient Zero</h2>
      <p>Woh pehla system jo compromise hua. Patient zero dhundhna critical hai kyunki wahan se initial attack vector milta hai. Encryption timestamps compare karo across all affected hosts.</p>
      <pre><code>Encryption Timestamps:
  HOST-FIN-01:  10:14 AM  (first encrypted file)
  HOST-FIN-02:  10:31 AM
  HOST-HR-01:   11:02 AM

Patient Zero: HOST-FIN-01

HOST-FIN-01 pe 10:14 se pehle kya hua?
  10:02  Email attachment open hua
  10:09  DNS query: ransom-server.xyz
  10:14  Encryption started</code></pre>

      <h2>12. Data Exfiltration Investigation</h2>
      <pre><code>Many attackers pehle data steal karte hain
phir encrypt karte hain. Indicators:

  Large uploads to unknown destinations
  Personal cloud storage usage (Dropbox, etc)
  Compression tools used (7zip, WinRAR)
  After-hours activity
  Destination domain: newly registered

Timeline example:
  10:00  Login
  10:03  7z.exe executed (compression)
  10:05  archive.7z created (44 GB)
  10:08  Upload to unknown-storage.xyz started
  10:38  Upload complete
  10:39  archive.7z deleted</code></pre>

      <h2>13. Insider Threat Investigation</h2>
      <p>Sabse mushkil cases hote hain. Legitimate user malicious action karta hai. Innocent until proven otherwise approach rakho. Evidence se chalo, assumption se nahi.</p>
      <pre><code>Baseline vs Anomaly:
  Normal: 9 AM to 6 PM login, finance docs only
  Anomaly: 11 PM login, HR + executive folders accessed

Correlation:
  11:30 PM  After-hours login
  11:33 PM  HR folder accessed (no normal right)
  11:35 PM  USB device inserted
  11:36 PM  18 GB mass copy to USB
  11:54 PM  Upload to personal Dropbox</code></pre>

      <h2>14. Timeline Analysis</h2>
      <p>DFIR investigators timeline pe jeete hain. Timeline hi attack ki poori story batata hai. Har event ka timestamp, source, aur description hona chahiye.</p>
      <pre><code>Timeline format:
  10:00  Login from office IP (normal)
  10:02  USB device inserted
  10:05  Mass file copy started
  10:20  Upload to external storage
  10:35  Logout

Timeline = Attack ki story
Bina timeline ke investigation incomplete hai.</code></pre>

      <h2>15. DFIR Investigation Workflow</h2>
      <pre><code>Alert aaya
Evidence collect karo
Evidence preserve karo (hashes, chain of custody)
Memory analyze karo (Volatility)
Disk analyze karo (forensic image)
Logs analyze karo (SIEM, Windows events)
Network analyze karo (PCAP, flow logs)
Timeline banao (all sources merged)
Root cause identify karo
Report likho</code></pre>

      <h2>16. Professional Report Format</h2>
      <pre><code>Incident ID    INC-2024-0587
Date           2024-05-18
Analyst        [Name], Tier 2 SOC
Severity       Critical

Executive Summary:
  HOST-FIN-01 phishing se compromise hua.
  Ransomware 3 aur hosts pe phail gaya.

Timeline:
  10:02  Phishing email opened
  10:05  invoice.exe executed
  10:09  C2: ransom-key-server.xyz
  10:14  Encryption started
  10:31  Lateral movement to HOST-FIN-02

IOCs:
  Domain: ransom-key-server.xyz
  IP:     185.220.x.x
  File:   invoice.exe

Affected: HOST-FIN-01, 02, 03, HOST-HR-01

Actions Taken:
  4 hosts isolated from network
  All credentials reset
  DFIR team engaged
  Backups verified clean

Recommendations:
  Phishing awareness training
  Email attachment filtering
  Macro blocking policy</code></pre>

      <h2>17. Biggest Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Infected Machine Reboot','Memory mein encryption keys aur malware artifacts destroy ho jaate hain'],
          ['No Evidence Preservation','Bina hashes ke evidence court mein challenged ho sakta hai'],
          ['No Timeline','Events isolated dekhne se story nahi banti, timeline se banti hai'],
          ['No Root Cause','Malware clean kiya lekin kaise aaya nahi jaana. Attacker wapas aayega.'],
          ['Jumping to Conclusions','Alert se seedha malware mat bolo. Evidence dekho, timeline banao, tab bolo.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:200px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <div class="info-box"><p>Golden DFIR Rule: Kabhi mat poochho ke malware kya hai. Poochho: <strong>malware yahan kaise pahuncha?</strong> Ye sawaal hi investigators ko expert banata hai.</p></div>

    `;
