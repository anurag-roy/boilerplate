# Boilerplate

An agent-friendly full-stack TypeScript starter for new apps. The included to-do UI is a thin demo of the stack and conventions — not the product.

This repository is a working baseline rather than a hard-coded generator. Node.js, SQLite, and a single-server deployment are sensible defaults, but an agent can adapt the runtime, database, deployment model, and integrations to the needs of each project while preserving a consistent architecture.

## Stack

| Layer         | Choice                                                     |
| ------------- | ---------------------------------------------------------- |
| Runtime       | Node.js + TypeScript                                       |
| API           | [Hono](https://hono.dev/) with RPC type generation         |
| Database      | [Drizzle ORM](https://orm.drizzle.team/) + SQLite (libSQL) |
| Validation    | Zod v4                                                     |
| Frontend      | Vite 8 + React 19 (React Compiler)                         |
| UI            | shadcn/ui (Base UI) + Tailwind CSS v4                      |
| Routing       | TanStack Router                                            |
| Data fetching | TanStack Query                                             |
| Lint / format | Oxlint / Oxfmt                                             |

## Shape the project

Start from this repository and tell an agent what you are building. The guidance in [`AGENTS.md`](AGENTS.md) asks the agent to clarify choices such as:

- Node.js or Bun
- SQLite, PostgreSQL, or MySQL
- A single VPS/container or separately hosted client and API
- Optional integrations such as WebSockets, authentication, and email

Hono remains the backend framework and React remains the frontend framework; the surrounding infrastructure is intentionally replaceable. The first included setup recipes cover the Bun runtime and WebSockets, with more integrations intended to be added over time.

## Layout

```
├── client/           # Vite + React app
│   └── src/
│       ├── components/
│       ├── lib/      # API client, query helpers
│       └── routes/
├── server/           # Hono API + static serving
│   ├── db/           # Drizzle schema & client
│   ├── lib/          # env, logger, middlewares
│   ├── routes/       # Route handlers (chained for RPC)
│   └── shared/       # Schemas & types shared with the client
└── AGENTS.md         # Project conventions and setup recipes
```

Shared code lives under `server/shared/` and is imported as `@shared/*`. Server code uses `@server/*`.

## Getting started

```bash
# Install (root + client)
npm install
npm --prefix client install

# Env
cp .env.example .env

# Push schema & optional seed
npm run db:push
npm run db:seed
```

Run the API (serves `client/dist` in production builds) and the Vite client in separate terminals:

```bash
npm run dev          # API on PORT (default 3000)
npm run dev:client   # Vite dev server
```

## Scripts

| Script                               | Description                       |
| ------------------------------------ | --------------------------------- |
| `npm run dev`                        | API with hot reload (`tsx watch`) |
| `npm run dev:client`                 | Vite client                       |
| `npm run build`                      | Build client + prepare server     |
| `npm start`                          | Run production server             |
| `npm run typecheck`                  | Typecheck server                  |
| `npm run lint` / `lint:fix`          | Oxlint                            |
| `npm run fmt`                        | Oxfmt                             |
| `npm run db`                         | Drizzle Kit CLI                   |
| `npm run db:push`                    | Push schema to SQLite             |
| `npm run db:generate` / `db:migrate` | Generate / run migrations         |
| `npm run db:studio`                  | Drizzle Studio                    |
| `npm run db:seed`                    | Seed the database                 |

## Deployment

The default production setup is designed for a small VPS or container that runs both parts of the application. `npm run build` builds the Vite client into `client/dist`, and the Hono server serves those static files alongside the API. This keeps the application on one process and one origin, making a low-cost VPS a practical deployment target without requiring a platform-specific hosting provider.

The client can also be hosted separately on Cloudflare Pages or any other static host:

1. Build and deploy `client/dist`.
2. Add a client environment variable such as `VITE_API_URL=https://api.example.com`.
3. Use that value as the base URL in `client/src/lib/api.ts` instead of `/`.
4. Allow the client origin in the server's CORS and authentication configuration.

Vite embeds environment variables at build time, so rebuild the client after changing its API URL. If WebSockets are enabled, configure their public URL and ensure the host or reverse proxy supports connection upgrades as well.

The deployment model is not tied to the default database. Persist the `.data` directory when using SQLite, or point the server at PostgreSQL, MySQL, or another supported database chosen during setup.

## Docker

Production image builds the Vite client, then runs the Hono server which serves `client/dist` statically (same flow as `npm run build` → `npm start`). On start it runs `drizzle-kit push` so the SQLite schema exists.

```bash
docker build -t boilerplate .
docker run --rm -p 3000:3000 -v boilerplate-data:/app/.data boilerplate
```

Override `PORT` / `DATABASE_URL` with `-e` if needed. Persist SQLite via the `/app/.data` volume.

## Conventions

- **Type-first / API-first** — define Zod schemas and Hono routes before UI; export chained routers so the client gets full RPC inference.
- **Shared contracts** — put cross-boundary schemas/types in `server/shared/`; validate inputs on the server with Zod.
- **Client data** — prefer TanStack Query (`queryOptions` helpers + loaders that `prefetch` / `ensureQueryData`). Use `useSuspenseQuery` for required data.
- **UI** — shadcn/ui + theme tokens from `client/src/index.css` (`bg-background`, `text-foreground`, etc.), not raw gray scales.
- **Strict TypeScript** — no `any`; prefer `unknown` when needed.

Agent-oriented setup and implementation guidance lives in [`AGENTS.md`](AGENTS.md).

## License

MIT
