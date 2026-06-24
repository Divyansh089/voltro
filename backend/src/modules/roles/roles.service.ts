import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { AuditAction } from '../../common/enums';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import type { Prisma } from '@prisma/client';

export class RolesService {
  /**
   * Find a role by ID
   */
  static async findById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { permission: true }
        }
      },
    });

    if (!role) {
      throw new NotFoundError('Role', id);
    }

    return role;
  }

  /**
   * List all roles
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, roles] = await prisma.$transaction([
      prisma.role.count({ where }),
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { users: true, rolePermissions: true }
          }
        }
      }),
    ]);

    return { total, roles };
  }

  /**
   * Create a new custom role
   */
  static async create(
    data: { name: string; description?: string; permissions?: string[] },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existingRole = await prisma.role.findUnique({ where: { name: data.name } });
    if (existingRole) {
      throw new ConflictError('A role with this name already exists');
    }

    const newRole = await prisma.$transaction(async (tx: any) => {
      const role = await tx.role.create({
        data: {
          name: data.name,
          description: data.description,
          isSystem: false, // Custom role
          ...(data.permissions && {
            rolePermissions: {
              create: data.permissions.map(permissionId => ({
                permissionId
              }))
            }
          })
        },
        include: {
          rolePermissions: { include: { permission: true } }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.ROLE_CREATED,
          resource: 'role',
          resourceId: role.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return role;
    });

    return newRole;
  }

  /**
   * Update a role and its permissions
   */
  static async update(
    id: string,
    data: { name?: string; description?: string; permissions?: string[] },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundError('Role', id);
    }
    
    if (role.isSystem && data.name) {
      throw new BadRequestError('Cannot rename a system role');
    }

    if (data.name && data.name !== role.name) {
      const existingRole = await prisma.role.findUnique({ where: { name: data.name } });
      if (existingRole) {
        throw new ConflictError('A role with this name already exists');
      }
    }

    const updatedRole = await prisma.$transaction(async (tx: any) => {
      // 1. Update basic info
      const updated = await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        }
      });

      // 2. Update permissions if provided
      if (data.permissions) {
        // Delete old permissions
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        
        // Add new permissions
        if (data.permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: data.permissions.map(permissionId => ({
              roleId: id,
              permissionId
            }))
          });
        }
      }

      // 3. Log audit
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.ROLE_UPDATED,
          resource: 'role',
          resourceId: id,
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return updated;
    });

    // 4. Invalidate role permissions cache
    await CacheService.del(CacheKeys.rolePermissions(role.name));
    if (data.name && data.name !== role.name) {
      await CacheService.del(CacheKeys.rolePermissions(data.name));
    }

    return await this.findById(id);
  }

  /**
   * Delete a role
   */
  static async delete(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const role = await prisma.role.findUnique({ 
      where: { id },
      include: { _count: { select: { users: true } } }
    });
    
    if (!role) {
      throw new NotFoundError('Role', id);
    }
    
    if (role.isSystem) {
      throw new BadRequestError('Cannot delete a system role');
    }

    if (role._count.users > 0) {
      throw new ConflictError(`Cannot delete role. It is assigned to ${role._count.users} users`);
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.role.delete({ where: { id } });
      
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.ROLE_DELETED,
          resource: 'role',
          resourceId: id,
          ipAddress,
          userAgent,
        },
      });
    });

    await CacheService.del(CacheKeys.rolePermissions(role.name));
  }

  // ── Permissions ──────────────────────────────────────────

  /**
   * List all available permissions
   */
  static async findAllPermissions(params: {
    page: number;
    limit: number;
    search?: string;
    resource?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, resource, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(resource && { resource }),
    };

    const [total, permissions] = await prisma.$transaction([
      prisma.permission.count({ where }),
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return { total, permissions };
  }
}
