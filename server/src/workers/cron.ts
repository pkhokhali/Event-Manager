import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { getPushQueue } from '../queues/push';

export function startCronJobs() {
  // Process scheduled notification jobs every minute
  cron.schedule('* * * * *', async () => {
    const due = await prisma.notificationJob.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
      take: 10,
    });

    const queue = getPushQueue();
    for (const job of due) {
      await queue.add('broadcast', { jobId: job.id }, { jobId: job.id });
    }
  });

  // Daily festival digest at 8 AM Nepal time (approx UTC+5:45 -> 2:15 UTC)
  cron.schedule('15 2 * * *', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow.setHours(0, 0, 0, 0));
    const end = new Date(tomorrow.setHours(23, 59, 59, 999));

    const festivals = await prisma.festival.findMany({
      where: { gregorianDate: { gte: start, lte: end }, deletedAt: null },
      take: 3,
    });

    if (festivals.length === 0) return;

    const names = festivals.map((f) => f.nameEn).join(', ');
    const job = await prisma.notificationJob.create({
      data: {
        title: 'Upcoming Festival',
        body: `Tomorrow: ${names}`,
        channel: 'PUSH',
        status: 'PENDING',
      },
    });

    const queue = getPushQueue();
    await queue.add('broadcast', { jobId: job.id });
  });

  console.log('Cron jobs started');
}
