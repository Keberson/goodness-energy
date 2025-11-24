FROM node:24-alpine

WORKDIR /app

ENV VITE_IS_PRODUCTION=true

COPY .npmrc ./
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
