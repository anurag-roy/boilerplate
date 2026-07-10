# Agent Guidelines

Full-stack TypeScript starting point for agent-led project setup.

## Setup

This repository provides a working structure, not a fixed set of infrastructure choices. When asked to create a project from this template, ask one concise round of questions before changing code. Skip anything the user has already answered:

- Project name, purpose, and package metadata
- Runtime: Node.js (default) or Bun
- Database: SQLite/libSQL (default), PostgreSQL, or MySQL; local or managed
- Deployment: one VPS/container serving the API and built client (default), or separate API and static client hosts
- Optional integrations: WebSockets, authentication, transactional email, object storage, queues, observability, or other project-specific services

Do not ask about replacing Hono, React, or their core stack: this template intentionally keeps Hono on the backend and React on the frontend. Do not add optional integrations unless selected by the user.

After the user answers, apply each choice end to end: dependencies, adapters, shared schemas, environment validation and `.env.example`, scripts, lockfiles, Docker configuration, tests, and README. Never invent credentials. Remove superseded dependencies and demo code that no longer fits, then run typecheck, lint, and build.

### Recipe: Bun

Use the latest commit on the `bun` branch as the reference (`git show bun`), but adapt its changes instead of blindly cherry-picking onto a diverged branch:

- Replace root and client npm lockfiles with `bun.lock` files; use Bun commands in scripts and docs
- Remove `tsx`, `@hono/node-server`, and Node type packages; add `@types/bun`
- Change TypeScript environment types from `node` to `bun`
- Start the server with `Bun.serve` and import `serveStatic` from `hono/bun`
- Use Bun APIs in build scripts, and Bun base images/commands in Docker and its entrypoint
- Regenerate both lockfiles, then verify with Bun's install, typecheck, lint, and build commands

### Recipe: WebSockets

Define inbound and outbound message schemas in `server/shared/` and validate untrusted messages at runtime. Register `/api/ws` before the static-file catch-all.

For Node.js, use WebSocket support built into `@hono/node-server` plus `ws`; do not add the deprecated `@hono/node-ws` package:

```typescript
import { serve, upgradeWebSocket } from '@hono/node-server';
import { WebSocketServer } from 'ws';

app.get('/api/ws', upgradeWebSocket(() => ({
  onMessage(event, ws) {
    ws.send(event.data);
  },
})));

const wss = new WebSocketServer({ noServer: true });
serve({ fetch: app.fetch, port: env.PORT, websocket: { server: wss } });
```

For Bun, use its Hono adapter:

```typescript
import { upgradeWebSocket, websocket } from 'hono/bun';

app.get('/api/ws', upgradeWebSocket(() => ({ /* handlers */ })));
Bun.serve({ fetch: app.fetch, port: env.PORT, websocket });
```

Add `client/src/hooks/use-websocket.ts` using the browser's native `WebSocket`. The hook should expose connection status, the latest validated message, `send`, and `close`; clean up on unmount; avoid stale callbacks; and use bounded reconnect backoff only when requested. Derive `ws:`/`wss:` from the configured API origin or accept `VITE_WS_URL`. Keep the Vite `/api` proxy configured with `ws: true`.

## Layout

| Path | Purpose |
|------|---------|
| `client/` | Frontend (Vite 8, React 19, React Compiler) |
| `server/` | Backend (Hono with RPC type generation) |
| `server/shared/` | Shared types and Zod schemas |

## Stack

- **Runtime**: Node.js by default; Bun is supported by the setup recipe
- **Backend**: Hono, Drizzle ORM; SQLite/libSQL by default
- **Frontend**: Vite 8, React 19, Shadcn/ui (Base UI), TailwindCSS V4
- **Data**: TanStack Query (server state), TanStack Router (routing)
- **Validation**: Zod v4
- **Tooling**: Oxlint (`npm run lint`), Oxfmt (`npm run fmt`)

## General Practices

- Type-first: define types/schemas before implementation
- API-first: design contracts via Hono RPC for end-to-end type safety
- Validate all inputs with Zod; avoid `any` — use proper types or `unknown`
- Type all parameters and return values
- Error handling: error boundaries (client), `HTTPException` (server)
- Server logic in `server/`; client components in `client/src/components/`; routes in `server/routes/`

## Client

**Directories**: `client/src/components/ui/`, `client/src/routes/`, `client/src/lib/`

**Styling**: Use TailwindCSS V4 and shadcn/ui. Prefer theme variables from `client/src/index.css` (`foreground`, `background`, `primary`, etc.) over hardcoded colors.

**API**: Use the typed client in `client/src/lib/api.ts` with TanStack Query. Import shared types from `@shared/types`.

**Data fetching**:

- TanStack Query owns server-state caching; Router loaders only kick off fetches early
- Define shared `queryOptions` helpers; reuse in loaders and components
- `useSuspenseQuery` for required data; `useQuery` for optional/deferred data
- Treat loaders as prefetch handlers — don't return loader data or use `useLoaderData` with Query

```tsx
const dashboardQueryOptions = (dashboardId: string) =>
  queryOptions({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => fetchDashboard(dashboardId),
  });

// Loader
loader: ({ context, params }) => {
  context.queryClient.prefetchQuery(dashboardQueryOptions(params.dashboardId));
};

// Component
const { dashboardId } = Route.useParams();
const { data } = useSuspenseQuery(dashboardQueryOptions(dashboardId));
```

## Server

**Imports**: ES modules; `@server/` path alias; shared code from `@shared/types` and `@shared/schemas`

**Style**: `camelCase` variables/functions, `PascalCase` types, `kebab-case` files; prefer `async/await`

**Routes**: Chain handlers and export the router for Hono RPC inference:

```typescript
const authRouter = new Hono()
  .post("/login", routeValidator("json", loginSchema), async (c) => { /* ... */ })
  .get("/me", protect, async (c) => { /* ... */ });
export default authRouter;
```

**Database**: Use `db` from `@server/db/index.ts`; schema in `@server/db/schema.ts`

**Errors & config**: `@server/middlewares/validator` for validation, `HTTPException` for API errors, `@server/lib/logger` for logging, `@server/lib/env` for environment variables
