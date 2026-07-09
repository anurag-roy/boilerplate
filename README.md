# Boilerplate

Personal full-stack TypeScript starter for new apps. The included to-do UI is a thin demo of the stack and conventions — not the product.

## Stack

| Layer         | Choice                                                     |
| ------------- | ---------------------------------------------------------- |
| Runtime       | [Bun](https://bun.sh/) + TypeScript                        |
| API           | [Hono](https://hono.dev/) with RPC type generation         |
| Database      | [Drizzle ORM](https://orm.drizzle.team/) + SQLite (libSQL) |
| Validation    | Zod v4                                                     |
| Frontend      | Vite 8 + React 19 (React Compiler)                         |
| UI            | shadcn/ui (Base UI) + Tailwind CSS v4                      |
| Routing       | TanStack Router                                            |
| Data fetching | TanStack Query                                             |
| Lint / format | Oxlint / Oxfmt                                             |

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
└── .cursor/rules/    # Project conventions for agents & humans
```

Shared code lives under `server/shared/` and is imported as `@shared/*`. Server code uses `@server/*`.

## Getting started

```bash
# Install (root + client)
bun install
bun install --cwd client

# Env
cp .env.example .env

# Push schema & optional seed
bun run db:push
bun run db:seed
```

Run the API (serves `client/dist` in production builds) and the Vite client in separate terminals:

```bash
bun run dev          # API on PORT (default 3000)
bun run dev:client   # Vite dev server
```

## Scripts

| Script                               | Description                   |
| ------------------------------------ | ----------------------------- |
| `bun run dev`                        | API with hot reload           |
| `bun run dev:client`                 | Vite client                   |
| `bun run build`                      | Build client + prepare server |
| `bun start`                          | Run production server         |
| `bun run typecheck`                  | Typecheck server              |
| `bun run lint` / `lint:fix`          | Oxlint                        |
| `bun run fmt`                        | Oxfmt                         |
| `bun run db`                         | Drizzle Kit CLI               |
| `bun run db:push`                    | Push schema to SQLite         |
| `bun run db:generate` / `db:migrate` | Generate / run migrations     |
| `bun run db:studio`                  | Drizzle Studio                |
| `bun run db:seed`                    | Seed the database             |

## Docker

Production image builds the Vite client, then runs the Hono server which serves `client/dist` statically (same flow as `bun run build` → `bun start`). On start it runs `drizzle-kit push` so the SQLite schema exists.

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

Agent-oriented detail lives in [`.cursor/rules/`](.cursor/rules/).

## License

MIT
