@echo off
echo Starting Knoux Clipboard AI...
echo.

start "Vite Dev Server" cmd /k "npm run dev:renderer"
timeout /t 5 /nobreak >nul
start "Electron Main" cmd /k "npm run dev:main"

echo.
echo Both processes started in separate windows
echo Close this window when done