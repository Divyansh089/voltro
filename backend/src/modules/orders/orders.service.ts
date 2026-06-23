  import prisma from '../../prisma/prismaClient';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { CartService } from '../cart/cart.service';
import { CouponsService } from '../coupons/coupons.service';
import { AuditAction } from '../../common/enums';
import type { Prisma } from '@prisma/client';

// Simple util for order numbers
const generateOrderNumber = () => {
  const prefix = 'VLTR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export class OrdersService {
  /**
   * Find orders (Admin or Customer based on userId param)
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, userId, status, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { email: true, customerProfile: { select: { firstName: true, lastName: true } } } },
          payment: { select: { status: true, method: true } },
          _count: { select: { orderItems: true } },
        },
      }),
    ]);

    return { total, orders };
  }

  /**
   * Find order details by ID
   */
  static async findById(id: string, userId?: string, isAdmin = false) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        shippingAddress: true,
        payment: true,
        coupon: true,
        user: { select: { id: true, email: true, customerProfile: { select: { firstName: true, lastName: true, phone: true } } } }
      }
    });

    if (!order) throw new NotFoundError('Order', id);
    if (!isAdmin && order.userId !== userId) throw new NotFoundError('Order', id); // Hide if not owned by user

    return order;
  }

  /**
   * Create order from user's cart
   */
  static async createFromCart(userId: string, data: { shippingAddressId: string; couponCode?: string; notes?: string }, ipAddress?: string, userAgent?: string) {
    // 1. Get cart
    const cart = await CartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // 2. Validate all items are in stock
    const outOfStockItems = cart.items.filter((item: any)   => !item.inStock);
    if (outOfStockItems.length > 0) {
      throw new BadRequestError(`Some items are out of stock: ${outOfStockItems.map((i: any) => i.variant.name).join(', ')}`);
    }

    // 3. Validate shipping address
    const address = await prisma.address.findUnique({ where: { id: data.shippingAddressId } });
    if (!address || address.userId !== userId) {
      throw new BadRequestError('Invalid shipping address');
    }

    // 4. Calculate pricing
    let subtotal = cart.subtotal;
    let shippingCost = subtotal > 5000 ? 0 : 150; // Example: Free shipping over 5000 INR
    let tax = subtotal * 0.18; // Example: 18% GST
    
    let discount = 0;
    let couponId = null;

    // 5. Apply coupon if provided
    if (data.couponCode) {
      const couponValid = await CouponsService.validateCoupon(data.couponCode, userId, subtotal);
      discount = couponValid.discountAmount;
      couponId = couponValid.id;
    }

    const total = subtotal + shippingCost + tax - discount;

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx : any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          subtotal,
          tax,
          shippingCost,
          discount,
          total,
          shippingAddressId: data.shippingAddressId,
          couponId,
          notes: data.notes,
          orderItems: {
            create: cart.items.map((item: any) => ({
              variantId: item.variantId,
              productName: item.product.name,
              variantName: item.variant.name,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.total,
            }))
          },
          // Create a pending payment record
          payment: {
            create: {
              amount: total,
              currency: 'INR',
              status: 'PENDING',
            }
          }
        },
        include: { payment: true }
      });

      // Deduct inventory
      for (const item of cart.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            quantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity }, // Moved to reserved until shipped/delivered
          }
        });
      }

      // If coupon used, increment usage count
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { userId } });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'ORDER_CREATED',
          resource: 'order',
          resourceId: newOrder.id,
          ipAddress,
          userAgent,
        }
      });

      return newOrder;
    });

    return order;
  }

  /**
   * Update order status (Admin)
   */
  static async updateStatus(id: string, status: string, cancellationReason?: string, adminUserId?: string, ipAddress?: string, userAgent?: string) {
    const order = await prisma.order.findUnique({ 
      where: { id },
      include: { orderItems: true }
    });
    
    if (!order) throw new NotFoundError('Order', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      const data: any = { status };
      
      if (status === 'CANCELLED') {
        data.cancelledAt = new Date();
        data.cancellationReason = cancellationReason;
        
        // Return inventory
        for (const item of order.orderItems) {
          await tx.inventory.update({
            where: { variantId: item.variantId },
            data: {
              quantity: { increment: item.quantity },
              reservedQuantity: { decrement: item.quantity },
            }
          });
        }
      }

      if (status === 'SHIPPED' || status === 'DELIVERED') {
        // If it was reserved, we might want to release the reservation on shipment
        if (order.status === 'PROCESSING' || order.status === 'PENDING') {
          for (const item of order.orderItems) {
             await tx.inventory.update({
              where: { variantId: item.variantId },
              data: {
                reservedQuantity: { decrement: item.quantity },
              }
            });
          }
        }
      }

      const result = await tx.order.update({
        where: { id },
        data,
      });

      if (adminUserId) {
        await tx.auditLog.create({
          data: {
            userId: adminUserId,
            action: 'ORDER_STATUS_UPDATED',
            resource: 'order',
            resourceId: id,
            oldValues: { status: order.status },
            newValues: { status },
            ipAddress,
            userAgent,
          }
        });
      }

      return result;
    });

    return updated;
  }
}
