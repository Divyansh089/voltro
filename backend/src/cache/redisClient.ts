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
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 10) {
      log.error('Redis max retries exceeded. Giving up.');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 200, 5000); // Exponential backoff, max 5s
    log.warn({ attempt: times, delay }, 'Redis reconnecting...');
    return delay;
  },
  lazyConnect: false,
  enableReadyCheck: true,
});

// Connection event handlers
redis.on('connect', () => {
  log.info('Redis connected');
});

redis.on('ready', () => {
  log.info('Redis ready');
});

redis.on('error', (err) => {
  log.error({ err }, 'Redis error');
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
