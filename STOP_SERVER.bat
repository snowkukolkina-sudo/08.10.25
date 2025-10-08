@echo off
chcp 65001 >nul
title Остановка DANDY POS Server

color 0C
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║           🛑 Остановка DANDY POS Server                 ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Останавливаем все процессы Node.js
echo Поиск запущенных процессов Node.js...
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Найдены запущенные процессы Node.js
    echo.
    echo Остановка...
    taskkill /F /IM node.exe >nul 2>nul
    echo.
    echo ✅ Сервер успешно остановлен!
) else (
    echo ℹ️  Сервер не запущен
)

echo.
pause
