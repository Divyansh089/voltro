import { Router } from 'express';
import { ProductsController } from '../products.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware, optionalAuthMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { uploadSingle } from '../../../middleware/upload.middleware';
import { 
  createProductSchema, 
  updateProductSchema, 
  productListQuerySchema,
  addImageSchema,
  updateImageSchema
} from '../products.validator';
import { idParamSchema, idOrSlugParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { z } from 'zod';

const router = Router();

// ── Public Routes ────────────────────────────────────────

// Optional auth used to determine if requester is Admin (sees drafts) or Public (sees active only)
router.get(
  '/',
  optionalAuthMiddleware,
  validate(productListQuerySchema, 'query'),
  asyncHandler(ProductsController.findAll)
);

router.get(
  '/:idOrSlug',
  optionalAuthMiddleware,
  validate(idOrSlugParamSchema, 'params'),
  asyncHandler(ProductsController.findByIdOrSlug)
);

// ── Admin/Protected Routes ───────────────────────────────

router.use(authMiddleware);

router.post(
  '/',
  permission('product:create'),
  validate(createProductSchema, 'body'),
  asyncHandler(ProductsController.create)
);

router.patch(
  '/:id',
  permission('product:update'),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema, 'body'),
  asyncHandler(ProductsController.update)
);

router.delete(
  '/:id',
  permission('product:delete'),
  validate(idParamSchema, 'params'),
  asyncHandler(ProductsController.delete)
);

// ── Images ───────────────────────────────────────────────

router.post(
  '/:id/images',
  permission('product:update'),
  validate(idParamSchema, 'params'),
  uploadSingle,
  validate(addImageSchema, 'body'),
  asyncHandler(ProductsController.addImage)
);

router.patch(
  '/:id/images/:imageId',
  permission('product:update'),
  validate(z.object({ id: idParamSchema.shape.id, imageId: idParamSchema.shape.id }), 'params'),
  validate(updateImageSchema, 'body'),
  asyncHandler(ProductsController.updateImage)
);

router.delete(
  '/:id/images/:imageId',
  permission('product:update'),
  validate(z.object({ id: idParamSchema.shape.id, imageId: idParamSchema.shape.id }), 'params'),
  asyncHandler(ProductsController.deleteImage)
);

export default router;
