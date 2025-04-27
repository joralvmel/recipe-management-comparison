# Stage 1: Build
FROM node:20 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend-react/package.json ./
COPY frontend-react/package-lock.json ./
COPY frontend-react/tsconfig.json ./
COPY frontend-react/vite.config.ts ./
COPY shared-styles /shared-styles

# Install dependencies with clean install
RUN npm ci

# Copy the rest of the application files
COPY frontend-react ./

# Build the application
RUN npm run build

# List the contents of the build directory for verification
RUN ls -l /app/dist

# Stage 2: Serve the application
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# List the contents of the Nginx root directory for verification
RUN ls -l /usr/share/nginx/html

# Copy the Nginx configuration file
COPY frontend-react/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]