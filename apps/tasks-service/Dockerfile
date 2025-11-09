# Stage 1: Development
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/tasks-service ./apps/tasks-service

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3003

# Default command for development
CMD ["npm", "run", "dev", "--workspace=tasks-service"]

# Stage 2: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/tasks-service ./apps/tasks-service

# Install dependencies
RUN npm install

# Build the application
RUN npm run build --workspace=tasks-service

# Stage 3: Production
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application
COPY --from=build /app/apps/tasks-service/dist ./dist
COPY --from=build /app/apps/tasks-service/migrations ./migrations
COPY --from=build /app/packages ./packages

# Expose port
EXPOSE 3003

# Start the application
CMD ["node", "dist/main"]
