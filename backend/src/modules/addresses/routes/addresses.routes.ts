import { Router } from 'express';
import { AddressesController } from '../addresses.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { addressSchema, updateAddressSchema, addressQuerySchema } from '../addresses.validator';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

// Address management requires authentication
router.use(authMiddleware);

// ── Customer Routes (Self-management) ────────────────────

router.get(
  '/me',
  asyncHandler(AddressesController.findMyAddresses)
);

router.post(
  '/me',
  validate(addressSchema, 'body'),
  asyncHandler(AddressesController.createMyAddress)
);

router.get(
  '/me/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(AddressesController.findMyAddressById)
);

router.patch(
  '/me/:id',
  validate(idParamSchema, 'params'),
  validate(updateAddressSchema, 'body'),
  asyncHandler(AddressesController.updateMyAddress)
);

router.delete(
  '/me/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(AddressesController.deleteMyAddress)
);

// ── Admin Routes ─────────────────────────────────────────

router.get(
  '/',
  permission('customer:read'), // Part of customer management
  validate(addressQuerySchema, 'query'),
  asyncHandler(AddressesController.adminFindAll)
);

export default router;
