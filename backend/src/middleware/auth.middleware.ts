import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../common/errors';
import { CacheService } from '../cache/cache.service';
import { CacheKeys } from '../cache/cacheKeys';
import type { IRequestUser } from '../common/interfaces';

/**
 * Authentication Middleware
 *
 * Verifies the JWT access token from the Authorization header.
 * Validates the session exists in Redis.
 * Attaches the decoded user to req.user.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Extract Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    // Verify JWT
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      sessionId: string;
      role: string;
      iat: number;
      exp: number;
    };

    // Validate session exists in Redis (async, but we handle it)
    CacheService.get<{ userId: string; role: string }>(CacheKeys.session(decoded.sessionId))
      .then((session) => {
        if (!session) {
          return next(new UnauthorizedError('Session has been invalidated'));
        }

        // Attach user to request
        (req as any).user = {
          userId: decoded.userId,
          sessionId: decoded.sessionId,
          role: decoded.role,
        } satisfies IRequestUser;

        next();
      })
      .catch(() => {
        // Redis unavailable — fall through (graceful degradation)
        // In production, you might want to deny access if Redis is down
        (req as any).user = {
          userId: decoded.userId,
          sessionId: decoded.sessionId,
          role: decoded.role,
        } satisfies IRequestUser;

        next();
      });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if ((error as any).name === 'TokenExpiredError') {
      next(new UnauthorizedError('Access token has expired'));
    } else if ((error as any).name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid access token'));
    } else {
      next(error);
    }
  }
}

/**
 * Optional Auth Middleware
 *
 * Like authMiddleware, but doesn't reject unauthenticated requests.
 * Used for endpoints that work differently for auth'd vs anon users
 * (e.g., product listing might show wishlist status for logged-in users).
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token — proceed as anonymous
  }

  // If token is present, validate it
  authMiddleware(req, _res, next);
}
