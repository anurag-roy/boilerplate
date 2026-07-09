# syntax=docker/dockerfile:1

FROM node:26-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

RUN npm ci && npm --prefix client ci

COPY tsconfig.json ./
COPY server ./server
COPY client ./client

# Same outcome as server/scripts/build.ts: build the Vite client into client/dist
RUN npm --prefix client run build

FROM node:26-bookworm-slim AS runner
WORKDIR /app

# Install before NODE_ENV=production so tsx / drizzle-kit (devDependencies) are included
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY tsconfig.json drizzle.config.ts docker-entrypoint.sh ./
COPY server ./server
COPY --from=build /app/client/dist ./client/dist

RUN chmod +x docker-entrypoint.sh && mkdir -p .data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:.data/database.db

EXPOSE 3000
VOLUME ["/app/.data"]

ENTRYPOINT ["./docker-entrypoint.sh"]
