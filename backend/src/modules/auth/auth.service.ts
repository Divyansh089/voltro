import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../prisma/prismaClient';
import { env } from '../../config/env';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import { TTL } from '../../cache/ttl';
import { RoleName } from '../../common/enums';
import { AuditAction } from '../../common/enums';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../common/errors';
import { hashPassword, comparePassword } from '../../common/helpers';
import { createModuleLogger } from '../../config/logger';
import { OtpService } from './otp.service';
import { z } from 'zod';
import type { registerSchema, loginSchema, resetPasswordSchema } from './auth.validator';

const log = createModuleLogger('auth.service');

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export class AuthService {
  /**
   * Register a new customer.
   */
  static async register(data: RegisterInput, ipAddress?: string, userAgent?: string) {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    // 2. Get Customer role
    const customerRole = await prisma.role.findUnique({
      where: { name: RoleName.CUSTOMER },
    });

    if (!customerRole) {
      throw new Error('System roles not initialized. Please run seed script.');
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 4. Create User and CustomerProfile in a transaction
    const user = await prisma.$transaction(async (tx : any) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          roleId: customerRole.id,
          customerProfile: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            },
          },
        },
        include: {
          customerProfile: true,
          role: true,
        },
      });

      // Log registration audit
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: AuditAction.USER_CREATED,
          resource: 'user',
          resourceId: newUser.id,
          ipAddress,
          userAgent,
        },
      });

      return newUser;
    });

    log.info({ userId: user.id }, 'New user registered');

    // 5. Generate session ID and tokens for automatic login
    const sessionId = uuidv4();
    const { accessToken, refreshToken } = this.generateTokens(user.id, sessionId, user.role.name);
    const hashedRefreshToken = await hashPassword(refreshToken);

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshToken: hashedRefreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await CacheService.set(
      CacheKeys.session(sessionId),
      { userId: user.id, role: user.role.name },
      TTL.SESSION
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        avatarUrl: user.avatarUrl,
        permissions: [],
        customerProfile: user.customerProfile ? {
          firstName: user.customerProfile.firstName,
          lastName: user.customerProfile.lastName,
        } : undefined,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user and generate tokens.
   */
  static async login(data: LoginInput & { rememberMe?: boolean }, ipAddress?: string, userAgent?: string) {
    const loginAttemptsKey = CacheKeys.loginAttempts(data.email);
    const attempts = (await CacheService.get<number>(loginAttemptsKey)) || 0;

    if (attempts >= 5) {
      throw new UnauthorizedError('Too many failed login attempts. Try again later.');
    }

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        customerProfile: true,
        staffProfile: true,
      },
    });

    if (!user || !user.isActive) {
      await CacheService.increment(loginAttemptsKey, TTL.LOGIN_ATTEMPTS);
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      await CacheService.increment(loginAttemptsKey, TTL.LOGIN_ATTEMPTS);
      // Log failed login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.FAILED_LOGIN,
          resource: 'auth',
          ipAddress,
          userAgent,
        },
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset login attempts on success
    await CacheService.del(loginAttemptsKey);

    // 3. Generate session ID and tokens
    const isRememberMe = Boolean(data.rememberMe);
    const sessionId = uuidv4();
    const { accessToken, refreshToken } = this.generateTokens(user.id, sessionId, user.role.name, isRememberMe);

    // 4. Save session in DB and Redis
    const hashedRefreshToken = await hashPassword(refreshToken); // Store hashed refresh token in DB

    // Delete oldest sessions if user has too many active sessions (max 5)
    const activeSessionsCount = await prisma.session.count({
      where: { userId: user.id, isActive: true },
    });

    if (activeSessionsCount >= 5) {
      const oldestSession = await prisma.session.findFirst({
        where: { userId: user.id, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      
      if (oldestSession) {
        await this.revokeSession(oldestSession.id);
      }
    }

    const sessionDurationMs = isRememberMe ? (2 * 24 * 60 * 60 * 1000) : (3 * 60 * 60 * 1000); // 2 days if rememberMe, 3 hours general

    await prisma.$transaction([
      prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          refreshToken: hashedRefreshToken,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + sessionDurationMs),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: AuditAction.LOGIN,
          resource: 'auth',
          ipAddress,
          userAgent,
        },
      }),
    ]);

    // Store fast-lookup session in Redis
    await CacheService.set(
      CacheKeys.session(sessionId),
      { userId: user.id, role: user.role.name },
      TTL.SESSION
    );

    log.info({ userId: user.id, sessionId }, 'User logged in');

    const permissions = user.role.rolePermissions.map((rp) => rp.permission.name);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        avatarUrl: user.avatarUrl,
        permissions,
        customerProfile: user.customerProfile ? {
          firstName: user.customerProfile.firstName,
          lastName: user.customerProfile.lastName,
          phone: user.customerProfile.phone,
        } : undefined,
        staffProfile: user.staffProfile ? {
          firstName: user.staffProfile.firstName,
          lastName: user.staffProfile.lastName,
          phone: user.staffProfile.phone,
        } : undefined,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate refresh token to issue new tokens.
   */
  static async refresh(oldRefreshToken: string, ipAddress?: string, userAgent?: string) {
    try {
      // 1. Verify old refresh token structure
      const decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        sessionId: string;
        role: string;
      };

      // 2. Fetch session from DB
      const session = await prisma.session.findUnique({
        where: { id: decoded.sessionId },
        include: { user: { include: { role: true } } },
      });

      if (!session) {
        throw new UnauthorizedError('Invalid session');
      }

      // 3. Verify token hasn't been tampered with (compare hashes)
      const isValid = await comparePassword(oldRefreshToken, session.refreshToken);

      if (!isValid || !session.isActive || session.expiresAt < new Date()) {
        // TOKEN REUSE DETECTED!
        // The token is cryptographically valid, but it doesn't match the one in DB.
        // Or session is inactive/expired.
        // We must revoke ALL sessions for this user.
        log.warn({ userId: decoded.userId, sessionId: decoded.sessionId }, 'Possible token reuse detected! Revoking all sessions.');
        
        await prisma.$transaction([
          prisma.session.updateMany({
            where: { userId: decoded.userId },
            data: { isActive: false },
          }),
          prisma.auditLog.create({
            data: {
              userId: decoded.userId,
              action: AuditAction.TOKEN_REUSE_DETECTED,
              resource: 'auth',
              ipAddress,
              userAgent,
            },
          }),
        ]);

        // Invalidate Redis sessions (will require a scan, or handled lazily as they expire)
        await CacheService.del(CacheKeys.session(decoded.sessionId));
        
        throw new UnauthorizedError('Session revoked due to suspicious activity. Please log in again.');
      }

      // User deactivated check
      if (!session.user.isActive) {
        throw new UnauthorizedError('User account is inactive');
      }

      // 4. Issue new tokens
      const { accessToken, refreshToken } = this.generateTokens(
        session.user.id,
        session.id,
        session.user.role.name
      );
      const hashedNewRefreshToken = await hashPassword(refreshToken);

      // 5. Update session in DB
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: hashedNewRefreshToken,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Reset expiry
        },
      });

      // Renew Redis cache TTL
      await CacheService.set(
        CacheKeys.session(session.id),
        { userId: session.user.id, role: session.user.role.name },
        TTL.SESSION
      );

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user by invalidating the specific session.
   */
  static async logout(sessionId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await this.revokeSession(sessionId);

    await prisma.auditLog.create({
      data: {
        userId,
        action: AuditAction.LOGOUT,
        resource: 'auth',
        ipAddress,
        userAgent,
      },
    });

    log.info({ userId, sessionId }, 'User logged out');
  }

  /**
   * Helper: Generate access and refresh tokens.
   */
  private static generateTokens(userId: string, sessionId: string, role: string, rememberMe = false) {
    const payload = { userId, sessionId, role };

    const accessExpiry = rememberMe ? '2d' : (env.JWT_ACCESS_EXPIRY || '3h');
    const refreshExpiry = rememberMe ? '30d' : (env.JWT_REFRESH_EXPIRY || '7d');

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: accessExpiry as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: refreshExpiry as any,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Helper: Revoke a specific session.
   */
  private static async revokeSession(sessionId: string) {
    // Mark DB session as inactive
    await prisma.session.updateMany({
      where: { id: sessionId },
      data: { isActive: false },
    });

    // Remove from Redis
    await CacheService.del(CacheKeys.session(sessionId));
  }

  /**
   * Forgot Password — Step 1: Request 6-digit OTP
   */
  static async requestForgotPasswordOtp(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundError('No registered account found with this email address.');
    }

    return await OtpService.sendOtp(email, 'FORGOT_PASSWORD');
  }

  /**
   * Forgot Password — Step 2: Verify 6-digit OTP & Return Reset Token
   */
  static async verifyForgotPasswordOtp(email: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundError('No registered account found with this email address.');
    }

    await OtpService.verifyOtp(email, 'FORGOT_PASSWORD', code);

    // Create 15-minute temporary reset token
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, purpose: 'RESET_PASSWORD' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    return {
      verified: true,
      resetToken,
      message: 'OTP verified successfully. You may now reset your password.',
    };
  }

  /**
   * Forgot Password — Step 3: Update Password using Verified Reset Token
   */
  static async resetForgotPassword(resetToken: string, newPassword: string, ipAddress?: string, userAgent?: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, env.JWT_ACCESS_SECRET);
    } catch {
      throw new UnauthorizedError('Password reset token has expired or is invalid. Please restart the process.');
    }

    if (decoded?.purpose !== 'RESET_PASSWORD' || !decoded?.userId) {
      throw new UnauthorizedError('Invalid password reset token format.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true, customerProfile: true, staffProfile: true },
    });

    if (!user) {
      throw new NotFoundError('User account not found.');
    }

    const hashedPassword = await hashPassword(newPassword);

    // Update password & invalidate all active sessions for security
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    });

    log.info({ userId: user.id }, 'Password reset successfully via OTP verification flow');

    // Create new login session automatically
    const sessionId = uuidv4();
    const { accessToken, refreshToken } = this.generateTokens(user.id, sessionId, user.role.name);
    const hashedRefreshToken = await hashPassword(refreshToken);

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshToken: hashedRefreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await CacheService.set(
      CacheKeys.session(sessionId),
      { userId: user.id, role: user.role.name },
      TTL.SESSION
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        avatarUrl: user.avatarUrl,
        customerProfile: user.customerProfile ? {
          firstName: user.customerProfile.firstName,
          lastName: user.customerProfile.lastName,
        } : undefined,
      },
      accessToken,
      refreshToken,
      message: 'Password updated successfully.',
    };
  }
}
