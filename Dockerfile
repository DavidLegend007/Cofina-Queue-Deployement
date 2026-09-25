# Étape 1 : Construction du Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Construction du Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# Étape 3 : Image de Production Minimale
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Dépendances système pour SQLite
RUN apk add --no-cache openssl

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/prisma ./server/prisma
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 4000
WORKDIR /app/server
CMD ["node", "dist/server.js"]
