"""
AlexSync — Main entry point.

Two modes this can run in:

1. Normal startup (no arguments): shows the login window if needed,
   then starts the system tray app which keeps the schedule synced in
   the background.

2. `--trigger-music` (called by Task Scheduler when the PC wakes at
   the scheduled time): fetches the current schedule and plays the
   music for the saved genre/platform, then exits immediately. Does
   NOT start the tray app again — Windows would end up with duplicate
   tray icons if the scheduled wake also launched a full second
   instance of the background app.
"""

import sys
import config_sync
import music_trigger
import login_window
import tray_app


def _handle_trigger_music():
    """Runs when Task Scheduler wakes the PC and re-launches this app."""
    if not config_sync.is_logged_in():
        print("[AlexSync] Wake triggered but not logged in — cannot fetch schedule. Exiting.")
        return

    has_access, _ = config_sync.check_access()
    if not has_access:
        print("[AlexSync] Wake triggered but access has expired — skipping music.")
        return

    schedule = config_sync.fetch_schedule()
    if not schedule or not schedule.get("is_active", True):
        print("[AlexSync] Wake triggered but no active schedule found — skipping music.")
        return

    music_trigger.play_for_genre(schedule.get("genre", "lofi"), schedule.get("platform", "youtube"))


def _handle_normal_startup():
    if not config_sync.is_logged_in():
        logged_in = login_window.show_login_window()
        if not logged_in:
            print("[AlexSync] Login window closed without logging in. Exiting.")
            return

    tray_app.run()


def main():
    if "--trigger-music" in sys.argv:
        _handle_trigger_music()
    else:
        _handle_normal_startup()


if __name__ == "__main__":
    main()
