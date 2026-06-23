import { Router } from 'express';
import { InventoryController } from '../inventory.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { updateInventorySchema, adjustInventorySchema, inventoryQuerySchema } from '../inventory.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { z } from 'zod';

const router = Router();

// Only Admins, Managers, and Warehouse can manage inventory
router.use(authMiddleware);

router.get(
  '/',
  permission('inventory:read'),
  validate(inventoryQuerySchema, 'query'),
  asyncHandler(InventoryController.findAll)
);

router.get(
  '/:variantId',
  permission('inventory:read'),
  validate(z.object({ variantId: idParamSchema.shape.id }), 'params'),
  asyncHandler(InventoryController.findByVariantId)
);

router.put(
  '/:variantId',
  permission('inventory:update'),
  validate(z.object({ variantId: idParamSchema.shape.id }), 'params'),
  validate(updateInventorySchema, 'body'),
  asyncHandler(InventoryController.setLevel)
);

router.post(
  '/:variantId/adjust',
  permission('inventory:update'),
  validate(z.object({ variantId: idParamSchema.shape.id }), 'params'),
  validate(adjustInventorySchema, 'body'),
  asyncHandler(InventoryController.adjust)
);

export default router;
