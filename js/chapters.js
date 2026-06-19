
function loadChapter(index) {
  currentChapter = index;

  // Update page title with chapter name
  const chapterInfo = chapters[index];
  if (chapterInfo) {
    document.title = chapterInfo.title + ' on AlexCyberX Network Forensics Course';
  }

  // Update sidebar active
  document.querySelectorAll('.chapter-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  const ch = chapters[index];

  // Prev button
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (ch.prev) {
    prevBtn.style.visibility = 'visible';
    document.getElementById('prevTitle').textContent = ch.prev;
    prevBtn.onclick = () => loadChapter(index - 1);
  } else {
    prevBtn.style.visibility = 'hidden';
  }

  if (ch.next) {
    nextBtn.style.visibility = 'visible';
    document.getElementById('nextTitle').textContent = ch.next;
    nextBtn.onclick = () => loadChapter(index + 1);
  } else {
    nextBtn.style.visibility = 'hidden';
  }

  // Content
  if (index === 0) {
    document.getElementById('chapterContent').innerHTML = `

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

  } else if (index === 1) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Why Networking is MOST Important?</h2>
      <p>Agar networking nahi aati, toh:</p>
      <ul>
        <li>Packets samajh nahi aayenge</li>
        <li>Wireshark useless lagega</li>
        <li>Attacks detect nahi honge</li>
        <li>Traffic analysis impossible hoga</li>
      </ul>
      <div class="info-box"><p><strong>Foundation Rule:</strong> Network Forensics ka 80% hissa networking basics par depend karta hai. Ye skip mat karo.</p></div>

      <h2>2. What is a Network?</h2>
      <p>Jab 2 ya zyada devices aapas mein connected hon aur data exchange karen - use Network kehte hain.</p>

      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['LAN','Local Area Network'],['WAN','Wide Area Network'],['MAN','Metropolitan Area Network'],['WLAN','Wireless LAN'],['PAN','Personal Area Network']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Internet Kaise Kaam Karta Hai?</h2>
      <p>Jab tum website open karte ho:</p>
      <pre><code>Step 1: Device request bhejta hai
Step 2: Router ISP ko bhejta hai
Step 3: DNS IP resolve karta hai
Step 4: Server response deta hai
Step 5: Data packets wapas aate hain</code></pre>

      <h2>4. Basic Network Components</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        ${[['Client','Request bhejta hai - Phone, Laptop, Browser'],['Server','Service deta hai - Google, Instagram, YouTube'],['Router','Different networks connect karta hai, packet forwarding, NAT'],['Switch','LAN devices ko connect karta hai'],['Firewall','Malicious traffic block karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. IP Address</h2>
      <p>Har device ka unique address. Bina IP ke internet par koi bhi communicate nahi kar sakta.</p>
      <pre><code>192.168.1.1     (Private IP)
8.8.8.8         (Google DNS - Public IP)
172.16.0.5      (Private IP)</code></pre>

      <h2>6. IPv4 Structure</h2>
      <p>IPv4 = 32-bit address, 4 octets hote hain:</p>
      <pre><code>192  .  168  .  1  .  10
 |       |      |    |
Oct1   Oct2  Oct3  Oct4
(0-255 har octet mein)</code></pre>

      <h2>7. Public vs Private IP</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
        </div>
        ${[['Public IP','Internet access - ISP assign karta hai'],['Private IP','Internal network - router assign karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <p><strong>Private IP Ranges:</strong></p>
      <pre><code>10.0.0.0     – 10.255.255.255
172.16.0.0   – 172.31.255.255
192.168.0.0  – 192.168.255.255</code></pre>

      <h2>8. IP vs MAC Address</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">IP ADDRESS</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MAC ADDRESS</span>
        </div>
        ${[['Logical address','Physical address'],['Change ho sakta hai','Usually fixed rehta hai'],['Internet routing mein use','Local communication mein use'],['Example: 192.168.1.1','Example: 00:1A:2B:3C:4D:5E']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. Port Numbers</h2>
      <p>Ports = Communication doors. Har service ek specific port par kaam karti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 100px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PORT</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">KAAM</span>
        </div>
        ${[['20/21','FTP','File transfer'],['22','SSH','Remote login'],['23','Telnet','Remote access'],['25','SMTP','Email bhejna'],['53','DNS','Domain resolution'],['80','HTTP','Website'],['443','HTTPS','Secure website']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 100px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;color:#f4f4f5;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[2]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Forensics mein:</strong> Malware specific ports use karta hai. Port 4444 (Metasploit), 8080 (proxy), 1337 (hacker ports) - ye suspicious hote hain.</p></div>

      <h2>10. TCP Three-Way Handshake</h2>
      <p>MOST IMPORTANT TOPIC. Har TCP connection 3 steps mein establish hota hai:</p>
      <pre><code>Client ──── SYN ──────────► Server
            "Kya connect kar sakte hain?"

Client ◄─── SYN-ACK ──────── Server
            "Haan, ready hoon"

Client ──── ACK ──────────► Server
            "Connected!"</code></pre>
      <div class="info-box"><p><strong>Investigators detect karte hain:</strong> Port scans (SYN flood), failed connections (RST packets), suspicious sessions using handshake behavior.</p></div>

      <h2>11. Important Protocols</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        ${[['TCP','Reliable communication, connection-oriented, guaranteed delivery. Use: Websites, Login, Banking'],['UDP','Fast communication, no guarantee, low latency. Use: Gaming, Streaming, VoIP'],['ICMP','Ping aur diagnostics ke liye. Use: ping google.com'],['DNS','Domain to IP conversion. google.com → 142.x.x.x'],['HTTP','Normal website traffic - unencrypted'],['HTTPS','Encrypted website traffic - TLS use karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:8px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>12. DNS Resolution Process</h2>
      <p>Jab tum google.com open karte ho:</p>
      <pre><code>1. Browser DNS se puchta hai: "google.com ka IP kya hai?"
2. DNS reply karta hai: "142.250.195.46"
3. TCP connection start hota hai
4. HTTPS communication hoti hai
5. Google ka page aata hai</code></pre>
      <div class="info-box"><p><strong>DNS is GOLD in Forensics:</strong> Malware bhi domain contact karta hai. DNS logs mein suspicious domains dhundhna ek core forensic skill hai.</p></div>

      <h2>13. NAT - Network Address Translation</h2>
      <p>Router private IP ko public IP mein convert karta hai taaki internet access ho sake.</p>
      <pre><code>Private: 192.168.1.5  ──► Router ──► Public: 103.24.x.x</code></pre>
      <div class="info-box"><p><strong>Forensics mein challenge:</strong> Multiple users ek hi public IP share kar sakte hain - isliye exact person identify karna mushkil hota hai. ISP se logs lene padte hain.</p></div>

      <h2>14. Network Traffic Types</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Normal Traffic','Legitimate communication - normal browsing, emails, calls','255,255,255,0.06'],['Suspicious Traffic','Unusual behavior - excessive DNS, strange ports, unknown IPs','220,20,20,0.2'],['Malicious Traffic','Attack traffic - malware C2, exploit traffic, data theft','220,20,20,0.3']].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${r[2]});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>15. Important Forensic Indicators</h2>
      <p>Investigators ye cheezein watch karte hain:</p>
      <ul>
        <li>Unusual ports - known ports ke alawa traffic</li>
        <li>Unknown domains - suspicious DNS queries</li>
        <li>Large uploads - data exfiltration ka sign</li>
        <li>Beaconing - regular intervals par C2 contact</li>
        <li>Repeated failed connections - brute force ya scan</li>
        <li>Encrypted suspicious traffic - hidden malware communication</li>
      </ul>

      <h2>16. Wireshark Practice Tasks</h2>

      <p><strong>Task 1 - DNS Capture:</strong></p>
      <pre><code>Filter: dns
Observe: queries, domain names, responses</code></pre>

      <p><strong>Task 2 - TCP Capture:</strong></p>
      <pre><code>Filter: tcp
Observe: handshake (SYN, SYN-ACK, ACK), ports</code></pre>

      <p><strong>Task 3 - ICMP Ping:</strong></p>
      <pre><code>Terminal mein: ping google.com
Wireshark filter: icmp
Observe: Echo Request, Echo Reply</code></pre>

      <h2>17. Essential Commands</h2>
      <p><strong>Windows:</strong></p>
      <pre><code>ipconfig          # IP, Gateway, DNS dekho
ping google.com   # Connectivity test
netstat -ano      # Active connections dekho</code></pre>

      <p><strong>Linux / Kali:</strong></p>
      <pre><code>ip a              # ya: ifconfig
ss -tunap         # Active connections
ping google.com</code></pre>

      <h2>18. Packet Basics</h2>
      <p>Har packet mein 2 main parts hote hain:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PART</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['Header','Control information jaise source IP, destination IP, protocol, ports'],['Payload','Actual data jo bheja ja raha hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>19. Packet Header Kya Contain Karta Hai?</h2>
      <p>Packet header mein forensics ke liye sabse important information hoti hai:</p>
      <ul>
        <li>Source IP</li>
        <li>Destination IP</li>
        <li>Protocol</li>
        <li>Port numbers</li>
        <li>TCP Flags</li>
        <li>Sequence numbers</li>
      </ul>
      <div class="info-box"><p><strong>Forensics mein:</strong> Sirf header padhke pata chal jaata hai ki attack hua ya nahi, kahan se hua, aur kaunsa protocol use hua.</p></div>

      <h2>20. Network Layers Concept</h2>
      <p>Network communication ko samajhne ke liye 2 major models hain:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:6px;">OSI Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">7 layers hain. Theoretical model jo networking ko describe karta hai. Part 3 mein deep study hogi.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">TCP/IP Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">4 layers hain. Practical model jo actual internet par use hota hai.</div>
        </div>
      </div>

      <h2>21. Common Network Devices in Investigations</h2>
      <p>Cyber investigation mein ye devices important evidence provide karte hain:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">DEVICE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">EVIDENCE</span>
        </div>
        ${[['Router','Connection logs, NAT table'],['Firewall','Blocked traffic, allowed rules'],['Switch','MAC address mapping'],['Proxy','Browsing history, logs'],['IDS','Security alerts, attack signatures']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>22. Why Ports Important in Forensics?</h2>
      <p>Kyunki:</p>
      <ul>
        <li>Malware specific ports use karta hai jaise port 4444 Metasploit ke liye</li>
        <li>Attackers hidden services chalate hain unknown ports par</li>
        <li>Suspicious traffic port number se identify hoti hai</li>
        <li>Port scan detect karna attack ka pehla sign hota hai</li>
      </ul>
      <div class="info-box"><p><strong>Example:</strong> Agar tumhare network mein port 4444 par outbound traffic dikh rahi hai to ye almost certainly malicious hai.</p></div>

      <h2>23. MAC Address Deep</h2>
      <p>MAC address har network card ka unique hardware address hota hai. Ye factory mein assign hota hai.</p>
      <pre><code>Format: 00:1A:2B:3C:4D:5E
Pehle 3 parts: OUI (manufacturer ka code)
Aakhri 3 parts: Unique device identifier</code></pre>
      <div class="info-box"><p><strong>Forensics mein use:</strong> Local network pe kaun sa device tha ye MAC se pata chalta hai. ARP table mein IP aur MAC ka mapping hota hai.</p></div>

      <h2>24. IPv6 Basics</h2>
      <p>IPv4 ke addresses khatam ho rahe hain isliye IPv6 aaya. Forensics mein IPv6 traffic bhi aata hai.</p>
      <pre><code>IPv4: 192.168.1.1  (32-bit)
IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334  (128-bit)</code></pre>

      <h2>25. Subnetting Basics</h2>
      <p>Subnet mask network aur host portion identify karta hai.</p>
      <pre><code>IP:      192.168.1.10
Mask:    255.255.255.0  (/24)
Network: 192.168.1.0
Host:    .10</code></pre>
      <p>Forensics mein subnetting se pata chalta hai ki attacker same network par tha ya bahar se aaya.</p>

      <h2>26. ARP Protocol</h2>
      <p>ARP (Address Resolution Protocol) IP address ko MAC address mein convert karta hai local network par.</p>
      <pre><code>ARP Request:  "192.168.1.1 ka MAC address kya hai?"
ARP Reply:    "00:1A:2B:3C:4D:5E"</code></pre>
      <div class="info-box"><p><strong>ARP Spoofing Attack:</strong> Attacker fake ARP replies bhejta hai taaki traffic intercept kar sake. Wireshark mein suspicious ARP packets dikhte hain.</p></div>

      <h2>27. DHCP Protocol</h2>
      <p>DHCP automatically IP addresses assign karta hai devices ko network join karne par.</p>
      <pre><code>Device joins network
DHCP Server assigns: IP, Subnet, Gateway, DNS
Device gets: 192.168.1.105</code></pre>
      <p>Forensics mein DHCP logs se pata chalta hai ki kaunse device ko kab kaunsa IP mila.</p>

      <h2>28. Firewall Basics</h2>
      <p>Firewall network traffic ko rules ke hisaab se allow ya block karta hai.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;margin-bottom:8px;">Inbound Rules</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">Bahar se andar aane wala traffic control karta hai</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:8px;">Outbound Rules</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">Andar se bahar jaane wala traffic control karta hai</div>
        </div>
      </div>

      <h2>29. Beginner Mistakes</h2>
      <ul>
        <li>Ports ignore karna, har attack kisi port se hota hai</li>
        <li>DNS na samajhna, malware bhi DNS use karta hai</li>
        <li>TCP handshake skip karna, connection behavior samajhna zaroori hai</li>
        <li>Protocols confuse karna, TCP aur UDP ka difference clear hona chahiye</li>
        <li>Headers na padhna, packet header mein sab evidence hota hai</li>
      </ul>

      <h2>30. Part 2 Complete</h2>
      <p>Networking fundamentals ab tumhare paas hai. Ye sab concepts sirf theory nahi hain, ye wahi cheezein hain jo ek real investigator roz use karta hai jab wo kisi case par kaam karta hai.</p>
      <p>Ab jab bhi tum Wireshark kholo, ek packet dekho, ya koi suspicious traffic dekho, tum samjhoge ki wo packet kahan se aaya, kahan ja raha hai, aur kya carry kar raha hai. Ye samajh hi tumhara asli weapon hai.</p>
      <p>Part 3 mein hum OSI Model aur TCP/IP ko ek ek layer karke todenge. Har layer mein kya hota hai, attacker kaise use karta hai, aur forensic investigator kya dhundhta hai, sab kuch seedha practical angle se.</p>

      <div class="info-box">
        <p><strong>Before Part 3 Must Practice:</strong></p>
        <ul style="margin-top:8px;">
          <li>Wireshark mein DNS filter lagao aur dekho kaunse domains query ho rahe hain</li>
          <li>TCP capture karo aur handshake ke teen packets dhundho</li>
          <li>ping google.com karo aur ICMP packets observe karo</li>
          <li>Apne system ka IP address aur MAC address nikalo</li>
          <li>netstat ya ss command se active connections dekho</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>TCP aur UDP mein difference kya hai?</li>
          <li>DNS kya karta hai?</li>
          <li>Port 443 kis ke liye use hota hai?</li>
          <li>SYN packet kya hai?</li>
          <li>MAC address kya hota hai?</li>
        </ul>
      </div>

    `;

  } else if (index === 2) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Why OSI Model is EXTREMELY Important?</h2>
      <p>Agar OSI model nahi aata toh:</p>
      <ul>
        <li>Packet analysis mushkil ho jaati hai</li>
        <li>Wireshark confusing lagta hai</li>
        <li>Attacks samajh nahi aate</li>
        <li>Troubleshooting impossible ho jaati hai</li>
      </ul>
      <div class="info-box"><p><strong>Simple baat:</strong> Wireshark mein jo bhi dikh raha hai wo OSI ki kisi na kisi layer se belong karta hai. Layers samjho toh packets apne aap samajh aayenge.</p></div>

      <h2>2. OSI Model Kya Hai?</h2>
      <p>OSI ka matlab hai Open Systems Interconnection. Ye networking ka ek conceptual framework hai jo batata hai ki data network mein kaise travel karta hai.</p>

      <h2>3. OSI Model Structure</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">NAME</span>
        </div>
        ${[['7','Application'],['6','Presentation'],['5','Session'],['4','Transport'],['3','Network'],['2','Data Link'],['1','Physical']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Easy Memory Trick</h2>
      <p>Neeche se upar yaad karo: <strong>Please Do Not Throw Sausage Pizza Away</strong></p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">WORD</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
        </div>
        ${[['Please','Physical'],['Do','Data Link'],['Not','Network'],['Throw','Transport'],['Sausage','Session'],['Pizza','Presentation'],['Away','Application']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Data Flow Concept</h2>
      <p>Jab tum website open karte ho, data Application se Physical tak neeche jaata hai. Receiver side par reverse hota hai:</p>
      <pre><code>Sender:
Application Layer (7)
       ↓
Presentation Layer (6)
       ↓
Session Layer (5)
       ↓
Transport Layer (4)
       ↓
Network Layer (3)
       ↓
Data Link Layer (2)
       ↓
Physical Layer (1)
       ↓
  [Network par jaata hai]
       ↓
Receiver: reverse process</code></pre>

      <h2>6. Encapsulation</h2>
      <p>Ye MOST IMPORTANT concept hai. Jab data neeche layers mein jaata hai, har layer apna header add karti hai. Isi ko Encapsulation kehte hain.</p>
      <pre><code>[HTTP DATA]
       ↓
[TCP HEADER + DATA]
       ↓
[IP HEADER + TCP + DATA]
       ↓
[ETHERNET HEADER + IP + TCP + DATA]
       ↓
[BITS on wire]</code></pre>

      <h2>7. Decapsulation</h2>
      <p>Receiver side par har layer apna header remove karti hai jab tak actual data nahi mil jaata. Ye Encapsulation ka ulta process hai.</p>

      <h2>8. Layer 7 - Application Layer</h2>
      <p>User seedha is layer se interact karta hai. Browser, email, FTP sab yahan hote hain.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        ${[['HTTP','Normal website traffic'],['HTTPS','Encrypted website traffic'],['FTP','File transfer'],['DNS','Domain to IP resolution'],['SMTP','Email bhejna']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Forensics mein:</strong> Investigators websites visited, emails, DNS queries, aur uploaded files yahan se analyze karte hain.</p></div>

      <h2>9. Layer 6 - Presentation Layer</h2>
      <p>Data formatting, encryption, encoding aur compression yahan hota hai.</p>
      <ul>
        <li>SSL/TLS encryption yahan apply hoti hai</li>
        <li>JPEG, ASCII, UTF-8 encoding yahan hoti hai</li>
        <li>HTTPS traffic ka forensic challenge yahi se shuru hota hai kyunki data encrypt hota hai</li>
      </ul>

      <h2>10. Layer 5 - Session Layer</h2>
      <p>Session start karna, maintain karna aur terminate karna is layer ka kaam hai. Jab tum login karte ho ek session create hoti hai.</p>
      <div class="info-box"><p><strong>Forensics mein:</strong> Session hijacking, abnormal disconnects, aur unauthorized sessions yahan detect hote hain.</p></div>

      <h2>11. Layer 4 - Transport Layer</h2>
      <p>Ye MOST IMPORTANT forensic layer hai. Reliable delivery, segmentation, flow control aur error handling yahan hota hai.</p>

      <h2>12. TCP Deep Analysis</h2>
      <p>TCP provide karta hai reliability, ordered delivery aur acknowledgments.</p>
      <p><strong>TCP Header mein ye fields hote hain:</strong></p>
      <ul>
        <li>Source Port</li>
        <li>Destination Port</li>
        <li>Sequence Number</li>
        <li>ACK Number</li>
        <li>Flags</li>
      </ul>

      <h2>13. TCP Flags</h2>
      <p>Ye VERY IMPORTANT hain. Attack detection mein yahi flags kaam aate hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">FLAG</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['SYN','Connection shuru karna'],['ACK','Acknowledgment bhejana'],['FIN','Connection band karna'],['RST','Connection reset karna'],['PSH','Data turant push karna'],['URG','Urgent data hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Attack examples:</strong> SYN flood attack mein sirf SYN packets aate hain ACK nahi. Stealth scan mein abnormal flag combinations hote hain. Wireshark filter: tcp.flags.syn == 1</p></div>

      <h2>14. UDP Deep Analysis</h2>
      <p>UDP fast hai, connectionless hai aur delivery ki koi guarantee nahi hai. Gaming, streaming aur VoIP mein use hota hai.</p>
      <div class="info-box"><p><strong>Forensics mein:</strong> Malware aksar UDP use karta hai kyunki less overhead hota hai aur tracking mushkil hoti hai.</p></div>

      <h2>15. Layer 3 - Network Layer</h2>
      <p>Packets ko route karna is layer ka kaam hai. IP aur ICMP yahan kaam karte hain.</p>
      <ul>
        <li>Source IP aur Destination IP yahan hota hai</li>
        <li>ICMP ping aur diagnostics ke liye use hota hai</li>
      </ul>
      <div class="info-box"><p><strong>Forensics mein:</strong> Ping sweeps, reconnaissance aur IP tunneling yahan detect hoti hai.</p></div>

      <h2>16. Layer 2 - Data Link Layer</h2>
      <p>Local network communication MAC addresses se hoti hai. Ethernet aur ARP yahan kaam karte hain.</p>
      <pre><code>ARP Request:  "192.168.1.1 ka MAC kya hai?"
ARP Reply:    "00:1A:2B:3C:4D:5E"</code></pre>
      <div class="info-box"><p><strong>ARP Spoofing:</strong> Attacker fake ARP replies bhejta hai taaki traffic intercept kar sake. Is se MITM attack hota hai. Forensics mein duplicate MACs aur ARP poisoning detect karte hain.</p></div>

      <h2>17. Layer 1 - Physical Layer</h2>
      <p>Actual signal transmission yahan hoti hai. Cables, radio waves aur electrical signals is layer par hain. Forensics mein hardware taps aur cable interception is layer se related hai.</p>

      <h2>18. TCP/IP Model</h2>
      <p>Real-world mein TCP/IP model use hota hai jo OSI ka practical version hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TCP/IP LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">OSI EQUIVALENT</span>
        </div>
        ${[['Application','OSI Layer 5, 6, 7'],['Transport','OSI Layer 4'],['Internet','OSI Layer 3'],['Network Access','OSI Layer 1, 2']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>19. OSI vs TCP/IP</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;margin-bottom:12px;">OSI Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Theoretical model hai. 7 layers hain. Sikhne ke liye use hota hai.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:12px;">TCP/IP Model</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Practical model hai. 4 layers hain. Real internet par use hota hai.</div>
        </div>
      </div>

      <h2>20. Packet Journey Example</h2>
      <p>Jab tum https://google.com open karte ho:</p>
      <pre><code>Layer 7  Browser HTTP request create karta hai
       ↓
Layer 6  TLS encryption apply hoti hai
       ↓
Layer 5  Session establish hoti hai
       ↓
Layer 4  TCP segmentation hota hai
       ↓
Layer 3  IP header add hota hai
       ↓
Layer 2  MAC addresses add hote hain
       ↓
Layer 1  Bits wire par transmit hote hain</code></pre>

      <h2>21. Wireshark Layer Analysis</h2>
      <p>Wireshark mein koi bhi packet kholo aur neeche ye sections dikhenge:</p>
      <pre><code>Frame          → Physical layer info
Ethernet II    → Data Link layer
Internet Protocol → Network layer
TCP            → Transport layer
HTTP/HTTPS     → Application layer</code></pre>
      <div class="info-box"><p><strong>Practice:</strong> Koi bhi packet click karo aur har section ko expand karo. Har section ek OSI layer represent karta hai.</p></div>

      <h2>22. Important Wireshark Filters</h2>
      <pre><code>tcp       → Sirf TCP traffic
udp       → Sirf UDP traffic
dns       → Sirf DNS queries
icmp      → Sirf ping traffic
http      → Sirf HTTP traffic
tcp.flags.syn == 1   → Sirf SYN packets
arp       → Sirf ARP traffic</code></pre>

      <h2>23. Layer-wise Common Attacks</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">ATTACK</span>
        </div>
        ${[['Application','SQLi, XSS, DNS poisoning'],['Presentation','SSL stripping attacks'],['Session','Session hijacking, cookie theft'],['Transport','SYN flood, port scanning'],['Network','IP spoofing, ICMP tunneling'],['Data Link','ARP spoofing, MAC flooding'],['Physical','Cable tapping, hardware tap']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>24. Important Forensic Concepts</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Flow','Do systems ke beech complete communication stream'],['Stream Reassembly','Packets combine karke full conversation reconstruct karna'],['Beaconing','Malware ki periodic C2 server se communication']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>25. Real Investigation Example</h2>
      <p>Maan lo suspicious activity detect hui. Investigator layer by layer check karta hai:</p>
      <pre><code>Layer 7 → Kaunse domains query ho rahe hain?
Layer 4 → TCP behavior normal hai ya SYN flood?
Layer 3 → Kaunsi IPs involved hain?
Layer 2 → MAC mapping sahi hai ya ARP spoofing?</code></pre>

      <h2>26. Wireshark Practice Tasks</h2>
      <p><strong>Practice 1:</strong></p>
      <pre><code>Filter: tcp.flags.syn == 1
Observe: TCP SYN packets, port scan detect karo</code></pre>

      <p><strong>Practice 2:</strong></p>
      <pre><code>Filter: arp
Observe: ARP requests aur replies, duplicate MACs check karo</code></pre>

      <p><strong>Practice 3:</strong></p>
      <pre><code>Koi bhi packet kholo aur identify karo:
Source IP, Destination IP
Source Port, Destination Port
Protocol, TCP Flags</code></pre>

      <h2>27. Beginner Mistakes</h2>
      <ul>
        <li>Layers yaad na karna, bina layers ke packet reading mushkil hai</li>
        <li>TCP flags ignore karna, ye attack detection ka core hai</li>
        <li>ARP na samajhna, ARP spoofing bahut common attack hai</li>
        <li>Encapsulation skip karna, bina iske packet structure samajh nahi aata</li>
        <li>Headers na padhna, sab evidence headers mein hota hai</li>
      </ul>

      <h2>28. Most Important Things to Master</h2>
      <p>Is order mein master karo:</p>
      <ul>
        <li>TCP/IP model aur OSI layers</li>
        <li>TCP flags aur unka meaning</li>
        <li>Port numbers</li>
        <li>IP headers</li>
        <li>ARP protocol</li>
        <li>Encapsulation concept</li>
        <li>Wireshark mein packet reading layer by layer</li>
      </ul>

      <h2>29. Part 3 Complete</h2>
      <p>OSI model ab sirf ek diagram nahi raha, ye tumhara investigation framework ban gaya hai. Jab bhi koi attack hoga, tum directly samjhoge ki wo kaunsi layer par hua aur Wireshark mein kahan dhundhna hai.</p>
      <p>TCP flags, ARP, encapsulation, ye sab concepts ab tumhare paas hain. Part 4 mein hum Packet Analysis Fundamentals cover karenge jahan ye sab cheezein live packets mein apply hongi.</p>

      <div class="info-box">
        <p><strong>Part 3 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Wireshark mein koi bhi packet kholo aur har layer expand karo</li>
          <li>tcp.flags.syn == 1 filter lagao aur SYN packets observe karo</li>
          <li>ARP filter lagao aur local network ki ARP activity dekho</li>
          <li>Ek TCP connection follow karo aur handshake ke teeno packets dhundho</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>Encapsulation kya hai?</li>
          <li>SYN flag kyun use hota hai?</li>
          <li>ARP kya karta hai?</li>
          <li>OSI layer 3 kaunsi hai?</li>
          <li>TCP reliable kyun hai?</li>
        </ul>
      </div>

    `;

  } else if (index === 3) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. What is Packet Analysis?</h2>
      <p>Packet Analysis ka matlab hai network mein travel kar rahe packets ko capture karke unka detailed examination karna. Investigator packet dekhkar pata laga sakta hai:</p>
      <ul>
        <li>Kaun communicate kar raha hai</li>
        <li>Kaunsa protocol use ho raha hai</li>
        <li>Kaunsi website access hui</li>
        <li>Data transfer hua ya nahi</li>
        <li>Attack hua ya nahi</li>
      </ul>

      <h2>2. Why Packet Analysis Important?</h2>
      <p>Network Forensics ki poori foundation packet analysis par tiki hai. Packets mein ye evidence milta hai:</p>
      <ul>
        <li>Source IP aur Destination IP</li>
        <li>Ports aur Protocols</li>
        <li>Payload yani actual data</li>
        <li>Session details</li>
      </ul>

      <h2>3. Packet Structure Overview</h2>
      <p>Ek packet kai layers ka combination hota hai:</p>
      <pre><code>Ethernet Header
    IP Header
      TCP/UDP Header
        Payload (Actual Data)</code></pre>

      <h2>4. Data Unit Names</h2>
      <p>OSI layer ke hisaab se data ka naam badalta hai:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">LAYER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">DATA UNIT</span>
        </div>
        ${[['Application','Data'],['Transport','Segment (TCP)'],['Network','Packet'],['Data Link','Frame'],['Physical','Bits']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="display:inline-block;background:rgba(220,20,20,0.1);border-radius:4px;padding:3px 10px;font-size:12px;color:#c0c0cc;font-family:'Inter',sans-serif;font-weight:500;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Ethernet Frame</h2>
      <p>Network mein sabse pehle Ethernet Frame dikhta hai. Iska structure:</p>
      <pre><code>Destination MAC  |  Source MAC  |  Type  |  Data  |  FCS</code></pre>

      <h2>6. Ethernet Header Fields</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Destination MAC','Packet kis device ke liye hai. Example: 00:11:22:33:44:55'],['Source MAC','Packet kis device ne bheja. Example: AA:BB:CC:DD:EE:FF'],['EtherType','Andar kaunsa protocol hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">VALUE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
        </div>
        ${[['0x0800','IPv4'],['0x86DD','IPv6'],['0x0806','ARP']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>7. IP Header Introduction</h2>
      <p>Layer 3 par IP Header add hota hai jisme source IP, destination IP, TTL, protocol aur length hoti hai.</p>

      <h2>8. IPv4 Header Fields</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">FIELD</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
        </div>
        ${[['Version','IPv4 ya IPv6 identify karna'],['Header Length','Header ka size'],['Total Length','Poore packet ka size'],['TTL','Packet ki lifetime'],['Protocol','TCP, UDP ya ICMP'],['Source IP','Bhejne wala'],['Destination IP','Receive karne wala']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. TTL - Time To Live</h2>
      <p>TTL packet ki life hoti hai. Har router par 1 kam hota hai. Jab TTL = 0 ho jaata hai packet drop ho jaata hai.</p>
      <div class="info-box"><p><strong>Forensics mein:</strong> TTL se routing problems, spoofing attempts aur scanning behavior detect hoti hai. OS fingerprinting bhi TTL se hoti hai. Windows default TTL = 128, Linux = 64.</p></div>

      <h2>10. Protocol Field Numbers</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">NUMBER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
        </div>
        ${[['1','ICMP'],['6','TCP'],['17','UDP']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>11. TCP Header Deep Analysis</h2>
      <p>Transport Layer ka sabse important header. Ismein ye hota hai: Source Port, Destination Port, Sequence Number, ACK Number, Flags aur Window Size.</p>

      <h2>12. Sequence aur ACK Numbers</h2>
      <p>TCP reliability ka secret hai Sequence Number. Har byte track kiya jaata hai.</p>
      <pre><code>Seq = 1000  → Pehla segment
Seq = 1500  → Doosra segment
Seq = 2000  → Teesra segment

ACK = 2001  → "Mujhe 2000 tak data mil gaya, ab 2001 bhejo"</code></pre>
      <div class="info-box"><p><strong>Investigators use karte hain:</strong> Session reconstruction ke liye, missing packets detect karne ke liye, aur attack analysis ke liye.</p></div>

      <h2>13. TCP Flags Review</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">FLAG</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['SYN','Connection start'],['ACK','Confirmation'],['FIN','Connection close'],['RST','Connection reset'],['PSH','Data turant push'],['URG','Urgent data']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>14. TCP Connection Flow</h2>
      <pre><code>Client ──── SYN ──────► Server
Client ◄─── SYN ACK ── Server
Client ──── ACK ──────► Server
         [Data Exchange]
Client ──── FIN ──────► Server
Client ◄─── ACK ─────── Server
         [Connection Closed]</code></pre>

      <h2>15. UDP Header</h2>
      <p>UDP header bahut simple hota hai TCP ke comparison mein. Sirf 4 fields hote hain:</p>
      <pre><code>Source Port
Destination Port
Length
Checksum</code></pre>
      <div class="info-box"><p><strong>Attackers UDP kyun prefer karte hain:</strong> Fast hai, logging kam hoti hai, koi handshake nahi hota, aur abuse karna aasaan hai.</p></div>

      <h2>16. ICMP Packet Structure</h2>
      <p>ICMP ping aur diagnostics ke liye use hota hai. Ismein Type, Code aur Checksum hote hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">MEANING</span>
        </div>
        ${[['0','Echo Reply'],['8','Echo Request'],['3','Destination Unreachable']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:14px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>17. Payload</h2>
      <p>Payload MOST IMPORTANT evidence area hai. Ismein actual data hota hai jaise website request, login data, commands ya files.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:10px;">Header</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Control information. Routing ke liye. Metadata.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:10px;">Payload</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Actual data. Content. Real evidence.</div>
        </div>
      </div>

      <h2>18. Wireshark ke 3 Sections</h2>
      <p>Jab Wireshark mein koi packet click karo, 3 sections dikhte hain:</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Section 1 - Packet List','Time, Source, Destination, Protocol aur Info dikhta hai'],['Section 2 - Packet Details','Ethernet, IP, TCP sab expand hote hain layer by layer'],['Section 3 - Packet Bytes','Raw hexadecimal data dikhta hai, actual wire par kya tha']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>19. Packet Timing Analysis</h2>
      <p>Investigators timing check karte hain kyunki:</p>
      <ul>
        <li>Response delays suspicious hote hain</li>
        <li>Beacon intervals malware identify karte hain</li>
        <li>Repeated connections ek pattern batate hain</li>
      </ul>

      <h2>20. Stream Analysis</h2>
      <p>Multiple packets mil ke ek Stream banate hain. Jaise browser aur server ke beech kai packets exchange hote hain jo ek poori conversation banate hain.</p>

      <h2>21. Follow TCP Stream</h2>
      <p>Ye Wireshark ka bahut powerful feature hai:</p>
      <pre><code>Kisi bhi TCP packet par Right Click karo
Follow TCP Stream select karo
Poori conversation text mein dikh jaati hai</code></pre>
      <div class="info-box"><p><strong>Use hota hai:</strong> Web requests reconstruct karne ke liye, chats dekhne ke liye, aur malware communication analyze karne ke liye.</p></div>

      <h2>22. Important Wireshark Filters</h2>
      <pre><code>http                    → HTTP traffic
tls                     → HTTPS/TLS traffic
tcp                     → TCP traffic
udp                     → UDP traffic
icmp                    → ICMP ping traffic
arp                     → ARP traffic
tcp.flags.syn == 1      → Sirf SYN packets
tcp.flags.reset == 1    → Reset packets (attack sign)
ip.addr == 192.168.1.10 → Specific IP ke packets
tcp.port == 443         → Specific port ke packets</code></pre>

      <h2>23. Suspicious Packet Indicators</h2>
      <p>Investigators in cheezein dhundhte hain:</p>
      <ul>
        <li>Unknown IPs jinka source pata na ho</li>
        <li>Strange ports jaise 4444, 1337, 8443</li>
        <li>Excessive DNS queries ek hi domain ke liye</li>
        <li>Large uploads data exfiltration ka sign</li>
        <li>Beaconing patterns regular interval par traffic</li>
        <li>Repeated SYN packets port scan ya SYN flood</li>
      </ul>

      <h2>24. Packet Reconstruction</h2>
      <p>Goal hota hai packets se poori communication rebuild karna:</p>
      <pre><code>Packet 1 + Packet 2 + Packet 3 + Packet 4
              ↓
       Complete Session</code></pre>

      <h2>25. Real Investigation Example</h2>
      <p>Maan lo alert aaya: Data theft suspected. Investigator kya check karta hai:</p>
      <pre><code>Source IP   → Kaun bhej raha hai?
Destination IP → Kahan ja raha hai?
Port        → Kaunsi service use ho rahi hai?
Payload     → Kya data transfer hua?
Timing      → Kitne time tak session tha?</code></pre>
      <div class="info-box"><p>Agar large payload kisi unknown bahar ke IP par ja raha hai unusual port par, ye data exfiltration ka strong indicator hai.</p></div>

      <h2>26. Practical Lab Tasks</h2>
      <p><strong>Task 1:</strong></p>
      <pre><code>Traffic capture karo
Identify karo: Source IP, Destination IP, Protocol, Port</code></pre>

      <p><strong>Task 2:</strong></p>
      <pre><code>Google.com kholo
Filter lagao: dns
DNS packets observe karo</code></pre>

      <p><strong>Task 3:</strong></p>
      <pre><code>Filter: tcp.flags.syn == 1
Handshakes observe karo</code></pre>

      <p><strong>Task 4:</strong></p>
      <pre><code>Kisi TCP packet par right click karo
Follow TCP Stream select karo
Poori conversation padho</code></pre>

      <h2>27. Beginner Mistakes</h2>
      <ul>
        <li>Sirf protocol names dekhna, headers ignore karna</li>
        <li>Payload check na karna, wahan real evidence hota hai</li>
        <li>Streams analyze na karna, single packet akela kuch nahi batata</li>
        <li>Timing ignore karna, beaconing detect nahi hoga</li>
        <li>Hex bytes section ignore karna</li>
      </ul>

      <h2>28. Skills to Master Before Part 5</h2>
      <ul>
        <li>Ethernet Frame structure</li>
        <li>IP Header fields aur TTL</li>
        <li>TCP Header aur Sequence Numbers</li>
        <li>ACK Numbers ka matlab</li>
        <li>Payload analysis</li>
        <li>Wireshark filters</li>
        <li>Follow TCP Stream feature</li>
      </ul>

      <h2>29. Part 4 Complete</h2>
      <p>Ab tum ek packet ko uski poori depth mein samajh sakte ho. Ethernet header se lekar payload tak, har field ka matlab aur forensics mein kya role hai, ye sab tumhare paas hai.</p>
      <p>Ye wahi knowledge hai jo ek real investigator PCAP file kholta hai toh use immediately dikh jaata hai kya normal hai aur kya suspicious. Part 5 mein Wireshark ko poori tarah master karenge beginner se advanced tak.</p>

      <div class="info-box">
        <p><strong>Part 4 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Wireshark mein koi bhi packet kholo aur teen sections explore karo</li>
          <li>IP header mein TTL value check karo</li>
          <li>TCP packet mein Sequence aur ACK numbers dekho</li>
          <li>Follow TCP Stream use karke ek web request reconstruct karo</li>
          <li>tcp.flags.reset == 1 filter lagao aur reset packets dekho</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>TTL kya hota hai?</li>
          <li>Sequence Number kyun zaroori hai?</li>
          <li>Payload kya hota hai?</li>
          <li>TCP aur UDP header mein kya difference hai?</li>
          <li>Follow TCP Stream kis kaam aata hai?</li>
        </ul>
      </div>

    `;
  } else if (index === 4) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. What is Wireshark?</h2>
      <p>Wireshark duniya ka sabse popular network protocol analyzer hai. Iski madad se live traffic capture, PCAP files analyze, malware traffic investigate, network issues troubleshoot aur forensic evidence collect kar sakte ho.</p>

      <h2>2. Why Wireshark is Important?</h2>
      <p>Network Forensics mein lagbhag har investigator Wireshark use karta hai kyunki ye free hai, powerful hai, thousands of protocols support karta hai, deep packet inspection karta hai aur PCAP analysis possible hai.</p>

      <h2>3. Wireshark Interface Overview</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Menu Bar','Options aur tools ke liye'],['Toolbar','Quick actions ke liye'],['Capture Interface List','Network interfaces select karne ke liye'],['Packet List Pane','Captured packets ki list'],['Packet Details Pane','Selected packet ka breakdown'],['Packet Bytes Pane','Raw hexadecimal data']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Selecting the Right Interface</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Ethernet','Wired connection'],['Wi-Fi / wlan0','Wireless connection'],['Loopback (lo)','Local machine ka apna traffic']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Rule:</strong> Jis interface par traffic dikh raha ho wahi select karo. Kali Linux mein eth0 ya wlan0 hota hai.</p></div>

      <h2>5. Starting Your First Capture</h2>
      <pre><code>Step 1: Wireshark open karo
Step 2: Wi-Fi ya Ethernet interface select karo
Step 3: Start button (blue shark fin) click karo
Step 4: Browser kholo aur koi website open karo
Step 5: Traffic generate hoga
Step 6: Red square button se capture stop karo</code></pre>

      <h2>6. Capture Filters vs Display Filters</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:10px;">Capture Filter</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Traffic capture hone se pehle lagta hai. Sirf selected traffic save hoga. BPF syntax use hoti hai.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;margin-bottom:10px;">Display Filter</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.8;">Already captured traffic mein se filter karta hai. Investigation mein ye zyada use hota hai.</div>
        </div>
      </div>

      <h2>7. Capture Filters Examples</h2>
      <pre><code>tcp               → Sirf TCP traffic capture karo
port 80           → Sirf port 80 ka traffic
host 8.8.8.8      → Sirf is IP ka traffic
not arp           → ARP ke alawa sab capture karo</code></pre>

      <h2>8. Display Filters - Basic</h2>
      <pre><code>dns     → Sirf DNS traffic
tcp     → Sirf TCP traffic
http    → Sirf HTTP traffic
icmp    → Sirf ping traffic
udp     → Sirf UDP traffic</code></pre>

      <h2>9. Display Filters - IP Based</h2>
      <pre><code>ip.src == 192.168.1.10      → Is IP se aane wale packets
ip.dst == 8.8.8.8           → Is IP par jaane wale packets
ip.addr == 192.168.1.10     → Is IP ke sab packets
tcp.port == 443             → Port 443 ke packets
udp.port == 53              → Port 53 ke packets</code></pre>

      <h2>10. DNS Investigation Filters</h2>
      <pre><code>dns                         → Sab DNS traffic
dns.flags.response == 1     → Sirf DNS responses
dns.flags.response == 0     → Sirf DNS requests</code></pre>

      <h2>11. TCP Investigation Filters</h2>
      <pre><code>tcp.flags.syn == 1                           → SYN packets
tcp.flags.syn == 1 && tcp.flags.ack == 0     → Port scan detect
tcp.flags.reset == 1                         → Reset packets
tcp.analysis.retransmission                  → Retransmitted packets</code></pre>
      <div class="info-box"><p><strong>Port scan detect karna:</strong> Ek hi source IP se bahut saare alag ports par SYN packets aa rahe hain toh port scan chal raha hai.</p></div>

      <h2>12. HTTP Analysis Filters</h2>
      <pre><code>http.request                      → Sab HTTP requests
http.response                     → Sab HTTP responses
http.request.method == "POST"     → POST requests
http.request.method == "GET"      → GET requests</code></pre>

      <h2>13. TLS/HTTPS Filters</h2>
      <pre><code>tls               → Sab TLS/HTTPS traffic
tls.handshake     → TLS handshake packets</code></pre>
      <div class="info-box"><p><strong>TLS mein bhi kya milta hai:</strong> Server name (SNI field), certificate info, aur connection timing. Actual content decrypt nahi hota lekin metadata se bahut kuch pata chalta hai.</p></div>

      <h2>14. ICMP Investigation Filters</h2>
      <pre><code>icmp              → Sab ICMP traffic
icmp.type == 8    → Echo Request (ping bheja)
icmp.type == 0    → Echo Reply (ping ka jawab)</code></pre>

      <h2>15. ARP Analysis</h2>
      <pre><code>arp               → Sab ARP traffic</code></pre>
      <div class="info-box"><p><strong>ARP Spoofing detect karna:</strong> Agar ek hi IP ke liye alag alag MAC addresses ARP replies mein aa rahe hain toh ye ARP poisoning ka sign hai.</p></div>

      <h2>16. Packet Coloring Rules</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Green','TCP traffic'],['Blue','DNS traffic'],['Black ya Red','Errors aur problems'],['Light Purple','UDP traffic'],['Yellow','ARP traffic']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:130px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>17. Packet Details Analysis</h2>
      <ul>
        <li>Frame - capture information, interface, size</li>
        <li>Ethernet - source aur destination MAC addresses</li>
        <li>IP - source aur destination IP, TTL</li>
        <li>TCP - ports, flags, sequence numbers</li>
        <li>Application Protocol - HTTP, DNS, TLS content</li>
      </ul>

      <h2>18. Expert Information</h2>
      <pre><code>Menu: Analyze → Expert Information</code></pre>
      <p>Warnings, errors, retransmissions aur suspicious activity automatically dikhata hai. Investigation shuru karte waqt ye pehle check karo.</p>

      <h2>19. Conversations Analysis</h2>
      <pre><code>Menu: Statistics → Conversations</code></pre>
      <p>Kaun kis se baat kar raha tha, kitne bytes transfer hue aur packet count milta hai. Top talkers immediately pata chal jaate hain.</p>

      <h2>20. Endpoints Analysis</h2>
      <pre><code>Menu: Statistics → Endpoints</code></pre>
      <p>Sab IPs aur MACs dikhti hain traffic volume ke saath. Unknown external IPs yahan immediately identify hoti hain.</p>

      <h2>21. Protocol Hierarchy</h2>
      <pre><code>Menu: Statistics → Protocol Hierarchy

Example output:
Ethernet
  IP
    TCP (45%)
      HTTP (10%)
      TLS (35%)
    UDP (55%)
      DNS (50%)</code></pre>

      <h2>22. IO Graphs</h2>
      <pre><code>Menu: Statistics → I/O Graphs</code></pre>
      <p>Traffic ko visually graph mein dikhata hai. DDoS attacks, beaconing patterns aur unusual traffic spikes clearly dikh jaate hain.</p>

      <h2>23. Follow TCP Stream</h2>
      <pre><code>Kisi bhi TCP packet par right click karo
Follow → TCP Stream select karo</code></pre>
      <p>Web requests, credentials, malware traffic aur chats reconstruct hote hain is feature se.</p>

      <h2>24. Follow UDP Stream</h2>
      <pre><code>Kisi bhi UDP packet par right click karo
Follow → UDP Stream select karo</code></pre>
      <p>UDP based C2 communication investigate karne ke liye useful hai.</p>

      <h2>25. Export Objects</h2>
      <pre><code>Menu: File → Export Objects → HTTP</code></pre>
      <p>HTTP traffic se files extract kar sakte ho jaise images, documents, executables. Malware analysis mein bahut kaam aata hai.</p>

      <h2>26. Searching Inside Packets</h2>
      <pre><code>Shortcut: Ctrl + F

Search kar sakte ho:
Strings jaise "password" ya "login"
IP addresses
Domain names
Payload content</code></pre>

      <h2>27. Finding Large Transfers</h2>
      <pre><code>Statistics → Conversations → TCP tab
Bytes column par sort karo
Sabse bade transfers upar aayenge</code></pre>
      <p>Data exfiltration detect karne ka ye sabse aasaan tarika hai.</p>

      <h2>28. Detecting Beaconing</h2>
      <pre><code>Signs of beaconing:
Har 60 seconds par same IP par traffic
Same packet size baar baar
Same destination port repeatedly</code></pre>
      <div class="info-box"><p><strong>IO Graph use karo:</strong> Statistics → I/O Graphs mein regular spikes dikh rahe hain toh beaconing suspected hai.</p></div>

      <h2>29. Detecting Port Scans</h2>
      <pre><code>Filter: tcp.flags.syn == 1 && tcp.flags.ack == 0

Agar ek hi source IP se bahut saare alag alag
destination ports par SYN packets hain
ye port scan hai</code></pre>

      <h2>30. Detecting Suspicious DNS</h2>
      <p>Suspicious DNS ke indicators:</p>
      <ul>
        <li>Bahut lambe domain names</li>
        <li>Random looking domains jaise xk2jf93.xyz</li>
        <li>Bahut zyada queries ek hi domain ke liye</li>
        <li>NXDOMAIN responses baar baar</li>
      </ul>
      <pre><code>Filter: dns</code></pre>

      <h2>31. Practical Lab 1</h2>
      <pre><code>Traffic capture karo
Ye websites kholo: Google, YouTube, GitHub
Identify karo:
  DNS packets kaunse domains ke liye hain
  TLS connections kahan ja rahe hain
  TCP sessions kitne hain</code></pre>

      <h2>32. Practical Lab 2</h2>
      <pre><code>Terminal mein: ping google.com
Wireshark filter: icmp
ICMP Echo Request aur Echo Reply observe karo</code></pre>

      <h2>33. Practical Lab 3</h2>
      <pre><code>Filter: tcp.flags.syn == 1
Observe karo kaunse ports par SYN ja rahe hain
Handshake complete ho raha hai ya nahi</code></pre>

      <h2>34. Practical Lab 4</h2>
      <pre><code>Statistics → Endpoints par jao
Top IPs list karo
Koi unknown external IP hai kya check karo</code></pre>

      <h2>35. Practical Lab 5</h2>
      <pre><code>Statistics → Protocol Hierarchy par jao
Dekho HTTP, TLS aur DNS ka percentage kitna hai</code></pre>

      <h2>36. Professional Investigator Workflow</h2>
      <pre><code>Step 1:  PCAP file open karo
Step 2:  Protocol Hierarchy dekho
Step 3:  Endpoints check karo
Step 4:  Conversations analyze karo
Step 5:  DNS analysis karo
Step 6:  HTTP ya TLS analysis karo
Step 7:  Suspicious streams follow karo
Step 8:  Objects export karo
Step 9:  Timeline banao
Step 10: Report likho</code></pre>

      <h2>37. Beginner Mistakes</h2>
      <ul>
        <li>Sirf packet list dekhna aur statistics ignore karna</li>
        <li>Streams follow na karna, single packets akele kuch nahi batate</li>
        <li>Endpoints check na karna, top talkers miss ho jaate hain</li>
        <li>DNS ignore karna, malware DNS se pata chalta hai</li>
        <li>Expert Information check na karna</li>
      </ul>

      <h2>38. Skills to Master Before Part 6</h2>
      <ul>
        <li>Display filters confidently likhna</li>
        <li>Conversations aur Endpoints use karna</li>
        <li>Protocol Hierarchy samajhna</li>
        <li>TCP Streams follow karna</li>
        <li>DNS analysis karna</li>
        <li>TLS metadata analyze karna</li>
        <li>Objects export karna</li>
      </ul>

      <h2>39. Mini Investigation Exercise</h2>
      <p>Ek capture kholo aur ye sawalo ke jawab dhundho:</p>
      <ul>
        <li>Sabse zyada traffic kaunsi IP ne generate kiya?</li>
        <li>Sabse zyada use hone wala protocol kaunsa hai?</li>
        <li>Kitni DNS queries hain?</li>
        <li>Kitne TLS connections hain?</li>
        <li>Sabse badi conversation kitne bytes ki hai?</li>
      </ul>

      <h2>40. Part 5 Complete</h2>
      <p>Wireshark ab tumhara weapon hai. Interface se lekar professional workflow tak, tum ab wahi karte ho jo ek real SOC analyst ya forensic investigator karta hai jab ek PCAP file unke haath aati hai.</p>
      <p>Part 6 mein TCP, UDP aur ICMP ko forensics ke angle se bahut deep mein dekhenge. SYN flood, port scans, ICMP tunneling, UDP abuse aur covert channels sab real attack traffic mein analyze karenge.</p>

      <div class="info-box">
        <p><strong>Part 5 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Statistics → Conversations kholo aur top talkers identify karo</li>
          <li>Kisi bhi TCP packet par Follow TCP Stream use karo</li>
          <li>Protocol Hierarchy se apne traffic ka breakdown dekho</li>
          <li>File → Export Objects → HTTP se koi file extract karo</li>
          <li>Analyze → Expert Information check karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>Capture filter aur display filter mein kya difference hai?</li>
          <li>Follow TCP Stream kis kaam aata hai?</li>
          <li>Beaconing kaise detect karte hain?</li>
          <li>Port scan ka Wireshark filter kya hai?</li>
          <li>Conversations tab mein kya milta hai?</li>
        </ul>
      </div>

    `;
  } else if (index === 5) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Why Protocol Forensics Matters?</h2>
      <p>Network investigator ka sabse bada kaam hai traffic dekhkar samajhna ki communication normal hai ya malicious. Iske liye TCP, UDP aur ICMP ki deep understanding zaroori hai.</p>

      <h2>2. Protocols Investigators Most Commonly Analyze</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROTOCOL</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">IMPORTANCE</span>
        </div>
        ${[['TCP','Sabse zyada important'],['UDP','Bahut important'],['ICMP','Medium-High'],['DNS','Bahut zyada important'],['HTTP/HTTPS','Bahut zyada important']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. TCP Forensics Overview</h2>
      <p>TCP ek reliable, connection-oriented protocol hai. Features: reliable delivery, ordered packets, error recovery, flow control. Investigation mein TCP sabse zyada analyze hota hai.</p>

      <h2>4. TCP Connection Lifecycle</h2>
      <pre><code>SYN       → Connection request
SYN-ACK   → Server accepts
ACK       → Connection established
DATA      → Communication hoti hai
DATA      → ...
FIN       → Close request
ACK       → Connection closed</code></pre>
      <p>Investigator ko har stage samajhni chahiye.</p>

      <h2>5. TCP Three-Way Handshake</h2>
      <pre><code>Step 1: Client  ──── SYN ────► Server
Step 2: Client  ◄── SYN-ACK── Server
Step 3: Client  ──── ACK ────► Server
                [Connected!]</code></pre>

      <h2>6. Why Handshake Analysis Important?</h2>
      <p>Handshake se ye detect hota hai:</p>
      <ul>
        <li>Port scans</li>
        <li>SYN flood attacks</li>
        <li>Failed connections</li>
        <li>Reconnaissance activity</li>
      </ul>

      <h2>7. Finding Handshakes in Wireshark</h2>
      <pre><code>Sab SYN packets:
tcp.flags.syn == 1

Sirf initial SYN (no ACK):
tcp.flags.syn == 1 && tcp.flags.ack == 0</code></pre>

      <h2>8. TCP Session Reconstruction</h2>
      <p>Goal hai complete conversation rebuild karna. Packets ek sath jod ke poori session reconstruct hoti hai.</p>
      <pre><code>Packet 1 + Packet 2 + Packet 3 + Packet 4
              ↓
       Complete Session</code></pre>

      <h2>9. Follow TCP Stream</h2>
      <p>Wireshark ka sabse powerful feature hai ye:</p>
      <pre><code>Kisi bhi TCP packet par right click karo
Follow → TCP Stream select karo</code></pre>
      <p>Web requests, credentials, malware communication aur commands reconstruct hote hain.</p>

      <h2>10. TCP Sequence Numbers</h2>
      <p>Sequence numbers se data track hota hai, order maintain hota hai aur missing packets detect hote hain.</p>
      <pre><code>Seq = 1000  → Pehla segment
Seq = 1500  → Doosra segment
Seq = 2000  → Teesra segment</code></pre>

      <h2>11. ACK Numbers</h2>
      <p>Receiver confirm karta hai ki usne kitna data receive kiya:</p>
      <pre><code>ACK = 2001
Matlab: "2000 tak data mil gaya, ab 2001 bhejo"</code></pre>

      <h2>12. TCP Retransmissions</h2>
      <p>Jab packet lost ho jaata hai toh retransmission hoti hai:</p>
      <pre><code>Filter: tcp.analysis.retransmission</code></pre>
      <p>Ye indicate kar sakta hai congestion, packet loss, attack traffic ya network issues.</p>

      <h2>13. TCP Resets</h2>
      <pre><code>Filter: tcp.flags.reset == 1</code></pre>
      <p>RST ka matlab hai connection immediately terminate karna. Possible causes: closed port, firewall action, malware behavior ya scan activity.</p>

      <h2>14. TCP FIN Analysis</h2>
      <pre><code>Filter: tcp.flags.fin == 1</code></pre>
      <p>FIN ka matlab graceful connection close. Normal traffic mein FIN aur ACK dono dikhte hain. Agar sirf FIN hai ACK nahi toh suspicious hai.</p>

      <h2>15. TCP Port Scan Detection</h2>
      <p>Attacker ports scan karta hai. Indicators:</p>
      <ul>
        <li>Ek hi source IP</li>
        <li>Multiple alag alag ports par traffic</li>
        <li>Bahut saare SYN packets</li>
        <li>Koi ya bahut kam ACK</li>
      </ul>
      <pre><code>Filter: tcp.flags.syn == 1 && tcp.flags.ack == 0</code></pre>

      <h2>16. SYN Flood Attack</h2>
      <p>Attacker baar baar SYN packets bhejta hai lekin handshake kabhi complete nahi karta. Server ke resources exhaust ho jaate hain.</p>
      <pre><code>SYN → SYN → SYN → SYN → SYN (no ACK ever)</code></pre>
      <p>SYN Flood indicators: huge SYN count, bahut kam ACKs, half-open sessions ka bada count.</p>

      <h2>17. TCP Flags Investigation Summary</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SYN','Connection attempts detect karna'],['ACK','Active sessions identify karna'],['FIN','Normal closure confirm karna'],['RST','Forced closure ya attack detect karna'],['PSH','Immediate data delivery'],['URG','Rare traffic, suspicious ho sakta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>18. Abnormal TCP Behavior</h2>
      <p>Investigators ye cheezein watch karte hain:</p>
      <ul>
        <li>Excessive SYNs without ACKs</li>
        <li>Bahut saare resets ek sath</li>
        <li>Large retransmission count</li>
        <li>Strange ya unusual ports par traffic</li>
      </ul>

      <h2>19. UDP Forensics Overview</h2>
      <p>UDP connectionless protocol hai. Koi handshake nahi, fast hai, lightweight hai. Common UDP services:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['DNS','Port 53'],['DHCP','Port 67/68'],['NTP','Port 123'],['VoIP','Various ports']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>20. UDP Investigation Challenges</h2>
      <p>UDP investigate karna TCP se mushkil hai kyunki koi session establishment nahi hota, koi ACKs nahi hote aur reliability tracking nahi hoti.</p>

      <h2>21. UDP Analysis Filter</h2>
      <pre><code>udp</code></pre>

      <h2>22. Suspicious UDP Traffic Indicators</h2>
      <ul>
        <li>Large volumes of UDP packets</li>
        <li>Unknown destinations</li>
        <li>High-frequency packets</li>
        <li>Unusual payload sizes</li>
      </ul>

      <h2>23. UDP Flood Attack</h2>
      <p>Attacker huge UDP traffic bhejta hai. Result: resource exhaustion aur service disruption. Indicators: massive UDP packets, traffic spikes, single target.</p>

      <h2>24. DNS Over UDP</h2>
      <p>Zyada tar DNS traffic UDP par hoti hai port 53 par.</p>
      <pre><code>Filter: dns</code></pre>
      <div class="info-box"><p><strong>Kyun important hai:</strong> Malware aksar DNS ke zariye communicate karta hai. DNS tunneling mein data DNS packets ke andar chhupa hota hai.</p></div>

      <h2>25. ICMP Forensics Overview</h2>
      <p>ICMP diagnostics, reachability checks aur error reporting ke liye use hota hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Type 8','Echo Request, ping bhejte waqt'],['Type 0','Echo Reply, ping ka jawab'],['Type 3','Destination Unreachable']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:130px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>26. ICMP Analysis Filter</h2>
      <pre><code>icmp</code></pre>

      <h2>27. Ping Investigation</h2>
      <pre><code>Terminal mein: ping google.com
Wireshark filter: icmp

Observe karo:
Echo Request (Type 8) jaata hai
Echo Reply (Type 0) wapas aata hai</code></pre>

      <h2>28. ICMP Reconnaissance</h2>
      <p>Attackers ping sweeps karte hain live hosts dhundhne ke liye:</p>
      <pre><code>192.168.1.1 → ping
192.168.1.2 → ping
192.168.1.3 → ping
...sequential targets</code></pre>
      <p>Indicators: sequential targets, repeated Echo Requests, koi ya bahut kam replies.</p>

      <h2>29. ICMP Tunneling</h2>
      <p>Advanced attack mein attackers data ICMP packets ke andar chhupate hain. Normal ping traffic lag raha hota hai lekin andar data transfer ho raha hota hai.</p>
      <div class="info-box"><p><strong>Kyun dangerous hai:</strong> Bahut saare firewalls ICMP allow karte hain isliye ye technique security controls bypass kар sakti hai.</p></div>

      <h2>30. ICMP Tunneling Indicators</h2>
      <ul>
        <li>Bahut bade ICMP packets normal ping se zyada size ke</li>
        <li>Repeated ICMP communication ek hi destination se</li>
        <li>Unusual payload sizes</li>
        <li>ICMP traffic unusual times par</li>
      </ul>

      <h2>31. Covert Channels</h2>
      <p>Covert channel ka matlab hai ek legitimate protocol ko secretly data transfer karne ke liye use karna. Commonly abused protocols:</p>
      <ul>
        <li>ICMP tunneling</li>
        <li>DNS tunneling</li>
        <li>HTTP covert channels</li>
        <li>HTTPS covert channels</li>
      </ul>

      <h2>32. Beaconing Detection</h2>
      <p>Malware regular intervals par C2 server se contact karta hai. Indicators:</p>
      <pre><code>Har 60 seconds par same IP par traffic
Same packet size baar baar
Same destination port consistently</code></pre>
      <div class="info-box"><p><strong>Wireshark mein detect karo:</strong> Statistics → I/O Graphs mein regular spikes dikh rahe hain toh beaconing suspected hai.</p></div>

      <h2>33. Timeline Analysis</h2>
      <p>Investigation mein timeline banana bahut important hai:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['10:00','SYN packet - connection attempt'],['10:01','DNS query - domain lookup'],['10:02','TCP connection established'],['10:03','Large upload - data exfiltration suspected']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>34. Practical Lab 1</h2>
      <pre><code>Traffic capture karo
Filter: tcp
Identify karo: SYN, ACK, FIN packets
Ek complete handshake dhundho</code></pre>

      <h2>35. Practical Lab 2</h2>
      <pre><code>Filter: tcp.analysis.retransmission
Retransmissions check karo
Kitni hain aur kaunse IP ke liye</code></pre>

      <h2>36. Practical Lab 3</h2>
      <pre><code>Terminal mein: ping google.com
Wireshark mein: icmp filter lagao
ICMP packets analyze karo</code></pre>

      <h2>37. Practical Lab 4</h2>
      <pre><code>Filter: udp
DNS traffic observe karo
Kaunse domains query ho rahe hain</code></pre>

      <h2>38. Real Investigation Scenario</h2>
      <p>Alert aaya: suspicious outbound traffic. Investigator kya check karta hai:</p>
      <pre><code>Step 1: DNS queries check karo kaunse domains
Step 2: TCP sessions analyze karo
Step 3: UDP flows dekho
Step 4: ICMP activity check karo
Step 5: Beaconing patterns dhundho
Step 6: Timeline banao
Step 7: Malware communication identify karo</code></pre>

      <h2>39. Common Beginner Mistakes</h2>
      <ul>
        <li>Sirf protocol names check karna, flags ignore karna</li>
        <li>Retransmissions ignore karna, ye network health batati hain</li>
        <li>Timing patterns miss karna, beaconing detect nahi hoga</li>
        <li>ICMP ko sirf ping samajhna, tunneling miss ho jaata hai</li>
        <li>UDP traffic ignore karna, malware aksar UDP use karta hai</li>
      </ul>

      <h2>40. Part 6 Complete</h2>
      <p>Ab tum protocols ko ek investigator ki najar se dekhte ho. TCP ka har flag, UDP ka har flow, ICMP ka har packet - sab kuch tumhe kuch na kuch bata raha hai. Normal traffic aur malicious traffic ka farq ab tumhare liye clearly samajh aata hai.</p>
      <p>Part 7 mein DNS aur HTTP forensics mein jaayenge jo ki sabse zyada evidence wale protocols hain. DNS queries se malware domains milte hain, HTTP traffic mein credentials aur files milti hain.</p>

      <div class="info-box">
        <p><strong>Part 6 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>tcp.flags.syn == 1 filter lagao aur port scans identify karo</li>
          <li>tcp.flags.reset == 1 se resets observe karo</li>
          <li>ping google.com karo aur ICMP packets analyze karo</li>
          <li>Statistics → I/O Graphs mein traffic spikes dhundho</li>
          <li>Follow TCP Stream se ek complete session reconstruct karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>SYN Flood kya hota hai?</li>
          <li>TCP retransmission kyun hoti hai?</li>
          <li>UDP investigation mushkil kyun hai?</li>
          <li>ICMP Type 8 kya hai?</li>
          <li>Beaconing kya hota hai?</li>
        </ul>
      </div>

    `;
  } else if (index === 6) {
    document.getElementById('chapterContent').innerHTML = `

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
  } else if (index === 7) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Why HTTPS Forensics is Important?</h2>
      <p>Aaj internet ka adhiktar traffic HTTPS par chalta hai - Google, YouTube, Instagram, Banking, Cloud Services sab. Problem ye hai ki HTTPS encrypted hota hai. Isliye investigator ko encrypted traffic ki metadata analysis seekhni padti hai.</p>

      <h2>2. HTTP vs HTTPS</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(255,255,255,0.06);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;margin-bottom:12px;">HTTP</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:2;">Plain Text hai. Port 80. Asaani se padha ja sakta hai. Insecure hai.</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(220,20,20,0.2);padding:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;margin-bottom:12px;">HTTPS</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:2;">Encrypted hai. Port 443. Directly padhna mushkil. Secure hai.</div>
        </div>
      </div>

      <h2>3. SSL vs TLS</h2>
      <p>SSL (Secure Sockets Layer) purana encryption protocol tha. Aaj almost completely replace ho chuka hai TLS se. TLS (Transport Layer Security) HTTPS ka modern security protocol hai.</p>

      <h2>4. TLS Kahan Use Hota Hai?</h2>
      <ul>
        <li>Websites - HTTPS</li>
        <li>Email - SMTPS, IMAPS</li>
        <li>VPNs</li>
        <li>APIs</li>
        <li>Cloud services</li>
      </ul>

      <h2>5. TLS ke 3 Goals</h2>
      <div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px;">
        ${[['Confidentiality','Koi third party traffic nahi padh sakti'],['Integrity','Data modify hua ya nahi verify karta hai'],['Authentication','Server actually wahi hai jo claim karta hai, verify karta hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px 18px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>6. TLS Versions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SSL 2.0','Obsolete - use mat karo'],['SSL 3.0','Obsolete - use mat karo'],['TLS 1.0','Legacy - outdated'],['TLS 1.1','Legacy - outdated'],['TLS 1.2','Common - abhi bhi use hota hai'],['TLS 1.3','Modern - latest aur most secure']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:110px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:${i<4?'#555':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:${i<4?'#444':'#888'};">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Forensics mein:</strong> Agar koi server TLS 1.0 ya 1.1 use kar raha hai toh ye suspicious hai ya misconfigured server hai.</p></div>

      <h2>7. TLS Handshake Overview</h2>
      <p>Connection shuru hone se pehle TLS handshake hota hai jismein encryption setup, key exchange aur certificate verification hota hai.</p>
      <pre><code>Client Hello    → Client capabilities bhejta hai
      ↓
Server Hello    → Server parameters select karta hai
      ↓
Certificate     → Server apna certificate bhejta hai
      ↓
Key Exchange    → Encryption keys exchange hoti hain
      ↓
Encrypted Session → Sab kuch ab encrypted hai</code></pre>

      <h2>8. Client Hello</h2>
      <p>Client pehla message bhejta hai jismein hota hai:</p>
      <ul>
        <li>TLS version jo support karta hai</li>
        <li>Supported cipher suites ki list</li>
        <li>Extensions</li>
        <li>SNI (Server Name Indication)</li>
      </ul>

      <h2>9. Server Hello</h2>
      <p>Server reply karta hai jismein hota hai:</p>
      <ul>
        <li>Selected cipher suite</li>
        <li>TLS version</li>
        <li>Session parameters</li>
      </ul>

      <h2>10. Certificate Exchange</h2>
      <p>Server apna digital certificate bhejta hai jisme hota hai: domain name, public key, issuer aur validity dates.</p>

      <h2>11. Certificate Kya Hai?</h2>
      <p>Website ka digital identity card. Certificate prove karta hai ki tum actually Google se baat kar rahe ho, kisi attacker se nahi.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Subject','Website domain name'],['Issuer','Certificate Authority ka naam'],['Valid From','Certificate kab se valid hai'],['Valid To','Certificate kab expire hoga'],['Public Key','Encryption ke liye public key']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>12. Certificate Authorities</h2>
      <p>Trusted organizations jo certificates issue karti hain: Let's Encrypt, DigiCert, GlobalSign. Agar certificate kisi unknown CA se hai toh suspicious hai.</p>

      <h2>13. TLS Wireshark Filters</h2>
      <pre><code>tls                                    → Sab TLS traffic
tls.handshake                          → Handshake packets
tls.handshake.certificate             → Certificate packets
tls.handshake.extensions_server_name  → SNI field</code></pre>

      <h2>14. Investigators Encrypted Traffic Mein Bhi Kya Dekh Sakte Hain?</h2>
      <p>HTTPS encrypted hone ke bawajood ye sab dikh sakta hai:</p>
      <ul>
        <li>Source IP aur Destination IP</li>
        <li>Domain name SNI field se</li>
        <li>TLS version</li>
        <li>Certificate information</li>
        <li>Connection timing</li>
        <li>Traffic volume</li>
      </ul>

      <h2>15. SNI - Server Name Indication</h2>
      <p>Client TLS handshake mein destination domain batata hai. Ye field aksar unencrypted hoti hai aur investigators ise dekh sakte hain.</p>
      <pre><code>Filter: tls.handshake.extensions_server_name

Example SNI value: youtube.com
Matlab: client youtube.com se connect karne ki koshish kar raha hai</code></pre>

      <h2>16. SNI Kyun Important Hai?</h2>
      <p>SNI se pata chalta hai:</p>
      <ul>
        <li>Destination website kaun si thi</li>
        <li>Malware ka server domain</li>
        <li>Suspicious domains</li>
      </ul>
      <div class="info-box"><p><strong>Practical use:</strong> Agar SNI mein random domain dikh raha hai jaise jx82ksla92.com toh ye malware C2 ka sign ho sakta hai.</p></div>

      <h2>17. Suspicious Domains Detect Karna</h2>
      <ul>
        <li>Random looking domains jaise jx82ksla92.com</li>
        <li>Newly registered domains</li>
        <li>Unknown infrastructure IPs</li>
        <li>Domains jo threat intelligence mein listed hain</li>
      </ul>

      <h2>18. JA3 Fingerprinting</h2>
      <p>Advanced forensic technique hai. JA3 TLS Client Hello se ek unique fingerprint banata hai based on TLS version, cipher suites aur extensions.</p>
      <div class="info-box"><p><strong>Kyun useful hai:</strong> Alag alag applications unique TLS fingerprints produce karte hain. Is se malware families, custom tools aur known software identify ho sakti hai.</p></div>

      <h2>19. Malware HTTPS Communication</h2>
      <pre><code>Step 1: DNS query → C2 domain resolve karo
Step 2: TLS connection → encrypted session establish karo
Step 3: Commands receive karo encrypted mein
Step 4: Stolen data bhejo encrypted mein</code></pre>
      <p>Payload encrypted hone ki wajah se directly nahi dekh sakte lekin metadata se bahut kuch pata chalta hai.</p>

      <h2>20. HTTPS Investigation Challenge</h2>
      <p>Payload hidden hota hai. Directly nahi dekh sakte:</p>
      <ul>
        <li>Commands jo server bhej raha hai</li>
        <li>Stolen data jo upload ho raha hai</li>
        <li>Credentials</li>
      </ul>
      <p>Lekin metadata analysis se bahut kuch reveal hota hai.</p>

      <h2>21. Metadata Se Kya Reveal Hota Hai?</h2>
      <ul>
        <li>Timing patterns beaconing detect karte hain</li>
        <li>Connection frequency suspicious behavior batati hai</li>
        <li>Domain reputation se malware servers pata chalte hain</li>
        <li>JA3 fingerprint se tool identify hota hai</li>
        <li>SNI se destination domain milta hai</li>
        <li>Traffic volume se data exfiltration ka pata chalta hai</li>
      </ul>

      <h2>22. Beaconing Over HTTPS</h2>
      <pre><code>Har 60 seconds par same domain par TLS connection
Same packet size
Same destination IP

Ye malware C2 beaconing ka classic sign hai</code></pre>

      <h2>23. Beaconing Detect Karna</h2>
      <ul>
        <li>Fixed intervals par repeated TLS sessions</li>
        <li>Consistent packet sizes</li>
        <li>Same destination IP aur port</li>
        <li>Unusual times par connections</li>
      </ul>

      <h2>24. Self-Signed Certificates</h2>
      <p>Certificate jo khud apne aap sign hota hai, kisi trusted CA se nahi. Often use hota hai:</p>
      <ul>
        <li>Internal labs mein</li>
        <li>Malware infrastructure mein</li>
        <li>Fake services mein</li>
      </ul>
      <div class="info-box"><p><strong>Red flag:</strong> Agar koi website self-signed certificate use kar rahi hai aur wo koi known service nahi hai toh ye suspicious hai.</p></div>

      <h2>25. Expired Certificates</h2>
      <p>Expired certificate possible indicator hai:</p>
      <ul>
        <li>Misconfigured servers</li>
        <li>Neglected attacker servers</li>
        <li>Suspicious infrastructure</li>
      </ul>

      <h2>26. TLS Hunting Workflow</h2>
      <pre><code>Step 1: tls filter lagao → TLS traffic dhundho
Step 2: SNI check karo → kaunse domains hain
Step 3: Certificates review karo → issuer aur validity
Step 4: Destination IPs check karo → threat intel mein
Step 5: Timing analyze karo → beaconing toh nahi
Step 6: JA3 fingerprint check karo → tool identify karo</code></pre>

      <h2>27. Practical Lab 1</h2>
      <pre><code>https://google.com kholo
Traffic capture karo
Filter: tls
TLS packets observe karo</code></pre>

      <h2>28. Practical Lab 2</h2>
      <pre><code>Filter: tls.handshake
Identify karo:
Client Hello packet
Server Hello packet
Certificate packet</code></pre>

      <h2>29. Practical Lab 3</h2>
      <pre><code>Kisi bhi Certificate packet par click karo
Expand karo: Transport Layer Security
Certificate fields dekho:
Subject, Issuer, Expiration date</code></pre>

      <h2>30. Practical Lab 4</h2>
      <pre><code>Filter: tls.handshake.extensions_server_name
Observe karo kaunse domains SNI mein hain
Unknown ya suspicious domains note karo</code></pre>

      <h2>31. Real Investigation Example</h2>
      <p>Alert: suspected malware communication. Investigator findings:</p>
      <pre><code>Finding 1: Repeated TLS sessions har 60 seconds par
Finding 2: Unknown domain SNI mein - jx82k.io
Finding 3: Self-signed certificate
Finding 4: Fixed packet size har baar

Conclusion: Command and Control beaconing hai</code></pre>

      <h2>32. Skill: Certificate Analysis</h2>
      <pre><code>Wireshark mein certificate packet kholte waqt:
tls.handshake.certificate

Dekho:
Subject → kaunsa domain
Issuer → kaunsi CA
Valid From / To → dates
Serial Number → unique identifier</code></pre>

      <h2>33. TLS Version Detection</h2>
      <pre><code>Filter: tls.record.version

Agar TLS 1.0 ya SSL 3.0 dikh raha hai:
Ye outdated aur suspicious hai
Modern systems TLS 1.2 ya 1.3 use karte hain</code></pre>

      <h2>34. Combining DNS + TLS Investigation</h2>
      <pre><code>Step 1: dns filter → kaunse domains query hue
Step 2: Suspicious domain mila → note karo IP
Step 3: ip.addr == [suspicious IP] → us IP ka traffic
Step 4: tls filter → kya TLS connection hua
Step 5: SNI confirm karo → same domain hai kya
Step 6: Beaconing check karo</code></pre>

      <h2>35. Beginner Mistakes</h2>
      <ul>
        <li>Sochna ki HTTPS investigate hi nahi ho sakta</li>
        <li>Metadata ignore karna, wahan evidence milta hai</li>
        <li>Certificates check na karna, self-signed miss ho jaata hai</li>
        <li>Timing analysis ignore karna, beaconing detect nahi hogi</li>
        <li>SNI ignore karna, destination domain miss ho jaata hai</li>
      </ul>

      <h2>36. Skills to Master</h2>
      <ul>
        <li>TLS handshake process samajhna</li>
        <li>Certificates analyze karna</li>
        <li>SNI se domains identify karna</li>
        <li>TLS Wireshark filters use karna</li>
        <li>Beaconing patterns detect karna</li>
        <li>Metadata investigation</li>
      </ul>

      <h2>37. Part 8 Complete</h2>
      <p>HTTPS ab tumhare liye ek closed door nahi rahi. Encrypted traffic ke andar directly nahi dekh sakte lekin metadata, certificates, SNI, timing aur JA3 fingerprints se investigator bahut kuch reveal kar leta hai.</p>
      <p>Ye skills real SOC analysts aur forensic investigators daily use karte hain. Malware jo HTTPS use karta hai woh bhi in techniques se pakda jaata hai. Part 9 mein Email Forensics cover karenge.</p>

      <div class="info-box">
        <p><strong>Part 8 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>https://google.com visit karo aur tls filter se handshake observe karo</li>
          <li>tls.handshake.certificate se certificate details dekho</li>
          <li>tls.handshake.extensions_server_name se SNI values check karo</li>
          <li>Statistics → I/O Graphs mein TLS connection patterns dekho</li>
          <li>tls.record.version se TLS versions identify karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>SSL aur TLS mein kya difference hai?</li>
          <li>SNI kya hota hai?</li>
          <li>Certificate kyun zaroori hai?</li>
          <li>HTTPS investigation mein kaunsi metadata useful hoti hai?</li>
          <li>Beaconing kya indicate kar sakta hai?</li>
        </ul>
      </div>

    `;
  } else if (index === 8) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. What is Email Forensics?</h2>
      <p>Email Forensics ka matlab hai emails ko collect, analyze aur investigate karna taaki pata lagaya ja sake ki email kahan se aaya, sender asli hai ya fake, phishing attack hua ya nahi, attachment malicious hai ya nahi, aur email ka route kya tha.</p>

      <h2>2. Why Email Forensics is Important?</h2>
      <p>Aaj bhi adhikansh cyber attacks ki shuruaat email se hoti hai. Email sabse common attack vector hai kyunki har koi email use karta hai aur phishing detect karna difficult hota hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Phishing','Fake emails jo credentials churate hain'],['Malware Delivery','Malicious attachments ya links'],['Ransomware','Email se ransomware deliver karna'],['CEO Fraud','Executive ko impersonate karna'],['BEC','Business Email Compromise via wire fraud']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>3. Email Architecture</h2>
      <p>Jab koi email bheja jaata hai, woh kai servers se guzarta hai. Har server ek entry header mein add karta hai jo investigators ke liye evidence hoti hai.</p>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Sender','Email compose karta hai'],['SMTP Server','Email bhejta hai'],['Internet Routing','Mail servers ke through travel'],['Recipient Mail Server','Email receive karta hai'],['Recipient','Email padta hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0||i===4?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:12px 24px;text-align:center;width:240px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:${i===0||i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-top:3px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="20" viewBox="0 0 16 20" fill="none" style="margin:2px 0;"><path d="M8 2v14M3 12l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>4. Important Email Protocols</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SMTP','Simple Mail Transfer Protocol','25, 465, 587','Email bhejne ke liye use hota hai'],['POP3','Post Office Protocol v3','110, 995','Email download karta hai, server se remove kar deta hai'],['IMAP','Internet Message Access Protocol','143, 993','Email sync karta hai, server par rakhta hai']].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(255,255,255,0.06);padding:14px 18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</span>
            <span style="font-family:'Rajdhani',monospace;font-size:12px;color:#555;">Port: ${r[2]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:4px;">${r[3]}</div>
        </div>`).join('')}
      </div>

      <h2>5. SMTP Overview</h2>
      <p>SMTP yaani Simple Mail Transfer Protocol email bhejne ka primary protocol hai. Jab bhi koi email send karta hai toh SMTP kaam karta hai. Mail servers ke beech communication bhi SMTP se hoti hai.</p>
      <div class="info-box"><p><strong>Port 25</strong> server-to-server ke liye, <strong>Port 587</strong> client submission ke liye, <strong>Port 465</strong> encrypted SMTP ke liye use hota hai.</p></div>

      <h2>6. POP3 Overview</h2>
      <p>POP3 yaani Post Office Protocol v3 email download karne ke liye use hota hai. Jab POP3 use hota hai toh email server se download hoke local machine par aa jaata hai aur aksar server se delete ho jaata hai. Forensics mein ye isliye important hai kyunki email sirf ek jagah hota hai.</p>

      <h2>7. IMAP Overview</h2>
      <p>IMAP yaani Internet Message Access Protocol email synchronize karta hai. Email server par rehta hai aur multiple devices se access ho sakta hai. Modern email clients mostly IMAP use karte hain. Forensics mein server par sab emails milte hain.</p>

      <h2>8. Email Components</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Header','Metadata jaise sender, receiver, route, timestamps, authentication'],['Body','Actual message content jo user ko dikh ta hai'],['Attachments','Files jo email ke saath bheje jaate hain']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:${i===0?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. Why Headers Are Important?</h2>
      <p>Email ka body user dikhta hai lekin forensic evidence header mein hoti hai. Header mein poora email ka safar record hota hai. Investigators header se pata lagate hain ki email kahan se aaya, kahan kahan se guzra, authentication pass hua ya fail hua.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Sender path','Email kahan se chala aur kahan kahan gaya'],['Mail servers','Konse servers se guzra email'],['Timestamps','Har server par kitne baje pahuncha'],['Authentication results','SPF, DKIM, DMARC pass hua ya fail'],['Routing information','Poori journey ka record']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#666;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>10. Common Email Header Fields</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;padding:10px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">HEADER</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
        </div>
        ${[['From','Claimed sender address, spoofed ho sakta hai'],['To','Recipient ka address'],['Subject','Email ka topic'],['Date','Email kab send hua'],['Message-ID','Har email ka unique identifier'],['Received','Mail route, har server entry add karta hai'],['Return-Path','Bounce address, real sender se related'],['Reply-To','Reply kahan jaaye, spoofing mein use hota hai'],['X-Originating-IP','Original sender ka IP address']].map(r=>`
        <div style="display:grid;grid-template-columns:130px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>11. Most Important Header: Received</h2>
      <p>Received header sabse important forensic evidence hai. Jab bhi email kisi server se guzarta hai, woh server ek Received entry add kar deta hai. Isse email ki poori journey track ki ja sakti hai.</p>
      <div class="info-box"><p><strong>Rule:</strong> Received headers ko <span style="color:#dc1414;font-weight:700;">bottom se top</span> padho. Sabse neeche wali entry original source hai, sabse upar wali last server hai.</p></div>
      <pre><code>Received: from smtp.relay.net
        by victim-mx.com; 10:00:00         (sabse upar = last hop)

Received: from attacker-server.ru (192.168.1.100)
        by smtp.relay.net; 09:58:00        (sabse neeche = original source)

Bottom entry = Attacker ka original IP: 192.168.1.100</code></pre>

      <h2>12. How to Trace an Email</h2>
      <p>Email trace karne ka process hamesha Received headers par depend karta hai. Investigator sabse pehle bottom Received entry dhundhta hai jo original IP batata hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Step 1','Full headers collect karo','Gmail mein Show Original, Outlook mein View Source'],['Step 2','Sabse neeche ka Received dekho','Ye original sender ka server hai'],['Step 3','IP address nikalo','Attacker ka actual IP yahan hota hai'],['Step 4','IP ko reverse lookup karo','Kaunse country ya ISP se aaya pata chalega'],['Step 5','Authentication check karo','SPF DKIM DMARC results verify karo']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(255,255,255,0.06);padding:12px 16px;display:grid;grid-template-columns:60px 140px 1fr;gap:8px;align-items:center;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;text-align:center;">${r[0]}</span>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[2]}</div>
        </div>`).join('')}
      </div>

      <h2>13. Email Spoofing</h2>
      <p>Email spoofing matlab hai From field mein koi bhi fake address likhna. SMTP protocol mein From field verify nahi hota by default. Isliye attacker CEO ka address likh ke email bhej sakta hai aur recipient ko asli lagta hai.</p>
      <pre><code>Displayed From: ceo@yourcompany.com
Actually sent by: attacker@evil.ru (192.168.1.100)

From field = Jhooth bol sakta hai
Received header = Real truth hai</code></pre>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['From aur Return-Path mismatch','Dono alag hain toh suspicious hai'],['SPF ya DKIM fail hua','Authentication fail ka matlab unauthorized sender'],['Unusual relay servers','Unexpected countries ke servers se guzra'],['Strange routing path','Normal path se bahut alag route']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>14. SPF</h2>
      <div class="info-box"><p><strong>SPF = Sender Policy Framework.</strong> Domain ke DNS mein record hota hai jo batata hai ki kaunse IP addresses us domain ke liye email bhej sakte hain. Jab email aata hai toh receiving server SPF check karta hai.</p></div>
      <p>Agar attacker gmail.com ka naam lekar email bheje lekin Gmail ke authorized servers se na bheje, SPF fail ho jaayega.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Pass','Sender IP domain ke liye authorized hai, valid sender','#f4f4f5'],['Fail','Sender IP authorized nahi hai, unauthorized sender','#dc1414'],['SoftFail','Suspicious sender, soft warning, investigate karo','#b0b0b8'],['Neutral','Domain ne koi strong decision nahi diya','#555']].map(r=>`
        <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',monospace;font-size:14px;font-weight:700;color:${r[2]};">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>15. DKIM</h2>
      <div class="info-box"><p><strong>DKIM = DomainKeys Identified Mail.</strong> Email bhejne wala server email mein ek digital signature add karta hai. Receiving server us signature ko verify karta hai taaki pata chale ki email modify toh nahi hua aur sender domain authentic hai.</p></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0 28px;">
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.2);padding:16px;text-align:center;">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="margin-bottom:8px;"><circle cx="14" cy="14" r="12" stroke="#dc1414" stroke-width="1.5"/><path d="M8 14l4 4 8-8" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;color:#f4f4f5;">Message not modified</div>
        </div>
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.2);padding:16px;text-align:center;">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="margin-bottom:8px;"><circle cx="14" cy="14" r="12" stroke="#dc1414" stroke-width="1.5"/><path d="M8 14l4 4 8-8" stroke="#dc1414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;color:#f4f4f5;">Sender domain authentic</div>
        </div>
      </div>
      <p>Agar DKIM fail hota hai toh ya toh email modify kiya gaya ya sender ka domain fake hai.</p>

      <h2>16. DMARC</h2>
      <div class="info-box"><p><strong>DMARC = Domain-based Message Authentication, Reporting and Conformance.</strong> SPF aur DKIM dono ke saath kaam karta hai. Domain owner policy set karta hai ki SPF ya DKIM fail hone par email ka kya karna hai.</p></div>
      <pre><code>Authentication-Results: mx.google.com;
  spf=pass      smtp.mailfrom=sender.com
  dkim=pass     header.d=sender.com
  dmarc=pass    header.from=sender.com

Sab pass = Legitimate email

spf=fail dkim=fail dmarc=fail = Strong phishing indicator</code></pre>
      <p>DMARC policies teen hoti hain: none sirf monitor karta hai, quarantine spam mein daalta hai, reject email block kar deta hai.</p>

      <h2>17. Authentication Results Header</h2>
      <p>Email headers mein Authentication-Results header hota hai jisme SPF, DKIM aur DMARC ke results ek saath likhe hote hain. Investigator yahan ek hi jagah se saari authentication information dekh sakta hai.</p>
      <pre><code>Authentication-Results: mx.victim.com;
  spf=fail (ip4:192.168.1.100 is not authorized)
    smtp.mailfrom=ceo@company.com
  dkim=none (no signature found)
  dmarc=fail

Iska matlab: Email spoofed hai, investigate karo immediately</code></pre>

      <h2>18. What is Phishing?</h2>
      <p>Phishing ek fraudulent email hota hai jo user ko trick karne ke liye design kiya jaata hai. Attacker ka goal hota hai credentials churana, malware install karna ya financial information collect karna. Phishing aaj bhi sabse successful attack vector hai.</p>

      <h2>19. Common Phishing Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Urgent Language','Your account will be closed within 24 hours, act now'],['Fake Domains','paypa1.com, arnazon.com, g00gle.com, micros0ft.com'],['Suspicious Links','Displayed text alag, actual URL alag hota hai'],['Unexpected Attachments','Invoice.docm, Statement.zip, Receipt.exe jo kabhi expect nahi tha'],['Generic Greeting','Dear Customer, Dear User jaise non-personal greetings'],['Auth Failures','SPF fail plus DKIM fail ek saath strong phishing signal hai']].map(r=>`
        <div style="display:grid;grid-template-columns:180px 1fr;gap:10px;background:rgba(220,20,20,0.05);border-radius:8px;border:1px solid rgba(220,20,20,0.15);padding:10px 16px;align-items:center;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><path d="M7 1L13 13H1L7 1z" stroke="#dc1414" stroke-width="1.3" stroke-linejoin="round"/><path d="M7 6v3M7 10.5h.01" stroke="#dc1414" stroke-width="1.3" stroke-linecap="round"/></svg>
            <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>20. Link Analysis</h2>
      <p>Phishing emails mein displayed link aur actual URL alag hote hain. Koi bhi link click karne se pehle hover karke real URL dekho. Attackers typosquatting use karte hain jaise bank.com ki jagah bnak.com ya b4nk.com.</p>
      <pre><code>Displayed text:  Click here to verify your account at bank.com
Actual URL:      http://evil-attacker-site.ru/steal/credentials

Aise links pe kabhi seedha click mat karo
Hover karke status bar mein actual URL check karo</code></pre>
      <div class="info-box"><p><strong>Safe practice:</strong> Kisi bhi suspicious link ko directly browser mein type karo ya official website par seedha jao. Email ke link par trust mat karo.</p></div>

      <h2>21. Attachment Analysis</h2>
      <p>Malicious attachments email delivery ka common method hai. Attacker innocent-looking files bhejta hai jo actually malware hoti hain. Macro-enabled documents sabse dangerous hote hain kyunki unhe open karte hi malware execute ho sakta hai.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px;">
        ${[['EXE','Direct executable, seedha chalta hai'],['ZIP','Compressed malware, scanning se bachta hai'],['ISO','Disk image, security bypass karta hai'],['DOCM','Macro-enabled Word, bahut common'],['XLSM','Macro-enabled Excel'],['JS','JavaScript dropper'],['LNK','Windows shortcut exploit'],['PDF','Embedded malicious scripts']].map(r=>`
        <div style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.22);border-radius:8px;padding:8px 14px;text-align:center;">
          <div style="font-family:'Rajdhani',monospace;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:10px;color:#888;margin-top:3px;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>22. Dangerous Macro Documents</h2>
      <p>DOCM aur XLSM files mein macros hote hain jo automatically execute ho sakte hain. Attackers invoice.docm ya statement.xlsm jaisi files bhejte hain jo real document lagti hain lekin open karte hi malware download karna shuru kar deti hain.</p>
      <pre><code>invoice.docm kholta hai user
      ↓
Macro automatically run hota hai
      ↓
PowerShell ya cmd se malware download hota hai
      ↓
System compromise ho jaata hai</code></pre>
      <div class="info-box"><p><strong>Rule:</strong> Unexpected email se aaya koi bhi attachment mat kholo. VirusTotal par check karo ya sandbox mein analyze karo.</p></div>

      <h2>23. Email Malware Delivery Flow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Phishing Email','Attacker bhejta hai'],['Attachment Opened','User click karta hai'],['Malware Download','Background mein download'],['Command and Control','Malware C2 se connect karta hai'],['System Compromise','Attacker ka access mil jaata hai']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'220,20,20,0.3':i===4?'220,20,20,0.3':'255,255,255,0.06'});border-radius:10px;padding:11px 24px;text-align:center;width:250px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===4?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="20" viewBox="0 0 16 20" fill="none" style="margin:2px 0;"><path d="M8 2v14M3 12l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>24. Email Tracing Investigation</h2>
      <p>Email trace karna ek systematic process hai. Investigator ko ye sawaal answer karne hote hain: koi bhi decision lene se pehle headers se facts nikalne padte hain.</p>
      <pre><code>Who sent it?          Received headers ka bottom IP
Which server?         Received chain mein har server entry
Which IP?             Original IP sabse neeche Received mein
Authentication?       SPF DKIM DMARC results check karo
Domain legitimate?    From address aur Return-Path compare karo</code></pre>

      <h2>25. Business Email Compromise</h2>
      <div class="info-box"><p><strong>BEC</strong> ek high-value attack hai jisme CEO, Manager ya Finance staff ko impersonate kiya jaata hai. Goal hota hai wire transfer fraud ya sensitive information leak karna.</p></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Domain Lookalikes','company.co vs company.com, barely noticeable difference'],['Urgent Wire Transfer','Abhi payment karo, audit chal raha hai, CEO ka order hai'],['Authority Impersonation','From: CEO, board meeting mein hun, call mat karna'],['Unusual Timing','Weekend ya late night requests jab verification mushkil ho']].map(r=>`
        <div style="display:flex;align-items:flex-start;gap:12px;background:rgba(220,20,20,0.06);border:1px solid rgba(220,20,20,0.18);border-radius:8px;padding:12px 14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="flex-shrink:0;margin-top:1px;"><path d="M9 2L16 15H2L9 2z" stroke="#dc1414" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 8v3M9 13h.01" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>26. Email Header Investigation Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:0 0 28px;">
        ${[['Step 1','Collect Headers','Gmail Show original se full headers copy karo'],['Step 2','Read Received Chain','Bottom se top padho, original IP nikalo'],['Step 3','Check SPF','Sender IP authorized hai ya nahi'],['Step 4','Check DKIM','Message tampered hua ya nahi'],['Step 5','Check DMARC','Policy pass hua ya fail'],['Step 6','Analyze Links','Hover karke actual URL verify karo'],['Step 7','Scan Attachments','VirusTotal ya sandbox mein analyze karo']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0?'255,255,255,0.08':'220,20,20,0.15'});border-radius:10px;padding:10px 20px;width:300px;display:flex;align-items:center;gap:12px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[1]}</div><div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;">${r[2]}</div></div>
        </div>${i<a.length-1?'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin:2px 0;"><path d="M8 2v10M4 9l4 4 4-4" stroke="#333" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>27. SMTP Traffic in Wireshark</h2>
      <p>Wireshark mein SMTP traffic filter karke email ka poora conversation dekha ja sakta hai. Ye tab possible hai jab email unencrypted ho yaani plain SMTP use ho raha ho.</p>
      <pre><code>Filter: smtp

Observe hoga:
EHLO mail.sender.com        Greeting, sender identify karta hai
MAIL FROM: user@sender.com  Sender declare karta hai
RCPT TO: victim@target.com  Recipient specify karta hai
DATA                        Message body shuru hoti hai
.                           Message body khatam
QUIT                        Session band karta hai

Status codes:
220 = Service ready
250 = OK, command accepted
354 = Start mail input
550 = Rejected, delivery failed</code></pre>

      <h2>28. POP3 Traffic in Wireshark</h2>
      <p>POP3 traffic mein email retrieval observe hoti hai. Agar POP3 unencrypted ho toh credentials aur email content Wireshark mein dikh sakti hai.</p>
      <pre><code>Filter: pop

Commands jo dikh sakte hain:
USER username     Login attempt
PASS password     Password, unencrypted mein visible
LIST              Available emails list karo
RETR 1            Email number 1 retrieve karo
DELE 1            Email delete karo
QUIT              Session end</code></pre>

      <h2>29. IMAP Traffic in Wireshark</h2>
      <p>IMAP traffic mein synchronization activity observe hoti hai. Folders, messages aur sync operations dikh te hain.</p>
      <pre><code>Filter: imap

Observe hoga:
LOGIN username password    Authentication
SELECT INBOX               Folder select karna
FETCH 1 BODY[]             Email content fetch karna
SEARCH UNSEEN              Unread emails dhundhna
LOGOUT                     Session end</code></pre>
      <div class="info-box"><p><strong>Note:</strong> Modern email mostly TLS encrypted hota hai isliye credentials aur content directly nahi dikh te. Port 993 IMAPS aur Port 995 POP3S encrypted hote hain.</p></div>

      <h2>30. Practical Lab 1</h2>
      <p>SMTP traffic capture karo lab environment mein.</p>
      <pre><code>Step 1: Wireshark open karo
Step 2: Interface select karo
Step 3: Filter lagao: smtp
Step 4: Lab mein email send karo
Step 5: EHLO, MAIL FROM, RCPT TO commands observe karo
Step 6: Server responses dekho: 220, 250, 354</code></pre>

      <h2>31. Practical Lab 2</h2>
      <p>Koi bhi apna email lo aur headers manually inspect karo.</p>
      <pre><code>Gmail mein:
3-dot menu par click karo
Show original select karo
Poora raw header copy karo

Inspect karo:
From aur Return-Path compare karo
Received chain bottom se top padho
SPF DKIM DMARC results dhundho
Message-ID verify karo</code></pre>

      <h2>32. Practical Lab 3</h2>
      <p>Phishing email analyze karo. Sample phishing emails freely available hain online resources par.</p>
      <pre><code>mxtoolbox.com par jao
Email Header Analyzer use karo
Headers paste karo

Identify karo:
Suspicious IP addresses
Failed authentication results
Unusual relay servers
Domain mismatches</code></pre>

      <h2>33. Real Investigation Example</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="16" height="12" rx="2" stroke="#dc1414" stroke-width="1.4"/><path d="M1 6l8 5 8-5" stroke="#dc1414" stroke-width="1.4" stroke-linejoin="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Suspicious Invoice Email</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          User reports: "CEO ne invoice email bheja hai."<br>
          Received chain: Russia ke server se aaya tha<br>
          SPF = <span style="color:#dc1414;font-weight:600;">FAIL</span>, sender IP domain ke liye authorized nahi tha<br>
          DKIM = <span style="color:#dc1414;font-weight:600;">FAIL</span>, signature missing tha, message verified nahi<br>
          Domain = <span style="color:#dc1414;font-weight:600;">company.co</span> tha jabki real domain company.com hai<br>
          Attachment = <span style="color:#dc1414;font-weight:600;">invoice.docm</span>, macro-enabled malware tha<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: BEC phishing attack confirmed, finance team ko wire transfer rok diya</span>
        </div>
      </div>

      <h2>34. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Sirf From field trust karna','From spoofed ho sakta hai, headers check karna zaroori hai'],['Received headers ignore karna','Original source aur route miss ho jaayega'],['SPF check na karna','Unauthorized sender nahi pakda jaayega'],['Links bina hover ke click karna','Fake URLs trap hote hain, pehle check karo'],['DKIM ignore karna','Message tampering detect nahi hogi'],['Attachment seedha kholna','Pehle VirusTotal par scan karo']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>35. Skills to Master</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Email Headers','From, To, Subject, Date, Message-ID, Received, Return-Path'],['SMTP Basics','Commands, ports, server communication'],['SPF','DNS record check, sender IP authorization'],['DKIM','Digital signature verification, message integrity'],['DMARC','Policy enforcement, reporting, spoofing prevention'],['Phishing Analysis','Indicators, link analysis, urgency detection'],['Attachment Analysis','File types, macros, VirusTotal scanning'],['Email Tracing','Received chain analysis, IP extraction, geolocation']].map(r=>`
        <div style="display:grid;grid-template-columns:150px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <div class="info-box">
        <p><strong>Part 9 ke baad ye zaroor karo:</strong></p>
        <ul style="margin-top:8px;">
          <li>Gmail mein ek email open karo, 3-dot menu se Show original select karo</li>
          <li>Received chain bottom se top padho aur original IP dhundho</li>
          <li>SPF, DKIM, DMARC results identify karo</li>
          <li>mxtoolbox.com par Email Header Analyzer use karo</li>
          <li>Wireshark mein smtp filter lagao aur commands observe karo</li>
          <li>Kisi bhi suspicious email mein link hover karke real URL check karo</li>
        </ul>
      </div>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>SMTP ka kaam kya hai?</li>
          <li>Received header kyun important hai?</li>
          <li>SPF kya verify karta hai?</li>
          <li>DKIM kya verify karta hai?</li>
          <li>BEC attack kya hota hai?</li>
        </ul>
      </div>

    `;

  } else if (index === 9) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. What is a PCAP Investigation?</h2>
      <p>PCAP Investigation ka matlab hai captured network traffic file ko analyze karke kisi incident, malware activity, attacker behavior ya data theft ki poori story reconstruct karna. Ye professional network forensics ka core skill hai.</p>

      <h2>2. What is a PCAP File?</h2>
      <div class="info-box"><p><strong>PCAP = Packet Capture.</strong> Ye ek file hoti hai jisme network ka poora recorded traffic hota hai. Jaise video camera traffic record karta hai, PCAP network traffic record karta hai har packet ke saath.</p></div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 28px;">
        ${[['Packets','Har ek network packet'],['Protocols','TCP, UDP, DNS, HTTP, TLS'],['IP Addresses','Source aur destination'],['DNS Requests','Kaunse domains query kiye'],['TCP Sessions','Connection details'],['HTTP/TLS Traffic','Web requests aur encrypted sessions']].map(r=>`
        <div style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.22);border-radius:8px;padding:8px 14px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;margin-top:2px;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Investigation Goals</h2>
      <p>Jab PCAP mile toh investigator sabse pehle ye sawaal answer karta hai. Bina goal ke investigation inefficient hoti hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['What happened?','Kya incident hua, malware download, data theft ya scanning'],['When happened?','Timeline kya thi, kab shuru hua kab khatam'],['Who was involved?','Kaunse hosts involved the, internal ya external'],['Which systems communicated?','Kaunse IPs aapas mein baat kar rahe the'],['Was malware present?','Koi suspicious download ya C2 communication tha'],['Was data stolen?','Large uploads ya unusual destinations the']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;flex-shrink:0;">${i+1}</span>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-top:2px;">${r[1]}</div></div>
        </div>`).join('')}
      </div>

      <h2>4. Professional Investigation Workflow</h2>
      <div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:16px 0 28px;">
        ${[['Receive PCAP','PCAP file collect karo incident se'],['Initial Triage','Quick overview, size, duration, protocols'],['Protocol Analysis','Traffic distribution dekho'],['Host Identification','Internal aur external hosts identify karo'],['Timeline Creation','Events ki sequence banao'],['IOC Extraction','IPs, domains, URLs, hashes collect karo'],['Malware Analysis','Suspicious behavior investigate karo'],['Evidence Correlation','Saare findings jodo ek story mein'],['Reporting','Professional report banao']].map((r,i,a)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border:1px solid rgba(${i===0||i===8?'220,20,20,0.25':'255,255,255,0.06'});border-radius:10px;padding:10px 24px;text-align:center;width:260px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:${i===0||i===8?'#dc1414':'#f4f4f5'};">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#666;margin-top:2px;">${r[1]}</div>
        </div>${i<a.length-1?'<svg width="16" height="18" viewBox="0 0 16 18" fill="none" style="margin:2px 0;"><path d="M8 2v12M3 10l5 5 5-5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}`).join('')}
      </div>

      <h2>5. Step 1: Initial Triage</h2>
      <p>Triage matlab quick overview. PCAP khol te hi sabse pehle basic information gather karo. Directly deep dive mat karo, pehle scope samjho.</p>
      <pre><code>Triage mein check karo:

PCAP file size        Kitna bada hai, lamba session tha
Capture duration      Kitne time ka traffic record hai
Number of hosts       Kitne unique IPs hain
Major protocols       Kaunse protocols dominant hain
Time range            Investigation ka window kya hai</code></pre>
      <div class="info-box"><p><strong>Wireshark mein:</strong> Statistics menu kholo aur Protocol Hierarchy select karo. Ye sabse pehla kaam hai jo har investigator karta hai.</p></div>

      <h2>6. Protocol Hierarchy Analysis</h2>
      <p>Protocol Hierarchy ek overview deta hai ki traffic ka distribution kya hai. Kaunsa protocol kitna percent use ho raha hai ye dekh ke investigator understand karta hai ki kya investigate karna hai.</p>
      <pre><code>Statistics  Protocol Hierarchy

Example output:
Protocol        Packets   Percent
TCP             8420      70.2%
UDP             2400      20.0%
DNS             600        5.0%
TLS             480        4.0%
HTTP            120        1.0%

Agar TLS bahut zyada hai: encrypted traffic investigate karo
Agar DNS bahut zyada hai: DNS tunneling check karo
Agar HTTP hai: plaintext requests mein credentials ho sakte hain</code></pre>

      <h2>7. Step 2: Identify Top Hosts</h2>
      <p>Endpoints analysis se pata chalta hai ki kaunse hosts ne sabse zyada traffic generate kiya. Unusual hosts ya unknown IPs investigation ke liye priority hoti hain.</p>
      <pre><code>Statistics  Endpoints  IPv4 tab

Information milti hai:
IP Address        Har unique host ka address
MAC Address       Physical hardware address
Packets Sent      Kitne packets bheje
Packets Received  Kitne packets receive kiye
Bytes Sent        Kitna data upload kiya
Bytes Received    Kitna data download kiya

Kya dhundhna hai:
Host jo sabse zyada upload kar raha ho  data exfiltration
Unknown external IPs                    C2 ya attacker
Unusual MAC addresses                   Impersonation</code></pre>

      <h2>8. Step 3: Analyze Conversations</h2>
      <p>Conversations analysis source aur destination ke beech ke connections dikhata hai. Ye data exfiltration, malware C2, aur internal scanning detect karne mein use hota hai.</p>
      <pre><code>Statistics  Conversations  TCP tab

Columns:
Address A       Source IP
Address B       Destination IP
Packets A to B  Ek direction mein packets
Bytes A to B    Ek direction mein data
Duration        Connection kitni der chal ti rahi</code></pre>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Data Exfiltration','Internal host bahut zyada data external IP ko bhej raha hai'],['Malware C2','Fixed intervals par same destination se connection'],['Suspicious Uploads','Large POST requests ya FTP uploads'],['Internal Scanning','Ek host bahut saare internal IPs se connect kar raha hai']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>9. Step 4: Identify Internal vs External Hosts</h2>
      <p>Investigation mein sabse pehle ye samajhna zaroori hai ki kaunse hosts internal network ke hain aur kaunse bahar ke. Private IP ranges internal hoti hain.</p>
      <pre><code>Internal IP Ranges (Private):
10.0.0.0     to  10.255.255.255
172.16.0.0   to  172.31.255.255
192.168.0.0  to  192.168.255.255

External IPs: Baki sab public internet ke hain

Common legitimate external IPs:
8.8.8.8       Google DNS
1.1.1.1       Cloudflare DNS
Baaki unknown IPs ko investigate karo</code></pre>

      <h2>10. Step 5: DNS Investigation</h2>
      <p>DNS sabse important investigation point hai. Malware bhi domain name use karta hai C2 server se connect karne ke liye. DNS queries se pata chalta hai ki machine ne kaunse domains contact karne ki koshish ki.</p>
      <pre><code>Filter: dns

Look for:
Queried domains          Kaunse domains request kiye gaye
Failed resolutions       NXDOMAIN responses, domain exist nahi karta
High frequency queries   Ek domain ko baar baar query karna
DGA domains              random-a7x9k2.xyz jaise random looking names
Long subdomains          data.encoded.evil.com jaise DNS tunneling</code></pre>
      <div class="info-box"><p><strong>DGA = Domain Generation Algorithm.</strong> Malware automatically random domain names generate karta hai C2 server se connect karne ke liye. randomstring123.xyz jaisi domains suspicious hoti hain.</p></div>

      <h2>11. IOC Meaning</h2>
      <p>IOC yaani Indicator of Compromise wo evidence hai jo batata hai ki koi system compromise hua hai. PCAP investigation mein nikaale gaye IOCs dusre systems ki investigation mein bhi use hote hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;padding:8px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">IOC TYPE</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">EXAMPLE</span>
        </div>
        ${[['IP Address','192.168.1.100, 45.33.32.156'],['Domain','evil-malware-c2.xyz, randomdomain.ru'],['URL','/payload.exe, /gate.php, /upload'],['File Hash','abc123def456... (MD5 ya SHA256)'],['Email','attacker@suspicious-domain.com'],['Port','4444, 1337, 9001 (unusual ports)']].map(r=>`
        <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>12. Step 6: HTTP Investigation</h2>
      <p>HTTP traffic unencrypted hota hai isliye investigators ke liye goldmine hai. Downloads, uploads, credentials, aur malware requests sab visible hoti hain.</p>
      <pre><code>Filter: http
Sabse basic filter, sab HTTP traffic dikhaata hai

Filter: http.request
Sirf outgoing requests dikhaata hai

Filter: http.request.method == "POST"
POST requests dekho, data upload ya login attempts

Filter: http.request.uri contains ".exe"
Executable file downloads dhundhna

Filter: http.response.code == 200
Successful responses, actual content mile</code></pre>
      <p>GET requests mein URL dekho, POST requests mein body dekho, File downloads mein extension dekho aur response size dekho.</p>

      <h2>13. Investigate POST Requests</h2>
      <p>POST requests investigation mein bahut important hote hain kyunki malware data exfiltrate karne ke liye POST use karta hai. Login credentials bhi POST mein hote hain.</p>
      <pre><code>Filter: http.request.method == "POST"

Kya dekho POST mein:
Destination URL         Kahan data ja raha hai
Request body size       Kitna data bheja ja raha hai
Content-Type header     Kis format mein data bheja ja raha hai
Frequency               Kitni baar POST ho raha hai

Follow TCP Stream se POST body dekh sakte hain
Right click  Follow  TCP Stream</code></pre>

      <h2>14. Step 7: HTTPS / TLS Investigation</h2>
      <p>HTTPS traffic encrypted hota hai isliye content directly nahi dekha ja sakta. Lekin metadata se bahut information milti hai jo investigation mein kaam aati hai.</p>
      <pre><code>Filter: tls
Sabse basic TLS filter

Filter: tls.handshake.type == 1
Client Hello packets, connection attempt

Filter: tls.handshake.extensions_server_name
SNI field se destination domain pata chalta hai
Encrypted traffic mein bhi domain visible hota hai

Check karo:
SNI                Destination domain name
Certificate        Kaunsa certificate use ho raha hai
Timing             Connection kitni baar aur kab hoti hai
Destination IP     IP investigate karo WHOIS se</code></pre>
      <div class="info-box"><p><strong>SNI = Server Name Indication.</strong> TLS handshake mein plaintext mein hota hai. Encrypted traffic mein bhi destination domain is se pata chalta hai.</p></div>

      <h2>15. Step 8: Host Profiling</h2>
      <p>Har suspect host ke liye ek profile banao. Profile mein us host ki saari activity record karo. Ye evidence correlation mein help karta hai.</p>
      <pre><code>Host Profile: 192.168.1.20

DNS Activity:
  evil-domain.xyz query kiya        suspicious
  google.com query kiya             normal

HTTP Activity:
  GET /payload.exe downloaded       malicious
  POST /gate.php data sent          C2 communication

TLS Activity:
  evil-c2.ru se connection          C2 server
  Har 60 seconds mein reconnect     beaconing pattern

Upload Behavior:
  500KB data POST kiya              data exfiltration possible</code></pre>

      <h2>16. Host Profiling Table</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;padding:10px 16px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">HOST</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;">OBSERVED ACTIVITY</span>
        </div>
        ${[['192.168.1.5','Normal browser, Google DNS, HTTPS sites, no suspicious behavior','#f4f4f5'],['192.168.1.7','DNS only, no HTTP or TLS, unusual for a workstation','#b0b0b8'],['192.168.1.20','Suspicious uploads, C2 beaconing, malware download detected','#dc1414']].map(r=>`
        <div style="display:grid;grid-template-columns:140px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:10px 16px;">
          <code style="font-family:'Rajdhani',monospace;font-size:13px;font-weight:700;color:${r[2]};">${r[0]}</code>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>17. Step 9: Timeline Creation</h2>
      <p>Timeline investigation ka backbone hai. Events ki sequence banao taaki pata chale ki pehle kya hua aur baad mein kya. Bina timeline ke investigation incomplete hoti hai.</p>
      <pre><code>Example Timeline:

10:00:15  DNS query for evil-domain.xyz
10:00:16  DNS response received, IP = 45.33.32.156
10:00:17  TCP connection to 45.33.32.156:80
10:00:18  HTTP GET /payload.exe
10:00:22  File download complete, 245KB
10:02:00  New process behavior detected in traffic
10:02:01  DNS query for c2-server.ru
10:02:02  TCP connection every 60 seconds starts (beaconing)
10:15:30  HTTP POST /gate.php, 480KB data sent</code></pre>
      <p>Timeline se pata chalta hai: pehle DNS hua, phir download hua, phir C2 connection shuru hua, phir data exfil hua. Ye poori attack story hai.</p>

      <h2>18. Step 10: Detect Beaconing</h2>
      <p>Beaconing matlab malware C2 server ko fixed intervals par check-in karta rehta hai. Ye ek strong malware indicator hai. Legitimate software usually itni regularity se connect nahi karta.</p>
      <pre><code>Beaconing patterns:
Fixed time intervals    Har 30, 60, 120 seconds mein connection
Same destination        Hamesha same IP ya domain
Same packet size        Har packet approximately same size
Consistent timing       Night mein bhi same pattern</code></pre>
      <div style="display:flex;flex-direction:column;gap:8px;margin:16px 0 28px;">
        ${[['Fixed Intervals','Har 60 seconds mein exactly same destination ko connection'],['Same Destination','Ek hi IP ya domain ko baar baar'],['Same Packet Size','Check-in packets approximately same size hote hain'],['Off-hours Activity','Raat ko ya weekend mein bhi same pattern']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:rgba(220,20,20,0.07);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:10px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#dc1414" stroke-width="1.4"/><path d="M8 5v3.5M8 11h.01" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span><span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;margin-left:8px;">${r[1]}</span></div>
        </div>`).join('')}
      </div>

      <h2>19. Detecting Data Exfiltration</h2>
      <p>Data exfiltration ka matlab hai sensitive data bahar bheja ja raha hai. PCAP mein ye large uploads, unusual destinations ya repeated POST requests ke form mein dikh ta hai.</p>
      <pre><code>Signs of Data Exfiltration:

Large upload sessions      Bytes sent >> bytes received
Unusual external IPs       Unknown destinations ko data
Repeated POST requests     Baar baar data bheja ja raha hai
Long duration sessions     Connection ghanto tak open rehti hai
After-hours uploads        Business hours ke baad uploads

Filter for large uploads:
Statistics  Conversations mein Bytes A to B dekho
Jo host sabse zyada data bhej raha hai wo suspect hai</code></pre>

      <h2>20. Detecting Malicious Downloads</h2>
      <p>Malware delivery aksar file download se hoti hai. PCAP mein HTTP ya FTP se downloaded files ke evidence milte hain.</p>
      <pre><code>Filter: http.request.uri contains ".exe"
Filter: http.request.uri contains ".zip"
Filter: http.request.uri contains ".dll"
Filter: http.request.uri contains ".docm"

File Export:
File  Export Objects  HTTP

Ye sab downloaded files extract kar deta hai PCAP se
Extracted files ko VirusTotal par check karo</code></pre>

      <h2>21. Step 11: Follow TCP Streams</h2>
      <p>TCP stream follow karne se do hosts ke beech ki poori conversation reconstruct hoti hai. Ye commands, credentials, URLs aur data sabhi dekhne ke liye use hota hai.</p>
      <pre><code>Koi bhi packet par right click karo
Follow  TCP Stream

Color coding:
Red text    Client se server ko bheja gaya data
Blue text   Server se client ko aaya data

Kya dhundhna hai:
Commands       Shell commands ya malware instructions
Credentials    Username password plaintext mein
URLs           Download ya C2 URLs
File content   Downloaded file ka content</code></pre>

      <h2>22. Step 12: Find Suspicious Ports</h2>
      <p>Common services standard ports use karte hain. Agar koi service unusual port par chal rahi hai toh ye suspicious ho sakta hai. Malware aksar non-standard ports use karta hai detection se bachne ke liye.</p>
      <pre><code>Common legitimate ports:
80    HTTP
443   HTTPS
53    DNS
25    SMTP
22    SSH

Suspicious or unusual ports:
4444  Metasploit default
1337  Common malware port
9001  Tor relay
8080  Alternate HTTP, could be proxy
8443  Alternate HTTPS

Filter: tcp.port == 4444
Filter: tcp.port == 1337

Note: Unusual port alone proof nahi hai, investigate further karo</code></pre>

      <h2>23. Step 13: Check for Network Scanning</h2>
      <p>Network scanning tab hota hai jab koi attacker ya malware network mein targets dhundh raha hota hai. Bahut saare SYN packets bina ACK ke scanning ka indicator hai.</p>
      <pre><code>Filter: tcp.flags.syn == 1 && tcp.flags.ack == 0

Ye filter SYN packets dikhata hai jo ACK ke bina hain
Scanning mein attacker SYN bhejta hai lekin connection complete nahi karta

Scanning indicators:
Same source IP se bahut saari SYN packets
Different destination IPs ya ports
Short time mein hundreds of attempts
No complete TCP handshakes</code></pre>

      <h2>24. Step 14: Check for Failed Connections</h2>
      <p>TCP RST yaani reset packets tab aate hain jab connection reject ho jaata hai. Bahut saare RST packets scanning, reconnaissance ya malware retry attempts indicate karte hain.</p>
      <pre><code>Filter: tcp.flags.reset == 1

RST packets indicate kar sakte hain:
Closed ports      Port band hai, service nahi chal rahi
Reconnaissance    Attacker ports scan kar raha hai
Malware retries   C2 se connect nahi ho pa raha, baar baar try kar raha</code></pre>

      <h2>25. Step 15: Check ARP Activity</h2>
      <p>ARP yaani Address Resolution Protocol network mein IP se MAC address resolve karta hai. ARP poisoning attack mein attacker fake ARP replies bhejta hai taaki traffic intercept kar sake.</p>
      <pre><code>Filter: arp

Normal ARP:
Who has 192.168.1.1? Tell 192.168.1.5
192.168.1.1 is at aa:bb:cc:dd:ee:ff

ARP Poisoning indicators:
Duplicate MAC addresses     Same IP ke liye alag MACs
Gratuitous ARP spam         Bina request ke baar baar ARP broadcast
IP-MAC mismatch             Known host ki MAC badal gayi</code></pre>

      <h2>26. Investigation Checklist</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['WHO?','Source host kaun hai, internal ya external IP'],['WHAT?','Malware, download, exfiltration, scanning, C2'],['WHEN?','Exact timestamps, pehle kya hua baad mein kya'],['WHERE?','Destination IPs, domains, countries'],['HOW?','Kaunsa protocol use hua, kaunsa port, kaunsa method']].map(r=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:10px;border:1px solid rgba(220,20,20,0.15);padding:12px 16px;display:grid;grid-template-columns:70px 1fr;gap:8px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>27. Evidence Correlation</h2>
      <p>Investigation ke end mein saare findings ko milao ek complete story banane ke liye. Akela ek finding weak hota hai, lekin saath mein strong case banta hai.</p>
      <pre><code>Correlation example:

DNS query for evil-domain.xyz at 10:00:15
    +
HTTP download of payload.exe at 10:00:18 from same IP
    +
Beaconing to evil-domain.xyz every 60s from 10:02 onwards
    +
POST request with 480KB data to evil-domain.xyz at 10:15

= Complete malware infection story confirmed</code></pre>

      <h2>28. Sample Investigation</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Possible Malware Infection Alert</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert received: "Possible malware on 192.168.1.20"<br>
          Protocol Hierarchy: Unusual DNS + HTTP spike<br>
          DNS: <span style="color:#dc1414;font-weight:600;">random-domain.xyz</span> query, NXDOMAIN initially, then resolved<br>
          HTTP: GET <span style="color:#dc1414;font-weight:600;">/payload.exe</span> downloaded from resolved IP<br>
          TLS: <span style="color:#dc1414;font-weight:600;">Beaconing</span> har 60 seconds mein c2-server.ru ko<br>
          POST: <span style="color:#dc1414;font-weight:600;">480KB data</span> upload kiya /gate.php ko<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Confirmed malware infection, C2 communication aur data exfiltration detected</span>
        </div>
      </div>

      <h2>29. Reporting</h2>
      <p>Professional investigation report mein har section clear hona chahiye. Report non-technical management bhi padhti hai isliye simple language mein likhni chahiye evidence ke saath.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Summary','Kya hua, ek paragraph mein, non-technical language mein'],['Evidence','IPs, domains, timestamps, all collected IOCs with context'],['Findings','Observed activity ki detailed explanation'],['Impact','Risk level kitna hai, kya data gaya, kaunse systems affected'],['Recommendations','Mitigation steps, blocks, patches, monitoring']].map((r,i)=>`
        <div style="background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.05);padding:12px 16px;display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>30. IOC Collection Sheet</h2>
      <pre><code>IOC Collection Template:

Type       Value                    Source
Domain     evil-domain.xyz          DNS query at 10:00:15
IP         45.33.32.156             Resolved from evil-domain.xyz
URL        /payload.exe             HTTP GET at 10:00:18
IP         c2-server.ru resolved    TLS beaconing destination
URL        /gate.php                POST data exfiltration
Hash       abc123def456...          Extracted payload.exe file

Ye IOCs block karo firewall aur proxy mein
SIEM mein alert rules banao inke liye</code></pre>

      <h2>31. Common Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Conclusions pe seedha jump karna','Pehle triage karo, phir step by step investigate karo'],['DNS ignore karna','Malware C2 domain DNS mein hi milta hai sabse pehle'],['Timeline nahi banana','Bina timeline ke attack sequence samajh nahi aata'],['Conversations ignore karna','Data exfiltration conversations mein hi visible hoti hai'],['Evidence document nahi karna','Investigation ke waqt timestamps aur findings note karo'],['Single IOC pe rely karna','Saare findings correlate karo strong case ke liye']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>32. Real Investigator Mindset</h2>
      <p>Professional investigator kabhi assume nahi karta. Har claim ko evidence se verify karta hai. Mindset yahi hona chahiye: jo dikhta hai wo prove karo, jo nahi dikhta wo nahi likho.</p>
      <div class="info-box"><p><strong>Never assume. Always verify.</strong> IP suspicious lagta hai toh WHOIS se verify karo. Domain malicious lagta hai toh VirusTotal se check karo. Timestamp note karo har finding ke saath.</p></div>

      <h2>33. Practical Lab</h2>
      <p>Koi bhi free PCAP file lo malware-traffic-analysis.net ya pakettotal.com se aur ye steps follow karo.</p>
      <pre><code>Step 1  Statistics  Protocol Hierarchy
Step 2  Statistics  Endpoints  top hosts identify karo
Step 3  Statistics  Conversations  suspicious sessions dekho
Step 4  Filter: dns  queried domains nikalo
Step 5  Filter: http  HTTP activity dekho
Step 6  Filter: tls  TLS connections dekho
Step 7  Timeline banao har event ka with timestamps
Step 8  IOC sheet mein sab collect karo
Step 9  Export Objects se files extract karo
Step 10 VirusTotal par files aur domains check karo</code></pre>

      <div class="info-box">
        <p><strong>Mini Assignment:</strong></p>
        <ul style="margin-top:8px;">
          <li>IOC kya hota hai?</li>
          <li>Protocol Hierarchy kyun useful hai?</li>
          <li>Timeline kyun banate hain?</li>
          <li>Beaconing kya indicate kar sakta hai?</li>
          <li>PCAP investigation ka pehla step kya hai?</li>
        </ul>
      </div>

    `;

  } else if (index === 10) {
    document.getElementById('chapterContent').innerHTML = `

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
  } else if (index === 12) {
    document.getElementById('chapterContent').innerHTML = `

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
  } else if (index === 13) {
    document.getElementById('chapterContent').innerHTML = `

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
  } else if (index === 14) {
    document.getElementById('chapterContent').innerHTML = `

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
  } else if (index === 15) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. What is Wireless Network Forensics?</h2>
      <p>Wireless Network Forensics ka matlab hai Wi-Fi networks, wireless devices aur 802.11 traffic ko collect, analyze aur investigate karna taaki unauthorized access detect ho, rogue APs identify hon, wireless attacks investigate hon aur evidence collect ho.</p>

      <h2>2. Why Wireless Forensics Matters?</h2>
      <p>Modern environments mein Wi-Fi everywhere hai aur attackers ise isliye target karte hain kyunki physical access ki zaroorat nahi, users Wi-Fi par trust karte hain aur misconfigurations common hain.</p>

      <div style="display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;margin:0 0 28px;align-items:stretch;">
        ${[['Home Wi-Fi','Personal network, least secured'],['Office Wi-Fi','Enterprise WLAN'],['Public Hotspot','Most vulnerable'],['Enterprise WLAN','802.1X auth + monitoring']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:120px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Basic Wi-Fi Architecture</h2>
      <pre><code>Laptop / Phone (Client)
       ↓
  Access Point (AP)
       ↓
     Router
       ↓
    Internet</code></pre>

      <h2>4. Important Wireless Components</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">COMPONENT</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PURPOSE</span>
        </div>
        ${[['Client','Phone ya Laptop jo connect hota hai'],['Access Point (AP)','Wi-Fi signal provide karta hai'],['Router','Network ko internet se connect karta hai'],['SSID','Wi-Fi network ka visible naam'],['BSSID','AP ka unique MAC address']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. SSID aur BSSID</h2>
      <p>SSID matlab Service Set Identifier. Ye Wi-Fi ka visible naam hota hai jaise "Home_WiFi" ya "Office_Network". BSSID matlab Access Point ka MAC address hota hai jaise <code>00:11:22:33:44:55</code>. Investigators BSSID se specific AP identify karte hain.</p>
      <div class="info-box"><p><strong>Key Difference:</strong> SSID naam hai, BSSID hardware identity hai. Ek hi SSID ke peeche multiple BSSIDs ho sakte hain. Ye Evil Twin detection mein critical hai.</p></div>

      <h2>6. IEEE 802.11 Standards</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">STANDARD</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">COMMON NAME</span>
        </div>
        ${[['802.11n','Wi-Fi 4'],['802.11ac','Wi-Fi 5'],['802.11ax','Wi-Fi 6']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:13px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>7. Wireless Frame Types</h2>
      <p>Ethernet se alag Wi-Fi 802.11 frames use karta hai. Teen major categories hain:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Management Frames','Network discover karna, join karna, maintain karna. Beacon, Probe, Auth, Association'],['Control Frames','Traffic manage karna, delivery acknowledge karna. ACK, RTS, CTS'],['Data Frames','Actual user traffic. Web browsing, email, downloads, streaming']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:180px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>8. Beacon Frames</h2>
      <p>Access Point periodically broadcast karta hai apni presence announce karne ke liye. Beacon mein SSID, capabilities, channel aur security info hoti hai. Simple terms mein: "Main yahan hoon, mujhse connect karo."</p>
      <pre><code>Beacon Frame Contents:
SSID          → Network naam
Channel       → Frequency channel
Capabilities  → Supported standards
Security      → WPA2 / WPA3 info
Beacon Interval → Kitni baar broadcast ho</code></pre>

      <h2>9. Probe Request aur Probe Response</h2>
      <p>Client probe request bhejta hai: "Kya Wi-Fi X available hai?" AP probe response deta hai: "Haan, main yahan hoon." Investigations mein probe requests valuable hain kyunki ye reveal karte hain ki device kaunse networks dhundh raha hai.</p>

      <h2>10. Authentication aur Association Frames</h2>
      <p>Authentication frame: client AP se authenticate karne ki koshish karta hai. Association frame: authentication ke baad network join karne ke liye use hota hai. Ye sequence wireless connection ke liye mandatory hai.</p>

      <h2>11. Monitor Mode Kyun Zaroori Hai?</h2>
      <p>Monitor mode ek special wireless adapter mode hai jo aaspaas ke sabhi wireless frames capture karne deta hai. Bina monitor mode ke bahut saare wireless frames invisible rehte hain aur wireless forensics properly nahi ho sakti.</p>
      <div class="info-box"><p><strong>Tool Requirement:</strong> Monitor mode ke liye wireless adapter ka is mode ko support karna zaroori hai. Kismet aur Aircrack-ng commonly is kaam ke liye use hote hain.</p></div>

      <h2>12. Wireless Analysis Tools</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:0 0 28px;">
        ${[['Wireshark','Packet-level wireless analysis'],['Aircrack-ng','Monitor mode, WPA analysis'],['Kismet','Passive wireless discovery']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:6px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;line-height:1.6;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>13. Wi-Fi Security Standards</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">STANDARD</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">STATUS</span>
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">NOTE</span>
        </div>
        ${[['WEP','Broken','Cryptographic weaknesses, avoid'],['WPA','Legacy','Better than WEP but outdated'],['WPA2','Common','Most deployed today'],['WPA3','Modern','Strongest, password attack resistant']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#c0c0cc;">${r[1]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">${r[2]}</div>
        </div>`).join('')}
      </div>

      <h2>14. WEP Kyun Insecure Hai?</h2>
      <p>WEP mein major cryptographic weaknesses hain. IV (Initialization Vector) reuse hoti hai, RC4 encryption weak hai aur statistical attacks se WEP keys minutes mein crack ho jaati hain. Aaj WEP completely broken aur unsafe consider kiya jaata hai.</p>

      <h2>15. WPA3 Advantages</h2>
      <p>WPA3 modern replacement hai WPA2 ka. Isme SAE (Simultaneous Authentication of Equals) use hota hai jo dictionary attacks se protect karta hai. Forward secrecy bhi provide karta hai matlab ek session crack hone se doosre sessions safe rehte hain.</p>

      <h2>16. What is a Rogue Access Point?</h2>
      <p>Rogue AP matlab unauthorized wireless access point jo bina permission ke network mein add ho jaata hai. Example: employee secretly personal Wi-Fi router office mein lagata hai. Ye security controls bypass kar sakta hai aur sensitive traffic intercept kar sakta hai.</p>

      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="13" r="0.8" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">ROGUE AP INDICATORS</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${['Unknown SSID jo authorized list mein nahi hai','Unknown BSSID jo registered APs se alag hai','Unexpected wireless channel par broadcasting','Unauthorized physical location se signal aa raha hai'].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(220,20,20,0.12);">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><circle cx="7" cy="7" r="6" stroke="#dc1414" stroke-width="1.2"/><path d="M5 5l4 4M9 5l-4 4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>17. Evil Twin Attack</h2>
      <p>Attacker ek fake Wi-Fi banata hai jo legitimate network jaisa dikhta hai. Real aur fake dono ka SSID same hota hai lekin BSSID alag hota hai. Goal: victims ko fake AP se connect karwana taaki traffic intercept ho sake.</p>
      <pre><code>Real AP:
  SSID: CompanyWiFi
  BSSID: AA:BB:CC:11:22:33

Evil Twin (Fake AP):
  SSID: CompanyWiFi       ← Same naam
  BSSID: DD:EE:FF:44:55:66  ← Alag BSSID
  Signal: Stronger than real AP</code></pre>

      <h2>18. Evil Twin Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Same SSID','Legitimate network ke naam se match karta hai'],['Alag BSSID','Registered AP ka MAC address nahi hai'],['Signal Pattern','Real AP se alag signal strength ya location'],['Security Settings','Unexpected auth type, open ya different encryption']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>19. Deauthentication Attack</h2>
      <p>Attacker deauth frames send karta hai jo clients ko forcefully disconnect kar deta hai. Ye 802.11 management frames hain jo normally AP se aate hain. Attacker inhe spoof karta hai network disruption ya handshake capture ke liye.</p>
      <pre><code>Normal Flow:
  Client → Connected to AP

Deauth Attack:
  Attacker → Spoofed Deauth Frame → Client
  Client → Disconnected
  Client → Reconnect attempt
  Attacker → Captures 4-way handshake</code></pre>

      <h2>20. Deauthentication Attack Indicators</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Bahut saare deauth frames','Short time mein thousands of deauth packets'],['Frequent disconnects','Multiple users repeatedly disconnect ho rahe hain'],['Same source','Ek hi MAC address se sab deauths aa rahe hain'],['Multiple clients affected','Sirf ek nahi, puri network disrupted hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:220px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>21. Hidden SSIDs</h2>
      <p>Kuch networks apna naam chhupate hain SSID broadcast band karke. Lekin hidden SSID ka matlab secure nahi hota. Clients probe requests mein hidden SSIDs reveal kar dete hain isliye investigators inhe discover kar sakte hain.</p>
      <div class="info-box"><p><strong>Hidden SSID Reality:</strong> Jab koi device hidden network se connect karna chahta hai toh wo probe request mein SSID naam include karta hai. Investigators yahan se hidden network ka naam pata kar lete hain.</p></div>

      <h2>22. MAC Address Randomization</h2>
      <p>Modern devices privacy ke liye MAC addresses randomize karte hain. Iska purpose tracking reduce karna hai. Investigators ke liye challenge ye hai ki same device ko different sessions mein correlate karna mushkil ho jaata hai.</p>

      <h2>23. Wireless Investigation Questions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Kaunsa AP use hua?','BSSID identify karo authorized list se match karo'],['Kaunsa client connected?','Client MAC track karo connection history mein'],['Connection kab hua?','Timestamp se timeline banao'],['Auth successful tha?','Authentication frames check karo'],['Rogue AP tha?','Unknown BSSID dhundho']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>24. Wireless Connection Timeline</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['10:00','Probe Request: Client network dhundh raha hai'],['10:01','Probe Response: AP ne respond kiya'],['10:02','Authentication: Client authenticate kar raha hai'],['10:03','Association: Client network join kar raha hai'],['10:04','Data Traffic: Normal user traffic chal raha hai'],['10:05','Deauth Attack: Suspicious deauth frames aa rahe hain']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:70px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>25. Wireless Incident Investigation Workflow</h2>
      <pre><code>Step 1: Wireless traffic capture karo (Monitor Mode on)
Step 2: Nearby APs identify karo (SSID + BSSID + Channel)
Step 3: Clients identify karo (MAC addresses)
Step 4: Management frames analyze karo (Beacon, Probe, Auth)
Step 5: Anomalies dhundho (Unknown BSSID, Deauth flood)
Step 6: Attack patterns identify karo (Evil Twin, Deauth)
Step 7: Complete timeline banao</code></pre>

      <h2>26. Example Investigation</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Users Repeatedly Disconnect Ho Rahe Hain</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert: <span style="color:#888;">Multiple users report kiya ki Wi-Fi baar baar disconnect ho raha hai</span><br>
          Capture: <span style="color:#dc1414;font-weight:600;">Thousands of Deauthentication Frames</span> ek hi source MAC se<br>
          Source: <span style="color:#dc1414;font-weight:600;">AA:BB:CC:99:88:77</span>, authorized AP list mein nahi<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Deauthentication attack confirm hua, rogue device locate aur isolate kiya</span>
        </div>
      </div>

      <h2>27. Wireless Artifacts</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SSIDs','Saare visible aur hidden network names'],['BSSIDs','Har AP ka unique MAC address'],['Channels','Kis frequency par broadcast ho raha hai'],['Client MACs','Connecting devices ki identities'],['Auth Events','Successful aur failed authentication attempts'],['Association Events','Network join karne ke records']].map(r=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;min-width:130px;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>28. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['SSID aur BSSID confuse karna','Naam aur hardware identity alag hain, dono track karo'],['Management frames ignore karna','Beacon aur Probe mein sabse zyada evidence hota hai'],['Hidden SSID ko secure samajhna','Hidden nahi matlab invisible, probe traffic reveal kar deta hai'],['Deauth traffic ignore karna','Deauth flood sabse common wireless attack indicator hai'],['Timeline nahi banana','Wireless investigation mein chronological order critical hai']].map(r=>`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e0e12;border-radius:8px;border:1px solid rgba(220,20,20,0.12);padding:10px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="#dc6060" stroke-width="1.5" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#dc6060;">${r[0]}</span>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#666;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>29. Skills to Master</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['802.11 Basics','Wi-Fi architecture, channels, frame structure samajhna'],['Management Frame Analysis','Beacon, Probe, Auth, Association frames read karna'],['WPA2 aur WPA3 Concepts','Security protocols aur unke weaknesses'],['Rogue AP Detection','Unauthorized APs identify karna'],['Evil Twin Detection','Same SSID different BSSID, fake AP pehchanna'],['Wireless Packet Analysis','Wireshark se 802.11 traffic analyze karna'],['Deauth Attack Investigation','Flood patterns detect karna timeline ke saath']].map(r=>`
        <div style="display:grid;grid-template-columns:220px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>30. Practical Labs</h2>
      <pre><code>Lab 1 - Wireless Traffic Capture:
Monitor mode on karo
Nearby SSIDs, BSSIDs aur channels note karo

Lab 2 - Frame Analysis:
Beacon frames identify karo
Probe requests aur responses filter karo

Lab 3 - Authentication Events:
Auth frames dhundho
Association events timeline mein daalo

Lab 4 - Full Timeline Build:
Probe → Auth → Association → Data Traffic
Har event ka timestamp record karo</code></pre>

      <h2>31. Wireless Client Tracking</h2>
      <p>Wireless investigations mein individual clients ko track kiya ja sakta hai. Client ka MAC address, wo kaunse SSIDs search kar raha tha, kaunse APs se connected hua aur poori connection history. Ye sab packet capture se milta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Client MAC','Device ki unique hardware identity'],['Probe History','Kaunse networks dhundhe gaye'],['AP Joined','Kaunse access points se connect hua'],['Connection Time','Kab connect hua, kab disconnect hua'],['Data Volume','Kitna data transfer hua']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>32. WPA2 Four-Way Handshake</h2>
      <p>WPA2 mein jab client connect karta hai toh ek four-way handshake hota hai jisme encryption keys exchange hoti hain. Ye handshake investigators ke liye important hai kyunki deauth attacks isi handshake ko capture karne ke liye kiye jaate hain.</p>
      <pre><code>Step 1: AP → Client - ANonce (random number)
Step 2: Client → AP - SNonce + MIC
Step 3: AP → Client - GTK (Group Temporal Key)
Step 4: Client → AP - ACK

Result: Encrypted session established
Attacker goal: Deauth se client disconnect karo
              Reconnect ke waqt handshake capture karo
              Phir offline dictionary attack karo</code></pre>

      <h2>33. WPA2 Handshake Capture</h2>
      <p>Attacker pehle deauth attack se client disconnect karta hai, phir reconnect ke waqt 4-way handshake capture karta hai. Captured handshake ko offline crack kiya ja sakta hai agar password weak ho. Investigators ke liye ye ek important attack vector samajhna zaroori hai.</p>
      <div class="info-box"><p><strong>Defense:</strong> WPA3 mein SAE protocol use hota hai jo forward secrecy provide karta hai. Handshake capture hone ke baad bhi offline cracking possible nahi hoti.</p></div>

      <h2>34. Channel Analysis</h2>
      <p>Wi-Fi specific frequency channels par kaam karta hai. 2.4 GHz band mein channels 1 se 13 hain, 5 GHz band mein zyada channels hain. Investigators channel information se identify karte hain ki kaunsa AP kahan hai aur rogue AP kaunse unexpected channel par broadcast kar raha hai.</p>
      <pre><code>2.4 GHz Non-overlapping Channels:
  Channel 1   → 2.412 GHz
  Channel 6   → 2.437 GHz
  Channel 11  → 2.462 GHz

5 GHz Channels:
  36, 40, 44, 48, 52...

Rogue AP: Kisi bhi channel par ho sakta hai
          Especially unusual channels par dhyaan do</code></pre>

      <h2>35. RSSI aur Signal Strength</h2>
      <p>RSSI matlab Received Signal Strength Indicator. Ye batata hai ki signal kitna strong hai. Investigators RSSI se AP ki approximate physical location estimate kar sakte hain. Evil Twin attacks mein attacker apna signal real AP se zyada strong rakhta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['-30 dBm','Excellent, bahut paas'],['-60 dBm','Good, normal range'],['-75 dBm','Fair, thoda door'],['-90 dBm','Poor, bahut door ya wall ke peeche']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>36. Wireless Packet Capture: Wireshark Filters</h2>
      <p>Wireshark mein 802.11 wireless frames ko analyze karne ke liye specific display filters use hote hain. Monitor mode pe capture ki gayi traffic mein ye filters sabse zyada use hote hain.</p>
      <pre><code>wlan                    → Sab 802.11 frames
wlan.fc.type == 0       → Sirf Management frames
wlan.fc.type == 1       → Sirf Control frames
wlan.fc.type == 2       → Sirf Data frames
wlan.fc.subtype == 8    → Sirf Beacon frames
wlan.fc.subtype == 4    → Sirf Probe Requests
wlan.fc.subtype == 12   → Sirf Deauth frames
wlan.addr == MAC        → Specific device ke frames</code></pre>

      <h2>37. Kismet Passive Wireless Discovery</h2>
      <p>Kismet ek passive wireless network detector hai jo bina khud koi packet bheje nearby networks aur devices discover karta hai. Ye stealth investigation ke liye useful hai kyunki khud detect nahi hota.</p>
      <pre><code>Kismet Features:
  Passive AP discovery - SSID, BSSID, Channel, Security
  Client tracking - connected devices list
  GPS integration - AP locations map par
  PCAP logging - evidence ke liye traffic save
  Alert system - rogue AP ya attack detect hone par</code></pre>

      <h2>38. Aircrack-ng Suite</h2>
      <p>Aircrack-ng ek complete wireless security toolkit hai jo investigators aur security professionals use karte hain. Monitor mode enable karne se lekar WPA handshake analyze karne tak ka kaam karta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['airmon-ng','Monitor mode enable/disable karna'],['airodump-ng','Wireless traffic capture karna, APs aur clients list karna'],['aireplay-ng','Test frames send karna, authorized testing only'],['aircrack-ng','Captured handshakes analyze karna']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p><strong>Legal Note:</strong> Aircrack-ng aur wireless tools sirf authorized systems par use karo. Bina permission ke kisi bhi network ko test karna illegal hai.</p></div>

      <h2>39. Wireless Artifacts Sources</h2>
      <p>Ek wireless investigation mein evidence multiple sources se aata hai:</p>
      <pre><code>Packet Capture (PCAP):
  SSIDs, BSSIDs, Channels, Frame types
  Authentication sequences, Data flows

Access Point Logs:
  Connected clients list
  Authentication success/fail
  DHCP assignments

RADIUS Server Logs (Enterprise):
  User authentication records
  Failed login attempts

Controller Logs (Enterprise WLAN):
  AP inventory
  Rogue AP detections
  Policy violations</code></pre>

      <h2>40. Enterprise Wireless Security</h2>
      <p>Enterprise environments mein Wi-Fi security zyada layered hoti hai. WPA2-Enterprise mein password ki jagah certificates ya RADIUS authentication use hoti hai isliye individual credentials se connect nahi hota.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['WPA2-Personal','Pre-shared key, ghar aur small office'],['WPA2-Enterprise','RADIUS server, corporate environments'],['802.1X','Port-based authentication, user/device verify'],['WIPS','Wireless Intrusion Prevention, rogue AP auto-block']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:200px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>41. Real Investigation Scenario</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Evil Twin, Coffee Shop Incident</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert: <span style="color:#888;">User ne report kiya ki credentials steal hui jab wo public Wi-Fi use kar raha tha</span><br>
          Capture: <span style="color:#dc1414;font-weight:600;">CoffeeShop_Free</span> SSID ke do alag BSSIDs mile<br>
          Real AP: <span style="color:#888;">AA:BB:CC:11:22:33, RSSI -65 dBm</span><br>
          Fake AP: <span style="color:#dc1414;font-weight:600;">DD:EE:FF:44:55:66, RSSI -45 dBm (stronger!)</span><br>
          Traffic: <span style="color:#dc1414;font-weight:600;">Fake AP open network tha, no encryption</span><br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Evil Twin confirmed, HTTP credentials intercept hua, victim device ki BSSID history evidence mein record ki</span>
        </div>
      </div>

      <h2>42. Wireless Forensics Investigation Checklist</h2>
      <pre><code>[ ] Monitor mode enable kiya
[ ] Capture file timestamps ke saath save kiya
[ ] Sab visible SSIDs list kiye
[ ] Sab BSSIDs note kiye aur authorized list se match kiya
[ ] Unknown BSSIDs flag kiye
[ ] Deauth frame count check kiya
[ ] Probe requests se client history nikali
[ ] Authentication success/failure record kiya
[ ] Channel information noted kiya
[ ] Signal strength (RSSI) location hints ke liye note kiya
[ ] Complete wireless timeline banaya
[ ] Evidence proper chain of custody mein preserve kiya</code></pre>

      <h2>43. Yahan Se Aage Kya?</h2>
      <p>Part 16 khatam hua. Wireless forensics sirf theory nahi hai. Jab real incident hota hai, jab koi user baar baar disconnect hota hai, jab coffee shop mein credentials steal hoti hain, tab investigator wahi karta hai jo tumne yahan seekha. BSSID dhundhna, deauth flood identify karna, evil twin ko real AP se alag karna aur poori wireless timeline banana. Ye skills aaj bhi real SOC teams daily use karti hain. Agar tumne ye 43 topics seriously padhe hain toh wireless investigation tumhare liye ab anjaan nahi rahi.</p>

      <!-- PART 16 COMPLETE BANNER -->
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
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 16 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Wireless Network Forensics</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">Ab tum Wi-Fi traffic sirf use nahi karte, tum usse investigate karte ho. SSID aur BSSID ka farq, 802.11 frames, WPA2 four-way handshake, Rogue AP detection, Evil Twin attack pehchanna, Deauthentication flood analyze karna aur Kismet aur Aircrack-ng ka use. Ye sab 43 topics ab tumhare toolkit mein hain.</p>
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
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 17 mein Cloud Network Forensics seekhenge. Cloud architecture, AWS aur Azure aur GCP networking basics, cloud logs, VPC Flow Logs, cloud attack investigation, IAM abuse detection aur cloud threat hunting.</p>
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
            'SSID aur BSSID mein kya difference hai?',
            'Beacon Frame kya broadcast karta hai aur kyun?',
            'Rogue AP kya hota hai aur investigators use kaise detect karte hain?',
            'Evil Twin attack mein SSID aur BSSID ke saath kya hota hai?',
            'Monitor Mode wireless forensics mein kyun zaroori hai?'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
  }

  else if (index === 16) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Cloud Network Forensics Kya Hai?</h2>
      <p>Cloud Network Forensics ek specialized investigation field hai jisme cloud environments ke andar network activity, administrative actions, user behavior aur security events ko systematically analyze kiya jaata hai. Traditional network forensics mein physical hardware hoti hai. Cloud mein wahi sab virtual infrastructure ban jaati hai. Evidence bhi virtual hota hai, logs ke form mein.</p>
      <div style="display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;margin:0 0 28px;">
        ${[['Virtual Networks','AWS VPC, Azure VNet, GCP VPC'],['Cloud Logs','CloudTrail, Activity Logs, Audit Logs'],['IAM System','Users, Roles, Permissions ka control'],['Security Groups','Virtual firewall rules'],['Flow Logs','Network traffic ka poora record']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);padding:14px 16px;flex:1;min-width:120px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:11px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>2. Cloud Investigation Kyun Alag Hai?</h2>
      <p>Aaj zyada tar companies AWS, Microsoft Azure ya GCP use karti hain. Jab koi attack hota hai toh evidence physical devices pe nahi hota, cloud logs mein hota hai. Aur logs collect karna, unhe padhna aur unse timeline banana ek alag skill hai. Jo investigator sirf traditional network jaanta hai, wo cloud incident mein pehle din hi confuse ho jaata hai.</p>
      <div class="info-box"><p><strong>Core Shift:</strong> Traditional investigation mein tum device pakad ke forensics karte ho. Cloud mein device tum kabhi physically touch nahi kar sakte. Evidence sirf logs mein hota hai, isliye log analysis hi tumhara primary skill ban jaata hai.</p></div>

      <h2>3. Traditional vs Cloud Investigation</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">TRADITIONAL</span>
          <span style="font-size:10px;font-weight:700;color:#dc1414;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">CLOUD</span>
        </div>
        ${[['Physical devices','Virtual infrastructure'],['Router aur switch logs','VPC Flow Logs'],['Firewall appliance','Security Groups aur NACLs'],['On-premise servers','Cloud instances (VMs)'],['Local evidence collection','Log-based remote analysis'],['Network TAP / SPAN port','Flow Log subscription'],['PCAP capture','Flow record exports']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Cloud Providers Jo Matter Karte Hain</h2>
      <p>Investigator ko teeno major providers ka basic structure pata hona chahiye. Har ek ka apna terminology aur log format hai lekin underlying concepts same hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['AWS','Amazon Web Services. Market leader. CloudTrail, VPC Flow Logs, GuardDuty, S3 Access Logs'],['Azure','Microsoft Azure. Enterprise environments mein popular. Activity Logs, NSG Flow Logs, Microsoft Defender'],['GCP','Google Cloud Platform. Cloud Audit Logs, VPC Flow Logs, Cloud Armor, Security Command Center']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>5. Shared Responsibility Model</h2>
      <p>Cloud security mein ek fundamental concept hai ki provider aur customer ki alag-alag responsibilities hain. Investigator ke liye ye samajhna zaroori hai kyunki ye decide karta hai ki kounse logs available honge aur kahan se evidence milega.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">PROVIDER KI ZIMMEDARI</span>
          <span style="font-size:10px;font-weight:700;color:#dc1414;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">CUSTOMER KI ZIMMEDARI</span>
        </div>
        ${[['Physical infrastructure','Data aur files'],['Hardware aur servers','Users aur permissions'],['Core network','Applications'],['Physical security','Access controls aur IAM']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;">
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>6. Virtual Network</h2>
      <p>Virtual Network cloud ka equivalent hai physical network ka. Har cloud provider ka apna naam hai lekin concept same hai. Ye ek isolated network environment hai jahan tumhare cloud resources exist karte hain, aur yahan se sara network evidence bhi aata hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['AWS','VPC - Virtual Private Cloud'],['Azure','VNet - Virtual Network'],['GCP','VPC - Virtual Private Cloud']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>7. VPC Ki Andar Kya Hota Hai?</h2>
      <p>VPC cloud ke andar ek private network hota hai. Isme tumhare instances, subnets, routes aur security rules hote hain. Investigator ke liye ye sabse important location hai kyunki zyada tar network evidence yahan se aata hai.</p>
      <pre><code>VPC ke andar:
  Instances (VMs / EC2)
  Subnets (Public aur Private)
  Route Tables
  Security Groups
  Internet Gateway
  NAT Gateway
  VPC Flow Logs</code></pre>

      <h2>8. Subnets</h2>
      <p>VPC ke andar chhote network blocks hote hain jinhe subnets kehte hain. Public subnet mein internet directly accessible hoti hai, private subnet internet se directly accessible nahi hota. Investigators ko subnet movement trace karna padta hai kyunki attacker web server compromise karke database tak pahunchne ki koshish karta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Public Subnet','Internet access available. Web servers, load balancers yahan hote hain'],['Private Subnet','Internet se directly accessible nahi. Databases, internal services yahan hoti hain']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:14px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>9. Route Tables</h2>
      <p>Route table decide karta hai ki network traffic kidhar jayega. Attacker agar route table modify kar de toh traffic malicious server ki taraf redirect ho sakta hai. Investigators route table changes ko audit logs mein trace karte hain.</p>
      <pre><code>Route Table Example:

Destination    : 0.0.0.0/0
Target         : igw-xxxxxxxx   (Internet Gateway)
Status         : Active

Destination    : 10.0.0.0/16
Target         : local
Status         : Active</code></pre>
      <div class="info-box"><p><strong>Investigation Point:</strong> Ager route table mein koi naya entry kisi unknown IP ki taraf dikhe toh ye traffic redirection attack ka sign ho sakta hai. Audit log mein route change kab aur kisne kiya ye trace karo.</p></div>

      <h2>10. Security Groups</h2>
      <p>Security Groups cloud mein virtual firewall ki tarah kaam karte hain. Instance level par inbound aur outbound traffic control karte hain. Investigators check karte hain ki security group rules kab change hue, kisne change kiye aur kya unexpected ports khol diye gaye.</p>
      <pre><code>Security Group Rule Example:

Type     : Inbound
Protocol : TCP
Port     : 443
Source   : 0.0.0.0/0   (Allowed - HTTPS)

Type     : Inbound
Protocol : TCP
Port     : 22
Source   : 0.0.0.0/0   (SUSPICIOUS - SSH to all)</code></pre>

      <h2>11. Security Groups ke Suspicious Rules</h2>
      <p>Koi bhi rule jo poori internet ko access de wo suspicious hai. Attackers often SSH ya RDP ports khol dete hain taaki direct access mil sake. Investigators ko ye changes audit log mein trace karne chahiye.</p>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="13" r="0.8" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">RED FLAG RULES</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${['Port 22 open to 0.0.0.0/0. SSH access poori internet ke liye available','Port 3389 open to 0.0.0.0/0. Windows RDP remote access public ho gaya','Port 3306 (MySQL) directly internet se accessible. Database exposed','Rule raat 2 AM pe add hua unknown user ke through. Off-hours suspicious change','Kisi existing allow rule ko delete kiya gaya aur broad rule add hua'].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(220,20,20,0.12);">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><circle cx="7" cy="7" r="6" stroke="#dc1414" stroke-width="1.2"/><path d="M5 5l4 4M9 5l-4 4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>12. NACL</h2>
      <p>Network ACL (Network Access Control List) subnet level par kaam karta hai, jabki Security Group instance level par kaam karta hai. NACL stateless hota hai matlab outbound traffic ke liye alag rule chahiye hoti hai. Interview mein ye difference bahut poochha jaata hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:10px;font-weight:700;color:#555;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">SECURITY GROUP</span>
          <span style="font-size:10px;font-weight:700;color:#dc1414;font-family:'Rajdhani',monospace;letter-spacing:2px;text-transform:uppercase;">NACL</span>
        </div>
        ${[['Instance level','Subnet level'],['Stateful (return traffic auto-allow)','Stateless (return traffic alag rule chahiye)'],['Allow rules sirf','Allow aur Deny dono possible'],['Instances ke liye explicit assignment','Automatically subnet ke saare instances pe apply']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#c0c0cc;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>13. VPC Flow Logs</h2>
      <p>VPC Flow Logs cloud mein sabse important network artifact hain. Ye record karte hain kaunse IP ne kaunse IP se kis port par kab traffic bheja aur traffic accept hua ya reject. Traditional network ke NetFlow jaisa hai, lekin cloud ka apna format hai.</p>
      <pre><code>Flow Log Entry (AWS VPC):

Source IP    : 10.0.0.10
Dest IP      : 8.8.8.8
Source Port  : 54231
Dest Port    : 443
Protocol     : TCP
Bytes        : 1240
Packets      : 8
Action       : ACCEPT
Start Time   : 1716000000
Log Status   : OK</code></pre>

      <h2>14. Flow Logs Se Kya Detect Hota Hai?</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['C2 Beaconing','Instance kisi external IP se baar baar regular intervals pe connect kar raha hai'],['Data Exfiltration','Bahut zyada outbound traffic kisi unknown IP par. Gigabytes ek session mein'],['Lateral Movement','Internal instances unexpected ports par aapas mein baat kar rahe hain'],['Port Scanning','Ek IP se bahut saare alag ports par rapid connection attempts'],['Malicious IP Contact','Known-bad IPs se traffic aa ya ja raha hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:200px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>15. Cloud Audit Logs</h2>
      <p>Cloud audit logs administrative actions record karte hain. Jab bhi koi user kuch karta hai cloud account mein, resource banata hai, permission change karta hai, login karta hai, ye sab audit logs mein aata hai. Flow logs network activity batate hain, audit logs user actions batate hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['User Logins','Kab, kahan se, successful ya failed, geography'],['Resource Creation','Naye VMs, storage buckets, databases banaye gaye'],['Permission Changes','IAM roles, policies mein modifications kab hue'],['Delete Actions','Resources delete karne ke records'],['API Calls','Programmatic access ke saare operations']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:180px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>16. AWS CloudTrail</h2>
      <p>CloudTrail AWS ka audit log hai. Har API call record hoti hai. Instance banana, S3 bucket access karna, IAM user create karna, ye sab CloudTrail mein hota hai. Cloud breach investigation mein CloudTrail sabse pehle dekhte hain.</p>
      <pre><code>CloudTrail Record:

EventTime    : 2024-05-18T10:02:33Z
EventName    : CreateUser
UserIdentity : attacker@gmail.com
SourceIP     : 185.220.101.47
Region       : us-east-1
RequestParam : UserName = backdoor_admin</code></pre>

      <h2>17. Azure Activity Logs</h2>
      <p>Azure Activity Log Azure ka equivalent hai CloudTrail ka. Resource changes, administrative actions aur security events record karta hai. Azure mein har resource operation Caller field mein clearly record hota hai.</p>
      <pre><code>Azure Activity Log:

OperationName : Microsoft.Compute/virtualMachines/write
Caller        : attacker@domain.com
SourceIP      : 91.108.4.0
Status        : Succeeded
TimeStamp     : 2024-05-18T10:05:00Z
ResourceGroup : production-rg</code></pre>

      <h2>18. GCP Audit Logs</h2>
      <p>GCP Cloud Audit Logs teen types mein aate hain. Admin Activity logs resource modifications record karte hain, Data Access logs data read/write events record karte hain aur System Event logs GCP ke internal actions record karte hain.</p>
      <pre><code>GCP Audit Log:

methodName    : compute.instances.insert
principalEmail: attacker@project.iam.gserviceaccount.com
callerIP      : 45.33.32.156
timestamp     : 2024-05-18T10:08:00Z
resourceName  : projects/prod/instances/vm-backdoor</code></pre>

      <h2>19. IAM Kya Hota Hai?</h2>
      <p>IAM matlab Identity and Access Management. Ye poora system control karta hai ki kaun cloud resources access kar sakta hai, kya kar sakta hai aur kab kar sakta hai. Cloud attacks ka sabse common entry point IAM abuse hai. IAM samajhna investigator ke liye mandatory hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Users','Individual identity. Person ya service account. Credentials se login karta hai'],['Roles','Permissions ka collection. Ek role mein multiple permissions hoti hain'],['Policies','Rules jo define karti hain kya allow hai aur kya nahi'],['API Keys','Programmatic access ke liye credentials. Password ki tarah treat karo']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>20. IAM Abuse Kyun Dangerous Hai?</h2>
      <p>Bahut saare cloud attacks IAM se shuru hote hain. Stolen credentials se login, excessive permissions se lateral movement, privilege escalation se admin ban jaana. Agar IAM properly configured nahi hai toh attacker poora cloud account sirf credentials se compromise kar sakta hai bina kisi malware ke.</p>

      <h2>21. IAM Abuse Indicators</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="13" r="0.8" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">IAM ABUSE INDICATORS</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${['Naya admin account create hua. Especially raat ko ya off-hours mein, unknown user ke through','Unexpected role changes. Kisi normal user ko suddenly admin permissions attach ho gayi','Privilege escalation attempt. User ne apne aap apni permissions badhaane ki koshish ki','Naye API keys create hue. Programmatic backdoor access ke liye jab koi technical need nahi thi','Unknown IP se login. Geography mismatch ya impossible travel. Same user ek ghante mein India aur Russia se'].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(220,20,20,0.12);">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><circle cx="7" cy="7" r="6" stroke="#dc1414" stroke-width="1.2"/><path d="M5 5l4 4M9 5l-4 4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>22. Cloud Credential Theft</h2>
      <p>Attacker cloud credentials kisi bhi tarike se steal kar sakta hai. Phishing se console password, code repository se hardcoded AWS keys, misconfigured server se .env files, ya EC2 instance metadata service se temporary credentials. Credentials milne ke baad attacker remotely login karta hai.</p>
      <pre><code>Common Theft Methods:

GitHub public repo mein AWS keys commit ho gai
Phishing email se console password steal hua
S3 bucket publicly exposed tha jisme .env file thi
EC2 instance metadata endpoint se credentials leak hue
  (http://169.254.169.254/latest/meta-data/iam/)</code></pre>

      <h2>23. Cloud Attack Lifecycle</h2>
      <pre><code>Credential Theft
       |
  Cloud Login
       |
Reconnaissance
  (kis region mein kya resources hain)
       |
Privilege Escalation
       |
   Persistence
  (new user, API key, backdoor role)
       |
  Data Access
       |
  Exfiltration</code></pre>

      <h2>24. Persistence in Cloud</h2>
      <p>Attacker ek baar andar aane ke baad wapas aane ka raasta banata hai. Investigators ko investigate karna chahiye: naye users kisne banaye, naye API keys kab bane, koi backdoor role toh add nahi hua, koi Lambda function toh nahi banai gayi jo automatically trigger ho.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['New IAM User','Naya hidden admin user create kiya jiska naam normal lagta ho'],['New API Keys','Existing user ke liye naya programmatic backdoor access'],['Backdoor Role','Existing service role mein extra admin permissions add ki'],['Lambda Function','Serverless backdoor jo automatically trigger ho aur callback kare']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>25. Storage Investigation</h2>
      <p>Cloud storage mein often sensitive data hota hai. Database backups, user data, credentials aur private keys. Investigators check karte hain ki kaun access hua, kaunse files download hue, kahan se request aayi aur data already publicly accessible toh nahi tha.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['AWS S3','Bucket access logs. GetObject, PutObject, DeleteObject events record hote hain'],['Azure Blob Storage','Diagnostic logs. Read, write, delete operations record hote hain'],['GCP Cloud Storage','Data Access audit logs. Kaunsi object, kab, kahan se access hua']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:180px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>26. Data Exfiltration Detection</h2>
      <p>Exfiltration ka matlab hai data steal kar ke bahar le jaana. Cloud mein ye flow logs aur storage access logs dono mein visible hota hai. Investigator ko normal baseline ka pata hona chahiye taaki anomaly identify ho sake.</p>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5" stroke="#dc1414" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="13" r="0.8" fill="#dc1414"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">EXFILTRATION INDICATORS</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${['Bahut zyada outbound traffic. Normal baseline se kahin zyada, gigabytes ek session mein','Unusual destinations. Unknown foreign IPs ya unexpected cloud regions jo pehle kabhi use nahi hue','Massive storage downloads. S3 GetObject events ka sudden spike, sab files ek hi user se access','Unknown source. Pehle kabhi na dekhe IP ya user agent se storage access hua'].map(r=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(220,20,20,0.12);">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><circle cx="7" cy="7" r="6" stroke="#dc1414" stroke-width="1.2"/><path d="M5 5l4 4M9 5l-4 4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r}</span>
          </div>`).join('')}
        </div>
      </div>

      <h2>27. DNS Investigation in Cloud</h2>
      <p>Cloud workloads bhi DNS use karte hain aur attackers DNS ko C2 communication ke liye, data exfiltration ke liye aur malware domains resolve karne ke liye use karte hain. DNS logs mein DGA domains, malware domains aur tunneling patterns dhundhna cloud investigation ka part hai.</p>
      <pre><code>DNS Threat Hunting:

DGA Domain  : a7f3k2m9p.xyz
              (random chars, computer generated)
C2 Beacon   : update.malware-c2.ru
              (foreign TLD, suspicious name)
DNS Tunnel  : 48656c6c6f.exfil.attacker.com
              (encoded data in subdomain)

Normal DNS  : google.com, aws.amazon.com, api.github.com</code></pre>

      <h2>28. Lateral Movement in Cloud</h2>
      <p>Lateral movement matlab attacker ek compromised instance ya account se doosre instances ya services tak pahunchne ki koshish karta hai. Cloud mein ye khas taur par khatarnak hota hai kyunki sab kuch logically connected hota hai aur ek compromised service role kai resources tak access de sakta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Instance to Instance','Ek VM se doosre VM par unexpected authentication attempt'],['Role Assumption','Ek service ka role assume karke doosre resources access karna'],['Service to Service','API calls between services jo normally communicate nahi karte'],['Metadata Abuse','Instance metadata service se temporary credentials steal karke lateral move']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:200px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>29. Cloud Logs Correlation</h2>
      <p>Koi bhi ek log file poora picture nahi dikhata. Real investigation mein flow logs, audit logs, IAM logs aur DNS logs ko combine karna padta hai taaki complete incident story bane. Ek log mein attacker ka IP hai, doosre mein action hai, teesre mein identity hai.</p>
      <pre><code>Flow Logs    : Kahan se kahan traffic gaya, kitna data
     +
Audit Logs   : Kya action liya gaya aur kab
     +
IAM Logs     : Kisne kiya, kaunsa account use hua
     +
DNS Logs     : Kaunse domains query hue
     +
Storage Logs : Kaunsi files access ya download hui
     =
Complete incident picture</code></pre>

      <h2>30. Timeline Construction</h2>
      <p>Cloud investigation ka sabse important output ek chronological timeline hai. Multiple log sources se events ko time ke hisaab se order karna padta hai. Ye timeline bata deta hai ki attacker ne exactly kya kiya, kab kiya aur kaise kiya.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['10:00','Login event. Unknown IP 185.220.101.47 se, Russia. Pehle kabhi is IP se login nahi tha'],['10:02','CreateAccessKey. Naya programmatic backdoor access banaya existing user ke liye'],['10:05','RunInstances. Backdoor VM launch kiya private subnet mein'],['10:10','Flow Log. External connection 185.220.101.47 par har 60 seconds. Beaconing'],['10:20','S3 GetObject x 847. 4.2GB sensitive files download. Single session']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:70px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>31. Multi-Cloud Investigation Challenges</h2>
      <p>Bahut saari organizations AWS, Azure aur GCP ek saath use karti hain. Investigators ke liye challenge ye hai ki har cloud ka apna log format, apna tool aur apna terminology hota hai. Ek incident mein teeno clouds ke logs simultaneously analyze karne padte hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Log Format','Har cloud ka apna alag JSON structure hota hai. Same field alag naam se milta hai'],['Terminology','AWS mein VPC, Azure mein VNet, GCP mein VPC. Same concept, alag naam'],['Audit Tools','CloudTrail vs Activity Log vs Cloud Audit Log. Teeno alag portals mein hain'],['Timeline Merge','Alag clouds ke UTC timestamps ek single timeline mein combine karna']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:160px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>32. Cloud IOC Examples</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['IP Address','Known malicious IP ya unexpected geography se login'],['Domain','C2 domain, DGA domain, malware infrastructure se DNS query'],['API Key','Leaked ya stolen programmatic credentials jo unauthorized jagah se use hue'],['User Account','Rogue admin account, impossible travel login ya naya account off-hours pe'],['Instance ID','Unauthorized resource creation ya unexpected region mein VM'],['File Hash','Malicious file uploaded to cloud storage ya downloaded from it']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#dc1414" stroke-width="1.3"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#dc1414" stroke-width="1.2" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;min-width:130px;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>33. Real Investigation Scenario</h2>
      <div style="background:linear-gradient(135deg,#0f0f14 0%,#0a0a0e 100%);border:1px solid rgba(220,20,20,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#dc1414" stroke-width="1.4"/><path d="M9 5v5l3 3" stroke="#dc1414" stroke-width="1.4" stroke-linecap="round"/></svg>
          <span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;letter-spacing:1px;">CASE: Suspicious Cloud Activity</span>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:13px;color:#aaa;line-height:2.2;">
          Alert: <span style="color:#888;">GuardDuty ne unusual API activity flag ki</span><br>
          Audit Log: <span style="color:#dc1414;font-weight:600;">CreateUser: backdoor_admin</span>, raat 3 AM, Russia IP 185.220.101.47<br>
          IAM: <span style="color:#dc1414;font-weight:600;">AttachUserPolicy: AdministratorAccess</span> naye user ko attach<br>
          Flow Log: <span style="color:#dc1414;font-weight:600;">185.220.101.47</span> par har 60 seconds outbound traffic<br>
          Storage Log: <span style="color:#dc1414;font-weight:600;">S3 GetObject x 847</span>, 4.2GB confidential data download<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Account compromise confirmed. Credential theft, backdoor admin creation, C2 beaconing, data exfiltration.</span>
        </div>
      </div>

      <h2>34. Cloud Threat Hunting</h2>
      <p>Threat hunting matlab proactively dhundhna bina kisi alert ke. Investigator khud sawaal poochtha hai aur logs mein jawab dhundta hai. Cloud mein hunting particularly important hai kyunki bahut saare attacks months tak undetected rehte hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Kaunse users login kiye?','Unusual geography, off-hours, failed attempts ke baad success login'],['Kaunse resources change hue?','Security groups, IAM roles, storage permissions mein modifications'],['Kaunse systems externally connected?','Flow logs mein outbound to unknown or foreign IPs'],['Privilege escalation hua?','Normal user ne admin permissions use ki ya role assume kiya'],['Persistence mechanism?','New API keys, new users, Lambda functions, backdoor roles']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <h2>35. Beaconing Hunt</h2>
      <pre><code>Hunt: Kya koi cloud instance C2 beaconing kar raha hai?

Step 1: Flow logs filter karo
        Same destination IP par regular intervals par traffic
        Example: har 60 seconds, same bytes, same port

Step 2: DNS logs check karo
        Unknown domains repeatedly query ho rahe hain?

Step 3: TLS connections dekho
        Self-signed certificates, unusual cipher suites

Step 4: Baseline se compare karo
        Kya ye traffic normal hai is instance ke liye?</code></pre>

      <h2>36. Cloud Investigation Workflow</h2>
      <pre><code>Step 1: Alert receive karo ya anomaly detect karo

Step 2: Logs collect karo
        Flow logs, audit logs, IAM logs, DNS logs

Step 3: User identify karo
        Kaunsa account involved hai, credentials valid hain?

Step 4: Activity analyze karo
        Kya kiya gaya, kab kiya gaya, kahan se kiya gaya

Step 5: Network traffic check karo
        External connections, exfiltration signs, beaconing

Step 6: Complete timeline banao
        Multi-source, chronological order, UTC timestamps

Step 7: Report likho
        Findings, IOCs, affected resources, recommendations</code></pre>

      <h2>37. Practical Lab 1 - Flow Log Review</h2>
      <pre><code>Objective: Top destinations aur suspicious IPs identify karo

Step 1: VPC Flow Logs load karo
Step 2: Destination IPs by frequency sort karo
Step 3: Top 10 destination IPs note karo
Step 4: Unknown ya foreign IPs flag karo
Step 5: High-volume byte transfers identify karo
Step 6: REJECT actions count karo aur analyze karo</code></pre>

      <h2>38. Practical Lab 2 - Audit Log Review</h2>
      <pre><code>Objective: Suspicious admin actions dhundho

Step 1: CloudTrail ya Activity Log load karo
Step 2: CreateUser events filter karo
Step 3: New role assignments dhundho
Step 4: Off-hours (raat 10 PM se 6 AM) actions note karo
Step 5: Unknown source IPs flag karo
Step 6: Delete operations identify karo</code></pre>

      <h2>39. Practical Lab 3 - Cross-Log Timeline</h2>
      <pre><code>Objective: Multiple logs se ek timeline banana

Step 1: Flow logs, IAM logs, Audit logs collect karo
Step 2: Timestamps UTC mein normalize karo
Step 3: Same user ya IP ke events merge karo
Step 4: Chronological order mein sort karo
Step 5: Suspicious sequence identify karo
        Login -> New User -> External Connection -> Data Download</code></pre>

      <h2>40. Practical Lab 4 - Exfiltration Hunt</h2>
      <pre><code>Objective: Large outbound data transfer investigate karo

Step 1: Flow logs mein outbound traffic > 1GB dhundho
Step 2: Destination IP identify karo
Step 3: Storage logs check karo - S3 GetObject events
Step 4: User identify karo - kaunse credentials use hue
Step 5: Instance identify karo - kahan se transfer hua
Step 6: Timeline banao - pehle kya hua, phir kya</code></pre>

      <h2>41. Common Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Sirf flow logs dekhna','IAM aur audit logs equally important hain. Network alone poora picture nahi deta'],['IAM events ignore karna','Zyada tar cloud attacks IAM abuse se shuru hote hain. Pehla check yahi hona chahiye'],['Audit logs ignore karna','Admin actions yahan record hote hain. Critical evidence for who did what'],['Storage access ignore karna','Exfiltration ka proof storage logs mein milta hai. Flow logs sirf traffic batate hain'],['Timeline nahi banana','Cloud investigation mein chronological order sab se important hai. Bina timeline ke report incomplete hai']].map(r=>`
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
        ${[['Cloud Networking Basics','VPC, subnets, security groups, routing, NAT, internet gateway'],['VPC Flow Log Analysis','Log fields padhna, anomalies identify karna, beaconing detect karna'],['IAM Investigation','Users, roles, policies mein suspicious changes dhundhna'],['Audit Log Analysis','CloudTrail, Activity Log, GCP Audit Logs read karna aur interpret karna'],['Cloud Threat Hunting','Proactive hunting. Beaconing, exfiltration, lateral movement detect karna'],['Data Exfiltration Detection','Storage logs aur flow logs mein large transfers identify karna'],['Cloud Timeline Creation','Multi-source logs se accurate chronological timeline banana']].map(r=>`
        <div style="display:grid;grid-template-columns:220px 1fr;gap:8px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:10px 16px;align-items:center;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</span>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</span>
        </div>`).join('')}
      </div>

      <!-- PART 17 COMPLETE BANNER -->
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
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 17 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Cloud Network Forensics</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">VPC se VPC Flow Logs tak, CloudTrail se GCP Audit Logs tak, IAM abuse se data exfiltration detection tak. Cloud investigation ka poora map ab tumhare paas hai. 42 topics. Real scenarios. Practical labs. Ye sab ab tumhara toolkit hai.</p>
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
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 18 mein SIEM aur Enterprise Investigation seekhenge. SIEM architecture, Splunk fundamentals, ELK Stack, detection rules, enterprise investigations, alert triage, SOC workflows, advanced correlation aur large-scale incident investigations.</p>
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
            'VPC kya hai aur investigators ke liye ye kyun important hai?',
            'Flow Logs kya record karte hain aur inse kya detect ho sakta hai?',
            'Security Group aur NACL mein kya fundamental difference hai?',
            'IAM abuse kya hota hai aur iske indicators kya hain? Real examples do.',
            'CloudTrail, Azure Activity Log aur GCP Audit Log mein kya similarity hai?',
            'Cloud investigation mein timeline kyun zaroori hai aur kaise banate hain?'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
  }

  else if (index === 17) {
    document.getElementById('chapterContent').innerHTML = `

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
  update.exe executed by user john

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

User: john.doe
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
          Endpoint: <span style="color:#dc1414;font-weight:600;">update.exe</span> execute hua user <span style="color:#dc1414;font-weight:600;">john</span> ke account se<br>
          EDR: <span style="color:#dc1414;font-weight:600;">powershell.exe -enc [base64]</span> launched by update.exe<br>
          Flow Log: <span style="color:#dc1414;font-weight:600;">HOST-042</span> -> 185.x.x.x har 60 seconds (beaconing)<br>
          <span style="color:#f4f4f5;font-weight:600;">Conclusion: Phishing/drive-by download. Malware infection. Active C2 beaconing. Immediate containment required.</span>
        </div>
      </div>

      <h2>31. Timeline Example</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['10:00','Phishing email received. john@company.com ne open kiya'],['10:01','DNS query: abc-malware.xyz. HOST-042 se'],['10:02','Proxy: update.exe downloaded from 185.220.101.47'],['10:02','Endpoint: update.exe executed, new process spawned'],['10:03','PowerShell: encoded command execute hua. Registry persistence'],['10:05','Flow: beaconing shuru. Har 60 sec, 242 bytes, same IP'],['10:45','EDR Alert: Suspicious activity. Analyst ko notify hua']].map((r,i)=>`
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
  HOST-042 (john.doe account)

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
  }

  else if (index === 18) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Yahan Se Sab Badal Jaata Hai</h2>
      <p>Parts 1 se 18 tak tumne tools, protocols, log formats aur detection techniques seekhe. Ab woh sab kaam aata hai. Real incidents mein koi script nahi hoti, koi hint nahi hota. Sirf logs hote hain, alerts hote hain, aur tumhara dimag hota hai. Is part mein hum wahi karte hain jo ek actual analyst karta hai jab incident aata hai.</p>
      <div class="info-box"><p>Investigation ki ek golden rule hai: <strong>Evidence kya kehta hai</strong> yahi poochho. Alert sahi hai ya galat, yeh baad mein pata chalta hai. Pehle evidence dekho.</p></div>

      <h2>2. Investigator Ka Dimag Kaise Kaam Karta Hai</h2>
      <p>Beginner analyst alert aata hai aur seedha conclusion pe pahunch jaata hai. Professional analyst alert ko starting point maanta hai. Phir evidence gather karta hai, validate karta hai, correlate karta hai, timeline banata hai aur tab koi baat karta hai.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Beginner','Alert aata hai aur seedha escalate kar deta hai bina evidence ke'],['Professional','Alert aata hai, evidence gather hota hai, validate hota hai, correlate hota hai, timeline banti hai, tab jawaab aata hai']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:120px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Har Investigation Ka Framework</h2>
      <p>Chahe phishing ho, ransomware ho, insider threat ho ya cloud compromise: structure same rehta hai. Ye framework tumhare dimag mein permanently install ho jaana chahiye.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['WHO','Kaun involved hai? User, host, IP, account'],['WHAT','Kya hua exactly? Malware, login, download, upload'],['WHEN','Kab hua? Timeline banao. Pehle kya, baad mein kya'],['WHERE','Kaha hua? Source, destination, kaunsa system'],['HOW','Kaise hua? Attack path kya tha'],['WHY','Attacker ka goal kya tha? Data? Access? Disruption?']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:80px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Case 01: Phishing Se C2 Tak</h2>
      <p>User ne report kiya ke usne ek invoice email ka attachment open kiya. Kuch ajeeb lag raha hai system mein. Yahan se investigation shuru hoti hai.</p>
      <pre><code>Initial Report:
  "Maine ek email attachment open kiya tha.
   Ab system slow hai."

Pehla Sawaal: Kab open kiya?
Jawaab:       09:00 AM</code></pre>

      <h2>5. Case 01: Email Logs Analysis</h2>
      <p>Pehla kaam email investigate karna hai. Sender dekho, headers dekho, attachment type dekho. Ye sab mila ke bata deta hai ke actual threat tha ya kuch aur.</p>
      <pre><code>Sender:      billing@invoic3-ltd.com
Attachment:  invoice_march.docm
Received:    09:00 AM
Subject:     Invoice Pending Payment

DOCM file kyun dangerous hai?
  DOCM = Macro enabled Word document
  Macro = Code execute ho sakta hai
  Code = PowerShell, cmd, network calls</code></pre>
      <div class="info-box"><p>Sender domain mein dekho: <strong>invoic3-ltd.com</strong> mein "3" hai "e" ki jagah. Ye typosquatting hai. Attacker legitimate domain jaisi domain register karta hai taaki user dhoka kha sake.</p></div>

      <h2>6. Case 01: Endpoint Logs</h2>
      <p>Windows event logs mein process chain dikhti hai jo kisi bhi normal user ke workflow mein nahi aani chahiye. Ye sabse important finding hai.</p>
      <pre><code>Process Chain (parent se child):
  WINWORD.EXE   Word document open hua
  powershell.exe   Word ne launch kiya
  cmd.exe   PowerShell ne launch kiya
  curl.exe   Network se file fetch kiya

Kya Word normally PowerShell launch karta hai?
Nahin. Kabhi nahi.
Ye macro execution ka sign hai.</code></pre>

      <h2>7. Case 01: DNS Investigation</h2>
      <p>DNS logs mein us time ke queries dekho jab Word open hua tha. Attacker ka C2 domain yahin milega. Timestamp match karo process chain se.</p>
      <pre><code>09:00:00  Word opened
09:00:12  DNS Query: invoice-check.xyz
09:00:13  DNS Response: 185.220.101.47
09:00:14  TCP connection established

Kya company kabhi is domain pe gayi thi?
Nahin. Pehli baar. Zero history.
Fresh registered malicious domain.</code></pre>

      <h2>8. Case 01: Proxy Logs aur Beaconing</h2>
      <p>Proxy logs confirm karte hain ke file download hua. Flow logs batate hain ke download ke baad kya hua. Dono milao toh attack chain complete ho jaata hai.</p>
      <pre><code>Proxy:
  09:00:15  GET http://invoice-check.xyz/update.exe
            Response: 200 OK, 2.4 MB

Flow Logs (baad mein):
  09:01:00  185.220.101.47:443  1.2KB out
  09:02:00  185.220.101.47:443  1.1KB out
  09:03:00  185.220.101.47:443  1.3KB out

Har 60 second pe same IP, same port.
Ye automated beaconing hai, human traffic nahi.</code></pre>

      <h2>9. Case 01: IOC Extraction</h2>
      <p>Investigation wrap hone se pehle sab indicators extract karo. Ye dusre systems block karne mein aur threat intel feeds mein kaam aate hain.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Domain','invoice-check.xyz'],['IP','185.220.101.47'],['File','update.exe'],['Sender','billing@invoic3-ltd.com'],['Process Chain','WINWORD.EXE > powershell.exe > curl.exe'],['Pattern','60-second TLS beaconing']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:140px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;color:#f4f4f5;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>10. Case 02: Data Exfiltration</h2>
      <p>SIEM alert aaya: unusually large outbound upload detected. Pehla sawaal ye nahi hai ke attack hai. Pehla sawaal hai ke normal hai ya nahi.</p>
      <pre><code>Alert:
  Host:     192.168.1.20
  Upload:   45 GB in 30 minutes
  Time:     10:00 AM to 10:30 AM

Baseline check:
  Normal upload for this host: 300 MB/day
  Today: 45 GB

Ye 150x normal se zyada hai.</code></pre>

      <h2>11. Case 02: Endpoint Timeline</h2>
      <p>Host pe kya hua upload se pehle? Endpoint logs aur file system activity dekho. Data compression before upload exfiltration ka common pattern hai.</p>
      <pre><code>10:00  User login (normal)
10:03  7z.exe executed
10:04  archive.7z created (44.8 GB)
10:08  Upload to storage-data-sync.xyz started
10:38  Upload complete
10:39  archive.7z deleted

Destination domain:
  Registered: 3 days ago
  Category: uncategorized
  Threat feeds: Flagged
  Company approved list: Nahin</code></pre>
      <div class="info-box"><p>Compression before upload data exfiltration ka classic move hai. 7z ya zip se sab ek archive mein dalo, phir ek hi request mein bahar. Content-based DLP tools is pattern pe alert karte hain.</p></div>

      <h2>12. Case 03: Insider Threat</h2>
      <p>Finance employee ke account se large file activity alert aaya. Insider threat investigation mein assumption se nahi, evidence se shuru karte hain. Correlation tab meaningful hota hai jab baseline se clear deviation ho.</p>
      <pre><code>Past 30 Days (Baseline):
  Login times:   9:02 AM to 6:17 PM
  Files accessed: Finance documents only
  USB activity:  None
  Uploads:       0 to 5 MB/day

Today:
  Login time:    11:30 PM
  Files accessed: Finance + HR + Executive folder
  USB:           Inserted 11:35 PM
  Upload:        2.1 GB to personal cloud</code></pre>

      <h2>13. Case 03: Correlation Timeline</h2>
      <p>Alag events akele normal lag sakte hain. Jab unhe ek timeline mein dekha jaata hai toh picture emerge hoti hai.</p>
      <pre><code>11:30 PM  Login after hours
11:31 PM  Searched "confidential" in file explorer
11:33 PM  HR folder accessed (no normal access right)
11:35 PM  USB device inserted
11:36 PM  Mass copy to USB: 18 GB
11:52 PM  Copy complete
11:53 PM  Upload to personal Dropbox started
12:22 AM  Upload complete
12:23 AM  Logout</code></pre>

      <h2>14. Case 04: Brute Force Attack</h2>
      <p>Authentication logs mein massive failed login volume detect hua. Ye automatic alert tha. Ab verify karna hai ke ye actual attack tha ya misconfigured application. Phir damage scope assess karo.</p>
      <pre><code>Alert:
  Source IP:     45.33.32.156 (Bulgaria)
  Target:        VPN login portal
  Failed logins: 847 in 12 minutes
  Accounts:      847 different usernames tried

Password spray (same pass, many accounts)
ya brute force (same account, many passwords)?
847 alag usernames = Password Spray</code></pre>

      <h2>15. Case 04: Login Ke Baad Kya Hua</h2>
      <p>Failed logins se bhi important hai ye: koi successful hua kya? Agar hua toh investigation bilkul alag level pe jaati hai.</p>
      <pre><code>Filter: Same source IP + EventCode 4624 (success)

Result:
  admin.it@company.com   SUCCESS at 10:47 AM

10:47  VPN connected (45.33.32.156, Bulgaria)
10:48  Internal file server accessed
10:49  /IT/Network_Diagrams/ folder opened
10:51  6 files downloaded
10:53  /IT/Credentials_Backup/ folder accessed
10:54  VPN disconnected

7 minutes. Network diagrams + credential backup gaya.
DFIR team immediately escalate karo.</code></pre>

      <h2>16. Case 05: Ransomware Investigation</h2>
      <p>Multiple users ne report kiya ke files open nahi ho rahe, extension badal gayi hai. Ransomware ka classic presentation. Investigation ka focus hai origin dhundhna aur spread assess karna.</p>
      <pre><code>User reports:
  "Files .locked extension pe hain"
  "Desktop pe README_DECRYPT.txt hai"

First action:
  Affected hosts identify karo
  Network se isolate karo: immediately
  DO NOT reboot: memory mein evidence hai
  DO NOT pay ransom before investigation</code></pre>

      <h2>17. Case 05: Patient Zero aur Lateral Movement</h2>
      <p>Ransomware kisi ek host pe shuru hota hai. Encryption timestamps compare karo toh pehla host mil jaata hai. Wahan se infection vector milega.</p>
      <pre><code>Encryption Timestamps:
  HOST-FIN-01:  10:14 AM  (first)
  HOST-FIN-02:  10:31 AM
  HOST-FIN-03:  10:44 AM
  HOST-HR-01:   11:02 AM

Patient Zero: HOST-FIN-01

HOST-FIN-01 pe 10:14 se pehle:
  10:02  invoice.exe opened from email
  10:09  DNS: ransom-key-server.xyz
  10:14  Encryption started

Lateral Movement via SMB:
  HOST-FIN-01 se HOST-FIN-02 pe (admin$ share)
  HOST-FIN-01 se HOST-FIN-03 pe (admin$ share)
  Remote service created: encryptor.exe</code></pre>

      <h2>18. Case 06: Cloud Account Compromise</h2>
      <p>AWS CloudTrail ne alert kiya ke naya IAM user create hua, administrator permissions de diya gaya. 2 AM pe. Bina change ticket ke. Ye investigate karna hai.</p>
      <pre><code>CloudTrail:
  2:13 AM  admin@company.com   login from 91.108.4.xx, Russia
  2:14 AM  CreateUser: backup-service-acct
  2:14 AM  AttachUserPolicy: AdministratorAccess
  2:15 AM  CreateAccessKey for new user
  2:16 AM  S3 ListBuckets
  2:17 AM  S3 GetObject x 2,847 objects
  2:44 AM  EC2 DescribeInstances
  2:51 AM  admin logout

Admin se verify kiya: "Maine kuch nahi kiya raat ko"

Credentials stolen. Session token reuse.
Backdoor user banaya, 2847 S3 objects download kiye.</code></pre>

      <h2>19. Case 07: DNS Tunneling</h2>
      <p>Ek workstation se DNS traffic unusually high tha. Volume alert nahi tha, manually notice kiya gaya: yahi proactive threat hunting hai.</p>
      <pre><code>Normal DNS per host: 200 to 500 queries/day
This host: 47,000 queries in 6 hours

Query pattern:
  aGVsbG8gd29ybGQ.data-sync.xyz
  dGhpcyBpcyBkYXRh.data-sync.xyz
  dHVubmVsaW5n.data-sync.xyz

Decode karo (base64):
  aGVsbG8gd29ybGQ   decoded: "hello world"
  dGhpcyBpcyBkYXRh  decoded: "this is data"
  dHVubmVsaW5n      decoded: "tunneling"

DNS ko data channel ki tarah use kiya ja raha hai.
Firewall DNS block nahi kar sakta.
Issi wajah se ye technique effective hai.</code></pre>

      <h2>20. Case 08: Beaconing Without Signatures</h2>
      <p>Koi antivirus alert nahi. Koi malware signature match nahi. Phir bhi ek host ka behavior suspicious tha. Behavioral analysis kaam aata hai jab signatures fail karte hain.</p>
      <pre><code>Flow logs:
  08:00:00  192.168.1.55 to 91.240.118.xx:443   1.1KB outbound
  08:02:00  192.168.1.55 to 91.240.118.xx:443   1.2KB outbound
  08:04:00  192.168.1.55 to 91.240.118.xx:443   1.0KB outbound
  08:06:00  192.168.1.55 to 91.240.118.xx:443   1.1KB outbound

Har 120 second pe, same IP, same port, same size.

TLS Certificate:
  Issuer: Self signed (not CA issued)
  Subject: CN=localhost
  Registered: 3 days ago
  JA3 hash: Known malware fingerprint (3 samples)

Self signed cert on public IP.
CN=localhost public infrastructure pe.
Ye attacker-controlled C2 hai.</code></pre>

      <h2>21. Multi-Source Correlation</h2>
      <p>Ek source kabhi poori kahani nahi batata. Har source ek piece deta hai. Investigator ka kaam hai sab pieces milake complete picture banana.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Email Logs','Initial vector. Sender, attachment type, timing'],['DNS Logs','C2 domain resolution. Pehle contact ka timestamp'],['Proxy Logs','Payload download URL. File name, size, response code'],['Endpoint Logs','Process chain. Parent-child. Macro execution proof'],['Flow Logs','Beaconing pattern. Outbound volume. Data exfil'],['Auth Logs','Credential use. Lateral movement. After-hours access']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:140px 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>22. Professional Analyst Ki Soch</h2>
      <p>Real investigations mein har alert attack nahi hota. Aur har attack mein alert nahi aata. Professional analyst dono situations handle karta hai bina panic kiye aur bina dismiss kiye.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Alert aaya, evidence nahi mila','False positive. Document karo kyun FP tha, rule improve karo'],['Alert nahi aaya, behavior suspicious tha','Threat hunt se mila. Detection gap hai. Rule banao'],['Alert aaya, evidence confirm hua','True positive. Escalate, contain, deep investigate'],['Multiple hosts same pattern','Scope assess karo. Mass compromise possible'],['Evidence incomplete','Aur sources dhundho. Conclusion mat banao adhoore data pe']].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});box-shadow:0 4px 20px rgba(0,0,0,0.4);display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>23. Master Checklist</h2>
      <p>Koi bhi investigation complete nahi hoti jab tak ye checklist puri na ho. Chahe chota incident ho ya bada, structure same rehta hai.</p>
      <pre><code>Investigation Complete Karne Se Pehle:

  Timeline banayi?
    Pehla event kab, kya sequence mein hua

  IOC extract hue?
    Domains, IPs, hashes, filenames, process names

  Source identify hua?
    Kahan se aaya: email, RDP, supply chain, USB

  Destination identify hua?
    Data kahan gayi, C2 server kahan tha

  Root cause mila?
    Kaise andar aaya: initial access vector

  Scope clear hai?
    Kitne hosts, kitne accounts affected

  Evidence preserve hua?
    Logs export, PCAP save, memory dump if needed

  Report ready hai?
    Incident ID, timeline, IOCs, actions taken</code></pre>

      <h2>24. Incident Documentation Format</h2>
      <p>Investigation khatam hoti hai tab jab report complete ho. Legal ho ya internal: documentation hi future mein kaam aata hai.</p>
      <pre><code>Incident ID   : INC-2024-0587
Date          : 2024-05-18
Analyst       : [Name], Tier 2
Severity      : Critical

Kya Hua:
  HOST-FIN-01 phishing email se compromise hua.
  Ransomware 3 aur hosts pe phail gaya via SMB.

Timeline:
  10:02  Phishing email opened
  10:05  invoice.exe execute hua
  10:09  C2 connection: ransom-key-server.xyz
  10:14  Encryption started
  10:31  Lateral movement to HOST-FIN-02

IOCs:
  Domain:  ransom-key-server.xyz
  IP:      185.220.x.x
  File:    invoice.exe

Affected:
  HOST-FIN-01, 02, 03, HOST-HR-01

Actions:
  4 hosts isolated from network
  Credentials reset
  DFIR team engaged
  Backups verified clean</code></pre>

      <h2>25. Interview Questions</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[['Patient zero kya hota hai?','Woh pehla host jo infection ka starting point tha. Investigation mein sabse pehle dhundhna hota hai'],['IOC aur IOA mein kya fark?','IOC: compromise ke baad mila evidence (hash, domain). IOA: attack ke dauran behavior (process chain, lateral move)'],['Beaconing detect kaise karte hain?','Flow logs mein same IP pe regular intervals pe connections. Statistical jitter analysis se pattern confirm hota hai'],['Lateral movement ke indicators?','Admin shares access, PsExec use, new service creation remote se, WMI remote execution'],['Ransomware investigation mein reboot kyun mana?','Memory mein encryption keys aur attacker artifacts hote hain jo reboot pe destroy ho jaate hain'],['DNS tunneling normal DNS se alag kaise?','Long subdomains, high entropy, TXT record use, volume anomaly, same base domain pe thousands of queries'],['Cloud compromise mein kya dhundho?','Unusual IAM actions, new user creation, policy attach, S3 mass download, after-hours login from foreign IP']].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:14px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 16px;">
          <span style="background:rgba(220,20,20,0.12);border:1px solid rgba(220,20,20,0.25);border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;color:#dc1414;font-family:'Rajdhani',sans-serif;white-space:nowrap;min-width:40px;text-align:center;">Q${i+1}</span>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;">${r[0]}</span>
            <span style="font-family:'Inter',sans-serif;font-size:11px;color:#777;">${r[1]}</span>
          </div>
        </div>`).join('')}
      </div>

      <!-- PART 19 COMPLETE BANNER -->
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
            <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Part 19 Complete</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#f4f4f5;line-height:1.2;">Real Incident Case Studies</div>
          </div>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.8;">8 real-world cases investigate kiye: phishing se C2 tak, data exfiltration, insider threat, brute force, ransomware, cloud compromise, DNS tunneling, aur behavioral beaconing. Ab tum sirf theory nahi jaante: tum sochna jaante ho.</p>
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
          <p style="font-family:'Inter',sans-serif;font-size:12px;color:#777;line-height:1.8;margin:0;">Part 20 mein Expert Network Forensics Roadmap cover hoga. Complete career path 0 se expert tak, certifications, home lab setup, TryHackMe aur HackTheBox paths, SOC aur DFIR roadmap, aur 1-year mastery plan.</p>
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
            'Case 01 mein WINWORD.EXE ne PowerShell kyu launch kiya? Normal scenario mein ye kab hota hai?',
            'DNS tunneling aur normal DNS queries mein volume ke alawa kya aur dekha jaata hai identification ke liye?',
            'Ransomware investigation mein reboot karna kyun mana hota hai? Memory mein kya milta hai?',
            'Insider threat aur compromised account mein indicators overlap karte hain: kaise differentiate karte hain?',
            'Self signed TLS certificate public IP pe suspicious kyun hai? Legitimate use cases kya hote hain?',
            'Ek phishing incident ka complete timeline likho: email aane se C2 beaconing confirm hone tak.'
          ].map((q,i)=>`
          <div style="display:flex;align-items:center;gap:10px;background:#0e0e12;border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.04);">
            <span style="flex-shrink:0;font-family:'Rajdhani',monospace;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 7px;">Q${i+1}</span>
            <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
          </div>`).join('')}
        </div>
      </div>

    `;
  }



  else if (index === 19) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Sabse Badi Myth</h2>
      <p>YouTube pe 2 se 3 videos dekhke bahut log sochte hain ke Wireshark sikh liya matlab cybersecurity expert ban gaye. Ya Kali Linux install kar li matlab hacker ban gaye. Reality ye hai ke cybersecurity ek skill nahi hai, dozens of skills ka combination hai.</p>

      <h2>2. Real Network Forensics Investigator Kya Karta Hai</h2>
      <p>Movies mein dikhate hain ke keyboard chalaya aur hacker pakad liya. Real life mein investigator ka 70 se 80 percent time jaata hai: logs padhne mein, evidence collect karne mein, timeline banana, reports likhna, aur false positives verify karna. Koi shortcut nahi hota.</p>
      <pre><code>Alert: Possible Malware Detected

Beginner: Malware hai, escalate karo

Professional:
  Evidence kya kehta hai?
  DNS logs check karo
  Firewall logs check karo
  PCAP check karo
  Endpoint logs check karo
  User activity check karo
  Timeline banao
  Tab conclusion do</code></pre>

      <h2>3. Cybersecurity Roles Ka Farak</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['SOC Analyst','Alert aata hai, investigate karo, escalate ya close karo. First line of defense. Reactive role.'],
          ['Threat Hunter','Koi alert nahi hota, phir bhi khud threat dhundta hai. Proactive role hai.'],
          ['DFIR Investigator','Incident ho gaya ke baad aata hai. Evidence collect karta hai, root cause dhundta hai.'],
          ['Detection Engineer','Threat dekhta hai, SIEM rule banata hai taake future mein auto detect ho.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:160px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Realistic Career Path</h2>
      <pre><code>Student
SOC Analyst L1     (sabse common entry point)
SOC Analyst L2     (1 to 2 years baad)
SOC Analyst L3     (2 to 3 years baad)
Threat Hunter ya DFIR Specialist
Senior Security Engineer</code></pre>

      <h2>5. SOC Analyst Ka Real Daily Routine</h2>
      <p>Suppose tum night shift mein ho. Dashboard open karte ho, 100 alerts aa gaye. Har alert investigate karna hai. Kaunse user, kaunsa IP, kya login successful hua, kya brute force hai. Ye kaam pura din chalta hai. Tools ki nahi, analysis ki zaroorat hai.</p>

      <h2>6. Sabse Important Skill</h2>
      <p>2 logon ko Wireshark diya. Pehla sirf filters lagata hai aur ruk jaata hai. Doosra patterns observe karta hai, timeline banata hai, IOC nikalata hai. Doosra zyaada valuable hai. Tool nahi, sochne ka tarika matter karta hai.</p>

      <h2>7. Information Overload Problem</h2>
      <p>Ek enterprise network mein ek din mein 10 million se zyaada logs aa sakte hain. Investigator ka asli kaam ye decide karna hai ke inme se important kya hai. Ye skill tools se nahi aati, practice se aati hai.</p>

      <h2>8. Networking King Kyun Hai</h2>
      <p>Har attack network touch karta hai. Phishing se DNS query, HTTP se payload download, TLS se C2 communication, SMB se lateral movement. Agar networking weak hai toh investigation weak hogi chahe baaki sab strong ho.</p>

      <h2>9. Logs Hacking Se Zyaada Important Hain</h2>
      <p>Beginners exploits dhundhte hain, professionals logs dekhte hain. Attacker ne malware delete kar diya lekin DNS logs, firewall logs, aur authentication logs abhi bhi evidence de rahe hain. Real incidents mein logs hi sach bolte hain.</p>

      <h2>10. Salary Ka Sach</h2>
      <p>Bahut log pehla sawaal poochte hain: salary kitni hai. Galat sawaal hai. Pehla sawaal hona chahiye: skill kitni hai. Market expertise ko pay karta hai, certificates ko nahi. High skill hai toh high salary aati hai apne aap.</p>

      <h2>11. Certifications Ki Reality</h2>
      <p>Certificate job guarantee nahi karta. Certificate sirf gate open karta hai. Interview skill se clear hoti hai. Correct formula hai: Skill + Practice + Projects + Certificate. Is sequence mein, is sequence mein hi.</p>

      <h2>12. Home Lab Kyun Zaroori Hai</h2>
      <p>Interviewer pooche: Wireshark aata hai? Galat jawab: Video dekhi hai. Strong jawab: 50 se zyaada PCAP investigate kiye hain. Bina lab ke theory sirf theory rehti hai.</p>

      <h2>13. Analyst Thinking Process</h2>
      <p>Har investigation mein ye 5 sawaal poochho. Ye framework har incident mein kaam aata hai chahe phishing ho, ransomware ho, ya insider threat.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['WHO','Kaun involved hai? User, host, IP address, account name'],
          ['WHAT','Kya hua exactly? Malware, unauthorized login, download, upload'],
          ['WHEN','Kab hua? Timeline banao. Pehle kya, baad mein kya'],
          ['WHERE','Kahan hua? Source, destination, kaunsa system, kaunsa network'],
          ['HOW','Kaise hua? Attack path kya tha, initial vector kya tha']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:80px 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>14. Biggest Beginner Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Tool Collecting','Wireshark, Splunk, Burp, Nmap sab install, use kuch nahi'],
          ['Certificate Chasing','Skill ke bina certificate interview mein kuch nahi deta'],
          ['Labs Ignore Karna','Theory sirf padhte hain, kabhi investigate nahi karte'],
          ['Networking Skip','Foundation weak rakha toh sab kuch weak hoga'],
          ['Documentation Skip','Jo document nahi hua woh hua hi nahi. Portfolio nahi banega']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:180px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>15. Golden Rule</h2>
      <div class="info-box"><p>Professional Investigator ka formula: <strong>Evidence gather karo, analysis karo, tab conclusion do.</strong> Amateur andaze lagata hai, assumptions banata hai, aur galat conclusion pe pahunchta hai. Ye fark hi beginner aur professional ke beech ka fark hai.</p></div>

    `;
  }

  else if (index === 20) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Home Lab Kyun Zaroori Hai</h2>
      <p>Cybersecurity mein 90 percent beginners fail isliye nahi hote ke intelligent nahi hote. Fail isliye hote hain kyunki sirf theory padhte hain, practical zero hoti hai. Interview mein recruiter kabhi nahi puchega ke tumne kitne videos dekhe. Puchega: tumne kya build kiya, kya investigate kiya.</p>

      <h2>2. Theory Aur Practical Ka Sahi Cycle</h2>
      <p>Bahut beginners sochte hain pehle 2 saal theory, phir practical karenge. Ye wrong hai. Sahi cycle hai: thodi theory, phir practice, phir thodi aur theory, phir aur practice. Dono saath saath chalne chahiye.</p>
      <pre><code>Wrong:  Theory (2 years) --> Practical
Correct: Theory --> Practical --> Theory --> Practical</code></pre>

      <h2>3. Minimum Hardware Requirements</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['8 GB RAM','Beginner level. Kali Linux, Ubuntu, Wireshark practice. CPU i3 ya Ryzen 3. Storage 256 GB SSD.'],
          ['16 GB RAM','Recommended setup. Kali, Windows, Ubuntu, Wazuh SIEM, chhota AD lab. Storage 512 GB SSD.'],
          ['32 GB RAM','Professional. Multiple servers, Active Directory, Splunk, full SOC lab. Storage 1 TB SSD.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:110px 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>
      <div class="info-box"><p>SSD strongly recommended hai. PCAP files, VM snapshots, aur log files bahut space aur speed maangti hain. HDD pe lab bahut slow ho jaata hai aur frustration hoti hai.</p></div>

      <h2>4. VirtualBox vs VMware</h2>
      <p>VirtualBox Oracle ka free tool hai, beginners ke liye best choice hai. Lightweight hai aur easy setup hai. VMware Workstation zyaada smooth experience deta hai lekin paid hai. Beginner ke liye VirtualBox se shuru karo, baad mein VMware explore kar sakte ho.</p>

      <h2>5. VM Setup Order</h2>
      <pre><code>Step 1: VirtualBox install karo (Oracle, free)
Step 2: Ubuntu VM banao
        Reason: Linux fundamentals build honge
        Seekho: ip addr, ping, netstat, ss, tcpdump
Step 3: Kali Linux VM banao
        Reason: Security tools available honge
        Note: Kali sirf tools ka collection hai
Step 4: Windows 10 ya 11 VM banao
        Reason: Most enterprise environments Windows use karte hain
        Seekho: Event Viewer, Services, Task Scheduler, PowerShell
Step 5: Sab VMs ek virtual network pe daalo
Step 6: Ping each machine, confirm connectivity</code></pre>

      <h2>6. First Network Lab</h2>
      <p>Kali, Windows, aur Ubuntu ko same virtual network pe daalo. Ab ping each machine. Ye simple exercise networking ka foundation banati hai aur real lab jaisi feel deti hai.</p>

      <h2>7. Wireshark Lab</h2>
      <p>Ubuntu pe Wireshark install karo. Browser open karo, google.com visit karo. Wireshark pe capture karo aur observe karo:</p>
      <pre><code>Sequence jo tumhe dikhega:
  DNS query      (google.com kahan hai?)
  DNS response   (IP address mila)
  TCP handshake  (connection banao)
  TLS handshake  (encryption setup)
  HTTPS data     (actual content, encrypted)

Ye sequence samajhna bahut important hai.
Investigators daily ye dekhte hain.</code></pre>

      <h2>8. DNS Investigation Lab</h2>
      <pre><code>Capture karo aur answer karo:
  Kaunsa domain query hua?
  Kaunsa DNS server use hua?
  Response kya tha?
  Kitna time laga (TTL)?
  Koi failed query (NXDOMAIN) thi?</code></pre>

      <h2>9. HTTP Investigation Lab</h2>
      <pre><code>http://example.com visit karo aur observe karo:
  GET request kahan gayi?
  Response code kya tha? (200 OK)
  Headers mein kya tha?
  Content-Type kya tha?
  Server kaunsa tha?</code></pre>

      <h2>10. TLS Investigation Lab</h2>
      <pre><code>https://google.com visit karo aur observe karo:
  Client Hello (browser ne kya bheja)
  Server Hello (server ne kya respond kiya)
  Certificate (kaun issue kiya, kab expire)
  TLS version (1.2 ya 1.3?)

TLS understanding future mein malware
analysis mein bahut kaam aayegi.</code></pre>

      <h2>11. Log Analysis Lab</h2>
      <pre><code>Ubuntu mein:
  /var/log/auth.log     (authentication events)
  /var/log/syslog       (system events)
  /var/log/apache2/     (web server logs)

Windows mein Event Viewer:
  Security logs        (login events, EventID 4624, 4625)
  System logs          (service start/stop)
  Application logs     (process execution)</code></pre>

      <h2>12. Wazuh SIEM Lab</h2>
      <p>Wazuh free hai aur real SOC jaisa environment deta hai. Windows VM pe agent install karo, Wazuh server pe logs jaate hain, dashboard pe alerts milte hain.</p>
      <pre><code>Wazuh Architecture:
  Windows VM     (Wazuh agent installed)
  Wazuh Server   (log collection aur analysis)
  Dashboard      (alerts, rules, monitoring)

Ab real SOC analyst jaisi feeling aayegi.
Authentication events, process execution,
file changes sab monitor hoga real time mein.</code></pre>

      <h2>13. Active Directory Lab</h2>
      <p>Zyaadatar companies Active Directory use karti hain. Real attacks AD ko target karte hain. Ye lab enterprise environment samajhne ke liye essential hai.</p>
      <pre><code>AD Lab Machines:
  Domain Controller   (Windows Server)
  Windows Client      (domain joined)
  Kali Linux          (attacker machine)

Practice scenarios:
  Password spraying detection
  Kerberoasting attempt logging
  Lateral movement via SMB
  Credential dumping detection</code></pre>

      <h2>14. Snapshot Kya Hota Hai</h2>
      <p>VM Snapshot matlab current state save karna. Koi experiment kiya aur fail hua? Snapshot restore karo, sab wapas normal. Professional labs mein snapshots bahut use hote hain. Infected machine banao, investigate karo, phir clean snapshot pe wapas jao.</p>

      <h2>15. Malware Traffic Analysis Practice</h2>
      <p>malware-traffic-analysis.net pe real malware ke PCAPs freely available hain. Har PCAP ek real incident ka hissa tha. Ye sabse valuable free resource hai network forensics practice ke liye.</p>
      <pre><code>Har PCAP investigate karte waqt:
  Infected host kaunsa tha?
  Malware ne kaunsa domain contact kiya?
  Kaunsi file download hui?
  Beaconing hua ya nahi?
  Final IOC list kya hai?

Target: 100 se zyaada PCAPs investigate karo.
Ye number interview mein strong impression deta hai.</code></pre>

      <h2>16. Lab Documentation</h2>
      <p>Sabse zyaada ignore ki jaane wali skill. Har lab ke baad likho: objective kya tha, kaunse tools use kiye, kya mila, screenshots kahan hain, kya seekha. Ye sab GitHub pe daalo. Portfolio banta hai recruiter khud dhundh ke aate hain.</p>

      <h2>17. Build Your First SOC</h2>
      <p>Wazuh install karo, Windows pe agent lagao, alerts dekho, rules tune karo, dashboards banao. Ab tumhara ghar hi SOC ban jaata hai. Ye experience real job se bilkul milta julta hai.</p>

      <h2>18. Weekly Practice Schedule</h2>
      <pre><code>Monday     Networking concepts review
Tuesday    Wireshark PCAP investigation
Wednesday  Log analysis (Windows aur Linux)
Thursday   Wazuh SIEM alerts aur rule tuning
Friday     Threat hunting exercise
Saturday   Full malware PCAP case study
Sunday     Documentation aur GitHub writeup</code></pre>

      <h2>19. Biggest Home Lab Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['100 Tools Install','Sirf collect karna, use kuch nahi. Focus karo, mastery karo.'],
          ['Lab Banake Chord Dena','Build karke use na karna. Daily practice zaroori hai.'],
          ['No Documentation','Bina writeup ke sab kuch bhool jaate ho. Document karo.'],
          ['Sirf Tutorials Dekhna','Passive learning se skill nahi aati. Khud karo.'],
          ['No Investigations','Tools sikhna alag baat hai, actually investigate karna alag.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:180px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <div class="info-box"><p>Golden Rule: Sawaal ye nahi poochho ke kaunsa tool seekhun. Sawaal ye poochho: kaunsi problem solve karni hai. Tools baad mein aate hain, problem understanding pehle aati hai.</p></div>

    `;
  }

  else if (index === 21) {
    document.getElementById('chapterContent').innerHTML = `

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
  }

  else if (index === 22) {
    document.getElementById('chapterContent').innerHTML = `

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
  }

  else if (index === 23) {
    document.getElementById('chapterContent').innerHTML = `

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
  }

  else if (index === 24) {
    document.getElementById('chapterContent').innerHTML = `

      <h2>1. Sabse Badi Galti</h2>
      <p>Cybersecurity start karte hi log poochte hain: kaunsi certification karun? Lekin sahi sawaal hai: mujhe kaunsi skill chahiye? Agar kisi ko TCP/IP nahi aata aur wo GNFA ke baare mein soch raha hai toh ye waise hi hai jaise addition nahi aata aur calculus padhna shuru kar diya.</p>

      <h2>2. Certifications Ka Actual Purpose</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Certification Ka Kaam','Knowledge validate karna, resume shortlist mein help karna, structured learning dena'],
          ['Certification Ka Kaam Nahi','Job guarantee karna, skill replace karna, experience replace karna']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:200px 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>3. Certification Roadmap</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['CCNA','Start here. DNS, TCP, routing, subnetting sab cover. Network forensics ka foundation. Sabse pehle.'],
          ['Security+','Threats, attacks, cryptography, risk management. SOC entry level ke liye widely accepted.'],
          ['BTL1','Blue Team Level 1. Hands-on, practical. SIEM, DFIR, threat hunting. Community mein respected.'],
          ['CySA+','Threat detection, SIEM, incident response, log analysis. SOC L2 ke liye useful alternative.'],
          ['GCFA','GIAC Certified Forensic Analyst. Memory, disk forensics, IR. Advanced level, experience chahiye.'],
          ['GNFA','GIAC Network Forensic Analyst. PCAP analysis, intrusion analysis. Gold standard, beginner ke liye nahi.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>4. Resume Ki Reality</h2>
      <p>Most beginners ka resume: Name, Skills, Certificates. Recruiter impress nahi hota. Strong resume alag dikhta hai.</p>
      <pre><code>Strong Resume Structure:
  Profile Summary    (2 to 3 lines, focused on specialization)
  Technical Skills   (specific tools, not generic list)
  Projects aur Labs  (kya build kiya, kya dhundha, kya investigate kiya)
  Certifications     (listed, not the main focus)
  Education</code></pre>

      <h2>5. Recruiters Ko Kya Pasand Aata Hai</h2>
      <p>Candidate A ke paas 10 certificates hain. Candidate B ke paas 50 PCAP investigations hain, Wazuh lab hai, GitHub pe writeups hain, threat hunting reports hain. Zyaadatar recruiters Candidate B ko prefer karte hain. Portfolio proof hota hai, certificate sirf claim.</p>

      <h2>6. GitHub Portfolio</h2>
      <pre><code>github.com pe create karo aur store karo:
  PCAP-Investigations/     (har PCAP ka writeup)
  Threat-Hunting-Reports/  (hunts ka documentation)
  Wazuh-Lab-Notes/         (SIEM lab findings)
  DFIR-Case-Studies/       (incident investigations)
  Detection-Rules/         (SIEM rules jo banaye)

Ye portfolio recruiter ko dikhata hai ke tum
sirf jaante nahi, karte bhi ho.</code></pre>

      <h2>7. LinkedIn Optimization</h2>
      <pre><code>Include karo:
  Professional headline (specific, not generic)
  Skills (technical, specific tools)
  Projects (lab work, investigations)
  Certifications

Avoid karo:
  "Ethical Hacker | Anonymous | Cyber King"
  Generic claims bina proof ke

Strong Headline Example:
  Cybersecurity Student focused on
  Network Forensics, Threat Hunting and DFIR</code></pre>

      <h2>8. Experience Without a Job</h2>
      <p>Sabse common sawaal: experience nahi hai toh experience kaise lau? Answer simple hai: har lab experience hai, har investigation experience hai, har writeup experience hai. Job ke bina bhi portfolio build ho sakta hai.</p>

      <h2>9. TryHackMe Strategy</h2>
      <pre><code>TryHackMe pe focus karo:
  SOC Level 1 path
  Wireshark rooms
  DFIR rooms
  Threat Hunting rooms
  Windows Event Logs rooms
  Network Forensics rooms

Badges mat chase karo.
Skills chase karo.
Har room ke baad writeup likho.</code></pre>

      <h2>10. Hack The Box Strategy</h2>
      <p>Fundamentals ke baad HTB use karo. Goal advanced investigation mindset develop karna hai. Pehle TryHackMe, fundamentals strong hone ke baad HTB.</p>

      <h2>11. Malware Traffic Analysis Practice</h2>
      <pre><code>malware-traffic-analysis.net:
  Real malware PCAPs freely available
  Har PCAP ek real incident ka hissa tha
  Solutions bhi available hain comparison ke liye

Target: 100+ PCAPs investigate karo
  Ye number interview mein strong impression deta hai
  Har investigation document karo GitHub pe</code></pre>

      <h2>12. Interview Preparation</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['DNS kaise kaam karta hai?','Query, recursive resolver, authoritative server, response. TTL kya hai.'],
          ['TCP 3-Way Handshake?','SYN, SYN-ACK, ACK. Connection establishment process.'],
          ['Beaconing kya hai?','Malware regular intervals pe C2 se contact karta hai. Same IP, same port, same interval.'],
          ['IOC kya hai?','Indicator of Compromise. Domain, IP, hash, filename jo malicious activity indicate kare.'],
          ['SIEM kya karta hai?','Multiple sources se logs collect karta hai, correlate karta hai, alerts generate karta hai.'],
          ['Threat Hunting kya hai?','Proactively threats dhundhna bina kisi alert ke. Hypothesis se start karo.'],
          ['Malware traffic kaise detect karoge?','DNS, HTTP, TLS, beaconing pattern, IOC analysis, timeline build karo.']
        ].map((r,i)=>`
        <div style="display:flex;gap:12px;align-items:flex-start;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:12px 14px;">
          <span style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;background:rgba(220,20,20,0.1);border:1px solid rgba(220,20,20,0.2);border-radius:4px;padding:2px 8px;flex-shrink:0;margin-top:1px;">Q${i+1}</span>
          <div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#f4f4f5;margin-bottom:4px;">${r[0]}</div>
            <div style="font-family:'Inter',sans-serif;font-size:11px;color:#777;">${r[1]}</div>
          </div>
        </div>`).join('')}
      </div>

      <h2>13. Interview Ka Secret</h2>
      <pre><code>Interviewers ye nahi dekhte: tool yaad hai?
Interviewers ye dekhte hain: sochte kaise ho?

Question: Host ne evil-domain.xyz contact kiya. Kya karo?

Wrong: Malware hai, block karo.

Strong:
  Pehle confirm karta hoon ye actual C2 hai.
  DNS logs mein history dekhta hoon.
  Endpoint pe process chain check karta hoon.
  Flow logs mein outbound pattern dekhta hoon.
  Timeline banata hoon.
  Evidence ke saath escalate karta hoon.</code></pre>

      <h2>14. 365-Day Expert Plan</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Months 1 to 2','Networking: TCP/IP, DNS, routing, subnetting, packet basics. CCNA material follow karo.'],
          ['Months 3 to 4','Wireshark: DNS, HTTP, TLS analysis, PCAP investigations, malware traffic practice shuru.'],
          ['Months 5 to 6','Logs: Windows Event Logs, Linux logs, authentication events, process execution tracking.'],
          ['Months 7 to 8','SIEM: Wazuh install, log collection, alert tuning, dashboards, correlation rules banana.'],
          ['Months 9 to 10','Threat Hunting: Hypotheses, DNS/TLS/beaconing hunts, MITRE ATT&CK application.'],
          ['Months 11 to 12','DFIR: Memory forensics, disk forensics, real case studies, full incident reports likhna.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:center;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>15. Biggest Career Mistakes</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          ['Certification Collecting','Skill ke bina. Certificates gate open karte hain, interview skill clear karti hai.'],
          ['No Labs','Theory sirf padhna. Bina practice ke interview mein fail hoge.'],
          ['No Documentation','Portfolio nahi banega. Job nahi milegi experience proof ke bina.'],
          ['No Portfolio','GitHub pe kuch nahi. Recruiter kya dekhega?'],
          ['Weak Networking','Foundation weak. Sab kuch suffer karega.'],
          ['Logs Ignore Karna','Real investigation logs se hoti hai, tools se nahi.'],
          ['Shortcuts Dhundhna','Koi 30-day bootcamp 1 saal ka kaam replace nahi karta.']
        ].map((r,i)=>`
        <div style="background:linear-gradient(135deg,#13131a 0%,#0e0e14 100%);border-radius:12px;border:1px solid rgba(${i%2===0?'220,20,20,0.2':'255,255,255,0.06'});padding:12px 16px;display:grid;grid-template-columns:200px 1fr;gap:8px;align-items:start;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#dc1414;padding-top:2px;">${r[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-size:12px;color:#888;">${r[1]}</div>
        </div>`).join('')}
      </div>

      <h2>16. Final Formula</h2>
      <pre><code>Networking
+ Wireshark
+ Logs
+ SIEM
+ Threat Hunting
+ DFIR
+ Labs
+ Documentation
+ Consistency
= Professional Investigator</code></pre>

      <p>Agar tum is roadmap ko genuinely 1 saal tak follow karte ho aur daily practice karte ho toh tum:</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin:0 0 28px;">
        ${[
          'PCAP files analyze kar ke attack story reconstruct kar sakte ho',
          'Malware traffic aur legitimate traffic mein fark kar sakte ho',
          'SIEM alerts investigate karke false positives aur true positives identify kar sakte ho',
          'Proactive threat hunting kar sakte ho bina kisi alert ke',
          'Basic DFIR investigations perform kar sakte ho proper evidence handling ke saath',
          'SOC Analyst interviews confidently face kar sakte ho'
        ].map((q,i)=>`
        <div style="display:flex;align-items:center;gap:12px;background:#0e0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.04);padding:11px 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="rgba(220,20,20,0.1)" stroke="rgba(220,20,20,0.3)" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#dc1414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;">${q}</span>
        </div>`).join('')}
      </div>

      <!-- FINAL BANNER -->
      <div style="background:linear-gradient(135deg,#0f0f16 0%,#0a0a10 100%);border:1px solid rgba(220,20,20,0.35);border-radius:16px;padding:32px 28px;margin:28px 0 0;position:relative;overflow:hidden;text-align:center;">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 50% 0%,rgba(220,20,20,0.06) 0%,transparent 60%);pointer-events:none;"></div>
        <div style="position:relative;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#dc1414;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">Complete Network Forensics Roadmap</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;color:#f4f4f5;line-height:1.2;margin-bottom:16px;">Parts 1 se 20 Tak. Complete.</div>
          <p style="font-family:'Inter',sans-serif;font-size:13px;color:#888;line-height:1.9;max-width:560px;margin:0 auto 20px;">Networking fundamentals se lekar real incident case studies, DFIR mastery, threat hunting, aur career strategy tak. Ye roadmap ek complete blueprint hai. Baaki kaam consistency ka hai.</p>
          <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
            ${['20 Parts','6 Career Phases','100+ Topics','365 Day Plan'].map(t=>`
            <div style="background:rgba(220,20,20,0.08);border:1px solid rgba(220,20,20,0.2);border-radius:8px;padding:8px 16px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#dc1414;">${t}</div>`).join('')}
          </div>
        </div>
      </div>

    `;
  }


  setTimeout(() => {
    const svgTexts = document.querySelectorAll('svg text, svg tspan');
    svgTexts.forEach(t => {
      const fill = t.getAttribute("fill");
      if (fill === "#444" || fill === "#333" || fill === "#2a2a2a") t.setAttribute("fill", "#8080a0");
      else if (fill === "#555") t.setAttribute("fill", "#7878a0");
      else if (fill === "#666") t.setAttribute("fill", "#9090b0");
      else if (fill === "#777") t.setAttribute("fill", "#9898b8");
      else if (fill === "#888") t.setAttribute("fill", "#a8a8c0");
    });
  }, 0);

  // Re-apply dict translations (banner, nav labels etc.)
  if (typeof applyDictTranslations === 'function') {
    applyDictTranslations(selectedLang);
  }

  // Store original Hinglish IMMEDIATELY after content is set into the DOM
  const _chBox = document.getElementById('chapterContent');
  if (_chBox) {
    const _origKey = 'orig_' + index;
    chapterCache[_origKey] = _chBox.innerHTML; // always fresh Hinglish
  }

  // Translate if selected language is not Hinglish
  if (typeof applyChapterTranslation === 'function' && selectedLang !== 'hl') {
    const _ck = selectedLang + '_' + index;
    if (chapterCache[_ck] && _chBox) {
      // Already translated - inject instantly from cache
      injectTranslated(_chBox, chapterCache[_ck]);
    } else {
      // Translate now
      applyChapterTranslation(selectedLang);
    }
  }

  // Mobile sidebar band karo
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
  }
}

// Chapter loads only when user navigates to learn page (via showPage)


