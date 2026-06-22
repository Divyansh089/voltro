import { Router } from 'express';
import { AuditController } from '../audit.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/permission.middleware';
import { RoleName } from '../../../common/enums';
import { auditLogQuerySchema } from '../audit.validator';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

// Only SUPER_ADMIN and ADMIN can view audit logs
router.use(authMiddleware, requireRole(RoleName.SUPER_ADMIN, RoleName.ADMIN));

router.get(
  '/',
  validate(auditLogQuerySchema, 'query'),
  asyncHandler(AuditController.findAll)
);

export default router;
