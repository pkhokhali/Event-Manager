import { Hono } from 'hono';
import { and, asc, eq, isNull } from 'drizzle-orm';
import {
  eventCategories,
  eventSubcategories,
  newId,
  nowIso,
} from '@event-manager/db';
import { categoryCreateSchema, subcategoryCreateSchema } from '@event-manager/shared';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';
import { httpError } from '../lib/http';

export const categoriesRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

categoriesRoutes.get('/', async (c) => {
  const db = c.get('db');
  const categories = await db.query.eventCategories.findMany({
    where: and(isNull(eventCategories.deletedAt), eq(eventCategories.isActive, true)),
    orderBy: [asc(eventCategories.sortOrder)],
    with: {
      subcategories: {
        where: and(isNull(eventSubcategories.deletedAt), eq(eventSubcategories.isActive, true)),
        orderBy: [asc(eventSubcategories.sortOrder)],
      },
    },
  });
  return c.json({ data: categories });
});

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);

admin.post('/', async (c) => {
  const body = categoryCreateSchema.parse(await c.req.json());
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(eventCategories).values({
    id,
    slug: body.slug,
    nameEn: body.nameEn,
    nameNe: body.nameNe,
    icon: body.icon,
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  });
  const cat = await db.query.eventCategories.findFirst({ where: eq(eventCategories.id, id) });
  return c.json({ data: cat }, 201);
});

admin.put('/:id', async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  await db
    .update(eventCategories)
    .set({ ...mapCategoryUpdate(body), updatedAt: nowIso() })
    .where(eq(eventCategories.id, c.req.param('id')));
  const cat = await db.query.eventCategories.findFirst({
    where: eq(eventCategories.id, c.req.param('id')),
  });
  return c.json({ data: cat });
});

admin.delete('/:id', async (c) => {
  const db = c.get('db');
  await db
    .update(eventCategories)
    .set({ deletedAt: nowIso(), isActive: false, updatedAt: nowIso() })
    .where(eq(eventCategories.id, c.req.param('id')));
  return c.body(null, 204);
});

admin.post('/subcategories', async (c) => {
  const body = subcategoryCreateSchema.parse(await c.req.json());
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(eventSubcategories).values({
    id,
    categoryId: body.categoryId,
    slug: body.slug,
    nameEn: body.nameEn,
    nameNe: body.nameNe,
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  });
  const sub = await db.query.eventSubcategories.findFirst({
    where: eq(eventSubcategories.id, id),
  });
  return c.json({ data: sub }, 201);
});

admin.put('/subcategories/:id', async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  await db
    .update(eventSubcategories)
    .set({ ...mapSubUpdate(body), updatedAt: nowIso() })
    .where(eq(eventSubcategories.id, c.req.param('id')));
  const sub = await db.query.eventSubcategories.findFirst({
    where: eq(eventSubcategories.id, c.req.param('id')),
  });
  return c.json({ data: sub });
});

admin.delete('/subcategories/:id', async (c) => {
  const db = c.get('db');
  await db
    .update(eventSubcategories)
    .set({ deletedAt: nowIso(), isActive: false, updatedAt: nowIso() })
    .where(eq(eventSubcategories.id, c.req.param('id')));
  return c.body(null, 204);
});

categoriesRoutes.route('/admin', admin);

categoriesRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const cat = await db.query.eventCategories.findFirst({
    where: and(eq(eventCategories.id, c.req.param('id')), isNull(eventCategories.deletedAt)),
    with: {
      subcategories: {
        where: isNull(eventSubcategories.deletedAt),
      },
    },
  });
  if (!cat) return httpError(404, 'NOT_FOUND', 'Category not found');
  return c.json({ data: cat });
});

function mapCategoryUpdate(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (body.slug !== undefined) out.slug = body.slug;
  if (body.nameEn !== undefined) out.nameEn = body.nameEn;
  if (body.nameNe !== undefined) out.nameNe = body.nameNe;
  if (body.icon !== undefined) out.icon = body.icon;
  if (body.sortOrder !== undefined) out.sortOrder = body.sortOrder;
  if (body.isActive !== undefined) out.isActive = body.isActive;
  return out;
}

function mapSubUpdate(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if (body.slug !== undefined) out.slug = body.slug;
  if (body.nameEn !== undefined) out.nameEn = body.nameEn;
  if (body.nameNe !== undefined) out.nameNe = body.nameNe;
  if (body.sortOrder !== undefined) out.sortOrder = body.sortOrder;
  if (body.isActive !== undefined) out.isActive = body.isActive;
  if (body.categoryId !== undefined) out.categoryId = body.categoryId;
  return out;
}
