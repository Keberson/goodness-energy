FROM node:24-alpine

WORKDIR /app

# Принимаем build аргумент для API base URL
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY .npmrc ./
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
