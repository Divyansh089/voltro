import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../config/logger';
import { isDevelopment } from '../config/env';

const log = createModuleLogger('prisma');

/**
 * Singleton Prisma Client
 *
 * - Logs slow queries (>200ms) in development
 * - Soft delete middleware filters deletedAt automatically
 * - Graceful disconnect on SIGTERM/SIGINT
 */
const prisma = new PrismaClient({
  log: isDevelopment
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : [
        { level: 'error', emit: 'stdout' },
      ],
});

// Log slow queries in development
if (isDevelopment) {
  prisma.$on('query', (e : any) => {
    if (e.duration > 200) {
      log.warn({ query: e.query, duration: e.duration }, 'Slow query detected');
    }
  });
}

/**
 * Soft Delete Middleware
 *
 * Automatically filters out soft-deleted records on findMany and findFirst.
 * Models with a `deletedAt` field are automatically filtered.
 */
prisma.$use(async (params : any, next : any) => {
  // List of models that support soft delete
  const softDeleteModels = [
    'User',
    'Product',
    'Category',
    'Variant',
    'Order',
    'Address',
    'Coupon',
    'SupportTicket',
  ];

  if (params.model && softDeleteModels.includes(params.model)) {
    // findMany / findFirst: add deletedAt filter
    if (params.action === 'findMany' || params.action === 'findFirst') {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};

      // Only add filter if not explicitly querying deleted records
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }

    // delete → soft delete (update with deletedAt)
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }

    // deleteMany → soft delete many
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (!params.args) params.args = {};
      params.args.data = { deletedAt: new Date() };
    }
  }

  return next(params);
});

/**
 * Graceful shutdown: disconnect Prisma on process termination
 */
async function disconnectPrisma(): Promise<void> {
  log.info('Disconnecting Prisma client...');
  await prisma.$disconnect();
  log.info('Prisma client disconnected');
}

process.on('SIGTERM', disconnectPrisma);
process.on('SIGINT', disconnectPrisma);

export { prisma };
export default prisma;
