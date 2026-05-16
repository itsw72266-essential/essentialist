/**
 * English → French DB translations via Google Gemini.
 * English fields stay canonical; French is stored in translations.fr.* and merged on API read.
 * Requires GEMINI_API_KEY. UI i18n (JSON locales) is separate.
 */

import mongoose from "mongoose";

import ProductModel from "../models/product.model.js";
import BrandModel from "../models/brand.model.js";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import BlogModel from "../models/blog.model.js";
import { generateJsonWithFallback, isGeminiConfigured, GEMINI_MODEL } from "./gemini.js";

export { GEMINI_MODEL };

const LAZY_TRANSLATE_COOLDOWN_MS = 2 * 60 * 1000;
const lazyTranslateLastRun = new Map();
const MAX_STRING_CHARS = 12_000;

export const PRODUCT_TRANSLATION_FIELDS = [
  "name",
  "unit",
  "description",
  "specifications",
  "more_details",
];

export const BRAND_TRANSLATION_FIELDS = ["name", "description"];
export const CATEGORY_TRANSLATION_FIELDS = ["name"];
export const SUBCATEGORY_TRANSLATION_FIELDS = ["name"];
export const BLOG_TRANSLATION_FIELDS = [
  "title",
  "excerpt",
  "content",
  "tags",
  "metaTitle",
  "metaDescription",
];

export function isAutoTranslateEnabled() {
  return isGeminiConfigured();
}

const isFilled = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== undefined && value !== null;
};

function capValue(value) {
  if (typeof value === "string" && value.length > MAX_STRING_CHARS) {
    return value.slice(0, MAX_STRING_CHARS);
  }
  return value;
}

function pickTranslatableFields(doc, fields) {
  const payload = {};
  for (const field of fields) {
    if (isFilled(doc?.[field])) payload[field] = capValue(doc[field]);
  }
  return payload;
}

/**
 * True when English has content but French translation is missing for any field.
 */
export function needsFrenchSync(doc, fields, { sourceDoc } = {}) {
  if (!doc || !fields?.length) return false;
  const english = sourceDoc || doc;
  const fr = doc.translations?.fr;
  if (!fr || typeof fr !== "object") {
    return fields.some((field) => isFilled(english[field]));
  }
  return fields.some((field) => {
    if (!isFilled(english[field])) return false;
    return !isFilled(fr[field]);
  });
}

const TRANSLATION_SYSTEM = `You are a professional translator for Essentialist Makeup Store (cosmetics e-commerce in Cameroon).
Translate JSON values from English to French. Return ONLY valid JSON with the exact same keys and structure.
Do not translate JSON keys. Preserve HTML tags; translate only human-readable text inside HTML.
Do not translate brand names, product SKUs, or URLs unless they are plain English phrases.
For arrays of strings (e.g. tags), translate each element. Leave empty values unchanged.`;

function buildPrompt(payload) {
  return `${TRANSLATION_SYSTEM}

Input JSON:
${JSON.stringify(payload)}`;
}

async function translatePayloadToFrench(payload) {
  if (!isAutoTranslateEnabled() || !Object.keys(payload).length) return null;
  return generateJsonWithFallback(buildPrompt(payload), TRANSLATION_SYSTEM);
}

