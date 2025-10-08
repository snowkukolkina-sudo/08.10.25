// Скрипт для импорта фото из папки "роллы пиццы" на сайт
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'роллы пиццы';
const TARGET_DIR = 'assets/products';
const OUTPUT_JSON = 'products-data.json';

// Названия пицц (все что не подходит под другие категории - скорее всего пицца)
const PIZZA_NAMES = [
  'маргарита', 'пепперони', 'карбонара', 'гавайская', 'четыре сыра', 'баварская',
  'грибная', 'терияки', 'барбекю', 'халяль', 'хантер', 'челентано', 'беллучи',
  'болоньезе', 'восточная', 'джессика', 'джованни', 'дьяволита', 'кабанчик',
  'коза ностра', 'папай', 'портофино', 'сальмоне', 'супер марио', 'фантастика',
  'флорентини', 'фокачча', 'принцесса', 'сливочная', 'али', 'белла', 'горячий',
  'грин мун', 'с тунцом', 'цезарь', 'четриоло', 'чикен'
];

// Категории по ключевым словам
const CATEGORIES = {
  'пицца': 'Пицца',
  'ролл': 'Роллы',
  'сет': 'Сеты',
  'салат': 'Салаты',
  'поке': 'Поке',
  'сэндвич': 'Сэндвичи',
  'цезарь': 'Салаты',
  'том ям': 'Супы',
  'соус': 'Соусы',
  'напиток': 'Напитки',
  'картофель': 'Закуски',
  'картошка': 'Закуски',
  'крылья': 'Закуски',
  'крылбья': 'Закуски',
  'нагетс': 'Закуски',
  'стрипс': 'Закуски',
  'кольца': 'Закуски',
  'палочки': 'Закуски',
  'темпура': 'Роллы',
  'унаги': 'Роллы',
  'бонито': 'Роллы',
  'сяке': 'Роллы',
  'магуро': 'Роллы',
  'эби': 'Роллы',
  'ниндзя': 'Роллы',
  'краб': 'Роллы',
  'дрим': 'Роллы',
};

// Примерные цены по категориям
const PRICE_RANGES = {
  'Пицца': { min: 450, max: 890 },
  'Роллы': { min: 280, max: 580 },
  'Сеты': { min: 890, max: 1590 },
  'Салаты': { min: 280, max: 480 },
  'Поке': { min: 380, max: 580 },
  'Сэндвичи': { min: 280, max: 380 },
  'Супы': { min: 380, max: 480 },
  'Соусы': { min: 50, max: 80 },
  'Напитки': { min: 120, max: 280 },
  'Закуски': { min: 180, max: 380 },
};

function cleanFileName(filename) {
  // Убираем расширение и цифры в скобках
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/\s*\(\d+\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectCategory(filename) {
  const lower = filename.toLowerCase();
  
  // Сначала проверяем точные категории
  for (const [keyword, category] of Object.entries(CATEGORIES)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }
  
  // Если ничего не найдено, проверяем список известных пицц
  for (const pizzaName of PIZZA_NAMES) {
    if (lower.includes(pizzaName)) {
      return 'Пицца';
    }
  }
  
  return 'Другое';
}

function generatePrice(category) {
  const range = PRICE_RANGES[category] || { min: 200, max: 500 };
  const price = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  // Округляем до 9 (красивая цена)
  return Math.floor(price / 10) * 10 - 1;
}

function copyFiles(sourceDir, targetDir, relativePath = '') {
  const products = [];
  const fullSourcePath = path.join(sourceDir, relativePath);
  
  if (!fs.existsSync(fullSourcePath)) {
    console.log(`❌ Папка не найдена: ${fullSourcePath}`);
    return products;
  }

  const items = fs.readdirSync(fullSourcePath);
  
  for (const item of items) {
    const sourcePath = path.join(fullSourcePath, item);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Пропускаем папку Ингридиенты (там только сырье)
      if (item === 'Ингридиенты') continue;
      
      // Рекурсивно обрабатываем подпапки
      const subProducts = copyFiles(sourceDir, targetDir, path.join(relativePath, item));
      products.push(...subProducts);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      
      // Только изображения
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const cleanName = cleanFileName(item);
        const category = detectCategory(cleanName);
        
        // Пропускаем ингредиенты и служебные файлы
        if (cleanName.length < 3 || cleanName.match(/^\d+$/)) continue;
        
        // Новое имя файла (латиница)
        const newFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
        const targetPath = path.join(targetDir, newFileName);
        
        // Копируем файл
        try {
          fs.copyFileSync(sourcePath, targetPath);
          
          const product = {
            id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: cleanName,
            category: category,
            price: generatePrice(category),
            image: `assets/products/${newFileName}`,
            description: `${cleanName} - вкусный и свежий продукт от DANDY Pizza`,
            weight: category === 'Пицца' ? '550г' : category === 'Роллы' ? '280г' : '',
            available: true
          };
          
          products.push(product);
          console.log(`✅ ${cleanName} → ${category} (${product.price}₽)`);
        } catch (err) {
          console.error(`❌ Ошибка копирования ${item}:`, err.message);
        }
      }
    }
  }
  
  return products;
}

// Основная функция
function main() {
  console.log('🚀 Импорт фотографий товаров...\n');
  
  // Создаём целевую папку если нужно
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  
  // Копируем файлы
  const products = copyFiles(SOURCE_DIR, TARGET_DIR);
  
  // Сохраняем JSON
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(products, null, 2), 'utf-8');
  
  console.log(`\n✅ Готово!`);
  console.log(`📦 Добавлено товаров: ${products.length}`);
  console.log(`📁 Фото сохранены в: ${TARGET_DIR}`);
  console.log(`📄 Данные сохранены в: ${OUTPUT_JSON}`);
  
  // Статистика по категориям
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  
  console.log('\n📊 По категориям:');
  Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} шт.`);
  });
}

main();
