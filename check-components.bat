@echo off
chcp 65001 >nul
echo Fixing UI components - removing backend imports...
echo.

REM List of files that might have backend imports
set FILES=^
app\renderer\components\ProductivityScorerUI.tsx ^
app\renderer\components\BlockchainSecurityUI.tsx ^
app\renderer\components\NeuralStyleTransferUI.tsx ^
app\renderer\components\UIMorpherUI.tsx ^
app\renderer\components\VoiceCustomizerUI.tsx

for %%F in (%FILES%) do (
    if exist "%%F" (
        echo Checking %%F...
        findstr /C:"backend" "%%F" >nul
        if not errorlevel 1 (
            echo   ⚠️ Has backend import - needs manual fix
        ) else (
            echo   ✓ Clean
        )
    )
)

echo.
echo Run: npm run build:renderer
pause
