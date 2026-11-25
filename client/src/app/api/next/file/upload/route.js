export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { connectMongo } from "@/fullstack/db/mongoose";
import uploadImageClodinary from "@/fullstack/lib/uploadImageClodinary";
import { resolveAuthUserId } from "@/fullstack/lib/resolveAuthUserId";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  const auth = resolveAuthUserId(request, { required: true });
  if (auth.error) {
    return NextResponse.json(auth.error.body, { status: auth.error.status });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "image file is required", error: true, success: false },
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
    await connectMongo();
    const uploadImage = await uploadImageClodinary({ buffer });
    return NextResponse.json({
      message: "Upload done",
      data: uploadImage,
      success: true,
      error: false,
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
