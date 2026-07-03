@echo off
echo 🚀 Testing Knoux Clipboard AI...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo.
echo 🔧 Starting development server...
call npm run dev

pause