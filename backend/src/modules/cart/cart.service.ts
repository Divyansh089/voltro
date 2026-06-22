import prisma from '../../prisma/prismaClient';
import { NotFoundError, BadRequestError } from '../../common/errors';

export class CartService {
  /**
   * Get all cart items for a user
   */
  static async getCart(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
            },
            inventory: { select: { quantity: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    let subtotal = 0;
    const items = cartItems.map((item : any) => {
      // Determine the effective price (variant price if set, else product base price)
      const price = Number(item.variant.price || item.variant.product.basePrice);
      const total = price * item.quantity;
      subtotal += total;

      return {
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price,
        total,
        inStock: (item.variant.inventory?.quantity || 0) >= item.quantity,
        stockAvailable: item.variant.inventory?.quantity || 0,
        variant: {
          id: item.variant.id,
          sku: item.variant.sku,
          name: item.variant.name,
          color: item.variant.color,
          storage: item.variant.storage,
          size: item.variant.size,
        },
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          image: item.variant.product.images[0]?.url || null,
        },
      };
    });

    return {
      items,
      subtotal,
      totalItems: items.reduce((acc : any , curr : any) => acc + curr.quantity, 0),
    };
  }

  /**
   * Add item to cart
   */
  static async addItem(userId: string, data: { variantId: string; quantity: number }) {
    // 1. Verify variant exists and is active
    const variant = await prisma.variant.findUnique({
      where: { id: data.variantId },
      include: { product: true, inventory: true },
    });

    if (!variant || !variant.isActive || !variant.product.status) {
      throw new NotFoundError('Product Variant', data.variantId);
    }

    // 2. Check stock
    const currentStock = variant.inventory?.quantity || 0;
    if (currentStock < data.quantity) {
      throw new BadRequestError(`Not enough stock. Only ${currentStock} available.`);
    }

    // 3. Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_variantId: { userId, variantId: data.variantId },
      },
      update: {
        quantity: { increment: data.quantity }, // Add to existing quantity
      },
      create: {
        userId,
        variantId: data.variantId,
        quantity: data.quantity,
      },
    });

    // 4. Double check total quantity doesn't exceed stock
    if (cartItem.quantity > currentStock) {
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: currentStock },
      });
      throw new BadRequestError(`Adjusted to maximum available stock (${currentStock}).`);
    }

    return this.getCart(userId);
  }

  /**
   * Update cart item quantity
   */
  static async updateItem(userId: string, itemId: string, quantity: number) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: { include: { inventory: true } } },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundError('Cart Item', itemId);
    }

    const currentStock = cartItem.variant.inventory?.quantity || 0;
    if (currentStock < quantity) {
      throw new BadRequestError(`Not enough stock. Only ${currentStock} available.`);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: string, itemId: string) {
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundError('Cart Item', itemId);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  /**
   * Clear entire cart
   */
  static async clearCart(userId: string) {
    await prisma.cartItem.deleteMany({ where: { userId } });
    return { items: [], subtotal: 0, totalItems: 0 };
  }
}
