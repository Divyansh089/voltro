import { redis } from './redisClient';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('cache');

/**
 * Generic Cache Service
 *
 * Provides typed get/set/del/invalidation methods over Redis.
 * All modules use this service — no module creates raw Redis connections.
 */
export class CacheService {
  /**
   * Get a cached value by key.
   * Returns null if key doesn't exist or Redis is unavailable.
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      log.error({ key, error }, 'Cache GET failed');
      return null; // Graceful degradation
    }
  }

  /**
   * Set a cached value with TTL (in seconds).
   */
  static async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttlSeconds, serialized);
    } catch (error) {
      log.error({ key, error }, 'Cache SET failed');
    }
  }

  /**
   * Delete a specific cache key.
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      log.error({ key, error }, 'Cache DEL failed');
    }
  }

  /**
   * Delete multiple cache keys.
   */
  static async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await redis.del(...keys);
    } catch (error) {
      log.error({ keys, error }, 'Cache DEL MANY failed');
    }
  }

  /**
   * Delete all keys matching a pattern.
   * Uses SCAN (not KEYS) to avoid blocking Redis.
   *
   * NOTE: Pattern is relative to the key prefix.
   * E.g., 'products:list:*' will match 'voltra:products:list:...'
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const stream = redis.scanStream({
        match: pattern,
        count: 100,
      });

      const keysToDelete: string[] = [];

      for await (const keys of stream) {
        keysToDelete.push(...(keys as string[]));
      }

      if (keysToDelete.length > 0) {
        // Remove the prefix since del() will add it
        const cleanKeys = keysToDelete.map((k) =>
          k.replace(/^voltra:/, '')
        );
        await redis.del(...cleanKeys);
        log.debug({ pattern, count: cleanKeys.length }, 'Cache pattern invalidated');
      }
    } catch (error) {
      log.error({ pattern, error }, 'Cache INVALIDATE PATTERN failed');
    }
  }

  /**
   * Check if a key exists in cache.
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      log.error({ key, error }, 'Cache EXISTS failed');
      return false;
    }
  }

  /**
   * Increment a counter key. Creates it if it doesn't exist.
   * Returns the new value.
   */
  static async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const value = await redis.incr(key);
      if (ttlSeconds && value === 1) {
        // Set TTL only on first increment (key creation)
        await redis.expire(key, ttlSeconds);
      }
      return value;
    } catch (error) {
      log.error({ key, error }, 'Cache INCR failed');
      return 0;
    }
  }

  /**
   * Get the TTL of a key in seconds.
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      log.error({ key, error }, 'Cache TTL failed');
      return -1;
    }
  }
}
