/* Cyber Attacks Fundamentals: module order + 8 new chapters (2026-10-31).
   content_chapters must follow js/chapters2.js cyberAttackChapters: the old SPA
   maps rows to sidebar items by chapter_order, and the admin panel lists these
   rows. chapter_order is 0-based, same as the code list. Existing rows keep their
   enabled flag (admin choice); new chapters are added switched on. Lesson text
   lives in the code, so content stays empty. Safe to run again. */
insert into public.content_chapters (course, slug, title, chapter_order, enabled, has_content)
values
  ('attacks', 'cyber-attacks-introduction',      'Cyber Attacks Introduction',        0, true, true),
  ('attacks', 'reconnaissance-footprinting',     'Reconnaissance & Footprinting',     1, true, true),
  ('attacks', 'social-engineering-phishing',     'Social Engineering & Phishing',     2, true, true),
  ('attacks', 'mitm-attack',                     'MITM Attack',                       3, true, true),
  ('attacks', 'dns-spoofing-poisoning',          'DNS Spoofing & Poisoning',          4, true, true),
  ('attacks', 'dos-ddos-attacks',                'DoS & DDoS Attacks',                5, true, true),
  ('attacks', 'wi-fi-wireless-attacks',          'Wi-Fi & Wireless Attacks',          6, true, true),
  ('attacks', 'owasp-top-10-overview',           'OWASP Top 10 Overview',             7, true, true),
  ('attacks', 'sql-injection',                   'SQL Injection',                     8, true, true),
  ('attacks', 'xss-attack',                      'XSS Attack',                        9, true, true),
  ('attacks', 'cross-site-request-forgery-csrf', 'Cross-Site Request Forgery (CSRF)', 10, true, true),
  ('attacks', 'command-injection',               'Command Injection',                 11, true, true),
  ('attacks', 'broken-access-control-idor',      'Broken Access Control & IDOR',      12, true, true),
  ('attacks', 'ssrf-file-upload',                'SSRF & File Upload',                13, true, true),
  ('attacks', 'ransomware-malware',              'Ransomware & Malware',              14, true, true),
  ('attacks', 'brute-force-password-attacks',    'Brute Force & Password Attacks',    15, true, true),
  ('attacks', 'privilege-escalation',            'Privilege Escalation',              16, true, true),
  ('attacks', 'tls-encryption-attacks',          'TLS & Encryption Attacks',          17, true, true),
  ('attacks', 'attack-defense-prevention',       'Attack Defense & Prevention',       18, true, true)
on conflict (course, slug) do update
  set chapter_order = excluded.chapter_order,
      title = excluded.title,
      has_content = true,
      updated_at = now();
