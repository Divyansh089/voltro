import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { AuditAction } from '../../common/enums';
import type { Prisma } from '@prisma/client';

export class ReviewsService {
  /**
   * Find reviews (Public/Customer)
   */
  static async findAll(params: {
    page: number;
    limit: number;
    productId?: string;
    userId?: string;
    rating?: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    isApprovedOnly?: boolean;
  }) {
    const { page, limit, productId, userId, rating, sortBy, sortOrder, isApprovedOnly = true } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(productId && { productId }),
      ...(userId && { userId }),
      ...(rating && { rating }),
      ...(isApprovedOnly && { isApproved: true }),
    };

    const [total, reviews] = await prisma.$transaction([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, customerProfile: { select: { firstName: true, lastName: true } }, avatarUrl: true }
          },
          ...(userId && { product: { select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } } })
        },
      }),
    ]);

    return { total, reviews };
  }

  /**
   * Admin find reviews
   */
  static async adminFindAll(params: {
    page: number;
    limit: number;
    search?: string;
    productId?: string;
    userId?: string;
    rating?: number;
    isApproved?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, productId, userId, rating, isApproved, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(productId && { productId }),
      ...(userId && { userId }),
      ...(rating && { rating }),
      ...(isApproved !== undefined && { isApproved }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { comment: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, reviews] = await prisma.$transaction([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { email: true } },
          product: { select: { name: true } }
        },
      }),
    ]);

    return { total, reviews };
  }

  /**
   * Create a review
   */
  static async create(
    userId: string,
    data: { productId: string; rating: number; title?: string; comment?: string },
    ipAddress?: string,
    userAgent?: string
  ) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundError('Product', data.productId);

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId: data.productId } }
    });

    if (existingReview) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Check if user has purchased the product
    const orderWithProduct = await prisma.orderItem.findFirst({
      where: {
        order: { userId, status: 'DELIVERED' },
        variant: { productId: data.productId }
      }
    });

    const isVerifiedPurchase = !!orderWithProduct;

    const review = await prisma.$transaction(async (tx: any) => {
      const created = await tx.review.create({
        data: {
          ...data,
          userId,
          isVerifiedPurchase,
          isApproved: true, // Auto-approve for now, can be changed to false for manual moderation
        }
      });

      // Update product average rating async (fire and forget handled below or in transaction)
      await this.updateProductRating(tx, data.productId);

      await tx.auditLog.create({
        data: {
          userId,
          action: 'REVIEW_CREATED',
          resource: 'review',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });

      return created;
    });

    return review;
  }

  /**
   * Update a review (Customer)
   */
  static async update(
    id: string,
    userId: string,
    data: { rating?: number; title?: string; comment?: string },
    ipAddress?: string,
    userAgent?: string
  ) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundError('Review', id);
    if (review.userId !== userId) throw new BadRequestError('Not authorized to update this review');

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.review.update({
        where: { id },
        data,
      });

      if (data.rating) {
        await this.updateProductRating(tx, review.productId);
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'REVIEW_UPDATED',
          resource: 'review',
          resourceId: id,
          oldValues: { rating: review.rating, title: review.title, comment: review.comment },
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });

      return result;
    });

    return updated;
  }

  /**
   * Delete a review (Customer or Admin)
   */
  static async delete(id: string, userId: string, isAdmin = false, ipAddress?: string, userAgent?: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundError('Review', id);
    if (!isAdmin && review.userId !== userId) throw new BadRequestError('Not authorized to delete this review');

    await prisma.$transaction(async (tx: any) => {
      await tx.review.delete({ where: { id } });
      
      await this.updateProductRating(tx, review.productId);

      await tx.auditLog.create({
        data: {
          userId,
          action: 'REVIEW_DELETED',
          resource: 'review',
          resourceId: id,
          ipAddress,
          userAgent,
        }
      });
    });
  }

  /**
   * Moderate review (Admin)
   */
  static async moderate(id: string, isApproved: boolean, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundError('Review', id);

    await prisma.$transaction(async (tx: any) => {
      await tx.review.update({
        where: { id },
        data: { isApproved }
      });

      await this.updateProductRating(tx, review.productId);

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'REVIEW_MODERATED',
          resource: 'review',
          resourceId: id,
          oldValues: { isApproved: review.isApproved },
          newValues: { isApproved },
          ipAddress,
          userAgent,
        }
      });
    });
  }

  // ── Helper ──────────────────────────────────────────────

  private static async updateProductRating(tx: Prisma.TransactionClient, productId: string) {
    const aggregate = await tx.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        averageRating: aggregate._avg.rating || 0,
        reviewCount: aggregate._count.id,
      }
    });
  }
}
