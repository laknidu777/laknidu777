"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export interface UpdateCredentialsInput {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateCredentialsResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function getAdminAccountDetails() {
  const currentAdmin = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: currentAdmin.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function updateAdminCredentials(
  data: UpdateCredentialsInput
): Promise<UpdateCredentialsResult> {
  const currentAdmin = await requireAdmin();

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentAdmin.id },
    });

    if (!user) {
      return { success: false, error: "Admin account not found." };
    }

    const updates: { name?: string; email?: string; passwordHash?: string } = {};

    // 1. Update Profile Info (Name / Email)
    if (data.name && data.name.trim() !== user.name) {
      updates.name = data.name.trim();
    }

    if (data.email && data.email.trim().toLowerCase() !== user.email) {
      const targetEmail = data.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
        return { success: false, error: "Please provide a valid email address." };
      }

      // Check if email is already taken
      const existing = await prisma.user.findUnique({
        where: { email: targetEmail },
      });

      if (existing && existing.id !== user.id) {
        return { success: false, error: "Email address is already in use by another account." };
      }

      updates.email = targetEmail;
    }

    // 2. Update Password if requested
    if (data.newPassword) {
      if (!data.currentPassword) {
        return {
          success: false,
          error: "Current password is required to set a new password.",
        };
      }

      const isCurrentValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return {
          success: false,
          error: "The current password you entered is incorrect.",
        };
      }

      if (data.newPassword.length < 8) {
        return {
          success: false,
          error: "New password must be at least 8 characters long.",
        };
      }

      updates.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return { success: true, message: "No changes were made." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    revalidatePath("/admin/account");
    revalidatePath("/admin");

    return {
      success: true,
      message: updates.passwordHash
        ? "Account credentials and password updated successfully!"
        : "Account details updated successfully!",
    };
  } catch (err) {
    console.error("updateAdminCredentials error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating account credentials.",
    };
  }
}
