// Extracted from js/chapters.js — Network Forensics course, chapter index 16.
// This file only defines content; js/chapters.js contains the loadChapter() logic that uses it.
window.chapterContent16 = `

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
