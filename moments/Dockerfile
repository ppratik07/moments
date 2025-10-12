# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm install

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all files
COPY . .
# Build Next.js application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app
# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Expose port
EXPOSE 3000
CMD ["npm", "run", "dev"]