import prisma from '../../prisma/prismaClient';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { hashPassword, comparePassword } from '../../common/helpers';
import { AuditAction } from '../../common/enums';
import { CacheService } from '../../cache/cache.service';
import { CacheKeys } from '../../cache/cacheKeys';
import { UploadService, CloudinaryService } from '../../storage';
import { CLOUDINARY_FOLDERS } from '../../config/cloudinary';
import { createModuleLogger } from '../../config/logger';
import { EmailService } from '../../services/email.service';
import { OtpService } from '../auth/otp.service';
import type { Prisma } from '@prisma/client';

const log = createModuleLogger('users-service');

export class UsersService {
  /**
   * Find a user by ID
   */
  static async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
        avatarUrl: true,
        createdAt: true,
        role: {
          select: { id: true, name: true }
        },
        customerProfile: true,
        staffProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return user;
  }

  /**
   * List all users with pagination and filtering
   */
  static async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, role, isActive, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { customerProfile: { firstName: { contains: search, mode: 'insensitive' } } },
          { customerProfile: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(role && { role: { name: role } }),
      ...(isActive !== undefined && { isActive }),
    };

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          isActive: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          role: { select: { id: true, name: true } },
          customerProfile: { select: { firstName: true, lastName: true } },
          staffProfile: { select: { firstName: true, lastName: true, phone: true } },
        },
      }),
    ]);

    return { total, users };
  }

  /**
   * Update user details (Admin operation)
   */
  static async update(
    id: string,
    data: { roleId?: string; isActive?: boolean; isEmailVerified?: boolean },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError('User', id);
    }

    // Don't allow updating Super Admin role directly this way (or prevent disabling them)
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (user.roleId === superAdminRole?.id && data.isActive === false) {
      throw new ConflictError('Cannot deactivate a Super Admin');
    }

    const updatedUser = await prisma.$transaction(async (tx: any) => {
      const result = await tx.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          isActive: true,
          isEmailVerified: true,
          role: { select: { name: true } }
        }
      });

      // Log audit
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.USER_UPDATED,
          resource: 'user',
          resourceId: id,
          oldValues: { roleId: user.roleId, isActive: user.isActive },
          newValues: data as any,
          ipAddress,
          userAgent,
        },
      });

      // If deactivated, revoke all sessions
      if (data.isActive === false) {
        const activeSessions = await tx.session.findMany({ where: { userId: id, isActive: true } });
        for (const session of activeSessions) {
          await CacheService.del(CacheKeys.session(session.id));
        }
        await tx.session.updateMany({
          where: { userId: id },
          data: { isActive: false },
        });
      }

      // If role changed, they should login again to get new permissions
      if (data.roleId && data.roleId !== user.roleId) {
        const activeSessions = await tx.session.findMany({ where: { userId: id, isActive: true } });
        for (const session of activeSessions) {
          await CacheService.del(CacheKeys.session(session.id));
        }
        await tx.session.updateMany({
          where: { userId: id },
          data: { isActive: false },
        });
      }

      return result;
    });

    return updatedUser;
  }

  /**
   * Upload Avatar for user (Cloudinary)
   */
  static async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Upload new image to Cloudinary
    const { url } = await UploadService.uploadFile(file, CLOUDINARY_FOLDERS.AVATARS);

    // Clean up old avatar from Cloudinary if existed
    if (user.avatarUrl) {
      try {
        const oldPublicId = CloudinaryService.extractPublicId(user.avatarUrl);
        if (oldPublicId) {
          await CloudinaryService.delete(oldPublicId);
        }
      } catch (err) {
        log.error({ err, oldAvatarUrl: user.avatarUrl }, 'Failed to delete old avatar');
      }
    }

    // Update user record with new avatarUrl
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
      select: {
        id: true,
        email: true,
        avatarUrl: true,
        customerProfile: true,
        staffProfile: true,
      },
    });

    return updatedUser;
  }

  /**
   * Request 6-digit OTP for account security updates
   */
  static async requestSecurityOtp(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return await OtpService.sendOtp(user.email, 'UPDATE_SECURITY');
  }

  /**
   * Update current user's profile and security (with OTP check for email/password)
   */
  static async updateSelf(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
      otpCode?: string;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true, staffProfile: true },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    const isEmailChanging = data.email && data.email.toLowerCase().trim() !== user.email.toLowerCase();
    const isPasswordChanging = !!data.newPassword;

    // Require 6-digit OTP verification for security updates (email or password change)
    if (isEmailChanging || isPasswordChanging) {
      if (!data.otpCode) {
        throw new BadRequestError('6-digit verification code is required for email or password updates.');
      }
      await OtpService.verifyOtp(user.email, 'UPDATE_SECURITY', data.otpCode);
    }

    const { email, phone, currentPassword, newPassword } = data;
    const updateData: any = {};
    const oldValues: any = {};
    const newValues: any = {};

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
      updateData.email = email;
      oldValues.email = user.email;
      newValues.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        throw new ConflictError('Current password is required to change password');
      }
      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new ConflictError('Invalid current password');
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.$transaction(async (tx: any) => {
      // Update User
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id },
          data: updateData,
        });
      }

      // Update Customer Profile (Phone)
      if (phone && user.customerProfile && phone !== user.customerProfile.phone) {
        await tx.customerProfile.update({
          where: { userId: id },
          data: { phone },
        });
        oldValues.phone = user.customerProfile.phone;
        newValues.phone = phone;
      }

      // Update Staff Profile (Phone)
      if (phone && user.staffProfile && phone !== user.staffProfile.phone) {
        await tx.staffProfile.update({
          where: { userId: id },
          data: { phone },
        });
        oldValues.phone = user.staffProfile.phone;
        newValues.phone = phone;
      }

      // Invalidate sessions if email changed
      if (updateData.email) {
        const activeSessions = await tx.session.findMany({ where: { userId: id, isActive: true } });
        for (const session of activeSessions) {
          await CacheService.del(CacheKeys.session(session.id));
        }
        await tx.session.updateMany({
          where: { userId: id },
          data: { isActive: false },
        });
      }

      // Log audit
      if (Object.keys(newValues).length > 0 || newPassword) {
        await tx.auditLog.create({
          data: {
            userId: id,
            action: AuditAction.USER_UPDATED,
            resource: 'user',
            resourceId: id,
          },
        });
      }

      return tx.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          isActive: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          role: { select: { id: true, name: true } },
          customerProfile: true,
          staffProfile: true,
        },
      });
    });

    if (newPassword) {
      try {
        const { NotificationsService } = await import('../notifications/notifications.service');
        await NotificationsService.create({
          userId: id,
          type: 'MAINTENANCE',
          title: 'Security Alert: Password Changed',
          message: 'Your Voltra account password was updated successfully. If you did not request this change, please contact customer support immediately.',
          data: { kind: 'PASSWORD_CHANGED' },
        });
      } catch (e) {
        // ignore
      }
    }

    return updatedUser;
  }

  /**
   * Delete a user (Soft delete)
   */
  static async delete(id: string, adminUserId: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError('User', id);
    }

    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (user.roleId === superAdminRole?.id) {
      throw new ConflictError('Cannot delete a Super Admin');
    }

    await prisma.$transaction(async (tx: any) => {
      // Prisma soft delete middleware handles the actual update
      await tx.user.delete({ where: { id } });
      
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.USER_DELETED,
          resource: 'user',
          resourceId: id,
          ipAddress,
          userAgent,
        },
      });

      // Revoke sessions
      const activeSessions = await tx.session.findMany({ where: { userId: id, isActive: true } });
      for (const session of activeSessions) {
        await CacheService.del(CacheKeys.session(session.id));
      }
      await tx.session.updateMany({
        where: { userId: id },
        data: { isActive: false },
      });
    });
  }

  /**
   * Create a new Staff Member with auto-generated password
   */
  static async createStaffMember(
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string | null;
      role: string;
    },
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const roleRecord = await prisma.role.findUnique({ where: { name: data.role } });
    if (!roleRecord) {
      throw new NotFoundError('Role', data.role);
    }

    // Auto-generate secure password
    const rawChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let randomStr = '';
    for (let i = 0; i < 8; i++) {
      randomStr += rawChars.charAt(Math.floor(Math.random() * rawChars.length));
    }
    const generatedPassword = `Voltra@${randomStr}`;
    const passwordHash = await hashPassword(generatedPassword);

    const newUser = await prisma.$transaction(async (tx: any) => {
      const created = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          roleId: roleRecord.id,
          isEmailVerified: true,
          staffProfile: {
            create: {
              roleId: roleRecord.id,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone || '',
            },
          },
        },
        select: {
          id: true,
          email: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          role: { select: { id: true, name: true } },
          staffProfile: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: AuditAction.USER_CREATED,
          resource: 'user',
          resourceId: created.id,
          newValues: { email: data.email, role: data.role },
          ipAddress,
          userAgent,
        },
      });

      return created;
    });

    // Send Official Staff Offer Letter & Credentials via Brevo Email
    try {
      await EmailService.sendStaffOfferLetter(data.email, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        tempPassword: generatedPassword,
      });
    } catch (emailErr) {
      log.error({ emailErr, email: data.email }, 'Failed to send Staff Offer Letter Email');
    }

    return {
      user: newUser,
      generatedPassword,
      email: data.email,
    };
  }
}
