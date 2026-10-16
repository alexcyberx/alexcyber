'use client';

// Admin sign-in: password -> admin role check -> two-step code (TOTP). The first
// time, the code step shows a QR to add the account to Google Authenticator.
// Same flow as the old panel; the DB only serves admin data to an aal2 session.

import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { adminSupabase, logAdminEvent } from './sb';

type Step = { kind: 'password' } | { kind: 'code'; factorId: string; qr?: string; secret?: string };

const LOCK_AFTER = 5;
const LOCK_MS = 30_000;

export default function Login({ pending, onDone }: { pending: User | null; onDone: (u: User) => void }) {
  const sb = adminSupabase();
  const [step, setStep] = useState<Step>({ kind: 'password' });
  const [user, setUser] = useState<User | null>(pending);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const fails = useRef(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  // Signed in with the password earlier but the code is still missing.
  useEffect(() => { if (pending) startCode(pending); }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  async function startCode(u: User) {
    if (!sb) return;
    setUser(u);
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === 'aal2') return onDone(u);
    const { data: f, error } = await sb.auth.mfa.listFactors();
    if (error || !f) return setErr('Could not load 2-step settings. Try again.');
    const verified = f.totp[0];
    if (verified) return setStep({ kind: 'code', factorId: verified.id });
    // An unfinished earlier setup blocks a new one.
    for (const old of f.all.filter((x) => x.status !== 'verified')) await sb.auth.mfa.unenroll({ factorId: old.id });
    const { data: en, error: enErr } = await sb.auth.mfa.enroll({
      factorType: 'totp', friendlyName: 'AlexCyberX admin ' + new Date().toISOString().slice(0, 10), issuer: 'AlexCyberX',
    });
    if (enErr || !en) return setErr('Could not start 2-step setup: ' + (enErr?.message || 'unknown error'));
    setStep({ kind: 'code', factorId: en.id, qr: en.totp.qr_code, secret: en.totp.secret });
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!sb || busy || Date.now() < lockedUntil) return;
    setErr('');
    setBusy(true);
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) throw new Error('bad');
      const { data: prof } = await sb.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      if (prof?.role !== 'admin') { await sb.auth.signOut(); throw new Error('bad'); }
      setPassword('');
      fails.current = 0;
      await startCode(data.user);
    } catch {
      fails.current += 1;
      logAdminEvent('failed_login', `admin panel: failed password sign-in for ${email.trim().slice(0, 254)}`);
      if (fails.current >= LOCK_AFTER) { fails.current = 0; setLockedUntil(Date.now() + LOCK_MS); setErr('Too many attempts. Wait 30 seconds.'); }
      else setErr('Wrong email or password, or this account is not an admin.');
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!sb || busy || step.kind !== 'code' || !user) return;
    const c = code.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(c)) return setErr('Enter the 6-digit code.');
    setErr('');
    setBusy(true);
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: step.factorId, code: c });
    setBusy(false);
    if (error) {
      setCode('');
      logAdminEvent('failed_login', `${user.email || 'admin'} entered a wrong 2-step code`);
      return setErr('Wrong or expired code. Check the time on your phone and try again.');
    }
    onDone(user);
  }

  async function cancel() {
    await sb?.auth.signOut();
    setUser(null); setCode(''); setErr(''); setStep({ kind: 'password' });
  }

  return (
    <div className="adm-login">
      <div className="adm-login-box">
        <div className="adm-brand"><span className="adm-brand-mark">X</span> AlexCyberX <span className="adm-brand-tag">Admin</span></div>
        {!sb && <p className="adm-error">Supabase is not configured.</p>}
        {step.kind === 'password' ? (
          <form onSubmit={submitPassword}>
            <label className="adm-field"><span>Email</span>
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} id="admEmail" />
            </label>
            <label className="adm-field"><span>Password</span>
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required id="admPassword" />
            </label>
            {err && <p className="adm-error" id="admLoginErr">{err}</p>}
            <button className="adm-btn primary block" disabled={busy || !sb} id="admLoginBtn">{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>
        ) : (
          <form onSubmit={submitCode} id="admMfaForm">
            {step.qr ? (
              <>
                <p className="adm-help">One-time setup: scan this QR with Google Authenticator (or any authenticator app), then enter the 6-digit code it shows.</p>
                {/* Supabase returns the QR as an SVG data URL. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={step.qr} alt="QR code for the authenticator app" className="adm-qr" id="admMfaQr" />
                <p className="adm-help">Can&apos;t scan? Enter this key by hand: <code id="admMfaSecret">{step.secret}</code></p>
              </>
            ) : (
              <p className="adm-help">Enter the 6-digit code from your authenticator app.</p>
            )}
            <label className="adm-field"><span>Code</span>
              <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} autoFocus id="admMfaCode" />
            </label>
            {err && <p className="adm-error" id="admLoginErr">{err}</p>}
            <button className="adm-btn primary block" disabled={busy} id="admMfaBtn">{busy ? 'Checking...' : 'Verify'}</button>
            <button type="button" className="adm-btn ghost block" onClick={cancel}>Use another account</button>
          </form>
        )}
      </div>
    </div>
  );
}
