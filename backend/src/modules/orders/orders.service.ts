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
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    const { search, userId, status } = params;
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
          user: { select: { email: true, customerProfile: { select: { firstName: true, lastName: true, phone: true } } } },
          payment: { select: { status: true, method: true, amount: true } },
          shippingAddress: true,
          orderItems: true,
          refundRequests: true,
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
        refundRequests: true,
        user: { select: { id: true, email: true, customerProfile: { select: { firstName: true, lastName: true, phone: true } } } }
      }
    });

    if (!order) throw new NotFoundError('Order', id);
    if (!isAdmin && order.userId !== userId) throw new NotFoundError('Order', id); // Hide if not owned by user

    return order;
  }

  /**
   * Create order from user's cart or checkout payload
   */
  static async createFromCart(
    userId: string,
    data: {
      shippingAddressId?: string;
      couponCode?: string;
      notes?: string;
      items?: Array<{ variantId?: string; productName?: string; variantName?: string; quantity: number; unitPrice?: number }>;
    },
    ipAddress?: string,
    userAgent?: string
  ) {
    let orderItemsData: any[] = [];
    let subtotal = 0;

    const fallbackVariant = await prisma.variant.findFirst();

    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        let variant: any = null;
        if (item.variantId) {
          variant = await prisma.variant.findFirst({
            where: {
              OR: [{ id: item.variantId }, { productId: item.variantId }],
            },
            include: { product: true },
          });
        }
        if (!variant) {
          variant = fallbackVariant;
        }

        const unitPrice = item.unitPrice ?? (variant ? Number(variant.price) : 99.99);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;
        orderItemsData.push({
          variantId: variant ? variant.id : fallbackVariant?.id,
          productName: item.productName || (variant?.product ? variant.product.name : "Voltra Product"),
          variantName: item.variantName || (variant ? variant.name : "Standard"),
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });
      }
    } else {
      const cart = await CartService.getCart(userId);
      if (cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
      }
      subtotal = cart.subtotal;
      orderItemsData = cart.items.map((item: any) => ({
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.total,
      }));
    }

    if (orderItemsData.length === 0) {
      throw new BadRequestError('No valid items for checkout');
    }

    let shippingAddressId = data.shippingAddressId;
    if (shippingAddressId) {
      const exists = await prisma.address.findUnique({ where: { id: shippingAddressId } });
      if (!exists) shippingAddressId = undefined;
    }

    if (!shippingAddressId) {
      const userAddr = await prisma.address.findFirst({
        where: { userId },
        orderBy: { isDefault: 'desc' },
      });
      if (userAddr) {
        shippingAddressId = userAddr.id;
      } else {
        const defaultAddr = await prisma.address.create({
          data: {
            userId,
            fullName: 'Valued Customer',
            phone: '+1 (555) 019-2831',
            addressLine1: '100 Voltra Way',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            country: 'US',
            isDefault: true,
          },
        });
        shippingAddressId = defaultAddr.id;
      }
    }

    let shippingCost = 0;
    let tax = Math.round(subtotal * 0.08 * 100) / 100;
    let discount = 0;
    let couponId = null;

    if (data.couponCode) {
      try {
        const couponValid = await CouponsService.validateCoupon(data.couponCode, userId, subtotal);
        discount = couponValid.discountAmount;
        couponId = couponValid.id;
      } catch (err) {
        // ignore coupon error if invalid
      }
    }

    const total = subtotal + shippingCost + tax - discount;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PROCESSING',
          subtotal,
          tax,
          shippingCost,
          discount,
          total,
          shippingAddressId: shippingAddressId!,
          couponId,
          notes: data.notes,
          orderItems: {
            create: orderItemsData,
          },
          payment: {
            create: {
              amount: total,
              currency: 'USD',
              status: 'COMPLETED',
              method: 'CREDIT_CARD',
            },
          },
        },
        include: { payment: true, orderItems: true, shippingAddress: true },
      });

      for (const item of orderItemsData) {
        if (item.variantId) {
          try {
            await tx.inventory.update({
              where: { variantId: item.variantId },
              data: {
                quantity: { decrement: item.quantity },
              },
            });
          } catch (e) {
            // ignore if inventory record missing
          }
        }
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    // Notify Customer of Order Placement
    try {
      const { NotificationsService } = await import('../notifications/notifications.service');
      const orderTotal = Number(order.total ?? (order as any).totalAmount ?? 0).toFixed(2);
      await NotificationsService.create({
        userId,
        type: 'SUCCESS',
        title: 'Order Placed Successfully!',
        message: `Order #${order.orderNumber} has been placed. Total: $${orderTotal}. Thank you for shopping with Voltra!`,
        data: { orderId: order.id, orderNumber: order.orderNumber, total: orderTotal, kind: 'ORDER_PLACED' },
      });

      // Check for Low Stock Warning (< 5 units) to notify Admin & PM
      for (const item of order.orderItems) {
        if (item.variantId) {
          const inv = await prisma.inventory.findFirst({ where: { variantId: item.variantId } });
          if (inv && inv.quantity < 5) {
            await NotificationsService.broadcastToRoles(['ADMIN', 'PRODUCT_MANAGER'], {
              type: 'MAINTENANCE',
              title: 'Low Stock Alert!',
              message: `Stock for item '${item.productName} - ${item.variantName}' (Product ID: ${item.variantId}) is low (${inv.quantity} left).`,
              data: { variantId: item.variantId, currentStock: inv.quantity, kind: 'LOW_STOCK' },
            });
          }
        }
      }
    } catch (err) {
      // Ignore notification errors to avoid failing order checkout
    }

    return order;
  }

  /**
   * Update order status (Admin)
   */
  static async updateStatus(
    id: string,
    status: string,
    cancellationReason?: string,
    adminUserId?: string,
    ipAddress?: string,
    userAgent?: string,
    description?: string
  ) {
    const order = await prisma.order.findUnique({ 
      where: { id },
      include: { orderItems: true }
    });
    
    if (!order) throw new NotFoundError('Order', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      const data: any = { status };
      
      if (status === 'CANCELLED') {
        data.cancelledAt = new Date();
        data.cancellationReason = cancellationReason || 'Cancelled by customer';
        
        // Create automated Refund Request entry in table refund_requests
        const existingRefund = await tx.refundRequest.findFirst({ where: { orderId: id } });
        if (!existingRefund) {
          await tx.refundRequest.create({
            data: {
              orderId: id,
              userId: order.userId,
              amount: order.total,
              reason: cancellationReason || 'Customer requested cancellation',
              description: description || 'Automated refund request initiated upon order cancellation',
              status: 'PENDING',
            },
          });
        }

        // Return inventory
        for (const item of order.orderItems) {
          if (item.variantId) {
            try {
              await tx.inventory.update({
                where: { variantId: item.variantId },
                data: {
                  quantity: { increment: item.quantity },
                },
              });
            } catch (e) {
              // ignore if missing
            }
          }
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
