/**
 * ГЕНЕРАЦИЯ SSL СЕРТИФИКАТА ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ
 * Создаёт самоподписанный сертификат для HTTPS
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');

console.log('🔐 Генерация SSL сертификата для локальной разработки...');

// Создаём директорию ssl если её нет
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
    console.log('✅ Директория ssl создана');
}

// Проверяем наличие OpenSSL
exec('openssl version', (error, stdout) => {
    if (error) {
        console.log('\n❌ OpenSSL не установлен!');
        console.log('\n📥 Для Windows скачайте: https://slproweb.com/products/Win32OpenSSL.html');
        console.log('\n📝 Или используйте встроенный Node.js генератор...');
        
        // Альтернатива: использовать встроенный selfsigned пакет
        generateWithNode();
    } else {
        console.log(`✅ OpenSSL найден: ${stdout.trim()}`);
        generateWithOpenSSL();
    }
});

function generateWithOpenSSL() {
    const keyPath = path.join(sslDir, 'server.key');
    const certPath = path.join(sslDir, 'server.cert');

    const command = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=DANDY Pizza/OU=IT/CN=localhost"`;

    exec(command, (error) => {
        if (error) {
            console.error('❌ Ошибка генерации:', error);
            console.log('\n📝 Пробуем альтернативный метод...');
            generateWithNode();
        } else {
            console.log('\n✅ SSL сертификат создан успешно!');
            console.log(`📄 Ключ: ${keyPath}`);
            console.log(`📄 Сертификат: ${certPath}`);
            console.log('\n🎉 Готово! Теперь можно запускать HTTPS сервер!');
        }
    });
}

function generateWithNode() {
    console.log('\n📦 Устанавливаем пакет для генерации...');
    
    exec('npm install selfsigned --save-dev', (error) => {
        if (error) {
            console.error('❌ Ошибка установки пакета:', error);
            return;
        }

        console.log('✅ Пакет установлен');
        
        const selfsigned = require('selfsigned');
        const attrs = [
            { name: 'commonName', value: 'localhost' },
            { name: 'countryName', value: 'RU' },
            { name: 'stateOrProvinceName', value: 'Moscow' },
            { name: 'localityName', value: 'Moscow' },
            { name: 'organizationName', value: 'DANDY Pizza' }
        ];

        const pems = selfsigned.generate(attrs, { 
            days: 365,
            keySize: 2048,
            algorithm: 'sha256'
        });

        const keyPath = path.join(sslDir, 'server.key');
        const certPath = path.join(sslDir, 'server.cert');

        fs.writeFileSync(keyPath, pems.private);
        fs.writeFileSync(certPath, pems.cert);

        console.log('\n✅ SSL сертификат создан успешно!');
        console.log(`📄 Ключ: ${keyPath}`);
        console.log(`📄 Сертификат: ${certPath}`);
        console.log('\n🎉 Готово! Теперь можно запускать HTTPS сервер!');
    });
}
