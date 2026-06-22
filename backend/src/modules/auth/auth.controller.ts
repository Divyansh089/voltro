import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../common/responses';
import { HttpStatus } from '../../common/enums/httpStatus.enum';
import { env } from '../../config/env';

/**
 * Cookie options for the HTTP-Only refresh token.
 */
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: `/api/${env.API_VERSION}/auth/refresh`, // Restrict to refresh endpoint
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export class AuthController {
  /**
   * Register a new customer
   */
  static async register(req: Request, res: Response) {
    const user = await AuthService.register(
      req.body,
      req.ip as string,
      req.get('user-agent') as string
    );

    res.status(HttpStatus.CREATED).json(
      sendSuccess(user, 'Registration successful', HttpStatus.CREATED)
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
    
    // Send basic info, this would ideally call a UserService to fetch full profile
    res.status(HttpStatus.OK).json(
      sendSuccess({
        id: user.userId,
        role: user.role,
        sessionId: user.sessionId,
      }, 'Current user profile')
    );
  }
}
