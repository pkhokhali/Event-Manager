import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const client = new S3Client({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export async function createPresignedUpload(params: {
  folder: string;
  fileName: string;
  contentType: string;
}) {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error('AWS_S3_BUCKET not configured');

  const ext = params.fileName.split('.').pop() ?? 'bin';
  const key = `${params.folder}/${uuid()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  const publicUrl = process.env.AWS_S3_PUBLIC_URL
    ? `${process.env.AWS_S3_PUBLIC_URL}/${key}`
    : `https://${bucket}.s3.amazonaws.com/${key}`;

  return { key, uploadUrl, publicUrl };
}
