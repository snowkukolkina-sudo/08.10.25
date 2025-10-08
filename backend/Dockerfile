FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Создание директорий для загрузок
RUN mkdir -p uploads/images uploads/documents
RUN chown -R nodejs:nodejs uploads

# Переключение на пользователя nodejs
USER nodejs

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
