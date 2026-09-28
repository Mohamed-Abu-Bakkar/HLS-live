FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=5000

CMD ["node", "prod-server.js"]
