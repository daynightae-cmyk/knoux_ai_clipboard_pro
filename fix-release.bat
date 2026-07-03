@echo off
echo ========================================
echo   Quick Fix: Copy Backend to Release
echo ========================================
echo.

set RELEASE_DIR=release\Knoux-Clipboard-AI-win32-x64\resources\app

echo Copying backend files to release...

xcopy /E /I /Y app\backend\ipc\*.js "%RELEASE_DIR%\app\backend\ipc\"
xcopy /E /I /Y app\backend\services\*.js "%RELEASE_DIR%\app\backend\services\" 2>nul
xcopy /E /I /Y app\backend\clipboard\*.js "%RELEASE_DIR%\app\backend\clipboard\"

copy /Y main.js "%RELEASE_DIR%\"
copy /Y preload.js "%RELEASE_DIR%\"

echo.
echo Done! Backend files copied to release.
echo Now run: release\Knoux-Clipboard-AI-win32-x64\Knoux-Clipboard-AI.exe
echo.
pause