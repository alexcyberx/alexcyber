/* ═══════════════════════════════════════════════════════════
   AlexRecon - Scheduled Scans worker
   ═══════════════════════════════════════════════════════════
   Runs inside the main Express process on a setInterval - no
   separate worker dyno needed, which keeps this deployable on
   Render's free tier alongside the rest of AlexCyberX.

   Limitation (surfaced to the user in the UI): if the free-tier
   app spins down from inactivity, this scheduler stops running
   until the app wakes back up on the next incoming request. A
   missed run is simply picked up whenever the app is next awake
   and the schedule is checked - not retried immediately.

   Runs a single fetch-and-execute pass every CHECK_INTERVAL_MS.
   A schedule is "due" when now >= last_run_at + frequency window
   (or it has never run before).
═══════════════════════════════════════════════════════════ */

const { withTimeout } = require('./modules/utils');

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SCHEDULES_PER_TICK = 25;        // bound one tick's work
const SCAN_DEADLINE_MS = 3 * 60 * 1000;   // hard cap per scheduled scan

const FREQUENCY_MS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000
};

function isDue(schedule) {
  if (!schedule.is_active) return false;
  if (!schedule.last_run_at) return true;
  const windowMs = FREQUENCY_MS[schedule.frequency] || FREQUENCY_MS.weekly;
  const lastRun = new Date(schedule.last_run_at).getTime();
  return Date.now() - lastRun >= windowMs;
}

// Lazily required to avoid a circular require between routes.js and
// this worker - both need the same scan-running logic.
let runScanForTarget = null;

// Guard against overlapping ticks in THIS process: if a tick runs longer
// than CHECK_INTERVAL_MS, the next interval fire is skipped instead of
// re-reading the same rows and scanning them again. (The per-row DB claim
// below also protects against multiple instances / overlap.)
let running = false;

// Returns the set of user_ids (from the given list) whose profile is banned,
// so the scheduler never runs scans on a banned user's behalf.
async function fetchBannedUserIds(db, userIds) {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return new Set();
  const { data, error } = await db
    .from('profiles')
    .select('id')
    .in('id', unique)
    .eq('is_banned', true);
  if (error) {
    console.error('[AlexRecon Scheduler] banned-user lookup failed:', error.message);
    return new Set(); // fail safe-ish: don't crash the tick
  }
  return new Set((data || []).map(r => r.id));
}

// Atomically claim a due schedule by stamping last_run_at BEFORE scanning,
// only if it still looks due (null or older than its frequency window).
// A single conditional UPDATE ... RETURNING means two overlapping ticks (or
// two instances) can never both claim the same row. Returns true if claimed.
async function claimSchedule(db, schedule) {
  const windowMs = FREQUENCY_MS[schedule.frequency] || FREQUENCY_MS.weekly;
  const cutoffIso = new Date(Date.now() - windowMs).toISOString();
  const nowIso = new Date().toISOString();
  const { data, error } = await db
    .from('alexrecon_schedules')
    .update({ last_run_at: nowIso })
    .eq('id', schedule.id)
    .eq('is_active', true)
    .or(`last_run_at.is.null,last_run_at.lt.${cutoffIso}`)
    .select('id');
  if (error) {
    console.error(`[AlexRecon Scheduler] claim failed for ${schedule.id}:`, error.message);
    return false;
  }
  return Array.isArray(data) && data.length > 0;
}

// Is AlexRecon currently enabled in the admin panel? Scheduled scans must
// honour the same kill switch as manual scans.
async function toolEnabled(db) {
  try {
    const { data, error } = await db
      .from('tool_settings')
      .select('is_enabled')
      .eq('tool_key', 'alexrecon')
      .single();
    if (error || !data) return true; // no row yet -> fail open, same as checkToolEnabled
    return data.is_enabled !== false;
  } catch (e) {
    return true; // fail open on a Supabase hiccup
  }
}

function startAlexReconScheduler(getSupabaseAdmin, runScanFn) {
  runScanForTarget = runScanFn;

  async function tick() {
    const db = getSupabaseAdmin();
    if (!db) return; // scheduler is a no-op if Supabase isn't configured

    if (running) {
      console.log('[AlexRecon Scheduler] previous tick still running, skipping this one');
      return;
    }
    running = true;
    try {
      // Respect the admin enable/disable switch.
      if (!(await toolEnabled(db))) {
        console.log('[AlexRecon Scheduler] alexrecon is disabled, skipping tick');
        return;
      }

      const { data: schedules, error } = await db
        .from('alexrecon_schedules')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('[AlexRecon Scheduler] fetch failed:', error.message);
        return;
      }

      const due = (schedules || []).filter(isDue).slice(0, MAX_SCHEDULES_PER_TICK);
      if (!due.length) return;

      const banned = await fetchBannedUserIds(db, due.map(s => s.user_id));

      console.log(`[AlexRecon Scheduler] ${due.length} due schedule(s) this tick`);

      for (const schedule of due) {
        // Skip banned users entirely (don't even claim their rows).
        if (banned.has(schedule.user_id)) {
          console.log(`[AlexRecon Scheduler] skipping banned user ${schedule.user_id}`);
          continue;
        }

        // Claim first (stamp last_run_at). If another tick/instance already
        // took it, skip without scanning.
        const claimed = await claimSchedule(db, schedule);
        if (!claimed) continue;

        try {
          await withTimeout(
            runScanForTarget({
              target: schedule.target,
              userId: schedule.user_id,
              projectId: null,
              triggeredBy: 'schedule',
              scheduleId: schedule.id
            }),
            SCAN_DEADLINE_MS,
            `Scheduled scan for ${schedule.target}`
          );
        } catch (scanErr) {
          // Row is already stamped (claimed), so a persistently broken or
          // slow target is not retried until its next window - no storm.
          console.error(`[AlexRecon Scheduler] scan failed for ${schedule.target}:`, scanErr.message);
        }
      }
    } catch (err) {
      console.error('[AlexRecon Scheduler] tick failed:', err.message);
    } finally {
      running = false;
    }
  }

  // Run once shortly after boot, then on the fixed interval.
  setTimeout(tick, 30 * 1000);
  setInterval(tick, CHECK_INTERVAL_MS);

  console.log(`[AlexRecon Scheduler] started, checking every ${CHECK_INTERVAL_MS / 60000} minutes`);

  // Returned so tests can drive a tick directly; Express ignores this.
  return tick;
}

module.exports = { startAlexReconScheduler, isDue, FREQUENCY_MS };
