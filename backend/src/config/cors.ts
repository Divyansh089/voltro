import { env } from './env';
import type { CorsOptions } from 'cors';

/**
 * CORS Configuration
 *
 * In development: Allow configured origins
 * In production: Whitelist allowed origins & Vercel deployment domains (*.vercel.app)
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow exact matches from CORS_ORIGINS or any Vercel domain (*.vercel.app)
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      env.NODE_ENV !== 'production';

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },

  // Allow credentials (cookies) to be sent cross-origin
  credentials: true,

  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  // Headers exposed to the client
  exposedHeaders: ['X-Total-Count', 'X-Request-Id'],

  // Preflight cache duration (24 hours)
  maxAge: 86400,
};
