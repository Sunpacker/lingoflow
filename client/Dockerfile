# Файл: /llm-chat-monorepo/client/Dockerfile

# --- 1. Сборка (Build Stage) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# --- 2. Продакшен-образ (Production Stage) ---
FROM node:20-alpine AS production

WORKDIR /app

# Копирование только необходимых файлов для запуска
COPY --from=builder /app/.output ./
COPY --from=builder /app/node_modules ./node_modules

# Установка переменных окружения
ENV NODE_ENV production
ENV HOST 0.0.0.0
ENV PORT 3000

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["node", "server/index.mjs"]
