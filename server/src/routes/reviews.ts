import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { reviewCreateSchema } from '@event-manager/shared';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { validateBody } from '../middleware/validate';

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many reviews' } },
});

export const reviewsRouter = Router();

reviewsRouter.get('/', async (req, res, next) => {
  try {
    const vendorId = req.query.vendorId as string;
    const reviews = await prisma.vendorReview.findMany({
      where: {
        status: 'APPROVED',
        deletedAt: null,
        ...(vendorId && { vendorId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ data: reviews });
  } catch (e) {
    next(e);
  }
});

reviewsRouter.post('/', reviewLimiter, validateBody(reviewCreateSchema), async (req, res, next) => {
  try {
    const review = await prisma.vendorReview.create({
      data: { ...req.body, status: 'PENDING' },
    });
    res.status(201).json({ data: review });
  } catch (e) {
    next(e);
  }
});

const admin = Router();
admin.use(adminAuth);

admin.get('/pending', async (_req, res, next) => {
  try {
    const reviews = await prisma.vendorReview.findMany({
      where: { status: 'PENDING', deletedAt: null },
      include: { vendor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reviews });
  } catch (e) {
    next(e);
  }
});

admin.patch('/:id/approve', async (req, res, next) => {
  try {
    const review = await prisma.vendorReview.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
    });
    const agg = await prisma.vendorReview.aggregate({
      where: { vendorId: review.vendorId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.vendor.update({
      where: { id: review.vendorId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });
    res.json({ data: review });
  } catch (e) {
    next(e);
  }
});

admin.patch('/:id/reject', async (req, res, next) => {
  try {
    const review = await prisma.vendorReview.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });
    res.json({ data: review });
  } catch (e) {
    next(e);
  }
});

admin.delete('/:id', async (req, res, next) => {
  try {
    await prisma.vendorReview.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

reviewsRouter.use('/admin', admin);
