import { Router } from 'express';
import { ReviewsController } from '../reviews.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { createReviewSchema, updateReviewSchema, reviewQuerySchema, adminReviewQuerySchema } from '../reviews.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { z } from 'zod';

const router = Router();

// ── Public Routes ────────────────────────────────────────

router.get(
  '/product/:productId',
  validate(z.object({ productId: idParamSchema.shape.id }), 'params'),
  validate(reviewQuerySchema, 'query'),
  asyncHandler(ReviewsController.findProductReviews)
);

// ── Customer Protected Routes ────────────────────────────

router.use(authMiddleware);

router.get(
  '/me',
  validate(reviewQuerySchema, 'query'),
  asyncHandler(ReviewsController.findMyReviews)
);

router.post(
  '/',
  validate(createReviewSchema, 'body'),
  asyncHandler(ReviewsController.create)
);

router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateReviewSchema, 'body'),
  asyncHandler(ReviewsController.update)
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(ReviewsController.delete)
);

// ── Admin Protected Routes ───────────────────────────────

router.get(
  '/',
  permission('product:read'), // Product read permission needed for review moderation view
  validate(adminReviewQuerySchema, 'query'),
  asyncHandler(ReviewsController.adminFindAll)
);

router.patch(
  '/:id/moderate',
  permission('product:update'), // Product update permission needed for review moderation
  validate(idParamSchema, 'params'),
  validate(z.object({ isApproved: z.boolean() }), 'body'),
  asyncHandler(ReviewsController.moderate)
);

router.delete(
  '/:id/admin',
  permission('product:delete'),
  validate(idParamSchema, 'params'),
  asyncHandler(ReviewsController.adminDelete)
);

export default router;
