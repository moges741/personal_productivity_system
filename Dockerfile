# Stage 1: Build the app
FROM node:20-alpine AS builder

# Set working directory to /app (Render default)
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Production image (smaller, secure)
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only production dependencies + built files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma   # if you have Prisma schema/migrations

# Install only production dependencies
RUN npm ci --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port Render expects
EXPOSE 10000

# Start the application
CMD ["node", "dist/main"]