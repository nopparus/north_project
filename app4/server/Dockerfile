FROM node:22-bullseye-slim

WORKDIR /app

# Copy package files (from app4/server context)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3004

# Start command (Port 3004 is hardcoded in index.js or via env)
ENV PORT=3004
CMD ["node", "index.js"]
