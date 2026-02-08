# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native dependencies
RUN apk add --no-cache python3 make g++

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Install production dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Install build tools for native dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

# Stage 3: Production image
FROM node:20-alpine

WORKDIR /app

# Install system dependencies required for network scanning
# - arp-scan: The primary scanning tool
# - iputils: Provides standard 'ping' (replacing busybox ping for better compatibility)
RUN apk add --no-cache arp-scan iputils

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the application port
EXPOSE 3000

# Set environment variable to hint the app it's in Docker
ENV DOCKER_ENV=true

# Important: WOL and ARP scanning usually require host network mode.
# When running this container, use: docker run --network host ...
CMD ["npm", "run", "start:prod"]
