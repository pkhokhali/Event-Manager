import { Hono } from 'hono';
import { and, avg, count, desc, eq, isNull } from 'drizzle-orm';
import { vendorReviews, vendors, newId, nowIso } from '@event-manager/db';
import { reviewCreateSchema } from '@event-manager/shared';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';

export const reviewsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

reviewsRoutes.get('/', async (c) => {
  const db = c.get('db');
  const vendorId = c.req.query('vendorId');
  const reviews = await db.query.vendorReviews.findMany({
    where: and(
      eq(vendorReviews.status, 'APPROVED'),
      isNull(vendorReviews.deletedAt),
      ...(vendorId ? [eq(vendorReviews.vendorId, vendorId)] : [])
    ),
    orderBy: [desc(vendorReviews.createdAt)],
    limit: 50,
  });
  return c.json({ data: reviews });
});

reviewsRoutes.post('/', async (c) => {
  const body = reviewCreateSchema.parse(await c.req.json());
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(vendorReviews).values({
    id,
    vendorId: body.vendorId,
    deviceId: body.deviceId,
    rating: body.rating,
    title: body.title,
    comment: body.comment,
    authorName: body.authorName,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });
  const review = await db.query.vendorReviews.findFirst({ where: eq(vendorReviews.id, id) });
  return c.json({ data: review }, 201);
});

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);

admin.get('/pending', async (c) => {
  const db = c.get('db');
  const reviews = await db.query.vendorReviews.findMany({
    where: and(eq(vendorReviews.status, 'PENDING'), isNull(vendorReviews.deletedAt)),
    orderBy: [desc(vendorReviews.createdAt)],
    with: {
      vendor: {
        columns: { id: true, name: true },
      },
    },
  });
  return c.json({ data: reviews });
});

admin.patch('/:id/approve', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  await db
    .update(vendorReviews)
    .set({ status: 'APPROVED', updatedAt: nowIso() })
    .where(eq(vendorReviews.id, id));
  const review = await db.query.vendorReviews.findFirst({ where: eq(vendorReviews.id, id) });
  if (review) {
    const agg = await db
      .select({ avgRating: avg(vendorReviews.rating), total: count() })
      .from(vendorReviews)
      .where(and(eq(vendorReviews.vendorId, review.vendorId), eq(vendorReviews.status, 'APPROVED')));
    await db
      .update(vendors)
      .set({
        rating: Number(agg[0]?.avgRating ?? 0),
        reviewCount: Number(agg[0]?.total ?? 0),
        updatedAt: nowIso(),
      })
      .where(eq(vendors.id, review.vendorId));
  }
  return c.json({ data: review });
});

admin.patch('/:id/reject', async (c) => {
  const db = c.get('db');
  await db
    .update(vendorReviews)
    .set({ status: 'REJECTED', updatedAt: nowIso() })
    .where(eq(vendorReviews.id, c.req.param('id')));
  const review = await db.query.vendorReviews.findFirst({
    where: eq(vendorReviews.id, c.req.param('id')),
  });
  return c.json({ data: review });
});

admin.delete('/:id', async (c) => {
  const db = c.get('db');
  await db
    .update(vendorReviews)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(vendorReviews.id, c.req.param('id')));
  return c.body(null, 204);
});

reviewsRoutes.route('/admin', admin);
