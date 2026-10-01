// Extracted from js/chapters.js — Network Forensics course, chapter index 21.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent21 = `

      <h2>1. Sabse Badi Galatfahmi</h2>
      <p>Bahut log sochte hain ke Wireshark sikhna matlab filters yaad karna. Nahi. Real investigator filters yaad nahi karta. Real investigator traffic samajhta hai, patterns dekhta hai, aur attack ki story build karta hai. 2 GB PCAP mein 5 million packets ho sakte hain. Har packet manually dekhna impossible hai.</p>

      <h2>2. Professional PCAP Workflow</h2>
      <pre><code>PCAP Investigation Order:
  Statistics > Protocol Hierarchy   (traffic types)
  Statistics > Endpoints            (active hosts)
  Statistics > Conversations        (who talked to whom, bytes)
  Filter: dns                       (domain queries)
  Filter: http                      (downloads, uploads)
  Filter: tls                       (encrypted traffic)
  Timeline banao
  IOC extract karo
  Report likho</code></pre>

      <h2>3. Rule Number 1</h2>
      <p>Kabhi bhi PCAP open karke random packets mat dekhna. Pehle overview lo. Pehli cheez: Statistics > Protocol Hierarchy. Is se traffic ka overall picture milta hai aur investigation ki direction set hoti hai.</p>
      <pre><code>Normal traffic example:
  TCP     75%
  DNS      8%
  HTTP    10%
  TLS      7%

Suspicious traffic example:
  DNS     70%
  TLS     30%
  HTTP:    0%

