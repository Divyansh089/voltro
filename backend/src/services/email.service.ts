import { env } from '../config/env';
import { createModuleLogger } from '../config/logger';

const logger = createModuleLogger('EmailService');

export class EmailService {
  /**
   * Send transactional email using Brevo REST API v3
   */
  private static async sendBrevoEmail(payload: {
    toEmail: string;
    subject: string;
    htmlContent: string;
  }): Promise<boolean> {
    if (!env.BREVO_API_KEY || env.BREVO_API_KEY.includes('examplekey')) {
      logger.info(`[DEV MAIL SUPPRESSED] ✉️ To: ${payload.toEmail} | Subject: ${payload.subject}`);
      return true;
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: env.SMTP_FROM_NAME,
            email: env.SMTP_FROM_EMAIL,
          },
          to: [{ email: payload.toEmail }],
          subject: payload.subject,
          htmlContent: payload.htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error({ errorData, status: response.status }, 'Brevo API Error');
        return false;
      }

      logger.info(`Brevo Email sent successfully to ${payload.toEmail}`);
      return true;
    } catch (err: any) {
      logger.error({ err, toEmail: payload.toEmail }, 'Failed to send Brevo Email');
      return false;
    }
  }

  /**
   * Send 6-Digit OTP Email via Brevo
   */
  static async sendOtpEmail(toEmail: string, otpCode: string, purposeStr: string): Promise<boolean> {
    const purposeTitles: Record<string, string> = {
      FORGOT_PASSWORD: 'Password Reset Verification',
      UPDATE_EMAIL: 'Email Update Verification',
      UPDATE_PASSWORD: 'Security Password Update Verification',
    };

    const title = purposeTitles[purposeStr] || 'Security Verification Code';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #111827; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
          .header { background: #0F172A; padding: 24px; text-align: center; color: #ffffff; }
          .brand { font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #CCFF00; margin: 0; text-transform: uppercase; }
          .content { padding: 32px 24px; text-align: center; }
          .title { font-size: 18px; font-weight: 700; color: #0F172A; margin-top: 0; margin-bottom: 8px; }
          .subtitle { font-size: 13px; color: #6B7280; margin-bottom: 24px; }
          .otp-box { display: inline-block; background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 16px 28px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F172A; margin: 16px 0; font-family: 'Courier New', Courier, monospace; }
          .timer-notice { font-size: 12px; font-weight: 600; color: #DC2626; margin-top: 8px; }
          .footer { background: #F8FAFC; padding: 16px 24px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">VOLTRA</h1>
          </div>
          <div class="content">
            <h2 class="title">${title}</h2>
            <p class="subtitle">Use the 6-digit verification code below to authorize your request.</p>
            <div class="otp-box">${otpCode}</div>
            <p class="timer-notice">⏱️ This OTP code is valid for 2 minutes. Do not share this code with anyone.</p>
          </div>
          <div class="footer">
            If you did not request this verification code, please ignore this email or contact Voltra Support.
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendBrevoEmail({
      toEmail,
      subject: `[Voltra] ${otpCode} is your ${title} Code`,
      htmlContent,
    });
  }

  /**
   * Send Official Staff Offer Letter Email via Brevo
   */
  static async sendStaffOfferLetter(toEmail: string, details: {
    firstName: string;
    lastName: string;
    role: string;
    tempPassword: string;
  }): Promise<boolean> {
    const roleLabels: Record<string, string> = {
      ADMIN: 'System Administrator',
      PRODUCT_MANAGER: 'Product Manager',
      CUSTOMER_SUPPORT: 'Customer Support Specialist',
    };

    const roleTitle = roleLabels[details.role] || details.role;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px; color: #111827; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; }
          .header { background: #0F172A; padding: 28px 24px; text-align: center; color: #ffffff; }
          .brand { font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #CCFF00; margin: 0; text-transform: uppercase; }
          .subbrand { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-top: 4px; }
          .content { padding: 32px; color: #334155; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 700; color: #0F172A; margin-top: 0; }
          .cred-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #CCFF00; border-radius: 8px; padding: 18px; margin: 20px 0; }
          .cred-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 4px; }
          .cred-val { font-size: 14px; font-weight: 600; color: #0F172A; font-family: monospace; }
          .notice-box { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #991B1B; }
          .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">VOLTRA ELECTRONICS</h1>
            <div class="subbrand">Official Employment Offer & Access Grant</div>
          </div>
          <div class="content">
            <h2 class="greeting">Welcome to the Team, ${details.firstName} ${details.lastName}!</h2>
            <p>We are delighted to extend this official offer to join Voltra Electronics in the capacity of <strong>${roleTitle}</strong>.</p>
            <p>Your staff portal access credentials have been initialized below:</p>

            <div class="cred-box">
              <div class="cred-label">Authorized Login Email</div>
              <div class="cred-val">${toEmail}</div>
              <br>
              <div class="cred-label">Assigned Temporary Password</div>
              <div class="cred-val">${details.tempPassword}</div>
            </div>

            <div class="notice-box">
              🔒 <strong>SECURITY DIRECTIVE:</strong> Please log in to the Voltra Staff Portal and navigate to <strong>Settings</strong> to update your password immediately upon first sign-in.
            </div>
          </div>
          <div class="footer">
            Voltra Corporate Engineering & Human Resources • Confidential Information
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendBrevoEmail({
      toEmail,
      subject: `[Voltra] Welcome to the Team - Official Offer Letter & Credentials`,
      htmlContent,
    });
  }
}
