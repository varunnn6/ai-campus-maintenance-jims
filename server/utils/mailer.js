import nodemailer from 'nodemailer';

export const sendOtpEmail = async (toEmail, otp) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.log(`[Mailer] SMTP not configured. Demo OTP for ${toEmail}: ${otp}`);
    return { sent: false, demo: true, reason: 'SMTP credentials not configured in environment.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"JIMS CampusOps" <${smtpUser}>`,
      to: toEmail,
      subject: `${otp} is your JIMS CampusOps Verification Code`,
      html: `
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
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] OTP email dispatched to ${toEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Mailer] Email delivery failed to ${toEmail}:`, err.message);
    return { sent: false, error: err.message };
  }
};

