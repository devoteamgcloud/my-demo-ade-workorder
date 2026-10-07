# ade-workorders

Aircraft line maintenance work orders: a list of work orders, each with task cards that engineers update and close out.

## Stack
- Next.js 16 (App Router, Cache Components), React 19, TypeScript
- Tailwind CSS v4, Geist font, Phosphor icons (`@phosphor-icons/react/ssr`)
- Vitest for unit tests, ESLint for lint

## Commands
- Install: `npm install`
- Run: `npm run dev` (http://localhost:3000)
- Test: `npm test`
- Lint and types: `npm run lint && npm run typecheck`
- Build: `npm run build`

## Layout
- `src/lib/types.ts` domain types, `src/lib/store.ts` business rules, `src/lib/seed.ts` sample data
- `src/lib/data.ts` reads for pages and API routes
- `src/app/actions.ts` Server Actions for mutations
- `src/app/page.tsx` work order list, `src/app/work-orders/[id]/page.tsx` detail
- `src/app/api/work-orders` JSON API
- Data is in memory and resets when the server restarts

## Conventions
- Business rules live in the store, not in pages or actions
- Every behaviour change ships with a test next to the code (`*.test.ts`)
- Keep one accent color (`--accent`) and the existing tokens in `globals.css`
- Branches: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`); reference the issue (`Closes #N`) in the PR

## Never
- Never commit secrets, tokens or `.env` files
- Never push to `main` or merge PRs; open a PR for review
- Never delete or skip tests to make a build pass

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
