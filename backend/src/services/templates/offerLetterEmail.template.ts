export function generateOfferLetterEmailHtml(params: {
  toEmail: string;
  firstName: string;
  lastName: string;
  role: string;
  tempPassword: string;
}): string {
  const { toEmail, firstName, lastName, role, tempPassword } = params;

  const roleLabels: Record<string, string> = {
    ADMIN: 'System Administrator',
    PRODUCT_MANAGER: 'Product Manager',
    CUSTOMER_SUPPORT: 'Customer Support Specialist',
    MANAGER: 'General Manager',
    WAREHOUSE: 'Warehouse & Inventory Lead',
  };

  const roleTitle = roleLabels[role] || role.replace('_', ' ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Team, ${firstName} ${lastName}!</title>
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
      max-width: 560px;
      margin: 0 auto;
    }
    .card {
      background: #ffffff;
      border-radius: 24px;
      padding: 40px 32px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
      border: 1px solid #e2e8f0;
      text-align: left;
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
    .badge-tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #64748b;
      margin-top: 8px;
    }
    .greeting {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 12px 0;
      letter-spacing: -0.4px;
    }
    .lead-text {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .cred-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #84cc16;
      border-radius: 18px;
      padding: 22px;
      margin: 24px 0;
    }
    .cred-group {
      margin-bottom: 16px;
    }
    .cred-group:last-child {
      margin-bottom: 0;
    }
    .cred-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .cred-val {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      word-break: break-all;
    }
    .pwd-pill-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 10px 14px;
      margin-top: 6px;
    }
    .pwd-code {
      font-family: 'Courier New', Consolas, monospace;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 1px;
    }
    .security-notice {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 14px;
      padding: 16px 18px;
      margin-top: 24px;
      font-size: 13px;
      color: #991b1b;
      line-height: 1.5;
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
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header-logo">
        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <img src="https://raw.githubusercontent.com/Divyansh089/voltro/main/frontend/public/logo/voltra_logo.png" alt="Voltra" style="height: 36px; width: auto; vertical-align: middle; display: inline-block;" />
          <span class="brand-title">Voltra<span class="brand-dot">.</span></span>
        </div>
        <div class="badge-tag">Official Employment Offer & Access Grant</div>
      </div>

      <h1 class="greeting">Welcome to the Team, ${firstName} ${lastName}!</h1>
      <p class="lead-text">
        We are delighted to extend this official offer to join <strong>Voltra Electronics</strong> in the capacity of <strong>${roleTitle}</strong>.
      </p>
      <p class="lead-text">
        Your staff portal access credentials have been initialized below:
      </p>

      <div class="cred-container">
        <div class="cred-group">
          <div class="cred-label">Authorized Login Email</div>
          <div class="cred-val">${toEmail}</div>
        </div>

        <div class="cred-group">
          <div class="cred-label">Assigned Temporary Password</div>
          <div class="pwd-pill-box">
            <table width="100%" cellPadding="0" cellSpacing="0" border="0">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  <span class="pwd-code">${tempPassword}</span>
                </td>
                <td align="right" style="vertical-align: middle;">
                  <span style="display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; cursor: pointer;" title="Copy Password">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </span>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="security-notice">
        🔒 <strong>SECURITY DIRECTIVE:</strong> Please log in to the Voltra Staff Portal and navigate to <strong>Settings</strong> to update your password immediately upon first sign-in.
      </div>

      <hr class="divider">

      <div class="footer">
        Voltra Corporate Engineering & Human Resources • Confidential Information<br>
        © ${new Date().getFullYear()} Voltra Electronics. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}
