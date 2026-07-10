"""
AlexSync — System tray application (Phase 1).

Shows a tray icon so the user knows the app is running in the
background. Menu options:
  - Status (shows sync/access state, disabled — just a label)
  - Sync Now (manually re-fetch the schedule from Supabase)
  - Open AlexSync on the website (for managing the schedule/payment)
  - Quit

The actual schedule-syncing and Task Scheduler updates happen in the
background on a timer, not just when the user clicks "Sync Now" — that
button exists for convenience/reassurance, not as the only trigger.
"""

import threading
import time
import sys
import os
import webbrowser
import pystray
from PIL import Image

import config_sync
import scheduler
import app_detect

SYNC_INTERVAL_SECONDS = 15 * 60  # re-check the schedule every 15 minutes
ALEXSYNC_WEB_URL = "https://alexcyber.onrender.com/tools/alexsync"

_icon = None
_last_sync_status = "Starting..."


def _resource_path(filename):
    """
    Returns the correct path to a bundled resource (like tray_icon.png)
    whether running as a normal .py script or as a PyInstaller-built
    .exe. PyInstaller unpacks bundled data files into a temporary
    folder at runtime and exposes its path via sys._MEIPASS; when not
    running as a bundle, that attribute doesn't exist, so we just use
    the script's own folder instead.
    """
    base_path = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, filename)


def _sync_schedule_once():
    """
    Fetches the latest schedule + access status from Supabase and
    updates the local Task Scheduler entry accordingly. Runs both at
    startup and on the periodic timer.
    """
    global _last_sync_status

    if not config_sync.is_logged_in():
        _last_sync_status = "Not logged in"
        _update_menu()
        return

    # Report installed apps regardless of access/schedule state — this
    # is cheap, doesn't need paid access, and means the website's App
    # dropdown is populated as soon as the background app has run once,
    # even before the user has set up a schedule or paid.
    try:
        detected = app_detect.detect_installed_apps()
        config_sync.sync_detected_apps(detected)
    except Exception as e:
        print(f"[AlexSync] App detection failed (non-fatal): {e}")

    has_access, _paid_until = config_sync.check_access()
    if not has_access:
        _last_sync_status = "No active access — renew on the website"
        scheduler.remove_task()  # don't keep waking the PC if access lapsed
        _update_menu()
        return

    schedule = config_sync.fetch_schedule()
    if not schedule or not schedule.get("is_active", True):
        _last_sync_status = "No active schedule set"
        scheduler.remove_task()
        _update_menu()
        return

    wake_time = schedule["wake_time"][:5]  # "22:30:00" -> "22:30"
    days = schedule["days_of_week"]
    scheduler.create_or_update_task(wake_time, days)
    _last_sync_status = f"Active — wakes at {wake_time}"
    _update_menu()


def _background_sync_loop():
    while True:
        _sync_schedule_once()
        time.sleep(SYNC_INTERVAL_SECONDS)


def _on_sync_now(icon, item):
    threading.Thread(target=_sync_schedule_once, daemon=True).start()


def _on_open_website(icon, item):
    webbrowser.open(ALEXSYNC_WEB_URL)


def _on_quit(icon, item):
    icon.stop()


def _update_menu():
    global _icon
    if _icon:
        _icon.menu = _build_menu()
        _icon.update_menu()


def _build_menu():
    return pystray.Menu(
        pystray.MenuItem(f"Status: {_last_sync_status}", None, enabled=False),
        pystray.MenuItem("Sync Now", _on_sync_now),
        pystray.MenuItem("Manage Schedule (opens website)", _on_open_website),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("Quit AlexSync", _on_quit),
    )


def run():
    global _icon
    image = Image.open(_resource_path("tray_icon.png"))
    _icon = pystray.Icon("AlexSync", image, "AlexSync", menu=_build_menu())

    # Start the background sync loop in a separate thread so the tray
    # icon's own event loop (icon.run(), which blocks) isn't blocked by it.
    sync_thread = threading.Thread(target=_background_sync_loop, daemon=True)
    sync_thread.start()

    _icon.run()  # blocks until Quit is clicked
