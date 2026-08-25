import { Router } from 'express';
import { UsersController } from '../users.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { userListQuerySchema, updateUserSchema, updateMeSchema, createStaffSchema } from '../users.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

import { uploadSingle } from '../../../middleware/upload.middleware';

const router = Router();

// All user management routes require auth
router.use(authMiddleware);

// Upload own avatar image (Cloudinary)
router.post(
  '/me/avatar',
  uploadSingle,
  asyncHandler(UsersController.uploadAvatar)
);

// Request 6-digit security OTP (Any authenticated user)
router.post(
  '/me/request-otp',
  asyncHandler(UsersController.requestSecurityOtp)
);

// Update self (Any authenticated user)
router.patch(
  '/me',
  validate(updateMeSchema, 'body'),
  asyncHandler(UsersController.updateMe)
);

// Create new staff member (Admin)
router.post(
  '/staff',
  permission('user:read'),
  validate(createStaffSchema, 'body'),
  asyncHandler(UsersController.createStaffMember)
);

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
