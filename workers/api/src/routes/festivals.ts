import { Hono } from 'hono';
import { and, asc, count, eq, gte, isNull, like, lte, or, sql } from 'drizzle-orm';
import { festivals, newId, nowIso } from '@event-manager/db';
import { festivalCreateSchema } from '@event-manager/shared';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';
import { httpError, paginated, parsePagination } from '../lib/http';

export const festivalsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

festivalsRoutes.get('/', async (c) => {
  const db = c.get('db');
  const { page, limit, search } = parsePagination(c);
  const from = c.req.query('from') ? new Date(String(c.req.query('from'))).toISOString() : new Date().toISOString();
  const to = c.req.query('to') ? new Date(String(c.req.query('to'))).toISOString() : undefined;

  const where = and(
    isNull(festivals.deletedAt),
    gte(festivals.gregorianDate, from),
    ...(to ? [lte(festivals.gregorianDate, to)] : []),
    ...(search
      ? [
          or(
            like(sql`lower(${festivals.nameEn})`, `%${search.toLowerCase()}%`),
            like(sql`lower(${festivals.nameNe})`, `%${search.toLowerCase()}%`)
          )!,
        ]
      : [])
  );

  const [items, totalRow] = await Promise.all([
    db.query.festivals.findMany({
      where,
      limit,
      offset: (page - 1) * limit,
      orderBy: [asc(festivals.gregorianDate)],
    }),
    db.select({ value: count() }).from(festivals).where(where),
  ]);

  return c.json(paginated(items, Number(totalRow[0]?.value ?? 0), page, limit));
});

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);

admin.post('/', async (c) => {
  const body = festivalCreateSchema.parse(await c.req.json());
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(festivals).values({
    id,
    slug: body.slug,
    nameEn: body.nameEn,
    nameNe: body.nameNe,
    descriptionEn: body.descriptionEn,
    descriptionNe: body.descriptionNe,
    gregorianDate: new Date(body.gregorianDate).toISOString(),
    bikramDate: body.bikramDate,
    tithiLabel: body.tithiLabel,
    muhurtaNote: body.muhurtaNote,
    isNational: body.isNational ?? true,
    createdAt: now,
    updatedAt: now,
  });
  const festival = await db.query.festivals.findFirst({ where: eq(festivals.id, id) });
  return c.json({ data: festival }, 201);
});

admin.put('/:id', async (c) => {
  const body = await c.req.json();
  const db = c.get('db');
  if (body.gregorianDate) body.gregorianDate = new Date(body.gregorianDate).toISOString();
  await db
    .update(festivals)
    .set({ ...body, updatedAt: nowIso() })
    .where(eq(festivals.id, c.req.param('id')));
  const festival = await db.query.festivals.findFirst({
    where: eq(festivals.id, c.req.param('id')),
  });
  return c.json({ data: festival });
});

admin.delete('/:id', async (c) => {
  const db = c.get('db');
  await db
    .update(festivals)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(festivals.id, c.req.param('id')));
  return c.body(null, 204);
});

festivalsRoutes.route('/admin', admin);

festivalsRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const festival = await db.query.festivals.findFirst({
    where: and(eq(festivals.id, c.req.param('id')), isNull(festivals.deletedAt)),
  });
  if (!festival) return httpError(404, 'NOT_FOUND', 'Festival not found');
  return c.json({ data: festival });
});
