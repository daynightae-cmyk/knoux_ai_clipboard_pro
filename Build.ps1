# Knoux Build Authority - Zero Tolerance Build Script
# Fails HARD on any missing step

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KNOUX BUILD AUTHORITY - STARTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Clean
Write-Host "`n[1/6] CLEANING..." -ForegroundColor Yellow
if (Test-Path ".\release") { Remove-Item ".\release" -Recurse -Force }
if (Test-Path ".\dist") { Remove-Item ".\dist" -Recurse -Force }
Write-Host "✓ Clean complete" -ForegroundColor Green

# Step 2: Install Dependencies
Write-Host "`n[2/6] INSTALLING DEPENDENCIES..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install FAILED" }
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 3: Build Renderer
Write-Host "`n[3/6] BUILDING RENDERER..." -ForegroundColor Yellow
npm run build:renderer
if ($LASTEXITCODE -ne 0) { throw "Renderer build FAILED" }
if (-not (Test-Path ".\dist\index.html")) { throw "dist/index.html NOT FOUND" }
Write-Host "✓ Renderer built" -ForegroundColor Green

# Step 4: Build Main
Write-Host "`n[4/6] BUILDING MAIN PROCESS..." -ForegroundColor Yellow
npm run build:main
if ($LASTEXITCODE -ne 0) { throw "Main build FAILED" }
Write-Host "✓ Main process built" -ForegroundColor Green

# Step 5: Package Electron
Write-Host "`n[5/6] PACKAGING ELECTRON..." -ForegroundColor Yellow
npx electron-packager . "Knoux-Clipboard-AI" --platform=win32 --arch=x64 --out=release --overwrite --icon=app/assets/icons/icon.ico
if ($LASTEXITCODE -ne 0) { throw "Electron packaging FAILED" }

$exePath = ".\release\Knoux-Clipboard-AI-win32-x64\Knoux-Clipboard-AI.exe"
if (-not (Test-Path $exePath)) { throw "EXE NOT FOUND at $exePath" }
Write-Host "✓ Electron packaged" -ForegroundColor Green

# Step 6: Build Installer
Write-Host "`n[6/6] BUILDING INSTALLER..." -ForegroundColor Yellow
Push-Location setup
makensis knoux.nsi
if ($LASTEXITCODE -ne 0) { 
    Pop-Location
    throw "NSIS build FAILED" 
}
Pop-Location

$installerPath = ".\release\Knoux-Clipboard-AI-Setup-v1.0.0.exe"
if (-not (Test-Path $installerPath)) { throw "INSTALLER NOT FOUND at $installerPath" }
Write-Host "✓ Installer built" -ForegroundColor Green

# Final Verification
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BUILD VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$exeSize = (Get-Item $exePath).Length / 1MB
$installerSize = (Get-Item $installerPath).Length / 1MB

Write-Host "✓ EXE: $exePath ($([math]::Round($exeSize, 2)) MB)" -ForegroundColor Green
Write-Host "✓ Installer: $installerPath ($([math]::Round($installerSize, 2)) MB)" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BUILD COMPLETE - ALL CHECKS PASSED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
