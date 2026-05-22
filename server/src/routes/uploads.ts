import { Router } from 'express';
import { presignSchema } from '@event-manager/shared';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { validateBody } from '../middleware/validate';
import { createPresignedUpload } from '../services/s3';

export const uploadsRouter = Router();

async function handlePresign(
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
) {
  try {
    const { folder, fileName, contentType, sizeBytes } = req.body;
    const { key, uploadUrl, publicUrl } = await createPresignedUpload({
      folder,
      fileName,
      contentType,
    });
    const media = await prisma.mediaFile.create({
      data: { key, url: publicUrl, contentType, sizeBytes, folder },
    });
    res.json({ data: { uploadUrl, publicUrl, mediaId: media.id, key } });
  } catch (e) {
    next(e);
  }
}

uploadsRouter.post('/presign', validateBody(presignSchema), async (req, res, next) => {
  return handlePresign(req, res, next);
});

const admin = Router();
admin.use(adminAuth);
admin.post('/presign', validateBody(presignSchema), async (req, res, next) => {
  return handlePresign(req, res, next);
});

uploadsRouter.use('/admin', admin);
