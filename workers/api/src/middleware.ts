import { createMiddleware } from 'hono/factory';
import { createDb } from '@event-manager/db';
import type { Env, AppVariables } from './env';
import { httpError } from './lib/http';

export const withDb = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    c.set('db', createDb(c.env.DB));
    await next();
  }
);

export const adminAuth = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    const key = c.req.header('X-Admin-Key');
    const expected = c.env.ADMIN_API_KEY;
    if (!expected || key !== expected) {
      return httpError(401, 'UNAUTHORIZED', 'Invalid or missing admin API key');
    }
    await next();
  }
);

export function corsMiddleware() {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const origins = (c.env.CORS_ORIGINS || '*')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const origin = c.req.header('Origin');
    const allow =
      origins.includes('*') || (origin && origins.includes(origin)) ? origin || '*' : origins[0];

    if (c.req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allow || '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key,X-Device-Id',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    await next();
    c.res.headers.set('Access-Control-Allow-Origin', allow || '*');
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Key,X-Device-Id');
  });
}
