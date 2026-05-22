import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';

export const featuredRouter = Router();

featuredRouter.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const items = await prisma.featuredEvent.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
      take: 10,
    });
    res.json({ data: items });
  } catch (e) {
    next(e);
  }
});

const admin = Router();
admin.use(adminAuth);

admin.get('/', async (_req, res, next) => {
  try {
    const items = await prisma.featuredEvent.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ data: items });
  } catch (e) {
    next(e);
  }
});

admin.post('/', async (req, res, next) => {
  try {
    const item = await prisma.featuredEvent.create({ data: req.body });
    res.status(201).json({ data: item });
  } catch (e) {
    next(e);
  }
});

admin.put('/:id', async (req, res, next) => {
  try {
    const item = await prisma.featuredEvent.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data: item });
  } catch (e) {
    next(e);
  }
});

admin.delete('/:id', async (req, res, next) => {
  try {
    await prisma.featuredEvent.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

featuredRouter.use('/admin', admin);
