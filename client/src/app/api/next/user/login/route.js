import { NextResponse } from "next/server";

import { loginUserAction } from "@/fullstack/controllers/user/loginUser";

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
    return NextResponse.json(result.body, { status: result.status });
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
