"use server";

import { requireAdmin } from "@/lib/auth-guard";
import {
  getCvData,
  saveCvData,
  generateResumePdf,
  syncCvFromPortfolioDatabase,
  CvData,
} from "@/lib/cv-service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export interface ResumeStatus {
  mode: "custom" | "generated";
  fileName: string | null;
  fileSize: string | null;
  uploadedAt: string | null;
  customFileExists: boolean;
  liveFileExists: boolean;
}

export async function getCvAction(): Promise<{ success: boolean; data?: CvData; error?: string }> {
  try {
    const data = await getCvData();
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load CV data",
    };
  }
}

export async function saveCvAction(
  data: CvData
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const res = await saveCvData(data);
  if (res.success) {
    revalidatePath("/admin/cv");
    revalidatePath("/");
  }
  return res;
}

export async function regenerateCvPdfAction(): Promise<{
  success: boolean;
  pdfPath?: string;
  error?: string;
}> {
  await requireAdmin();

  const res = await generateResumePdf();
  if (res.success) {
    // When manually regenerating, switch back to generated mode
    await prisma.siteSetting.upsert({
      where: { key: "resume_mode" },
      update: { value: "generated" },
      create: { key: "resume_mode", value: "generated" },
    });
    revalidatePath("/admin/cv");
    revalidatePath("/");
  }
  return res;
}

export async function syncCvFromDbAction(): Promise<{
  success: boolean;
  data?: CvData;
  error?: string;
}> {
  await requireAdmin();

  const res = await syncCvFromPortfolioDatabase();
  if (res.success) {
    revalidatePath("/admin/cv");
    revalidatePath("/");
  }
  return res;
}

export async function getAvailableProjectsForCv() {
  await requireAdmin();

  const projects = await prisma.project.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      category: true,
      summary: true,
      description: true,
      technologies: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return projects;
}

export async function getResumeStatusAction(): Promise<ResumeStatus> {
  await requireAdmin();

  const cwd = process.cwd();
  const customPdfPath = path.resolve(cwd, "public", "custom_resume.pdf");
  const livePdfPath = path.resolve(cwd, "public", "resume.pdf");

  let customFileExists = false;
  let liveFileExists = false;

  try {
    await fs.access(customPdfPath);
    customFileExists = true;
  } catch {
    customFileExists = false;
  }

  try {
    await fs.access(livePdfPath);
    liveFileExists = true;
  } catch {
    liveFileExists = false;
  }

  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: [
          "resume_mode",
          "resume_custom_name",
          "resume_custom_size",
          "resume_custom_uploaded_at",
        ],
      },
    },
  });

  const settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const mode = (settingsMap["resume_mode"] as "custom" | "generated") || (customFileExists ? "custom" : "generated");

  return {
    mode,
    fileName: settingsMap["resume_custom_name"] || (customFileExists ? "custom_resume.pdf" : null),
    fileSize: settingsMap["resume_custom_size"] || null,
    uploadedAt: settingsMap["resume_custom_uploaded_at"] || null,
    customFileExists,
    liveFileExists,
  };
}

export async function switchResumeModeAction(mode: "custom" | "generated"): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const cwd = process.cwd();
    const customPdfPath = path.resolve(cwd, "public", "custom_resume.pdf");
    const livePdfPath = path.resolve(cwd, "public", "resume.pdf");

    if (mode === "custom") {
      // Copy custom_resume.pdf to resume.pdf if it exists
      try {
        const customBuffer = await fs.readFile(customPdfPath);
        await fs.writeFile(livePdfPath, customBuffer);
      } catch {
        return {
          success: false,
          error: "No custom CV has been uploaded yet. Please upload a PDF first.",
        };
      }
    } else {
      // Re-generate or restore standard ATS resume
      await generateResumePdf();
    }

    await prisma.siteSetting.upsert({
      where: { key: "resume_mode" },
      update: { value: mode },
      create: { key: "resume_mode", value: mode },
    });

    revalidatePath("/admin/cv");
    revalidatePath("/admin/profile");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to switch mode",
    };
  }
}

export async function deleteCustomResumeAction(): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const cwd = process.cwd();
    const customPdfPath = path.resolve(cwd, "public", "custom_resume.pdf");

    try {
      await fs.unlink(customPdfPath);
    } catch {
      // ignore if already deleted
    }

    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: "resume_mode" },
        update: { value: "generated" },
        create: { key: "resume_mode", value: "generated" },
      }),
      prisma.siteSetting.deleteMany({
        where: {
          key: {
            in: ["resume_custom_name", "resume_custom_size", "resume_custom_uploaded_at"],
          },
        },
      }),
    ]);

    // Regenerate standard resume so website always has a valid file
    await generateResumePdf();

    revalidatePath("/admin/cv");
    revalidatePath("/admin/profile");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete custom CV",
    };
  }
}