High DNS volume indicate kar sakta hai:
  DNS tunneling ya DGA malware activity</code></pre>

      <h2>4. Host Profiling</h2>
      <p>Statistics > Endpoints aur Statistics > Conversations kholo. Most active host kaunsa hai? Koi host 2 GB transfer kar raha hai? Ye investigation ka starting point hai.</p>
      <pre><code>Host Profile banao:
  DNS use karta hai?
  HTTP use karta hai?
  TLS use karta hai?
  Uploads karta hai?
  After hours bhi active hai?
  Unknown IPs se connect karta hai?</code></pre>

      <h2>5. Key Wireshark Filters</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['dns','Saare DNS queries aur responses'],
          ['http','Saare HTTP requests aur responses'],
          ['tls','Encrypted TLS traffic'],
          ['dns.flags.rcode != 0','Failed DNS queries, DGA detection'],
          ['http.request.method == "GET"','File downloads'],
          ['http.request.method == "POST"','Data upload, C2 communication'],
          ['ip.addr == 192.168.1.10','Specific host isolate karo'],
          ['tcp.flags.syn == 1','New connection attempts'],
          ['frame.time >= "2024-01-01 09:00:00"','Time range filter']
        ].map((r,i)=>`
        <div style="background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);display:grid;grid-template-columns:280px 1fr;gap:8px;padding:10px 14px;align-items:center;">
          <code style="font-family:'Fira Mono','Courier New',monospace;font-size:11px;color:#dc1414;">${r[0]}</code>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#777;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>6. DNS Investigation</h2>
      <p>Sabse important step. Almost every attack DNS touch karta hai. Kaunse domains query hue, kitni baar, failed queries kitni hain.</p>
      <pre><code>Normal domains:
  google.com, microsoft.com, youtube.com

DGA generated domains:
  kx82jda91.com
  pl82js91.net
  mx73kd12.org

DGA ke signs:
  Random looking names, high entropy
  Many NXDOMAIN responses
  Short domain registration age
  Same host, multiple rapid queries in seconds</code></pre>

      <h2>7. HTTP Investigation</h2>
      <pre><code>GET Requests (downloads):
  Filter: http.request.method == "GET"
  Dekhna: kya URL tha, response code kya tha
  Suspicious: .exe, .dll, .bat download

POST Requests (uploads ya C2):
  Filter: http.request.method == "POST"
  Dekhna: kahan post hua, size kitna tha
  Suspicious: regular POST to unknown domain

HTTP Headers mein dhundho:
  User-Agent: normal browser ya suspicious?
  Host: expected domain ya random?
  Referer: kahan se aaya request?</code></pre>

      <h2>8. TLS Investigation</h2>
      <pre><code>TLS Certificate check karo:
  Issuer: Self signed ya trusted CA?
  Subject: CN kya hai?
  Valid from: Kitna purana hai?
  SAN: Multiple domains hain?
  JA3 hash: Known malware fingerprint?

Self signed cert on public IP:
  Legitimate services ye nahi karte
  CN=localhost on routable IP suspicious hai
  Ye attacker-controlled infrastructure ka sign hai</code></pre>

      <h2>9. SNI Analysis</h2>
      <p>TLS traffic encrypted hoti hai lekin SNI (Server Name Indication) visible hoti hai. Isme domain name hota hai jo client connect karna chahta hai. Suspicious domains yahan bhi milte hain.</p>
      <pre><code>Wireshark filter:
  tls.handshake.extensions_server_name

SNI mein dhundho:
  Unknown domains
  Random looking names (DGA pattern)
  Domains registered recently
  Domains not in company whitelist</code></pre>

      <h2>10. Beaconing Detection</h2>
      <pre><code>Flow logs mein pattern:
  10:00:00  host to unknown-ip:443   1.2KB
  10:01:00  host to unknown-ip:443   1.1KB
  10:02:00  host to unknown-ip:443   1.3KB
  10:03:00  host to unknown-ip:443   1.2KB

Characteristics:
  Same interval (every 60 seconds)
  Same destination IP aur port
  Similar packet size
  TLS encrypted, non-business hours bhi active

Modern malware jitter add karta hai:
  120 sec, 135 sec, 108 sec, 122 sec
  Statistical pattern dekho, exact nahi</code></pre>

      <h2>11. IOC Extraction</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Domain','Malicious C2 domains, payload download domains'],
          ['IP Address','C2 server IPs, exfiltration destinations'],
          ['URL','Exact malware download paths'],
          ['File Hash','SHA256 of malicious executables'],
          ['File Name','Malware executable names (.exe, .dll)'],
          ['JA3 Hash','TLS fingerprint of malware client'],
          ['User Agent','Suspicious HTTP user agent strings']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:10px 16px;display:grid;grid-template-columns:130px 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>12. Real Investigation Example</h2>
      <pre><code>Alert: Possible Malware

DNS logs:
  update-check.xyz  (new domain, suspicious)

HTTP logs:
  GET /update.exe   (200 OK, 2.4MB download)

Flow logs (TLS):
  Every 60 seconds, same IP:443

Woh sab mila ke timeline:
  09:00  Phishing email open hua
  09:01  DNS query: update-check.xyz
  09:02  update.exe download hua
  09:03  C2 beaconing shuru hua

Confirmed: Malware infection with active C2</code></pre>

      <h2>13. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Random Packets Dekhna','Bina structure ke PCAP open karna time waste hai'],
          ['DNS Ignore Karna','DNS sabse important source hai, skip karna badi galti'],
          ['Timeline Na Banana','Events ko connect kiye bina story nahi banti'],
          ['IOCs Na Collect Karna','Investigation ke baad block karne ke liye IOCs zaroori hain'],
          ['Evidence Ke Bina Conclusion','Alert se seedha conclusion mat nikalo, evidence dekho']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:180px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>14. Homework</h2>
      <div class="info-box">
        <p style="margin-bottom:12px;">malware-traffic-analysis.net se ek PCAP lo aur ye answer karo:</p>
        ${['Infected host kaunsa tha aur uska IP kya tha?','Malware ne kaunsa domain contact kiya?','Kaunsi file download hui aur uska hash kya tha?','Beaconing hua? Interval kya tha?','Final IOC list banao: domains, IPs, hashes, filenames'].map((q,i)=>`
        <div style="display:flex;gap:10px;align-items:center;background:#0e0e12;border-radius:7px;padding:9px 13px;margin-top:7px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 8px;flex-shrink:0;">Q${i+1}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
        </div>`).join('')}
      </div>

    `;
