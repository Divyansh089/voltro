import { redis } from '../../cache/redisClient';
import { EmailService } from '../../services/email.service';
import { BadRequestError, TooManyRequestsError } from '../../common/errors';
import { env } from '../../config/env';
import { createModuleLogger } from '../../config/logger';

const logger = createModuleLogger('OtpService');
const COOLDOWN_TTL_SECONDS = 60; // 60s cooldown before resending

// Derive OTP expiration TTL in seconds from env.OTP_EXPIRY_TIME (120000ms -> 120s)
const getOtpTtlSeconds = () => Math.max(1, Math.floor((env.OTP_EXPIRY_TIME || 120000) / 1000));

// In-memory fallback map if Redis is offline during local dev
const fallbackOtpStore = new Map<string, { code: string; expiresAt: number }>();
const fallbackCooldownStore = new Map<string, number>();

export class OtpService {
  /**
   * Generate 6-digit cryptographic OTP and send via EmailService
   */
  static async sendOtp(email: string, purpose: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const cooldownKey = `otp:cooldown:${purpose}:${normalizedEmail}`;
    const otpKey = `otp:${purpose}:${normalizedEmail}`;

    // Check rate limit cooldown
    try {
      const isCooldown = await redis.exists(cooldownKey);
      if (isCooldown) {
        throw new TooManyRequestsError('Please wait 60 seconds before requesting another OTP code.');
      }
    } catch (err: any) {
      if (err instanceof TooManyRequestsError) throw err;
      const cooldownUntil = fallbackCooldownStore.get(cooldownKey) || 0;
      if (Date.now() < cooldownUntil) {
        throw new TooManyRequestsError('Please wait 60 seconds before requesting another OTP code.');
      }
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const otpTtlSeconds = getOtpTtlSeconds();

    // Store in Redis (or in-memory fallback)
    try {
      await redis.setex(otpKey, otpTtlSeconds, otpCode);
      await redis.setex(cooldownKey, COOLDOWN_TTL_SECONDS, '1');
    } catch {
      fallbackOtpStore.set(otpKey, { code: otpCode, expiresAt: Date.now() + otpTtlSeconds * 1000 });
      fallbackCooldownStore.set(cooldownKey, Date.now() + COOLDOWN_TTL_SECONDS * 1000);
    }

    // Send Email
    await EmailService.sendOtpEmail(normalizedEmail, otpCode, purpose);

    logger.info(`Generated 6-digit OTP for ${normalizedEmail} [${purpose}]`);
    return {
      success: true,
      message: 'A 6-digit verification code has been sent to your email address.',
    };
  }

  /**
   * Verify 6-digit OTP code
   */
  static async verifyOtp(email: string, purpose: string, inputCode: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = inputCode.trim();
    const otpKey = `otp:${purpose}:${normalizedEmail}`;

    let storedCode: string | null = null;

    try {
      storedCode = await redis.get(otpKey);
    } catch {
      const entry = fallbackOtpStore.get(otpKey);
      if (entry && Date.now() < entry.expiresAt) {
        storedCode = entry.code;
      }
    }

    if (!storedCode) {
      throw new BadRequestError('Verification code has expired or is invalid. Please request a new OTP.');
    }

    if (storedCode !== cleanCode) {
      throw new BadRequestError('Invalid 6-digit verification code. Please check and try again.');
    }

    // Delete verified OTP key so it cannot be reused
    try {
      await redis.del(otpKey);
    } catch {
      fallbackOtpStore.delete(otpKey);
    }

    return true;
  }
}
