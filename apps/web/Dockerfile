# Multi-stage Dockerfile for React + Vite application

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Enable Corepack for npm workspace support
RUN corepack enable

# Stage 2: Dependencies
FROM base AS deps

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package files
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Stage 3: Builder
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source code
COPY turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

# Build shared packages first
RUN npm run build --workspace=@repo/types
RUN npm run build --workspace=@repo/utils

# Build web application
RUN npm run build --workspace=web

# Stage 4: Development
FROM base AS development
WORKDIR /app

# Copy everything
COPY --from=deps /app ./
COPY . .

# Expose development port
EXPOSE 3000

ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--workspace=web"]

# Stage 5: Production
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose production port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
