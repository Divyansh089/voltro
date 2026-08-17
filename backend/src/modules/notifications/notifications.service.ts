import prisma from '../../prisma/prismaClient';
import { NotFoundError } from '../../common/errors';

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
   * Internal service to create a notification for a single user
   */
  static async create(data: { userId: string; type: string; title: string; message: string; data?: any }) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
      },
    });
  }

  /**
   * Broadcast notification to ALL active users (customers & staff)
   */
  static async broadcastToAll(data: { type: string; title: string; message: string; data?: any }) {
    const users = await prisma.user.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true },
    });

    if (users.length === 0) return;

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
      })),
    });
  }

  /**
   * Broadcast notification to users with specific roles (e.g. ['ADMIN', 'CUSTOMER_SUPPORT', 'PRODUCT_MANAGER'])
   */
  static async broadcastToRoles(roles: string[], data: { type: string; title: string; message: string; data?: any }) {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        role: { name: { in: roles } },
      },
      select: { id: true },
    });

    if (users.length === 0) return;

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
      })),
    });
  }

  /**
   * Staff Custom Notification Creation
   */
  static async createCustomNotification(data: {
    targetType: 'ALL' | 'USER' | 'ROLE';
    targetId?: string; // userId or roleName
    type: 'SUCCESS' | 'CANCEL' | 'GENERAL' | 'MAINTENANCE';
    title: string;
    message: string;
    metadata?: any;
  }) {
    if (data.targetType === 'ALL') {
      await this.broadcastToAll({
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.metadata,
      });
    } else if (data.targetType === 'USER' && data.targetId) {
      await this.create({
        userId: data.targetId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.metadata,
      });
    } else if (data.targetType === 'ROLE' && data.targetId) {
      await this.broadcastToRoles([data.targetId], {
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.metadata,
      });
    }
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
      },
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
      },
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
