import { NextResponse } from "next/server";

import { userDetailsAction } from "@/fullstack/controllers/user/userDetailsUser";

export async function GET(request) {
  try {
    const result = await userDetailsAction(request);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("GET /api/next/user/user-details", error);
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
