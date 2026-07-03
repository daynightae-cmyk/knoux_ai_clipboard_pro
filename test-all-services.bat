@echo off
echo ========================================
echo Testing All Knoux Services
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Building backend...
call npm run build:backend
if errorlevel 1 (
    echo WARNING: Backend build had issues, continuing...
)

echo.
echo [3/5] Starting Vite dev server...
start "Vite Dev Server" cmd /k "npm run dev:renderer"
timeout /t 8 /nobreak

echo.
echo [4/5] Starting Electron with service tests...
start "Electron Main" cmd /k "npm run dev:main"

echo.
echo [5/5] Services started. Check both windows for output.
echo.
echo Press any key to open service test dashboard...
pause
start http://localhost:5173

echo.
echo Test windows are running. Close them manually when done.
pause
