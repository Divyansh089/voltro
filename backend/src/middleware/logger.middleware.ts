import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

/**
 * Request Logger Middleware
 *
 * - Assigns a unique requestId (UUID v4) to every request
 * - Logs incoming request details
 * - Logs response status and duration on finish
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Attach requestId to request and response
  (req as any).id = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Log incoming request
  logger.info({
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, 'Incoming request');

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]({
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.userId,
    }, 'Request completed');
  });

  next();
}
