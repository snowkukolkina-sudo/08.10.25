@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════╗
echo ║   🍕 ИМПОРТ ФОТО ТОВАРОВ НА САЙТ           ║
echo ╚════════════════════════════════════════════╝
echo.
echo 📁 Импорт из папки "роллы пиццы"...
echo.

node import-products.js

echo.
echo ✅ Готово! Фото скопированы в assets/products
echo 📄 Данные сохранены в products-data.json
echo.
echo 🌐 Запустите сайт чтобы увидеть изменения:
echo    - ПРОСТОЙ_ЗАПУСК.bat
echo    - или ЗАПУСК_И_ОТКРЫТЬ.bat
echo.
pause
