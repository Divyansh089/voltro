import { Router } from 'express';
import { RolesController } from '../roles.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/permission.middleware';
import { RoleName } from '../../../common/enums';
import { createRoleSchema, updateRoleSchema, roleListQuerySchema, permissionListQuerySchema } from '../roles.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

// Only SUPER_ADMIN and ADMIN can manage roles and permissions
router.use(authMiddleware, requireRole(RoleName.SUPER_ADMIN, RoleName.ADMIN));

// ── Roles ────────────────────────────────────────────────

router.post(
  '/',
  validate(createRoleSchema, 'body'),
  asyncHandler(RolesController.create)
);

router.get(
  '/',
  validate(roleListQuerySchema, 'query'),
  asyncHandler(RolesController.findAll)
);

router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(RolesController.findById)
);

router.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateRoleSchema, 'body'),
  asyncHandler(RolesController.update)
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(RolesController.delete)
);

// ── Permissions ──────────────────────────────────────────

router.get(
  '/permissions/all',
  validate(permissionListQuerySchema, 'query'),
  asyncHandler(RolesController.findAllPermissions)
);

export default router;
