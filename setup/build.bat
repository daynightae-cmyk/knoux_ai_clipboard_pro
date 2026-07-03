@echo off
REM ============================================
REM Knoux Clipboard AI - Installer Builder
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo Knoux Clipboard AI v1.0.0 - Setup Builder
echo ============================================
echo.

REM Check if NSIS is installed
set NSIS_PATH=C:\Program Files (x86)\NSIS\makensis.exe

if not exist "%NSIS_PATH%" (
    echo.
    echo ERROR: NSIS is not installed!
    echo.
    echo Please download and install NSIS from:
    echo https://nsis.sourceforge.io/Main_Page
    echo.
    pause
    exit /b 1
)

REM Create release directory
if not exist "..\release" mkdir ..\release
cd /d %~dp0

REM Build the installer
echo.
echo Building installer...
echo.

"%NSIS_PATH%" /V3 /D_OUTDIR=..\release knoux.nsi

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS! Installer created:
    echo ..\release\Knoux-Clipboard-AI-Setup-v1.0.0.exe
    echo ============================================
    echo.
    pause
) else (
    echo.
    echo ERROR: Failed to build installer!
    echo.
    pause
    exit /b 1
)
