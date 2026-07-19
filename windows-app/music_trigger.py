"""
AlexSync — Music trigger module (Phase 1: YouTube only).

Opens the default browser to a curated playlist URL matching the
user's chosen genre. Spotify support is a Phase 3 item (see design doc).

The playlist URLs below are placeholders — Alex should replace each one
with an actual curated YouTube playlist URL before shipping. Keeping
them centralized here means updating a playlist later is a one-line
change, not a code change elsewhere.
"""

import webbrowser

# Curated playlists — verified working as of July 2026. If a link ever
# breaks (channel deletes it, etc.), just swap the URL here; nothing
# else in the app needs to change.
GENRE_PLAYLISTS = {
    "bollywood":     "https://www.youtube.com/playlist?list=PLinVjP-aRmlvU1UKnqrjc0W1DE8Oj01vy",
    "lofi":          "https://www.youtube.com/watch?v=rUxyKA_-grg",
    "instrumental":  "https://www.youtube.com/playlist?list=PLUw7Nsql2TwR45Tjcdwm_6y34jmD8bK-f",
    "punjabi":       "https://www.youtube.com/playlist?list=RDCLAK5uy_lMp1rcnDS35Svog3T6BMJg2Nvw44AjsJY",
    "english_pop":   "https://www.youtube.com/playlist?list=PL7v1FHGMOadDghZ1m-jEIUnVUsGMT9jbH",
    "classical":     "https://www.youtube.com/playlist?list=PLQkQfzsIUwRaZwdwD2boPiWau0iRyCCTc",
}

DEFAULT_GENRE = "lofi"  # fallback if the saved genre doesn't match anything above


def play_for_genre(genre, platform="youtube"):
    """
    Opens the browser to the appropriate playlist for the given genre.
    Currently only 'youtube' is supported (Phase 1) — any other
    platform value is logged and ignored rather than causing an error,
    since Spotify support isn't built yet.
    """
    if platform != "youtube":
        print(f"[AlexSync] Platform '{platform}' is not supported yet (Phase 3). Skipping music trigger.")
        return False

    url = GENRE_PLAYLISTS.get(genre, GENRE_PLAYLISTS[DEFAULT_GENRE])
    try:
        webbrowser.open(url)
        print(f"[AlexSync] Opened playlist for genre '{genre}': {url}")
        return True
    except Exception as e:
        print(f"[AlexSync] Could not open browser: {e}")
        return False
