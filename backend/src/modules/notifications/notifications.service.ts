import prisma from '../../prisma/prismaClient';
import { NotFoundError } from '../../common/errors';
import type { Prisma } from '@prisma/client';

export class NotificationsService {
  /**
   * Find user notifications
   */
  static async findAll(params: {
    userId: string;
    page: number;
    limit: number;
    isRead?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { userId, page, limit, isRead, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...(isRead !== undefined && { isRead }),
    };

    const [total, notifications] = await prisma.$transaction([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return { total, notifications };
  }

  /**
   * Internal service to create a notification
   */
  static async create(data: { userId: string; type: string; title: string; message: string; data?: any }) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
      }
    });
  }

  /**
   * Mark as read
   */
  static async markAsRead(userId: string, notificationIds: string[]) {
    await prisma.notification.updateMany({
      where: {
        userId,
        id: { in: notificationIds },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      }
    });
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      }
    });
  }

  /**
   * Delete notification
   */
  static async delete(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) throw new NotFoundError('Notification', id);

    await prisma.notification.delete({ where: { id } });
  }
}
