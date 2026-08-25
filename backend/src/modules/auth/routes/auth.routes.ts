import { Router } from 'express';
import { AuthController } from '../auth.controller';
import { validate } from '../../../middleware/validation.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { registerSchema, loginSchema, requestOtpSchema, verifyOtpSchema, resetPasswordSchema } from '../auth.validator';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../../../config/rateLimiter';

const router = Router();

// Apply stricter rate limit to auth endpoints
const authLimiter = rateLimit(rateLimitConfig.auth);

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

router.post(
  '/forgot-password/request-otp',
  authLimiter,
  validate(requestOtpSchema),
  asyncHandler(AuthController.requestForgotPasswordOtp)
);

router.post(
  '/forgot-password/verify-otp',
  authLimiter,
  validate(verifyOtpSchema),
  asyncHandler(AuthController.verifyForgotPasswordOtp)
);

router.post(
  '/forgot-password/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(AuthController.resetForgotPassword)
);

router.post(
  '/refresh',
  asyncHandler(AuthController.refresh)
);

router.post(
  '/logout',
  authMiddleware,
  asyncHandler(AuthController.logout)
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(AuthController.me)
);

export default router;
