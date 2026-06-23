import { Router } from 'express';
import { NotificationsController } from '../notifications.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { notificationQuerySchema, markAsReadSchema } from '../notifications.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get(
  '/me',
  validate(notificationQuerySchema, 'query'),
  asyncHandler(NotificationsController.findMyNotifications)
);

router.post(
  '/me/read',
  validate(markAsReadSchema, 'body'),
  asyncHandler(NotificationsController.markAsRead)
);

router.post(
  '/me/read-all',
  asyncHandler(NotificationsController.markAllAsRead)
);

router.delete(
  '/me/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(NotificationsController.delete)
);

export default router;
