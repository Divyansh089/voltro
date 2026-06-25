import app from './app';
import { env, logger } from './config';
import { configureCloudinary } from './config/cloudinary';

/**
 * Server Bootstrap
 *
 * - Initializes external services (Cloudinary)
 * - Starts HTTP server
 * - Handles graceful shutdown (SIGTERM, SIGINT)
 * - Handles uncaught exceptions and unhandled rejections
 */

// ── Initialize External Services ────────────────────────
configureCloudinary();

// ── Start HTTP Server ───────────────────────────────────
const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
      apiVersion: env.API_VERSION,
    },
    `🚀 Voltra API server running on http://localhost:${env.PORT}`
  );
  logger.info(`📚 API Docs: http://localhost:${env.PORT}/api/docs`);
  logger.info(`❤️  Health: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
});

// ── Graceful Shutdown ───────────────────────────────────
function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal. Closing HTTP server...');

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown — could not close connections in time');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Uncaught Exception Handler ──────────────────────────
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught Exception');
  process.exit(1);
});

// ── Unhandled Rejection Handler ─────────────────────────
process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled Promise Rejection');
  process.exit(1);
});

export default server;
