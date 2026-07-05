$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$installerDir = Join-Path $repoRoot "build\installer"
$sourceDir = Join-Path $installerDir "source"
New-Item -ItemType Directory -Force -Path $installerDir, $sourceDir | Out-Null
$officialIcon = Join-Path $repoRoot "assets\icons\icon.ico"
if (-not (Test-Path $officialIcon)) { throw "Official icon missing" }
Copy-Item $officialIcon (Join-Path $installerDir "icon.ico") -Force
Copy-Item $officialIcon (Join-Path $installerDir "uninstaller.ico") -Force
Copy-Item $officialIcon (Join-Path $installerDir "header-icon.ico") -Force
Write-Host "KNOUX installer icon assets prepared. Add source visuals before BMP generation."
