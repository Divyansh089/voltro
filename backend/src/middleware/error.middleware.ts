import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors';
import { sendError } from '../common/responses';
import { HttpStatus } from '../common/enums/httpStatus.enum';
import { logger } from '../config/logger';
import { isDevelopment } from '../config/env';

/**
 * Global Error Handler Middleware
 *
 * Must be registered LAST in the middleware chain.
 * Catches all errors that bubble up from controllers/services.
 *
 * Error classification:
 * 1. AppError (known) → Use error's statusCode and message
 * 2. PrismaClientKnownRequestError → Map to appropriate HTTP status
 * 3. ZodError → 422 Validation Error
 * 4. JsonWebTokenError → 401 Unauthorized
 * 5. Unknown error → 500 Internal Server Error
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Known Application Errors ─────────────────────────
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({
        requestId: (req as any).id,
        error: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
      }, 'Server error');
    }

    res.status(err.statusCode).json(
      sendError(
        err.message,
        err.statusCode,
        err.errors,
        isDevelopment ? err.stack : undefined
      )
    );
    return;
  }

  // ── Prisma Errors ────────────────────────────────────
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        statusCode = HttpStatus.CONFLICT;
        const fields = prismaError.meta?.target?.join(', ') || 'field';
        message = `A record with this ${fields} already exists`;
        break;
      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003': // Foreign key constraint
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference — related record does not exist';
        break;
      case 'P2014': // Required relation violation
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Required relation violation';
        break;
      default:
        logger.error({
          requestId: (req as any).id,
          prismaCode: prismaError.code,
          error: prismaError.message,
        }, 'Unhandled Prisma error');
    }

    res.status(statusCode).json(
      sendError(message, statusCode, undefined, isDevelopment ? err.stack : undefined)
    );
    return;
  }

  // ── JWT Errors ───────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired'
      : 'Invalid token';

    res.status(HttpStatus.UNAUTHORIZED).json(
      sendError(message, HttpStatus.UNAUTHORIZED)
    );
    return;
  }

  // ── Multer Errors (file upload) ──────────────────────
  if (err.constructor.name === 'MulterError') {
    const multerError = err as any;
    let message = 'File upload error';

    if (multerError.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the maximum allowed size';
    } else if (multerError.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }

    res.status(HttpStatus.BAD_REQUEST).json(
      sendError(message, HttpStatus.BAD_REQUEST)
    );
    return;
  }

  // ── Syntax Errors (malformed JSON) ───────────────────
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(HttpStatus.BAD_REQUEST).json(
      sendError('Invalid JSON in request body', HttpStatus.BAD_REQUEST)
    );
    return;
  }

  // ── Unknown/Unexpected Errors ────────────────────────
  logger.error({
    requestId: (req as any).id,
    error: err.message,
    stack: err.stack,
    name: err.name,
  }, 'Unhandled error');

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
    sendError(
      isDevelopment ? err.message : 'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
      isDevelopment ? err.stack : undefined
    )
  );
}
