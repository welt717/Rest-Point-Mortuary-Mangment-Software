# Use official Node.js 20 image with Alpine (small size)
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 8000
EXPOSE 5000

# Run the server when the container starts
CMD ["node", "index.js"]