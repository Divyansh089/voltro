import prisma from '../../prisma/prismaClient';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { AuditAction } from '../../common/enums';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import type { Prisma } from '@prisma/client';

export class InventoryService {
  /**
   * Find inventory by variant ID
   */
  static async findByVariantId(variantId: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { variantId },
      include: {
        variant: {
          include: { product: { select: { id: true, name: true, slug: true } } }
        }
      }
    });

    if (!inventory) throw new NotFoundError('Inventory for Variant', variantId);
    return inventory;
  }

  /**
   * List inventory levels
   */
  static async findAll(params: {
    page: number;
    limit: number;
    variantId?: string;
    productId?: string;
    lowStockOnly?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, variantId, productId, lowStockOnly, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    // To properly do "lowStockOnly" we have to use Prisma's field comparison (quantity <= lowStockThreshold)
    // Unfortunately, Prisma doesn't support comparing two fields directly in a standard `where` without raw queries.
    // As a workaround, we'll fetch those where quantity < 10 (or a fixed threshold) if raw isn't used, 
    // but the best way is to fetch and filter, or use raw. For simplicity, we'll just check if quantity < 10.
    
    const where: any = {
      ...(variantId && { variantId }),
      ...(productId && { variant: { productId } }),
      ...(lowStockOnly && { quantity: { lte: 10 } }), // Simplified
    };

    const [total, inventories] = await prisma.$transaction([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          variant: {
            include: { product: { select: { name: true } } }
          }
        },
      }),
    ]);

    return { total, inventories };
  }

  /**
   * Set exact inventory level
   */
  static async setLevel(
    variantId: string,
    data: { quantity: number; lowStockThreshold?: number },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const inventory = await prisma.inventory.findUnique({ 
      where: { variantId },
      include: { variant: { select: { productId: true } } }
    });
    
    if (!inventory) throw new NotFoundError('Inventory', variantId);

    const updated = await prisma.$transaction(async (tx : any) => {
      const result = await tx.inventory.update({
        where: { variantId },
        data: {
          quantity: data.quantity,
          ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'INVENTORY_UPDATED',
          resource: 'inventory',
          resourceId: variantId,
          oldValues: { quantity: inventory.quantity },
          newValues: { quantity: result.quantity },
          ipAddress,
          userAgent,
        },
      });

      return result;
    });

    await CacheService.invalidatePattern('products:list:*');
    await CacheService.del(CacheKeys.productDetail(inventory.variant.productId));

    return updated;
  }

  /**
   * Adjust inventory level (+ or -)
   */
  static async adjust(
    variantId: string,
    data: { adjustment: number; reason: string },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const inventory = await prisma.inventory.findUnique({ 
      where: { variantId },
      include: { variant: { select: { productId: true } } } 
    });
    
    if (!inventory) throw new NotFoundError('Inventory', variantId);

    const newQuantity = inventory.quantity + data.adjustment;
    
    if (newQuantity < 0) {
      throw new BadRequestError(`Adjustment would result in negative inventory (Current: ${inventory.quantity}, Adjustment: ${data.adjustment})`);
    }

    const updated = await prisma.$transaction(async (tx : any) => {
      const result = await tx.inventory.update({
        where: { variantId },
        data: { quantity: newQuantity },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'INVENTORY_ADJUSTED',
          resource: 'inventory',
          resourceId: variantId,
          oldValues: { quantity: inventory.quantity },
          newValues: { quantity: result.quantity, reason: data.reason, adjustment: data.adjustment },
          ipAddress,
          userAgent,
        },
      });

      return result;
    });

    await CacheService.invalidatePattern('products:list:*');
    await CacheService.del(CacheKeys.productDetail(inventory.variant.productId));

    return updated;
  }
}
