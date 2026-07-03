


$ErrorActionPreference = "Stop"







$LogDir = ".knoux-local-logs"



New-Item -ItemType Directory -Force $LogDir | Out-Null







Write-Host "============================================================" -ForegroundColor Cyan



Write-Host " KNOUX Local Build Runner" -ForegroundColor Cyan



Write-Host "============================================================" -ForegroundColor Cyan







Write-Host "Installing dependencies..." -ForegroundColor Yellow



npm install --legacy-peer-deps 2>&1 | Tee-Object -FilePath "$LogDir\npm-install.log"







Write-Host "Running production doctor..." -ForegroundColor Yellow



npm run doctor 2>&1 | Tee-Object -FilePath "$LogDir\doctor.log"







Write-Host "Building project..." -ForegroundColor Yellow



npm run build 2>&1 | Tee-Object -FilePath "$LogDir\build.log"







Write-Host "Packaging Windows app..." -ForegroundColor Yellow



npm run dist 2>&1 | Tee-Object -FilePath "$LogDir\dist.log"







Write-Host "DONE. Check release folder." -ForegroundColor Green



