import { Router } from 'express';
import { PaymentsController } from '../payments.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { updatePaymentSchema, paymentQuerySchema } from '../payments.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { z } from 'zod';

const router = Router();

// Webhook endpoint (normally unprotected, but secured via signature validation)
// For simplicity in this project, we'll expose it with validation
router.post(
  '/webhook/:orderId',
  validate(z.object({ orderId: idParamSchema.shape.id }), 'params'),
  validate(updatePaymentSchema, 'body'),
  asyncHandler(PaymentsController.updateStatus)
);

// Admin Routes
router.use(authMiddleware);

router.get(
  '/',
  permission('order:read'), // Grouping payments under order read permission
  validate(paymentQuerySchema, 'query'),
  asyncHandler(PaymentsController.findAll)
);

export default router;
