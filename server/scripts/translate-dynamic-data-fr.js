import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/connectDB.js";
import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import BrandModel from "../models/brand.model.js";
import BlogModel from "../models/blog.model.js";

dotenv.config();

const TARGET_LOCALE = "fr";
const SOURCE_LOCALE = "en";
const DRY_RUN = process.argv.includes("--dry-run");

const TRANSLATION_API_URL = process.env.TRANSLATION_API_URL;
const TRANSLATION_API_KEY = process.env.TRANSLATION_API_KEY;
const MYMEMORY_API_URL = "https://api.mymemory.translated.net/get";

const collections = [
  {
    name: "categories",
    model: CategoryModel,
    fields: ["name"],
  },
  {
    name: "subcategories",
    model: SubCategoryModel,
    fields: ["name"],
  },
  {
    name: "brands",
    model: BrandModel,
    fields: ["name", "description"],
  },
  {
    name: "products",
    model: ProductModel,
    fields: ["name", "unit", "description", "specifications"],
  },
  {
    name: "blogs",
    model: BlogModel,
    fields: ["title", "excerpt", "content", "metaTitle", "metaDescription"],
    arrayFields: ["tags"],
  },
];

const isFilled = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
};

const chunkText = (text, maxLength = 450) => {
  const source = String(text);
  if (source.length <= maxLength) return [source];

  const chunks = [];
  let current = "";

  source.split(/(\s+)/).forEach((part) => {
    if ((current + part).length > maxLength && current.trim()) {
      chunks.push(current);
      current = part;
    } else {
      current += part;
    }
  });

  if (current.trim()) chunks.push(current);
  return chunks;
};

const translateWithLibreTranslate = async (text) => {
  const response = await fetch(TRANSLATION_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: SOURCE_LOCALE,
      target: TARGET_LOCALE,
      format: /<[^>]+>/.test(String(text)) ? "html" : "text",
      ...(TRANSLATION_API_KEY ? { api_key: TRANSLATION_API_KEY } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LibreTranslate failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.translatedText || text;
};

const translateWithMyMemory = async (text) => {
  const translatedChunks = [];

  for (const chunk of chunkText(text)) {
    const url = new URL(MYMEMORY_API_URL);
    url.searchParams.set("q", chunk);
    url.searchParams.set("langpair", `${SOURCE_LOCALE}|${TARGET_LOCALE}`);

    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`MyMemory translation failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    translatedChunks.push(data?.responseData?.translatedText || chunk);
  }

  return translatedChunks.join("");
};

const translateText = async (text) => {
  if (!isFilled(text)) return text;

  if (TRANSLATION_API_URL) {
    return translateWithLibreTranslate(text);
  }

  return translateWithMyMemory(text);
};

const translateArray = async (items = []) => {
  const translated = [];
  for (const item of items) {
    translated.push(await translateText(item));
  }
  return translated;
};

const backfillCollection = async ({ name, model, fields, arrayFields = [] }) => {
  let scanned = 0;
  let changed = 0;

  const cursor = model.find({}).cursor();
  for await (const doc of cursor) {
    scanned += 1;
    const updates = {};

    for (const field of fields) {
      if (!isFilled(doc[field]) || isFilled(doc.translations?.[TARGET_LOCALE]?.[field])) {
        continue;
      }
      updates[`translations.${TARGET_LOCALE}.${field}`] = await translateText(doc[field]);
    }

    for (const field of arrayFields) {
      if (!isFilled(doc[field]) || isFilled(doc.translations?.[TARGET_LOCALE]?.[field])) {
        continue;
      }
      updates[`translations.${TARGET_LOCALE}.${field}`] = await translateArray(doc[field]);
    }

    if (Object.keys(updates).length) {
      changed += 1;
      if (DRY_RUN) {
        console.log(`[dry-run] ${name}/${doc._id}:`, Object.keys(updates));
      } else {
        await model.updateOne({ _id: doc._id }, { $set: updates });
        console.log(`[updated] ${name}/${doc._id}:`, Object.keys(updates));
      }
    }
  }

  return { name, scanned, changed };
};

const main = async () => {
  console.log(
    TRANSLATION_API_URL
      ? "Using TRANSLATION_API_URL for database translations."
      : "TRANSLATION_API_URL is not set. Falling back to the public MyMemory API, which has usage limits."
  );

  await connectDB();

  for (const collection of collections) {
    const result = await backfillCollection(collection);
    console.log(
      `${result.name}: scanned ${result.scanned}, ${DRY_RUN ? "would update" : "updated"} ${result.changed}`
    );
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
