# =============================================================
# Stage 1: Base image
# =============================================================
FROM node:20-alpine AS base

# Install libc6-compat for compatibility with Alpine musl
RUN apk add --no-cache libc6-compat

WORKDIR /app

# =============================================================
# Stage 2: Install dependencies
# =============================================================
FROM base AS deps
WORKDIR /app

# Copy dependency manifests and npm configuration
COPY package.json package-lock.json .npmrc* ./

# Install clean, exact dependencies
RUN npm ci

# =============================================================
# Stage 3: Development target (hot-reloading with mounted volume)
# =============================================================
FROM base AS dev
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"]

# =============================================================
# Stage 4: Builder
# =============================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate fresh Prisma Client for Linux runtime
RUN npx prisma generate

# Next.js telemetry disable & production build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# =============================================================
# Stage 5: Production runner (minimal standalone image)
# =============================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create secure non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static files & public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prepare writable Next.js cache directory
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Container health check using built-in busybox wget
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health?liveness=true || exit 1

CMD ["node", "server.js"]
