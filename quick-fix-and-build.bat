@echo off
echo Fixed: ARVRIntegrationUI.tsx
echo Fixed: VoiceCustomizerUI.tsx
echo.
echo Building...
call npm run build:renderer
if errorlevel 1 (
    echo.
    echo Build failed. Check errors above.
    pause
    exit /b 1
)
echo.
echo ✅ Build successful!
echo.
echo Running full update...
call full-update-release.bat
