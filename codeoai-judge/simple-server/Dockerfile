FROM node:18-slim

# Install compilers for our 5 languages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    default-jdk \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create temp directory
RUN mkdir -p temp

ENV PORT=2358
EXPOSE 2358

CMD ["npm", "start"]