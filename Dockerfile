# Use official Node.js 20 Alpine image (lightweight, secure)
FROM node:20-alpine AS builder

# Set working directory (Render uses /app)
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install ALL dependencies (dev + prod) for build
RUN npm ci

# Copy the rest of the project
COPY . .

# Generate Prisma client (important!)
RUN npx prisma generate

# Build the NestJS app (creates dist/)
RUN npm run build

# Stage 2: Production image (smaller)
FROM node:20-alpine

WORKDIR /app

# Copy only what's needed for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose Render's required port
EXPOSE 10000

# Start command (must match your package.json "start:prod")
CMD ["node", "dist/main"]