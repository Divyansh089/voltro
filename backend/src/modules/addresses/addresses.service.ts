import prisma from '../../prisma/prismaClient';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { AuditAction } from '../../common/enums';
import type { Prisma } from '@prisma/client';

export class AddressesService {
  /**
   * Get addresses for a user
   */
  static async findAll(userId: string) {
    return await prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Find address by ID (ensure it belongs to user)
   */
  static async findById(id: string, userId: string) {
    const address = await prisma.address.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!address) throw new NotFoundError('Address', id);
    return address;
  }

  /**
   * Add a new address
   */
  static async create(
    userId: string,
    data: {
      label?: string;
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
      isDefault?: boolean;
    },
    ipAddress?: string,
    userAgent?: string
  ) {
    // If it's the first address, make it default automatically
    const existingCount = await prisma.address.count({ where: { userId, deletedAt: null } });
    const isDefault = existingCount === 0 ? true : (data.isDefault || false);

    const address = await prisma.$transaction(async (tx: any) => {
      // Unset other defaults if this one is default
      if (isDefault && existingCount > 0) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, deletedAt: null },
          data: { isDefault: false },
        });
      }

      const created = await tx.address.create({
        data: {
          ...data,
          userId,
          isDefault,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'ADDRESS_CREATED',
          resource: 'address',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return created;
    });

    return address;
  }

  /**
   * Update address
   */
  static async update(
    id: string,
    userId: string,
    data: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    const address = await prisma.address.findFirst({ where: { id, userId, deletedAt: null } });
    if (!address) throw new NotFoundError('Address', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      if (data.isDefault && !address.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, id: { not: id }, deletedAt: null },
          data: { isDefault: false },
        });
      } else if (data.isDefault === false && address.isDefault) {
        throw new BadRequestError('Cannot unset default address directly. Set another address as default instead.');
      }

      const result = await tx.address.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'ADDRESS_UPDATED',
          resource: 'address',
          resourceId: id,
          oldValues: { ...address } as any,
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return result;
    });

    return updated;
  }

  /**
   * Soft delete address
   */
  static async delete(id: string, userId: string, ipAddress?: string, userAgent?: string) {
    const address = await prisma.address.findFirst({ where: { id, userId, deletedAt: null } });
    if (!address) throw new NotFoundError('Address', id);

    await prisma.$transaction(async (tx: any) => {
      await tx.address.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // If it was default, make the most recently created active address default
      if (address.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'ADDRESS_DELETED',
          resource: 'address',
          resourceId: id,
          ipAddress,
          userAgent,
        },
      });
    });
  }

  // ── Admin Endpoints ─────────────────────────────────────
  
  static async adminFindAll(params: {
    page: number;
    limit: number;
    userId?: string;
  }) {
    const { page, limit, userId } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(userId && { userId }),
      deletedAt: null,
    };

    const [total, addresses] = await prisma.$transaction([
      prisma.address.count({ where }),
      prisma.address.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } }
        }
      }),
    ]);

    return { total, addresses };
  }
}
