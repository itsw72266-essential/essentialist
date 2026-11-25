export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { uploadAvatarForUserId } from "@/fullstack/controllers/user/uploadAvatarUser";
import { resolveAuthUserId } from "@/fullstack/lib/resolveAuthUserId";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          message: "Only JPEG, PNG, WEBP, or AVIF image uploads are allowed",
          error: true,
          success: false,
        },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          message: "Image must be 5MB or smaller",
          error: true,
          success: false,
        },
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
