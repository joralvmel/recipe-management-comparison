# Use an official Node.js image based on Alpine for a lightweight image.
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Compile the TypeScript code
RUN npm run build

# Expose the port that the application will use
EXPOSE 3000

# Command to start the application
CMD [ "npm", "start" ]