# ade-workorders

Aircraft line maintenance work orders for the Google Antigravity workshop. Browse work orders, update task cards, and close work orders out.

Built with Next.js 16, React 19, Tailwind CSS v4 and TypeScript.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Sample data is in memory and resets when the server restarts.

## Develop

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## API

- `GET /api/work-orders`
- `GET /api/work-orders/{id}`
