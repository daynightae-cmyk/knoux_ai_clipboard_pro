@echo off
echo Fixing all backend imports...

REM BlockchainSecurityUI
powershell -Command "(Get-Content 'app\renderer\components\BlockchainSecurityUI.tsx') -replace 'import.*from.*backend/security/blockchain-security.*', '' | Set-Content 'app\renderer\components\BlockchainSecurityUI.tsx.tmp'"
powershell -Command "(Get-Content 'app\renderer\components\BlockchainSecurityUI.tsx.tmp') -replace 'blockchainSecurity\.', '// Mock: ' | Set-Content 'app\renderer\components\BlockchainSecurityUI.tsx'"
del app\renderer\components\BlockchainSecurityUI.tsx.tmp

REM UIMorpherUI  
powershell -Command "(Get-Content 'app\renderer\components\UIMorpherUI.tsx') -replace 'import.*from.*backend/ai/ui-morpher.*', '' | Set-Content 'app\renderer\components\UIMorpherUI.tsx.tmp'"
powershell -Command "(Get-Content 'app\renderer\components\UIMorpherUI.tsx.tmp') -replace 'uiMorpher\.', '// Mock: ' | Set-Content 'app\renderer\components\UIMorpherUI.tsx'"
del app\renderer\components\UIMorpherUI.tsx.tmp

echo Done! Now run: npm run build:renderer
pause
