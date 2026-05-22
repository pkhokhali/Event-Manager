import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../lib/errors';

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Invalid request body', result.error.flatten())
      );
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Invalid query', result.error.flatten())
      );
    }
    (req as unknown as { validatedQuery: T }).validatedQuery = result.data;
    next();
  };
}
