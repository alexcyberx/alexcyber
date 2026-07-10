@echo off
REM ═══════════════════════════════════════════════════════════
REM AlexSync — One-click build script
REM
REM Double-click this file on a Windows PC (with Python already
REM installed) to automatically:
REM   1. Install all required Python packages
REM   2. Install PyInstaller (the tool that builds the .exe)
REM   3. Build AlexSync.exe
REM
REM No typing any commands — just double-click and wait.
REM The finished file will appear in the "dist" folder as
REM AlexSync.exe, ready to share with users.
REM ═══════════════════════════════════════════════════════════

echo.
echo ================================
echo   AlexSync — Building .exe
echo ================================
echo.

echo Step 1 of 3: Installing required packages...
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo Something went wrong installing packages. Make sure Python is installed and try again.
    pause
    exit /b 1
)

echo.
echo Step 2 of 3: Installing PyInstaller...
pip install pyinstaller
if errorlevel 1 (
    echo.
    echo Something went wrong installing PyInstaller. Try again.
    pause
    exit /b 1
)

echo.
echo Step 3 of 3: Building AlexSync.exe (this can take a minute)...
pyinstaller --onefile --windowed --add-data "tray_icon.png;." --name AlexSync main.py
if errorlevel 1 (
    echo.
    echo Something went wrong building the .exe. Scroll up to see the error.
    pause
    exit /b 1
)

echo.
echo ================================
echo   Done!
echo ================================
echo Your file is ready at: dist\AlexSync.exe
echo.
pause
