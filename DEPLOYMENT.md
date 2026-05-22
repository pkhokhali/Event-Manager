# Deployment Guide

## Prerequisites

- Node.js 20+
- Docker (PostgreSQL 16, Redis 7)
- AWS S3 bucket + IAM user (uploads)
- Firebase project + service account JSON (FCM push)
- Google Maps API key (mobile maps, optional)
- EAS account for mobile builds (Expo)

## Backend (VPS / Railway / Fly.io)

1. Set environment variables from `.env.example`.
2. Run migrations: `npx prisma migrate deploy` in `server/`.
3. Seed once: `npm run db:seed -w @event-manager/server`.
4. Start API: `npm run start -w @event-manager/server`.
5. Start worker: `npm run worker -w @event-manager/server`.
6. Or use `docker compose -f docker/docker-compose.yml up -d`.

### Production checklist

- Strong `ADMIN_API_KEY`
- `CORS_ORIGINS` limited to admin + API domains
- HTTPS termination (nginx/Caddy)
- Private S3 bucket, presigned PUT only
- Rotate Firebase/AWS keys periodically

## Admin panel

```bash
cd apps/admin
VITE_API_URL=https://api.yourdomain.com/api/v1 npm run build
```

Serve `dist/` via nginx or the API static middleware.

## Mobile (EAS Build)

```bash
cd apps/mobile
eas build --platform android
eas build --platform ios
```

Set `EXPO_PUBLIC_API_URL` to production API in `eas.json` env.

### Push notifications

- Android: FCM via `google-services.json` in Expo config
- iOS: APNs key in Expo + Firebase
- Register tokens hit `POST /api/v1/notifications/devices/register`

## Database backups

Schedule daily `pg_dump` of PostgreSQL volume.

## Monitoring

- Health: `GET /health`
- Logs: API + worker stdout
- Redis queue depth for `push` queue
