// Extracted from js/chapters.js — Network Forensics course, chapter index 15.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent15 = `

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
