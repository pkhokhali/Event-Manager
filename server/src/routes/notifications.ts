import { Router } from 'express';
import { deviceRegisterSchema, notificationBroadcastSchema } from '@event-manager/shared';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { validateBody } from '../middleware/validate';
import { getPushQueue } from '../queues/push';

export const notificationsRouter = Router();

notificationsRouter.post('/devices/register', validateBody(deviceRegisterSchema), async (req, res, next) => {
  try {
    const { deviceId, fcmToken, platform } = req.body;
    const token = await prisma.deviceToken.upsert({
      where: { deviceId_fcmToken: { deviceId, fcmToken } },
      create: { deviceId, fcmToken, platform },
      update: { platform, updatedAt: new Date() },
    });
    res.json({ data: token });
  } catch (e) {
    next(e);
  }
});

notificationsRouter.get('/feed', async (_req, res, next) => {
  try {
    const jobs = await prisma.notificationJob.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { sentAt: 'desc' },
      take: 30,
      select: { id: true, title: true, body: true, channel: true, sentAt: true },
    });
    res.json({ data: jobs });
  } catch (e) {
    next(e);
  }
});

const admin = Router();
admin.use(adminAuth);

admin.get('/jobs', async (_req, res, next) => {
  try {
    const jobs = await prisma.notificationJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ data: jobs });
  } catch (e) {
    next(e);
  }
});

admin.post('/broadcast', validateBody(notificationBroadcastSchema), async (req, res, next) => {
  try {
    const job = await prisma.notificationJob.create({
      data: {
        title: req.body.title,
        body: req.body.body,
        channel: req.body.channel,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
        status: 'PENDING',
      },
    });

    if (!req.body.scheduledAt) {
      const queue = getPushQueue();
      await queue.add('broadcast', { jobId: job.id });
    }

    res.status(201).json({ data: job });
  } catch (e) {
    next(e);
  }
});

notificationsRouter.use('/admin', admin);
