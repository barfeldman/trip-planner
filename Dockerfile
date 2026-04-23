FROM node:20-alpine AS builder

WORKDIR /app

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci

COPY server/ ./server/

# Generate Prisma client
RUN cd server && npx prisma generate

# Build server
RUN cd server && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/client/dist ./client/dist

WORKDIR /app/server

# Create uploads directory
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/trip-planner.db"
ENV UPLOAD_DIR="/app/uploads"
ENV PORT=3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]

EXPOSE 3001
