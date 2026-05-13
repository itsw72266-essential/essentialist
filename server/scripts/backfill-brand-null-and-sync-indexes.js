// server/scripts/backfill-brand-null-and-sync-indexes.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";
import BrandModel from "../models/brand.model.js";

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || ".env"
});

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const DB_NAME = process.env.MONGODB_DB_NAME || process.env.DB_NAME || undefined;

if (!MONGODB_URI) {
  console.error(
    "❌  Missing MongoDB connection string. Set MONGODB_URI (or DATABASE_URL) in your environment."
  );
  process.exit(1);
}

async function main() {
  try {
    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(MONGODB_URI, DB_NAME ? { dbName: DB_NAME } : undefined);

    console.log("🧹 Backfilling products with missing `brand` field…");
    const backfillResult = await ProductModel.updateMany(
      { brand: { $exists: false } },
      { $set: { brand: null } }
    );

    console.log(
      `   ↳ Matched ${backfillResult.matchedCount ?? backfillResult.n} product(s),` +
        ` updated ${backfillResult.modifiedCount ?? backfillResult.nModified}.`
    );

    console.log("🔄 Syncing product indexes…");
    await ProductModel.syncIndexes();
    console.log("   ↳ Product indexes synced.");

    console.log("🔄 Syncing brand indexes…");
    await BrandModel.syncIndexes();
    console.log("   ↳ Brand indexes synced.");

    console.log("✅ Backfill and index synchronization completed successfully.");
  } catch (error) {
    console.error("❌ An error occurred during backfill/index sync:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔒 MongoDB connection closed.");
  }
}

main();