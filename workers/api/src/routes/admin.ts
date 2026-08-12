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
import { z } from 'zod';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';
import { httpError } from '../lib/http';
import { signSession } from '../lib/session';

type AppEnv = { Bindings: Env; Variables: AppVariables };

export const adminRoutes = new Hono<AppEnv>();

const loginSchema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(200),
});

/** Public — username/password → session token */
adminRoutes.post('/login', async (c) => {
  const body = loginSchema.parse(await c.req.json());
  // Trim env values — `wrangler secret put` via PowerShell often stores a trailing \r\n
  const username = (c.env.ADMIN_USERNAME || 'admin').trim();
  const password = (c.env.ADMIN_PASSWORD || '').trim();
  const signingSecret = (c.env.ADMIN_API_KEY || '').trim();
  const givenUser = body.username.trim();
  const givenPass = body.password.trim();

  if (!password || !signingSecret) {
    return httpError(
      503,
      'AUTH_NOT_CONFIGURED',
      'ADMIN_PASSWORD and ADMIN_API_KEY must be set as Worker secrets'
    );
  }

  if (givenUser !== username || givenPass !== password) {
    return httpError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
  }

  const { token, expiresAt } = await signSession(signingSecret, username);
  return c.json({
    data: {
      token,
      expiresAt,
      username,
    },
  });
});

const secured = new Hono<AppEnv>();
secured.use('*', adminAuth);

secured.get('/me', async (c) => {
  return c.json({ data: { ok: true } });
});

secured.get('/stats', async (c) => {
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

adminRoutes.route('/', secured);
