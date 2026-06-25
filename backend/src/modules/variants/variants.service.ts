import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { AuditAction } from '../../common/enums';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import type { Prisma } from '@prisma/client';

export class VariantsService {
  /**
   * List variants
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    productId?: string;
    isActive?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, productId, isActive, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(productId && { productId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { sku: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, variants] = await prisma.$transaction([
      prisma.variant.count({ where }),
      prisma.variant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          inventory: true,
          product: { select: { id: true, name: true, slug: true } }
        },
      }),
    ]);

    return { total, variants };
  }

  /**
   * Find a variant by ID
   */
  static async findById(id: string) {
    const variant = await prisma.variant.findUnique({
      where: { id },
      include: {
        inventory: true,
        product: { select: { id: true, name: true, slug: true } }
      }
    });

    if (!variant) throw new NotFoundError('Variant', id);
    return variant;
  }

  /**
   * Create a new variant
   */
  static async create(
    data: {
      productId: string;
      sku: string;
      name: string;
      color?: string;
      storage?: string;
      size?: string;
      price?: number;
      isActive?: boolean;
      initialStock?: number;
    },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // 1. Verify product exists
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundError('Product', data.productId);

    // 2. Verify SKU is unique
    const existingSku = await prisma.variant.findUnique({ where: { sku: data.sku } });
    if (existingSku) throw new ConflictError('A variant with this SKU already exists');

    const variant = await prisma.$transaction(async (tx: any) => {
      // 3. Create Variant & Inventory
      const created = await tx.variant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          name: data.name,
          color: data.color,
          storage: data.storage,
          size: data.size,
          price: data.price,
          isActive: data.isActive,
          inventory: {
            create: {
              quantity: data.initialStock || 0,
              reservedQuantity: 0,
              lowStockThreshold: 10,
            }
          }
        },
        include: { inventory: true }
      });

      // 4. Log Audit
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'VARIANT_CREATED',
          resource: 'variant',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return created;
    });

    // Invalidate product cache
    await CacheService.del(CacheKeys.productDetail(product.id));
    await CacheService.del(CacheKeys.productDetail(product.slug));
    await CacheService.invalidatePattern('products:list:*');

    return variant;
  }

  /**
   * Update a variant
   */
  static async update(
    id: string,
    data: {
      sku?: string;
      name?: string;
      color?: string;
      storage?: string;
      size?: string;
      price?: number;
      isActive?: boolean;
    },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const variant = await prisma.variant.findUnique({ where: { id }, include: { product: true } });
    if (!variant) throw new NotFoundError('Variant', id);

    if (data.sku && data.sku !== variant.sku) {
      const existingSku = await prisma.variant.findUnique({ where: { sku: data.sku } });
      if (existingSku) throw new ConflictError('A variant with this SKU already exists');
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.variant.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'VARIANT_UPDATED',
          resource: 'variant',
          resourceId: id,
          oldValues: { sku: variant.sku, name: variant.name, price: variant.price, isActive: variant.isActive },
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return result;
    });

    // Invalidate product cache
    await CacheService.del(CacheKeys.productDetail(variant.product.id));
    await CacheService.del(CacheKeys.productDetail(variant.product.slug));
    await CacheService.invalidatePattern('products:list:*');

    return updated;
  }

  /**
   * Delete a variant
   */
  static async delete(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const variant = await prisma.variant.findUnique({ 
      where: { id },
      include: { 
        product: true,
        _count: { select: { orderItems: true } }
      } 
    });
    
    if (!variant) throw new NotFoundError('Variant', id);

    if (variant._count.orderItems > 0) {
      throw new ConflictError('Cannot delete a variant that has been ordered. Deactivate it instead.');
    }

    await prisma.$transaction(async (tx: any) => {
      // Must delete inventory first due to foreign keys, or rely on cascade
      await tx.variant.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'VARIANT_DELETED',
          resource: 'variant',
          resourceId: id,
          ipAddress,
          userAgent,
        },
      });
    });

    // Invalidate product cache
    await CacheService.del(CacheKeys.productDetail(variant.product.id));
    await CacheService.del(CacheKeys.productDetail(variant.product.slug));
    await CacheService.invalidatePattern('products:list:*');
  }
}
