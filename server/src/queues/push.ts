import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let pushQueue: Queue | null = null;

function getConnection() {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  return new IORedis(url, { maxRetriesPerRequest: null });
}

export function getPushQueue() {
  if (!pushQueue) {
    pushQueue = new Queue('push', { connection: getConnection() });
  }
  return pushQueue;
}
