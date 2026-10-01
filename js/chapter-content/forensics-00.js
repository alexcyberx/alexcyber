// Extracted from js/chapters.js — Network Forensics course, chapter index 0.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent00 = `

      <h2>1. What is Network Forensics?</h2>
      <p>Network Forensics matlab hai network mein aane-jaane wale data packets, logs, aur traffic ko collect, monitor, analyze aur investigate karna, taaki:</p>
      <ul>
        <li>Attack pata chale</li>
        <li>Hacker ki activity track ho</li>
        <li>Malware detect ho</li>
        <li>Evidence collect ho</li>
        <li>Incident solve ho sake</li>
      </ul>
      <div class="info-box"><p><strong>Simple Definition:</strong> Jaise ek detective crime scene pe clues collect karta hai, waise hi Network Forensics analyst network traffic mein se attack ke clues dhundhta hai.</p></div>

      <h2>2. Real-Life Example</h2>
      <p>Maan lo kisi company ka confidential data leak ho gaya. Ab investigator check karega:</p>
      <ul>
        <li>Kis IP ne connect kiya?</li>
        <li>Kaunsi file transfer hui?</li>
        <li>Attack kab shuru hua?</li>
        <li>Attacker kaunse protocol use kar raha tha?</li>
        <li>Kya malware traffic tha?</li>
        <li>Data kahan bheja gaya?</li>
      </ul>
      <p>Ye sab Network Forensics mein aata hai.</p>

      <h2>3. Network Forensics vs Cyber Security</h2>

      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TOPIC</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">FOCUS</span>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="display:flex;align-items:center;gap:8px;padding:10px 16px 6px;">
            <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">COMPARISON</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px 16px 16px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">Network Forensics</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;">Attack investigate karna</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;width:fit-content;">Evidence collection</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);">
          <div style="display:flex;align-items:center;gap:8px;padding:10px 16px 6px;">
            <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">COMPARISON</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px 16px 16px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">Cyber Security</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;">Attack rokna</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;width:fit-content;">Prevention</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);">
          <div style="display:flex;align-items:center;gap:8px;padding:10px 16px 6px;">
            <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">COMPARISON</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px 16px 16px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">Ethical Hacking</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;">Weakness dhundhna</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;width:fit-content;">Penetration testing</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);">
          <div style="display:flex;align-items:center;gap:8px;padding:10px 16px 6px;">
            <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">COMPARISON</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:10px 16px 16px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">DFIR</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;">Incident response</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;width:fit-content;">Response + Investigation</div>
          </div>
        </div>
      </div>

      <h2>4. Why Network Forensics Important?</h2>
      <p>Kyunki:</p>
      <ul>
        <li>Modern attacks network se hote hain</li>
        <li>Malware internet use karta hai</li>
        <li>Data theft network se hoti hai</li>
        <li>Hackers remote access lete hain</li>
        <li>Evidence packets mein milta hai</li>
      </ul>

      <h2>5. Where Network Forensics Used?</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:16px 18px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">USE CASE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">Companies</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.5;">Data breach investigation</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:16px 18px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">USE CASE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">Government</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.5;">Cyber espionage track</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:16px 18px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">USE CASE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">Law Enforcement</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.5;">Digital evidence collect</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:16px 18px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">USE CASE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">SOC Teams</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.5;">Real-time threat monitoring</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:16px 18px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">USE CASE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">Banks</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.5;">Fraud detection</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:16px 18px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">USE CASE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">Cloud Systems</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:1.5;">Traffic investigation</div>
          </div>
        </div>
      </div>

      <h2>6. Skills Required</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="padding:14px 16px 6px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">BASIC</span></div>
          <div style="padding:10px 16px 16px;display:flex;flex-direction:column;gap:8px;">
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">Networking basics</div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">IP addressing</div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">Protocol understanding</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">OSI Model</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="padding:14px 16px 6px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">INTERMEDIATE</span></div>
          <div style="padding:10px 16px 16px;display:flex;flex-direction:column;gap:8px;">
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">Wireshark</div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">TCP/IP analysis</div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">PCAP investigation</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">Log analysis</div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="padding:14px 16px 6px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ADVANCED</span></div>
          <div style="padding:10px 16px 16px;display:flex;flex-direction:column;gap:8px;">
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">Threat hunting</div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">Malware traffic analysis</div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">IDS/IPS</div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#a0a0b8;">SIEM &amp; DFIR</div>
          </div>
        </div>
      </div>

      <h2>7. Core Concepts</h2>

      <h3>A. Packet</h3>
      <p>Internet par bheja gaya chhota data unit. Jab tum Google open karte ho, WhatsApp message bhejte ho, ya login karte ho ye sab chhote chhote packets mein travel karta hai. Har packet mein source IP, destination IP, aur actual data hota hai.</p>

      <h3>B. Traffic</h3>
      <p>Packets ka flow = Network Traffic. Teen types hote hain: Normal traffic, Suspicious traffic, aur Malicious traffic.</p>

      <h3>C. Protocol</h3>
      <p>Rules jisse devices communicate karte hain. Har kaam ke liye alag protocol hota hai.</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">HTTP</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-bottom:4px;">Port 80</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Websites</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">HTTPS</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-bottom:4px;">Port 443</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Secure Web</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">DNS</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-bottom:4px;">Port 53</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Domain to IP</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">TCP</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-bottom:4px;">Various</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Reliable Comm</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">UDP</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-bottom:4px;">Various</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Fast, No Ack</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">ICMP</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-bottom:4px;">Network</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 9px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Ping / Errors</div>
        </div>
      </div>

      <h3>D. Logs</h3>
      <p>System aur network devices ke records hote hain: firewall logs, router logs, server logs, VPN logs. Ye sab attack ki timeline reconstruct karne mein help karte hain.</p>

      <h3>E. PCAP</h3>
      <p>PCAP matlab Packet Capture. Ye ek file format hai jisme network traffic store rehti hai. Wireshark ya tcpdump se capture ki gayi traffic is format mein save hoti hai. Network Forensics mein PCAP file sabse important evidence hoti hai.</p>

      <h2>8. Types of Network Attacks</h2>

      <div style="display:flex;flex-direction:column;gap:14px;margin:0 0 28px;">

        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
          
          <div style="padding:20px 22px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ATTACK TYPE</span>
            </div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:8px;letter-spacing:0.5px;">DDoS Attack</div>
            <div style="font-family:'Inter',sans-serif;font-size:14px;color:#aaa;line-height:1.6;margin-bottom:12px;">Server ko itna zyada traffic bhejo ki wo crash ho jaye aur legitimate users access na kar sakein.</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Volumetric / Amplification</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
          
          <div style="padding:20px 22px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ATTACK TYPE</span>
            </div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:8px;letter-spacing:0.5px;">Phishing</div>
            <div style="font-family:'Inter',sans-serif;font-size:14px;color:#aaa;line-height:1.6;margin-bottom:12px;">Fake websites aur emails ke through user ke credentials aur personal information chori karna.</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Social Engineering</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
          
          <div style="padding:20px 22px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ATTACK TYPE</span>
            </div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:8px;letter-spacing:0.5px;">Malware C2</div>
            <div style="font-family:'Inter',sans-serif;font-size:14px;color:#aaa;line-height:1.6;margin-bottom:12px;">Malware apne Command and Control server se connect karke instructions leta hai aur data bhejta hai.</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Command and Control</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
          
          <div style="padding:20px 22px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ATTACK TYPE</span>
            </div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:8px;letter-spacing:0.5px;">Data Exfiltration</div>
            <div style="font-family:'Inter',sans-serif;font-size:14px;color:#aaa;line-height:1.6;margin-bottom:12px;">Secret aur sensitive data ko network ke through attacker ke server par bhejana.</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">DNS / HTTP Tunneling</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
          
          <div style="padding:20px 22px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ATTACK TYPE</span>
            </div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:8px;letter-spacing:0.5px;">MITM Attack</div>
            <div style="font-family:'Inter',sans-serif;font-size:14px;color:#aaa;line-height:1.6;margin-bottom:12px;">Do devices ke beech mein ghus ke network traffic ko intercept karna aur data read ya modify karna.</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">ARP Spoofing / SSL Strip</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
          
          <div style="padding:20px 22px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ATTACK TYPE</span>
            </div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:8px;letter-spacing:0.5px;">Port Scanning</div>
            <div style="font-family:'Inter',sans-serif;font-size:14px;color:#aaa;line-height:1.6;margin-bottom:12px;">Target machine ke open ports dhundh ke vulnerable entry point identify karna aur exploit karna.</div>
            <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:11px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Nmap / Masscan Patterns</div>
          </div>
        </div>

      </div>

      <h2>9. Network Forensics Workflow</h2>

      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(220,20,20,0.3);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
            <div style="font-size:10px;font-weight:600;color:#7878a0;letter-spacing:1.5px;font-family:'Rajdhani',monospace;margin-bottom:8px;">STEP 1</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">Detection</div>
            <div style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 9px;font-size:11px;color:#9090b0;font-family:'Inter',sans-serif;font-weight:500;">Suspicious activity</div>
          </div>
          <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
            <div style="font-size:10px;font-weight:600;color:#7878a0;letter-spacing:1.5px;font-family:'Rajdhani',monospace;margin-bottom:8px;">STEP 2</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">Collection</div>
            <div style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 9px;font-size:11px;color:#9090b0;font-family:'Inter',sans-serif;font-weight:500;">Packets + Logs</div>
          </div>
          <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
            <div style="font-size:10px;font-weight:600;color:#7878a0;letter-spacing:1.5px;font-family:'Rajdhani',monospace;margin-bottom:8px;">STEP 3</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">Preservation</div>
            <div style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 9px;font-size:11px;color:#9090b0;font-family:'Inter',sans-serif;font-weight:500;">Evidence safe rakhna</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
            <div style="font-size:10px;font-weight:600;color:#7878a0;letter-spacing:1.5px;font-family:'Rajdhani',monospace;margin-bottom:8px;">STEP 6</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">Reporting</div>
            <div style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 9px;font-size:11px;color:#9090b0;font-family:'Inter',sans-serif;font-weight:500;">Investigation report</div>
          </div>
          <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
            <div style="font-size:10px;font-weight:600;color:#7878a0;letter-spacing:1.5px;font-family:'Rajdhani',monospace;margin-bottom:8px;">STEP 5</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">Correlation</div>
            <div style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 9px;font-size:11px;color:#9090b0;font-family:'Inter',sans-serif;font-weight:500;">Logs + Packets link</div>
          </div>
          <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:16px 18px;">
            <div style="font-size:10px;font-weight:600;color:#7878a0;letter-spacing:1.5px;font-family:'Rajdhani',monospace;margin-bottom:8px;">STEP 4</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">Analysis</div>
            <div style="display:inline-block;background:rgba(255,255,255,0.06);border-radius:4px;padding:2px 9px;font-size:11px;color:#9090b0;font-family:'Inter',sans-serif;font-weight:500;">Traffic analyze karna</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px 16px;text-align:center;font-family:'Inter',sans-serif;font-size:12px;color:#888;">Har step ka apna importance hai - koi bhi skip nahi karna</div>
      </div>

      <h2>10. Important Tools</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="padding:14px 16px 6px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">BEGINNER</span></div>
          <div style="padding:10px 16px 16px;display:flex;flex-direction:column;gap:10px;">
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Wireshark</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Packet analysis GUI</div>
            </div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">tcpdump</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">CLI packet capture</div>
            </div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Nmap</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Network scanning</div>
            </div>
            <div>
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Netstat</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Active connections</div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="padding:14px 16px 6px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">INTERMEDIATE</span></div>
          <div style="padding:10px 16px 16px;display:flex;flex-direction:column;gap:10px;">
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Zeek (Bro)</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Network monitoring</div>
            </div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Snort</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Intrusion detection</div>
            </div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Suricata</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Threat detection IDS</div>
            </div>
            <div>
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">NetworkMiner</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Artifact extraction</div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="padding:14px 16px 6px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 9px;font-size:10px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ADVANCED</span></div>
          <div style="padding:10px 16px 16px;display:flex;flex-direction:column;gap:10px;">
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Splunk</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">SIEM platform</div>
            </div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">ELK Stack</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Log analysis</div>
            </div>
            <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Security Onion</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Full SOC platform</div>
            </div>
            <div>
              <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:2px;">Arkime</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Large PCAP analysis</div>
            </div>
          </div>
        </div>
      </div>

      <h2>11. Most Important Tool Wireshark</h2>
      <p>Wireshark world ka most popular packet analyzer hai. Ye ek GUI-based tool hai jo live network traffic capture karta hai aur usse analyze karne deta hai.</p>
      <ul>
        <li>Live traffic capture</li>
        <li>Packet inspection (har packet ka detail)</li>
        <li>Protocol decoding</li>
        <li>PCAP file analysis</li>
        <li>Display filters</li>
        <li>Malware traffic investigation</li>
      </ul>

      <h2>12. How Data Travels Google Example</h2>
      <p>Jab tum Google open karte ho, network par ye sab hota hai aur Network Forensics analyst yahi sab analyze karta hai:</p>

      <div style="display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;margin:0 0 28px;align-items:stretch;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.25);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:80px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">DNS</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-bottom:6px;">Request</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 7px;font-size:10px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">google.com</div>
        </div>
        <div style="display:flex;align-items:center;color:#dc1414;font-size:18px;">→</div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:80px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">IP</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-bottom:6px;">Resolve</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 7px;font-size:10px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">142.250.x.x</div>
        </div>
        <div style="display:flex;align-items:center;color:#dc1414;font-size:18px;">→</div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:80px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">TCP</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-bottom:6px;">Handshake</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 7px;font-size:10px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">SYN/SYN-ACK</div>
        </div>
        <div style="display:flex;align-items:center;color:#dc1414;font-size:18px;">→</div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:80px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">TLS</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-bottom:6px;">Handshake</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 7px;font-size:10px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">Encryption</div>
        </div>
        <div style="display:flex;align-items:center;color:#dc1414;font-size:18px;">→</div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:100px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">HTTPS DATA</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-bottom:6px;">Encrypted packets</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:2px 7px;font-size:10px;color:#dc1414;font-family:'Inter',sans-serif;font-weight:500;">exchange hote hain</div>
        </div>
      </div>

      <h2>13. Career Roles</h2>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:14px 14px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ROLE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:8px;">SOC Analyst</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Threat monitor</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Real-time alerts</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Log review</div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:14px 14px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ROLE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:8px;">DFIR Analyst</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Incident response</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Evidence collect</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Timeline build</div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:14px 14px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ROLE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:8px;">Threat Hunter</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Hidden threats</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Proactive search</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Hypothesis-based</div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:14px 14px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ROLE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:8px;">Malware Analyst</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Malware traffic</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">C2 identification</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Behavioral analysis</div>
            </div>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:14px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;">
          
          <div style="padding:14px 14px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><span style="background:rgba(220,20,20,0.10);border:1px solid rgba(220,20,20,0.28);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;color:#dc1414;letter-spacing:1px;font-family:'Rajdhani',sans-serif;">ROLE</span></div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:8px;">Net Sec Eng</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Secure infra</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">Firewall rules</div>
              <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">IDS/IPS setup</div>
            </div>
          </div>
        </div>
      </div>

      <h2>14. Beginner Mistakes</h2>
      <ul>
        <li>Sirf tools yaad karna bina concepts samjhe tools kaam nahi aate</li>
        <li>Networking skip karna ye sabse badi galti hai, bina networking ke forensics impossible hai</li>
        <li>Protocols ignore karna har attack kisi na kisi protocol mein hota hai</li>
        <li>Packet structure na samajhna packets read karna ek core skill hai</li>
        <li>Linux avoid karna real forensics tools Linux par best kaam karte hain</li>
      </ul>

      <h2>15. What You Must Learn First</h2>
      <p>Priority order follow karo:</p>
      <ul>
        <li><strong>Priority 1 Networking Basics:</strong> IP addressing, subnetting, ports, how internet works</li>
        <li><strong>Priority 2 OSI Model:</strong> 7 layers samajhna, har layer ka role</li>
        <li><strong>Priority 3 TCP/IP:</strong> TCP handshake, UDP, ICMP deeply samajhna</li>
        <li><strong>Priority 4 Wireshark:</strong> Installation, basic capture, filters, packet reading</li>
        <li><strong>Priority 5 PCAP Analysis:</strong> Captured traffic analyze karna, patterns identify karna</li>
      </ul>

      <h2>16. Practical Setup (IMPORTANT)</h2>
      <p>Abhi ye install karo aur practice shuru karo:</p>
      <pre><code># Windows par Wireshark install karo
