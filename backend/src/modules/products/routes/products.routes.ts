import { Router } from 'express';
import { ProductsController } from '../products.controller';
import { ProductOptionsController } from '../product-options.controller';
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

// ── Product Options (variant dimensions) ─────────────────

// GET    /products/:productId/options           → list options + values
// POST   /products/:productId/options           → create option
// PATCH  /products/:productId/options/:optionId → rename option
// DELETE /products/:productId/options/:optionId → delete option

router.get(
  '/:productId/options',
  asyncHandler(ProductOptionsController.getOptions)
);

router.post(
  '/:productId/options',
  permission('product:update'),
  asyncHandler(ProductOptionsController.createOption)
);

router.patch(
  '/:productId/options/:optionId',
  permission('product:update'),
  asyncHandler(ProductOptionsController.updateOption)
);

router.delete(
  '/:productId/options/:optionId',
  permission('product:update'),
  asyncHandler(ProductOptionsController.deleteOption)
);

// ── Option Values ─────────────────────────────────────────

// POST   /products/:productId/options/:optionId/values            → add value
// PATCH  /products/:productId/options/:optionId/values/:valueId   → update value
// DELETE /products/:productId/options/:optionId/values/:valueId   → delete value

router.post(
  '/:productId/options/:optionId/values',
  permission('product:update'),
  asyncHandler(ProductOptionsController.createValue)
);

router.patch(
  '/:productId/options/:optionId/values/:valueId',
  permission('product:update'),
  asyncHandler(ProductOptionsController.updateValue)
);

router.delete(
  '/:productId/options/:optionId/values/:valueId',
  permission('product:update'),
  asyncHandler(ProductOptionsController.deleteValue)
);

export default router;
