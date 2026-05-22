import { Router } from 'express';
import { festivalCreateSchema } from '@event-manager/shared';
import { prisma } from '../lib/prisma';
import { parsePagination, paginated } from '../lib/pagination';
import { notFound } from '../lib/errors';
import { adminAuth } from '../middleware/adminAuth';
import { validateBody } from '../middleware/validate';

export const festivalsRouter = Router();

festivalsRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit, search } = parsePagination(req);
    const from = req.query.from ? new Date(String(req.query.from)) : new Date();
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    const where = {
      deletedAt: null,
      gregorianDate: { gte: from, ...(to && { lte: to }) },
      ...(search && {
        OR: [
          { nameEn: { contains: search, mode: 'insensitive' as const } },
          { nameNe: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.festival.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { gregorianDate: 'asc' },
      }),
      prisma.festival.count({ where }),
    ]);

    res.json(paginated(items, total, page, limit));
  } catch (e) {
    next(e);
  }
});

festivalsRouter.get('/:id', async (req, res, next) => {
  try {
    const festival = await prisma.festival.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!festival) return next(notFound('Festival not found'));
    res.json({ data: festival });
  } catch (e) {
    next(e);
  }
});

const admin = Router();
admin.use(adminAuth);

admin.post('/', validateBody(festivalCreateSchema), async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      gregorianDate: new Date(req.body.gregorianDate),
    };
    const festival = await prisma.festival.create({ data });
    res.status(201).json({ data: festival });
  } catch (e) {
    next(e);
  }
});

admin.put('/:id', async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.gregorianDate) body.gregorianDate = new Date(body.gregorianDate);
    const festival = await prisma.festival.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json({ data: festival });
  } catch (e) {
    next(e);
  }
});

admin.delete('/:id', async (req, res, next) => {
  try {
    await prisma.festival.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

festivalsRouter.use('/admin', admin);
