@echo off
REM САМЫЙ ПРОСТОЙ СПОСОБ ЗАПУСКА

REM Останавливаем старые процессы
taskkill /F /IM node.exe >nul 2>nul

REM Запускаем сервер в новом окне
start "DANDY POS Server" cmd /c "cd /d %~dp0backend && node src\index-simple-full.js && pause"

REM Ждем и открываем браузер
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000/"

exit
