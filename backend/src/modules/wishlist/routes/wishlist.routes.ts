import { Router } from 'express';
import { WishlistController } from '../wishlist.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { wishlistItemSchema, wishlistQuerySchema } from '../wishlist.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { z } from 'zod';

const router = Router();

// All wishlist endpoints require authentication
router.use(authMiddleware);

router.get(
  '/',
  validate(wishlistQuerySchema, 'query'),
  asyncHandler(WishlistController.findAll)
);

router.post(
  '/',
  validate(wishlistItemSchema, 'body'),
  asyncHandler(WishlistController.addItem)
);

router.delete(
  '/:productId',
  validate(z.object({ productId: idParamSchema.shape.id }), 'params'),
  asyncHandler(WishlistController.removeItem)
);

router.delete(
  '/',
  asyncHandler(WishlistController.clear)
);

export default router;
