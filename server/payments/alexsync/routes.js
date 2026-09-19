/* ═══════════════════════════════════════════════════════════
   ALEXSYNC, Payment Routes (Cashfree, one-time payment only)
   ═══════════════════════════════════════════════════════════
   Two endpoints:
     POST /api/alexsync/create-order, called by the frontend when the
                                          user clicks "Unlock AlexSync".
                                          Returns a payment_session_id
                                          which the frontend hands to the
                                          Cashfree JS SDK to open the
                                          hosted checkout page.
     POST /api/alexsync/webhook, called by Cashfree's servers on
                                          payment success/failure.

   NOTE ON FLOW: Cashfree's hosted checkout is redirect-based, the
   browser leaves our site and comes back, rather than an inline popup
   with a JS callback. So the primary confirmation path here is:
     1. Frontend creates the order, gets payment_session_id + order_id.
     2. Frontend opens Cashfree checkout (redirectTarget "_self").
     3. Cashfree redirects the browser back to our return_url with the
        order_id in the query string.
     4. The frontend, on load, sees that query param and calls
        GET /api/alexsync/confirm-order?orderId=... which asks Cashfree
        directly "what's the real status of this order" (server-to-
        server, via PGFetchOrder), this is authoritative because it
        comes from Cashfree's API, not from anything the browser could
        have tampered with in the URL.
     5. The webhook is a secondary/backup confirmation path, in case
        the user closes the tab before the redirect completes.

   Env vars required (set these on Render, never commit real values):
     CASHFREE_CLIENT_ID
     CASHFREE_CLIENT_SECRET
     CASHFREE_ENV, "PRODUCTION" or "SANDBOX"
     CASHFREE_WEBHOOK_SECRET, same as your Cashfree client secret;
                                    Cashfree signs webhooks with it
     PUBLIC_BASE_URL, e.g. https://alexcyber.onrender.com
                                    (used to build the return_url)
     SUPABASE_URL, same project URL as the frontend uses
     SUPABASE_SERVICE_ROLE_KEY, service role key, NOT the anon key.
                                    This is required to write to
                                    alexsync_payments bypassing RLS, since
                                    the webhook/confirm calls have no user
                                    session. Keep this secret, server-side only.
═══════════════════════════════════════════════════════════ */

const express   = require('express');
const router    = express.Router();
const crypto    = require('crypto');
const { Cashfree, CFEnvironment } = require('cashfree-pg');
const { createClient } = require('@supabase/supabase-js');
const { checkToolEnabled, logToolUsage } = require('../../middleware/toolAccess');

const PRICE_INR = 12; // matches the design doc, flat ₹12/month, one-time payment

let cashfree = null;
function getCashfree() {
  if (!cashfree) {
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      throw new Error('Cashfree keys are not configured on the server.');
    }
    const env = process.env.CASHFREE_ENV === 'PRODUCTION'
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;
    cashfree = new Cashfree(env, process.env.CASHFREE_CLIENT_ID, process.env.CASHFREE_CLIENT_SECRET);
  }
  return cashfree;
}

let supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase service role credentials are not configured on the server.');
    }
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdmin;
}

// FIX: create-order used to trust req.body.userId as-is. Since this
// route has no server session, anyone could POST any other user's
// Supabase uid and pay ₹12 to mark THAT account as AlexSync-paid
// instead of their own (or vice versa, depending which id they send).
// This resolves the real logged-in user from the Supabase access token
// (sent as "Authorization: Bearer <token>" by the frontend) using the
// service-role client's auth.getUser(), which is the same trust anchor
// already used for Supabase auth everywhere else in the app - it just
// wasn't being checked on this one route. req.body.userId, if present,
// must match the verified id or the request is rejected; this catches
// a stale/mismatched client without silently overriding what the user
// intended.
async function resolveVerifiedUserId(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return { error: 'Missing Authorization header. Please log in again.' };
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) {
    return { error: 'Your session has expired. Please log in again.' };
  }

  const verifiedUserId = data.user.id;
  if (req.body?.userId && req.body.userId !== verifiedUserId) {
    return { error: 'Session mismatch. Please refresh and try again.' };
  }

  return { userId: verifiedUserId, email: data.user.email };
}

function markPaid(sb, orderId, userId) {
  const paidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  let q = sb.from('alexsync_payments').update({ status: 'success', paid_until: paidUntil }).eq('gateway_order_id', orderId);
  if (userId) q = q.eq('user_id', userId);
  return q;
}

