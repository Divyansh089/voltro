import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';

export class ProductOptionsService {
  /**
   * Get all options (with their values) for a product
   */
  static async findByProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('Product', productId);

    return prisma.productOption.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
      include: { values: { orderBy: { value: 'asc' } } },
    });
  }

  /**
   * Create a new option for a product (e.g. "Color", "RAM")
   */
  static async createOption(productId: string, data: { name: string; position?: number }) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: { select: { hasVariants: true } } }
    });
    if (!product) throw new NotFoundError('Product', productId);
    if (!product.category.hasVariants) {
      throw new BadRequestError('This product category does not support variants/options');
    }

    // Prevent duplicate option names on the same product
    const existing = await prisma.productOption.findFirst({
      where: { productId, name: { equals: data.name, mode: 'insensitive' } }
    });
    if (existing) throw new ConflictError(`An option named "${data.name}" already exists for this product`);

    // Auto-assign position if not provided
    const lastOption = await prisma.productOption.findFirst({
      where: { productId },
      orderBy: { position: 'desc' }
    });
    const position = data.position ?? (lastOption ? lastOption.position + 1 : 0);

    const option = await prisma.productOption.create({
      data: { productId, name: data.name, position },
      include: { values: true },
    });

    await CacheService.del(CacheKeys.productDetail(productId));
    await CacheService.del(CacheKeys.productDetail(product.slug));
    await CacheService.invalidatePattern('products:list:*');

    return option;
  }

  /**
   * Update an option name or position
   */
  static async updateOption(optionId: string, data: { name?: string; position?: number }) {
    const option = await prisma.productOption.findUnique({
      where: { id: optionId },
      include: { product: true }
    });
    if (!option) throw new NotFoundError('ProductOption', optionId);

    if (data.name && data.name !== option.name) {
      const conflict = await prisma.productOption.findFirst({
        where: {
          productId: option.productId,
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: optionId }
        }
      });
      if (conflict) throw new ConflictError(`An option named "${data.name}" already exists for this product`);
    }

    const updated = await prisma.productOption.update({
      where: { id: optionId },
      data,
      include: { values: true },
    });

    await CacheService.del(CacheKeys.productDetail(option.productId));
    await CacheService.del(CacheKeys.productDetail(option.product.slug));
    await CacheService.invalidatePattern('products:list:*');

    return updated;
  }

  /**
   * Delete an option and all its values (blocked if any variant uses values from this option)
   */
  static async deleteOption(optionId: string) {
    const option = await prisma.productOption.findUnique({
      where: { id: optionId },
      include: {
        product: true,
        values: { include: { variantOptions: true } }
      }
    });
    if (!option) throw new NotFoundError('ProductOption', optionId);

    // Check if any variant uses values from this option
    const inUse = option.values.some((v: any) => v.variantOptions.length > 0);
    if (inUse) {
      throw new ConflictError(
        'Cannot delete this option — one or more active variants use its values. Delete those variants first.'
      );
    }

    await prisma.productOption.delete({ where: { id: optionId } });

    await CacheService.del(CacheKeys.productDetail(option.productId));
    await CacheService.del(CacheKeys.productDetail(option.product.slug));
    await CacheService.invalidatePattern('products:list:*');
  }

  // ── Option Values ──────────────────────────────────────────────

  /**
   * Add a value to an option (e.g. "Black" with $0 delta to "Color")
   */
  static async createValue(
    optionId: string,
    data: { value: string; priceDelta?: number }
  ) {
    const option = await prisma.productOption.findUnique({
      where: { id: optionId },
      include: { product: true }
    });
    if (!option) throw new NotFoundError('ProductOption', optionId);

    // Prevent duplicate values within the same option
    const existing = await prisma.productOptionValue.findFirst({
      where: { optionId, value: { equals: data.value, mode: 'insensitive' } }
    });
    if (existing) throw new ConflictError(`Value "${data.value}" already exists for this option`);

    const value = await prisma.productOptionValue.create({
      data: {
        optionId,
        value: data.value,
        priceDelta: data.priceDelta ?? 0,
      },
    });

    await CacheService.del(CacheKeys.productDetail(option.productId));
    await CacheService.del(CacheKeys.productDetail(option.product.slug));
    await CacheService.invalidatePattern('products:list:*');

    return value;
  }

  /**
   * Update a value (e.g. change display name or price delta)
   */
  static async updateValue(
    valueId: string,
    data: { value?: string; priceDelta?: number }
  ) {
    const optionValue = await prisma.productOptionValue.findUnique({
      where: { id: valueId },
      include: { option: { include: { product: true } } }
    });
    if (!optionValue) throw new NotFoundError('ProductOptionValue', valueId);

    if (data.value && data.value !== optionValue.value) {
      const conflict = await prisma.productOptionValue.findFirst({
        where: {
          optionId: optionValue.optionId,
          value: { equals: data.value, mode: 'insensitive' },
          id: { not: valueId }
        }
      });
      if (conflict) throw new ConflictError(`Value "${data.value}" already exists for this option`);
    }

    const updated = await prisma.productOptionValue.update({
      where: { id: valueId },
      data,
    });

    await CacheService.del(CacheKeys.productDetail(optionValue.option.productId));
    await CacheService.del(CacheKeys.productDetail(optionValue.option.product.slug));
    await CacheService.invalidatePattern('products:list:*');

    return updated;
  }

  /**
   * Delete a value (blocked if any variant uses it)
   */
  static async deleteValue(valueId: string) {
    const optionValue = await prisma.productOptionValue.findUnique({
      where: { id: valueId },
      include: {
        option: { include: { product: true } },
        variantOptions: true
      }
    });
    if (!optionValue) throw new NotFoundError('ProductOptionValue', valueId);

    if (optionValue.variantOptions.length > 0) {
      throw new ConflictError(
        'Cannot delete this value — one or more variants use it. Delete those variants first.'
      );
    }

    await prisma.productOptionValue.delete({ where: { id: valueId } });

    await CacheService.del(CacheKeys.productDetail(optionValue.option.productId));
    await CacheService.del(CacheKeys.productDetail(optionValue.option.product.slug));
    await CacheService.invalidatePattern('products:list:*');
  }
}
