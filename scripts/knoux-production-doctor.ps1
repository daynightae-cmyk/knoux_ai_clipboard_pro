


$ErrorActionPreference = "Stop"







Write-Host "============================================================" -ForegroundColor Cyan



Write-Host " KNOUX Production Doctor" -ForegroundColor Cyan



Write-Host "============================================================" -ForegroundColor Cyan







$RequiredFiles = @(



    "package.json",



    "main.js",



    "preload.js",



    "vite.config.ts",



    "tsconfig.json",



    ".env.example",



    ".gitignore",



    "assets/icons/icon.ico"



)







foreach ($file in $RequiredFiles) {



    if (!(Test-Path -LiteralPath $file)) {



        throw "Missing required file: $file"



    }



    Write-Host "OK: $file" -ForegroundColor Green



}







$Forbidden = @(".env", ".env.local", ".env.development", ".env.production", "node_modules", "dist", "build", "release")







foreach ($item in $Forbidden) {



    if (Test-Path -LiteralPath $item) {



        Write-Host "WARNING: Local generated/secret item exists and should not be committed: $item" -ForegroundColor Yellow



    }



}







$pkg = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json







if ($pkg.main -ne "main.js") {



    throw "package.json main must be main.js"



}







if (-not $pkg.scripts.dev) {



    throw "Missing npm script: dev"



}







if (-not $pkg.scripts.dist) {



    throw "Missing npm script: dist"



}







Write-Host ""



Write-Host "KNOUX Production Doctor passed." -ForegroundColor Green



