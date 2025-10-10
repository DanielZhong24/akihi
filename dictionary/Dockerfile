# Use node base image
FROM node:22

# Set workdir
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files and zip
COPY . .

# Unzip JSON at build time
RUN apt-get update && apt-get install -y unzip \
    && unzip jmdict.json.zip -d ./ \
    && rm jmdict.json.zip

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
