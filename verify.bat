@echo off
chcp 65001 >nul
echo.
echo ════════════════════════════════════════
echo    🔍 فحص سريع للملفات المهمة
echo ════════════════════════════════════════
echo.

set OK=0
set FAIL=0

echo [Checking Files...]
echo.

if exist "preload.js" (
    echo ✅ preload.js
    set /a OK+=1
) else (
    echo ❌ preload.js
    set /a FAIL+=1
)

if exist "main.js" (
    echo ✅ main.js
    set /a OK+=1
) else (
    echo ❌ main.js
    set /a FAIL+=1
)

if exist "app\backend\ipc\test-ipc.js" (
    echo ✅ test-ipc.js
    set /a OK+=1
) else (
    echo ❌ test-ipc.js
    set /a FAIL+=1
)

if exist "app\renderer\components\ServiceTester.tsx" (
    echo ✅ ServiceTester.tsx
    set /a OK+=1
) else (
    echo ❌ ServiceTester.tsx
    set /a FAIL+=1
)

if exist "app\renderer\components\MainDashboard.tsx" (
    echo ✅ MainDashboard.tsx
    set /a OK+=1
) else (
    echo ❌ MainDashboard.tsx
    set /a FAIL+=1
)

if exist "package.json" (
    echo ✅ package.json
    set /a OK+=1
) else (
    echo ❌ package.json
    set /a FAIL+=1
)

echo.
echo ════════════════════════════════════════
echo النتيجة: %OK% ✅  |  %FAIL% ❌
echo ════════════════════════════════════════
echo.

if %FAIL% GTR 0 (
    color 0C
    echo ⚠️  يوجد ملفات ناقصة!
) else (
    color 0A
    echo ✅ جميع الملفات موجودة!
    echo.
    echo للتشغيل استخدم:
    echo    test.bat
)

echo.
pause
