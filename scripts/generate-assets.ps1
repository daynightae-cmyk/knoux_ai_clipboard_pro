# ==========================================
# Knoux Asset Generator
# Creates placeholder icons and folder structures so the app can build immediately.
# ==========================================

Write-Host "🎨 Generating Knoux Assets..." -ForegroundColor Cyan

# Define Paths
$RootDir = "F:\Knoux-Clipboard-AI"
$IconsDir = "$RootDir\assets\icons"

# Create Directories
New-Item -ItemType Directory -Force -Path $IconsDir | Out-Null
New-Item -ItemType Directory -Force -Path "$RootDir\dist" | Out-Null
New-Item -ItemType Directory -Force -Path "$RootDir\build" | Out-Null
New-Item -ItemType Directory -Force -Path "$RootDir\release" | Out-Null

# Load System.Drawing for image creation
Add-Type -AssemblyName System.Drawing

function Create-PlaceholderImage {
    param (
        [string]$Path,
        [int]$Width,
        [int]$Height,
        [System.Drawing.Color]$BgColor,
        [string]$Text
    )

    $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $brush = New-Object System.Drawing.SolidBrush($BgColor)
    $textBrush = [System.Drawing.Brushes]::White
    
    # Fill Background
    $graphics.FillRectangle($brush, 0, 0, $Width, $Height)
    
    # Draw simple decoration (K for Knoux)
    $font = New-Object System.Drawing.Font("Arial", ($Height/2), [System.Drawing.FontStyle]::Bold)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString($Text, $font, $textBrush, ($Width/2), ($Height/2), $format)

    # Save
    $bitmap.Save($Path)
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "   Created: $Path" -ForegroundColor Gray
}

# 1. Generate icon.png (256x256)
Create-PlaceholderImage -Path "$IconsDir\icon.png" -Width 256 -Height 256 -BgColor ([System.Drawing.Color]::FromArgb(79, 70, 229)) -Text "K"

# 2. Generate small-icon.png (Used for Tray)
Create-PlaceholderImage -Path "$IconsDir\tray.png" -Width 32 -Height 32 -BgColor ([System.Drawing.Color]::Black) -Text "K"

# 3. Create a fake .ico file (For Windows Build) by copying the png
# Real conversion needs external tools, but electron-builder often accepts png as source or handles generic bitmaps
# Ideally, developers replace these with real .ico files later.
Copy-Item "$IconsDir\icon.png" "$IconsDir\icon.ico"
Write-Host "   Created: $IconsDir\icon.ico (Placeholder)" -ForegroundColor Gray

# 4. Create fake .icns file (For Mac Build)
Copy-Item "$IconsDir\icon.png" "$IconsDir\icon.icns"
Write-Host "   Created: $IconsDir\icon.icns (Placeholder)" -ForegroundColor Gray

Write-Host "`n✅ Assets generation complete!" -ForegroundColor Green
Write-Host "⚠️  Note: These are placeholder images. Replace them in 'assets/icons/' for production." -ForegroundColor Yellow
