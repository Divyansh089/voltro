import { Router } from 'express';
import { RefundsController } from '../refunds.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  permission('order:read'),
  asyncHandler(RefundsController.findAll)
);

router.patch(
  '/:id/status',
  permission('order:update'),
  asyncHandler(RefundsController.updateStatus)
);

export default router;
