/**
 * Fire-and-forget English → French DB translations via Google Gemini.
 * Requires GEMINI_API_KEY. UI i18n (JSON locales) is separate.
 */

import mongoose from "mongoose";

import ProductModel from "../models/product.model.js";
import BrandModel from "../models/brand.model.js";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import BlogModel from "../models/blog.model.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

const LAZY_TRANSLATE_COOLDOWN_MS = 2 * 60 * 1000;
const lazyTranslateLastRun = new Map();

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
  return Boolean(GEMINI_API_KEY);
}

const isFilled = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== undefined && value !== null;
};

function pickTranslatableFields(doc, fields) {
  const payload = {};
  for (const field of fields) {
    if (isFilled(doc?.[field])) payload[field] = doc[field];
  }
  return payload;
}

/**
 * True when English has content but French translation is missing/stale for any field.
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

function buildPrompt(payload) {
  return `You are a professional translator for Essentialist Makeup Store (cosmetics e-commerce in Cameroon).
Translate the JSON values from English to French.

Rules:
- Return ONLY valid JSON with the exact same keys and structure as the input.
- Do not translate JSON keys.
- Preserve HTML tags and attributes; translate only human-readable text inside HTML.
- Do not translate brand names, product SKUs, or URLs unless they are plain English phrases.
- Keep numbers, prices, and units as appropriate for French readers.
- For arrays of strings (e.g. tags), translate each string element.
- For empty strings or empty objects, return them unchanged.

Input JSON:
${JSON.stringify(payload)}`;
}

async function translatePayloadToFrench(payload) {
  if (!isAutoTranslateEnabled() || !Object.keys(payload).length) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL,
  )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(payload) }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `Gemini translate failed (${response.status}): ${errText.slice(0, 200)}`,
    );
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("") || "";

  if (!text.trim()) return null;

  const parsed = JSON.parse(text);
  return parsed && typeof parsed === "object" ? parsed : null;
}

async function applyFrenchTranslation(model, id, fields, sourceDoc) {
  if (!mongoose.isValidObjectId(id)) return;
  const payload = pickTranslatableFields(sourceDoc, fields);
  if (!Object.keys(payload).length) return;

  const frPayload = await translatePayloadToFrench(payload);
  if (!frPayload || typeof frPayload !== "object") return;

  const $set = {};
  for (const field of fields) {
    if (frPayload[field] !== undefined && isFilled(frPayload[field])) {
      $set[`translations.fr.${field}`] = frPayload[field];
    }
  }

  if (!Object.keys($set).length) return;
  await model.updateOne({ _id: id }, { $set });
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
  if (!doc) return;
  await applyFrenchTranslation(ProductModel, productId, PRODUCT_TRANSLATION_FIELDS, doc);
}

export async function autoTranslateBrand(brandId, sourceDoc) {
  const doc =
    sourceDoc ||
    (await BrandModel.findById(brandId)
      .select(BRAND_TRANSLATION_FIELDS.join(" "))
      .lean());
  if (!doc) return;
  await applyFrenchTranslation(BrandModel, brandId, BRAND_TRANSLATION_FIELDS, doc);
}

export async function autoTranslateCategory(categoryId, sourceDoc) {
  const doc =
    sourceDoc ||
    (await CategoryModel.findById(categoryId).select("name translations").lean());
  if (!doc) return;
  await applyFrenchTranslation(
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
  if (!doc) return;
  await applyFrenchTranslation(
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
  if (!doc) return;
  await applyFrenchTranslation(BlogModel, blogId, BLOG_TRANSLATION_FIELDS, doc);
}
