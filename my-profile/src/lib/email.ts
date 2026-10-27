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

  // Always log OTP in server console for local dev assurance
  console.log(`\n======================================================`);
  console.log(`🔑 [ADMIN OTP DISPATCH]`);
  console.log(`Recipient: ${to}`);
  console.log(`One-Time Code (OTP): [ ${otp} ]`);
  console.log(`Expires in: ${expiresInMinutes} minutes`);
  console.log(`======================================================\n`);

  if (!user || !pass) {
    console.warn(
      `[SMTP Warning] SMTP_USER or SMTP_PASS is not configured in .env. Falling back to terminal display.`
    );
    return {
      success: true,
      deliveredVia: "console",
      error: "SMTP credentials not configured in .env; OTP logged to server terminal.",
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
