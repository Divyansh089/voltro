# ========================================
# Stage 1: Dependencies (Bun)
# ========================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

# Copy package configuration
COPY package.json ./

# Fast parallel dependency installation using Bun
RUN bun install

# ========================================
# Stage 2: Build
# ========================================
FROM oven/bun:1-alpine AS build

WORKDIR /app

# Copy dependencies and codebase
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client binary for Bun/Alpine with explicit schema path
RUN bunx prisma generate --schema=src/prisma/schema.prisma

# Compile TypeScript to JavaScript
RUN bun run build

# ========================================
# Stage 3: Production Runtime (Bun)
# ========================================
FROM oven/bun:1-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package config and install production-only dependencies
COPY package.json ./
RUN bun install --production

# Copy compiled dist and Prisma directory (schema & seed)
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/prisma ./src/prisma

# Re-generate Prisma Client inside production runtime stage
RUN bunx prisma generate --schema=src/prisma/schema.prisma

# Expose HTTP port
EXPOSE 3000

# Container Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Auto-sync database schema & seed initial data on boot if DATABASE_URL is set, then launch API server
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then echo 'Syncing database schema & seed...'; bunx prisma db push --schema=src/prisma/schema.prisma --accept-data-loss && bun run src/prisma/seed.ts; else echo 'DATABASE_URL not set, skipping migrations.'; fi && bun dist/server.js"]
