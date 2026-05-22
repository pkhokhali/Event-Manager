import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../lib/prisma';
import { initFirebase, sendPush } from '../services/fcm';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export function startPushWorker() {
  initFirebase();

  const worker = new Worker(
    'push',
    async (job) => {
      const { jobId } = job.data as { jobId: string };
      const notifJob = await prisma.notificationJob.findUnique({ where: { id: jobId } });
      if (!notifJob) return;

      await prisma.notificationJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING' },
      });

      const tokens = await prisma.deviceToken.findMany({ select: { fcmToken: true } });
      const fcmTokens = tokens.map((t) => t.fcmToken);

      try {
        await sendPush(fcmTokens, notifJob.title, notifJob.body);
        await prisma.notificationJob.update({
          where: { id: jobId },
          data: { status: 'COMPLETED', sentAt: new Date() },
        });
      } catch (err) {
        await prisma.notificationJob.update({
          where: { id: jobId },
          data: {
            status: 'FAILED',
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
        throw err;
      }
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error(`Push job ${job?.id} failed:`, err);
  });

  return worker;
}
