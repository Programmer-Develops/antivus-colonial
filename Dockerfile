FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy built client (run npm run build locally first)
COPY server/ ./server/

EXPOSE 3000
CMD ["node", "server/index.js"]