import { HttpStatus } from '../enums/httpStatus.enum';

/**
 * Base Application Error
 *
 * All custom errors extend this class. The global error handler
 * uses instanceof checks to determine the response format.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational = true,
    errors?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.name = this.constructor.name;

    // Capture stack trace, excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors?: Array<{ field?: string; message: string }>) {
    super(message, HttpStatus.BAD_REQUEST, true, errors);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden — Insufficient permissions') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    errors: Array<{ field?: string; message: string }> = []
  ) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, true, errors);
  }
}

/**
 * 429 Too Many Requests
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(service = 'Service') {
    super(`${service} is currently unavailable. Please try again later.`, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
