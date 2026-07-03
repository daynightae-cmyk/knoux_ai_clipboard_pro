@echo off
echo ========================================
echo KNOUX PROOF OF LIFE BUILD
echo ========================================

echo [1/3] Building Renderer...
call npm run build:renderer
if %errorlevel% neq 0 (
    echo BUILD FAILED: Renderer
    exit /b 1
)

echo [2/3] Building Main...
call npm run build:main
if %errorlevel% neq 0 (
    echo BUILD FAILED: Main
    exit /b 1
)

echo [3/3] Packaging...
call npx electron-packager . "Knoux-Clipboard-AI" --platform=win32 --arch=x64 --out=release --overwrite
if %errorlevel% neq 0 (
    echo BUILD FAILED: Packaging
    exit /b 1
)

echo ========================================
echo BUILD COMPLETE
echo EXE: release\Knoux-Clipboard-AI-win32-x64\Knoux-Clipboard-AI.exe
echo ========================================
