FROM node:22-bullseye-slim as base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build stage
FROM base as builder
COPY . .
# We don't have a build step for the backend in package.json other than tsc for lint
# But tsx runs it directly. So we just need the source code.

# Production stage
FROM base as production
# We need to run the server.ts using tsx
RUN npm install -g tsx
COPY . .

EXPOSE 3000
CMD ["tsx", "server.ts"]
