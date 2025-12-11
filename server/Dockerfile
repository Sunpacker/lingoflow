# Файл: /llm-chat-monorepo/server/Dockerfile

# --- 1. Сборка (Build Stage) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения (транспиляция TypeScript)
RUN npm run build

# --- 2. Продакшен-образ (Production Stage) ---
FROM node:20-alpine AS production

WORKDIR /app

# Установка только production-зависимостей
COPY package*.json ./
RUN npm install --only=production

# Копирование собранного кода и файлов запуска
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env

# Установка переменных окружения
ENV NODE_ENV production
ENV PORT 3001

# Открытие порта
EXPOSE 3001

# Запуск приложения
CMD ["node", "dist/main"]
