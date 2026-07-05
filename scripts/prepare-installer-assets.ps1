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
$manifest = [ordered]@{
  product = "Knoux AI Clipboard Pro"
  strategy = "electron-builder NSIS branding"
  icon = "build/installer/icon.ico"
  uninstallerIcon = "build/installer/uninstaller.ico"
  headerIcon = "build/installer/header-icon.ico"
  wizardHeaderImage = "Planned"
  wizardSidebarImage = "Planned"
  fullCustomInstallerUi = "Planned"
  generatedAt = (Get-Date).ToString("o")
}
$manifest | ConvertTo-Json | Set-Content -Path (Join-Path $installerDir "asset-manifest.json") -Encoding UTF8
Write-Host "KNOUX installer icon assets prepared. Wizard BMP visuals remain planned until source PNG assets are committed and verified."
