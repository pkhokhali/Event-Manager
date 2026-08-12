import type { Database } from '@event-manager/db';

export type Env = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  PUSH_QUEUE: Queue;
  ADMIN_API_KEY: string;
  CORS_ORIGINS: string;
  R2_PUBLIC_URL: string;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
};

export type AppVariables = {
  db: Database;
};

export type PushMessage = {
  jobId: string;
};
