<#
scan-backend-imports.ps1
Usage:
  .\scan-backend-imports.ps1 -Root "F:\Knoux-Clipboard-AI" -OutDir "F:\Knoux-Clipboard-AI\scan-output"
#>

param(
  [string]$Root = "F:\Knoux-Clipboard-AI",
  [string]$OutDir = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $Root)) {
  Write-Host "خطأ: المسار الجذر غير موجود:" $Root -ForegroundColor Red
  exit 1
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path $Root "scan-output"
}

if (-not (Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

Write-Host "Scanning project root:" $Root -ForegroundColor Cyan
Write-Host "Output directory:" $OutDir -ForegroundColor Cyan

# امتدادات الملفات التي سنفحصها
$exts = @(".ts",".tsx",".js",".jsx",".mjs",".cjs")

# كلمات مفتاحية تدل على Node-only APIs (سلاسل بسيطة لتجنب مشاكل الاقتباس)
$nodeKeywords = @(
  "require('fs'",
  "require(\"fs\"",
  "fs.",
  "child_process",
  "ipcMain",
  "ipcRenderer",
  "net.",
  "process.env",
  "os.",
  "path.",
  "worker_threads",
  "nativeModule",
  "node-gyp"
)

# جمع كل ملفات الrenderer
$rendererRoot = Join-Path $Root "app\renderer"
if (-not (Test-Path $rendererRoot)) {
  Write-Host "تحذير: لم أجد app\renderer في الجذر. سأبحث في كامل المشروع." -ForegroundColor Yellow
  $rendererRoot = $Root
}

$files = Get-ChildItem -Path $rendererRoot -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $exts -contains $_.Extension.ToLower() }

$resultEntries = @()
$modulesMap = @{}

foreach ($f in $files) {
  $content = ""
  try { $content = Get-Content -Raw -Path $f.FullName -ErrorAction SilentlyContinue } catch {}
  if ([string]::IsNullOrWhiteSpace($content)) { continue }

  # إيجاد import و require التي تشير إلى backend أو مسارات نسبية تحتوي ../..../backend
  $importPattern = '(?:import\s+(?:.+?\s+from\s+)?|require\()\s*["'']([^"'']+)["'']'
  $matches = [regex]::Matches($content, $importPattern)
  foreach ($m in $matches) {
    $impPath = $m.Groups[1].Value.Trim()
    if ($impPath -match '(^|/|\\)backend($|/)' -or $impPath -match 'backend') {
      # حاول حل المسار إلى ملف فعلي
      $resolved = $null
      $candidatePaths = @()
      if ($impPath.StartsWith(".") -or $impPath.StartsWith("..")) {
        $baseDir = Split-Path -Parent $f.FullName
        $candidateBase = Join-Path $baseDir $impPath
        $candidatePaths += $candidateBase
      } else {
        $candidatePaths += Join-Path $Root $impPath
        $candidatePaths += Join-Path $Root ("app\" + $impPath)
      }

      $found = $false
      foreach ($c in $candidatePaths) {
        foreach ($ext in $exts + ".json") {
          $p = $c
          if (-not ($p.EndsWith($ext))) { $p = $p + $ext }
          if (Test-Path $p) {
            $resolved = (Resolve-Path $p).ProviderPath
            $found = $true
            break
          }
        }
        if ($found) { break }
        foreach ($ext in $exts) {
          $idx = Join-Path $c ("index" + $ext)
          if (Test-Path $idx) {
            $resolved = (Resolve-Path $idx).ProviderPath
            $found = $true
            break
          }
        }
        if ($found) { break }
      }

      $exists = $false
      $size = 0
      $nodeOnly = $false
      $sample = ""
      if ($resolved) {
        $exists = $true
        try { $size = (Get-Item $resolved).Length } catch {}
        try {
          $sample = Get-Content -Raw -Path $resolved -ErrorAction SilentlyContinue
          foreach ($kw in $nodeKeywords) {
            if ($sample -match [regex]::Escape($kw)) {
              $nodeOnly = $true
              break
            }
          }
        } catch {}
      }

      $suggestion = "verify"
      if ($nodeOnly) { $suggestion = "use-ipc" }
      elseif ($exists) { $suggestion = "move-to-shared" }
      else { $suggestion = "use-ipc" }

      $entry = [PSCustomObject]@{
        RendererFile = $f.FullName.Substring($Root.Length).TrimStart('\','/')
        ImportString = $m.Value.Trim()
        ImportPath = $impPath
        ResolvedPath = if ($resolved) { $resolved.Substring($Root.Length).TrimStart('\','/') } else { $null }
        Exists = $exists
        SizeBytes = $size
        NodeOnly = $nodeOnly
        Suggestion = $suggestion
      }
      $resultEntries += $entry

      $modKey = if ($resolved) { $resolved } else { $impPath }
      if (-not $modulesMap.ContainsKey($modKey)) {
        $modulesMap[$modKey] = [System.Collections.ArrayList]::new()
      }
      $modulesMap[$modKey].Add($entry) | Out-Null
    }
  }
}

# تجميع النتائج
$report = [PSCustomObject]@{
  Root = (Resolve-Path $Root).ProviderPath
  ScannedAt = (Get-Date).ToString("s")
  RendererFilesScanned = $files.Count
  MatchesFound = $resultEntries.Count
  Entries = $resultEntries | Sort-Object -Property Suggestion,SizeBytes -Descending
  Modules = @()
}

# Modules summary
foreach ($k in $modulesMap.Keys) {
  $group = $modulesMap[$k]
  $totalRefs = $group.Count
  $size = 0
  $exists = $false
  if (Test-Path $k) {
    $exists = $true
    try { $size = (Get-Item $k).Length } catch {}
  }
  $moduleKey = if ($k.StartsWith($Root)) { $k.Substring($Root.Length).TrimStart('\','/') } else { $k }
  $suggestedChannel = ([IO.Path]::GetFileNameWithoutExtension($moduleKey) -replace '[^a-zA-Z0-9\-]','-')
  $report.Modules += [PSCustomObject]@{
    ModuleKey = $moduleKey
    Exists = $exists
    SizeBytes = $size
    References = $group
    SuggestedChannel = $suggestedChannel
  }
}

# Save JSON report
$outJson = Join-Path $OutDir "backend-import-report.json"
$report | ConvertTo-Json -Depth 6 | Out-File -FilePath $outJson -Encoding UTF8
Write-Host "Report saved to" $outJson -ForegroundColor Green

# Generate suggested preload and ipc handlers templates
$preloadPath = Join-Path $OutDir "suggested-ipc-preload.ts"
$ipcPath = Join-Path $OutDir "suggested-ipc-handlers.ts"

$channels = $report.Modules | ForEach-Object { $_.SuggestedChannel } | Where-Object { $_ -ne "" } | Select-Object -Unique

# Build preload template safely using interpolation for channel names
$preloadLines = @()
$preloadLines += "import { contextBridge, ipcRenderer } from 'electron';"
$preloadLines += ""
$preloadLines += "contextBridge.exposeInMainWorld('backendAPI', {"
foreach ($ch in $channels) {
  $fn = $ch -replace '-','_'
  $preloadLines += "  $fn: {"
  $preloadLines += "    invoke: (payload: any) => ipcRenderer.invoke('$($ch):invoke', payload),"
  $preloadLines += "  },"
}
$preloadLines += "});"
$preloadLines | Out-File -FilePath $preloadPath -Encoding UTF8
Write-Host "Preload template saved to" $preloadPath -ForegroundColor Green

# ipc handlers template
$ipcLines = @()
$ipcLines += "import { ipcMain } from 'electron';"
$ipcLines += ""
foreach ($ch in $channels) {
  $ipcLines += "ipcMain.handle('$($ch):invoke', async (_event, payload) => {"
  $ipcLines += "  // TODO: require or import the backend module and call the appropriate function"
  $ipcLines += "  // Example:"
  $ipcLines += "  // const mod = require('../backend/...' );"
  $ipcLines += "  // return await mod.someFunction(payload);"
  $ipcLines += "});"
  $ipcLines += ""
}
$ipcLines | Out-File -FilePath $ipcPath -Encoding UTF8
Write-Host "IPC handlers template saved to" $ipcPath -ForegroundColor Green

Write-Host "Done. افتح الملف JSON لعرض التفاصيل." -ForegroundColor Green
