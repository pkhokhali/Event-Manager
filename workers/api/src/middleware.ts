import { createMiddleware } from 'hono/factory';
import { createDb } from '@event-manager/db';
import type { Env, AppVariables } from './env';
import { httpError } from './lib/http';
import { verifySession } from './lib/session';

export const withDb = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    c.set('db', createDb(c.env.DB));
    await next();
  }
);

export const adminAuth = createMiddleware<{ Bindings: Env; Variables: AppVariables }>(
  async (c, next) => {
    const expectedKey = c.env.ADMIN_API_KEY;
    const headerKey = c.req.header('X-Admin-Key');
    if (expectedKey && headerKey && headerKey === expectedKey) {
      await next();
      return;
    }

    const auth = c.req.header('Authorization');
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (expectedKey && bearer) {
      const payload = await verifySession(expectedKey, bearer);
      if (payload) {
        await next();
        return;
      }
    }

    return httpError(401, 'UNAUTHORIZED', 'Invalid or missing admin credentials');
  }
);

function isOriginAllowed(origin: string | undefined, configured: string[]): string | null {
  if (!origin) return '*';
  if (configured.includes('*')) return origin;
  if (configured.includes(origin)) return origin;
  // Cloudflare Pages preview deployments: https://<hash>.event-manager-admin.pages.dev
  if (
    /^https:\/\/([a-z0-9-]+\.)?event-manager-admin\.pages\.dev$/i.test(origin) &&
    configured.some((o) => o.includes('event-manager-admin.pages.dev'))
  ) {
    return origin;
  }
  return null;
}

export function corsMiddleware() {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const origins = (c.env.CORS_ORIGINS || '*')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const origin = c.req.header('Origin');
    const allow = isOriginAllowed(origin, origins) || origins[0] || '*';

    if (c.req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allow,
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type,X-Admin-Key,X-Device-Id,Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    await next();
    c.res.headers.set('Access-Control-Allow-Origin', allow);
    c.res.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type,X-Admin-Key,X-Device-Id,Authorization'
    );
  });
}
