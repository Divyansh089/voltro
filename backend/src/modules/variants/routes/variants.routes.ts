import { Router } from 'express';
import { VariantsController } from '../variants.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { createVariantSchema, updateVariantSchema, variantListQuerySchema } from '../variants.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

// Only Admins/Managers can manage variants directly
router.use(authMiddleware);

router.get(
  '/',
  permission('product:read'),
  validate(variantListQuerySchema, 'query'),
  asyncHandler(VariantsController.findAll)
);

router.get(
  '/:id',
  permission('product:read'),
  validate(idParamSchema, 'params'),
  asyncHandler(VariantsController.findById)
);

router.post(
  '/',
  permission('product:create'),
  validate(createVariantSchema, 'body'),
  asyncHandler(VariantsController.create)
);

router.patch(
  '/:id',
  permission('product:update'),
  validate(idParamSchema, 'params'),
  validate(updateVariantSchema, 'body'),
  asyncHandler(VariantsController.update)
);

router.delete(
  '/:id',
  permission('product:delete'),
  validate(idParamSchema, 'params'),
  asyncHandler(VariantsController.delete)
);

export default router;
