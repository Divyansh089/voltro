import { Router } from 'express';
import { AnalyticsController } from '../analytics.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { permission } from '../../../middleware/permission.middleware';
import { dashboardQuerySchema } from '../analytics.validator';
import { asyncHandler } from '../../../common/utils/asyncHandler';

import { ForbiddenError } from '../../../common/errors';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

router.use(authMiddleware);

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== 'ADMIN') {
    return next(new ForbiddenError('This dashboard is restricted to Administrators'));
  }
  next();
};

router.get(
  '/dashboard',
  permission('analytics:read'),
  requireAdmin,
  validate(dashboardQuerySchema, 'query'),
  asyncHandler(AnalyticsController.getDashboard)
);

router.get(
  '/sales-chart',
  permission('analytics:read'),
  requireAdmin,
  validate(dashboardQuerySchema, 'query'),
  asyncHandler(AnalyticsController.getSalesChart)
);

router.get(
  '/products-dashboard',
  permission('analytics:read'),
  validate(dashboardQuerySchema, 'query'),
  asyncHandler(AnalyticsController.getProductDashboard)
);

export default router;
