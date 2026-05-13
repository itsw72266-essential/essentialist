import { NextResponse } from "next/server";

import { connectMongo } from "@/fullstack/db/mongoose";
import CategoryModel from "@/fullstack/models/category.model.js";
import ProductModel from "@/fullstack/models/product.model.js";
import BlogModel from "@/fullstack/models/blog.model.js";

export async function GET() {
  try {
    await connectMongo();
    const [categories, products, blogs] = await Promise.all([
      CategoryModel.find().select("name updatedAt image").lean(),
      ProductModel.find({ publish: true })
        .select("name updatedAt image")
        .lean(),
      BlogModel.find({ status: "published" })
        .select("slug updatedAt coverImage")
        .lean(),
    ]);

    return NextResponse.json({ categories, products, blogs });
  } catch (error) {
    console.error("[sitemap-data]", error);
    return NextResponse.json(
      { error: "Failed to fetch sitemap data" },
      { status: 500 },
    );
  }
}
