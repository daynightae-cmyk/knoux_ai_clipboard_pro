@echo off
REM Quick start script for Knoux Clipboard AI (Windows)

echo.
echo ====================================
echo  Knoux Clipboard AI v1.0.0
echo ====================================
echo.

REM Check if EXE exists
if exist "Knoux-Clipboard-AI-FIXED.exe" (
    echo [OK] Found executable
    echo.
    echo Starting application...
    echo.

    REM Run the EXE
    start "" "Knoux-Clipboard-AI-FIXED.exe"

    echo [OK] Application launched
    echo.
    echo The app will open in your system tray.
    echo Click the tray icon to access features.
    echo.
) else (
    echo [ERROR] Knoux-Clipboard-AI-FIXED.exe not found!
    echo.
    echo Please ensure you are in the correct directory:
    echo   F:\Knoux-Clipboard-AI\
    echo.
    pause
    exit /b 1
)
