import config from '../config/index.js';

/**
 * Email Templates
 *
 * HTML email builders. All include a base layout, inline styles (for client
 * compatibility), and a single clear call-to-action. URLs are built from
 * config.clientUrl so links work across environments.
 *
 * Security: Template values are interpolated as plain text only — never as
 * HTML — to prevent injection via user-controlled fields.
 */

const baseLayout = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;margin-top:24px;">
    <div style="background:#4f46e5;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">ScholarLogic</h1>
    </div>
    <div style="padding:32px 28px;color:#1f2937;font-size:15px;line-height:1.6;">
      ${content}
    </div>
    <div style="padding:18px 28px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">
      © ${new Date().getFullYear()} ScholarLogic. All rights reserved.
    </div>
  </div>
</body>
</html>`;

const button = (url, label) =>
  `<a href="${url}" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">${label}</a>`;

export const welcomeEmail = (firstName) =>
  baseLayout(
    'Welcome to ScholarLogic',
    `<h2 style="margin-top:0;">Welcome, ${firstName}!</h2>
     <p>Your ScholarLogic account has been created successfully. We're excited to help you on your academic journey.</p>
     <p>Explore courses, connect with teachers, and track your progress — all in one place.</p>`
  );

export const verificationEmail = (firstName, token) =>
  baseLayout(
    'Verify Your Email',
    `<h2 style="margin-top:0;">Hi ${firstName},</h2>
     <p>Please confirm your email address to activate your account. This link expires in 24 hours.</p>
     ${button(`${config.clientUrl}/verify-email?token=${token}`, 'Verify Email')}
     <p style="color:#6b7280;font-size:13px;">If you didn't create this account, you can safely ignore this email.</p>`
  );

export const forgotPasswordEmail = (firstName, token) =>
  baseLayout(
    'Reset Your Password',
    `<h2 style="margin-top:0;">Hi ${firstName},</h2>
     <p>We received a request to reset your password. Click below to choose a new one. This link expires in 1 hour.</p>
     ${button(`${config.clientUrl}/reset-password?token=${token}`, 'Reset Password')}
     <p style="color:#6b7280;font-size:13px;">If you didn't request this, no action is needed.</p>`
  );

export const resetSuccessEmail = (firstName) =>
  baseLayout(
    'Password Updated',
    `<h2 style="margin-top:0;">Hi ${firstName},</h2>
     <p>Your password has been changed successfully. If this wasn't you, contact support immediately.</p>`
  );

export default { welcomeEmail, verificationEmail, forgotPasswordEmail, resetSuccessEmail };