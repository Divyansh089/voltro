import { type IPaginationMeta } from '../responses/apiResponse';

/** Default pagination constants */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Pagination query parameters (parsed from request query)
 */
export interface IPaginationQuery {
  page: number;
  limit: number;
}

/**
 * Calculate pagination metadata from query + total count.
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): IPaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Calculate the offset (skip) for Prisma queries.
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
