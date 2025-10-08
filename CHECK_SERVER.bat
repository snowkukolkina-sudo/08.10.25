@echo off
chcp 65001 >nul
title Проверка DANDY POS Server

color 0B
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║           🔍 Проверка DANDY POS Server                  ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Проверяем запущен ли сервер
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Сервер ЗАПУЩЕН
    echo.
    echo Процессы Node.js:
    tasklist /FI "IMAGENAME eq node.exe"
) else (
    echo ❌ Сервер НЕ ЗАПУЩЕН
)

echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Проверяем доступность порта 3000
echo Проверка порта 3000...
netstat -an | find ":3000" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Порт 3000 занят (сервер работает)
) else (
    echo ❌ Порт 3000 свободен (сервер не работает)
)

echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo 🌐 Адреса для доступа:
echo.
echo    Главный сайт:  http://localhost:3000/
echo    Админка:       http://localhost:3000/admin.html
echo    POS касса:     http://localhost:3000/pos.html
echo    API:           http://localhost:3000/api
echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause
