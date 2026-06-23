@echo off
chcp 65001 >nul
title Spodie - Otomatik Takip
echo.
echo  ════════════════════════════════════════
echo   SPODIE - Otomatik Dinleme Takibi
echo  ════════════════════════════════════════
echo.
echo  Bu pencere acik kaldigi surece, her 30 saniyede
echo  Spotify'da caldigin sarki otomatik kaydedilir.
echo.
echo  Kapatmak icin bu pencereyi kapat (X) ya da Ctrl+C.
echo.
echo  ════════════════════════════════════════
echo.

:loop
powershell -NoProfile -Command "try { $r = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/tick' -TimeoutSec 25; Write-Host (Get-Date -Format 'HH:mm:ss') '- kontrol edildi, sayilan:' $r.sayildi } catch { Write-Host (Get-Date -Format 'HH:mm:ss') '- site kapali? (npm run dev calisiyor mu?)' }"
timeout /t 30 /nobreak >nul
goto loop
