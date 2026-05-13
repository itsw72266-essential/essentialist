import { NextResponse } from "next/server";

import { logoutUserAction } from "@/fullstack/controllers/user/logoutUser";
import { clearAuthCookiesOnResponse } from "@/fullstack/lib/authCookies";

export async function GET(request) {
  try {
    const result = await logoutUserAction(request);
    const res = NextResponse.json(result.body, { status: result.status });
    clearAuthCookiesOnResponse(res);
    return res;
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
