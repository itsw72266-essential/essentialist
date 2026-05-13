import { NextResponse } from "next/server";

import { connectMongo, getMongoReadyState } from "@/fullstack/db/mongoose";

export async function GET() {
  const hasUri = Boolean(process.env.MONGODB_URI?.trim());
  let mongoState = "skipped";
  if (hasUri) {
    try {
      await connectMongo();
      const labels = [
        "disconnected",
        "connected",
        "connecting",
        "disconnecting",
      ];
      mongoState = labels[getMongoReadyState()] ?? String(getMongoReadyState());
    } catch (e) {
      mongoState = `error: ${e?.message || String(e)}`;
    }
  }

  return NextResponse.json({
    ok: true,
    layer: "next-fullstack",
    api: {
      user: "/api/next/user/*",
      cart: "/api/next/cart/*",
      address: "/api/next/address/*",
      category: "/api/next/category/*",
      subcategory: "/api/next/subcategory/*",
      product: "/api/next/product/*",
      brand: "/api/next/brand/*",
    },
    mongo: { configured: hasUri, state: mongoState },
  });
}
