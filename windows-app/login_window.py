"""
AlexSync — Login window (Phase 1).

A minimal tkinter window asking for the same email/password the user
uses on the AlexCyberX website. On successful login, the session is
saved (see config_sync.py) and the window closes so the tray app can
start.

Kept deliberately simple — no fancy styling — since this is a one-time
setup step, not something the user will stare at often.
"""

import tkinter as tk
from tkinter import messagebox
import config_sync


def show_login_window():
    """
    Blocks until the user successfully logs in or closes the window.
    Returns True if login succeeded, False if the user closed the window.
    """
    result = {"success": False}

    root = tk.Tk()
    root.title("AlexSync — Log In")
    root.geometry("340x220")
    root.resizable(False, False)

    tk.Label(root, text="Log in to AlexSync", font=("Segoe UI", 13, "bold")).pack(pady=(18, 4))
    tk.Label(root, text="Use the same email and password as alexcyber.onrender.com", font=("Segoe UI", 8), fg="#666", wraplength=300).pack(pady=(0, 14))

    tk.Label(root, text="Email", anchor="w").pack(fill="x", padx=30)
    email_entry = tk.Entry(root, width=34)
    email_entry.pack(padx=30)

    tk.Label(root, text="Password", anchor="w").pack(fill="x", padx=30, pady=(8, 0))
    password_entry = tk.Entry(root, width=34, show="*")
    password_entry.pack(padx=30)

    status_label = tk.Label(root, text="", fg="#c00", font=("Segoe UI", 8))
    status_label.pack(pady=(6, 0))

    def attempt_login():
        email = email_entry.get().strip()
        password = password_entry.get()
        if not email or not password:
            status_label.config(text="Please enter both email and password.")
            return

        login_btn.config(state="disabled", text="Logging in...")
        root.update()

        success = config_sync.login(email, password)
        if success:
            result["success"] = True
            root.destroy()
        else:
            status_label.config(text="Login failed. Check your email and password.")
            login_btn.config(state="normal", text="Log In")

    login_btn = tk.Button(root, text="Log In", command=attempt_login, width=20)
    login_btn.pack(pady=14)

    root.bind("<Return>", lambda event: attempt_login())
    root.mainloop()

    return result["success"]
