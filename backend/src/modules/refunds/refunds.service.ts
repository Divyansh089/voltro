import prisma from '../../prisma/prismaClient';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors';
import type { Prisma } from '@prisma/client';

export class RefundsService {
  /**
   * Find refund requests
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
    orderId?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, userId, orderId, status, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(userId && { userId }),
      ...(orderId && { orderId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { reason: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, refunds] = await prisma.$transaction([
      prisma.refundRequest.count({ where }),
      prisma.refundRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { email: true, customerProfile: { select: { firstName: true, lastName: true } } } },
          order: { select: { orderNumber: true, total: true } },
        },
      }),
    ]);

    return { total, refunds };
  }

  static async findById(id: string, userId?: string, isAdmin = false) {
    const refund = await prisma.refundRequest.findUnique({
      where: { id },
      include: {
        order: { select: { orderNumber: true, total: true, status: true } }
      }
    });

    if (!refund) throw new NotFoundError('Refund Request', id);
    if (!isAdmin && refund.userId !== userId) throw new NotFoundError('Refund Request', id);

    return refund;
  }

  static async create(userId: string, data: { orderId: string; reason: string; description?: string; amount: number }, ipAddress?: string, userAgent?: string) {
    // Validate order
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundError('Order', data.orderId);
    if (order.userId !== userId) throw new BadRequestError('Invalid order');

    // Make sure we can't refund more than total
    if (data.amount > Number(order.total)) {
      throw new BadRequestError('Refund amount cannot exceed order total');
    }

    // Check existing refunds for this order
    const existingRefunds = await prisma.refundRequest.findMany({
      where: { orderId: data.orderId, status: { not: 'REJECTED' } }
    });

    const totalRefundedOrPending = existingRefunds.reduce((acc : any, curr : any) => acc + Number(curr.amount), 0);
    if (totalRefundedOrPending + data.amount > Number(order.total)) {
      throw new ConflictError(`Total requested refunds (${totalRefundedOrPending + data.amount}) exceeds order total (${order.total})`);
    }

    const refund = await prisma.$transaction(async (tx: any) => {
      const created = await tx.refundRequest.create({
        data: {
          ...data,
          userId,
          status: 'PENDING',
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'REFUND_REQUESTED',
          resource: 'refund_request',
          resourceId: created.id,
          newValues: data as any,
          ipAddress,
          userAgent,
        }
      });

      return created;
    });

    return refund;
  }

  static async updateStatus(id: string, status: string, adminNotes?: string, adminUserId?: string, ipAddress?: string, userAgent?: string) {
    const refund = await prisma.refundRequest.findUnique({ 
      where: { id },
      include: { order: true } 
    });
    
    if (!refund) throw new NotFoundError('Refund Request', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      const result = await tx.refundRequest.update({
        where: { id },
        data: {
          status,
          adminNotes,
          processedBy: adminUserId,
          processedAt: new Date(),
        }
      });

      // If approved or processed, typically you'd hit the payment gateway API here to issue real refund
      if (status === 'PROCESSED') {
        // Also update payment record if needed
        const payment = await tx.payment.findUnique({ where: { orderId: refund.orderId } });
        if (payment) {
          const newRefundAmount = Number(payment.refundAmount || 0) + Number(refund.amount);
          await tx.payment.update({
            where: { id: payment.id },
            data: { 
              refundAmount: newRefundAmount,
              status: newRefundAmount >= Number(payment.amount) ? 'REFUNDED' : payment.status
            }
          });
        }
      }

      if (adminUserId) {
        await tx.auditLog.create({
          data: {
            userId: adminUserId,
            action: 'REFUND_STATUS_UPDATED',
            resource: 'refund_request',
            resourceId: id,
            oldValues: { status: refund.status },
            newValues: { status, adminNotes },
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
