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

# Create a non-root user with UID 10014 to satisfy Choreo's platform policy
RUN adduser -u 10014 -D choreouser

COPY --chown=10014:10014 server/package*.json ./server/
RUN cd server && npm install --production

COPY --chown=10014:10014 server/ ./server/
COPY --chown=10014:10014 --from=builder /app/server/public ./server/public

# Run as non-root user 10014
USER 10014

EXPOSE 3000
CMD ["node", "server/index.js"]