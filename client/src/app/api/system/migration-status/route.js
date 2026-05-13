import { NextResponse } from "next/server";

/**
 * Lightweight health endpoint for the Next.js runtime during full-stack migration.
 * Does not call the Express server (avoids coupling / cold-start noise).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    nextRuntime: true,
    migration: "incremental",
    legacyApi: "Express app in server/ remains canonical",
  });
}
