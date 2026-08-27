import { env } from '../config/env';
import { createModuleLogger } from '../config/logger';
import { generateOtpEmailHtml } from './templates/otpEmail.template';
import { generateOfferLetterEmailHtml } from './templates/offerLetterEmail.template';

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
      FORGOT_PASSWORD: 'Reset your Voltra password',
      UPDATE_EMAIL: 'Verify your new email address',
      UPDATE_PASSWORD: 'Verify password update',
    };

    const title = purposeTitles[purposeStr] || 'Verify your Voltra request';
    const htmlContent = generateOtpEmailHtml({ otpCode, purposeStr });

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
    const htmlContent = generateOfferLetterEmailHtml({
      toEmail,
      firstName: details.firstName,
      lastName: details.lastName,
      role: details.role,
      tempPassword: details.tempPassword,
    });

    return await this.sendBrevoEmail({
      toEmail,
      subject: `[Voltra] Welcome to the Team - Official Offer Letter & Credentials`,
      htmlContent,
    });
  }
}
