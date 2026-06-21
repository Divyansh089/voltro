import { Router } from 'express';
import { AnalyticsController } from '../analytics.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { dashboardQuerySchema } from '../analytics.validator';
import { asyncHandler } from '../../../common/utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get(
  '/dashboard',
  permission('analytics:read'),
  validate(dashboardQuerySchema, 'query'),
  asyncHandler(AnalyticsController.getDashboard)
);

router.get(
  '/sales-chart',
  permission('analytics:read'),
  validate(dashboardQuerySchema, 'query'),
  asyncHandler(AnalyticsController.getSalesChart)
);

export default router;
