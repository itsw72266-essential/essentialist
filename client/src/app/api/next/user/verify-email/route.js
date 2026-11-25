import { NextResponse } from "next/server";

import { verifyEmailUserAction } from "@/fullstack/controllers/user/verifyEmailUser";

export async function POST(request) {
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
    const result = await verifyEmailUserAction(json);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/next/user/verify-email", error);
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
