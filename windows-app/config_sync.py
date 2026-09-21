"""
AlexSync — Supabase sync module.

Handles authenticating the desktop app as the logged-in user, and
fetching their saved schedule (wake time, days, platform, genre) from
the alexsync_schedules table via the get_alexsync_schedule() RPC.

Auth approach: rather than reimplementing Supabase's full auth flow in
Python, this app expects the user to log in once via email + password
(the same credentials they use on the website). We use Supabase's
password grant token endpoint directly, then cache the refresh token
locally so the user doesn't have to log in every time the app starts.

This keeps things simple for Phase 1. A nicer "pairing code" flow
(generate a short code on the website, enter it here) is a reasonable
future improvement, but it requires an extra backend endpoint that
doesn't exist yet.
"""

import json
import os
import time
import requests

# ── Config ──────────────────────────────────────────────────────
# These match js/config.js on the website. The anon key is safe to
# ship in a desktop app the same way it's safe in browser JS — it only
# grants what the RLS policies on the Supabase tables allow, which for
# alexsync_schedules is "your own row only".
SUPABASE_URL = "https://rwjwjltlfkxadywfqxbs.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3andqbHRsZmt4YWR5d2ZxeGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMTY5MzgsImV4cCI6MjA5ODY5MjkzOH0.y_VTm74AdRjejT5b5cHkirctKqbkixrYY4pP4WOG_KM"

APP_DATA_DIR = os.path.join(os.environ.get("APPDATA", os.path.expanduser("~")), "AlexSync")
SESSION_FILE = os.path.join(APP_DATA_DIR, "session.json")
SCHEDULE_CACHE_FILE = os.path.join(APP_DATA_DIR, "schedule_cache.json")


def _ensure_app_data_dir():
    os.makedirs(APP_DATA_DIR, exist_ok=True)


def _save_session(session):
    _ensure_app_data_dir()
    with open(SESSION_FILE, "w") as f:
        json.dump(session, f)


def _load_session():
    if not os.path.exists(SESSION_FILE):
        return None
    try:
        with open(SESSION_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def login(email, password):
    """
    Logs in with email/password against Supabase's password grant
    endpoint. Returns True on success, False on failure. Saves the
    session (access + refresh token) locally on success.
    """
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"}
    body = {"email": email, "password": password}

    try:
        resp = requests.post(url, headers=headers, json=body, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        session = {
            "access_token": data["access_token"],
            "refresh_token": data["refresh_token"],
            "user_id": data["user"]["id"],
            "expires_at": time.time() + data.get("expires_in", 3600),
        }
        _save_session(session)
        return True
    except (requests.RequestException, KeyError) as e:
        print(f"[AlexSync] Login failed: {e}")
        return False


def _refresh_access_token(session):
    """Uses the refresh token to get a new access token when the old one expires."""
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=refresh_token"
    headers = {"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"}
    body = {"refresh_token": session["refresh_token"]}

    try:
        resp = requests.post(url, headers=headers, json=body, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        session["access_token"] = data["access_token"]
        session["refresh_token"] = data["refresh_token"]
        session["expires_at"] = time.time() + data.get("expires_in", 3600)
        _save_session(session)
        return session
    except (requests.RequestException, KeyError) as e:
        print(f"[AlexSync] Token refresh failed: {e}")
        return None


def get_valid_session():
    """Returns a session dict with a valid access token, refreshing if needed.
    Returns None if there's no saved session or refresh fails (user must log in again)."""
    session = _load_session()
    if not session:
        return None
    if time.time() >= session.get("expires_at", 0) - 60:  # refresh a bit early
        session = _refresh_access_token(session)
    return session


def is_logged_in():
    return get_valid_session() is not None


def logout():
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)


def fetch_schedule():
    """
    Calls the get_alexsync_schedule() RPC to fetch the current user's
    saved schedule. Returns a dict like:
      { "wake_time": "22:30:00", "days_of_week": [1,2,3,4,5],
        "platform": "youtube", "genre": "bollywood", "pc_state": "sleep",
        "mac_address": None, "is_active": True }
    or None if no schedule is saved yet, or the request fails (in which
    case the last cached copy is returned instead, so the app can keep
    working offline for a bit).
    """
    session = get_valid_session()
    if not session:
        print("[AlexSync] Not logged in, cannot fetch schedule.")
        return _load_cached_schedule()

    url = f"{SUPABASE_URL}/rest/v1/rpc/get_alexsync_schedule"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {session['access_token']}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(url, headers=headers, json={}, timeout=15)
        resp.raise_for_status()
        rows = resp.json()
        if not rows:
            return None
        schedule = rows[0]
        _cache_schedule(schedule)
        return schedule
    except requests.RequestException as e:
        print(f"[AlexSync] Could not fetch schedule from server, using cache: {e}")
        return _load_cached_schedule()


def _cache_schedule(schedule):
    _ensure_app_data_dir()
    with open(SCHEDULE_CACHE_FILE, "w") as f:
        json.dump(schedule, f)


def _load_cached_schedule():
    if not os.path.exists(SCHEDULE_CACHE_FILE):
        return None
    try:
        with open(SCHEDULE_CACHE_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def check_access():
    """
    Calls get_alexsync_access() to check whether the user currently has
    paid access. Returns (has_access: bool, paid_until: str | None).
    Defaults to (False, None) on any failure — fail closed, not open.
    """
    session = get_valid_session()
    if not session:
        return False, None

    url = f"{SUPABASE_URL}/rest/v1/rpc/get_alexsync_access"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {session['access_token']}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(url, headers=headers, json={}, timeout=15)
        resp.raise_for_status()
        rows = resp.json()
        if not rows:
            return False, None
        row = rows[0]
        return bool(row.get("has_access")), row.get("paid_until")
    except requests.RequestException as e:
        print(f"[AlexSync] Could not check access: {e}")
        return False, None


def sync_detected_apps(detected_apps):
    """
    Sends the list of detected installed apps (from app_detect.py) to
    Supabase via the save_detected_apps() RPC, so the website's App
    dropdown can show only what's actually installed on this PC.
    Returns True on success, False on failure (logged, not raised —
    a failed sync here shouldn't crash the rest of the app).
    """
    session = get_valid_session()
    if not session:
        return False

    url = f"{SUPABASE_URL}/rest/v1/rpc/save_detected_apps"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {session['access_token']}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(url, headers=headers, json={"p_detected_apps": detected_apps}, timeout=15)
        resp.raise_for_status()
        return True
    except requests.RequestException as e:
        print(f"[AlexSync] Could not sync detected apps: {e}")
        return False
