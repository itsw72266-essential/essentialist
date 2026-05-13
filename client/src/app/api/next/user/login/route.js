import { NextResponse } from "next/server";

import { loginUserAction } from "@/fullstack/controllers/user/loginUser";
import {
  applyAuthTokensToResponse,
  stripAuthSecretsFromBodyForClient,
} from "@/fullstack/lib/authCookies";

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
    const result = await loginUserAction(json);
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
    console.error("POST /api/next/user/login", error);
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
