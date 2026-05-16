import SubCategoryModel from "../../models/subCategory.model.js";
import { invalidateCacheNamespaces } from "../../lib/cacheNoop.js";
import {
  buildVaryHeader,
  getRequestLocale,
  localizeDocuments,
  sanitizeTranslations,
} from "../../lib/localization.js";
import {
  autoTranslateSubCategory,
  scheduleAutoTranslate,
} from "../../utils/auto-translate.js";

const SUBCATEGORY_CACHE_NAMESPACES = ["subcategories:list"];
const PRODUCT_CACHE_NAMESPACES = [
  "products:list",
  "products:filter-meta",
  "products:by-category",
  "products:category-sub",
  "products:details",
  "products:search",
  "products:slug"
];

// const DEFAULT_CACHE = { maxAge: 180, sMaxAge: 900 };

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

export const AddSubCategoryController = async (request, response) => {
  try {
    const { name, image, category, translations } = request.body;

    if (!name || !image || !category?.[0]) {
      return response.status(400).json({
        message: "Provide name, image, category",
        error: true,
        success: false
      });
    }

    const payload = {
      name,
      image,
      category,
      translations: sanitizeTranslations(translations, ["name"])
    };

    const createSubCategory = new SubCategoryModel(payload);
    const save = await createSubCategory.save();

    await safeInvalidateCacheNamespaces([
      ...SUBCATEGORY_CACHE_NAMESPACES,
      ...PRODUCT_CACHE_NAMESPACES
    ]);

    scheduleAutoTranslate(() =>
      autoTranslateSubCategory(save._id, save.toObject?.() ?? save),
    );

    return response.json({
      message: "Sub Category Created",
      data: save,
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

export const getSubCategoryController = async (request, response) => {
  try {
    const locale = getRequestLocale(request);
    const data = await SubCategoryModel.find()
      .sort({ createdAt: -1 })
      .populate("category")
      .lean();

    setCacheHeaders(response, DEFAULT_CACHE);

    return response.json({
      message: "Sub Category data",
      data: localizeDocuments(data, ["name"], locale).map((subCategory) => ({
        ...subCategory,
        category: localizeDocuments(subCategory.category, ["name"], locale),
      })),
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

export const updateSubCategoryController = async (request, response) => {
  try {
    const { _id, name, image, category, translations } = request.body;
    const updatePayload = {
      name,
      image,
      category
    };

    if (translations !== undefined) {
      updatePayload.translations = sanitizeTranslations(translations, ["name"]);
    }

    const checkSub = await SubCategoryModel.findById(_id);

    if (!checkSub) {
      return response.status(400).json({
        message: "Check your _id",
        error: true,
        success: false
      });
    }

    const updateSubCategory = await SubCategoryModel.findByIdAndUpdate(
      _id,
      updatePayload,
      { new: true }
    );

    await safeInvalidateCacheNamespaces([
      ...SUBCATEGORY_CACHE_NAMESPACES,
      ...PRODUCT_CACHE_NAMESPACES
    ]);

    scheduleAutoTranslate(() => autoTranslateSubCategory(_id));

    return response.json({
      message: "Updated Successfully",
      data: updateSubCategory,
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

export const deleteSubCategoryController = async (request, response) => {
  try {
    const { _id } = request.body;

    const deleteSub = await SubCategoryModel.findByIdAndDelete(_id);

    await safeInvalidateCacheNamespaces([
      ...SUBCATEGORY_CACHE_NAMESPACES,
      ...PRODUCT_CACHE_NAMESPACES
    ]);

    return response.json({
      message: "Delete successfully",
      data: deleteSub,
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
