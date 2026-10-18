# Mock API (shared backend for the prototypes)

Zero-dependency Node server that the customer app and the admin app both talk to.
It holds members, points ledger, vouchers, membership rules, and orders from the customer app.

```
npm run api          # from app-kebab/ or app-kebab/admin/  →  http://localhost:4000
npm run dev          # customer app   →  http://localhost:5173
cd admin && npm run dev   # admin app  →  http://localhost:5174
```

- State persists to `mock-api/db.json`. Delete it (or `POST /api/reset`) to start over.
- Without the API both apps still run: the customer app shows demo data, the admin app uses local seeds.
- Override the address with `VITE_API_URL` and the port with `PORT`.
- Demo member in the customer app: `KNM-MEMBER-948221` (Khoirul Anam). Admin logins: see "Akun demo" on the login page.

Flow: order in the customer app → appears in the cabang (Pesanan / Dapur / Pickup) → Head Kitchen or Dapur accepts and cooks →
kasir hands over with the pickup code/QR → order becomes Selesai → points are credited once → customer app shows them.

## Deploy

Vercel runs stateless functions, so this server (which keeps state in memory and in `db.json`) cannot live there.
Host it on any Node host with a long-running process (Render, Railway, Fly) and point both frontends at it:

1. API: Render › New › Blueprint › pick this repo (uses `render.yaml`), or any host with start command `node mock-api/server.mjs`. Check `https://<api-host>/api/health`.
2. Customer app (Vercel, root directory `.`) and admin app (Vercel, root directory `admin`): add env `VITE_API_URL=https://<api-host>` and redeploy. Vite reads it at build time.
3. `vercel.json` in both folders rewrites every path to `index.html`, so deep links like `/orders/pickup` work.

Free hosts sleep when idle and reset `db.json` on restart, so demo data returns to the seed. There is no authentication: use fake data only.
