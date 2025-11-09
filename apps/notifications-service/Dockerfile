# Stage 1: Development
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/notifications-service ./apps/notifications-service

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3004

# Default command for development
CMD ["npm", "run", "dev", "--workspace=notifications-service"]

# Stage 2: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/notifications-service ./apps/notifications-service

# Install dependencies
RUN npm install

# Build the application
RUN npm run build --workspace=notifications-service

# Stage 3: Production
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application
COPY --from=build /app/apps/notifications-service/dist ./dist
COPY --from=build /app/apps/notifications-service/migrations ./migrations
COPY --from=build /app/packages ./packages

# Expose port
EXPOSE 3004

# Start the application
CMD ["node", "dist/main"]
