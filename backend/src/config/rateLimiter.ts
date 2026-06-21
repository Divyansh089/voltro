import { env } from './env';

/**
 * Rate Limiter Configuration
 *
 * Different rate limit windows for different endpoint categories.
 * Uses Redis store in production for distributed rate limiting.
 */
export const rateLimitConfig = {
  /** General API rate limit */
  general: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
    },
  },

  /** Strict rate limit for authentication endpoints */
  auth: {
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many authentication attempts. Please try again later.',
    },
  },

  /** Upload endpoints — more generous but still limited */
  upload: {
    windowMs: 60000, // 1 minute
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many upload requests. Please try again later.',
    },
  },
} as const;
