@echo off
echo ========================================
echo   🚀 Knoux Clipboard AI - Quick Test
echo ========================================
echo.

echo 📋 Testing Enhanced Integration...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ node_modules not found. Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
)

echo ✅ Dependencies ready
echo.

REM Create data directory if it doesn't exist
if not exist "data" (
    mkdir data
    echo ✅ Data directory created
)

echo 🔧 Starting development server...
echo.
echo 📊 What to expect:
echo   - Real clipboard monitoring
echo   - Enhanced AI processing  
echo   - Database integration
echo   - Live IPC testing
echo.
echo 🧪 Test the following in the app:
echo   1. Copy some text - should appear in clipboard list
echo   2. Click "Test AI Summarize" - should work with real processing
echo   3. Click "Test Storage" - should save/retrieve from database
echo   4. Check connection status indicators
echo.

REM Start the application
npm run dev

echo.
echo 🏁 Application closed
pause