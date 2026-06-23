import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { slugify, generateUniqueSlug } from '../../common/helpers';
import { AuditAction, ProductStatus } from '../../common/enums';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import { TTL } from '../../cache/ttl';
import { UploadService, CloudinaryService } from '../../storage';
import { CLOUDINARY_FOLDERS } from '../../config/cloudinary';
import type { Prisma } from '@prisma/client';
import { createModuleLogger } from '../../config/logger';

const log = createModuleLogger('ProductsService');

export class ProductsService {
  /**
   * Find a product by ID or Slug with all relations (variants, images, specs)
   */
  static async findByIdOrSlug(idOrSlug: string, isPublic = true) {
    const cacheKey = CacheKeys.productDetail(idOrSlug);
    
    // Only use cache for public requests to ensure admin always gets latest
    if (isPublic) {
      const cached = await CacheService.get<any>(cacheKey);
      if (cached) return cached;
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...(isPublic && { status: ProductStatus.ACTIVE }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: isPublic ? { isActive: true } : undefined,
          include: { inventory: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product', idOrSlug);
    }

    if (isPublic) {
      await CacheService.set(cacheKey, product, TTL.PRODUCT_DETAIL);
    }

    return product;
  }

  /**
   * List all products with filtering
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    brand?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    hasStock?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    isPublic?: boolean;
  }) {
    const { page, limit, search, categoryId, brand, status, minPrice, maxPrice, hasStock, sortBy, sortOrder, isPublic = true } = params;
    
    // For public requests, we can cache the list based on query params hash
    // However, to keep it simple, we'll only cache the exact 'featured' list for now.
    
    const skip = (page - 1) * limit;

    const where: any = {
      ...(isPublic ? { status: ProductStatus.ACTIVE } : (status && { status })),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(brand && { brand }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        basePrice: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        }
      }),
      ...(hasStock && {
        variants: {
          some: {
            inventory: {
              quantity: { gt: 0 }
            }
          }
        }
      }),
    };

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 }, // Only get primary image for listing
          variants: { 
            where: isPublic ? { isActive: true } : undefined,
            include: { inventory: { select: { quantity: true } } }
          },
        },
      }),
    ]);

    return { total, products };
  }

  /**
   * Create a new product
   */
  static async create(
    data: {
      name: string;
      description: string;
      basePrice: number;
      categoryId: string;
      brand?: string;
      status?: ProductStatus;
      specifications?: any[];
    },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Validate category exists
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new NotFoundError('Category', data.categoryId);

    const baseSlug = slugify(data.name);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const exists = await prisma.product.findUnique({ where: { slug: s } });
      return !!exists;
    });

    const product = await prisma.$transaction(async (tx: any) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          basePrice: data.basePrice,
          categoryId: data.categoryId,
          brand: data.brand || 'Voltra',
          status: data.status || ProductStatus.DRAFT,
          ...(data.specifications && {
            specifications: {
              create: data.specifications.map((spec) => ({
                key: spec.key,
                value: spec.value,
                group: spec.group,
                sortOrder: spec.sortOrder,
              }))
            }
          })
        },
        include: {
          specifications: true
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.PRODUCT_CREATED,
          resource: 'product',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return created;
    });

