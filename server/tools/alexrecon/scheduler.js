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

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

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

function startAlexReconScheduler(getSupabaseAdmin, runScanFn) {
  runScanForTarget = runScanFn;

  async function tick() {
    const db = getSupabaseAdmin();
    if (!db) return; // scheduler is a no-op if Supabase isn't configured

    try {
      const { data: schedules, error } = await db
        .from('alexrecon_schedules')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('[AlexRecon Scheduler] fetch failed:', error.message);
        return;
      }

      const due = (schedules || []).filter(isDue);
      if (!due.length) return;

      console.log(`[AlexRecon Scheduler] running ${due.length} due schedule(s)`);

      for (const schedule of due) {
        try {
          await runScanForTarget({
            target: schedule.target,
            userId: schedule.user_id,
            projectId: null,
            triggeredBy: 'schedule',
            scheduleId: schedule.id
          });

          await db
            .from('alexrecon_schedules')
            .update({ last_run_at: new Date().toISOString() })
            .eq('id', schedule.id);
        } catch (scanErr) {
          console.error(`[AlexRecon Scheduler] scan failed for ${schedule.target}:`, scanErr.message);
          // Still stamp last_run_at so a persistently broken target
          // does not get retried every 15 minutes indefinitely.
          await db
            .from('alexrecon_schedules')
            .update({ last_run_at: new Date().toISOString() })
            .eq('id', schedule.id);
        }
      }
    } catch (err) {
      console.error('[AlexRecon Scheduler] tick failed:', err.message);
    }
  }

  // Run once shortly after boot, then on the fixed interval.
  setTimeout(tick, 30 * 1000);
  setInterval(tick, CHECK_INTERVAL_MS);

  console.log(`[AlexRecon Scheduler] started, checking every ${CHECK_INTERVAL_MS / 60000} minutes`);
}

module.exports = { startAlexReconScheduler, isDue, FREQUENCY_MS };
