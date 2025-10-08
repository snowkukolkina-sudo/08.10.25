@echo off
chcp 65001 >nul
title DANDY PIZZA - HTTPS СЕРВЕР
color 0A

echo.
echo ═══════════════════════════════════════════════════════
echo     🔐 DANDY PIZZA - БЕЗОПАСНЫЙ HTTPS СЕРВЕР 🔐
echo ═══════════════════════════════════════════════════════
echo.

cd backend

echo 🔍 Проверка зависимостей...
if not exist node_modules\ (
    echo 📦 Установка зависимостей...
    call npm install
) else (
    echo ✅ Зависимости установлены
)

echo.
echo 🔐 Проверка SSL сертификата...
if not exist ssl\server.key (
    echo 📝 Генерация SSL сертификата...
    node generate-ssl-cert.js
) else (
    echo ✅ SSL сертификат найден
)

echo.
echo ═══════════════════════════════════════════════════════
echo     🚀 ЗАПУСК HTTPS СЕРВЕРА...
echo ═══════════════════════════════════════════════════════
echo.
echo 📌 Сервер будет доступен по адресам:
echo    • HTTP:  http://localhost:3000 (автоматически перенаправит на HTTPS)
echo    • HTTPS: https://localhost:3443
echo.
echo 📱 Страницы:
echo    • Админка: https://localhost:3443/admin.html
echo    • Касса:   https://localhost:3443/pos.html
echo    • Сайт:    https://localhost:3443/index.html
echo.
echo ⚠️  ВАЖНО: Браузер покажет предупреждение о сертификате.
echo    Это нормально для локальной разработки!
echo    Нажмите "Дополнительно" → "Продолжить"
echo.
echo ═══════════════════════════════════════════════════════
echo.

node src/index-https.js

pause
