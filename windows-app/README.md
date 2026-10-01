# AlexSync — Windows Background App (Phase 1)

Phase 1 scope: works when the PC is left in **Sleep/Hibernate** (not fully
shut down). Wakes the PC at the scheduled time and opens a YouTube
playlist matching the user's saved genre. Full-shutdown support
(Wake-on-LAN + phone companion) is Phase 2, not built yet.

## What's in this folder

- `main.py` — entry point. Run this to start the app normally, or with
  `--trigger-music` (Task Scheduler calls it this way automatically).
- `config_sync.py` — logs in to Supabase, fetches the saved schedule
  and access status.
- `scheduler.py` — creates/updates the Windows Task Scheduler entry
  that wakes the PC.
- `music_trigger.py` — opens the right YouTube playlist for the user's genre.
- `tray_app.py` — the system tray icon and background sync loop.
- `login_window.py` — the one-time login window (tkinter).
- `tray_icon.png` — the tray icon image.
- `requirements.txt` — Python dependencies.

## Before running this for the first time

1. **Playlist URLs are already filled in** in `music_trigger.py` — one
   curated YouTube playlist per genre (bollywood, lofi, instrumental,
   punjabi, english_pop, classical), verified working as of July 2026.
   If a link ever breaks, just swap the URL for that genre; nothing
   else in the app needs to change.

2. **Install dependencies** (on a Windows machine, since `pywin32` is
   Windows-only and won't install on Mac/Linux):
   ```
   pip install -r requirements.txt
   ```

## Running it during development

```
python main.py
```

First run will show the login window (same email/password as the
website). After logging in, a tray icon appears — right-click it to
see status, force a sync, or quit.

To simulate what happens when Task Scheduler wakes the PC:
```
python main.py --trigger-music
```

## Building a distributable .exe

**Easiest way:** just double-click `build.bat` in this folder (on a
Windows PC with Python installed). It automatically installs all
dependencies, installs PyInstaller, and builds the .exe — no typing
any commands. When it finishes, the file is at `dist\AlexSync.exe`.

**Manual way** (if you'd rather run the steps yourself):
```
pip install -r requirements.txt
pip install pyinstaller
pyinstaller --onefile --windowed --add-data "tray_icon.png;." --name AlexSync main.py
```

- `--onefile` bundles everything into a single .exe.
- `--windowed` prevents a console window from popping up (this is a
  background/tray app, not a CLI tool).
- `--add-data "tray_icon.png;."` bundles the icon image alongside the
  code. `tray_app.py` already handles finding this correctly whether
  running as a script or as the built .exe (see `_resource_path()` in
  that file).

The built .exe will be in `dist/AlexSync.exe`. This is the file that
should eventually be hosted somewhere and linked from the "Download
for Windows" button on the AlexSync page on the website
(`handleAlexSyncDownload()` in `index.html` currently just shows an
alert as a placeholder — update it to link here once this .exe is
hosted somewhere).

**Important:** this build step (`build.bat` or the manual commands) is
something you (the developer) do once per release, on your own
machine, to produce the .exe. The people who download and use
AlexSync never install Python or run pip — they just download and
double-click the finished .exe, exactly like any other Windows
program.

## Known limitations / not-yet-built (tracked from the design doc)

- No Wake-on-LAN / full-shutdown support yet (Phase 2).
- No Spotify support yet (Phase 3) — `music_trigger.py` only handles
  YouTube; the platform check silently skips anything else.
- The app should probably be added to Windows startup (so it runs
  automatically after every reboot, re-establishing the login session
  and keeping the Task Scheduler entry in sync) — this isn't
  automated yet. For now this can be done manually by placing a
  shortcut to the .exe in the user's Startup folder
  (`shell:startup`), but building this into an installer is future work.
- No auto-update mechanism — if playlist URLs or logic change, users
  will need to download a new .exe manually.
