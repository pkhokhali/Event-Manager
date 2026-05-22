# Implementation Guide (for developers)

## Phase 1 — Monorepo

- [x] npm workspaces + Turborepo
- [x] `packages/shared` enums, Zod, category seed
- [x] `packages/i18n` en/ne JSON

## Phase 2 — Backend

- [x] Prisma schema (catalog + notifications)
- [x] REST `/api/v1` public + admin routes
- [x] Swagger at `/api/docs`
- [x] S3 presign service
- [x] BullMQ push worker + node-cron

## Phase 3 — Mobile

- [x] Expo Router navigation (splash, onboarding, tabs)
- [x] MMKV local events/guests/budget/tasks
- [x] TanStack Query for catalog APIs
- [x] i18next en/ne
- [x] NativeWind theme (#8B1A1A / #BA7517)

## Phase 4 — Admin

- [x] Dashboard, vendors, categories, festivals, banners, featured, notifications, reviews, settings

## Phase 5 — Smoke test

1. `docker compose -f docker/docker-compose.yml up -d postgres redis`
2. `npm run db:push && npm run db:seed` in server workspace
3. `npm run dev:server`
4. Admin: add vendor, create banner
5. Mobile: create local event, add guest, view vendors, pull festivals

## Extending

- **Phase 2+ sync**: `POST /api/v1/sync/events` with `X-Device-Id`
- **SMS/WhatsApp workers**: implement provider in `server/src/workers/`
- **Muhurta**: extend `Festival.muhurtaNote` + admin fields
