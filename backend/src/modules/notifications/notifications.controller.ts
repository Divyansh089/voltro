import type { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums';
import { calculatePagination } from '../../common/helpers';

export class NotificationsController {
  static async findMyNotifications(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    const query = req.query as any;

    const { total, notifications } = await NotificationsService.findAll({
      userId,
      page: query.page,
      limit: query.limit,
      isRead: query.isRead,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    res.status(HttpStatus.OK).json(
      sendSuccess(notifications, 'Notifications retrieved', HttpStatus.OK, calculatePagination(query.page, query.limit, total))
    );
  }

  static async markAsRead(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await NotificationsService.markAsRead(userId, req.body.notificationIds);
    res.status(HttpStatus.OK).json(sendSuccess(null, 'Notifications marked as read'));
  }

  static async markAllAsRead(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await NotificationsService.markAllAsRead(userId);
    res.status(HttpStatus.OK).json(sendSuccess(null, 'All notifications marked as read'));
  }

  static async delete(req: Request, res: Response) {
    const userId = (req as any).user.userId;
    await NotificationsService.delete(req.params.id, userId);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
