'use client';

// React port of the login / signup / forgot-password overlays in index.html
// (same classes, css/auth.css). Logic follows js/auth.js, plus the
// "set a new password" step after a reset link, which the old site never had.

import { useEffect, useRef, useState } from 'react';
import { browserSupabase, setRememberMe } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Msg = { type: 'error' | 'success'; text: string } | null;

// Client-side brake on repeated attempts (Supabase Auth rate-limits server-side too).
const attempts = { n: 0, t: 0 };
function tooManyAttempts(): string | null {
  const now = Date.now();
  if (now - attempts.t > 60000) { attempts.n = 0; attempts.t = now; }
  attempts.n++;
  if (attempts.n > 5) return `Too many attempts. Please wait ${Math.ceil((60000 - (now - attempts.t)) / 1000)} seconds.`;
  return null;
}

function strength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_COLORS = ['', '#e05050', '#e08840', '#d4c020', '#3cb878'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="auth-close" type="button" onClick={onClick} aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#888" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </button>
  );
}

function Logo() {
  return (
    <div className="auth-logo">
      <div className="auth-logo-dot"></div>
      <div className="auth-logo-text">Alex <em>CyberX</em></div>
    </div>
  );
}

function MsgBox({ msg, kind, id }: { msg: Msg; kind: 'error' | 'success'; id: string }) {
  const show = msg && msg.type === kind;
  return <div className={`auth-${kind}${show ? ' show' : ''}`} id={id}>{show ? msg!.text : ''}</div>;
}

const MailIcon = () => (
  <span className="auth-input-icon">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="2" stroke="#444" strokeWidth="1.3" /><path d="M1 5l6.5 4L14 5" stroke="#444" strokeWidth="1.3" strokeLinecap="round" /></svg>
  </span>
);

function PasswordInput(props: { id: string; value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-input-wrap">
      <input className="auth-input" id={props.id} type={show ? 'text' : 'password'} placeholder={props.placeholder}
        autoComplete={props.autoComplete} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
      <button className="auth-toggle-pw" type="button" tabIndex={-1} onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show
          ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><ellipse cx="7.5" cy="7.5" rx="6" ry="4" stroke="#888" strokeWidth="1.3" /><line x1="2" y1="2" x2="13" y2="13" stroke="#888" strokeWidth="1.3" strokeLinecap="round" /></svg>
          : <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><ellipse cx="7.5" cy="7.5" rx="6" ry="4" stroke="#444" strokeWidth="1.3" /><circle cx="7.5" cy="7.5" r="2" stroke="#444" strokeWidth="1.3" /></svg>}
      </button>
    </div>
  );
}

function StrengthMeter({ pw }: { pw: string }) {
  const s = strength(pw);
  return (
    <div className="auth-strength">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="auth-strength-bar" style={{ background: i <= s ? STRENGTH_COLORS[s] : 'rgba(255,255,255,0.06)' }} />
      ))}
      <span className="auth-strength-text" style={{ color: STRENGTH_COLORS[s] || '#444' }}>{pw.length ? STRENGTH_LABELS[s] : ''}</span>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" /><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
);

