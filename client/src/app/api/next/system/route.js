import { NextResponse } from "next/server";

import { connectMongo, getMongoReadyState } from "@/fullstack/db/mongoose";

export async function GET() {
  const hasUri = Boolean(process.env.MONGODB_URI?.trim());
  let mongoState = "skipped";
  if (hasUri) {
    try {
      await connectMongo();
      const labels = [
        "disconnected",
        "connected",
        "connecting",
        "disconnecting",
      ];
      mongoState = labels[getMongoReadyState()] ?? String(getMongoReadyState());
    } catch (e) {
      mongoState = `error: ${e?.message || String(e)}`;
    }
  }

  return NextResponse.json({
    ok: true,
    layer: "next-fullstack",
    routes: [
      "GET /api/next/system",
      "POST /api/next/user/register",
    ],
    mongo: { configured: hasUri, state: mongoState },
  });
}
