/**
 * Backfill unique slug fields for products, categories, and subcategories.
 *
 * Usage (from client/):
 *   pnpm backfill:slugs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const { connectMongo } = await import("../src/fullstack/db/mongoose.js");
const ProductModel = (await import("../src/fullstack/models/product.model.js")).default;
const CategoryModel = (await import("../src/fullstack/models/category.model.js")).default;
const SubCategoryModel = (await import("../src/fullstack/models/subCategory.model.js")).default;
const { backfillSlugsForModel } = await import("../src/fullstack/lib/catalogSlugDb.js");

async function main() {
  await connectMongo();

  const [products, categories, subcategories] = await Promise.all([
    ProductModel.find().select("name slug").lean(),
    CategoryModel.find().select("name slug").lean(),
    SubCategoryModel.find().select("name slug").lean(),
  ]);

  const productUpdates = await backfillSlugsForModel(ProductModel, products);
  const categoryUpdates = await backfillSlugsForModel(CategoryModel, categories);
  const subCategoryUpdates = await backfillSlugsForModel(
    SubCategoryModel,
    subcategories,
  );

  console.log(
    JSON.stringify(
      {
        products: { total: products.length, updated: productUpdates },
        categories: { total: categories.length, updated: categoryUpdates },
        subcategories: {
          total: subcategories.length,
          updated: subCategoryUpdates,
        },
      },
      null,
      2,
    ),
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
