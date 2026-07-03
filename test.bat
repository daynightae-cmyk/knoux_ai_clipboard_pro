@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          🧪 Knoux Services Test - اختبار الخدمات          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1] تثبيت المكتبات...
call npm install --silent
if errorlevel 1 (
    color 0C
    echo ❌ فشل تثبيت المكتبات
    pause
    exit /b 1
)

echo [2] بناء Backend...
if exist "tsconfig.json" (
    call npx tsc --project tsconfig.json --skipLibCheck 2>nul
)

echo [3] تشغيل Vite...
start "Vite Server" cmd /c "npm run dev:renderer"
timeout /t 5 /nobreak >nul

echo [4] تشغيل Electron...
start "Electron App" cmd /c "npm run dev:main"

echo.
echo ✅ التطبيق يعمل الآن!
echo.
echo 📋 الخطوات التالية:
echo    1. انتظر فتح التطبيق
echo    2. اذهب لـ Management ^> Service Tester
echo    3. اضغط "Run All Tests"
echo.
echo 💡 للاختبار اليدوي افتح Console (F12) واكتب:
echo    await window.knoux.test.runAll()
echo.
pause
