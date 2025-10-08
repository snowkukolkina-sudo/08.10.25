@echo off
chcp 65001 >nul
title DANDY PIZZA - ПРОСТОЙ СЕРВЕР
color 0A

echo.
echo ═══════════════════════════════════════════════════════
echo        🍕 DANDY PIZZA - ПРОСТОЙ ЗАПУСК 🍕
echo ═══════════════════════════════════════════════════════
echo.

REM Останавливаем старые серверы
taskkill /F /IM node.exe 2>nul >nul
timeout /t 1 /nobreak >nul

echo 🚀 Запуск сервера...
cd backend

REM Запускаем сервер в новом окне
start "DANDY Server" cmd /k "node src\index-simple-full.js"

echo ⏳ Ждём запуска сервера...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Открываем браузер...
start http://localhost:3000/admin.html
start http://localhost:3000/pos.html

echo.
echo ═══════════════════════════════════════════════════════
echo ✅ Сервер запущен!
echo.
echo 📱 Ссылки:
echo    • Админка: http://localhost:3000/admin.html
echo    • Касса:   http://localhost:3000/pos.html
echo    • Сайт:    http://localhost:3000/index.html
echo.
echo 💡 Простой HTTP сервер (без БД, без HTTPS)
echo    Все данные в памяти - для разработки
echo ═══════════════════════════════════════════════════════
echo.
pause
