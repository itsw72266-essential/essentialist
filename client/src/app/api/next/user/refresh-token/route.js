import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { refreshTokenUserFromToken } from "@/fullstack/controllers/user/refreshTokenUser";
import {
  applyAuthTokensToResponse,
  stripAuthSecretsFromBodyForClient,
} from "@/fullstack/lib/authCookies";

export async function POST(request) {
  const auth = request.headers.get("authorization");
  let token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    const jar = await cookies();
    token = jar.get("refreshToken")?.value?.trim() ?? "";
  }

  try {
    const result = await refreshTokenUserFromToken(token || null);
    const bodyForClient = stripAuthSecretsFromBodyForClient(result.body);
    const res = NextResponse.json(bodyForClient, { status: result.status });
    if (
      result.status === 200 &&
      result.body?.success &&
      result.body?.data?.accessToken &&
      result.body?.data?.refreshToken
    ) {
      applyAuthTokensToResponse(res, {
        accessToken: result.body.data.accessToken,
        refreshToken: result.body.data.refreshToken,
      });
    }
    return res;
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
