import Redis from 'ioredis';
import { env } from '../config/env';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('redis');

/**
 * Singleton Redis Client
 *
 * - Exponential backoff reconnect strategy
 * - Graceful degradation if Redis is unavailable
 * - Key prefix 'voltra:' to avoid collisions
 */
const redis = new Redis(env.REDIS_URL, {
  keyPrefix: 'voltra:',
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 3) {
      log.warn('Redis unavailable after 3 attempts. Falling back to PostgreSQL DB.');
      return null; // Stop retrying quickly to avoid log spam
    }
    return Math.min(times * 300, 2000);
  },
  lazyConnect: false,
  enableReadyCheck: true,
  showFriendlyErrorStack: true,
});

// Connection event handlers
redis.on('connect', () => {
  log.info('Redis connected');
});

redis.on('ready', () => {
  log.info('Redis ready');
});

redis.on('error', (err: any) => {
  if (err?.code === 'ECONNRESET' || err?.code === 'ECONNREFUSED') {
    log.debug({ code: err.code }, 'Redis connection reset/refused');
  } else {
    log.error({ err }, 'Redis error');
  }
});

redis.on('close', () => {
  log.warn('Redis connection closed');
});

/**
 * Graceful shutdown: disconnect Redis on process termination
 */
async function disconnectRedis(): Promise<void> {
  log.info('Disconnecting Redis...');
  await redis.quit();
  log.info('Redis disconnected');
}

process.on('SIGTERM', disconnectRedis);
process.on('SIGINT', disconnectRedis);

export { redis };
export default redis;
