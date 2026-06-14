# Stage 1: Build the client assets
FROM node:20-alpine AS builder
WORKDIR /app

RUN mkdir -p client server

COPY client/package*.json ./client/
RUN cd client && npm install

COPY client/ ./client/
COPY server/ ./server/
RUN cd client && npm run build

# Stage 2: Set up the production runtime
FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY server/ ./server/
COPY --from=builder /app/server/public ./server/public

EXPOSE 3000
CMD ["node", "server/index.js"]