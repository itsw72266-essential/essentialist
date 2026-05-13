import { NextResponse } from "next/server";

import { getBrandDetailsController } from "@/fullstack/controllers/brand/handlers";
import { invokeController } from "@/fullstack/lib/invokeController";

export async function GET(request, context) {
  const params = await context.params;
  try {
    const result = await invokeController(getBrandDetailsController, request, {
      body: {},
      routeParams: { identifier: params.identifier },
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (e) {
    console.error("GET /api/next/brand/[identifier]", e);
    return NextResponse.json(
      { message: e?.message || "Server error", error: true, success: false },
      { status: 500 }
    );
  }
}
