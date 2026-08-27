# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev for build)
RUN npm ci

# ========================================
# Stage 2: Build
# ========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# ========================================
# Stage 3: Production
# ========================================
FROM node:20-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 voltra

# Copy only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production && npm cache clean --force

# Copy built application & schema
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/prisma/schema.prisma ./src/prisma/schema.prisma

# Re-generate Prisma Client in production stage for runtime compatibility
RUN npx prisma generate

# Set permissions for non-root user
RUN chown -R voltra:nodejs /app

# Switch to non-root user
USER voltra

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Run migrations automatically on startup, then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
