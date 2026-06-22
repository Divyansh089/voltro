import { Router } from 'express';
import { CategoriesController } from '../categories.controller';
import { validate } from '../../../middleware/validation.middleware';
import { optionalAuthMiddleware, authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { createCategorySchema, updateCategorySchema, categoryListQuerySchema } from '../categories.validator';
import { idParamSchema, idOrSlugParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

// ── Public Routes ────────────────────────────────────────

router.get(
  '/tree',
  optionalAuthMiddleware,
  asyncHandler(CategoriesController.getTree)
);

router.get(
  '/',
  validate(categoryListQuerySchema, 'query'),
  asyncHandler(CategoriesController.findAll)
);

router.get(
  '/:idOrSlug',
  validate(idOrSlugParamSchema, 'params'),
  asyncHandler(CategoriesController.findByIdOrSlug)
);

// ── Admin/Protected Routes ───────────────────────────────

router.use(authMiddleware);

router.post(
  '/',
  permission('product:create'), // Category management falls under product catalog permissions
  validate(createCategorySchema, 'body'),
  asyncHandler(CategoriesController.create)
);

router.patch(
  '/:id',
  permission('product:update'),
  validate(idParamSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  asyncHandler(CategoriesController.update)
);

router.delete(
  '/:id',
  permission('product:delete'),
  validate(idParamSchema, 'params'),
  asyncHandler(CategoriesController.delete)
);

export default router;
