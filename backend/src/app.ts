import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { corsOptions, helmetOptions, swaggerOptions, isSwaggerEnabled } from './config';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/notFound.middleware';
import routes from './routes';

/**
 * Express Application Setup
 *
 * Registers middleware in the correct order and mounts all routes.
 * This file defines WHAT the app does — server.ts defines HOW it runs.
 */
const app = express();

// ── 1. Request Logger (FIRST — assigns requestId) ────────
app.use(loggerMiddleware);

// ── 2. Security Headers ──────────────────────────────────
app.use(helmet(helmetOptions));

// ── 3. CORS ──────────────────────────────────────────────
app.use(cors(corsOptions));

// ── 4. Body Parsers ──────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 5. Cookie Parser ─────────────────────────────────────
app.use(cookieParser());

// ── 6. Swagger Documentation ─────────────────────────────
if (isSwaggerEnabled) {
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Voltra API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  }));
}

// ── 7. Mount All Routes ──────────────────────────────────
app.use(routes);

// ── 8. 404 Handler (after all routes) ────────────────────
app.use(notFoundMiddleware);

// ── 9. Global Error Handler (LAST) ──────────────────────
app.use(errorMiddleware);

export default app;
