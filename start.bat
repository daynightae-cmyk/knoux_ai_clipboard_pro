@echo off
echo Starting Knoux Clipboard AI...
start "Vite" cmd /k "npm run dev:renderer"
timeout /t 5 /nobreak >nul
start "Electron" cmd /k "npm run dev:main"
