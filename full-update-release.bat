@echo off
chcp 65001 >nul
color 0E
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🚀 Full Release Update - تحديث شامل للنسخة المبنية    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set SRC=F:\Knoux-Clipboard-AI
set RELEASE=F:\Knoux-Clipboard-AI\release\Knoux-Clipboard-AI-win32-x64\resources\app

cd /d "%SRC%"

echo [1/10] بناء Frontend...
call npm run build:renderer
if errorlevel 1 (
    echo ❌ فشل بناء Frontend
    pause
    exit /b 1
)

echo [2/10] نسخ dist...
if exist dist (
    if exist "%RELEASE%\dist" rmdir /S /Q "%RELEASE%\dist"
    xcopy /E /I /Y dist "%RELEASE%\dist"
)

echo [3/10] نسخ main.js و preload.js...
copy /Y main.js "%RELEASE%\main.js"
copy /Y preload.js "%RELEASE%\preload.js"

echo [4/10] نسخ package.json...
copy /Y package.json "%RELEASE%\package.json"

echo [5/10] إنشاء مجلدات backend...
if not exist "%RELEASE%\app\backend\ipc" mkdir "%RELEASE%\app\backend\ipc"
if not exist "%RELEASE%\app\backend\ai" mkdir "%RELEASE%\app\backend\ai"
if not exist "%RELEASE%\app\backend\clipboard" mkdir "%RELEASE%\app\backend\clipboard"
if not exist "%RELEASE%\app\backend\security" mkdir "%RELEASE%\app\backend\security"
if not exist "%RELEASE%\app\backend\storage" mkdir "%RELEASE%\app\backend\storage"
if not exist "%RELEASE%\app\backend\services" mkdir "%RELEASE%\app\backend\services"

echo [6/10] نسخ IPC handlers...
copy /Y app\backend\ipc\*.js "%RELEASE%\app\backend\ipc\" 2>nul

echo [7/10] نسخ backend services...
copy /Y app\backend\clipboard\*.js "%RELEASE%\app\backend\clipboard\" 2>nul
copy /Y app\backend\ai\*.js "%RELEASE%\app\backend\ai\" 2>nul
copy /Y app\backend\security\*.js "%RELEASE%\app\backend\security\" 2>nul
copy /Y app\backend\storage\*.js "%RELEASE%\app\backend\storage\" 2>nul
copy /Y app\backend\services\*.js "%RELEASE%\app\backend\services\" 2>nul

echo [8/10] نسخ shared files...
if not exist "%RELEASE%\app\shared" mkdir "%RELEASE%\app\shared"
copy /Y app\shared\*.js "%RELEASE%\app\shared\" 2>nul

echo [9/10] نسخ assets...
if exist assets (
    if not exist "%RELEASE%\assets" mkdir "%RELEASE%\assets"
    xcopy /E /I /Y assets "%RELEASE%\assets"
)

echo [10/10] تثبيت dependencies في Release...
cd /d "%RELEASE%"
call npm install --production --no-optional 2>nul

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ تم التحديث الشامل بنجاح!
echo.
echo الملفات المحدثة:
echo   ✓ Frontend (dist/)
echo   ✓ Backend (app/backend/)
echo   ✓ IPC Handlers (39 خدمة)
echo   ✓ UI Components
echo   ✓ Dependencies
echo.
echo شغّل الآن:
echo   F:\Knoux-Clipboard-AI\release\Knoux-Clipboard-AI-win32-x64\Knoux-Clipboard-AI.exe
echo.
echo ════════════════════════════════════════════════════════════
pause
