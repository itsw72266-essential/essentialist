import { NextResponse } from "next/server";

import { registerUserAction } from "@/fullstack/controllers/user/registerUser";

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
    const result = await registerUserAction(json);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/next/user/register", error);
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
