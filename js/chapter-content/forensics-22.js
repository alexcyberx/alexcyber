// Extracted from js/chapters.js — Network Forensics course, chapter index 22.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent22 = `

      <h2>1. Threat Hunting Kya Hota Hai</h2>
      <p>SOC Analyst reactive hota hai: alert aata hai, investigate karta hai. Threat Hunter proactive hota hai: koi alert nahi hota, phir bhi khud threat dhundta hai. SOC analyst IDS alert pe respond karta hai. Threat hunter bina kisi alert ke suspicious pattern dhundta hai aur hidden malware find karta hai.</p>

      <h2>2. Threat Hunting Ki Zarurat Kyun Padi</h2>
      <p>Har attack detect nahi hota. IDS miss kar sakta hai, SIEM miss kar sakta hai, EDR miss kar sakta hai. Custom malware pe antivirus no detection deta hai. EDR pe koi alert nahi aata. Lekin Threat Hunter beaconing pattern se malware dhundh leta hai.</p>
      <div class="info-box"><p>Threat Hunt kabhi random nahi hoti. Hamesha ek <strong>hypothesis</strong> se shuru hoti hai. Bina hypothesis ke log search karna time waste hai. Hypothesis pehle, data baad mein.</p></div>

      <h2>3. Threat Hunting Process</h2>
      <pre><code>Professional Workflow:
  Hypothesis banao        (kya dhundhna hai aur kyun)
  Data sources identify   (DNS, flow, proxy, endpoint)
  Investigation karo      (targeted search)
  Evidence validate karo  (false positive ya real?)
  Detection rule banao    (future mein auto detect ho)
  Document karo           (findings, IOCs, recommendations)</code></pre>

      <h2>4. Teen Types of Threat Hunting</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['IOC Hunting','Known malicious IP, domain ya hash dhundho. Quick lekin limited. Attackers IOC easily change karte hain.'],
          ['TTP Hunting','Attacker ka behavior dhundho, indicators nahi. Behavior change karna mushkil hota hai. Zyaada powerful.'],
          ['Anomaly Hunting','Baseline se alag cheez dhundho. 50000 DNS queries, 100 GB upload, 3 AM login. Data se pattern nikalna.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:130px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. IOC Hunting Ka Problem</h2>
      <p>IOC hunting useful hai lekin enough nahi. Attackers apna IP change kar lete hain, domain change kar lete hain, file hash change kar lete hain. IOC se ek specific attack dhundh sakte ho. TTP se attacker ke sab attacks dhundh sakte ho chahe IOC change ho jaaye.</p>

      <h2>6. MITRE ATT&amp;CK Framework</h2>
      <p>MITRE ATT&amp;CK attackers ka encyclopedia hai. Har technique documented hai with real-world examples. Threat hunter is framework se hypotheses banata hai.</p>
      <pre><code>Key ATT&CK Tactics for Network Forensics:
  Initial Access      Phishing, drive-by download
  Execution           PowerShell abuse, macro execution
  Persistence         Registry keys, scheduled tasks
  C2                  Beaconing, DNS tunneling, HTTPS C2
  Exfiltration        Cloud upload, DNS tunnel, FTP
  Lateral Movement    SMB, RDP, PsExec, WMI

Example:
  Observed: PowerShell abuse
  ATT&CK Technique: Command and Scripting Interpreter
  Now attacker behavior classify ho gaya</code></pre>

      <h2>7. DNS Hunting</h2>
      <pre><code>DNS Hunting Questions:
  Rare domains kaunse hain? (pehli baar query hue)
  DGA domains? (random looking, high entropy)
  Failed lookups zyaada hain? (NXDOMAIN flood)
  Excessive queries? (same domain bar bar)
  Long subdomains? (tunneling possible)

DGA Example:
  kx82jda91.com   machine generated lagta hai
  pl82js91.net    high entropy, koi meaning nahi
  Many failures = DGA malware active hai</code></pre>

      <h2>8. DNS Tunneling Hunting</h2>
      <pre><code>Normal DNS:
  google.com
  microsoft.com

Suspicious DNS (tunneling):
  aj82ks7d82js7d82.data.example.com
  Very long subdomains
  TXT record queries zyaada hain
  Same base domain pe thousands of queries

DNS tunneling kyun use karte hain?
  Firewall DNS block nahi kar sakta
  DNS essential service hai
  Data chhupa ke bahar bhej sakte hain</code></pre>

      <h2>9. TLS Hunting</h2>
      <pre><code>TLS Hunting Indicators:
  Self signed certificates on public IPs
  Unknown domains with regular TLS traffic
  Rare destination IPs not in baseline
  Regular beaconing intervals
  JA3 hash matching known malware families

JA3 Fingerprinting:
  TLS handshake se unique fingerprint generate hota hai
  Same malware family same JA3 use karti hai
  Database se match karo aur identify karo</code></pre>

      <h2>10. Beaconing Hunt</h2>
      <pre><code>Flow logs mein dhundho:
  Same IP pe regular intervals pe connections
  Same destination port
  Similar packet size
  After-hours bhi active
  Non-human traffic pattern

Jitter wala beaconing:
  120 sec, 135 sec, 108 sec, 122 sec
  Average 120 sec with +/- 15 sec variation
  Ye bhi beaconing hai, exact nahi lekin real hai</code></pre>

      <h2>11. HTTP Hunting</h2>
      <pre><code>Unusual User-Agent dhundho:
  Normal:     Mozilla/5.0 (Windows...)
  Suspicious: UpdaterBot, ClientAgent, python-requests

Strange POST Requests:
  Regular POST to unknown domain
  Encoded data in POST body
  Base64 ya hex encoded content

Unknown Domains:
  Domains not seen before
  Recently registered domains
  High entropy domain names</code></pre>

      <h2>12. Authentication Hunting</h2>
      <pre><code>Failed Logins:
  Bahut zyaada failures ek user pe = brute force
  Many users, same password = password spray

Impossible Travel:
  User ne Delhi se login kiya 9 AM
  Same user ne London se login kiya 9:30 AM
  Physically impossible = credential theft

New Device Login:
  User ka naya device agent detect hua
  Unfamiliar OS ya browser

New Country Login:
  User kabhi is country se login nahi kiya tha</code></pre>

      <h2>13. Lateral Movement Hunting</h2>
      <p>Sabse mushkil hunt. Attacker ek system se doosre system tak kaise gaya ye trace karna. Normal admin traffic se alag karna challenging hai.</p>
      <pre><code>Lateral Movement Indicators:
  SMB traffic between workstations (unusual)
  RDP connections from non-admin hosts
  PsExec usage (admin tool, often abused)
  WMI remote execution
  New service created by remote host
  Admin share access (C$, admin$, IPC$)

Windows Event IDs:
  4648  Explicit credential use
  4624  Successful login (Type 3 = network)
  7045  New service installed</code></pre>

      <h2>14. Cloud Threat Hunting</h2>
      <pre><code>AWS CloudTrail mein dhundho:
  Naya admin user create hua?
  Policy attach hue unusual account pe?
  S3 mass download hua?
  After-hours IAM changes?
  Login from new country?

Questions:
  Kya kisi ne naya admin user banaya?
  Kya koi mass data download hua?
  Kya after-hours pe unusual API calls hue?</code></pre>

      <h2>15. Real Threat Hunt Example</h2>
      <pre><code>Hypothesis: Network mein hidden C2 beacon ho sakta hai

Data Sources: DNS logs, flow logs, proxy logs (7 days)

Investigation:
  DNS mein rare domain mila: update-svc.xyz
  Flow logs mein har 60 sec pe same IP:443
  TLS cert: self signed, registered 2 days ago
  POST requests regular interval pe

Woh sab mila ke: Active C2 beaconing confirmed

Detection Created:
  SIEM rule: 60 sec interval same IP connections
  Block: update-svc.xyz domain
  IOC shared with threat intel team</code></pre>

      <h2>16. Detection Engineering</h2>
      <p>Threat hunter ka final goal sirf dhundhna nahi hai. Dhundhne ke baad detection rule banana hai taake future mein automatically alert ho jaye.</p>
      <pre><code>Workflow:
  Threat dhunda (e.g., 60-second beaconing)
  Pattern document kiya
  SIEM rule banaya
  Historical data pe rule test kiya
  False positive rate check kiya
  Production mein deploy kiya

Ab wahi threat dobara aayega toh
SIEM automatically alert karega bina
kisi manual hunt ke.</code></pre>

      <h2>17. Biggest Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['No Hypothesis','Random log search = time waste. Pehle hypothesis banao.'],
          ['DNS Ignore Karna','DNS sabse valuable hunting source hai. Skip mat karo.'],
          ['Documentation Ignore','Hunt ka koi record nahi toh future mein repeat karoge.'],
          ['No Detection Creation','Hunt ke baad rule banana zaroori hai warna woh threat wapas aayega.'],
          ['Only IOC Hunting','IOC change hote hain. TTP hunting zyaada powerful hai.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:180px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <div class="info-box"><p>Companies paise dete hain hidden threats dhundhne ke liye, sirf alerts dekhne ke liye nahi. Threat Hunter woh cheez dhundta hai jo kisi aur ko nahi dikhi. Ye skill practice se aati hai, tools se nahi.</p></div>

    `;
