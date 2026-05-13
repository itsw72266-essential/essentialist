import { NextResponse } from "next/server";

import { connectMongo } from "@/fullstack/db/mongoose";
import uploadImageClodinary from "@/fullstack/lib/uploadImageClodinary";
import { resolveAuthUserId } from "@/fullstack/lib/resolveAuthUserId";

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