    return product;
  }

  /**
   * Update a product
   */
  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      basePrice?: number;
      categoryId?: string;
      brand?: string;
      status?: ProductStatus;
      specifications?: any[];
    },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError('Product', id);

    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new NotFoundError('Category', data.categoryId);
    }

    let slug = product.slug;
    if (data.name && data.name !== product.name) {
      const baseSlug = slugify(data.name);
      slug = await generateUniqueSlug(baseSlug, async (s) => {
        const exists = await prisma.product.findFirst({ where: { slug: s, id: { not: id } } });
        return !!exists;
      });
    }

    const updatedProduct = await prisma.$transaction(async (tx: any) => {
      // If updating specs, we replace all of them
      if (data.specifications) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name, slug }),
          ...(data.description && { description: data.description }),
          ...(data.basePrice && { basePrice: data.basePrice }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.brand && { brand: data.brand }),
          ...(data.status && { status: data.status }),
          ...(data.specifications && {
            specifications: {
              create: data.specifications.map((spec) => ({
                key: spec.key,
                value: spec.value,
                group: spec.group,
                sortOrder: spec.sortOrder,
              }))
            }
          })
        },
        include: {
          specifications: true
        }
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.PRODUCT_UPDATED,
          resource: 'product',
          resourceId: id,
          oldValues: { 
            name: product.name, 
            status: product.status, 
            categoryId: product.categoryId,
            basePrice: product.basePrice 
          },
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      return updated;
    });

    // Invalidate product cache
    await CacheService.del(CacheKeys.productDetail(product.id));
    await CacheService.del(CacheKeys.productDetail(product.slug));
    if (slug !== product.slug) {
      await CacheService.del(CacheKeys.productDetail(slug));
    }
    await CacheService.invalidatePattern('products:list:*');

    return updatedProduct;
  }

  /**
   * Delete a product
   */
  static async delete(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError('Product', id);

    await prisma.$transaction(async (tx: any) => {
      // Prisma soft delete middleware will handle this
      await tx.product.delete({ where: { id } });
      
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.PRODUCT_DELETED,
          resource: 'product',
          resourceId: id,
          ipAddress,
          userAgent,
        },
      });
    });

    // Invalidate caches
    await CacheService.del(CacheKeys.productDetail(product.id));
    await CacheService.del(CacheKeys.productDetail(product.slug));
    await CacheService.invalidatePattern('products:list:*');
  }

  // ── Images ──────────────────────────────────────────────────

  /**
   * Add image to product
   */
  static async addImage(
    productId: string, 
    file: Express.Multer.File, 
    data: { altText?: string; sortOrder?: number; isPrimary?: boolean }
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('Product', productId);

    // Max 10 images check
    const currentImagesCount = await prisma.productImage.count({ where: { productId } });
    if (currentImagesCount >= 10) {
      throw new BadRequestError('Maximum of 10 images allowed per product');
    }

    // Upload to Cloudinary
    const { url, publicId } = await UploadService.uploadFile(file, CLOUDINARY_FOLDERS.PRODUCTS);

    const image = await prisma.$transaction(async (tx: any) => {
      // If setting as primary, unset other primary images
      if (data.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      
      // If it's the first image, make it primary automatically
      const isPrimary = data.isPrimary || currentImagesCount === 0;

      return await tx.productImage.create({
        data: {
          productId,
          url,
          altText: data.altText,
          sortOrder: data.sortOrder || currentImagesCount,
          isPrimary,
        }
      });
    });

    // Invalidate product cache
    await CacheService.del(CacheKeys.productDetail(product.id));
    await CacheService.del(CacheKeys.productDetail(product.slug));

    return image;
  }

  /**
   * Update image details (like making it primary)
   */
  static async updateImage(imageId: string, data: { altText?: string; sortOrder?: number; isPrimary?: boolean }) {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundError('Product Image', imageId);

    const updatedImage = await prisma.$transaction(async (tx: any) => {
      if (data.isPrimary && !image.isPrimary) {
        // Unset other primaries for this product
        await tx.productImage.updateMany({
          where: { productId: image.productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return await tx.productImage.update({
        where: { id: imageId },
        data,
      });
    });

    // Invalidate product cache
    const product = await prisma.product.findUnique({ where: { id: image.productId } });
    if (product) {
      await CacheService.del(CacheKeys.productDetail(product.id));
      await CacheService.del(CacheKeys.productDetail(product.slug));
    }

    return updatedImage;
  }

  /**
   * Delete an image
   */
  static async deleteImage(imageId: string) {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundError('Product Image', imageId);

    // Delete from DB first
    await prisma.productImage.delete({ where: { id: imageId } });

    // Invalidate product cache
    const product = await prisma.product.findUnique({ where: { id: image.productId } });
    if (product) {
      await CacheService.del(CacheKeys.productDetail(product.id));
      await CacheService.del(CacheKeys.productDetail(product.slug));
      
      // If we deleted the primary image, promote another one
      if (image.isPrimary) {
        const nextImage = await prisma.productImage.findFirst({
          where: { productId: image.productId },
          orderBy: { sortOrder: 'asc' },
        });
        
        if (nextImage) {
          await prisma.productImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true }
          });
        }
      }
    }

    // Try to delete from Cloudinary asynchronously (fire and forget)
    // Extract publicId from URL (this is a simple extraction, robust implementations use regex)
    try {
      const urlParts = image.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = `${CLOUDINARY_FOLDERS.PRODUCTS}/${filename.split('.')[0]}`;
      UploadService.deleteFile(publicId).catch((err) => {
        log.error({ publicId, err }, 'Failed to delete image from Cloudinary during cleanup');
      });
    } catch (e) {
      log.error({ error: e }, 'Failed to parse Cloudinary URL for deletion');
    }
  }
}
