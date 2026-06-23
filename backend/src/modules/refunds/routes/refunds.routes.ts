import { Router } from 'express';
import { RefundsController } from '../refunds.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { createRefundRequestSchema, updateRefundRequestSchema, refundQuerySchema } from '../refunds.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

// ── Customer Routes ──────────────────────────────────────

router.get(
  '/me',
  validate(refundQuerySchema, 'query'),
  asyncHandler(RefundsController.findMyRefunds)
);

router.get(
  '/me/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(RefundsController.findMyRefundById)
);

router.post(
  '/',
  validate(createRefundRequestSchema, 'body'),
  asyncHandler(RefundsController.createMyRefund)
);

// ── Admin Routes ─────────────────────────────────────────

router.get(
  '/',
  permission('order:read'),
  validate(refundQuerySchema, 'query'),
  asyncHandler(RefundsController.adminFindAll)
);

router.get(
  '/:id',
  permission('order:read'),
  validate(idParamSchema, 'params'),
  asyncHandler(RefundsController.adminFindById)
);

router.patch(
  '/:id/status',
  permission('order:update'), // Requires ability to update orders/financials
  validate(idParamSchema, 'params'),
  validate(updateRefundRequestSchema, 'body'),
  asyncHandler(RefundsController.updateStatus)
);

export default router;
