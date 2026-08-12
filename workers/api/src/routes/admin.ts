import { Hono } from 'hono';
import { and, count, eq, isNull } from 'drizzle-orm';
import {
  banners,
  deviceTokens,
  eventCategories,
  festivals,
  notificationJobs,
  vendorReviews,
  vendors,
} from '@event-manager/db';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';

export const adminRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();
adminRoutes.use('*', adminAuth);

adminRoutes.get('/stats', async (c) => {
  const db = c.get('db');
  const [
    vendorsCount,
    festivalsCount,
    bannersCount,
    pendingReviews,
    pendingJobs,
    categoriesCount,
    deviceTokensCount,
  ] = await Promise.all([
    db.select({ value: count() }).from(vendors).where(isNull(vendors.deletedAt)),
    db.select({ value: count() }).from(festivals).where(isNull(festivals.deletedAt)),
    db
      .select({ value: count() })
      .from(banners)
      .where(and(isNull(banners.deletedAt), eq(banners.isActive, true))),
    db
      .select({ value: count() })
      .from(vendorReviews)
      .where(and(eq(vendorReviews.status, 'PENDING'), isNull(vendorReviews.deletedAt))),
    db
      .select({ value: count() })
      .from(notificationJobs)
      .where(eq(notificationJobs.status, 'PENDING')),
    db.select({ value: count() }).from(eventCategories).where(isNull(eventCategories.deletedAt)),
    db.select({ value: count() }).from(deviceTokens),
  ]);

  return c.json({
    data: {
      vendors: Number(vendorsCount[0]?.value ?? 0),
      festivals: Number(festivalsCount[0]?.value ?? 0),
      banners: Number(bannersCount[0]?.value ?? 0),
      pendingReviews: Number(pendingReviews[0]?.value ?? 0),
      pendingJobs: Number(pendingJobs[0]?.value ?? 0),
      categories: Number(categoriesCount[0]?.value ?? 0),
      deviceTokens: Number(deviceTokensCount[0]?.value ?? 0),
    },
  });
});
