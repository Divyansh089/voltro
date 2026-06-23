import { Router } from 'express';
import { OrdersController } from '../orders.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from '../orders.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

// ── Customer Routes ──────────────────────────────────────

router.get(
  '/me',
  validate(orderQuerySchema, 'query'),
  asyncHandler(OrdersController.findMyOrders)
);

router.get(
  '/me/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(OrdersController.findMyOrderById)
);

router.post(
  '/',
  validate(createOrderSchema, 'body'),
  asyncHandler(OrdersController.create)
);

router.post(
  '/me/:id/cancel',
  validate(idParamSchema, 'params'),
  asyncHandler(OrdersController.cancelMyOrder)
);

// ── Admin Routes ─────────────────────────────────────────

router.get(
  '/',
  permission('order:read'),
  validate(orderQuerySchema, 'query'),
  asyncHandler(OrdersController.adminFindAll)
);

router.get(
  '/:id',
  permission('order:read'),
  validate(idParamSchema, 'params'),
  asyncHandler(OrdersController.adminFindById)
);

router.patch(
  '/:id/status',
  permission('order:update'),
  validate(idParamSchema, 'params'),
  validate(updateOrderStatusSchema, 'body'),
  asyncHandler(OrdersController.updateStatus)
);

export default router;
