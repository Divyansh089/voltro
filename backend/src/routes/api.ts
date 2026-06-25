import { Router, type Request, type Response } from 'express';
import { sendSuccess } from '../common/responses';
import { redis } from '../cache/redisClient';
import prisma from '../prisma/prismaClient';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Returns 200 if the process is alive
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json(sendSuccess({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, 'Service is healthy'));
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness check
 *     description: Checks database and Redis connectivity
 *     responses:
 *       200:
 *         description: All dependencies are ready
 *       503:
 *         description: One or more dependencies are unavailable
 */
router.get('/health/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, { status: string; latency?: string }> = {};

  // Check PostgreSQL
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'ok',
      latency: `${Date.now() - dbStart}ms`,
    };
  } catch {
    checks.database = { status: 'error' };
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redis.ping();
    checks.redis = {
      status: 'ok',
      latency: `${Date.now() - redisStart}ms`,
    };
  } catch {
    checks.redis = { status: 'error' };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === 'ok');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json(sendSuccess({
    status: allHealthy ? 'ready' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  }, allHealthy ? 'All systems operational' : 'Some systems are degraded'));
});

export default router;
