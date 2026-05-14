import { NextResponse } from "next/server";

/**
 * Lightweight health endpoint for the Next.js runtime during full-stack migration.
 * Does not call the Express server (avoids coupling / cold-start noise).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    nextRuntime: true,
    migration: "next_api_complete",
    runtimeApi: "Route Handlers under /api/next/* (see docs/next-fullstack-migration.txt)",
    express: "Optional: server/ for jobs or LEGACY_EXPRESS_HEALTH_PROBE on /api/legacy/health",
  });
}
