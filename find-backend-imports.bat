@echo off
echo Searching for backend imports in UI components...
echo.

findstr /S /I /C:"from '../../../backend" app\renderer\components\*.tsx > backend-imports.txt
findstr /S /I /C:"from '../../backend" app\renderer\components\*.tsx >> backend-imports.txt

if exist backend-imports.txt (
    echo Found backend imports:
    type backend-imports.txt
    echo.
    echo Fix these files manually or run full-update-release.bat
) else (
    echo No backend imports found!
)

pause
