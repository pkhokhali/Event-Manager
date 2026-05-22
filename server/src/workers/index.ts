import 'dotenv/config';
import { startPushWorker } from './pushWorker';
import { startCronJobs } from './cron';

startPushWorker();
startCronJobs();
console.log('Workers running...');
