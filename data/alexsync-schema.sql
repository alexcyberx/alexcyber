-- ═══════════════════════════════════════════════════════════
-- ALEXSYNC — Backend Schema
-- Run this in the Supabase SQL editor.
-- Follows the same conventions as the rest of the AlexCyberX
-- schema: snake_case table/column names, RLS enabled, RPC
-- functions for anything the frontend needs to call safely.
-- ═══════════════════════════════════════════════════════════

-- ── Table: alexsync_schedules ─────────────────────────────────
-- One row per user (a user has exactly one active schedule for now;
-- multiple schedules per user is a future improvement, see design doc).
create table if not exists alexsync_schedules (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  wake_time    time not null,                      -- e.g. '22:30:00'
  days_of_week int[] not null default '{1,2,3,4,5}', -- 0=Sun .. 6=Sat
  platform     text not null default 'youtube' check (platform in ('youtube', 'spotify')),
  genre        text not null default 'bollywood',
  pc_state     text not null default 'sleep' check (pc_state in ('sleep', 'shutdown')),
  mac_address  text,                                -- needed only for pc_state = 'shutdown' (Wake-on-LAN)
  is_active    boolean not null default true,        -- lets a user pause without deleting their config
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Table: alexsync_payments ──────────────────────────────────
-- One row per one-time payment. paid_until on the latest successful
-- row (per user) determines access — see get_alexsync_access() below.
create table if not exists alexsync_payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount_inr   numeric not null default 12,
  status       text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  gateway      text,                                 -- e.g. 'razorpay', 'cashfree'
  gateway_order_id text,
  paid_until   timestamptz,                          -- set on successful payment: created_at + 30 days
  created_at   timestamptz not null default now()
);

create index if not exists idx_alexsync_payments_user on alexsync_payments(user_id, created_at desc);

-- ── Row Level Security ─────────────────────────────────────────
alter table alexsync_schedules enable row level security;
alter table alexsync_payments  enable row level security;

-- Users can only see/edit their own schedule
create policy "select own schedule" on alexsync_schedules
  for select using (auth.uid() = user_id);

create policy "insert own schedule" on alexsync_schedules
  for insert with check (auth.uid() = user_id);

create policy "update own schedule" on alexsync_schedules
  for update using (auth.uid() = user_id);

-- Users can only see their own payment history (inserts/updates happen
-- via RPC/service role only — never direct client writes to this table)
create policy "select own payments" on alexsync_payments
  for select using (auth.uid() = user_id);

-- ── RPC: get_alexsync_access ───────────────────────────────────
-- Returns whether the current user currently has paid access, and
-- until when. Frontend calls this once on page load.
create or replace function get_alexsync_access()
returns table(has_access boolean, paid_until timestamptz)
language sql security definer as $$
  select
    coalesce(max(paid_until), 'epoch'::timestamptz) > now() as has_access,
    max(paid_until) as paid_until
  from alexsync_payments
  where user_id = auth.uid() and status = 'success';
$$;

-- ── RPC: save_alexsync_schedule ─────────────────────────────────
-- Upserts the current user's schedule. Called from the Save Schedule
-- button on the frontend. Access check happens here too (defense in
-- depth — don't only rely on the frontend hiding the form).
create or replace function save_alexsync_schedule(
  p_wake_time    time,
  p_days_of_week int[],
  p_platform     text,
  p_genre        text,
  p_pc_state     text,
  p_mac_address  text default null
)
returns void
language plpgsql security definer as $$
declare
  v_has_access boolean;
begin
  select has_access into v_has_access from get_alexsync_access();
  if not v_has_access then
    raise exception 'AlexSync access has expired. Please renew to save your schedule.';
  end if;

  insert into alexsync_schedules (user_id, wake_time, days_of_week, platform, genre, pc_state, mac_address, updated_at)
  values (auth.uid(), p_wake_time, p_days_of_week, p_platform, p_genre, p_pc_state, p_mac_address, now())
  on conflict (user_id) do update set
    wake_time    = excluded.wake_time,
    days_of_week = excluded.days_of_week,
    platform     = excluded.platform,
    genre        = excluded.genre,
    pc_state     = excluded.pc_state,
    mac_address  = excluded.mac_address,
    updated_at   = now();
end;
$$;

-- ── RPC: get_alexsync_schedule ───────────────────────────────────
-- Fetches the current user's saved schedule, if any, to pre-fill the form.
create or replace function get_alexsync_schedule()
returns setof alexsync_schedules
language sql security definer as $$
  select * from alexsync_schedules where user_id = auth.uid();
$$;

-- ═══════════════════════════════════════════════════════════
-- NOTES
-- ═══════════════════════════════════════════════════════════
-- 1. Payment rows (alexsync_payments) should be inserted/updated by a
--    server-side webhook handler (e.g. a Render/Netlify function that
--    Razorpay/Cashfree calls on payment success), using the Supabase
--    service role key — never from the browser directly. This schema
--    only defines the table + read policy; the payment gateway
--    integration itself is a separate piece of work (see design doc
--    Section 11).
--
-- 2. mac_address is only required when pc_state = 'shutdown' (needed
--    for the Wake-on-LAN magic packet in Phase 2). It stays null for
--    the sleep/hibernate case, which is Phase 1.
--
-- 3. The Windows background app will need its own way to read the
--    schedule — either polling get_alexsync_schedule() via a
--    long-lived Supabase session, or a simpler sync endpoint. This is
--    a Phase 1 build decision, not yet made here.
