import { Router } from 'express';
import { CouponsController } from '../coupons.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { createCouponSchema, updateCouponSchema, couponQuerySchema, validateCouponSchema } from '../coupons.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

// ── Customer Endpoint ────────────────────────────────────

router.post(
  '/validate',
  validate(validateCouponSchema, 'body'),
  asyncHandler(CouponsController.validateCoupon)
);

// ── Admin Endpoints ──────────────────────────────────────

router.get(
  '/',
  permission('cms:manage'), // Grouping under CMS/marketing for now
  validate(couponQuerySchema, 'query'),
  asyncHandler(CouponsController.findAll)
);

router.get(
  '/:id',
  permission('cms:manage'),
  validate(idParamSchema, 'params'),
  asyncHandler(CouponsController.findById)
);

router.post(
  '/',
  permission('cms:manage'),
  validate(createCouponSchema, 'body'),
  asyncHandler(CouponsController.create)
);

router.patch(
  '/:id',
  permission('cms:manage'),
  validate(idParamSchema, 'params'),
  validate(updateCouponSchema, 'body'),
  asyncHandler(CouponsController.update)
);

router.delete(
  '/:id',
  permission('cms:manage'),
  validate(idParamSchema, 'params'),
  asyncHandler(CouponsController.delete)
);

export default router;
