import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateResumePdf, getCvData } from "@/lib/cv-service";

export async function GET() {
  try {
    const cwd = process.cwd();
    const pdfPath = path.resolve(cwd, "public", "resume.pdf");

    // Check if file exists, if not generate it
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(pdfPath);
    } catch {
      await generateResumePdf();
      fileBuffer = await fs.readFile(pdfPath);
    }

    const cvData = await getCvData();
    const name = cvData.personal_info.name.replace(/\s+/g, "_") || "Laknidu_Thilakawardhana";
    const filename = `${name}_CV.pdf`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=60, s-maxage=300",
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
