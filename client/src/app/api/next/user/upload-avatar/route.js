import { NextResponse } from "next/server";

import { uploadAvatarForUserId } from "@/fullstack/controllers/user/uploadAvatarUser";
import { resolveAuthUserId } from "@/fullstack/lib/resolveAuthUserId";

export async function PUT(request) {
  const auth = resolveAuthUserId(request, { required: true });
  if (auth.error) {
    return NextResponse.json(auth.error.body, { status: auth.error.status });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("avatar");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "No image uploaded", error: true, success: false },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await uploadAvatarForUserId(auth.userId, buffer);
    return NextResponse.json({
      message: "Profile photo updated",
      success: true,
      error: false,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error?.message || String(error),
        error: true,
        success: false,
      },
      { status: 500 }
    );
  }
}
