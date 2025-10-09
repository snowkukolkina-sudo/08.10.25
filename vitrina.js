// vitrina.js: Отображение витрины товаров на основе данных из localStorage
// Эта скрипт загружает товары из ключа `menu_items` в localStorage и
// строит карточки с учётом выбранной формы (круг, квадрат, овал) и
// удаления фона. Карточка показывает название, описание, вес, калорийность,
// цену и кнопку добавления в корзину.

// Получить список товаров из localStorage. Если данных нет, вернуть пустой массив.
function getMenuItems() {
  try {
    const raw = localStorage.getItem('menu_items');
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.error('Не удалось распарсить menu_items', err);
    return [];
  }
}

// Вычисление минимальной цены. В демо товары могут иметь разные варианты цены
// (например, разные размеры). Мы выбираем минимальное значение, если поле
// представлено массивом объектов или строками.
function computeMinPrice(item) {
  const price = item.price;
  if (Array.isArray(price)) {
    // массив чисел или объектов {price: ...}
    return price.reduce((min, p) => {
      const val = typeof p === 'object' ? parseFloat(p.price || p.value) : parseFloat(p);
      return isNaN(val) ? min : Math.min(min, val);
    }, Infinity);
  }
  const val = parseFloat(price);
  return isNaN(val) ? 0 : val;
}

// Рендер витрины
function renderVitrina() {
  const container = document.getElementById('vitrina-container');
  if (!container) return;
  container.innerHTML = '';
  const items = getMenuItems();
  items.forEach((item, index) => {
    // Подготовить данные
    const title = item.name || item.title || 'Без названия';
    const description = item.description || '';
    const weight = item.weight ? `${item.weight}г` : '';
    const calories = item.calories ? `${item.calories} ккал` : '';
    const price = computeMinPrice(item);
    // выбрать изображение
    const imgSrc = item.image || item.picture || item.img || '';
    // Выбрать форму: square, circle, oval или none
    const shape = item.shape || 'square';
    let shapeClass = '';
    // Если фон уже удалён (hasBgRemoved == true), не применяем маску
    if (!item.hasBgRemoved && shape !== 'none') {
      switch (shape) {
        case 'circle':
          shapeClass = 'circle-mask';
          break;
        case 'oval':
          shapeClass = 'oval-mask';
          break;
        case 'square':
        default:
          shapeClass = 'square-mask';
          break;
      }
    }
    // Создать карточку
    const card = document.createElement('div');
    card.className = 'card';
    // Блок изображения
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-image ' + shapeClass;
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = title;
      imgContainer.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder';
      imgContainer.appendChild(placeholder);
    }
    card.appendChild(imgContainer);
    // Название
    const titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = title;
    card.appendChild(titleEl);
    // Описание
    if (description) {
      const descEl = document.createElement('div');
      descEl.className = 'card-desc';
      descEl.innerHTML = description;
      card.appendChild(descEl);
    }
    // Информация о весе и калориях
    if (weight || calories) {
      const infoEl = document.createElement('div');
      infoEl.className = 'card-info';
      infoEl.textContent = [weight, calories].filter(Boolean).join(' • ');
      card.appendChild(infoEl);
    }
    // Нижний блок с ценой и кнопкой
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const priceEl = document.createElement('div');
    priceEl.className = 'price';
    priceEl.textContent = price > 0 ? `от ${price}₽` : '';
    const btn = document.createElement('div');
    btn.className = 'add-btn';
    btn.textContent = 'В корзину';
    btn.onclick = () => openItem(index);
    footer.appendChild(priceEl);
    footer.appendChild(btn);
    card.appendChild(footer);
    container.appendChild(card);
  });
}

// Функция, вызываемая при клике на кнопку "В корзину"
function openItem(index) {
  // Можно реализовать открытие карточки товара или добавление в корзину.
  // В демо просто выводим название товара.
  const items = getMenuItems();
  const item = items[index];
  alert(`Вы выбрали: ${item.name || item.title}`);
}

// Инициализация витрины после загрузки страницы
document.addEventListener('DOMContentLoaded', renderVitrina);
