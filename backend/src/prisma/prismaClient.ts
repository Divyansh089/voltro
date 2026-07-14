import { PrismaClient } from '@prisma/client';
import { createModuleLogger } from '../config/logger';
import { isDevelopment } from '../config/env';

const log = createModuleLogger('prisma');

/**
 * Singleton Prisma Client
 *
 * - Logs slow queries (>200ms) in development
 * - Graceful disconnect on SIGTERM/SIGINT
 */
const basePrisma = new PrismaClient({
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
  // @ts-ignore - $on signature for query events is dynamic
  basePrisma.$on('query', (e : any) => {
    if (e.duration > 200) {
      log.warn({ query: e.query, duration: e.duration }, 'Slow query detected');
    }
  });
}

/**
 * Soft Delete Extension (Replaces old $use middleware)
 *
 * Automatically filters out soft-deleted records on findMany and findFirst.
 * Models with a `deletedAt` field are automatically filtered.
 */
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

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }: any) {
        if (softDeleteModels.includes(model as string)) {
          if (!args) args = {};
          if (!args.where) args.where = {};
          if (args.where.deletedAt === undefined) {
            args.where.deletedAt = null;
          }
        }
        return query(args);
      },
      async findFirst({ model, operation, args, query }: any) {
        if (softDeleteModels.includes(model as string)) {
          if (!args) args = {};
          if (!args.where) args.where = {};
          if (args.where.deletedAt === undefined) {
            args.where.deletedAt = null;
          }
        }
        return query(args);
      },
      async delete({ model, operation, args, query }: any) {
        if (softDeleteModels.includes(model as string)) {
          return (basePrisma as any)[model as string].update({
            ...args,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      },
      async deleteMany({ model, operation, args, query }: any) {
        if (softDeleteModels.includes(model as string)) {
          return (basePrisma as any)[model as string].updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      }
    }
  }
});

/**
 * Graceful shutdown: disconnect Prisma on process termination
 */
async function disconnectPrisma(): Promise<void> {
  log.info('Disconnecting Prisma client...');
  await basePrisma.$disconnect();
  log.info('Prisma client disconnected');
}

process.on('SIGTERM', disconnectPrisma);
process.on('SIGINT', disconnectPrisma);

export { prisma };
export default prisma;
