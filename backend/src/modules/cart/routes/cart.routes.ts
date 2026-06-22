import { Router } from 'express';
import { CartController } from '../cart.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { cartItemSchema, updateCartItemSchema } from '../cart.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

// All cart endpoints require authentication
router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(CartController.getCart)
);

router.post(
  '/items',
  validate(cartItemSchema, 'body'),
  asyncHandler(CartController.addItem)
);

router.patch(
  '/items/:id',
  validate(idParamSchema, 'params'),
  validate(updateCartItemSchema, 'body'),
  asyncHandler(CartController.updateItem)
);

router.delete(
  '/items/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(CartController.removeItem)
);

router.delete(
  '/',
  asyncHandler(CartController.clearCart)
);

export default router;
