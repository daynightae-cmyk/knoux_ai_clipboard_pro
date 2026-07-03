# ============================================
# Knoux Clipboard AI - Setup Preparation Script
# Purpose: Organize and prepare all files for installation
# ============================================

param(
    [switch]$Verify = $false,
    [switch]$Build = $false,
    [switch]$Clean = $false
)

$ErrorActionPreference = "Stop"

# Colors
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error   = "Red"
    Info    = "Cyan"
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )
    $color = $Colors[$Level]
    Write-Host "[$Level] $Message" -ForegroundColor $color
}

function Test-FilesExist {
    Write-Log "Checking critical files..." "Info"

    $files = @(
        @{ Path = "./Knoux-Clipboard-AI-FIXED.exe"; Name = "Main EXE" },
        @{ Path = "./dist/ffmpeg.dll"; Name = "FFmpeg DLL" },
        @{ Path = "./release/Knoux-Clipboard-AI-win32-x64"; Name = "Release Package" },
        @{ Path = "./package.json"; Name = "Package Config" },
        @{ Path = "./app/renderer"; Name = "Renderer App" }
    )

    $allExist = $true
    foreach ($file in $files) {
        if (Test-Path $file.Path) {
            Write-Log "✓ Found: $($file.Name)" "Success"
        } else {
            Write-Log "✗ Missing: $($file.Name) at $($file.Path)" "Error"
            $allExist = $false
        }
    }

    return $allExist
}

function Copy-DependencyFiles {
    Write-Log "Copying dependency files..." "Info"

    # Create setup assets directory
    if (-not (Test-Path "./setup/assets")) {
        New-Item -ItemType Directory -Path "./setup/assets" -Force | Out-Null
        Write-Log "Created ./setup/assets" "Success"
    }

    # Copy icon if exists
    if (Test-Path "./public/favicon.ico") {
        Copy-Item "./public/favicon.ico" "./setup/assets/" -Force
        Write-Log "Copied favicon.ico" "Success"
    }

    # Copy license
    if (Test-Path "./LICENSE") {
        Copy-Item "./LICENSE" "./setup/" -Force
        Write-Log "Copied LICENSE" "Success"
    }

    # Copy README
    if (Test-Path "./README.md") {
        Copy-Item "./README.md" "./setup/" -Force
        Write-Log "Copied README.md" "Success"
    }
}

function Verify-DLLs {
    Write-Log "Verifying DLL files..." "Info"

    $dllLocations = @{
        "ffmpeg.dll" = @(
            "./dist/ffmpeg.dll",
            "./release/Knoux-Clipboard-AI-win32-x64/ffmpeg.dll"
        )
    }

    foreach ($dll in $dllLocations.Keys) {
        $found = $false
        foreach ($location in $dllLocations[$dll]) {
            if (Test-Path $location) {
                Write-Log "✓ Found $dll at $location" "Success"
                $found = $true
                break
            }
        }

        if (-not $found) {
            Write-Log "✗ $dll not found in any location!" "Error"
            return $false
        }
    }

    return $true
}

function Remove-Duplicates {
    Write-Log "Checking for duplicate files..." "Info"

    # Find duplicate EXE files
    $exes = Get-ChildItem -Path "." -Filter "*.exe" -File

    if ($exes.Count -gt 1) {
        Write-Log "Found $($exes.Count) EXE files:" "Warning"
        foreach ($exe in $exes) {
            Write-Host "  - $($exe.Name) ($([math]::Round($exe.Length/1MB, 2)) MB)" -ForegroundColor Yellow
        }

        Write-Host "`nKeeping: Knoux-Clipboard-AI-FIXED.exe" -ForegroundColor Green
        $keep = "Knoux-Clipboard-AI-FIXED.exe"

        foreach ($exe in $exes) {
            if ($exe.Name -ne $keep) {
                Write-Log "Removing duplicate: $($exe.Name)" "Warning"
                Remove-Item $exe.FullName -Force
            }
        }
    } else {
        Write-Log "No duplicates found" "Success"
    }
}

function Cleanup-TempFiles {
    Write-Log "Cleaning temporary files..." "Info"

    $patterns = @(
        "*.log",
        "*.tmp",
        ".DS_Store",
        "Thumbs.db"
    )

    foreach ($pattern in $patterns) {
        $items = Get-ChildItem -Path "." -Filter $pattern -Recurse -ErrorAction SilentlyContinue
        foreach ($item in $items) {
            Remove-Item $item.FullName -Force -ErrorAction SilentlyContinue
            Write-Log "Removed: $($item.FullName)" "Info"
        }
    }
}

function Build-Installer {
    Write-Log "Building installer..." "Info"

    # Check if NSIS is installed
    $nsisPath = "C:\Program Files (x86)\NSIS\makensis.exe"

    if (-not (Test-Path $nsisPath)) {
        Write-Log "NSIS not found at $nsisPath" "Error"
        Write-Log "Please install NSIS from: https://nsis.sourceforge.io/" "Info"
        return $false
    }

    Write-Log "Found NSIS at: $nsisPath" "Success"

    # Build
    Push-Location "./setup"
    & $nsisPath /V3 /D_OUTDIR=../release knoux.nsi
    $result = $LASTEXITCODE
    Pop-Location

    if ($result -eq 0) {
        Write-Log "Installer built successfully!" "Success"
        return $true
    } else {
        Write-Log "Installer build failed with code: $result" "Error"
        return $false
    }
}

function Show-Summary {
    param(
        [bool]$Success
    )

    Write-Host "`n" + "="*60
    if ($Success) {
        Write-Host "✅ SETUP PREPARATION COMPLETE" -ForegroundColor Green
        Write-Host "`nYour application is ready for distribution:" -ForegroundColor Green
        Write-Host "  📦 Executable: ./Knoux-Clipboard-AI-FIXED.exe" -ForegroundColor Cyan
        Write-Host "  📦 Installer: ./release/Knoux-Clipboard-AI-Setup-v1.0.0.exe" -ForegroundColor Cyan
    } else {
        Write-Host "❌ SETUP PREPARATION INCOMPLETE" -ForegroundColor Red
        Write-Host "`nPlease fix the issues above and try again." -ForegroundColor Red
    }
    Write-Host "="*60 + "`n"
}

# Main execution
try {
    Write-Log "Starting Knoux Clipboard AI Setup Preparation" "Info"
    Write-Host ""

    # Run verifications
    if (-not (Test-FilesExist)) {
        throw "Critical files are missing!"
    }

    if (-not (Verify-DLLs)) {
        throw "Required DLL files not found!"
    }

    # Prepare files
    Copy-DependencyFiles
    Remove-Duplicates
    Cleanup-TempFiles

    # Build installer if requested
    if ($Build) {
        if (Build-Installer) {
            Show-Summary $true
        } else {
            Show-Summary $false
            exit 1
        }
    } else {
        Show-Summary $true
    }

} catch {
    Write-Log "Error: $_" "Error"
    Show-Summary $false
    exit 1
}
