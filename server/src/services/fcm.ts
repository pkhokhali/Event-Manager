import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

let initialized = false;

export function initFirebase() {
  if (initialized) return;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!path || !existsSync(path)) {
    console.warn('FCM: Firebase service account not configured');
    return;
  }
  const serviceAccount = JSON.parse(readFileSync(path, 'utf-8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  initialized = true;
}

export async function sendPush(tokens: string[], title: string, body: string) {
  if (!initialized || tokens.length === 0) return { success: 0, failure: tokens.length };
  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
  });
  return { success: res.successCount, failure: res.failureCount };
}
