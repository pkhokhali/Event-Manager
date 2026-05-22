import type { RequestHandler } from 'express';
import { unauthorized } from '../lib/errors';

export const adminAuth: RequestHandler = (req, _res, next) => {
  const key = req.header('X-Admin-Key');
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || key !== expected) {
    return next(unauthorized('Invalid or missing admin API key'));
  }
  next();
};
