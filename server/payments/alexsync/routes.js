/* ═══════════════════════════════════════════════════════════
   ALEXSYNC — Payment Routes (Razorpay, one-time payment only)
   ═══════════════════════════════════════════════════════════
   Two endpoints:
     POST /api/alexsync/create-order   — called by the frontend when the
                                          user clicks "Unlock AlexSync"
     POST /api/alexsync/webhook        — called by Razorpay's servers on
                                          payment success/failure

   Env vars required (set these on Render, never commit real values):
     RAZORPAY_KEY_ID
     RAZORPAY_KEY_SECRET
     RAZORPAY_WEBHOOK_SECRET   — set this same secret in the Razorpay
                                  dashboard webhook config
     SUPABASE_URL              — same project URL as the frontend uses
     SUPABASE_SERVICE_ROLE_KEY — service role key, NOT the anon key.
                                  This is required to write to
                                  alexsync_payments bypassing RLS, since
                                  the webhook has no user session.
                                  Keep this secret, server-side only.
═══════════════════════════════════════════════════════════ */

const express   = require('express');
const router    = express.Router();
const crypto    = require('crypto');
const Razorpay  = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

const PRICE_INR = 12; // matches the design doc — flat ₹12/month, one-time payment

let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys are not configured on the server.');
    }
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
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

// ── POST /api/alexsync/create-order ──────────────────────────
// Body: { userId }  (the logged-in user's Supabase auth uid, sent from
// the frontend — we don't have a session cookie on this API since the
// frontend uses Supabase auth directly, not a server session)
router.post('/create-order', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const rp = getRazorpay();
    const order = await rp.orders.create({
      amount: PRICE_INR * 100, // paise
      currency: 'INR',
      receipt: `alexsync_${userId}_${Date.now()}`,
      notes: { userId, product: 'alexsync' }
    });

    // Record a pending payment row up front — gives us a local paper
    // trail even if the webhook never arrives (network issue, etc.)
    const sb = getSupabaseAdmin();
    await sb.from('alexsync_payments').insert({
      user_id: userId,
      amount_inr: PRICE_INR,
      status: 'pending',
      gateway: 'razorpay',
      gateway_order_id: order.id
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[AlexSync] create-order failed:', err.message);
    res.status(500).json({ error: 'Could not create payment order. Please try again.' });
  }
});

// ── POST /api/alexsync/webhook ───────────────────────────────
// Razorpay calls this directly (not the browser). Must verify the
// signature before trusting anything in the body.
//
// IMPORTANT: this route needs the raw request body to verify the HMAC
// signature correctly. Express's express.json() (mounted globally in
// server/index.js) parses the body before this handler runs, which
// breaks signature verification. See the mounting note in server/index.js
// for how this is handled (raw body preserved via verify callback).
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[AlexSync] RAZORPAY_WEBHOOK_SECRET not set — rejecting webhook.');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody || '')
      .digest('hex');

    if (expected !== signature) {
      console.warn('[AlexSync] Webhook signature mismatch — possible spoofed request.');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const userId = payment.notes && payment.notes.userId;

      if (!userId) {
        console.error('[AlexSync] Webhook payment.captured with no userId in notes, order:', orderId);
        return res.status(200).json({ ok: true }); // ack anyway, nothing more we can do
      }

      const sb = getSupabaseAdmin();
      const paidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await sb
        .from('alexsync_payments')
        .update({ status: 'success', paid_until: paidUntil })
        .eq('gateway_order_id', orderId);

      console.log(`[AlexSync] Payment captured for user ${userId}, order ${orderId}, valid until ${paidUntil}`);
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const sb = getSupabaseAdmin();
      await sb
        .from('alexsync_payments')
        .update({ status: 'failed' })
        .eq('gateway_order_id', payment.order_id);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[AlexSync] webhook handling failed:', err.message);
    // Still ack with 200 where possible to avoid Razorpay retry storms
    // for errors that are our own bug, not a delivery problem — but for
    // safety here we return 500 so Razorpay retries genuine failures.
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
