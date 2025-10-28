# Multi-stage build for Getrafty static site
# Stage 1: Build the static site with Deno and Lume
FROM denoland/deno:2.1.4 AS builder

WORKDIR /app

# Copy configuration files
COPY deno.json deno.lock* ./
COPY _config.js ./

# Copy source files
COPY src/ ./src/

# Cache dependencies
RUN deno cache --lock=deno.lock _config.js || deno cache _config.js

# Build the static site
RUN deno task build

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine

# Copy built static files from builder stage
COPY --from=builder /app/_site /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
