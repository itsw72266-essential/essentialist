//D:\EssentialistMakeupStore\server\controllers\brand.controller.js
import mongoose from "mongoose";
import BrandModel from "../../models/brand.model.js";
import ProductModel from "../../models/product.model.js";
import { invalidateCacheNamespaces } from "../../lib/cacheNoop.js";
import {
  buildVaryHeader,
  getRequestLocale,
  localizeDocument,
  localizeDocuments,
  sanitizeTranslations,
} from "../../lib/localization.js";

const BRAND_CACHE_NAMESPACES = ["brands:list", "brands:details"];
const PRODUCT_CACHE_NAMESPACES = [
  "products:list",
  "products:filter-meta",
  "products:search",
  "products:by-category",
  "products:category-sub",
  "products:details",
  "products:ids",
  "products:slug"
];

// const DEFAULT_CACHE = { maxAge: 120, sMaxAge: 600 };

//cache for a month
const DEFAULT_CACHE = { maxAge: 2592000, sMaxAge: 2592000 };

const setCacheHeaders = (res, { maxAge, sMaxAge }) => {
  res.set("Cache-Control", `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);
  res.set("Vary", buildVaryHeader());
};

const safeInvalidateCacheNamespaces = async (namespaces) => {
  try {
    await invalidateCacheNamespaces(namespaces);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};

const slugify = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isObjectIdValid = (value) => mongoose.Types.ObjectId.isValid(value);

export const createBrandController = async (request, response) => {
  try {
    const {
      name,
      description = "",
      logo = "",
      isActive = true,
      isFeatured = false,
      translations
    } = request.body;

    if (!name) {
      return response.status(400).json({
        message: "Brand name is required",
        error: true,
        success: false
      });
    }

    const slug = slugify(name);

    const existingBrand = await BrandModel.findOne({
      $or: [{ name }, { slug }]
    });

    if (existingBrand) {
      return response.status(400).json({
        message: "Brand with the same name already exists",
        error: true,
        success: false
      });
    }

    const brand = await BrandModel.create({
      name,
      slug,
      description,
      translations: sanitizeTranslations(translations, ["name", "description"]),
      logo,
      isActive,
      isFeatured
    });

    await safeInvalidateCacheNamespaces([...BRAND_CACHE_NAMESPACES, ...PRODUCT_CACHE_NAMESPACES]);

    return response.json({
      message: "Brand created successfully",
      data: brand,
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const getBrandsController = async (request, response) => {
  try {
    const locale = getRequestLocale(request);
    const {
      page = 1,
      limit = 50,
      search = "",
      onlyActive = false,
      sort = "nameAsc"
    } = request.query;

    const numericPage = Math.max(Number(page) || 1, 1);
    const numericLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);

    const query = {};
    if (onlyActive === "true") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { slug: new RegExp(search, "i") }
      ];
    }

    const sortMap = {
      nameAsc: { name: 1 },
      nameDesc: { name: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      featured: { isFeatured: -1, name: 1 }
    };

    const sortOption = sortMap[sort] || sortMap.nameAsc;
    const skip = (numericPage - 1) * numericLimit;

    const [data, totalCount] = await Promise.all([
      BrandModel.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      BrandModel.countDocuments(query)
    ]);

    setCacheHeaders(response, DEFAULT_CACHE);

    return response.json({
      message: "Brand list",
      data: localizeDocuments(data, ["name", "description"], locale),
      page: numericPage,
      limit: numericLimit,
      totalCount,
      totalPages: Math.ceil(totalCount / numericLimit),
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const getBrandDetailsController = async (request, response) => {
  try {
    const locale = getRequestLocale(request);
    const { identifier } = request.params;

    if (!identifier) {
      return response.status(400).json({
        message: "Brand identifier (id or slug) is required",
        error: true,
        success: false
      });
    }

    const query = isObjectIdValid(identifier)
      ? { _id: new mongoose.Types.ObjectId(identifier) }
      : { slug: identifier };

    const brand = await BrandModel.findOne(query).lean();

    if (!brand) {
      return response.status(404).json({
        message: "Brand not found",
        error: true,
        success: false
      });
    }

    setCacheHeaders(response, DEFAULT_CACHE);

    return response.json({
      message: "Brand details",
      data: localizeDocument(brand, ["name", "description"], locale),
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const updateBrandController = async (request, response) => {
  try {
    const { id } = request.params;

    if (!id || !isObjectIdValid(id)) {
      return response.status(400).json({
        message: "Valid brand id is required",
        error: true,
        success: false
      });
    }

    const brand = await BrandModel.findById(id);

    if (!brand) {
      return response.status(404).json({
        message: "Brand not found",
        error: true,
        success: false
      });
    }

    const { name, description, logo, isActive, isFeatured, translations } = request.body;

    if (typeof name === "string" && name.trim() && name !== brand.name) {
      brand.name = name.trim();
      brand.slug = slugify(brand.name);
    }

    if (typeof description === "string") {
      brand.description = description;
    }

    if (typeof logo === "string") {
      brand.logo = logo;
    }

    if (typeof isActive === "boolean") {
      brand.isActive = isActive;
    }

    if (typeof isFeatured === "boolean") {
      brand.isFeatured = isFeatured;
    }

    if (translations !== undefined) {
      brand.translations = sanitizeTranslations(translations, ["name", "description"]);
    }

    await brand.save();

    await safeInvalidateCacheNamespaces([...BRAND_CACHE_NAMESPACES, ...PRODUCT_CACHE_NAMESPACES]);

    return response.json({
      message: "Brand updated successfully",
      data: brand,
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const deleteBrandController = async (request, response) => {
  try {
    const { id } = request.params;

    if (!id || !isObjectIdValid(id)) {
      return response.status(400).json({
        message: "Valid brand id is required",
        error: true,
        success: false
      });
    }

    const productCount = await ProductModel.countDocuments({ brand: id });

    if (productCount > 0) {
      return response.status(400).json({
        message:
          "Brand is used by existing products. Reassign or remove those products before deleting.",
        error: true,
        success: false
      });
    }

    const deletion = await BrandModel.findByIdAndDelete(id);

    if (!deletion) {
      return response.status(404).json({
        message: "Brand not found",
        error: true,
        success: false
      });
    }

    await safeInvalidateCacheNamespaces([...BRAND_CACHE_NAMESPACES, ...PRODUCT_CACHE_NAMESPACES]);

    return response.json({
      message: "Brand deleted successfully",
      data: deletion,
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};
