import pino from 'pino';
import { env, isDevelopment } from './env';

/**
 * Pino Logger Configuration
 *
 * - Structured JSON in production (for log aggregation systems)
 * - Pretty-printed in development (for human readability)
 * - Sensitive fields are redacted automatically
 */
export const logger = pino({
  level: env.LOG_LEVEL,

  // Redact sensitive fields from all log output
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'refreshToken',
      'authorization',
      'cookie',
      'creditCard',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  // Add timestamp in ISO format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base context attached to every log line
  base: {
    service: 'voltra-api',
    env: env.NODE_ENV,
  },

  // Pretty print in development
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
});

/**
 * Create a child logger with module-specific context.
 * Every module should create its own child logger:
 *
 * const log = createModuleLogger('products');
 * log.info('Product created', { productId });
 */
export function createModuleLogger(module: string) {
  return logger.child({ module });
}

export type Logger = pino.Logger;
