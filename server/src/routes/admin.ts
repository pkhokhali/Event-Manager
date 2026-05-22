import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';

export const adminRouter = Router();
adminRouter.use(adminAuth);

adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [
      vendors,
      festivals,
      banners,
      pendingReviews,
      pendingJobs,
      categories,
      deviceTokens,
    ] = await Promise.all([
      prisma.vendor.count({ where: { deletedAt: null } }),
      prisma.festival.count({ where: { deletedAt: null } }),
      prisma.banner.count({ where: { deletedAt: null, isActive: true } }),
      prisma.vendorReview.count({ where: { status: 'PENDING', deletedAt: null } }),
      prisma.notificationJob.count({ where: { status: 'PENDING' } }),
      prisma.eventCategory.count({ where: { deletedAt: null } }),
      prisma.deviceToken.count(),
    ]);

    res.json({
      data: {
        vendors,
        festivals,
        banners,
        pendingReviews,
        pendingJobs,
        categories,
        deviceTokens,
      },
    });
  } catch (e) {
    next(e);
  }
});
