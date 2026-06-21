import type { Request } from 'express';
import type { IRequestUser } from '../interfaces';

/**
 * Express Request extended with authenticated user data.
 * Used after auth middleware attaches user info.
 */
export interface AuthenticatedRequest extends Request {
  user: IRequestUser;
}

/**
 * Async request handler type for wrapping async controller methods.
 */
export type AsyncHandler = (
  req: Request,
  res: import('express').Response,
  next: import('express').NextFunction
) => Promise<void>;
