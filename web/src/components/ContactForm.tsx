'use client';

import { useState } from 'react';
import { browserSupabase } from '@/lib/supabase';

// Translated status text from js/i18n.js when it's loaded (same keys as page-scripts.js).
function t(key: string, fallback: string): string {
  const w = window as unknown as { getDictText?: (k: string) => string | null };
  return (typeof w.getDictText === 'function' && w.getDictText(key)) || fallback;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) { setStatus({ ok: true, text: '' }); return; } // honeypot: bot
    const n = name.trim(), em = email.trim(), m = msg.trim();
    const fail = (key: string, fb: string) => setStatus({ ok: false, text: t(key, fb) });
    if (!n) return fail('form.status.nameRequired', 'Apna naam daalo.');
    if (n.length > 60) return fail('form.status.nameTooLong', 'Name is too long.');
    if (!EMAIL_RE.test(em)) return fail('form.status.emailInvalid', 'Valid email daalo.');
    if (m.length < 10) return fail('form.status.msgTooShort', 'Message must be at least 10 characters.');
    if (m.length > 1000) return fail('form.status.msgTooLong', 'Message cannot be longer than 1000 characters.');
    if (/<[^>]*>/.test(n + m)) return fail('form.status.noHtml', 'Special characters are not allowed.');
    const sb = browserSupabase();
    if (!sb) return fail('form.status.sendErrorRetry', 'Message could not be sent. Please try again in a moment.');
    setBusy(true);
    const { error } = await sb.rpc('submit_contact_message', { p_name: n, p_email: em, p_message: m });
    setBusy(false);
    if (error) {
      const limited = /too many/i.test(error.message);
      return fail(limited ? 'form.status.tooMany' : 'form.status.sendError', limited ? 'Too many messages sent. Please try again in a while.' : 'Message could not be sent. Please try again.');
    }
    setStatus({ ok: true, text: t('form.status.success', 'Message received! We will reply soon.') });
    setName(''); setEmail(''); setMsg('');
  }

  return (
    <form className="contact-form" data-reveal data-reveal-delay="1" onSubmit={submit} noValidate>
      <div className="form-title" data-i18n="form.title" suppressHydrationWarning>Send Message</div>
      <div className="form-field"><label htmlFor="contactName" data-i18n="form.name" suppressHydrationWarning>Name</label><input id="contactName" type="text" data-i18n-placeholder="form.name.ph" placeholder="Your name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} suppressHydrationWarning /></div>
      <div className="form-field"><label htmlFor="contactEmail" data-i18n="form.email" suppressHydrationWarning>Email</label><input id="contactEmail" type="email" data-i18n-placeholder="form.email.ph" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} suppressHydrationWarning /></div>
      <div className="form-field"><label htmlFor="contactMsg" data-i18n="form.msg" suppressHydrationWarning>Message</label><textarea id="contactMsg" data-i18n-placeholder="form.msg.ph" placeholder="Write here..." maxLength={1000} value={msg} onChange={(e) => setMsg(e.target.value)} suppressHydrationWarning></textarea></div>
      {/* Honeypot field - hidden from real users */}
      <input type="text" id="contactHP" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      <div id="contactMsg_status" style={{ fontSize: 12, marginBottom: 8, minHeight: 18, color: status?.ok ? '#4ade80' : '#e06060' }}>{status?.text}</div>
      <button className="btn-send" type="submit" disabled={busy} style={busy ? { opacity: 0.7 } : undefined}>
        <span data-i18n="form.send" suppressHydrationWarning>Send Message</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </form>
  );
}
