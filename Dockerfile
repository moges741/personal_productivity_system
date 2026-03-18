FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client (fixes earlier error)
RUN npx prisma generate

# Build the app (creates dist/main.js)
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install only production deps
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Explicit .js — this is the key fix for Render
CMD ["node", "dist/main.js"]