FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN mkdir -p src/uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
