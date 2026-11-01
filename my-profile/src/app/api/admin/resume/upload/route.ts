import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate admin user
    const session = await auth();
    const role = (session?.user as Record<string, unknown> | undefined)?.role;
    if (!session?.user || role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    // 3. Validate file size (max 4.5MB to adhere to Vercel Serverless Function payload limit)
    const MAX_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 4.5MB limit. Please upload an optimized PDF under 4.5MB." },
        { status: 400 }
      );
    }

    // 4. Validate filename & extension
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Invalid file type. Only .pdf files are supported." },
        { status: 400 }
      );
    }

    // 5. Read file buffer & validate PDF magic bytes (%PDF-)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 5 || buffer.toString("utf-8", 0, 5) !== "%PDF-") {
      return NextResponse.json(
        { error: "The selected file is not a valid PDF document." },
        { status: 400 }
      );
    }

    const base64Data = buffer.toString("base64");
    const formattedSize = formatFileSize(file.size);
    const nowIso = new Date().toISOString();

    // 6. Record metadata & binary content (base64) in database settings
    // This guarantees persistence across serverless instances (Vercel) where the filesystem is read-only.
    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: "resume_mode" },
        update: { value: "custom" },
        create: { key: "resume_mode", value: "custom" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "resume_custom_name" },
        update: { value: file.name },
        create: { key: "resume_custom_name", value: file.name },
      }),
      prisma.siteSetting.upsert({
        where: { key: "resume_custom_size" },
        update: { value: formattedSize },
        create: { key: "resume_custom_size", value: formattedSize },
      }),
      prisma.siteSetting.upsert({
        where: { key: "resume_custom_uploaded_at" },
        update: { value: nowIso },
        create: { key: "resume_custom_uploaded_at", value: nowIso },
      }),
      prisma.siteSetting.upsert({
        where: { key: "resume_custom_pdf_base64" },
        update: { value: base64Data },
        create: { key: "resume_custom_pdf_base64", value: base64Data },
      }),
      prisma.siteSetting.upsert({
        where: { key: "profile_resume_url" },
        update: { value: "/api/resume" },
        create: { key: "profile_resume_url", value: "/api/resume" },
      }),
    ]);

    // 7. Optional local disk write (for local development or Docker containers)
    // Non-fatal if on serverless environments like Vercel with read-only root filesystems.
    try {
      const cwd = process.cwd();
      const publicDir = path.resolve(cwd, "public");
      await fs.mkdir(publicDir, { recursive: true });

      const liveResumePath = path.resolve(publicDir, "resume.pdf");
      const customResumePath = path.resolve(publicDir, "custom_resume.pdf");

      await Promise.all([
        fs.writeFile(liveResumePath, buffer),
        fs.writeFile(customResumePath, buffer),
      ]);
    } catch (fsErr) {
      console.info("Notice: Could not write to filesystem (expected in read-only serverless environments such as Vercel). File is stored safely in database.", fsErr);
    }

    // 8. Revalidate website & admin pages
    revalidatePath("/");
    revalidatePath("/admin/cv");
    revalidatePath("/admin/profile");

    return NextResponse.json({
      success: true,
      message: "Custom CV uploaded successfully!",
      fileName: file.name,
      fileSize: formattedSize,
      uploadedAt: nowIso,
    });
  } catch (err: unknown) {
    console.error("Resume upload failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process upload." },
      { status: 500 }
    );
  }
}
