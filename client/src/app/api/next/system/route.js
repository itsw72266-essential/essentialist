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
      user: "/api/next/user/* (incl. merge-guest-data)",
      cart: "/api/next/cart/*",
      address: "/api/next/address/*",
      category: "/api/next/category/*",
      subcategory: "/api/next/subcategory/*",
      product: "/api/next/product/*",
      brand: "/api/next/brand/*",
      order: "/api/next/order/*",
      payments:
        "/api/next/payments/mtn|orange|guest-mtn|guest-orange|webhook|status/[id]|order-status/[id]|guest-order-status/[id]|invoice|disburse",
      admin: "/api/next/admin/dashboard|summary|orders|guest-orders|…",
      ratings: "/api/next/ratings/*",
      reviews: "/api/next/reviews/*",
      blog: "/api/next/blog/*",
      file: "/api/next/file/upload",
      indexnow: "/api/next/indexnow/*",
      sitemapData: "GET /api/next/sitemap-data",
      userUploadAvatar: "/api/next/user/upload-avatar",
    },
    mongo: { configured: hasUri, state: mongoState },
  });
}
