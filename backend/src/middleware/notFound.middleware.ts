import type { Request, Response } from 'express';
import { sendError } from '../common/responses';
import { HttpStatus } from '../common/enums/httpStatus.enum';

/**
 * 404 Not Found Middleware
 *
 * Catches any requests that don't match a defined route.
 * Must be registered after all route handlers.
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(HttpStatus.NOT_FOUND).json(
    sendError(
      `Route ${req.method} ${req.originalUrl} not found`,
      HttpStatus.NOT_FOUND
    )
  );
}
