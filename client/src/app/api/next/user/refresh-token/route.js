import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { refreshTokenUserFromToken } from "@/fullstack/controllers/user/refreshTokenUser";

export async function POST(request) {
  const auth = request.headers.get("authorization");
  let token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    const jar = await cookies();
    token = jar.get("refreshToken")?.value?.trim() ?? "";
  }

  try {
    const result = await refreshTokenUserFromToken(token || null);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/next/user/refresh-token", error);
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
