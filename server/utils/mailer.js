import nodemailer from 'nodemailer';

export const sendOtpEmail = async (toEmail, otp) => {
  const smtpUser = process.env.SMTP_USER || 'yourcampusops@gmail.com';
  const smtpPass = (process.env.SMTP_PASS || 'rwhzrrjxcnptrmcp').replace(/\s+/g, '');

  if (!smtpUser || !smtpPass) {
    console.log(`[Mailer] SMTP not configured. Demo OTP for ${toEmail}: ${otp}`);
    return { sent: false, demo: true, reason: 'SMTP credentials not configured in environment.' };
  }

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

  // Attempt 1: Port 465 (Direct SSL) with strict timeouts and forced IPv4
  try {
    const transporter465 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 7000,
      dnsTimeout: 4000,
      family: 4 // Force IPv4 to prevent hanging on cloud IPv6 unrouted sockets
    });

    const info = await transporter465.sendMail(mailOptions);
    console.log(`[Mailer] OTP email dispatched via port 465 to ${toEmail}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err465) {
    console.warn(`[Mailer] Port 465 delivery attempt failed (${err465.message}). Trying port 587 STARTTLS...`);
    
    // Attempt 2: Port 587 (STARTTLS)
    try {
      const transporter587 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 7000,
        dnsTimeout: 4000,
        family: 4
      });

      const info587 = await transporter587.sendMail(mailOptions);
      console.log(`[Mailer] OTP email dispatched via port 587 to ${toEmail}: ${info587.messageId}`);
      return { sent: true, messageId: info587.messageId };
    } catch (err587) {
      console.error(`[Mailer] All SMTP attempts failed for ${toEmail}:`, err587.message);
      return { sent: false, error: err587.message };
    }
  }
};
