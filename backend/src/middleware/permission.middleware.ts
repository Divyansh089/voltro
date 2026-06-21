import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors';
import { CacheService } from '../cache/cache.service';
import { CacheKeys } from '../cache/cacheKeys';
import { TTL } from '../cache/ttl';
import { RoleName } from '../common/enums';
import prisma from '../prisma/prismaClient';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('permission');

/**
 * Permission Middleware Factory
 *
 * Checks if the authenticated user's role has the required permission.
 * Permissions are loaded from Redis (cache-first) with DB fallback.
 *
 * @param requiredPermission - Permission string (e.g., 'product:create')
 *
 * @example
 *   router.post('/products', authMiddleware, permission('product:create'), controller.create);
 */
export function permission(requiredPermission: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Super admin bypass — all permissions granted implicitly
      if (user.role === RoleName.SUPER_ADMIN) {
        return next();
      }

      // Load permissions from cache
      let permissions = await CacheService.get<string[]>(
        CacheKeys.rolePermissions(user.role)
      );

      // Cache miss — load from database
      if (!permissions) {
        log.debug({ role: user.role }, 'Role permissions cache miss — loading from DB');

        const roleWithPermissions = await prisma.role.findFirst({
          where: { name: user.role },
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        });

        if (!roleWithPermissions) {
          throw new ForbiddenError('Role not found');
        }

        permissions = roleWithPermissions.rolePermissions.map(
          (rp) => rp.permission.name
        );

        // Cache for next request
        await CacheService.set(
          CacheKeys.rolePermissions(user.role),
          permissions,
          TTL.ROLE_PERMISSIONS
        );
      }

      // Check direct match
      if (permissions.includes(requiredPermission)) {
        return next();
      }

      // Check wildcard match (e.g., 'product:*' grants all product permissions)
      const [resource] = requiredPermission.split(':');
      if (permissions.includes(`${resource}:*`)) {
        return next();
      }

      // Permission denied
      throw new ForbiddenError(
        `Insufficient permissions. Required: ${requiredPermission}`
      );
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Role Middleware Factory
 *
 * Restricts access to specific roles (simpler than permission-based).
 * Use when you need role-level gates, not fine-grained permissions.
 *
 * @example
 *   router.get('/admin/stats', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), controller.getStats);
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(user.role)) {
      return next(
        new ForbiddenError(`Access restricted to roles: ${roles.join(', ')}`)
      );
    }

    next();
  };
}
