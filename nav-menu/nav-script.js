/*
 * Interaction logic for the condensed & small navigation bar.  
 * Applies the correct slider width according to the horizontal scale factor
 * specified in CSS and keeps the active tab in view.
 * Updated: console.log messages removed
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const slider = document.querySelector('.slider');
  const wrap = document.querySelector('.tabs-wrap');

  // Проверяем, что все элементы найдены
  if (!tabs.length || !slider || !wrap) {
    return;
  }


  function activateTab(tab) {
    // Убираем активный класс со всех табов
    tabs.forEach(t => t.classList.remove('active'));
    // Добавляем активный класс к выбранному табу
    tab.classList.add('active');
    
    // Получаем размеры и позицию таба
    const rect = tab.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const offset = tab.offsetLeft;
    const scaleX = parseFloat(getComputedStyle(tab).getPropertyValue('--scale-x')) || 1;
    
    // Вычисляем ширину слайдера с учетом масштабирования
    const sliderWidth = rect.width * scaleX;
    
    // Устанавливаем стили слайдера
    slider.style.width = `${sliderWidth}px`;
    slider.style.transform = `translateX(${offset}px)`;
    
    // Делаем слайдер видимым
    slider.style.opacity = '1';
    slider.style.display = 'block';
  }

  function scrollIntoViewIfNeeded(tab) {
    const wrapRect = wrap.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const wrapScrollLeft = wrap.scrollLeft;
    
    // Вычисляем позицию таба относительно контейнера
    const tabLeft = tabRect.left - wrapRect.left + wrapScrollLeft;
    const tabRight = tabRect.right - wrapRect.left + wrapScrollLeft;
    const wrapWidth = wrapRect.width;
    
    // Центрируем таб в видимой области
    const tabCenter = tabLeft + (tabRect.width / 2);
    const wrapCenter = wrapWidth / 2;
    const targetScroll = tabCenter - wrapCenter;
    
    // Прокручиваем к центрированной позиции
    wrap.scrollTo({ 
      left: Math.max(0, targetScroll), 
      behavior: 'smooth' 
    });
  }

  // Инициализируем первый активный таб
  const activeTab = tabs.find(tab => tab.classList.contains('active')) || tabs[0];
  if (activeTab) {
    activateTab(activeTab);
  }

  // Маппинг табов на категории
  const tabCategories = {
    'ВСЕ': 'all',
    'ХИТЫ': '40263810',
    'НОВИНКИ': '40270774',
    'ВОК': '40270432',
    'ПИЦЦА': '40263794',
    'СЕТЫ': '40263779',
    'МАКИ': '40263778',
    'ЗАПЕЧЕННЫЕ': '40263772',
    'ТЕМПУРА': '40263773',
    'ГУНКАНЫ': '40263781',
    'СУШИ': '40263788',
    'ЗАКУСКИ': '40263783',
    'СЭНДВИЧИ': '40263770',
    'САЛАТЫ': '40263769',
    'СУПЫ': '40263787',
    'НАПИТКИ': '40263782',
    'СОУСЫ': '40263789',
    'ЗАВТРАКИ': '40270772',
    'БЛИНЫ': '40270773',
    'ДЕТЯМ': '40280199',
    '7 ПИЦЦА': '40263794',
    'ПИРОГИ': '40270774',
    'КОМБО': '1',
    'РОЛЛЫ': '40263778'
  };

  // Добавляем обработчики кликов
  tabs.forEach(tab => {
    tab.addEventListener('click', evt => {
      evt.preventDefault();
      evt.stopPropagation();
      
      const tabText = tab.textContent.trim();
      const category = tabCategories[tabText];
      
      // Если это кнопка "ВСЕ" и мы не на главной странице, переходим на главную
      if (tabText === 'ВСЕ' && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
        return;
      }
      
      activateTab(tab);
      
      // Фильтруем карточки по категории
      if (category && typeof filterCat === 'function') {
        filterCat(category);
      }
      
      // Небольшая задержка для корректного позиционирования
      setTimeout(() => {
        scrollIntoViewIfNeeded(tab);
      }, 100);
    });
  });

  // Добавляем обработчик для клавиатурной навигации
  tabs.forEach(tab => {
    tab.addEventListener('keydown', evt => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        
        const tabText = tab.textContent.trim();
        const category = tabCategories[tabText];
        
        // Если это кнопка "ВСЕ" и мы не на главной странице, переходим на главную
        if (tabText === 'ВСЕ' && !window.location.pathname.includes('index.html')) {
          window.location.href = 'index.html';
          return;
        }
        
        activateTab(tab);
        
        // Фильтруем карточки по категории
        if (category && typeof filterCat === 'function') {
          filterCat(category);
        }
        
        scrollIntoViewIfNeeded(tab);
      }
    });
  });


  // Обработчик изменения размера окна
  window.addEventListener('resize', () => {
    const activeTab = tabs.find(tab => tab.classList.contains('active'));
    if (activeTab) {
      activateTab(activeTab);
    }
  });
});