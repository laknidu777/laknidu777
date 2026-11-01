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
      console.warn("Failed to check resume_mode from database, using fallback:", e);
    }

    let fileBuffer: Buffer | null = null;

    // 1. If custom mode is active, prefer custom uploaded PDF (from DB first, then disk)
    if (resumeMode === "custom") {
      try {
        const dbCustomPdf = await prisma.siteSetting.findUnique({
          where: { key: "resume_custom_pdf_base64" },
        });
        if (dbCustomPdf?.value) {
          fileBuffer = Buffer.from(dbCustomPdf.value, "base64");
        }
      } catch (dbErr) {
        console.warn("Failed reading custom PDF from database:", dbErr);
      }

      // Fallback to custom_resume.pdf on disk if not in DB
      if (!fileBuffer) {
        try {
          fileBuffer = await fs.readFile(customPdfPath);
        } catch {
          // Fallback to live resume.pdf if custom_resume.pdf doesn't exist
          try {
            fileBuffer = await fs.readFile(livePdfPath);
          } catch {
            try {
              await generateResumePdf();
              fileBuffer = await fs.readFile(livePdfPath);
            } catch {
              // ignore
            }
          }
        }
      }
    } else {
      // 2. Generated mode: read resume.pdf from disk
      try {
        fileBuffer = await fs.readFile(livePdfPath);
      } catch {
        try {
          await generateResumePdf();
          fileBuffer = await fs.readFile(livePdfPath);
        } catch {
          // Fallback to custom PDF in DB if livePdfPath fails
          try {
            const dbCustomPdf = await prisma.siteSetting.findUnique({
              where: { key: "resume_custom_pdf_base64" },
            });
            if (dbCustomPdf?.value) {
              fileBuffer = Buffer.from(dbCustomPdf.value, "base64");
            }
          } catch {
            // ignore
          }
        }
      }
    }

    if (!fileBuffer) {
      return NextResponse.json(
        { error: "Resume file not found. Please upload or configure a resume in the admin dashboard." },
        { status: 404 }
      );
    }

    // Determine filename
    let downloadName = "Laknidu_Thilakawardhana_CV.pdf";
    try {
      if (resumeMode === "custom") {
        const customNameSetting = await prisma.siteSetting.findUnique({
          where: { key: "resume_custom_name" },
        });
        if (customNameSetting?.value) {
          downloadName = customNameSetting.value;
        }
      }

      if (!downloadName.toLowerCase().endsWith(".pdf")) {
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
