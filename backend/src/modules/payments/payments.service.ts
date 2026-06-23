import prisma from '../../prisma/prismaClient';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { AuditAction } from '../../common/enums';
import type { Prisma } from '@prisma/client';

export class PaymentsService {
  /**
   * Find payments
   */
  static async findAll(params: {
    page: number;
    limit: number;
    status?: string;
    orderId?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, status, orderId, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(orderId && { orderId }),
    };

    const [total, payments] = await prisma.$transaction([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          order: { select: { orderNumber: true, userId: true } }
        }
      }),
    ]);

    return { total, payments };
  }

  /**
   * Update payment status (e.g. from webhook)
   */
  static async updateStatus(
    orderId: string,
    data: {
      status: string;
      gatewayPaymentId?: string;
      gatewayOrderId?: string;
      method?: string;
      metadata?: any;
    }
  ) {
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundError('Payment for Order', orderId);

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.payment.update({
        where: { orderId },
        data: {
          ...data,
          ...(data.status === 'SUCCESS' && { paidAt: new Date() }),
        },
      });

      // If payment is successful, update order status to PROCESSING
      if (data.status === 'SUCCESS' && payment.status !== 'SUCCESS') {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PROCESSING' }
        });
      }
      
      // If payment failed, update order status to CANCELLED
      if (data.status === 'FAILED' && payment.status !== 'FAILED') {
        const order = await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED', cancellationReason: 'Payment Failed' },
          include: { orderItems: true }
        });

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

      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_UPDATED',
          resource: 'payment',
          resourceId: result.id,
          oldValues: { status: payment.status },
          newValues: data as any,
          // Since this could be a webhook, there might not be a user context
        }
      });

      return result;
    });

    return updated;
  }
}
