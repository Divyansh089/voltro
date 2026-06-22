import prisma from '../../prisma/prismaClient';
import type { Prisma } from '@prisma/client';
import { AuditAction } from '../../common/enums';

export class AuditService {
  /**
   * List audit logs with pagination and filtering
   */
  static async findAll(params: {
    page: number;
    limit: number;
    userId?: string;
    action?: AuditAction;
    resource?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, userId, action, resource, resourceId, startDate, endDate, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(resource && { resource }),
      ...(resourceId && { resourceId }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        }
      })
    };

    const [total, logs] = await prisma.$transaction([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { email: true, customerProfile: { select: { firstName: true, lastName: true } }, staffProfile: { select: { employeeId: true } } }
          }
        }
      }),
    ]);

    return { total, logs };
  }
}
