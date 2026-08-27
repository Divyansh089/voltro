export function generateOtpEmailHtml(params: {
  otpCode: string;
  purposeStr: string;
}): string {
  const { otpCode, purposeStr } = params;

  const purposeTitles: Record<string, string> = {
    FORGOT_PASSWORD: 'Reset your Voltra password',
    UPDATE_EMAIL: 'Verify your new email address',
    UPDATE_PASSWORD: 'Verify password update',
  };

  const title = purposeTitles[purposeStr] || 'Verify your Voltra request';

  // Format code with double spaces between digits for clean reading
  const formattedCode = otpCode.split('').join('  ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f5f7;
      margin: 0;
      padding: 32px 12px;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 520px;
      margin: 0 auto;
    }
    .card {
      background: #ffffff;
      border-radius: 24px;
      padding: 40px 32px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .header-logo {
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      vertical-align: middle;
    }
    .brand-dot {
      color: #84cc16;
      font-size: 30px;
      line-height: 0;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 12px 0;
      letter-spacing: -0.4px;
    }
    .subtitle {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 28px 0;
      padding: 0 10px;
    }
    .otp-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 24px 28px;
      margin: 28px 0;
      text-align: center;
    }
    .disclaimer {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
      margin-top: 24px;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 32px 0 24px 0;
      border: none;
    }
    .footer {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      {/* Site Brand Logo Header: voltra_logo.png + Voltra. */}
      <div class="header-logo">
        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <img src="https://raw.githubusercontent.com/Divyansh089/voltro/main/frontend/public/logo/voltra_logo.png" alt="Voltra" style="height: 36px; width: auto; vertical-align: middle; display: inline-block;" />
          <span class="brand-title">Voltra<span class="brand-dot">.</span></span>
        </div>
      </div>

      <h1 class="title">${title}</h1>
      <p class="subtitle">
        We received a request with the following verification code. Please enter it in the browser window where you started your action.
      </p>

      {/* OTP Code with copy icon placed on the RIGHT of the code */}
      <div class="otp-box">
        <table cellPadding="0" cellSpacing="0" border="0" align="center" style="margin: 0 auto;">
          <tr>
            <td style="font-family: 'Courier New', Consolas, monospace; font-size: 34px; font-weight: 900; color: #0f172a; letter-spacing: 12px; vertical-align: middle; padding-left: 12px;">
              ${formattedCode}
            </td>
            <td style="padding-left: 16px; vertical-align: middle;">
              <span style="display: inline-block; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 10px; cursor: pointer;" title="Copy Code">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </span>
            </td>
          </tr>
        </table>
      </div>

      <p class="disclaimer">
        If you did not attempt this action, please disregard this email. The code will remain active for 2 minutes.
      </p>

      <hr class="divider">

      <div class="footer">
        Voltra Electronics, an effortless modern identity and commerce platform.<br>
        © ${new Date().getFullYear()} Voltra Inc. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}
