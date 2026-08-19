$ErrorActionPreference = "Stop"

Write-Host "KNOUX Production Doctor (PowerShell launcher)" -ForegroundColor Cyan
node ./scripts/knoux-production-doctor.cjs
if ($LASTEXITCODE -ne 0) {
  throw "KNOUX Production Doctor failed with exit code $LASTEXITCODE."
}
