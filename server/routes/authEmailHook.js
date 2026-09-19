/* ═══════════════════════════════════════════════════════════
   SUPABASE "SEND EMAIL" AUTH HOOK -> RESEND
   ═══════════════════════════════════════════════════════════
   Replaces Supabase's built-in (unstyled, rate-limited) auth emails
   with our own premium-designed templates sent via Resend.

   Flow: Supabase Auth event (signup / recovery / email_change) fires
   -> Supabase POSTs a signed webhook to this endpoint -> we verify the
   signature, build the right HTML, and send via Resend.

   SETUP (do this in Supabase Dashboard, not in code):
     1. Authentication > Hooks > "Send Email" hook -> point it at
        https://<your-render-domain>/auth/email-hook
     2. Copy the generated secret (format: v1,whsec_xxxxx) into the
        SEND_EMAIL_HOOK_SECRET environment variable on Render.
     3. Set RESEND_API_KEY on Render (from Resend dashboard).
     4. Once your domain is verified in Resend, set EMAIL_FROM_ADDRESS
        (e.g. "AlexCyberX <noreply@alexcyberx.com>").

   IMPORTANT - why this does NOT use Resend's stored `template: {id,
   variables}` API: Resend has a known bug (as of this writing) where
   sending via template.variables mangles the `href` attribute of any
   <a> tag whose URL comes from a variable - the link breaks in the
   delivered email even though it looks fine in the dashboard preview.
   Every email below has a link in its href, so we instead keep full
   HTML files in ../emailTemplates/*.html (which double as the source
   Alex can open in the Resend dashboard for reference/design work)
   and send via Resend's plain `html` field, with placeholders filled
   in ourselves via simple string replacement. This sidesteps the bug
   entirely because we never send through Resend's template system.

   IMPORTANT - email_change token/hash pairing is reversed from what
   you'd guess. Supabase's own docs call this out explicitly: do NOT
   assume the "_new" suffix refers to the new email's token. The
   correct pairing (when Secure Email Change is on, which is the
   default and sends two emails):
     - old/current email (user.email)      -> token      + token_hash_new
     - new email         (user.new_email)  -> token_new  + token_hash
   Mixing these up sends a confirmation link that will not verify.
═══════════════════════════════════════════════════════════ */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const { Webhook } = require('standardwebhooks');
const { Resend }  = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// SEND_EMAIL_HOOK_SECRET from Supabase looks like "v1,whsec_XXXXX".
// The standardwebhooks library wants just the base64 part after
// "whsec_", with the "v1," version prefix stripped off.
function getHookSecret() {
  const raw = process.env.SEND_EMAIL_HOOK_SECRET || '';
  return raw.replace(/^v1,/, '').replace(/^whsec_/, '');
}

// Load each HTML file once at startup and keep it in memory. These
// files live in server/emailTemplates/ and are also what's uploaded
// to Resend's dashboard for preview/design purposes - the copy that
// actually goes out is this on-disk one, read directly, not fetched
// from Resend at send time.
const TEMPLATE_DIR = path.join(__dirname, '../emailTemplates');
function loadTemplate(filename) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, filename), 'utf8');
}

let templates;
try {
  templates = {
    confirmSignup:     loadTemplate('confirm-signup.html'),
    resetPassword:      loadTemplate('reset-password.html'),
    confirmNewEmail:    loadTemplate('confirm-new-email.html'),
    emailChangeNotice:  loadTemplate('email-change-notice.html'),
  };
} catch (e) {
  console.error('[authEmailHook] Failed to load email template files:', e.message);
  templates = {};
}