async function applyFrenchTranslation(model, id, fields, sourceDoc) {
  if (!mongoose.isValidObjectId(id)) return { updated: false };
  const payload = pickTranslatableFields(sourceDoc, fields);
  if (!Object.keys(payload).length) return { updated: false };

  const frPayload = await translatePayloadToFrench(payload);
  if (!frPayload || typeof frPayload !== "object") return { updated: false };

  const $set = {};
  for (const field of fields) {
    if (frPayload[field] !== undefined && isFilled(frPayload[field])) {
      $set[`translations.fr.${field}`] = frPayload[field];
    }
  }

  if (!Object.keys($set).length) return { updated: false };
  await model.updateOne({ _id: id }, { $set });
  return { updated: true };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fire-and-forget wrapper — never throws to HTTP handlers. */
export function scheduleAutoTranslate(task) {
  if (!isAutoTranslateEnabled()) return;
  void Promise.resolve()
    .then(task)
    .catch((err) => {
      console.error("[auto-translate]", err?.message || err);
    });
}

export function shouldRunLazyTranslate(entityKey) {
  const key = String(entityKey);
  const now = Date.now();
  const last = lazyTranslateLastRun.get(key) || 0;
  if (now - last < LAZY_TRANSLATE_COOLDOWN_MS) return false;
  lazyTranslateLastRun.set(key, now);
  return true;
}

export async function autoTranslateProduct(productId, sourceDoc) {
  const doc =
    sourceDoc ||
    (await ProductModel.findById(productId)
      .select(PRODUCT_TRANSLATION_FIELDS.join(" "))
      .lean());
  if (!doc) return { updated: false };
  return applyFrenchTranslation(
    ProductModel,
    productId,
    PRODUCT_TRANSLATION_FIELDS,
    doc,
  );
}

export async function autoTranslateBrand(brandId, sourceDoc) {
  const doc =
    sourceDoc ||
    (await BrandModel.findById(brandId)
      .select(BRAND_TRANSLATION_FIELDS.join(" "))
      .lean());
  if (!doc) return { updated: false };
  return applyFrenchTranslation(BrandModel, brandId, BRAND_TRANSLATION_FIELDS, doc);
}

export async function autoTranslateCategory(categoryId, sourceDoc) {
  const doc =
    sourceDoc ||
    (await CategoryModel.findById(categoryId).select("name translations").lean());
  if (!doc) return { updated: false };
  return applyFrenchTranslation(
    CategoryModel,
    categoryId,
    CATEGORY_TRANSLATION_FIELDS,
    doc,
  );
}

export async function autoTranslateSubCategory(subCategoryId, sourceDoc) {
  const doc =
    sourceDoc ||
    (await SubCategoryModel.findById(subCategoryId)
      .select("name translations")
      .lean());
  if (!doc) return { updated: false };
  return applyFrenchTranslation(
    SubCategoryModel,
    subCategoryId,
    SUBCATEGORY_TRANSLATION_FIELDS,
    doc,
  );
}

export async function autoTranslateBlog(blogId, sourceDoc) {
  const doc =
    sourceDoc ||
    (await BlogModel.findById(blogId)
      .select(BLOG_TRANSLATION_FIELDS.join(" "))
      .lean());
  if (!doc) return { updated: false };
  return applyFrenchTranslation(BlogModel, blogId, BLOG_TRANSLATION_FIELDS, doc);
}

const BACKFILL_ENTITIES = {
  products: {
    model: ProductModel,
    fields: PRODUCT_TRANSLATION_FIELDS,
    translate: autoTranslateProduct,
  },
  brands: {
    model: BrandModel,
    fields: BRAND_TRANSLATION_FIELDS,
    translate: autoTranslateBrand,
  },
  categories: {
    model: CategoryModel,
    fields: CATEGORY_TRANSLATION_FIELDS,
    translate: autoTranslateCategory,
  },
  subcategories: {
    model: SubCategoryModel,
    fields: SUBCATEGORY_TRANSLATION_FIELDS,
    translate: autoTranslateSubCategory,
  },
  blogs: {
    model: BlogModel,
    fields: BLOG_TRANSLATION_FIELDS,
    translate: autoTranslateBlog,
  },
};

/**
 * Count documents that still need French translations (for admin dashboard).
 */
export async function getFrenchTranslationStats() {
  const stats = {};

  for (const [key, { model, fields }] of Object.entries(BACKFILL_ENTITIES)) {
    const select = [...new Set([...fields, "translations"])].join(" ");
    const docs = await model.find({}).select(select).lean();
    const needsSync = docs.filter((doc) => needsFrenchSync(doc, fields)).length;
    stats[key] = { total: docs.length, needsSync, synced: docs.length - needsSync };
  }

  return {
    enabled: isAutoTranslateEnabled(),
    model: GEMINI_MODEL,
    entities: stats,
  };
}

/**
 * Persist French translations for existing DB rows (batch backfill).
 * Run via admin API (batched) or `npm run backfill:fr` locally for full catalog.
 */
export async function backfillFrenchTranslations({
  entities = Object.keys(BACKFILL_ENTITIES),
  batchSize = 25,
  delayMs = 400,
  onlyMissing = true,
} = {}) {
  if (!isAutoTranslateEnabled()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const normalizedEntities = entities.filter((key) => BACKFILL_ENTITIES[key]);
  const report = {
    enabled: true,
    model: GEMINI_MODEL,
    batchSize,
    onlyMissing,
    entities: {},
    hasMore: false,
  };

  for (const entityKey of normalizedEntities) {
    const { model, fields, translate } = BACKFILL_ENTITIES[entityKey];
    const select = [...new Set([...fields, "translations"])].join(" ");
    const entityReport = {
      scanned: 0,
      translated: 0,
      skipped: 0,
      failed: 0,
      remaining: 0,
    };

    const docs = await model.find({}).select(select).lean();
    const queue = onlyMissing
      ? docs.filter((doc) => needsFrenchSync(doc, fields))
      : docs;

    entityReport.remaining = queue.length;
    const batch = queue.slice(0, batchSize);

    for (const doc of batch) {
      entityReport.scanned++;
      try {
        const result = await translate(doc._id, doc);
        if (result?.updated) entityReport.translated++;
        else entityReport.skipped++;
      } catch (error) {
        entityReport.failed++;
        console.error(`[backfill:${entityKey}]`, doc._id, error?.message || error);
      }
      if (delayMs > 0) await sleep(delayMs);
    }

    entityReport.remaining = Math.max(0, queue.length - batch.length);
    if (entityReport.remaining > 0) report.hasMore = true;
    report.entities[entityKey] = entityReport;
  }

  return report;
}
