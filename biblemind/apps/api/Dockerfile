# BibleMind API Dockerfile

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 biblemind

# Copy built assets
COPY --from=builder --chown=biblemind:nodejs /app/dist ./dist
COPY --from=builder --chown=biblemind:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=biblemind:nodejs /app/package.json ./package.json

USER biblemind

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