// ── POST /api/alexsync/create-order ──────────────────────────
// Body: { userId } (kept for backward compatibility / mismatch check).
// Header: Authorization: Bearer <supabase access token>, required.
// The verified token owner, not the body, decides which account this
// payment gets linked to - see resolveVerifiedUserId() above.
router.post('/create-order', checkToolEnabled('alexsync'), async (req, res) => {
  try {
    const verified = await resolveVerifiedUserId(req);
    if (verified.error) return res.status(401).json({ error: verified.error });
    const userId = verified.userId;

    const cf = getCashfree();

    // Cashfree caps order_id at 50 chars and it must be unique per order,
    // so use a shortened hash of the userId plus a timestamp.
    const orderId = `as_${crypto.createHash('sha256').update(userId).digest('hex').slice(0, 12)}_${Date.now()}`;
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

    const request = {
      order_id: orderId,
      order_amount: PRICE_INR,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_email: req.body.email || verified.email || 'no-reply@alexcyberx.com',
        customer_phone: req.body.phone || '9999999999'
      },
      order_meta: {
        // order_id is appended so the frontend can pick it up after redirect
        return_url: `${baseUrl}/tools/alexsync?alexsync_order_id={order_id}`
      },
      order_note: 'AlexSync, 1 month access'
    };

    const response = await cf.PGCreateOrder(request);
    const order = response.data;

    // Record a pending payment row up front - gives us a local paper
    // trail even if the webhook never arrives (network issue, etc.)
    const sb = getSupabaseAdmin();
    await sb.from('alexsync_payments').insert({
      user_id: userId,
      amount_inr: PRICE_INR,
      status: 'pending',
      gateway: 'cashfree',
      gateway_order_id: orderId
    });

    logToolUsage('alexsync', userId);

    res.json({
      orderId,
      paymentSessionId: order.payment_session_id
    });
  } catch (err) {
    const detail = err?.response?.data || err?.message || JSON.stringify(err);
    console.error('[AlexSync] create-order failed:', detail);
    res.status(500).json({ error: 'Could not create payment order. Please try again.' });
  }
});

// ── GET /api/alexsync/confirm-order ──────────────────────────
// Fallback/primary confirmation path used right after the Cashfree
// redirect brings the user back to our return_url. We ask Cashfree's
// API directly for the order status (server-to-server, via
// PGFetchOrder) rather than trusting anything from the URL, this is
// the documented, safe way to confirm a Cashfree hosted-checkout
// payment. Safe to keep permanently as a backup even after the
// webhook is configured.
router.get('/confirm-order', async (req, res) => {
  try {
    const { orderId, userId } = req.query;
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const cf = getCashfree();
    const response = await cf.PGFetchOrder(orderId);
    const order = response.data;

    if (order.order_status === 'PAID') {
      const sb = getSupabaseAdmin();
      await markPaid(sb, orderId, userId);
      console.log(`[AlexSync] Payment confirmed (redirect-confirm path) for order ${orderId}`);
      return res.json({ status: 'success' });
    }

    if (order.order_status === 'EXPIRED' || order.order_status === 'CANCELLED') {
      const sb = getSupabaseAdmin();
      await sb.from('alexsync_payments').update({ status: 'failed' }).eq('gateway_order_id', orderId);
      return res.json({ status: 'failed' });
    }

    // ACTIVE means still awaiting payment completion
    res.json({ status: 'pending' });
  } catch (err) {
    const detail = err?.response?.data || err?.message || JSON.stringify(err);
    console.error('[AlexSync] confirm-order failed:', detail);
    res.status(500).json({ error: 'Could not confirm payment. Please contact support.' });
  }
});

// ── POST /api/alexsync/webhook ───────────────────────────────
// Cashfree calls this directly (not the browser). Must verify the
// signature before trusting anything in the body.
//
// IMPORTANT: this route needs the raw request body to verify the HMAC
// signature correctly. Express's express.json() (mounted globally in
// server/index.js) parses the body before this handler runs, which
// breaks signature verification. See the mounting note in server/index.js
// for how this is handled (raw body preserved via verify callback).
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp  = req.headers['x-webhook-timestamp'];
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[AlexSync] CASHFREE_WEBHOOK_SECRET not set, rejecting webhook.');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update((timestamp || '') + (req.rawBody || ''))
      .digest('base64');

    if (expected !== signature) {
      console.warn('[AlexSync] Webhook signature mismatch, possible spoofed request.');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const orderId = event?.data?.order?.order_id;
    const userId  = event?.data?.customer_details?.customer_id;

    if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      if (!orderId) {
        console.error('[AlexSync] Webhook success with no order_id in payload');
        return res.status(200).json({ ok: true }); // ack anyway, nothing more we can do
      }
      const sb = getSupabaseAdmin();
      await markPaid(sb, orderId, userId);
      console.log(`[AlexSync] Payment captured (webhook) for order ${orderId}`);
    } else if (event.type === 'PAYMENT_FAILED_WEBHOOK' || event.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
      if (orderId) {
        const sb = getSupabaseAdmin();
        await sb.from('alexsync_payments').update({ status: 'failed' }).eq('gateway_order_id', orderId);
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[AlexSync] webhook handling failed:', err.message);
    // Still return 500 for genuine processing failures so Cashfree retries;
    // signature mismatches above already returned 400 and won't reach here.
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
