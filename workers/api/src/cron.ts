import { and, eq, gte, isNull, lte } from 'drizzle-orm';
import { createDb, festivals, notificationJobs, newId, nowIso } from '@event-manager/db';
import type { Env, PushMessage } from './env';

export async function handleScheduled(controller: ScheduledController, env: Env) {
  const db = createDb(env.DB);

  if (controller.cron === '* * * * *') {
    const due = await db.query.notificationJobs.findMany({
      where: and(
        eq(notificationJobs.status, 'PENDING'),
        lte(notificationJobs.scheduledAt, nowIso())
      ),
      limit: 10,
    });
    for (const job of due) {
      await env.PUSH_QUEUE.send({ jobId: job.id } satisfies PushMessage);
    }
    return;
  }

  if (controller.cron === '15 2 * * *') {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 1);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCHours(23, 59, 59, 999);

    const upcoming = await db.query.festivals.findMany({
      where: and(
        isNull(festivals.deletedAt),
        gte(festivals.gregorianDate, start.toISOString()),
        lte(festivals.gregorianDate, end.toISOString())
      ),
      limit: 3,
    });

    if (upcoming.length === 0) return;

    const names = upcoming.map((f) => f.nameEn).join(', ');
    const id = newId();
    const now = nowIso();
    await db.insert(notificationJobs).values({
      id,
      title: 'Upcoming Festival',
      body: `Tomorrow: ${names}`,
      channel: 'PUSH',
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });
    await env.PUSH_QUEUE.send({ jobId: id } satisfies PushMessage);
  }
}
