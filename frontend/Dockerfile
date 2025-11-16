FROM node:24-alpine

WORKDIR /app

COPY .npmrc ./
COPY package*.json ./
RUN npm ci

COPY . .

# Переменные окружения для сборки (можно переопределить через --build-arg)
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build
