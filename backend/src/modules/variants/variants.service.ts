import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';

export class VariantsService {
  /**
   * List variants (optionally filtered by product)
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
          product: { select: { id: true, name: true, slug: true } },
          optionValues: {
            include: {
              optionValue: {
                include: { option: { select: { name: true } } }
              }
            }
          }
        },
      }),
    ]);

    return { total, variants: variants.map(normalizeVariant) };
  }

  /**
   * Find a single variant by ID
   */
  static async findById(id: string) {
    const variant = await prisma.variant.findUnique({
      where: { id },
      include: {
        inventory: true,
        product: { select: { id: true, name: true, slug: true } },
        optionValues: {
          include: {
            optionValue: {
              include: { option: { select: { name: true } } }
            }
          }
        }
      }
    });
    if (!variant) throw new NotFoundError('Variant', id);
    return normalizeVariant(variant);
  }

  /**
   * Create a new variant
   * - For products WITH variants: requires optionValueIds (one per option dimension)
   * - For products WITHOUT variants: auto-creates a single "Default" variant
   */
  static async create(
    data: {
      productId: string;
      sku: string;
      optionValueIds?: string[];   // For variant-products
      price?: number;              // Optional override; auto-computed if not provided
      isActive?: boolean;
      initialStock?: number;
    },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // 1. Verify product exists and load its category + options
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        category: { select: { hasVariants: true } },
        options: { include: { values: true } },
      }
    });
    if (!product) throw new NotFoundError('Product', data.productId);

    // 2. Verify SKU uniqueness
    const existingSku = await prisma.variant.findUnique({ where: { sku: data.sku } });
    if (existingSku) throw new ConflictError('A variant with this SKU already exists');

    const hasVariants = product.category.hasVariants;

    let finalPrice: number;
    let variantName: string;
    let optionValueIds: string[] = [];

    if (hasVariants) {
      // 3a. Validate optionValueIds provided
      if (!data.optionValueIds || data.optionValueIds.length === 0) {
        throw new BadRequestError('optionValueIds are required for products with variants');
      }

      // 3b. Fetch the option values and validate they belong to this product
      const optionValues = await prisma.productOptionValue.findMany({
        where: { id: { in: data.optionValueIds } },
        include: { option: { select: { id: true, name: true, productId: true } } }
      });

      if (optionValues.length !== data.optionValueIds.length) {
        throw new BadRequestError('One or more optionValueIds are invalid');
      }

      for (const ov of optionValues) {
        if (ov.option.productId !== data.productId) {
          throw new BadRequestError(`Option value "${ov.value}" does not belong to this product`);
        }
      }

      // 3c. Validate one value per option (no duplicates on the same dimension)
      const usedOptionIds = optionValues.map((ov) => ov.optionId);
      if (new Set(usedOptionIds).size !== usedOptionIds.length) {
        throw new BadRequestError('Cannot select multiple values from the same option dimension');
      }

      // 3d. Validate all options of the product are covered
      if (product.options.length > 0 && optionValues.length !== product.options.length) {
        throw new BadRequestError(
          `This product has ${product.options.length} option dimensions but only ${optionValues.length} were provided`
        );
      }

      // 3e. Check this exact combination doesn't already exist
      const existingCombo = await prisma.variant.findFirst({
        where: { productId: data.productId },
        include: { optionValues: true }
      });
      // (We check by matching the sorted set of option value IDs)
      const sortedNew = [...data.optionValueIds].sort().join(',');
      const allExistingVariants = await prisma.variant.findMany({
        where: { productId: data.productId },
        include: { optionValues: true }
      });
      for (const ev of allExistingVariants) {
        const sortedExisting = ev.optionValues.map((v: any) => v.optionValueId).sort().join(',');
        if (sortedExisting === sortedNew) {
          throw new ConflictError('A variant with this exact combination of options already exists');
        }
      }

      // 3f. Compute price and name from option values
      const totalDelta = optionValues.reduce((sum, ov) => sum + Number(ov.priceDelta), 0);
      finalPrice = data.price ?? (Number(product.basePrice) + totalDelta);

      // Sort option values by position for consistent naming
      const sortedByPosition = [...optionValues].sort((a, b) => {
        const posA = product.options.find(o => o.id === a.optionId)?.position ?? 0;
        const posB = product.options.find(o => o.id === b.optionId)?.position ?? 0;
        return posA - posB;
      });
      variantName = sortedByPosition.map((ov) => ov.value).join(' / ');
      optionValueIds = data.optionValueIds;

    } else {
      // For no-variant products: single "Default" variant
      const existingDefault = await prisma.variant.findFirst({ where: { productId: data.productId, isDefault: true } });
      if (existingDefault) {
        throw new ConflictError('This product already has a default variant. Update inventory instead.');
      }
      finalPrice = data.price ?? Number(product.basePrice);
      variantName = 'Default';
    }

    const variant = await prisma.$transaction(async (tx: any) => {
      const created = await tx.variant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          name: variantName,
          price: finalPrice,
          isDefault: !hasVariants,
          isActive: data.isActive ?? true,
          inventory: {
            create: {
              quantity: data.initialStock ?? 0,
              reservedQuantity: 0,
              lowStockThreshold: 10,
            }
          },
          ...(optionValueIds.length > 0 && {
            optionValues: {
              create: optionValueIds.map((optionValueId) => ({ optionValueId }))
            }
          })
        },
        include: {
          inventory: true,
          optionValues: {
            include: { optionValue: { include: { option: { select: { name: true } } } } }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'VARIANT_CREATED',
          resource: 'variant',
          resourceId: created.id,
          newValues: { sku: data.sku, name: variantName, price: finalPrice } as any,
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

    // Notify Customers & Staff
    try {
      const { NotificationsService } = await import('../notifications/notifications.service');
      await NotificationsService.broadcastToAll({
        type: 'GENERAL',
        title: '🎨 New Product Variant Released!',
        message: `New variant '${variant.name}' is now available for ${product.name}. Price: $${variant.price}.`,
        data: { productId: product.id, variantId: variant.id, variantName: variant.name, price: variant.price, kind: 'NEW_VARIANT' },
      });

      await NotificationsService.broadcastToRoles(['ADMIN', 'PRODUCT_MANAGER'], {
        type: 'SUCCESS',
        title: 'New Variant Added',
        message: `Staff (ID: ${adminUserId}) added variant '${variant.name}' to product '${product.name}'.`,
        data: { staffId: adminUserId, productId: product.id, variantId: variant.id, kind: 'STAFF_VARIANT_ADDED' },
      });
    } catch (e) {
      // ignore
    }

    return normalizeVariant(variant);
  }

  /**
   * Update a variant (SKU, active status, price override)
   */
  static async update(
    id: string,
    data: {
      sku?: string;
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
        include: {
          inventory: true,
          optionValues: {
            include: { optionValue: { include: { option: { select: { name: true } } } } }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'VARIANT_UPDATED',
          resource: 'variant',
          resourceId: id,
          oldValues: { sku: variant.sku, price: variant.price, isActive: variant.isActive },
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return result;
    });

    await CacheService.del(CacheKeys.productDetail(variant.product.id));
    await CacheService.del(CacheKeys.productDetail(variant.product.slug));
    await CacheService.invalidatePattern('products:list:*');

    return normalizeVariant(updated);
  }

  /**
   * Delete a variant (blocked if it has order history)
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

    await CacheService.del(CacheKeys.productDetail(variant.product.id));
    await CacheService.del(CacheKeys.productDetail(variant.product.slug));
    await CacheService.invalidatePattern('products:list:*');
  }
}

/**
 * Normalize variant shape — flatten optionValues into a clean array
 */
function normalizeVariant(variant: any) {
  const { optionValues, ...rest } = variant;
  return {
    ...rest,
    options: optionValues?.map((vov: any) => ({
      optionName: vov.optionValue?.option?.name,
      value: vov.optionValue?.value,
      priceDelta: vov.optionValue?.priceDelta,
    })) ?? [],
  };
}
