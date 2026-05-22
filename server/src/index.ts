import 'dotenv/config';
import path from 'path';
import { createApp } from './app';
import { initFirebase } from './services/fcm';
import { startCronJobs } from './workers/cron';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

initFirebase();

if (process.env.ENABLE_CRON === 'true') {
  startCronJobs();
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`Event Manager API running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
});
