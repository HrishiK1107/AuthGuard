# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build production assets
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend into /dashboard
COPY --from=builder /app/dist /usr/share/nginx/html/dashboard

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
