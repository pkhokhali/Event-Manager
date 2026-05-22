import { Router } from 'express';
import { bannerCreateSchema } from '@event-manager/shared';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { validateBody } from '../middleware/validate';

export const bannersRouter = Router();

function activeBannerWhere() {
  const now = new Date();
  return {
    deletedAt: null,
    isActive: true,
    OR: [
      { startsAt: null, endsAt: null },
      { startsAt: { lte: now }, endsAt: null },
      { startsAt: null, endsAt: { gte: now } },
      { startsAt: { lte: now }, endsAt: { gte: now } },
    ],
  };
}

bannersRouter.get('/', async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: activeBannerWhere(),
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ data: banners });
  } catch (e) {
    next(e);
  }
});

const admin = Router();
admin.use(adminAuth);

admin.get('/', async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ data: banners });
  } catch (e) {
    next(e);
  }
});

admin.post('/', validateBody(bannerCreateSchema), async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : null,
      endsAt: req.body.endsAt ? new Date(req.body.endsAt) : null,
    };
    const banner = await prisma.banner.create({ data });
    res.status(201).json({ data: banner });
  } catch (e) {
    next(e);
  }
});

admin.put('/:id', async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.startsAt) body.startsAt = new Date(body.startsAt);
    if (body.endsAt) body.endsAt = new Date(body.endsAt);
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: body });
    res.json({ data: banner });
  } catch (e) {
    next(e);
  }
});

admin.delete('/:id', async (req, res, next) => {
  try {
    await prisma.banner.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

bannersRouter.use('/admin', admin);
