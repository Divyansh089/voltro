import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError } from '../../common/errors';
import type { Prisma } from '@prisma/client';

export class WishlistService {
  /**
   * Get all wishlist items for a user
   */
  static async findAll(params: {
    userId: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { userId, page, limit, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    const [total, items] = await prisma.$transaction([
      prisma.wishlistItem.count({ where }),
      prisma.wishlistItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              status: true,
              images: { where: { isPrimary: true }, take: 1 },
              _count: { select: { reviews: true } }
            }
          }
        },
      }),
    ]);

    return { total, items };
  }

  /**
   * Add item to wishlist
   */
  static async addItem(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('Product', productId);

    const existingItem = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existingItem) {
      throw new ConflictError('Product is already in your wishlist');
    }

    const item = await prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: { select: { name: true } }
      }
    });

    return item;
  }

  /**
   * Remove item from wishlist
   */
  static async removeItem(userId: string, productId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!item) {
      throw new NotFoundError('Wishlist Item', productId);
    }

    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  /**
   * Clear entire wishlist
   */
  static async clear(userId: string) {
    await prisma.wishlistItem.deleteMany({ where: { userId } });
  }
}
