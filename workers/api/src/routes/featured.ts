import { Hono } from 'hono';
import { and, asc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { featuredEvents, newId, nowIso } from '@event-manager/db';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';

export const featuredRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

featuredRoutes.get('/', async (c) => {
  const db = c.get('db');
  const now = nowIso();
  const items = await db.query.featuredEvents.findMany({
    where: and(
      isNull(featuredEvents.deletedAt),
      eq(featuredEvents.isActive, true),
      or(
        and(isNull(featuredEvents.startsAt), isNull(featuredEvents.endsAt)),
        and(lte(featuredEvents.startsAt, now), gte(featuredEvents.endsAt, now))
      )
    ),
    orderBy: [asc(featuredEvents.sortOrder)],
    limit: 10,
  });
  return c.json({ data: items });
});

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);

admin.get('/', async (c) => {
  const db = c.get('db');
  const items = await db.query.featuredEvents.findMany({
    where: isNull(featuredEvents.deletedAt),
    orderBy: [asc(featuredEvents.sortOrder)],
  });
  return c.json({ data: items });
});

admin.post('/', async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(featuredEvents).values({
    id,
    title: body.title,
    titleNe: body.titleNe,
    description: body.description,
    imageUrl: body.imageUrl,
    linkUrl: body.linkUrl,
    vendorId: body.vendorId,
    festivalId: body.festivalId,
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
    startsAt: body.startsAt ? new Date(body.startsAt).toISOString() : null,
    endsAt: body.endsAt ? new Date(body.endsAt).toISOString() : null,
    createdAt: now,
    updatedAt: now,
  });
  const item = await db.query.featuredEvents.findFirst({ where: eq(featuredEvents.id, id) });
  return c.json({ data: item }, 201);
});

admin.put('/:id', async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  if (body.startsAt) body.startsAt = new Date(body.startsAt).toISOString();
  if (body.endsAt) body.endsAt = new Date(body.endsAt).toISOString();
  await db
    .update(featuredEvents)
    .set({ ...body, updatedAt: nowIso() })
    .where(eq(featuredEvents.id, c.req.param('id')));
  const item = await db.query.featuredEvents.findFirst({
    where: eq(featuredEvents.id, c.req.param('id')),
  });
  return c.json({ data: item });
});

admin.delete('/:id', async (c) => {
  const db = c.get('db');
  await db
    .update(featuredEvents)
    .set({ deletedAt: nowIso(), isActive: false, updatedAt: nowIso() })
    .where(eq(featuredEvents.id, c.req.param('id')));
  return c.body(null, 204);
});

featuredRoutes.route('/admin', admin);
