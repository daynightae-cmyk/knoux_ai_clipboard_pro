$ErrorActionPreference = "Stop"

Write-Host "Building UI..." -ForegroundColor Yellow
node node_modules/vite/bin/vite.js build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Packaging..." -ForegroundColor Yellow
    node node_modules/electron-packager/bin/electron-packager.js . "Knoux-Clipboard-AI" --platform=win32 --arch=x64 --out=release --overwrite
    
    if ($LASTEXITCODE -eq 0) {
        $exePath = ".\release\Knoux-Clipboard-AI-win32-x64\Knoux-Clipboard-AI.exe"
        Write-Host "SUCCESS - Launching..." -ForegroundColor Green
        Start-Process $exePath
    }
}
