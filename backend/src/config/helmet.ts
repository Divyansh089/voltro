import type { HelmetOptions } from 'helmet';

/**
 * Helmet Security Headers Configuration
 *
 * Helmet sets various HTTP headers to help protect the app from
 * well-known web vulnerabilities.
 */
export const helmetOptions: HelmetOptions = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Swagger UI needs inline styles
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Prevent clickjacking
  frameguard: { action: 'deny' },

  // Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Prevent MIME type sniffing
  noSniff: undefined, // uses default (X-Content-Type-Options: nosniff)

  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Remove X-Powered-By header
  hidePoweredBy: undefined, // uses default (removes header)

  // XSS Filter
  xssFilter: undefined, // uses default
};
