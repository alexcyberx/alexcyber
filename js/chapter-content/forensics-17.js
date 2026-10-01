// Extracted from js/chapters.js — Network Forensics course, chapter index 17.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent17 = `

      <h2>1. SIEM Kyun Bana?</h2>
      <p>Enterprise network mein attack investigate karna ek time mein bahut mushkil tha. Har device ka apna alag log tha, alag format mein, alag jagah stored. Ek analyst ko firewall logs dekhne ke liye alag system pe jaana padta tha, DNS logs ke liye alag, Windows logs ke liye alag. Attack investigation mein ghante nahi, din lagte the kyunki evidence scattered tha.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Firewall Logs','Alag system, alag format'],['DNS Logs','Alag system, alag format'],['Proxy Logs','Alag system, alag format'],['Windows Event Logs','Alag system, alag format'],['VPN Logs','Alag system, alag format'],['Cloud Logs','Alag system, alag format']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>The Problem:</strong> Scattered logs matlab scattered evidence. Investigator attack ke sirf ek piece dekhta tha, poora picture nahi. SIEM ne sab ek jagah laaya.</p></div>

      <h2>2. SIEM Kya Hai?</h2>
      <p>SIEM matlab Security Information and Event Management. Ye ek central platform hai jo security-related logs collect karta hai, unhe store karta hai, analyze karta hai aur correlate karta hai. SOC analyst ko ab alag-alag systems pe jaane ki zaroorat nahi. SIEM mein sab available hai.</p>
      <div style="display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;margin:0 0 28px;">
        ${[['Collect','Har source se logs gather karo'],['Parse','Alag formats ko samjho'],['Normalize','Sab ko ek common format mein convert karo'],['Store','Long-term retention ke liye save karo'],['Correlate','Events ke beech patterns dhundho'],['Alert','Suspicious activity pe analyst ko batao']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:130px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. SIEM Architecture</h2>
      <p>SIEM ke andar alag-alag components hote hain jo milke kaam karte hain. Har component ek specific role play karta hai. Investigator ko ye samajhna chahiye ki log SIEM tak pahunchne se pehle kaunse stages se guzarta hai.</p>
      <pre><code>Log Source (Firewall, DNS, Endpoint, Cloud)
       |
   Collector
  (logs gather karta hai, forward karta hai)
       |
    Parser
  (har format ko samajhta hai)
       |
  Normalization
  (sab ek common schema mein)
       |
    Storage
  (indexed, searchable)
       |
Correlation Engine
  (patterns, rules, anomalies)
       |
    Alert
  (analyst ko notify karta hai)
       |
  Investigator</code></pre>

      <h2>4. Log Sources</h2>
      <p>SIEM ka value directly depend karta hai ki kitne aur kaunse log sources connected hain. Zyada sources matlab zyada visibility aur better detection. Incomplete log coverage matlab blind spots.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Network','Firewalls, routers, switches, IDS/IPS, VPN concentrators'],['Endpoint','Windows Event Logs, Linux syslog, EDR agents, antivirus'],['Cloud','AWS CloudTrail, Azure Activity Log, GCP Audit Logs, SaaS applications'],['Applications','Web servers, databases, authentication systems, email gateways'],['Identity','Active Directory, LDAP, IAM systems, MFA providers']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:130px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Parsing</h2>
      <p>Alag log sources alag formats mein logs produce karte hain. Firewall alag format mein likhta hai, Windows alag mein, Linux alag mein. Parser har format ko samajhta hai aur individual fields extract karta hai.</p>
      <pre><code>Firewall Log:
  SRC=192.168.1.5 DST=8.8.8.8 PROTO=TCP DPT=443

Windows Event Log:
  SourceAddress=192.168.1.5 DestAddress=8.8.8.8

Syslog:
  src_ip=192.168.1.5 dst_ip=8.8.8.8

Parser in sab ko samajhta hai aur fields nikalta hai.</code></pre>

      <h2>6. Normalization</h2>
      <p>Normalization ka matlab hai alag sources ke same type ke fields ko ek common naam de dena. Isse different sources ke events ek saath compare aur correlate kiye ja sakte hain.</p>
      <pre><code>Before Normalization:
  Firewall  : SRC
  Windows   : SourceAddress
  Cisco     : ClientIP
  Linux     : src_ip

After Normalization:
  All       : source_ip

Ab correlation possible hai across all sources.</code></pre>

      <h2>7. Correlation Engine</h2>
      <p>Correlation engine SIEM ka sabse powerful component hai. Ye individual events ko dekh ke patterns identify karta hai. Ek akela event suspicious nahi lagta lekin jab multiple events ek sequence mein aate hain toh attack visible ho jaata hai.</p>
      <pre><code>Individual events (innocent alone):
  VPN login         -- normal
  DNS query         -- normal
  File download     -- normal
  PowerShell run    -- normal

Connected by Correlation Engine:
  VPN login (Russia IP)
       |
  DNS query (known-bad domain)
       |
  File download (payload.exe)
       |
  PowerShell execution
       =
  ALERT: Potential Malware Infection</code></pre>

      <h2>8. Major SIEM Platforms</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Splunk','Industry leader. Powerful search language (SPL). Most enterprise environments mein use hota hai. Expensive but feature-rich'],['Microsoft Sentinel','Cloud-native SIEM. Azure ke saath deep integration. KQL query language. Managed service'],['Elastic Stack (ELK)','Open source. Elasticsearch + Logstash + Kibana. Flexible but setup-heavy'],['IBM QRadar','Enterprise environments mein popular. Strong correlation. On-premise aur cloud dono'],['Chronicle (Google)','Google ka cloud SIEM. UDM schema. Large scale retention. GCP ecosystem']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:180px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. SOC Kya Hota Hai?</h2>
      <p>SOC matlab Security Operations Center. Ye ek dedicated team hoti hai jo 24x7 enterprise ke network ko monitor karti hai, alerts triage karti hai, incidents respond karti hai aur threats hunt karti hai. SOC SIEM ke upar kaam karta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Tier 1 Analyst','Alert monitoring, initial triage, false positive identification, escalation'],['Tier 2 Analyst','Deep investigation, log analysis, timeline creation, IOC extraction'],['Tier 3 Analyst','Threat hunting, advanced analysis, custom detection rule creation'],['DFIR Team','Incident response, containment, eradication, recovery, forensics']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>10. Tier 1 Analyst Ka Kaam</h2>
      <p>Tier 1 sabse pehla responder hota hai. Ye analyst SIEM dashboard pe alerts dekhta hai, unhe validate karta hai, determine karta hai ki ye real incident hai ya false positive, aur agar real hai toh Tier 2 ko escalate karta hai.</p>
      <pre><code>Tier 1 Alert Triage Steps:

Alert: Multiple Failed Logins Detected

Step 1: User identify karo
        Kaunsa account? Service account ya human?

Step 2: Source IP identify karo
        Internal ya external? Kaunsa country?

Step 3: Pattern check karo
        Sirf ek user pe attempts ya multiple?

Step 4: Success hua?
        Fail ke baad success = brute force + compromise

Step 5: Decision: Real incident ya false positive?</code></pre>

      <h2>11. Tier 2 Analyst Ka Kaam</h2>
      <p>Tier 2 escalated incidents ki deep investigation karta hai. Multiple log sources analyze karta hai, complete timeline banata hai, IOCs extract karta hai aur scope determine karta hai ki kitne systems affected hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Log Analysis','Multiple sources se correlated logs analyze karna'],['Timeline','Exact sequence of events reconstruct karna'],['IOC Extraction','IPs, domains, hashes, user accounts extract karna'],['Scope Assessment','Kitne systems, users ya data affected hai determine karna'],['Escalation Report','DFIR ya Tier 3 ke liye detailed findings document karna']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:180px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>12. Alert Lifecycle</h2>
      <pre><code>Alert Trigger (SIEM rule fire hoti hai)
       |
  Tier 1 Triage
  (real ya false positive?)
       |
  Validation
  (context gather karo)
       |
  Escalation (agar real)
  (Tier 2 ko assign karo)
       |
  Deep Investigation
  (logs, timeline, IOCs)
       |
  Containment Decision
  (isolate, block, disable)
       |
  DFIR Handoff (agar needed)
       |
  Closure aur Documentation</code></pre>

      <h2>13. Alert Triage</h2>
      <p>Alert triage SOC analyst ki sabse important skill hai. Roz saikdon alerts generate hoti hain. Analyst ko quickly decide karna hota hai ki kounsi alert real threat hai, kounsi false positive hai aur kaunsi urgent escalation chahti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Real Incident','Actual threat. Investigate karo, escalate karo'],['False Positive','Benign activity ne rule trigger kiya. Document karo, close karo'],['True Negative','No alert, no attack. Normal operations'],['False Negative','Attack hua lekin alert nahi. Most dangerous. Rule tuning zaroori']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>14. Brute Force Detection</h2>
      <p>Brute force ek bahut common attack hai aur SIEM mein sabse frequently seen alerts mein se ek hai. Pattern clearly visible hota hai: multiple failed attempts followed by a success.</p>
      <pre><code>Brute Force Pattern in SIEM:

10:00:01  Failed Login  user=admin  src=185.220.x.x
10:00:02  Failed Login  user=admin  src=185.220.x.x
10:00:03  Failed Login  user=admin  src=185.220.x.x
10:00:04  Failed Login  user=admin  src=185.220.x.x
10:00:05  Successful Login  user=admin  src=185.220.x.x

ALERT: Brute Force Success Detected</code></pre>
      <div class="info-box"><p><strong>Triage Questions:</strong> Same IP se attempts? Account lockout policy kaam ki? Success ke baad kya kiya gaya? Kahan se login hua geography wise?</p></div>

      <h2>15. Password Spray Detection</h2>
      <p>Password spray brute force se alag hai. Brute force ek user pe bahut passwords try karta hai. Password spray ek password ko bahut users pe try karta hai. Account lockout se bachne ka tarika hai. SIEM mein pattern alag dikhta hai.</p>
      <pre><code>Password Spray Pattern:

10:00:01  Failed Login  user=alice   src=185.x.x.x
10:00:02  Failed Login  user=bob     src=185.x.x.x
10:00:03  Failed Login  user=charlie src=185.x.x.x
10:00:04  Failed Login  user=diana   src=185.x.x.x
10:00:05  Successful    user=bob     src=185.x.x.x

One password, many users.
Lockout threshold avoid kiya gaya.</code></pre>

      <h2>16. Malware Detection Use Case</h2>
      <p>Malware detection mein SIEM multiple log sources correlate karta hai. Koi ek event akele suspicious nahi lagta lekin sequence mein dekhne pe attack chain clear ho jaata hai.</p>
      <pre><code>Correlated Malware Detection:

DNS Log:
  user HOST-042 queried abc-malware-c2.xyz

Proxy Log:
  HOST-042 downloaded update.exe from 185.x.x.x

Endpoint Log:
  update.exe executed by user alex

EDR Alert:
  Suspicious process: powershell.exe -enc [base64]

Flow Log:
  HOST-042 -> 185.x.x.x every 60 seconds

SIEM Correlation: Malware Infection + C2 Beaconing</code></pre>

      <h2>17. Data Exfiltration Detection</h2>
      <p>Data exfiltration ka matlab data steal kar ke bahar le jaana. SIEM mein ye network flow data aur proxy logs mein visible hota hai. Normal baseline ke upar significant spike investigation trigger karta hai.</p>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="13" r="0.8" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">EXFILTRATION INDICATORS IN SIEM</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${['Outbound traffic spike. User ka normal 200MB/day, aaj 40GB gaya ek session mein','Unknown destination. Traffic kisi aisi IP ya domain pe ja raha hai jo pehle kabhi use nahi hua','After-hours transfer. Raat 2 AM pe large upload, normal business hours se bahar','Compressed files. Large .zip ya .rar files suddenly create aur transfer hue'].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(220,20,20,0.12);">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><circle cx="7" cy="7" r="6" stroke="#dc1414" stroke-width="1.2"/><path d="M5 5l4 4M9 5l-4 4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>18. Detection Rules</h2>
      <p>SIEM rules define karte hain ki kab alert generate hogi. Har rule ek specific threat ya suspicious pattern ko target karta hai. Rules condition-based hote hain aur threshold, time window aur field matching pe depend karte hain.</p>
      <pre><code>Rule: Brute Force Followed by Success

IF:
  event_type = "Failed Login"
  AND count >= 5
  AND time_window = 2 minutes
  AND same source_ip

THEN followed by:
  event_type = "Successful Login"
  AND same source_ip

FIRE ALERT: Priority HIGH</code></pre>

      <h2>19. Detection Engineering</h2>
      <p>Detection engineering matlab threats ko detection rules mein convert karna. Ye ek specialized skill hai. Analyst pehle threat ko samajhta hai, phir us threat ka SIEM mein observable signature dhundta hai, phir rule likhta hai aur phir tune karta hai false positives kam karne ke liye.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Threat Understanding','Attack technique kya hai, kaise kaam karta hai, kya evidence chhodta hai'],['Observable Mapping','Kaunse log fields mein ye activity visible hogi'],['Rule Writing','SIEM query ya rule syntax mein condition define karna'],['Testing','Known attack data pe rule test karna'],['Tuning','False positives kam karna without missing real attacks']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:200px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>20. Threat Intelligence Integration</h2>
      <p>Threat Intelligence feeds SIEM ko known-bad indicators provide karte hain. IPs, domains aur file hashes jo already malicious known hain. SIEM automatically apne logs un indicators se match karta hai aur alert fire karta hai.</p>
      <pre><code>Threat Intel Feed Example:
  IP:     185.220.101.47   (Tor exit node, known malicious)
  Domain: evil-c2-2024.xyz (Active C2 infrastructure)
  Hash:   4a8b2c... (Ransomware dropper)

SIEM Matching:
  DNS Log: HOST-042 queried evil-c2-2024.xyz
  Match Found -> ALERT: Known Malicious Domain Contact</code></pre>

      <h2>21. IOC Matching</h2>
      <p>IOC matching sabse common SIEM detection method hai. Threat intelligence se milne wale indicators automatically sab incoming logs se match hote rehte hain. Koi bhi match aane pe alert generate hoti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['IP Matching','Flow logs aur firewall logs mein known-bad IPs dhundho'],['Domain Matching','DNS logs mein malicious domains dhundho'],['Hash Matching','Endpoint logs mein known malware file hashes dhundho'],['URL Matching','Proxy logs mein malicious URLs dhundho'],['Email Indicator','Email headers mein known-bad sender domains dhundho']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:180px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>22. UEBA</h2>
      <p>UEBA matlab User and Entity Behavior Analytics. Ye advanced detection technique hai jo normal behavior ka baseline banata hai aur phir deviations detect karta hai. Rule-based detection ke comparison mein ye zyada sophisticated hai kyunki ye anomalies pakadta hai jinke liye specific rules exist nahi karti.</p>
      <pre><code>UEBA Baseline Example:

User: alex.doe
  Normal Login Time  : 9 AM - 6 PM
  Normal Location    : Mumbai, India
  Normal Data Access : ~500MB/day
  Normal Systems     : Workstation, email, CRM

UEBA Alert Triggers:
  Login at 3 AM               -> Unusual time
  Login from Ukraine           -> Impossible travel
  Data access 45GB in one day  -> Volume anomaly
  Accessed payroll database    -> New resource</code></pre>

      <h2>23. Insider Threat Detection</h2>
      <p>Insider threat detection mein UEBA particularly useful hai. Malicious insider apni legitimate credentials use karta hai isliye traditional IOC matching kaam nahi karta. Behavior change hi primary indicator hota hai.</p>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="13" r="0.8" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">INSIDER THREAT INDICATORS</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${['Sudden large data downloads. Normally 500MB/day, resignation ke baad 80GB downloaded','Accessing resources outside job role. Finance user accessing source code repositories','After-hours activity. Regular 9-5 employee suddenly active at midnight','USB device usage spike. Multiple large transfers to removable media','Bulk email forwarding. Internal emails forward ho rahe hain external address pe'].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(220,20,20,0.12);">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><circle cx="7" cy="7" r="6" stroke="#dc1414" stroke-width="1.2"/><path d="M5 5l4 4M9 5l-4 4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>24. MITRE ATT&CK Integration</h2>
      <p>MITRE ATT&CK ek globally accepted framework hai jo adversary tactics aur techniques ko categorize karta hai. Modern SIEMs ATT&CK ke saath integrate hote hain taaki har alert ko specific technique ID se map kiya ja sake.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['T1110','Brute Force. Multiple failed login attempts'],['T1078','Valid Accounts. Legitimate credentials ka misuse'],['T1071','Application Layer Protocol. C2 over HTTP/DNS/HTTPS'],['T1048','Exfiltration Over Alternative Protocol. Data bahar bheja gaya'],['T1136','Create Account. New backdoor user banaya gaya']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>25. False Positive Management</h2>
      <p>False positives SOC ka sabse bada challenge hain. Alert fatigue hoti hai jab analysts baar baar false positives dekhte dekhte real incidents ko bhi ignore karna shuru kar dete hain. Detection rules ko tune karna essential hai.</p>
      <pre><code>False Positive Example:

Alert: Port Scan Detected
Source: 10.0.0.50
Target: Multiple internal IPs

Investigation:
  10.0.0.50 = Nessus Vulnerability Scanner
  Authorized weekly scan tha

Resolution:
  Scanner IP ko whitelist karo
  Rule mein exception add karo
  Document karo kyun whitelist kiya</code></pre>

      <h2>26. MTTD aur MTTR</h2>
      <p>Ye do metrics SOC performance measure karte hain. MTTD batata hai ki attack hone ke kitne time baad detect hua. MTTR batata hai ki detect hone ke baad kitne time mein response complete hua. Dono jitne kam hon utna achha.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['MTTD','Mean Time To Detect. Attack se alert tak kitna time laga. Industry average ~200 days hai. Goal: minimize karo'],['MTTR','Mean Time To Respond. Alert se containment tak kitna time laga. Goal: jitna ho sake kam karo']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:100px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>27. Splunk Basics</h2>
      <p>Splunk industry ka sabse popular SIEM hai. Search Processing Language (SPL) use karta hai. SOC analyst ke liye basic SPL queries aani chahiye.</p>
      <pre><code>Basic Splunk Queries:

All failed logins:
  index=main sourcetype=windows EventCode=4625

Failed logins by user:
  index=main EventCode=4625
  | stats count by user
  | sort -count

Brute force detection:
  index=main EventCode=4625
  | stats count by src_ip user
  | where count > 5

DNS queries to suspicious domains:
  index=main sourcetype=dns
  | search query="*.xyz" OR query="*.ru"
  | stats count by query src_ip</code></pre>

      <h2>28. Microsoft Sentinel Basics</h2>
      <p>Microsoft Sentinel Azure-based cloud SIEM hai. KQL (Kusto Query Language) use karta hai. Enterprise Azure environments mein bahut common hai.</p>
      <pre><code>Basic KQL Queries:

Failed logins:
  SecurityEvent
  | where EventID == 4625
  | project TimeGenerated, Account, IpAddress

Brute force:
  SecurityEvent
  | where EventID == 4625
  | summarize count() by Account, IpAddress
  | where count_ > 5

DNS threat detection:
  DnsEvents
  | where Name contains ".xyz"
  | project TimeGenerated, Computer, Name</code></pre>

      <h2>29. Enterprise Investigation Workflow</h2>
      <pre><code>Step 1: Alert receive karo ya anomaly detect karo
        SIEM dashboard se ya automated ticket se

Step 2: Asset identify karo
        Kaunsa host? IP se hostname map karo
        Kaunsi OS? Kaunsa department?

Step 3: User identify karo
        Kaunsa account involved hai?
        Service account ya human user?
        Normal behavior kya tha?

Step 4: Multi-source log review
        DNS, firewall, proxy, endpoint, cloud logs

Step 5: Timeline create karo
        Chronological order mein sab events

Step 6: IOCs extract karo
        IPs, domains, hashes, user accounts, file names

Step 7: Scope assess karo
        Sirf ek system ya multiple affected?

Step 8: Findings document karo
        Evidence, timeline, IOCs, recommendations</code></pre>

      <h2>30. Correlation Example - Full Attack Chain</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Malware Infection Enterprise Network</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          DNS Log: <span style="color:#dc1414;font-weight:600;">HOST-042</span> ne queried <span style="color:#dc1414;font-weight:600;">abc-malware.xyz</span><br>
          Proxy Log: <span style="color:#dc1414;font-weight:600;">update.exe</span> download hua 185.x.x.x se<br>
          Endpoint: <span style="color:#dc1414;font-weight:600;">update.exe</span> execute hua user <span style="color:#dc1414;font-weight:600;">alex</span> ke account se<br>
          EDR: <span style="color:#dc1414;font-weight:600;">powershell.exe -enc [base64]</span> launched by update.exe<br>
          Flow Log: <span style="color:#dc1414;font-weight:600;">HOST-042</span> -> 185.x.x.x har 60 seconds (beaconing)<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Phishing/drive-by download. Malware infection. Active C2 beaconing. Immediate containment required.</span>
        </div>
      </div>

      <h2>31. Timeline Example</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['10:00','Phishing email received. alex@company.com ne open kiya'],['10:01','DNS query: abc-malware.xyz. HOST-042 se'],['10:02','Proxy: update.exe downloaded from 185.220.101.47'],['10:02','Endpoint: update.exe executed, new process spawned'],['10:03','PowerShell: encoded command execute hua. Registry persistence'],['10:05','Flow: beaconing shuru. Har 60 sec, 242 bytes, same IP'],['10:45','EDR Alert: Suspicious activity. Analyst ko notify hua']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:70px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>32. Lateral Movement Detection in SIEM</h2>
      <p>Lateral movement detect karna SIEM ke liye challenging hai kyunki attacker legitimate credentials use karta hai. Indicators patterns mein hote hain, individual events mein nahi.</p>
      <pre><code>Lateral Movement Indicators in SIEM:

Authentication Logs:
  HOST-042 ne suddenly HOST-DB01 pe login kiya
  Pehle kabhi ye connection nahi tha

SMB/RPC:
  Unusual admin$ share access
  PsExec ya WMI execution remotely

Service Creation:
  HOST-042 se HOST-DB01 pe naya service create hua

Credential Access:
  lsass.exe se unusual memory reads (mimikatz pattern)</code></pre>

      <h2>33. SOC Analyst Daily Workflow</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Shift Start','Dashboard check karo. Outstanding alerts, overnight incidents review'],['Alert Queue','Priority pe triage karo. High severity pehle'],['Investigation','Each alert ke liye context gather karo, logs analyze karo'],['Escalation','Real incidents Tier 2 ko assign karo. Clear handoff notes'],['Documentation','Har action document karo. Evidence trail maintain karo'],['Shift Handoff','Next shift ko pending items, active incidents clearly communicate karo']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>34. Documentation Best Practices</h2>
      <p>Har investigation properly document honi chahiye. Documentation sirf formality nahi hai. Ye future investigations mein help karta hai, legal proceedings mein evidence provide karta hai aur team knowledge build karta hai.</p>
      <pre><code>Investigation Documentation Template:

Incident ID   : INC-2024-0542
Date          : 2024-05-18
Analyst       : [Name]
Severity      : High

Summary:
  HOST-042 compromised via malware download.
  Active C2 beaconing detected.

Timeline:
  10:00 - Phishing email opened
  10:02 - Malware downloaded and executed
  10:05 - C2 beaconing started

IOCs:
  IP: 185.220.101.47
  Domain: abc-malware.xyz
  File: update.exe (hash: 4a8b2c...)

Affected Assets:
  HOST-042 (alex.doe account)

Actions Taken:
  HOST-042 isolated from network
  Credentials reset
  Escalated to DFIR team

Recommendations:
  Email gateway block sender domain
  Add IOCs to threat intel feeds</code></pre>

      <h2>35. Common Beginner Mistakes in SOC</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Alert fatigue ignore karna','Jab alerts zyada hon toh tuning zaroori hai, ignore nahi karna'],['Sirf triggered alert dekhna','Context gather karo. Neighboring events bhi check karo'],['Documentation skip karna','Time pressure mein bhi basic documentation zaroori hai'],['Escalation delay karna','Agar confident nahi ho, escalate karo. Deri karna zyada dangerous hai'],['False positive close karna bina root cause','Why false positive aaya? Rule tuning ki zaroorat hai?']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>36. Practical Lab 1 - Brute Force Investigation</h2>
      <pre><code>Objective: Brute force attack investigate karo

Step 1: SIEM mein EventCode=4625 filter karo
Step 2: Same source IP se attempts count karo
Step 3: Successful login (EventCode=4624) check karo
        Same source IP ne success hua?
Step 4: Success ke baad activity check karo
        Kya kiya us account ne?
Step 5: Geographic check karo
        Source IP kahan se hai?
Step 6: Account lockout policy check karo
        Kaafi accounts lock hue? Password spray?</code></pre>

      <h2>37. Practical Lab 2 - Malware Investigation</h2>
      <pre><code>Objective: Malware infection ka complete chain trace karo

Step 1: EDR alert se start karo
        Kaunsa process suspicious tha?
Step 2: Parent process identify karo
        Malware kaise execute hua?
Step 3: DNS logs check karo
        Kaunse domains query hue us host se?
Step 4: Proxy logs check karo
        Downloads hua? Kahan se?
Step 5: Flow logs check karo
        Outbound beaconing pattern hai?
Step 6: Timeline banao, C2 IP extract karo</code></pre>

      <h2>38. Practical Lab 3 - Insider Threat Hunt</h2>
      <pre><code>Objective: Unusual data access detect karo

Step 1: DLP alerts ya proxy logs check karo
        Unusually large uploads kisi ne kiye?
Step 2: User baseline compare karo
        Normal activity kya tha pehle?
Step 3: Access pattern check karo
        User ne kaunse new resources access kiye?
Step 4: Time pattern check karo
        After-hours activity hai?
Step 5: USB ya removable media logs check karo
Step 6: Correlation: downloads + uploads + timing</code></pre>

      <h2>39. Interview Questions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SIEM ka purpose kya hai?','Central log collection, correlation aur alerting platform. Distributed logs ko ek jagah laana'],['Normalization kya hai?','Alag sources ke same type ke fields ko common schema mein convert karna taaki correlation ho sake'],['False Positive vs False Negative?','FP: alert aaya lekin attack nahi tha. FN: attack hua lekin alert nahi aaya. FN zyada dangerous hai'],['Tier 1 aur Tier 2 difference?','Tier 1: triage aur initial validation. Tier 2: deep investigation, timeline, IOC extraction'],['MTTD aur MTTR kya hain?','MTTD: attack se detection tak time. MTTR: detection se response complete tak time'],['Detection Engineering kya hai?','Threat ko SIEM rule mein convert karna. Write, test, tune cycle'],['UEBA kya karta hai?','Normal user behavior baseline banata hai aur deviations detect karta hai. Insider threat ke liye useful']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;min-width:40px;text-align:center;">Q${i+1}</span>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span>
            <span style="font-family:'Inter',sans-serif;font-size:11px;color:#777;">${r[1]}</span>
          </div>
        </div>`).join('')}
      </div>

      <!-- PART 18 COMPLETE BANNER -->
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.3);border-radius:14px;padding:28px 24px;margin:0 0 28px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;right:0;width:180px;height:180px;background:radial-gradient(circle,rgba(220,20,20,0.07) 0%,transparent 70%);pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          <div style="flex-shrink:0;">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.6"/>
              <path d="M16 24l6 6 10-12" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 18 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">SIEM &amp; Enterprise Investigation</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">SIEM architecture se Splunk queries tak, SOC tiers se detection engineering tak, brute force se insider threat detection tak. Enterprise investigation ka poora framework ab tumhare paas hai. 39 topics, real scenarios, practical labs, interview preparation.</p>
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
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 19 mein Real Incident Case Studies seekhenge. Complete real-world investigations, multi-source correlation, ransomware investigation, APT detection, supply chain attack aur full incident response walkthroughs.</p>
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
            'SIEM mein normalization kyun zaroori hai? Bina normalization ke kya problem hogi?',
            'Brute force aur password spray attack ka detection pattern kaise alag hota hai SIEM mein?',
            'False Positive aur False Negative mein kaunsa zyada dangerous hai aur kyun?',
            'UEBA traditional rule-based detection se kaise different hai? Insider threat mein kyun important hai?',
            'MTTD 200 days industry average kya batata hai? Ye kam karne ke liye kya karna chahiye?',
            'Ek malware infection ka complete investigation workflow likhao. Kaunse logs, kaunse steps.'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
