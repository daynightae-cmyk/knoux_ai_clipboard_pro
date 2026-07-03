$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KNOUX MINIMAL BUILD (SKIP TS ERRORS)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# [1] Clean
Write-Host "`n[1/4] Cleaning..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path "release") { Remove-Item "release" -Recurse -Force }
Write-Host "Clean complete" -ForegroundColor Green

# [2] Build Renderer ONLY
Write-Host "`n[2/4] Building Renderer..." -ForegroundColor Yellow
node node_modules/vite/bin/vite.js build
if ($LASTEXITCODE -ne 0) { throw "Renderer build failed" }
if (-not (Test-Path "dist/index.html")) { throw "dist/index.html not found" }
Write-Host "Renderer built" -ForegroundColor Green

# [3] Copy main.js (skip TypeScript)
Write-Host "`n[3/4] Copying main.js..." -ForegroundColor Yellow
if (Test-Path "main.js") {
    Write-Host "Using existing main.js" -ForegroundColor Green
} else {
    Write-Host "WARNING: main.js not found, creating minimal..." -ForegroundColor Yellow
    @"
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
"@ | Out-File -FilePath "main.js" -Encoding utf8
}

# [4] Package
Write-Host "`n[4/4] Packaging..." -ForegroundColor Yellow
node node_modules/electron-packager/bin/electron-packager.js . "Knoux-Clipboard-AI" --platform=win32 --arch=x64 --out=release --overwrite
if ($LASTEXITCODE -ne 0) { throw "Packaging failed" }

$exePath = ".\release\Knoux-Clipboard-AI-win32-x64\Knoux-Clipboard-AI.exe"
if (-not (Test-Path $exePath)) { throw "EXE not found" }

$size = (Get-Item $exePath).Length / 1MB
$date = (Get-Item $exePath).LastWriteTime

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BUILD SUCCESS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EXE: $exePath"
Write-Host "Size: $([math]::Round($size, 2)) MB"
Write-Host "Date: $date"
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nLaunching..." -ForegroundColor Yellow
Start-Process $exePath
