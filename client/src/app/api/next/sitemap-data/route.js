import { NextResponse } from "next/server";

import { connectMongo } from "@/fullstack/db/mongoose";
import BrandModel from "@/fullstack/models/brand.model.js";
import CategoryModel from "@/fullstack/models/category.model.js";
import ProductModel from "@/fullstack/models/product.model.js";
import SubCategoryModel from "@/fullstack/models/subCategory.model.js";
import BlogModel from "@/fullstack/models/blog.model.js";

export async function GET() {
  try {
    await connectMongo();
    const [categories, subcategories, products, blogs, brands] =
      await Promise.all([
        CategoryModel.find().select("name updatedAt image").lean(),
        SubCategoryModel.find()
          .select("name updatedAt category")
          .populate("category", "name _id")
          .lean(),
        ProductModel.find({ publish: true })
          .select("name updatedAt image")
          .lean(),
        BlogModel.find({ status: "published" })
          .select("slug updatedAt coverImage")
          .lean(),
        BrandModel.find({ isActive: { $ne: false } })
          .select("name slug updatedAt")
          .lean(),
      ]);

    return NextResponse.json({
      categories,
      subcategories,
      products,
      blogs,
      brands,
    });
  } catch (error) {
    console.error("[sitemap-data]", error);
    return NextResponse.json(
      { error: "Failed to fetch sitemap data" },
      { status: 500 },
    );
  }
}