export default function AuthModals() {
  const { modal, openAuth, closeAuth, afterSignIn, nextPath } = useAuth();
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  // DPDP: under-18 users need a parent/guardian's permission (privacy policy, section 8)
  const [ageOk, setAgeOk] = useState(false);
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(true);
  const firstInput = useRef<HTMLInputElement | null>(null);

  // Fresh form + focus every time a modal opens.
  useEffect(() => {
    setMsg(null); setPw(''); setPw2('');
    if (!modal) return;
    const id = { login: 'loginEmail', signup: 'signupName', forgot: 'forgotEmail', newpw: 'newPassword' }[modal];
    const t = setTimeout(() => (document.getElementById(id) as HTMLInputElement | null)?.focus(), 80);
    return () => clearTimeout(t);
  }, [modal]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && modal !== 'newpw') closeAuth(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal, closeAuth]);

  const sb = browserSupabase();
  const notConfigured = () => setMsg({ type: 'error', text: 'Service not configured. Please contact the administrator.' });

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const limited = tooManyAttempts(); if (limited) return setMsg({ type: 'error', text: limited });
    if (!email.trim()) return setMsg({ type: 'error', text: 'Please enter your email address.' });
    if (!pw) return setMsg({ type: 'error', text: 'Please enter your password.' });
    if (!sb) return notConfigured();
    setRememberMe(remember);
    setBusy(true);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) {
      const unconfirmed = /confirm/i.test(error.message);
      return setMsg({ type: 'error', text: unconfirmed ? 'Please verify your email first (check your inbox), then sign in.' : 'Incorrect email or password.' });
    }
    afterSignIn();
  }

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const n = name.trim(), em = email.trim();
    if (!n) return setMsg({ type: 'error', text: 'Please enter your name.' });
    if (n.length > 60) return setMsg({ type: 'error', text: 'Name must be 60 characters or less.' });
    if (/<[^>]*>/.test(n)) return setMsg({ type: 'error', text: 'Name cannot contain HTML or special tags.' });
    if (!EMAIL_RE.test(em)) return setMsg({ type: 'error', text: 'Please enter a valid email address.' });
    if (pw.length < 8) return setMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
    if (pw !== pw2) return setMsg({ type: 'error', text: 'Passwords do not match.' });
    if (!ageOk) return setMsg({ type: 'error', text: 'Please confirm you are 18+ or have permission from your parent/guardian.' });
    if (!sb) return notConfigured();
    setBusy(true);
    try {
      // Admin's "User Registration" switch (Settings -> Access Control)
      const { data: settings } = await sb.rpc('get_site_settings');
      if (settings && settings.user_registration === false) {
        setBusy(false);
        return setMsg({ type: 'error', text: 'New sign-ups are currently disabled. Please check back later.' });
      }
    } catch { /* don't block signups on a settings read error */ }
    const { data, error } = await sb.auth.signUp({
      email: em, password: pw,
      options: { data: { full_name: n, username: '', bio: '', age_confirmed: true }, emailRedirectTo: window.location.origin + '/' },
    });
    setBusy(false);
    if (error) {
      const text = /already registered/i.test(error.message) ? 'Ye email already registered hai.'
        : /password/i.test(error.message) ? 'Password must be at least 8 characters.'
        : 'Could not create account. Please try again.';
      return setMsg({ type: 'error', text });
    }
    if (data.user && !data.session) {
      return setMsg({ type: 'success', text: `Account created! A confirmation email has been sent to ${em}. Please verify your email then sign in.` });
    }
    setMsg({ type: 'success', text: `Account created! Welcome, ${n}.` });
    setTimeout(afterSignIn, 1200);
  }

  async function doGoogle() {
    if (!sb) return notConfigured();
    // Back to the page that should open after login (same origin only).
    const target = window.location.origin + (nextPath || window.location.pathname);
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: target } });
    if (error) setMsg({ type: 'error', text: error.message });
  }

  async function doForgot(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const em = email.trim();
    if (!EMAIL_RE.test(em)) return setMsg({ type: 'error', text: 'Please enter a valid email address.' });
    if (!sb) return notConfigured();
    setBusy(true);
    // The link lands on the home page, which opens "set a new password".
    const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: window.location.origin + '/?reset=1' });
    setBusy(false);
    if (error) return setMsg({ type: 'error', text: 'Could not send reset email. Please try again.' });
    setMsg({ type: 'success', text: `Password reset link sent to ${em}. Please check your email and click the link.` });
  }

  async function doNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) return setMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
    if (pw.length > 72) return setMsg({ type: 'error', text: 'Password cannot exceed 72 characters.' });
    if (pw !== pw2) return setMsg({ type: 'error', text: 'Passwords do not match.' });
    if (!sb) return notConfigured();
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ type: 'error', text: /different|same/i.test(error.message) ? 'New password must be different from the old one.' : 'Could not update password. Please request a new reset link.' });
    setMsg({ type: 'success', text: 'Password updated! You are signed in.' });
    setTimeout(closeAuth, 1400);
  }

  const overlay = (id: string, active: boolean, children: React.ReactNode, dismissable = true) => (
    <div className={'auth-overlay' + (active ? ' active' : '')} id={id}
      onClick={(e) => { if (dismissable && e.target === e.currentTarget) closeAuth(); }}>
      <div className="auth-card">{children}</div>
    </div>
  );

  const divider = (
    <div className="auth-divider"><div className="auth-divider-line"></div><div className="auth-divider-text">or continue with</div><div className="auth-divider-line"></div></div>
  );

  return (
    <>
      {overlay('loginOverlay', modal === 'login', (
        <form onSubmit={doLogin} noValidate>
          <CloseBtn onClick={closeAuth} />
          <Logo />
          <div className="auth-title">Welcome back</div>
          <div className="auth-subtitle">Sign in to your account and continue learning.</div>
          <MsgBox msg={msg} kind="error" id="loginError" />
          <div className="auth-field">
            <label className="auth-label" htmlFor="loginEmail">Email Address</label>
            <div className="auth-input-wrap">
              <input ref={firstInput} className="auth-input" id="loginEmail" type="email" placeholder="your@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <MailIcon />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="loginPassword">Password</label>
            <PasswordInput id="loginPassword" value={pw} onChange={setPw} placeholder="Enter your password" autoComplete="current-password" />
          </div>
          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" id="rememberMe" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <button className="auth-forgot-link" type="button" onClick={() => openAuth('forgot')}>Forgot password?</button>
          </div>
          <button className="auth-btn" type="submit" disabled={busy}>{busy ? 'Please wait...' : 'Sign In'}</button>
          {divider}
          <button className="auth-google-btn" type="button" onClick={doGoogle}><GoogleIcon /> Continue with Google</button>
          <div className="auth-switch">Don&apos;t have an account? <button type="button" onClick={() => openAuth('signup')}>Sign up</button></div>
        </form>
      ))}

      {overlay('signupOverlay', modal === 'signup', (
        <form onSubmit={doSignup} noValidate>
          <CloseBtn onClick={closeAuth} />
          <Logo />
          <div className="auth-title">Create account</div>
          <div className="auth-subtitle">Join for free and get access to the complete cybersecurity roadmap.</div>
          <MsgBox msg={msg} kind="error" id="signupError" />
          <MsgBox msg={msg} kind="success" id="signupSuccess" />
          <div className="auth-field">
            <label className="auth-label" htmlFor="signupName">Full Name</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="signupName" type="text" placeholder="Your full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="#444" strokeWidth="1.3" /><path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="#444" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </span>
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="signupEmail">Email Address</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="signupEmail" type="email" placeholder="your@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <MailIcon />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="signupPassword">Password</label>
            <PasswordInput id="signupPassword" value={pw} onChange={setPw} placeholder="Create a strong password" autoComplete="new-password" />
            <StrengthMeter pw={pw} />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="signupConfirm">Confirm Password</label>
            <PasswordInput id="signupConfirm" value={pw2} onChange={setPw2} placeholder="Re-enter your password" autoComplete="new-password" />
          </div>
          <label className="auth-remember" style={{ marginBottom: 12 }}>
            <input type="checkbox" id="signupAge" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} />
            <span>Main 18+ hoon, ya mere parent/guardian ne permission di hai</span>
          </label>
          <div className="auth-terms">By creating an account (also with Google) you confirm this and agree to our <a href="/terms-of-service">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a>.</div>
          <button className="auth-btn" type="submit" disabled={busy}>{busy ? 'Please wait...' : 'Create Account'}</button>
          {divider}
          <button className="auth-google-btn" type="button" onClick={doGoogle}><GoogleIcon /> Sign up with Google</button>
          <div className="auth-switch">Already have an account? <button type="button" onClick={() => openAuth('login')}>Sign in</button></div>
        </form>
      ))}

      {overlay('forgotOverlay', modal === 'forgot', (
        <form onSubmit={doForgot} noValidate>
          <CloseBtn onClick={closeAuth} />
          <Logo />
          <button className="auth-back-btn" type="button" onClick={() => openAuth('login')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Sign In
          </button>
          <div className="auth-title">Reset Password</div>
          <div className="auth-subtitle">Enter your registered email. We&apos;ll send you a password reset link.</div>
          <MsgBox msg={msg} kind="error" id="forgotError" />
          <MsgBox msg={msg} kind="success" id="forgotSuccess" />
          <div className="auth-field">
            <label className="auth-label" htmlFor="forgotEmail">Email Address</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="forgotEmail" type="email" placeholder="your@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <MailIcon />
            </div>
          </div>
          <button className="auth-btn" type="submit" disabled={busy}>{busy ? 'Please wait...' : 'Send Reset Link'}</button>
          <div className="auth-switch">Remembered it? <button type="button" onClick={() => openAuth('login')}>Sign in</button></div>
        </form>
      ))}

      {overlay('newPasswordOverlay', modal === 'newpw', (
        <form onSubmit={doNewPassword} noValidate>
          <Logo />
          <div className="auth-title">Set a new password</div>
          <div className="auth-subtitle">Choose a new password for your account.</div>
          <MsgBox msg={msg} kind="error" id="newPasswordError" />
          <MsgBox msg={msg} kind="success" id="newPasswordSuccess" />
          <div className="auth-field">
            <label className="auth-label" htmlFor="newPassword">New Password</label>
            <PasswordInput id="newPassword" value={pw} onChange={setPw} placeholder="Create a strong password" autoComplete="new-password" />
            <StrengthMeter pw={pw} />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="newPasswordConfirm">Confirm Password</label>
            <PasswordInput id="newPasswordConfirm" value={pw2} onChange={setPw2} placeholder="Re-enter your password" autoComplete="new-password" />
          </div>
          <button className="auth-btn" type="submit" disabled={busy}>{busy ? 'Please wait...' : 'Update Password'}</button>
        </form>
      ), false)}
    </>
  );
}
