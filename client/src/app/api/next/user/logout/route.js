import { NextResponse } from "next/server";

import { logoutUserAction } from "@/fullstack/controllers/user/logoutUser";

export async function GET(request) {
  try {
    const result = await logoutUserAction(request);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("GET /api/next/user/logout", error);
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
