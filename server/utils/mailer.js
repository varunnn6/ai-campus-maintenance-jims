import nodemailer from 'nodemailer';

const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzaDlem9p_BbSreXkW42ISuIn7AZmaKjTn23lP0j_bIa23nR-swYcM4zJXyxfTUlFob/exec';

export const sendOtpEmail = async (toEmail, otp) => {
  const appsScriptUrl = process.env.APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;
  const subject = `${otp} is your JIMS CampusOps Verification Code`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #a855f7; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Campus<span style="color: #ec4899;">Ops</span></h2>
        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Jagan Institute of Management Studies • Rohini Sector-5</p>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
        <p style="font-size: 14px; color: #334155; margin: 0 0 12px 0;">Use the verification code below to update your login password:</p>
        <div style="display: inline-block; font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #7e22ce; background-color: #f3e8ff; border: 1px solid #d8b4fe; padding: 8px 20px; border-radius: 8px;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 16px 0 0 0;">This code is valid for <strong>5 minutes</strong>. Never share this code with anyone.</p>
      </div>
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 20px 0 0 0;">
        If you did not request this password change, you can safely ignore this email.
      </p>
    </div>
  `;

  // Primary: Send via Google Apps Script HTTPS Web App (works on Railway & all cloud hosts)
  if (appsScriptUrl) {
    try {
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toEmail, subject, html }),
        redirect: 'follow'
      });

      const text = await response.text();
      let result = {};
      try {
        result = JSON.parse(text);
      } catch {
        // Apps Script may return HTML or plain text on redirect
      }

      if (response.ok && (result.sent === true || text.includes('"sent":true'))) {
        console.log(`[Mailer] OTP email dispatched via Apps Script HTTPS to ${toEmail}`);
        return { sent: true, provider: 'apps-script' };
      }

      console.warn(`[Mailer] Apps Script response (${response.status}):`, text.slice(0, 200));
    } catch (err) {
      console.warn(`[Mailer] Apps Script HTTPS dispatch failed (${err.message}). Falling back to SMTP...`);
    }
  }

  // Fallback: Direct SMTP (works locally where ports 465/587 are open)
  const smtpUser = process.env.SMTP_USER || 'yourcampusops@gmail.com';
  const smtpPass = (process.env.SMTP_PASS || 'rwhzrrjxcnptrmcp').replace(/\s+/g, '');

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 7000,
      family: 4
    });

    const info = await transporter.sendMail({
      from: `"JIMS CampusOps" <${smtpUser}>`,
      to: toEmail,
      subject,
      html
    });
    console.log(`[Mailer] OTP email dispatched via SMTP to ${toEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, provider: 'smtp' };
  } catch (err) {
    console.error(`[Mailer] All email delivery attempts failed for ${toEmail}:`, err.message);
    return { sent: false, error: err.message };
  }
};
