# syntax=docker/dockerfile:1

FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY client/package.json client/bun.lock ./client/

RUN bun install --frozen-lockfile && bun install --frozen-lockfile --cwd client

COPY tsconfig.json ./
COPY server ./server
COPY client ./client

# Same outcome as server/scripts/build.ts: build the Vite client into client/dist
RUN bun run --cwd client build

FROM oven/bun:1 AS runner
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

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
