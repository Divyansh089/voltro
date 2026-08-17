import prisma from '../../prisma/prismaClient';
import { NotFoundError } from '../../common/errors';

export class RefundsService {
  /**
   * List all refund requests (Staff/Admin)
   */
  static async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      ...(params.status && { status: params.status }),
      ...(params.search && {
        OR: [
          { reason: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { order: { orderNumber: { contains: params.search, mode: 'insensitive' } } },
          { user: { email: { contains: params.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, refunds] = await prisma.$transaction([
      prisma.refundRequest.count({ where }),
      prisma.refundRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              customerProfile: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
        },
      }),
    ]);

    return { total, refunds, page, limit };
  }

  /**
   * Approve or Reject a refund request (Staff/Admin)
   */
  static async updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    staffUserId: string,
    adminNotes?: string
  ) {
    const refund = await prisma.refundRequest.findUnique({ where: { id } });
    if (!refund) throw new NotFoundError('Refund Request', id);

    const updated = await prisma.$transaction(async (tx: any) => {
      const res = await tx.refundRequest.update({
        where: { id },
        data: {
          status,
          adminNotes,
          processedBy: staffUserId,
          processedAt: new Date(),
        },
      });

      // If approved, update order payment status to REFUNDED
      if (status === 'APPROVED') {
        await tx.payment.updateMany({
          where: { orderId: refund.orderId },
          data: { status: 'REFUNDED' },
        });
      }

      return res;
    });

    // Notify Customer of Refund Status Update
    try {
      const { NotificationsService } = await import('../notifications/notifications.service');
      const isApproved = status === 'APPROVED';
      await NotificationsService.create({
        userId: refund.userId,
        type: isApproved ? 'SUCCESS' : 'CANCEL',
        title: isApproved ? 'Refund Approved' : 'Refund Request Rejected',
        message: isApproved
          ? `Your refund request of $${refund.amount} for Order #${refund.orderId.slice(-6)} was approved.`
          : `Your refund request of $${refund.amount} was rejected. Reason: ${adminNotes || 'Does not meet policy requirements.'}`,
        data: { refundId: refund.id, amount: refund.amount, kind: 'REFUND_PROCESSED' },
      });

      // If approved, schedule a 5-minute (300,000ms) delayed notification simulating refund deposit
      if (isApproved) {
        setTimeout(async () => {
          try {
            await NotificationsService.create({
              userId: refund.userId,
              type: 'SUCCESS',
              title: 'Refund Received!',
              message: `Your refund of $${refund.amount} has been successfully deposited back to your payment account.`,
              data: { refundId: refund.id, amount: refund.amount, kind: 'REFUND_RECEIVED' },
            });
          } catch (e) {
            // ignore
          }
        }, 5 * 60 * 1000);
      }
    } catch (e) {
      // ignore
    }

    return updated;
  }
}
