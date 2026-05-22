import { Router } from 'express';
import { vendorCreateSchema } from '@event-manager/shared';
import { VendorCategoryType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { parsePagination, paginated } from '../lib/pagination';
import { notFound } from '../lib/errors';
import { adminAuth } from '../middleware/adminAuth';
import { validateBody } from '../middleware/validate';

export const vendorsRouter = Router();

vendorsRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit, search, sortOrder } = parsePagination(req);
    const category = req.query.category as VendorCategoryType | undefined;
    const city = req.query.city as string | undefined;
    const featured = req.query.featured === 'true';

    const where = {
      deletedAt: null,
      isAvailable: true,
      ...(category && { category }),
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
      ...(featured && { isFeatured: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { city: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: sortOrder },
        include: { media: { take: 3, orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.vendor.count({ where }),
    ]);

    res.json(paginated(items, total, page, limit));
  } catch (e) {
    next(e);
  }
});

vendorsRouter.get('/:id', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { status: 'APPROVED', deletedAt: null },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!vendor) return next(notFound('Vendor not found'));
    res.json({ data: vendor });
  } catch (e) {
    next(e);
  }
});

const admin = Router();
admin.use(adminAuth);

admin.get('/', async (req, res, next) => {
  try {
    const { page, limit, search } = parsePagination(req);
    const where = {
      deletedAt: null,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };
    const [items, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { media: true },
      }),
      prisma.vendor.count({ where }),
    ]);
    res.json(paginated(items, total, page, limit));
  } catch (e) {
    next(e);
  }
});

admin.post('/', validateBody(vendorCreateSchema), async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.create({ data: req.body });
    res.status(201).json({ data: vendor });
  } catch (e) {
    next(e);
  }
});

admin.put('/:id', async (req, res, next) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data: vendor });
  } catch (e) {
    next(e);
  }
});

admin.delete('/:id', async (req, res, next) => {
  try {
    await prisma.vendor.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

vendorsRouter.use('/admin', admin);
