import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { mediaFiles, newId, nowIso } from '@event-manager/db';
import { presignSchema } from '@event-manager/shared';
import type { Env, AppVariables } from '../env';
import { adminAuth } from '../middleware';
import { createPresignedUpload } from '../services/r2';
import { httpError } from '../lib/http';

export const uploadsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function handlePresign(c: any) {
  try {
    const body = presignSchema.parse(await c.req.json());
    const { key, uploadUrl, publicUrl } = await createPresignedUpload(c.env, {
      folder: body.folder,
      fileName: body.fileName,
      contentType: body.contentType,
    });
    const db = c.get('db');
    const id = newId();
    await db.insert(mediaFiles).values({
      id,
      key,
      url: publicUrl,
      contentType: body.contentType,
      sizeBytes: body.sizeBytes,
      folder: body.folder,
      createdAt: nowIso(),
    });
    return c.json({ data: { uploadUrl, publicUrl, mediaId: id, key } });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload presign failed';
    return httpError(500, 'UPLOAD_ERROR', message);
  }
}

uploadsRoutes.post('/presign', handlePresign);

const admin = new Hono<{ Bindings: Env; Variables: AppVariables }>();
admin.use('*', adminAuth);
admin.post('/presign', handlePresign);
uploadsRoutes.route('/admin', admin);
