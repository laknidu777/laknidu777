"use server";

import { prisma } from "@/lib/prisma";
import { contactFormSchema, ContactFormInput } from "@/lib/validations";
import { sendContactInquiryEmail } from "@/lib/email";

export type ContactActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

// Simple in-memory rate limiting map for basic spam protection: key = email, value = timestamp
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute per email address

export async function submitContactInquiry(data: ContactFormInput): Promise<ContactActionResult> {
  // 1. Zod schema validation
  const validated = contactFormSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Please check the form fields and try again.",
    };
  }

  const { name, email, subject, message, honeypot } = validated.data;

  // 2. Honeypot Bot Trap: If hidden bot-trap field contains any value, silently discard
  if (honeypot && honeypot.trim().length > 0) {
    console.warn(`[Spam Guard] Automated submission detected and filtered out. Claimed sender: ${name} <${email}>`);
    return {
      success: true,
      message: "Thank you for reaching out! Your message has been received.",
    };
  }

  // 3. Simple flood prevention per email
  const lowerEmail = email.toLowerCase();
  const lastSent = rateLimitMap.get(lowerEmail);
  const now = Date.now();
  if (lastSent && now - lastSent < RATE_LIMIT_WINDOW_MS) {
    const waitSecs = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastSent)) / 1000);
    return {
      success: false,
      error: `Please wait ${waitSecs} seconds before sending another message.`,
    };
  }

  // 4. Determine destination recipient email from database settings
  let recipientEmail = process.env.SMTP_USER || "laknidut@gmail.com";
  try {
    const contactEmailSetting = await prisma.siteSetting.findUnique({
      where: { key: "contact_email" },
    });
    if (contactEmailSetting?.value && contactEmailSetting.value.trim().length > 0) {
      recipientEmail = contactEmailSetting.value.trim();
    }
  } catch (dbErr) {
    console.warn("[Contact Action] Could not retrieve contact_email setting from DB; using default recipient:", dbErr);
  }

  // 5. Send notification email via Nodemailer
  const emailResult = await sendContactInquiryEmail({
    name,
    email,
    subject,
    message,
    recipientEmail,
  });

  if (!emailResult.success) {
    return {
      success: false,
      error: emailResult.error || "Failed to send message. Please email me directly using the address on this page.",
    };
  }

  // Record rate limit timestamp
  rateLimitMap.set(lowerEmail, now);

  return {
    success: true,
    message: "Thank you for reaching out! Your message has been sent successfully. I'll get back to you soon.",
  };
}