// Fills {{{VARIABLE}}} placeholders. Deliberately a plain string
// replace, not a templating engine - see the top-of-file note on why
// we don't use Resend's own template variable system for these.
function fillTemplate(html, vars) {
  let out = html;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{{${key}}}}`).join(value == null ? '' : String(value));
  }
  return out;
}

// Supabase's HTTP hook payload doesn't include a ready-made
// confirmation URL; we build it ourselves from token_hash + action
// type + redirect_to, pointed at the project's own /auth/v1/verify
// endpoint (this is what actually marks the token used and completes
// the auth action before bouncing to redirect_to).
function buildConfirmationUrl(siteUrlFallback, tokenHash, actionType, redirectTo) {
  const projectUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const base = projectUrl ? `${projectUrl}/auth/v1/verify` : `${siteUrlFallback}/auth/v1/verify`;
  const params = new URLSearchParams({
    token: tokenHash,
    type: actionType,
    redirect_to: redirectTo || ''
  });
  return `${base}?${params.toString()}`;
}

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'AlexCyberX <onboarding@resend.dev>';

// POST /auth/email-hook
// Mounted with express.json({ verify: ... }) already applied globally
// in server/index.js, which stashes the raw body on req.rawBody
// alongside the parsed req.body. We MUST verify against the raw
// string, not JSON.stringify(req.body), or the signature will never
// match (re-serializing JSON can reorder keys / change whitespace).
router.post('/email-hook', async (req, res) => {
  if (!req.rawBody) {
    console.error('[authEmailHook] Missing req.rawBody - is express.json({verify}) mounted before this route?');
    return res.status(500).json({ error: { http_code: 500, message: 'Server misconfiguration.' } });
  }

  let user, email_data;
  try {
    const wh = new Webhook(getHookSecret());
    const verified = wh.verify(req.rawBody, req.headers);
    user = verified.user;
    email_data = verified.email_data;
  } catch (err) {
    // Signature didn't match. Do NOT send an email or reveal details -
    // this could be a forged request.
    console.warn('[authEmailHook] Signature verification failed:', err.message);
    return res.status(401).json({ error: { http_code: 401, message: 'Invalid signature.' } });
  }

  try {
    const actionType  = email_data.email_action_type;
    const redirectTo  = email_data.redirect_to;
    const siteUrl     = email_data.site_url;

    if (actionType === 'signup') {
      const url = buildConfirmationUrl(siteUrl, email_data.token_hash, actionType, redirectTo);
      const html = fillTemplate(templates.confirmSignup, { CONFIRMATION_URL: url });
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [user.email],
        subject: 'Confirm your AlexCyberX account',
        html
      });
      if (error) throw error;

    } else if (actionType === 'recovery') {
      const url = buildConfirmationUrl(siteUrl, email_data.token_hash, actionType, redirectTo);
      const html = fillTemplate(templates.resetPassword, { CONFIRMATION_URL: url });
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [user.email],
        subject: 'Reset your AlexCyberX password',
        html
      });
      if (error) throw error;

    } else if (actionType === 'email_change') {
      // Secure Email Change (the default) fires this hook TWICE - once
      // per recipient - each time with both token pairs present. See
      // the file-header note above for why the "_new" suffix does NOT
      // mean "use this for the new email". We send whichever of the
      // two emails corresponds to the pairing we actually have.
      const hasOldEmailPair = !!(email_data.token && email_data.token_hash_new);
      const hasNewEmailPair = !!(email_data.token_new && email_data.token_hash);

      if (hasNewEmailPair && user.new_email) {
        // Confirmation link for the NEW address: token_new + token_hash
        const url = buildConfirmationUrl(siteUrl, email_data.token_hash, actionType, redirectTo);
        const html = fillTemplate(templates.confirmNewEmail, { CONFIRMATION_URL: url });
        const { error } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: [user.new_email],
          subject: 'Confirm your new email address',
          html
        });
        if (error) throw error;
      }

      if (hasOldEmailPair) {
        // Notice-only for the OLD/current address: no link needed here,
        // token + token_hash_new pairing exists but we don't act on it -
        // this email is informational (see email-change-notice.html).
        const html = fillTemplate(templates.emailChangeNotice, {
          NEW_EMAIL: user.new_email || ''
        });
        const { error } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: [user.email],
          subject: 'Email change requested on your account',
          html
        });
        if (error) throw error;
      }

    } else {
      // Any other auth_hook action type (magiclink, invite, reauthentication,
      // etc.) isn't used anywhere in this app's auth.js today - see the
      // grep audit in the accompanying summary. Rather than silently
      // dropping it (which could hide a real email if this app grows
      // to use one of these flows later), log it clearly.
      console.warn(`[authEmailHook] Unhandled email_action_type: "${actionType}" for ${user.email} - no email sent.`);
    }

    return res.status(200).json({});

  } catch (err) {
    // Per Supabase's documented hook error contract: return http_code +
    // message so Supabase can surface a meaningful error instead of a
    // generic failure to the client-side signUp()/updateUser() call.
    console.error('[authEmailHook] Failed to send email:', err);
    return res.status(500).json({
      error: {
        http_code: 500,
        message: 'Could not send email. Please try again.'
      }
    });
  }
});

module.exports = router;
