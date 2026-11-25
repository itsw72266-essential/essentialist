import { NextResponse } from "next/server";

import { resetPasswordUserAction } from "@/fullstack/controllers/user/resetPasswordUser";
import { enforceRateLimit } from "@/fullstack/lib/rateLimiterMemory";

export async function PUT(request) {
  const limited = await enforceRateLimit("auth", request);
  if (limited) {
    return NextResponse.json(limited.body, { status: limited.status });
  }

  let json;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body", error: true, success: false },
      { status: 400 }
    );
  }

  try {
    const result = await resetPasswordUserAction(json);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("PUT /api/next/user/reset-password", error);
    return NextResponse.json(
      {
        message: error?.message || "Server error",
        error: true,
        success: false,
      },
      { status: 500 }
    );
  }
}
