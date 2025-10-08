@echo off
chcp 65001 >nul

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║         🚀 Запуск DANDY POS Server                      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Убиваем старые процессы Node.js
taskkill /F /IM node.exe >nul 2>nul

REM Запускаем сервер в новом окне
echo Запуск сервера в отдельном окне...
start "DANDY POS Server" "%~dp0ЗАПУСК_СЕРВЕРА_v2.bat"

REM Ждем немного чтобы сервер запустился
echo Ожидание запуска сервера...
timeout /t 5 /nobreak >nul

REM Проверяем что сервер запустился
netstat -an | find ":3000" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Сервер запущен успешно!
    echo.
    echo Открытие браузера...
    echo.
    
    REM Открываем браузер
    start "" "http://localhost:3000/"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:3000/admin.html"
    
    echo.
    echo ✅ Готово!
    echo.
    echo 📝 Данные для входа:
    echo    Логин: 111
    echo    Пароль: 111
    echo    Сайт: 111
    echo.
    echo 💡 Окно сервера можно свернуть, но не закрывать!
    echo.
) else (
    echo ❌ Ошибка: Сервер не запустился!
    echo Проверьте окно сервера для деталей.
    echo.
)

timeout /t 3
