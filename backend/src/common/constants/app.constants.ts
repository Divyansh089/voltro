/**
 * Application-wide constants.
 * Domain-specific constants belong in their module's constants file.
 */

/** Maximum pagination page size */
export const MAX_PAGE_SIZE = 100;

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum file upload size (5MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Maximum images per product */
export const MAX_IMAGES_PER_PRODUCT = 10;

/** Maximum addresses per user */
export const MAX_ADDRESSES_PER_USER = 10;

/** Maximum cart items per user */
export const MAX_CART_ITEMS = 50;

/** Maximum wishlist items per user */
export const MAX_WISHLIST_ITEMS = 100;

/** Maximum active sessions per user */
export const MAX_ACTIVE_SESSIONS = 5;

/** Order number prefix */
export const ORDER_NUMBER_PREFIX = 'VLT';

/** Login attempt limit before lockout */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Login lockout window (15 minutes in seconds) */
export const LOGIN_LOCKOUT_SECONDS = 900;

/** Password reset token expiry (15 minutes in seconds) */
export const PASSWORD_RESET_EXPIRY_SECONDS = 900;

/** Email verification token expiry (24 hours in seconds) */
export const EMAIL_VERIFY_EXPIRY_SECONDS = 86400;

/** Cancellation window (24 hours in ms) */
export const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Refund window (30 days in ms) */
export const REFUND_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** bcrypt salt rounds */
export const BCRYPT_SALT_ROUNDS = 12;
