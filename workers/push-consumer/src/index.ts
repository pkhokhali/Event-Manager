import { eq } from 'drizzle-orm';
import { createDb, deviceTokens, notificationJobs, nowIso } from '@event-manager/db';

type Env = {
  DB: D1Database;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
};

type PushMessage = { jobId: string };

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: unknown) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const unsigned = `${enc(header)}.${enc(claim)}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const jwt = `${unsigned}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`OAuth token failed: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

async function sendFcm(
  sa: ServiceAccount,
  tokens: string[],
  title: string,
  body: string
) {
  if (tokens.length === 0) return;
  const accessToken = await getAccessToken(sa);
  // FCM HTTP v1 sends one message at a time; batch in small chunks
  for (const token of tokens) {
    await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
        },
      }),
    });
  }
}

async function processJob(env: Env, jobId: string) {
  const db = createDb(env.DB);
  const job = await db.query.notificationJobs.findFirst({
    where: eq(notificationJobs.id, jobId),
  });
  if (!job) return;

  await db
    .update(notificationJobs)
    .set({ status: 'PROCESSING', updatedAt: nowIso() })
    .where(eq(notificationJobs.id, jobId));

  const tokens = await db.query.deviceTokens.findMany({
    columns: { fcmToken: true },
  });

  try {
    const json = env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not set; marking completed without send');
    } else {
      const sa = JSON.parse(json) as ServiceAccount;
      await sendFcm(
        sa,
        tokens.map((t) => t.fcmToken),
        job.title,
        job.body
      );
    }
    await db
      .update(notificationJobs)
      .set({ status: 'COMPLETED', sentAt: nowIso(), updatedAt: nowIso() })
      .where(eq(notificationJobs.id, jobId));
  } catch (err) {
    await db
      .update(notificationJobs)
      .set({
        status: 'FAILED',
        error: err instanceof Error ? err.message : 'Unknown error',
        updatedAt: nowIso(),
      })
      .where(eq(notificationJobs.id, jobId));
    throw err;
  }
}

export default {
  async queue(batch: MessageBatch<PushMessage>, env: Env) {
    for (const msg of batch.messages) {
      try {
        await processJob(env, msg.body.jobId);
        msg.ack();
      } catch (e) {
        console.error('Push consume failed', e);
        msg.retry();
      }
    }
  },
};
