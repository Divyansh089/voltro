import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums/httpStatus.enum';
import { env } from '../../config/env';

/**
 * Cookie options for the HTTP-Only refresh token.
 */
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export class AuthController {
  /**
   * Register a new customer
   */
  static async register(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await AuthService.register(
      req.body,
      req.ip as string,
      req.get('user-agent') as string
    );

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(HttpStatus.CREATED).json(
      sendSuccess({ user, accessToken }, 'Registration successful', HttpStatus.CREATED)
    );
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await AuthService.login(
      req.body,
      req.ip as string,
      req.get('user-agent') as string
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    // Send access token and user profile in JSON body
    res.status(HttpStatus.OK).json(
      sendSuccess({ user, accessToken }, 'Login successful')
    );
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response) {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'No refresh token provided',
      });
      return;
    }

    const { accessToken, refreshToken } = await AuthService.refresh(
      oldRefreshToken,
      req.ip as string,
      req.get('user-agent') as string
    );

    // Update cookie with rotated refresh token
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(HttpStatus.OK).json(
      sendSuccess({ accessToken }, 'Token refreshed successfully')
    );
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    const user = (req as any).user;
    
    if (user?.sessionId) {
      await AuthService.logout(
        user.sessionId,
        user.userId,
        req.ip as string,
        req.get('user-agent') as string
      );
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

    res.status(HttpStatus.OK).json(
      sendSuccess(null, 'Logged out successfully')
    );
  }

  /**
   * Get current authenticated user profile
   */
  static async me(req: Request, res: Response) {
    const user = (req as any).user;
    
    // Fetch full profile from DB
    const fullProfile = await UsersService.findById(user.userId);

    res.status(HttpStatus.OK).json(
      sendSuccess({
        ...fullProfile,
        sessionId: user.sessionId, // Keep sessionId in the response
      }, 'Current user profile')
    );
  }

  /**
   * Request 6-digit OTP for Forgot Password
   */
  static async requestForgotPasswordOtp(req: Request, res: Response) {
    const { email } = req.body;
    const result = await AuthService.requestForgotPasswordOtp(email);
    res.status(HttpStatus.OK).json(sendSuccess(result, result.message));
  }

  /**
   * Verify 6-digit OTP for Forgot Password
   */
  static async verifyForgotPasswordOtp(req: Request, res: Response) {
    const { email, code } = req.body;
    const result = await AuthService.verifyForgotPasswordOtp(email, code);
    res.status(HttpStatus.OK).json(sendSuccess(result, result.message));
  }

  /**
   * Reset Password after OTP Verification
   */
  static async resetForgotPassword(req: Request, res: Response) {
    const { resetToken, newPassword } = req.body;
    const { user, accessToken, refreshToken, message } = await AuthService.resetForgotPassword(
      resetToken,
      newPassword,
      req.ip as string,
      req.get('user-agent') as string
    );

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
    res.status(HttpStatus.OK).json(sendSuccess({ user, accessToken }, message));
  }
}
