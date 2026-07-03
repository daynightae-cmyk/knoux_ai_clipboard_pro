Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🔍 فحص سريع للملفات المهمة" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$OK = 0
$FAIL = 0

Write-Host "[Checking Files...]" -ForegroundColor Yellow
Write-Host ""

$files = @(
    "preload.js",
    "main.js",
    "app\backend\ipc\test-ipc.js",
    "app\renderer\components\ServiceTester.tsx",
    "app\renderer\components\MainDashboard.tsx",
    "package.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
        $OK++
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $FAIL++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "النتيجة: $OK ✅  |  $FAIL ❌" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($FAIL -gt 0) {
    Write-Host "⚠️  يوجد ملفات ناقصة!" -ForegroundColor Red
} else {
    Write-Host "✅ جميع الملفات موجودة!" -ForegroundColor Green
    Write-Host ""
    Write-Host "للتشغيل استخدم:" -ForegroundColor Yellow
    Write-Host "   .\test.bat" -ForegroundColor White
}

Write-Host ""
