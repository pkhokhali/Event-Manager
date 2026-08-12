import { Hono } from 'hono';
import { and, desc, eq } from 'drizzle-orm';
import { deviceTokens, notificationJobs, newId, nowIso } from '@event-manager/db';
import { deviceRegisterSchema, notificationBroadcastSchema } from '@event-manager/shared';
import type { Env, AppVariables, PushMessage } from '../env';
import { adminAuth } from '../middleware';

export const notificationsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

notificationsRoutes.post('/devices/register', async (c) => {
  const body = deviceRegisterSchema.parse(await c.req.json());
  const db = c.get('db');
  const existing = await db.query.deviceTokens.findFirst({
    where: and(eq(deviceTokens.deviceId, body.deviceId), eq(deviceTokens.fcmToken, body.fcmToken)),
  });
  if (existing) {
    await db
      .update(deviceTokens)
      .set({ platform: body.platform, updatedAt: nowIso() })
      .where(eq(deviceTokens.id, existing.id));
    const token = await db.query.deviceTokens.findFirst({ where: eq(deviceTokens.id, existing.id) });
    return c.json({ data: token });
  }
  const id = newId();
  const now = nowIso();
  await db.insert(deviceTokens).values({
    id,
    deviceId: body.deviceId,
    fcmToken: body.fcmToken,
    platform: body.platform,
    createdAt: now,
    updatedAt: now,
  });
  const token = await db.query.deviceTokens.findFirst({ where: eq(deviceTokens.id, id) });
  return c.json({ data: token });
});

notificationsRoutes.get('/feed', async (c) => {
  const db = c.get('db');
  const jobs = await db.query.notificationJobs.findMany({
    where: eq(notificationJobs.status, 'COMPLETED'),
    orderBy: [desc(notificationJobs.sentAt)],
    limit: 30,
    columns: {
      id: true,
      title: true,
      body: true,
      channel: true,
      sentAt: true,
    },
  });
  return c.json({ data: jobs });
});

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);

admin.get('/jobs', async (c) => {
  const db = c.get('db');
  const jobs = await db.query.notificationJobs.findMany({
    orderBy: [desc(notificationJobs.createdAt)],
    limit: 50,
  });
  return c.json({ data: jobs });
});

admin.post('/broadcast', async (c) => {
  const body = notificationBroadcastSchema.parse(await c.req.json());
  const db = c.get('db');
  const id = newId();
  const now = nowIso();
  await db.insert(notificationJobs).values({
    id,
    title: body.title,
    body: body.body,
    channel: body.channel ?? 'PUSH',
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt).toISOString() : null,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });

  if (!body.scheduledAt) {
    await c.env.PUSH_QUEUE.send({ jobId: id } satisfies PushMessage);
  }

  const job = await db.query.notificationJobs.findFirst({ where: eq(notificationJobs.id, id) });
  return c.json({ data: job }, 201);
});

notificationsRoutes.route('/admin', admin);
