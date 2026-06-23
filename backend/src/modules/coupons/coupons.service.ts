import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { AuditAction } from '../../common/enums';
import type { Prisma } from '@prisma/client';

export class CouponsService {
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, isActive, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, coupons] = await prisma.$transaction([
      prisma.coupon.count({ where }),
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return { total, coupons };
  }

  static async findById(id: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundError('Coupon', id);
    return coupon;
  }

  static async create(data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictError('A coupon with this code already exists');

    const coupon = await prisma.$transaction(async (tx : any) => {
      const created = await tx.coupon.create({
        data: {
          ...data,
          validFrom: new Date(data.validFrom),
          validUntil: new Date(data.validUntil),
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'COUPON_CREATED',
          resource: 'coupon',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });

      return created;
    });

    return coupon;
  }

  static async update(id: string, data: any, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundError('Coupon', id);

    if (data.code && data.code !== coupon.code) {
      const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
      if (existing) throw new ConflictError('A coupon with this code already exists');
    }

    const updated = await prisma.$transaction(async (tx : any) => {
      const result = await tx.coupon.update({
        where: { id },
        data: {
          ...data,
          ...(data.validFrom && { validFrom: new Date(data.validFrom) }),
          ...(data.validUntil && { validUntil: new Date(data.validUntil) }),
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'COUPON_UPDATED',
          resource: 'coupon',
          resourceId: id,
          oldValues: coupon as any,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });

      return result; 
    });

    return updated;
  }

  static async delete(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const coupon = await prisma.coupon.findUnique({ 
      where: { id },
      include: { _count: { select: { orders: true } } }
    });
    
    if (!coupon) throw new NotFoundError('Coupon', id);

    if (coupon._count.orders > 0) {
      throw new ConflictError('Cannot delete a coupon that has been used in orders. Deactivate it instead.');
    }

    await prisma.$transaction(async (tx : any ) => {
      await tx.coupon.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'COUPON_DELETED',
          resource: 'coupon',
          resourceId: id,
          ipAddress,
          userAgent,
        }
      });
    });
  }

  /**
   * Validate a coupon code for an order amount and user
   */
  static async validateCoupon(code: string, userId: string, orderAmount: number) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) throw new BadRequestError('Invalid coupon code');
    if (!coupon.isActive) throw new BadRequestError('Coupon is no longer active');
    
    const now = new Date();
    if (now < coupon.validFrom) throw new BadRequestError('Coupon is not yet valid');
    if (now > coupon.validUntil) throw new BadRequestError('Coupon has expired');

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestError(`Order must be at least ${coupon.minOrderAmount} to use this coupon`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestError('Coupon usage limit reached');
    }

    // Check per-user limit
    const userUsage = await prisma.order.count({
      where: { userId, couponId: coupon.id, status: { not: 'CANCELLED' } }
    });

    if (userUsage >= coupon.perUserLimit) {
      throw new BadRequestError(`You have already used this coupon the maximum allowed times (${coupon.perUserLimit})`);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = orderAmount * (Number(coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    // Discount cannot exceed order amount
    discount = Math.min(discount, orderAmount);

    return {
      id: coupon.id,
      code: coupon.code,
      discountAmount: discount,
      finalAmount: orderAmount - discount,
    };
  }
}
