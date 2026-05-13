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
      "POST /api/next/user/login",
      "POST /api/next/user/refresh-token",
      "GET /api/next/user/logout",
      "GET /api/next/user/user-details",
      "POST /api/next/user/verify-email",
      "PUT /api/next/user/forgot-password",
      "PUT /api/next/user/verify-forgot-password-otp",
      "PUT /api/next/user/reset-password",
      "PUT /api/next/user/update-user",
    ],
    mongo: { configured: hasUri, state: mongoState },
  });
}
