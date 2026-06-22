import { Router } from 'express';
import { CmsController } from '../cms.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { idParamSchema } from '../../../common/validators';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import {
  createBannerSchema,
  updateBannerSchema,
  createFeaturedProductSchema,
  updateFeaturedProductSchema,
  createCampaignSchema,
  updateCampaignSchema
} from '../cms.validator';
import { z } from 'zod';

const router = Router();

// ── Public Routes ────────────────────────────────────────

router.get('/banners', asyncHandler(CmsController.getBannersPublic));
router.get('/featured-products', asyncHandler(CmsController.getFeaturedProductsPublic));
router.get('/campaigns', asyncHandler(CmsController.getCampaignsPublic));

// ── Admin Routes ─────────────────────────────────────────

router.use(authMiddleware);

// Banners
router.get('/admin/banners', permission('cms:manage'), asyncHandler(CmsController.getBannersAdmin));
router.post('/admin/banners', permission('cms:manage'), validate(createBannerSchema, 'body'), asyncHandler(CmsController.createBanner));
router.patch('/admin/banners/:id', permission('cms:manage'), validate(idParamSchema, 'params'), validate(updateBannerSchema, 'body'), asyncHandler(CmsController.updateBanner));
router.delete('/admin/banners/:id', permission('cms:manage'), validate(idParamSchema, 'params'), asyncHandler(CmsController.deleteBanner));

// Featured Products
router.get('/admin/featured-products', permission('cms:manage'), asyncHandler(CmsController.getFeaturedProductsAdmin));
router.post('/admin/featured-products', permission('cms:manage'), validate(createFeaturedProductSchema, 'body'), asyncHandler(CmsController.createFeaturedProduct));
router.patch('/admin/featured-products/:id', permission('cms:manage'), validate(idParamSchema, 'params'), validate(updateFeaturedProductSchema, 'body'), asyncHandler(CmsController.updateFeaturedProduct));
router.delete('/admin/featured-products/:id', permission('cms:manage'), validate(idParamSchema, 'params'), asyncHandler(CmsController.deleteFeaturedProduct));

// Campaigns
router.get('/admin/campaigns', permission('cms:manage'), asyncHandler(CmsController.getCampaignsAdmin));
router.post('/admin/campaigns', permission('cms:manage'), validate(createCampaignSchema, 'body'), asyncHandler(CmsController.createCampaign));
router.patch('/admin/campaigns/:id', permission('cms:manage'), validate(idParamSchema, 'params'), validate(updateCampaignSchema, 'body'), asyncHandler(CmsController.updateCampaign));
router.delete('/admin/campaigns/:id', permission('cms:manage'), validate(idParamSchema, 'params'), asyncHandler(CmsController.deleteCampaign));

export default router;
