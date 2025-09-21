# Frontend build stage
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:frontend

# Backend production stage
FROM node:18-alpine

# Install FFmpeg in the Alpine Linux container
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy backend files
COPY server/ ./server/
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built frontend to serve statically
COPY --from=frontend-builder /app/frontend/dist-frontend ./frontend-dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the server
CMD ["npm", "start"]
