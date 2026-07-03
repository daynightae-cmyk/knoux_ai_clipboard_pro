@echo off
chcp 65001 >nul
color 0B
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║        🔄 Update Release - تحديث النسخة المبنية          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set RELEASE_DIR=F:\Knoux-Clipboard-AI\release\Knoux-Clipboard-AI-win32-x64\resources\app

echo [1/6] نسخ main.js الجديد...
copy /Y main.js "%RELEASE_DIR%\main.js"

echo [2/6] نسخ preload.js الجديد...
copy /Y preload.js "%RELEASE_DIR%\preload.js"

echo [3/6] نسخ IPC handlers الجديدة...
if not exist "%RELEASE_DIR%\app\backend\ipc" mkdir "%RELEASE_DIR%\app\backend\ipc"
copy /Y app\backend\ipc\test-ipc.js "%RELEASE_DIR%\app\backend\ipc\"
copy /Y app\backend\ipc\ai-services-ipc.js "%RELEASE_DIR%\app\backend\ipc\"
copy /Y app\backend\ipc\comprehensive-ipc.js "%RELEASE_DIR%\app\backend\ipc\"
copy /Y app\backend\ipc\unified-service-ipc.js "%RELEASE_DIR%\app\backend\ipc\"

echo [4/6] نسخ UI components الجديدة...
if not exist "%RELEASE_DIR%\app\renderer\components" mkdir "%RELEASE_DIR%\app\renderer\components"
copy /Y app\renderer\components\ServiceTester.tsx "%RELEASE_DIR%\app\renderer\components\"
copy /Y app\renderer\components\MainDashboard.tsx "%RELEASE_DIR%\app\renderer\components\"

echo [5/6] بناء frontend جديد...
call npm run build:renderer
if exist dist (
    xcopy /E /I /Y dist "%RELEASE_DIR%\dist"
)

echo [6/6] نسخ package.json...
copy /Y package.json "%RELEASE_DIR%\package.json"

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ تم التحديث بنجاح!
echo.
echo الخدمات الجديدة:
echo   • 7 AI Core Services
echo   • 32 خدمة أخرى
echo   • Service Tester UI
echo   • MainDashboard محدث
echo.
echo شغّل الآن:
echo   "%RELEASE_DIR%\..\Knoux-Clipboard-AI.exe"
echo.
echo ════════════════════════════════════════════════════════════
pause
