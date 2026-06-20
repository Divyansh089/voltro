import { HttpStatus } from '../enums/httpStatus.enum';

/**
 * Standardized API Response Interfaces
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: IPaginationMeta;
  timestamp: string;
}

export interface IErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
  stack?: string;
  timestamp: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Send a standardized success response.
 */
export function sendSuccess<T>(
  data: T,
  message = 'Success',
  statusCode: HttpStatus = HttpStatus.OK,
  meta?: IPaginationMeta
): IApiResponse<T> {
  return {
    success: true,
    statusCode,
    message,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send a standardized created response.
 */
export function sendCreated<T>(data: T, message = 'Resource created successfully'): IApiResponse<T> {
  return sendSuccess(data, message, HttpStatus.CREATED);
}

/**
 * Send a standardized error response.
 */
export function sendError(
  message: string,
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  errors?: Array<{ field?: string; message: string }>,
  stack?: string
): IErrorResponse {
  return {
    success: false,
    statusCode,
    message,
    ...(errors && errors.length > 0 && { errors }),
    ...(stack && { stack }),
    timestamp: new Date().toISOString(),
  };
}
