import { Router } from 'express';
import { categoryCreateSchema, subcategoryCreateSchema } from '@event-manager/shared';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
import { adminAuth } from '../middleware/adminAuth';
import { validateBody } from '../middleware/validate';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.eventCategory.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          where: { deletedAt: null, isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    res.json({ data: categories });
  } catch (e) {
    next(e);
  }
});

const admin = Router();
admin.use(adminAuth);

admin.post('/', validateBody(categoryCreateSchema), async (req, res, next) => {
  try {
    const cat = await prisma.eventCategory.create({ data: req.body });
    res.status(201).json({ data: cat });
  } catch (e) {
    next(e);
  }
});

admin.put('/:id', async (req, res, next) => {
  try {
    const cat = await prisma.eventCategory.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data: cat });
  } catch (e) {
    next(e);
  }
});

admin.delete('/:id', async (req, res, next) => {
  try {
    await prisma.eventCategory.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

admin.post('/subcategories', validateBody(subcategoryCreateSchema), async (req, res, next) => {
  try {
    const sub = await prisma.eventSubcategory.create({ data: req.body });
    res.status(201).json({ data: sub });
  } catch (e) {
    next(e);
  }
});

admin.put('/subcategories/:id', async (req, res, next) => {
  try {
    const sub = await prisma.eventSubcategory.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data: sub });
  } catch (e) {
    next(e);
  }
});

admin.delete('/subcategories/:id', async (req, res, next) => {
  try {
    await prisma.eventSubcategory.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

categoriesRouter.get('/:id', async (req, res, next) => {
  try {
    const cat = await prisma.eventCategory.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { subcategories: { where: { deletedAt: null } } },
    });
    if (!cat) return next(notFound('Category not found'));
    res.json({ data: cat });
  } catch (e) {
    next(e);
  }
});

categoriesRouter.use('/admin', admin);
