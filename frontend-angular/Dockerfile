# Stage 1: Build the Angular application
FROM node:20 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY frontend-angular/package*.json ./
RUN npm ci

# Copy all configuration files
COPY frontend-angular/.env ./
COPY frontend-angular/*.json ./
COPY frontend-angular/*.js ./
COPY frontend-angular/*.ts ./

# Copy source files
COPY frontend-angular/src ./src
COPY frontend-angular/public ./public
COPY shared-styles/ /shared-styles/

# Build the Angular application
RUN npm run build

# Find the build output directory
RUN find dist -name "index.html" > build_path.txt

# Stage 2: Run in Nginx
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build files
COPY --from=build /app/dist /app/dist
COPY --from=build /app/build_path.txt /tmp/build_path.txt

# Copy build files to nginx directory
RUN BUILD_PATH=$(cat /tmp/build_path.txt | sed 's/\/index.html//') && \
    echo "Copying Angular files from: $BUILD_PATH" && \
    cp -r /app/$BUILD_PATH/* /usr/share/nginx/html/

# Copy nginx configuration
COPY frontend-angular/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
