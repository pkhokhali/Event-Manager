import { AwsClient } from 'aws4fetch';
import type { Env } from '../env';

export async function createPresignedUpload(
  env: Env,
  params: { folder: string; fileName: string; contentType: string }
) {
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const accountId = env.R2_ACCOUNT_ID;
  const bucket = env.R2_BUCKET_NAME || 'event-manager-uploads';

  if (!accessKeyId || !secretAccessKey || !accountId) {
    throw new Error('R2 credentials not configured (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID)');
  }

  const ext = params.fileName.split('.').pop() ?? 'bin';
  const key = `${params.folder}/${crypto.randomUUID()}.${ext}`;
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${bucket}/${key}`;

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
  });

  const signed = await client.sign(new Request(url, { method: 'PUT', headers: { 'Content-Type': params.contentType } }), {
    aws: { signQuery: true },
  });

  const publicUrl = env.R2_PUBLIC_URL
    ? `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
    : url;

  return { key, uploadUrl: signed.url, publicUrl };
}
