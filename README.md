# Boilerplate

Personal full-stack TypeScript starter for new apps. The included to-do UI is a thin demo of the stack and conventions — not the product.

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

## Conventions

- **Type-first / API-first** — define Zod schemas and Hono routes before UI; export chained routers so the client gets full RPC inference.
- **Shared contracts** — put cross-boundary schemas/types in `server/shared/`; validate inputs on the server with Zod.
- **Client data** — prefer TanStack Query (`queryOptions` helpers + loaders that `prefetch` / `ensureQueryData`). Use `useSuspenseQuery` for required data.
- **UI** — shadcn/ui + theme tokens from `client/src/index.css` (`bg-background`, `text-foreground`, etc.), not raw gray scales.
- **Strict TypeScript** — no `any`; prefer `unknown` when needed.

Agent-oriented detail lives in [`.cursor/rules/`](.cursor/rules/).

## License

MIT
