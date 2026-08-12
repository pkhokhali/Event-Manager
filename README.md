# Event Manager

Nepal-focused event platform on **Cloudflare** (free tier): Hono API Worker, D1, R2, Queues, Cron, Pages admin, and Expo mobile.

## Structure

```
apps/mobile/              # Expo app (local MMKV events + catalog API)
apps/admin/               # Vite admin → Cloudflare Pages
workers/api/              # Hono API on Cloudflare Workers
workers/push-consumer/    # Queue consumer → FCM
packages/db/              # Drizzle schema + D1 SQL migrations/seed
packages/shared/          # Zod schemas, enums, category seeds
packages/i18n/            # English + Nepali
```

## Prerequisites

- Node.js 20+
- Cloudflare account + [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (`npx wrangler login`)
- Optional: Firebase project for push (FCM)

## Quick start (local)

```bash
npm install
npm run build:shared

# Create local D1 schema + seed
npm run db:migrate:local
npm run db:seed:local

# API (http://localhost:8787)
npm run dev:api

# Admin (http://localhost:5173) — set Admin API key in Settings
npm run dev:admin

# Mobile
npm run dev:mobile
```

Set `ADMIN_API_KEY` for local Workers via `.dev.vars` in `workers/api/`:

```
ADMIN_API_KEY=change-me-admin-secret-key
CORS_ORIGINS=http://localhost:5173,http://localhost:8081
R2_PUBLIC_URL=https://uploads.example.com
```

## Cloudflare setup (once)

1. Create D1: `npx wrangler d1 create event-manager-db` — paste `database_id` into both `workers/*/wrangler.toml`
2. Create R2 bucket: `npx wrangler r2 bucket create event-manager-uploads`
3. Create Queue: `npx wrangler queues create push-notifications`
4. Create R2 API token (Object Read & Write) → set secrets:
   - `wrangler secret put ADMIN_API_KEY -c workers/api/wrangler.toml`
   - `wrangler secret put R2_ACCESS_KEY_ID -c workers/api/wrangler.toml`
   - `wrangler secret put R2_SECRET_ACCESS_KEY -c workers/api/wrangler.toml`
   - `wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON -c workers/push-consumer/wrangler.toml`
5. Set `[vars]` `R2_ACCOUNT_ID`, `R2_PUBLIC_URL`, `CORS_ORIGINS` in `workers/api/wrangler.toml`
6. Migrate + seed remote:
   ```bash
   npm run db:migrate:remote
   npm run db:seed:remote
   ```
7. Deploy:
   ```bash
   npm run deploy:api
   npm run deploy:push
   npm run deploy:admin
   ```
8. Point mobile `EXPO_PUBLIC_API_URL` / `app.json` `extra.apiUrl` and admin `VITE_API_URL` at `https://<worker>.workers.dev/api/v1`

## Content model

- **Admin** manages vendors, festivals, banners, featured, notifications, reviews (`X-Admin-Key`)
- **Mobile users** store personal events/guests/budget/tasks in **MMKV** (no accounts)
- Catalog (vendors, festivals, banners) comes from the Worker API

## Google Play

Unaffected by this stack — build the Expo Android app with EAS when ready. Register a Play Console account ($25 one-time).

## Security

- Never commit `.env`, `.dev.vars`, or Firebase service account JSON
- Rotate `ADMIN_API_KEY` and R2 tokens periodically
