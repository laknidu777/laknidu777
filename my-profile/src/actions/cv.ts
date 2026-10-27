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
