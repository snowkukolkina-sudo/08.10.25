@echo off
chcp 65001 >nul
title DANDY PIZZA - HTTP СЕРВЕР
color 0A

echo.
echo ═══════════════════════════════════════════════════════
echo        🚀 DANDY PIZZA - ЛОКАЛЬНЫЙ СЕРВЕР 🚀
echo ═══════════════════════════════════════════════════════
echo.

REM Останавливаем старые серверы
echo 🛑 Остановка старых серверов...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo ✅ Запуск HTTP сервера...
cd backend

start "DANDY HTTP Server" powershell -NoExit -Command "node src\index-simple-full.js"

timeout /t 3 /nobreak >nul

echo.
echo 🌐 Открываем браузер...
start http://localhost:3000/admin.html
start http://localhost:3000/pos.html

echo.
echo ═══════════════════════════════════════════════════════
echo ✅ HTTP сервер запущен в отдельном окне!
echo.
echo 📱 Страницы:
echo    • Админка: http://localhost:3000/admin.html
echo    • Касса:   http://localhost:3000/pos.html
echo    • Сайт:    http://localhost:3000/index.html
echo.
echo 💡 Обычный HTTP без SSL (для локальной разработки)
echo ═══════════════════════════════════════════════════════
echo.
pause
