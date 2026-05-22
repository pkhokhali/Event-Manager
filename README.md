# Event Manager

Nepal-focused event management platform: **Expo mobile app**, **Express API**, and **Vite admin panel**.

## Structure

```
apps/mobile/     # React Native + Expo (public, no auth)
apps/admin/      # Admin CRUD (X-Admin-Key)
server/          # Express + Prisma + BullMQ
packages/shared/ # Types, Zod, category seeds
packages/i18n/   # English + Nepali strings
docker/          # PostgreSQL + Redis + API
```

## Quick start

1. Copy env: `cp .env.example .env`
2. Start infra: `docker compose -f docker/docker-compose.yml up -d postgres redis`
3. Install: `npm install`
4. Build shared: `npm run build -w @event-manager/shared`
5. DB: `npm run db:push -w @event-manager/server && npm run db:seed -w @event-manager/server`
6. API: `npm run dev:server`
7. Admin: `npm run dev:admin` → http://localhost:5173 (set Admin API key in Settings)
8. Mobile: `npm run dev:mobile` → Expo dev tools

## Content model

- **Admin panel** manages categories, vendors, festivals, banners, featured events, notifications, reviews.
- **Mobile users** store personal events, guests, budget, tasks locally in **MMKV** (no accounts).

## API docs

http://localhost:4000/api/docs

## Security

- `ADMIN_API_KEY` protects admin routes
- Rate limiting on public API
- S3 presigned uploads only
- Never commit `.env` or Firebase service account JSON

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [IMPLEMENTATION.md](./IMPLEMENTATION.md).
