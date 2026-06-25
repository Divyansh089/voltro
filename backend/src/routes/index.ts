import { Router } from 'express';
import healthRoutes from './api';
import { env } from '../config/env';

const router = Router();
const prefix = `/api/${env.API_VERSION}`;

/**
 * Central Route Registry
 *
 * All module routes are mounted here under the versioned API prefix.
 * This file gives you a single view of every route in the system.
 */

import authRoutes from '../modules/auth/routes/auth.routes';
import userRoutes from '../modules/users/routes/users.routes';
import roleRoutes from '../modules/roles/routes/roles.routes';
import auditRoutes from '../modules/audit/routes/audit.routes';
import categoryRoutes from '../modules/categories/routes/categories.routes';
import productRoutes from '../modules/products/routes/products.routes';
import variantRoutes from '../modules/variants/routes/variants.routes';
import inventoryRoutes from '../modules/inventory/routes/inventory.routes';
import addressRoutes from '../modules/addresses/routes/addresses.routes';
import cartRoutes from '../modules/cart/routes/cart.routes';
import wishlistRoutes from '../modules/wishlist/routes/wishlist.routes';
import couponRoutes from '../modules/coupons/routes/coupons.routes';
import reviewRoutes from '../modules/reviews/routes/reviews.routes';
import orderRoutes from '../modules/orders/routes/orders.routes';
import paymentRoutes from '../modules/payments/routes/payments.routes';
import ticketRoutes from '../modules/tickets/routes/tickets.routes';
import cmsRoutes from '../modules/cms/routes/cms.routes';
import refundRoutes from '../modules/refunds/routes/refunds.routes';
import notificationRoutes from '../modules/notifications/routes/notifications.routes';
import analyticsRoutes from '../modules/analytics/routes/analytics.routes';

// ── Health Checks ─────────────────────────────────────────
router.use(prefix, healthRoutes);

// ── Module Routes (will be added as modules are implemented) ──
router.use(`${prefix}/auth`, authRoutes);
router.use(`${prefix}/users`, userRoutes);
router.use(`${prefix}/roles`, roleRoutes);
router.use(`${prefix}/audit-logs`, auditRoutes);
router.use(`${prefix}/categories`, categoryRoutes);
router.use(`${prefix}/products`, productRoutes);
router.use(`${prefix}/variants`, variantRoutes);
router.use(`${prefix}/inventory`, inventoryRoutes);
router.use(`${prefix}/addresses`, addressRoutes);
router.use(`${prefix}/cart`, cartRoutes);
router.use(`${prefix}/wishlist`, wishlistRoutes);
router.use(`${prefix}/coupons`, couponRoutes);
router.use(`${prefix}/reviews`, reviewRoutes);
router.use(`${prefix}/orders`, orderRoutes);
router.use(`${prefix}/payments`, paymentRoutes);
router.use(`${prefix}/tickets`, ticketRoutes);
router.use(`${prefix}/cms`, cmsRoutes);
router.use(`${prefix}/refunds`, refundRoutes);
router.use(`${prefix}/notifications`, notificationRoutes);
router.use(`${prefix}/analytics`, analyticsRoutes);

export default router;
