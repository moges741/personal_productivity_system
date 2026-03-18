FROM node:20-alpine

WORKDIR /app

# Copy from subfolder context
COPY productivity-backend/package*.json ./
RUN npm ci

COPY productivity-backend/ .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["npm", "run", "start:prod"]