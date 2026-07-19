"""
AlexSync — Windows Task Scheduler integration.

Creates/updates a scheduled task that:
  1. Wakes the PC at the user's chosen time (works from Sleep/Hibernate —
     this is Phase 1's scope; full Shutdown + Wake-on-LAN is Phase 2).
  2. Runs this same app with a `--trigger-music` flag when it wakes,
     so the music-playing logic runs automatically.

Uses the Windows Task Scheduler COM API via pywin32, which is the
standard, supported way to do this from Python — no need to shell out
to schtasks.exe and parse text output.
"""

import sys
import os
import win32com.client

TASK_NAME = "AlexSync_WakeAndPlay"
TASK_FOLDER = "\\"  # root folder; keeps things simple for Phase 1


def _get_task_service():
    scheduler = win32com.client.Dispatch("Schedule.Service")
    scheduler.Connect()
    return scheduler


def create_or_update_task(wake_time_str, days_of_week):
    """
    wake_time_str: "HH:MM" (24-hour), e.g. "22:30"
    days_of_week: list of ints, 0=Sunday .. 6=Saturday (matches the
                  alexsync_schedules.days_of_week column convention)

    Creates a Task Scheduler task that wakes the PC and re-launches this
    app with --trigger-music at the given time, on the given days.
    """
    hour, minute = map(int, wake_time_str.split(":")[:2])

    scheduler = _get_task_service()
    root_folder = scheduler.GetFolder(TASK_FOLDER)

    task_def = scheduler.NewTask(0)

    # ── Registration info ──
    task_def.RegistrationInfo.Description = "AlexSync: wakes the PC and starts music at the scheduled time."
    task_def.RegistrationInfo.Author = "AlexSync"

    # ── Settings ──
    settings = task_def.Settings
    settings.Enabled = True
    settings.WakeToRun = True          # this is the key flag — wakes PC from sleep/hibernate
    settings.StartWhenAvailable = True  # if the PC was off at trigger time, run ASAP once it's on
    settings.DisallowStartIfOnBatteries = False
    settings.StopIfGoingOnBatteries = False

    # ── Trigger: weekly, on the selected days, at the given time ──
    TASK_TRIGGER_WEEKLY = 3
    trigger = task_def.Triggers.Create(TASK_TRIGGER_WEEKLY)
    trigger.StartBoundary = _next_start_boundary(hour, minute)
    trigger.DaysOfWeek = _days_to_bitmask(days_of_week)
    trigger.WeeksInterval = 1
    trigger.Enabled = True

    # ── Action: re-launch this app with --trigger-music ──
    TASK_ACTION_EXEC = 0
    action = task_def.Actions.Create(TASK_ACTION_EXEC)
    exe_path = sys.executable  # when frozen with PyInstaller, this is the .exe itself
    action.Path = exe_path
    action.Arguments = "--trigger-music"

    # ── Principal: run whether or not the user is logged in isn't
    # necessary here since we WANT it to only run in the user's own
    # session (so it can open their browser) — run as the current user,
    # interactive.
    TASK_LOGON_INTERACTIVE_TOKEN = 3
    task_def.Principal.LogonType = TASK_LOGON_INTERACTIVE_TOKEN

    # ── Register (create or overwrite existing task of the same name) ──
    TASK_CREATE_OR_UPDATE = 6
    root_folder.RegisterTaskDefinition(
        TASK_NAME,
        task_def,
        TASK_CREATE_OR_UPDATE,
        "",  # no explicit user — uses current user via interactive token
        "",
        TASK_LOGON_INTERACTIVE_TOKEN
    )
    print(f"[AlexSync] Task Scheduler entry created/updated: wake at {wake_time_str} on days {days_of_week}")


def remove_task():
    """Removes the AlexSync task, e.g. if the user pauses/deletes their schedule."""
    try:
        scheduler = _get_task_service()
        root_folder = scheduler.GetFolder(TASK_FOLDER)
        root_folder.DeleteTask(TASK_NAME, 0)
        print("[AlexSync] Task Scheduler entry removed.")
    except Exception as e:
        # Task might not exist yet — that's fine, nothing to remove.
        print(f"[AlexSync] Could not remove task (may not exist): {e}")


def _days_to_bitmask(days_of_week):
    """
    Task Scheduler's DaysOfWeek trigger property is a bitmask:
    Sunday=1, Monday=2, Tuesday=4, Wednesday=8, Thursday=16, Friday=32, Saturday=64
    Our days_of_week list uses 0=Sunday..6=Saturday, matching the DB column.
    """
    bitmask = 0
    for day in days_of_week:
        bitmask |= (1 << day)
    return bitmask


def _next_start_boundary(hour, minute):
    """
    Task Scheduler needs an ISO 8601 StartBoundary timestamp even for a
    recurring weekly trigger — it uses this as the time-of-day and the
    reference point for the recurrence, not a one-off date. We just need
    any date/time with the right hour:minute; today at that time is fine.
    """
    import datetime
    now = datetime.datetime.now()
    start = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    return start.strftime("%Y-%m-%dT%H:%M:%S")
