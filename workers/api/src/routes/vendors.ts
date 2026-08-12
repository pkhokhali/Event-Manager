import { Hono } from 'hono';
import { and, asc, count, desc, eq, isNull, like, or, sql } from 'drizzle-orm';
import { vendors, vendorMedia, vendorReviews, newId, nowIso } from '@event-manager/db';
import { vendorCreateSchema } from '@event-manager/shared';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';
import { httpError, paginated, parsePagination } from '../lib/http';

export const vendorsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// Mount /admin before /:id so "admin" is not treated as an id
vendorsRoutes.get('/', async (c) => {
  const db = c.get('db');
  const { page, limit, search, sortOrder } = parsePagination(c);
  const category = c.req.query('category');
  const city = c.req.query('city');
  const featured = c.req.query('featured') === 'true';

  const filters = [
    isNull(vendors.deletedAt),
    eq(vendors.isAvailable, true),
    ...(category ? [eq(vendors.category, category)] : []),
    ...(city ? [like(sql`lower(${vendors.city})`, `%${city.toLowerCase()}%`)] : []),
    ...(featured ? [eq(vendors.isFeatured, true)] : []),
    ...(search
      ? [
          or(
            like(sql`lower(${vendors.name})`, `%${search.toLowerCase()}%`),
            like(sql`lower(${vendors.city})`, `%${search.toLowerCase()}%`)
          )!,
        ]
      : []),
  ];

  const where = and(...filters);
  const [items, totalRow] = await Promise.all([
    db.query.vendors.findMany({
      where,
      limit,
      offset: (page - 1) * limit,
      orderBy: [sortOrder === 'asc' ? asc(vendors.rating) : desc(vendors.rating)],
      with: {
        media: {
          limit: 3,
          orderBy: [asc(vendorMedia.sortOrder)],
        },
      },
    }),
    db.select({ value: count() }).from(vendors).where(where),
  ]);

  return c.json(paginated(items, Number(totalRow[0]?.value ?? 0), page, limit));
});

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);

admin.get('/', async (c) => {
  const db = c.get('db');
  const { page, limit, search } = parsePagination(c);
  const where = and(
    isNull(vendors.deletedAt),
    ...(search ? [like(sql`lower(${vendors.name})`, `%${search.toLowerCase()}%`)] : [])
  );
  const [items, totalRow] = await Promise.all([
    db.query.vendors.findMany({
      where,
      limit,
      offset: (page - 1) * limit,
      orderBy: [desc(vendors.createdAt)],
      with: { media: true },
    }),
    db.select({ value: count() }).from(vendors).where(where),
  ]);
  return c.json(paginated(items, Number(totalRow[0]?.value ?? 0), page, limit));
});

admin.post('/', async (c) => {
  const body = vendorCreateSchema.parse(await c.req.json());
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(vendors).values({
    id,
    name: body.name,
    nameNe: body.nameNe,
    description: body.description,
    category: body.category,
    phone: body.phone,
    email: body.email || null,
    website: body.website || null,
    address: body.address,
    city: body.city,
    latitude: body.latitude,
    longitude: body.longitude,
    priceMin: body.priceMin,
    priceMax: body.priceMax,
    rating: body.rating ?? 0,
    isAvailable: body.isAvailable ?? true,
    isFeatured: body.isFeatured ?? false,
    createdAt: now,
    updatedAt: now,
  });
  const vendor = await db.query.vendors.findFirst({ where: eq(vendors.id, id) });
  return c.json({ data: vendor }, 201);
});

admin.put('/:id', async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  const { id: _id, createdAt: _c, ...rest } = body;
  await db
    .update(vendors)
    .set({ ...rest, updatedAt: nowIso() })
    .where(eq(vendors.id, c.req.param('id')));
  const vendor = await db.query.vendors.findFirst({ where: eq(vendors.id, c.req.param('id')) });
  return c.json({ data: vendor });
});

admin.delete('/:id', async (c) => {
  const db = c.get('db');
  await db
    .update(vendors)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(vendors.id, c.req.param('id')));
  return c.body(null, 204);
});

vendorsRoutes.route('/admin', admin);

vendorsRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const vendor = await db.query.vendors.findFirst({
    where: and(eq(vendors.id, c.req.param('id')), isNull(vendors.deletedAt)),
    with: {
      media: { orderBy: [asc(vendorMedia.sortOrder)] },
      reviews: {
        where: and(eq(vendorReviews.status, 'APPROVED'), isNull(vendorReviews.deletedAt)),
        limit: 20,
        orderBy: [desc(vendorReviews.createdAt)],
      },
    },
  });
  if (!vendor) return httpError(404, 'NOT_FOUND', 'Vendor not found');
  return c.json({ data: vendor });
});
