import { Hono } from 'hono';
import { and, asc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { banners, newId, nowIso } from '@event-manager/db';
import { bannerCreateSchema } from '@event-manager/shared';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';

export const bannersRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

function activeWhere() {
  const now = nowIso();
  return and(
    isNull(banners.deletedAt),
    eq(banners.isActive, true),
    or(
      and(isNull(banners.startsAt), isNull(banners.endsAt)),
      and(lte(banners.startsAt, now), isNull(banners.endsAt)),
      and(isNull(banners.startsAt), gte(banners.endsAt, now)),
      and(lte(banners.startsAt, now), gte(banners.endsAt, now))
    )
  );
}

bannersRoutes.get('/', async (c) => {
  const db = c.get('db');
  const rows = await db.query.banners.findMany({
    where: activeWhere(),
    orderBy: [asc(banners.sortOrder)],
  });
  return c.json({ data: rows });
});

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);

admin.get('/', async (c) => {
  const db = c.get('db');
  const rows = await db.query.banners.findMany({
    where: isNull(banners.deletedAt),
    orderBy: [asc(banners.sortOrder)],
  });
  return c.json({ data: rows });
});

admin.post('/', async (c) => {
  const body = bannerCreateSchema.parse(await c.req.json());
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(banners).values({
    id,
    title: body.title,
    titleNe: body.titleNe,
    imageUrl: body.imageUrl,
    linkUrl: body.linkUrl || null,
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
    startsAt: body.startsAt ? new Date(body.startsAt).toISOString() : null,
    endsAt: body.endsAt ? new Date(body.endsAt).toISOString() : null,
    createdAt: now,
    updatedAt: now,
  });
  const row = await db.query.banners.findFirst({ where: eq(banners.id, id) });
  return c.json({ data: row }, 201);
});

admin.put('/:id', async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  if (body.startsAt) body.startsAt = new Date(body.startsAt).toISOString();
  if (body.endsAt) body.endsAt = new Date(body.endsAt).toISOString();
  await db
    .update(banners)
    .set({ ...body, updatedAt: nowIso() })
    .where(eq(banners.id, c.req.param('id')));
  const row = await db.query.banners.findFirst({ where: eq(banners.id, c.req.param('id')) });
  return c.json({ data: row });
});

admin.delete('/:id', async (c) => {
  const db = c.get('db');
  await db
    .update(banners)
    .set({ deletedAt: nowIso(), isActive: false, updatedAt: nowIso() })
    .where(eq(banners.id, c.req.param('id')));
  return c.body(null, 204);
});

// admin mounted after public GET / — no /:id collision
bannersRoutes.route('/admin', admin);
