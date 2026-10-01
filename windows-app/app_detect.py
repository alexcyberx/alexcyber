"""
AlexSync — Installed app detection (Phase 1.5).

Scans the user's Windows PC for commonly installed music/media apps,
so the website's "App" dropdown can show only apps that are actually
present, instead of a generic hardcoded list.

Detection approach: check the Windows registry's "Uninstall" keys,
which almost every installed Windows application registers itself
under (this is how "Add or Remove Programs" itself finds installed
apps — it's the standard, reliable way to do this, much more so than
guessing file paths). We match registry entries by a set of known name
patterns per app.

This intentionally only looks for a curated list of apps relevant to
AlexSync (music/media players), not every installed program.
"""

import winreg

# Each entry: the value we send to Supabase/the website, and a list of
# substrings to match against installed program display names
# (case-insensitive). Add more apps here over time as needed.
KNOWN_APPS = [
    {"value": "spotify",       "label": "Spotify",       "match": ["spotify"]},
    {"value": "vlc",           "label": "VLC",            "match": ["vlc media player"]},
    {"value": "itunes",        "label": "iTunes",         "match": ["itunes"]},
    {"value": "windows_media", "label": "Windows Media Player", "match": ["windows media player"]},
    {"value": "foobar2000",    "label": "foobar2000",     "match": ["foobar2000"]},
    {"value": "musicbee",      "label": "MusicBee",       "match": ["musicbee"]},
    {"value": "winamp",        "label": "Winamp",         "match": ["winamp"]},
]

# YouTube isn't a Windows "installed program" — it's a website. It's
# always offered regardless of what's detected, since every PC with a
# browser can use it, and AlexSync's own music-trigger already
# supports it directly (see music_trigger.py).
ALWAYS_AVAILABLE = [
    {"value": "youtube", "label": "YouTube"},
]

# The two registry locations that cover both 64-bit and 32-bit
# installed-program entries on a 64-bit Windows install.
UNINSTALL_KEYS = [
    (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
    (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
    (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
]


def _get_installed_display_names():
    """Returns a list of all installed program display names found in the registry."""
    names = []
    for hive, path in UNINSTALL_KEYS:
        try:
            key = winreg.OpenKey(hive, path)
        except FileNotFoundError:
            continue

        try:
            i = 0
            while True:
                try:
                    subkey_name = winreg.EnumKey(key, i)
                    i += 1
                except OSError:
                    break  # no more subkeys

                try:
                    subkey = winreg.OpenKey(key, subkey_name)
                    display_name, _ = winreg.QueryValueEx(subkey, "DisplayName")
                    names.append(display_name)
                    winreg.CloseKey(subkey)
                except (FileNotFoundError, OSError):
                    continue  # this entry has no DisplayName, skip it
        finally:
            winreg.CloseKey(key)

    return names


def detect_installed_apps():
    """
    Returns a list of {"value": ..., "label": ...} dicts for every
    known app that appears to be installed, plus the always-available
    ones (YouTube). This is what gets synced to Supabase and shown in
    the website's App dropdown.
    """
    try:
        installed_names = [n.lower() for n in _get_installed_display_names()]
    except Exception as e:
        print(f"[AlexSync] Could not scan installed programs: {e}")
        installed_names = []

    detected = []
    for app in KNOWN_APPS:
        if any(any(pattern in name for name in installed_names) for pattern in app["match"]):
            detected.append({"value": app["value"], "label": app["label"]})

    return ALWAYS_AVAILABLE + detected
