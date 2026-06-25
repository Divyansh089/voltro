import { Router } from 'express';
import { UsersController } from '../users.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { userListQuerySchema, updateUserSchema } from '../users.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

// All user management routes require auth and specific permissions
router.use(authMiddleware);

// List users (Admin)
router.get(
  '/',
  permission('user:read'),
  validate(userListQuerySchema, 'query'),
  asyncHandler(UsersController.findAll)
);

// Get specific user (Admin)
router.get(
  '/:id',
  permission('user:read'),
  validate(idParamSchema, 'params'),
  asyncHandler(UsersController.findById)
);

// Update user (Admin)
router.patch(
  '/:id',
  permission('user:update'),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  asyncHandler(UsersController.update)
);

// Delete/Deactivate user (Admin)
router.delete(
  '/:id',
  permission('user:delete'),
  validate(idParamSchema, 'params'),
  asyncHandler(UsersController.delete)
);

export default router;
