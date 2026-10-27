import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const livenessOnly = searchParams.get("liveness") === "true";

  // Liveness check: simple ping to verify process is alive
  if (livenessOnly) {
    return NextResponse.json(
      {
        status: "alive",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  // Readiness check: verify database connectivity
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        uptime: process.uptime(),
        database: {
          status: "connected",
          latencyMs,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database check failed";
    console.error("[HealthCheck Error] Readiness probe failed:", errorMsg);

    return NextResponse.json(
      {
        status: "unhealthy",
        uptime: process.uptime(),
        database: {
          status: "disconnected",
          error: process.env.NODE_ENV === "production" ? "Database unavailable" : errorMsg,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