# wireshark.org se download karo aur setup chalao

# Kali Linux par Wireshark install karo
sudo apt update
sudo apt install wireshark -y

# VirtualBox se Linux VM bhi setup kar sakte ho</code></pre>

      <h2>17. Your First Practice</h2>
      <p>Pehla task karo:</p>
      <ul>
        <li>Wireshark install karo</li>
        <li>Start capture karo</li>
        <li>Browser mein Google open karo</li>
        <li>Stop capture karo</li>
        <li>Observe karo DNS packets, TCP packets, HTTPS packets</li>
      </ul>
      <div class="info-box"><p><strong>Pro Tip:</strong> Display filter mein "dns" type karo sirf DNS packets dikhenge. Ye tumhara pehla forensic filter hoga.</p></div>

      <h2>18. Important Terms</h2>

      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:160px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TERM</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">Packet</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">Chhota data unit jo network par travel karta hai</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">Traffic</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">Packets ka flow - normal, suspicious, malicious</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">Protocol</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">Communication ke rules (HTTP, DNS, TCP, UDP)</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">PCAP</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">Packet Capture file - captured traffic ka format</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">Payload</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">Packet mein actual data (message ya file)</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">Port</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">Communication endpoint number (e.g. 80, 443, 22)</div>
        </div>
      </div>

      <h2>19. Important Terms Recap</h2>
      <p>Ye terms bar bar aayenge poori journey mein. Inhe yaad rakho:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TERM</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['Packet','Chhota data unit jo network par travel karta hai'],['Traffic','Packets ka flow, normal, suspicious ya malicious'],['Protocol','Communication ke rules jaise HTTP, DNS, TCP, UDP'],['PCAP','Packet Capture file, captured traffic ka format'],['Payload','Packet mein actual data jo bheja ja raha hai'],['Port','Communication endpoint number jaise 80, 443, 22'],['Session','Do devices ke beech ek complete connection']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:140px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>20. Part 1 Complete</h2>
      <p>Network Forensics ka foundation ab tumhare paas hai. Tum samajh chuke ho ki ye field sirf tools chalane ke baare mein nahi hai, balki ek investigator ki tarah sochne ke baare mein hai jo network traffic mein se sacha jhootha alag karta hai.</p>
      <p>Jab bhi koi incident hota hai, chahe company ka data leak ho, kisi ka account hack ho, ya koi malware active ho, ek Network Forensics analyst wahi karta hai jo tumne is part mein seekha hai. Packets collect karo, analyze karo, aur evidence banao.</p>
      <p>Part 2 mein networking fundamentals cover honge jo is poori journey ka backbone hain. Bina networking ke Network Forensics sirf ek naam hai, isiliye Part 2 ko seriously lo.</p>

      <div class="info-box">
        <p><strong>Part 1 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Wireshark install karo agar nahi kiya</li>
          <li>Ek baar capture shuru karo aur Google kholo, traffic observe karo</li>
          <li>DNS, TCP, HTTPS packets khud dhundho</li>
          <li>Kali Linux VM setup karo agar nahi hai</li>
        </ul>
      </div>

    `;
