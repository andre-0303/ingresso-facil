# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # start dev server with nodemon (hot reload)
pnpm migrate  # run DDL migration against Neon DB
pnpm build    # compile TypeScript to dist/
pnpm start    # run compiled output (production)
```

Requires `DATABASE_URL` in `.env` (Neon PostgreSQL connection string).

## Architecture

Module-based MVC. Each domain entity owns its own slice:

```
src/
  app.ts                   # express setup, route mounting, errorHandler
  server.ts                # listen() only — kept separate for testability
  database/
    pool.ts                # pg Pool singleton (SSL always on for Neon)
    migrate.ts             # one-shot migration runner
    migrations/001_*.sql   # DDL: ENUM types, tables, indexes
  modules/<entity>/
    *.schema.ts            # zod validation schemas + inferred types
    *.service.ts           # all business logic + SQL queries
    *.controller.ts        # parse request → call service → send response
    *.routes.ts            # Express Router, wires paths to controller
  shared/
    errors/AppError.ts     # AppError(message, statusCode) — thrown in services
    middleware/errorHandler.ts  # catches AppError + unknown errors
    utils/asyncHandler.ts  # wraps async controllers so errors reach errorHandler
    types/index.ts         # shared TypeScript interfaces (Usuario, Show, Pedido, Ingresso)
```

## Key Patterns

**Async controllers** must be wrapped with `asyncHandler` in routes — otherwise thrown errors won't reach the error middleware.

**Validation** happens at the controller boundary using `schema.safeParse(req.body)`. On failure, throw `new AppError(result.error.issues[0].message)`. Services receive already-typed data.

**Services** hold all business logic and SQL. Controllers have no direct DB access.

## Business Rules

- Ingressos are pre-created when a show is created (status `DISPONIVEL`, `pedido_id = NULL`).
- `pedido_id` on `ingresso` is nullable — it's `NULL` until the ingresso is reserved.
- On reservation (`POST /pedidos`): locks rows with `FOR UPDATE SKIP LOCKED` to prevent race conditions when concurrent buyers target the same show.
- Limit: 5 ingressos per `usuario_id` per show (enforced in `pedido.service.ts`).
- Reservation expires after 15 minutes via `setTimeout` — releases ingressos back to `DISPONIVEL` if payment was never confirmed.
- Payment simulation: `POST /pedidos/:id/pagamento` with `{ "aprovado": true/false }`.

## ESM Rules

Project uses `"type": "module"` + `tsconfig module: Node16`. All relative imports **must** have `.js` extensions — even when importing `.ts` files:

```typescript
import { pool } from '../../database/pool.js'   // correct
import { pool } from '../../database/pool'       // breaks at runtime
```

## Database

SQL runs directly via `pg` (no ORM). Queries live in service files. Use `pool.query` for simple queries and `pool.connect()` + manual `BEGIN/COMMIT/ROLLBACK` for transactions. Always `client.release()` in a `finally` block.
