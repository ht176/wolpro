# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-slim

WORKDIR /app

# Install system dependencies required for network scanning
# - arp-scan: The primary scanning tool
# - iputils-ping: For the fallback ping sweep method
# - net-tools: Useful for debugging (ifconfig, arp, etc.)
RUN apt-get update && apt-get install -y \
    arp-scan \
    iputils-ping \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the application port
EXPOSE 3000

# Set environment variable to hint the app it's in Docker
ENV DOCKER_ENV=true

# Important: WOL and ARP scanning usually require host network mode.
# When running this container, use: docker run --network host ...
CMD ["npm", "run", "start:prod"]
