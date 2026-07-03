@echo off
echo ========================================
echo   Building Knoux Clipboard AI
echo ========================================
echo.

echo Step 1: Clean old builds...
if exist "dist" rd /s /q dist
if exist "build" rd /s /q build
echo Done.
echo.

echo Step 2: Build renderer (Vite)...
call npm run build:renderer
if errorlevel 1 (
    echo ERROR: Renderer build failed
    pause
    exit /b 1
)
echo Done.
echo.

echo Step 3: Copy backend files (JS only)...
if not exist "dist\app\backend" mkdir dist\app\backend
xcopy /E /I /Y app\backend\*.js dist\app\backend\
xcopy /E /I /Y app\backend\ipc dist\app\backend\ipc\
xcopy /E /I /Y app\backend\services dist\app\backend\services\
xcopy /E /I /Y app\backend\clipboard dist\app\backend\clipboard\
echo Done.
echo.

echo Step 4: Copy main files...
copy /Y main.js dist\
copy /Y preload.js dist\
copy /Y package.json dist\
echo Done.
echo.

echo Step 5: Package with electron-packager...
call npx electron-packager dist Knoux-Clipboard-AI --platform=win32 --arch=x64 --out=release --overwrite --icon=assets/icons/icon.ico
if errorlevel 1 (
    echo ERROR: Packaging failed
    pause
    exit /b 1
)
echo Done.
echo.

echo ========================================
echo   Build Complete!
echo   Location: release\Knoux-Clipboard-AI-win32-x64\
echo ========================================
pause