import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateResumePdf, getCvData } from "@/lib/cv-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cwd = process.cwd();
    const livePdfPath = path.resolve(cwd, "public", "resume.pdf");
    const customPdfPath = path.resolve(cwd, "public", "custom_resume.pdf");

    // Check mode from site settings
    let resumeMode = "generated";
    try {
      const modeSetting = await prisma.siteSetting.findUnique({
        where: { key: "resume_mode" },
      });
      if (modeSetting?.value) {
        resumeMode = modeSetting.value;
      }
    } catch (e) {
      console.warn("Failed to check resume_mode from database, using file check:", e);
    }

    let fileBuffer: Buffer | null = null;

    // 1. If custom mode is active, prefer custom uploaded PDF
    if (resumeMode === "custom") {
      try {
        fileBuffer = await fs.readFile(customPdfPath);
      } catch {
        // Fallback to live resume.pdf if custom_resume.pdf doesn't exist yet
        try {
          fileBuffer = await fs.readFile(livePdfPath);
        } catch {
          // If neither exists, generate
          await generateResumePdf();
          fileBuffer = await fs.readFile(livePdfPath);
        }
      }
    } else {
      // 2. Generated mode
      try {
        fileBuffer = await fs.readFile(livePdfPath);
      } catch {
        await generateResumePdf();
        fileBuffer = await fs.readFile(livePdfPath);
      }
    }

    // Determine filename
    let downloadName = "Laknidu_Thilakawardhana_CV.pdf";
    try {
      const nameSetting = await prisma.siteSetting.findUnique({
        where: { key: "profile_name" },
      });
      if (nameSetting?.value) {
        downloadName = `${nameSetting.value.trim().replace(/\s+/g, "_")}_CV.pdf`;
      } else {
        const cvData = await getCvData();
        const candidateName = cvData.personal_info?.name?.trim().replace(/\s+/g, "_");
        if (candidateName) downloadName = `${candidateName}_CV.pdf`;
      }
    } catch {
      // fallback to default
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${downloadName}"`,
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err: unknown) {
    console.error("Failed to serve resume PDF:", err);
    return NextResponse.json(
      { error: "Could not load resume PDF" },
      { status: 500 }
    );
  }
}
