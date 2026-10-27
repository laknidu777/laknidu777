"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export interface ResetActionResult {
  success: boolean;
  error?: string;
  message?: string;
  deliveredVia?: "smtp" | "console";
}

/**
 * Step 1: Request 6-digit OTP code sent to admin's email
 */
export async function requestPasswordResetOtp(rawEmail: string): Promise<ResetActionResult> {
  const email = (rawEmail || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please provide a valid email address." };
  }

  try {
    const adminUser = await prisma.user.findFirst({
      where: {
        email,
        role: "ADMIN",
      },
    });

    if (!adminUser) {
      return {
        success: false,
        error: "No admin account associated with this email address.",
      };
    }

    // Rate limiting: check if an OTP was sent within the last 60 seconds
    const recentOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      return {
        success: false,
        error: "A verification code was recently generated. Please wait 1 minute before requesting another.",
      };
    }

    // Generate random 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up old OTPs for this email and save new one
    await prisma.passwordResetOtp.deleteMany({
      where: { email },
    });

    await prisma.passwordResetOtp.create({
      data: {
        email,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Send email via Nodemailer / Gmail
    const dispatchResult = await sendOtpEmail({
      to: email,
      otp,
      expiresInMinutes: 10,
    });

    const isSmtp = dispatchResult.deliveredVia === "smtp";

    return {
      success: true,
      deliveredVia: dispatchResult.deliveredVia,
      message: isSmtp
        ? `A 6-digit verification code has been dispatched to ${email}.`
        : `A verification code was generated! (Notice: SMTP_PASS is pending in .env, so code [ ${otp} ] was logged to server terminal).`,
    };
  } catch (error) {
    console.error("requestPasswordResetOtp error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while generating verification code.",
    };
  }
}

/**
 * Step 2: Validate 6-digit OTP code
 */
export async function verifyPasswordResetOtp(rawEmail: string, rawOtp: string): Promise<ResetActionResult> {
  const email = (rawEmail || "").trim().toLowerCase();
  const otp = (rawOtp || "").trim();

  if (!email || !otp || otp.length !== 6) {
    return { success: false, error: "Please enter a valid 6-digit verification code." };
  }

  try {
    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return {
        success: false,
        error: "Verification code has expired or was not requested. Please request a new one.",
      };
    }

    if (record.attempts >= 5) {
      await prisma.passwordResetOtp.deleteMany({ where: { email } });
      return {
        success: false,
        error: "Too many incorrect attempts. For security, please request a new verification code.",
      };
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      await prisma.passwordResetOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return {
        success: false,
        error: `Incorrect verification code. ${4 - record.attempts} attempts remaining.`,
      };
    }

    return { success: true, message: "Code verified successfully." };
  } catch (error) {
    console.error("verifyPasswordResetOtp error:", error);
    return { success: false, error: "Verification check failed. Please try again." };
  }
}

/**
 * Step 3: Complete password update with validated OTP
 */
export async function resetPasswordWithOtp(
  rawEmail: string,
  rawOtp: string,
  newPassword: string,
): Promise<ResetActionResult> {
  const email = (rawEmail || "").trim().toLowerCase();
  const otp = (rawOtp || "").trim();

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  if (newPassword.length > 72) {
    return { success: false, error: "Password must not exceed 72 characters." };
  }

  try {
    const record = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return {
        success: false,
        error: "Session or verification code has expired. Please restart the reset process.",
      };
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      return {
        success: false,
        error: "Invalid verification code. Password update aborted.",
      };
    }

    // Hash new password using 12 rounds
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Delete used OTPs
    await prisma.passwordResetOtp.deleteMany({ where: { email } });

    return {
      success: true,
      message: "Your admin password has been reset successfully! You can now log in.",
    };
  } catch (error) {
    console.error("resetPasswordWithOtp error:", error);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}
