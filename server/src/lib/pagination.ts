import type { Request } from 'express';
import { paginationSchema } from '@event-manager/shared';

export function parsePagination(req: Request) {
  return paginationSchema.parse({
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    search: req.query.search,
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
