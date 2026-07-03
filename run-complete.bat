@echo off
echo ========================================
echo   🚀 Knoux Clipboard AI - COMPLETE
echo ========================================
echo.
echo 🎉 ALL FEATURES INTEGRATED!
echo.
echo 📋 Available Features:
echo   ✅ Core: Dashboard, Clipboard, History, Search
echo   ✅ AI: Creative Studio, Offline AI, Memory, Analytics
echo   ✅ Advanced: Translator, Voice Commands, Voice Studio
echo   ✅ Quantum: Predictions, Security, Blockchain
echo   ✅ Neural: Style Transfer, AR/VR, UI Morpher
echo   ✅ Management: Features, Tags, Filters
echo.

REM Check dependencies
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Installation failed
        pause
        exit /b 1
    )
)

REM Create data directory
if not exist "data" mkdir data

echo 🔧 Starting Knoux Clipboard AI...
echo.
echo 🧪 Test ALL features:
echo   1. Navigate through ALL sidebar sections
echo   2. Test clipboard monitoring (copy text)
echo   3. Try AI features (summarize, enhance)
echo   4. Explore Creative Studio, Voice Commands
echo   5. Check Quantum features, Neural processing
echo   6. Use management tools (tags, filters)
echo.

npm run dev

echo.
echo 🏁 Session ended
pause