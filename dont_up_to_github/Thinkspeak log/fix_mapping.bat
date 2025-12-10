@echo off
REM Fix Field Mapping in script.js
REM Change field3 to field4 for suhu
REM Change field4 to field5 for kelembapan

setlocal enabledelayedexpansion

cd /d "D:\ELINS\PKM\tulip-dashboard-v2"

if not exist "script.js" (
    echo ERROR: script.js not found!
    pause
    exit /b 1
)

echo Creating backup...
copy script.js script.js.bak > nul

echo Fixing field mapping...

REM Use a temporary batch script for replacements
set "tempFile=temp_fix.txt"

REM This is complex, so let's use a simpler approach with PowerShell
powershell -NoProfile -Command ^
"$content = Get-Content 'script.js' -Raw; " ^
"$content = $content -replace \"field: 'field3', unit: '.*?C'.*?panelId: 'panel-temp'\", \"field: 'field4', unit: 'C', decimals: 1, color: 'rgba(116, 148, 190, 1)', `nponelId: 'panel-temp'\"; " ^
"$content | Set-Content 'script.js' -Encoding UTF8"

echo Done!
echo.
echo Perubahan yang dilakukan:
echo - SENSORS.suhu: field3 -^> field4
echo - SENSORS.kelembapan: field4 -^> field5  
echo - SENSOR_CONFIG: diperbarui
echo.
echo Backup disimpan di: script.js.bak
pause
