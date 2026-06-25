import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError } from '../../common/errors';
import { hashPassword } from '../../common/helpers';
import { AuditAction } from '../../common/enums';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import type { Prisma } from '@prisma/client';

export class UsersService {
  /**
   * Find a user by ID
   */
  static async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
        avatarUrl: true,
        createdAt: true,
        role: {
          select: { id: true, name: true }
        },
        customerProfile: true,
        staffProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return user;
  }

  /**
   * List all users with pagination and filtering
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, role, isActive, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { customerProfile: { firstName: { contains: search, mode: 'insensitive' } } },
          { customerProfile: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(role && { role: { name: role } }),
      ...(isActive !== undefined && { isActive }),
    };

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          isActive: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          role: { select: { id: true, name: true } },
          customerProfile: { select: { firstName: true, lastName: true } },
          staffProfile: { select: { employeeId: true } },
        },
      }),
    ]);

    return { total, users };
  }

  /**
   * Update user details (Admin operation)
   */
  static async update(
    id: string,
    data: { roleId?: string; isActive?: boolean; isEmailVerified?: boolean },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError('User', id);
    }

    // Don't allow updating Super Admin role directly this way (or prevent disabling them)
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (user.roleId === superAdminRole?.id && data.isActive === false) {
      throw new ConflictError('Cannot deactivate a Super Admin');
    }

    const updatedUser = await prisma.$transaction(async (tx: any) => {
      const result = await tx.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          isActive: true,
          isEmailVerified: true,
          role: { select: { name: true } }
        }
      });

      // Log audit
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.USER_UPDATED,
          resource: 'user',
          resourceId: id,
          oldValues: { roleId: user.roleId, isActive: user.isActive },
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      // If deactivated, revoke all sessions
      if (data.isActive === false) {
        const activeSessions = await tx.session.findMany({ where: { userId: id, isActive: true } });
        for (const session of activeSessions) {
          await CacheService.del(CacheKeys.session(session.id));
        }
        await tx.session.updateMany({
          where: { userId: id },
          data: { isActive: false },
        });
      }

      // If role changed, they should login again to get new permissions
      if (data.roleId && data.roleId !== user.roleId) {
        const activeSessions = await tx.session.findMany({ where: { userId: id, isActive: true } });
        for (const session of activeSessions) {
          await CacheService.del(CacheKeys.session(session.id));
        }
        await tx.session.updateMany({
          where: { userId: id },
          data: { isActive: false },
        });
      }

      return result;
    });

    return updatedUser;
  }

  /**
   * Delete a user (Soft delete)
   */
  static async delete(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError('User', id);
    }

    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (user.roleId === superAdminRole?.id) {
      throw new ConflictError('Cannot delete a Super Admin');
    }

    await prisma.$transaction(async (tx: any) => {
      // Prisma soft delete middleware handles the actual update
      await tx.user.delete({ where: { id } });
      
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.USER_DELETED,
          resource: 'user',
          resourceId: id,
          ipAddress,
          userAgent,
        },
      });

      // Revoke sessions
      const activeSessions = await tx.session.findMany({ where: { userId: id, isActive: true } });
      for (const session of activeSessions) {
        await CacheService.del(CacheKeys.session(session.id));
      }
      await tx.session.updateMany({
        where: { userId: id },
        data: { isActive: false },
      });
    });
  }
}
