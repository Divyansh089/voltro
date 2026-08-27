import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../common/errors';
import { CacheService } from '../cache/cache.service';
import { CacheKeys } from '../cache/cacheKeys';
import prisma from '../prisma/prismaClient';

/**
 * Authentication Middleware
 *
 * Verifies the JWT access token from the Authorization header.
 * Validates the session exists in Redis or falls back to PostgreSQL DB.
 * Attaches the decoded user to req.user.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Extract Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Access token is required'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new UnauthorizedError('Access token is required'));
    }

    // Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Access token has expired'));
      }
      return next(new UnauthorizedError('Invalid access token'));
    }

    // 1. Check Redis cache first
    CacheService.get<{ userId: string; role: string }>(CacheKeys.session(decoded.sessionId))
      .then(async (session) => {
        if (session) {
          (req as any).user = {
            userId: decoded.userId,
            sessionId: decoded.sessionId,
            role: decoded.role,
          };
          return next();
        }

        // 2. Database Fallback: Check PostgreSQL if Redis missed/failed
        try {
          const dbSession = await prisma.session.findUnique({
            where: { id: decoded.sessionId },
            include: { user: { include: { role: true } } },
          });

          if (!dbSession || !dbSession.isActive || dbSession.expiresAt < new Date()) {
            console.log("[DEBUG] Session missing or inactive in DB for ID:", decoded.sessionId);
            return next(new UnauthorizedError('Session has been invalidated'));
          }

          // Asynchronously re-cache valid session into Redis
          CacheService.set(
            CacheKeys.session(decoded.sessionId),
            { userId: dbSession.userId, role: dbSession.user.role.name },
            60 * 60 * 24
          ).catch(() => {});

          (req as any).user = {
            userId: dbSession.userId,
            sessionId: dbSession.id,
            role: dbSession.user.role.name,
          };

          next();
        } catch (dbErr) {
          // If DB query fails, fall back to decoded JWT token info
          (req as any).user = {
            userId: decoded.userId,
            sessionId: decoded.sessionId,
            role: decoded.role,
          };
          next();
        }
      })
      .catch(() => {
        // Redis unavailable — fall through to decoded JWT payload
        (req as any).user = {
          userId: decoded.userId,
          sessionId: decoded.sessionId,
          role: decoded.role,
        };
        next();
      });
  } catch (error) {
    next(error);
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
