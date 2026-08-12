import type { Context } from 'hono';
import { paginationSchema } from '@event-manager/shared';
import type { AppVariables, Env } from '../env';

export type AppContext = Context<{ Bindings: Env; Variables: AppVariables }>;

export function parsePagination(c: AppContext) {
  return paginationSchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sortBy: c.req.query('sortBy'),
    sortOrder: c.req.query('sortOrder'),
    search: c.req.query('search'),
  });
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return {
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export function httpError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}
