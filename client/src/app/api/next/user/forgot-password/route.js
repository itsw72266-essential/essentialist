import { NextResponse } from "next/server";

import { forgotPasswordUserAction } from "@/fullstack/controllers/user/forgotPasswordUser";

export async function PUT(request) {
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
    const result = await forgotPasswordUserAction(json);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("PUT /api/next/user/forgot-password", error);
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
