@echo off
chcp 65001 >nul
title Открыть DANDY POS в браузере

color 0E
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║         🌐 Открытие DANDY POS в браузере                ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Проверяем запущен ли сервер
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  ВНИМАНИЕ: Сервер не запущен!
    echo.
    echo Хотите запустить сервер? (Y/N)
    choice /C YN /N
    if errorlevel 2 goto end
    if errorlevel 1 (
        echo.
        echo Запуск сервера...
        start "" "%~dp0ЗАПУСК_СЕРВЕРА.bat"
        timeout /t 5 /nobreak >nul
    )
)

echo.
echo Открытие страниц в браузере...
echo.

REM Открываем главный сайт
echo 🏠 Главный сайт...
start "" "http://localhost:3000/"

REM Ждем немного
timeout /t 2 /nobreak >nul

REM Открываем админку
echo ⚙️  Админка...
start "" "http://localhost:3000/admin.html"

REM Ждем немного
timeout /t 2 /nobreak >nul

REM Открываем POS кассу
echo 💰 POS касса...
start "" "http://localhost:3000/pos.html"

echo.
echo ✅ Все страницы открыты!
echo.
echo 📝 Логин для админки: 111
echo 📝 Пароль: 111
echo 📝 Сайт: 111
echo.

:end
timeout /t 3
