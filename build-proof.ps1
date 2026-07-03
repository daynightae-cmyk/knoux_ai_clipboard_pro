$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "KNOUX PROOF OF LIFE BUILD"
Write-Host "========================================"

Write-Host "[1/3] Building Renderer..."
node node_modules/vite/bin/vite.js build
if ($LASTEXITCODE -ne 0) { throw "Renderer build failed" }

Write-Host "[2/3] Building Main..."
node node_modules/typescript/bin/tsc --project tsconfig.json --outDir build
if ($LASTEXITCODE -ne 0) { throw "Main build failed" }

Write-Host "[3/3] Packaging..."
node node_modules/electron-packager/bin/electron-packager.js . "Knoux-Clipboard-AI" --platform=win32 --arch=x64 --out=release --overwrite
if ($LASTEXITCODE -ne 0) { throw "Packaging failed" }

$exePath = ".\release\Knoux-Clipboard-AI-win32-x64\Knoux-Clipboard-AI.exe"
if (Test-Path $exePath) {
    $size = (Get-Item $exePath).Length / 1MB
    Write-Host "========================================"
    Write-Host "BUILD COMPLETE" -ForegroundColor Green
    Write-Host "EXE: $exePath"
    Write-Host "Size: $([math]::Round($size, 2)) MB"
    Write-Host "========================================"
    
    Write-Host "`nLaunching EXE..." -ForegroundColor Yellow
    Start-Process $exePath
} else {
    throw "EXE not found"
}
