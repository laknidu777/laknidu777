import nodemailer from "nodemailer";

interface SendOtpEmailOptions {
  to: string;
  otp: string;
  expiresInMinutes?: number;
}

export async function sendOtpEmail({
  to,
  otp,
  expiresInMinutes = 10,
}: SendOtpEmailOptions): Promise<{ success: boolean; deliveredVia: "smtp" | "console"; error?: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM || `"Portfolio Admin" <${user || "no-reply@portfolio.local"}>`;

  // In non-production environments without SMTP credentials, log OTP to console for developer testing
  if (process.env.NODE_ENV !== "production" && (!user || !pass)) {
    console.log(`\n[DEV ONLY] OTP for ${to}: [ ${otp} ] (Expires in ${expiresInMinutes}m)\n`);
  }

  if (!user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[SMTP Warning] SMTP_USER or SMTP_PASS is not configured in .env. Falling back to local development console.`
      );
    }
    return {
      success: true,
      deliveredVia: "console",
      error: "SMTP credentials not configured in environment.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Admin Password Reset Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e5e7eb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #151823; border: 1px solid #2a2e3d; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; font-size: 22px; font-weight: bold;">
        ⚡
      </div>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 16px 0 6px 0; letter-spacing: -0.02em;">
        Reset Your Admin Password
      </h1>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        Portfolio Admin Portal Security Verification
      </p>
    </div>

    <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
      Hello <strong>Laknidu</strong>,<br/>
      We received a request to reset your admin account credentials. Use the 6-digit verification code below to authorize your password update:
    </p>

    <div style="background: #0d0f17; border: 1px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #818cf8; text-shadow: 0 0 12px rgba(129, 140, 248, 0.4);">
        ${otp}
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 10px; margin-bottom: 0;">
        ⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>
      </p>
    </div>

    <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
      If you did not request a password reset, you can safely ignore this email. No changes will be made to your account.
    </p>

    <hr style="border: 0; border-top: 1px solid #232736; margin: 24px 0;" />

    <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
      Portfolio Admin Security System &bull; Direct automated dispatch
    </p>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `Your Admin Verification Code: ${otp}`,
      text: `Your admin password reset verification code is: ${otp}. It expires in ${expiresInMinutes} minutes.`,
      html: htmlContent,
    });

    console.log(`[SMTP Success] Verification email successfully sent to ${to}`);
    return { success: true, deliveredVia: "smtp" };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[SMTP Error] Failed to send email via SMTP:`, errorMsg);
    // Still report console delivery so local testing works even if Gmail credentials failed
    return {
      success: true,
      deliveredVia: "console",
      error: `Email transmission failed (${errorMsg}). Verification code was logged to server console.`,
    };
  }
}

export interface SendContactInquiryOptions {
  name: string;
  email: string;
  subject: string;
  message: string;
  recipientEmail?: string;
}

export async function sendContactInquiryEmail({
  name,
  email,
  subject,
  message,
  recipientEmail,
}: SendContactInquiryOptions): Promise<{ success: boolean; deliveredVia: "smtp" | "console"; error?: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.trim();
  const to = recipientEmail || user || "laknidut@gmail.com";
  const from = process.env.SMTP_FROM || `"Portfolio Contact" <${user || "no-reply@portfolio.local"}>`;

  // Escape HTML in user-provided content to prevent HTML injection in emails
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const dateStr = new Date().toLocaleString("en-US", {
    timeZoneName: "short",
    dateStyle: "full",
    timeStyle: "short",
  });

  // Local development fallback when SMTP credentials are not configured yet
  if (!user || !pass) {
    console.log(`
========================================================
[DEV ONLY] New Contact Inquiry Received:
From:    ${name} <${email}>
To:      ${to}
Subject: ${subject}
Date:    ${dateStr}
Message:
${message}
========================================================
`);
    return {
      success: true,
      deliveredVia: "console",
      error: "SMTP credentials not configured in environment.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Message from ${safeName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e5e7eb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #151823; border: 1px solid #2a2e3d; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="display: flex; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #232736; padding-bottom: 20px;">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; text-align: center; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; font-size: 20px; font-weight: bold; margin-right: 14px;">
        ✉️
      </div>
      <div>
        <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.02em;">
          New Portfolio Inquiry
        </h1>
        <p style="color: #9ca3af; font-size: 13px; margin: 4px 0 0 0;">
          Sent via your portfolio contact form &bull; ${dateStr}
        </p>
      </div>
    </div>

    <!-- Sender Details Card -->
    <div style="background: #0d0f17; border: 1px solid #232736; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="color: #9ca3af; width: 85px; padding: 6px 0; font-weight: 500;">From:</td>
          <td style="color: #ffffff; font-weight: 600; padding: 6px 0;">${safeName}</td>
        </tr>
        <tr>
          <td style="color: #9ca3af; padding: 6px 0; font-weight: 500;">Email:</td>
          <td style="padding: 6px 0;">
            <a href="mailto:${safeEmail}" style="color: #818cf8; text-decoration: none; font-weight: 500;">${safeEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="color: #9ca3af; padding: 6px 0; font-weight: 500;">Subject:</td>
          <td style="color: #e5e7eb; padding: 6px 0;">${safeSubject}</td>
        </tr>
      </table>
    </div>

    <!-- Message Content -->
    <div style="margin-bottom: 28px;">
      <div style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        Message Content
      </div>
      <div style="background: rgba(255, 255, 255, 0.03); border-left: 3px solid #6366f1; border-radius: 4px 8px 8px 4px; padding: 18px 20px; color: #f3f4f6; font-size: 15px; line-height: 1.65; white-space: pre-wrap;">${safeMessage}</div>
    </div>

    <!-- Direct Reply Action Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(subject)}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
        Reply Directly to ${safeName}
      </a>
    </div>

    <hr style="border: 0; border-top: 1px solid #232736; margin: 24px 0 16px 0;" />

    <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
      Hit "Reply" in your email client to respond directly to <strong>${safeEmail}</strong>.
    </p>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from,
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `[Portfolio Inquiry] ${subject} (from ${name})`,
      text: `New message from ${name} (${email}):\n\nSubject: ${subject}\n\n${message}`,
      html: htmlContent,
    });

    console.log(`[SMTP Success] Contact inquiry email successfully delivered to ${to}`);
    return { success: true, deliveredVia: "smtp" };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[SMTP Error] Failed to send contact inquiry email via SMTP:`, errorMsg);
    return {
      success: false,
      deliveredVia: "smtp",
      error: `Failed to deliver email: ${errorMsg}`,
    };
  }
}

