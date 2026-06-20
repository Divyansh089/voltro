/**
 * Shared interfaces used across modules.
 */

/** Base entity with common fields */
export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Soft-deletable entity */
export interface ISoftDeletable extends IBaseEntity {
  deletedAt: Date | null;
}

/** Authenticated request context (attached by auth middleware) */
export interface IRequestUser {
  userId: string;
  sessionId: string;
  role: string;
}

/** Pagination options for repository queries */
export interface IPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Paginated result from repository */
export interface IPaginatedResult<T> {
  data: T[];
  total: number;
}

/** Generic filter for repository queries */
export interface IFilterOptions {
  search?: string;
  [key: string]: unknown;
}
