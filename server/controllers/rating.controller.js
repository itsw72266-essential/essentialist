import RatingModel from "../models/rating.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";
import { invalidateCacheNamespaces } from "../middleware/cache.middleware.js";

const RATING_CACHE_NAMESPACE = "ratings";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function isValidStep(val) {
  return (
    Number.isFinite(val) &&
    val >= 0.5 &&
    val <= 5 &&
    Math.abs(val * 2 - Math.round(val * 2)) < 1e-9
  );
}

function pickIdentity(req) {
  const userId = req.userId || null;
  const anonId =
    (req.query?.anonId || req.body?.anonId || req.headers["x-anon-id"] || "")
      .toString()
      .trim() || null;
  return { userId, anonId };
}

function parsePagination(req) {
  const page = Math.max(parseInt(req.query?.page, 10) || 1, 1);
  const limitRaw = parseInt(req.query?.limit, 10);
  const limit = Math.min(Math.max(limitRaw || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const sort =
    req.query?.sort === "oldest"
      ? { createdAt: 1, _id: 1 }
      : { createdAt: -1, _id: -1 };

  return { page, limit, skip, sort };
}

export const upsertRating = async (req, res) => {
  try {
    const { userId, anonId } = pickIdentity(req);
    const { productId, value } = req.body || {};

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid productId" });
    }
    if (!isValidStep(value)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "value must be between 0.5 and 5 in 0.5 steps",
      });
    }
    if (!userId && !anonId) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Missing identity" });
    }

    const product = await ProductModel.findById(productId).select("_id").lean();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Product not found" });
    }

    const query = { product: productId, ...(userId ? { user: userId } : { anonId }) };
    const update = {
      $set: { value, user: userId || null, anonId: userId ? null : anonId },
    };

    const updated = await RatingModel.findOneAndUpdate(query, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }).lean();

    const { average, count } = await aggregateForProduct(productId);
    await invalidateCacheNamespaces(RATING_CACHE_NAMESPACE);

    return res.json({
      success: true,
      error: false,
      message: "Rating saved",
      data: { myRating: updated.value, average, count },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, error: true, message: "Duplicate rating conflict" });
    }
    return res
      .status(500)
      .json({ success: false, error: true, message: err.message || "Server error" });
  }
};

export const getRatingsForProduct = async (req, res) => {
  try {
    const { userId, anonId } = pickIdentity(req);
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid productId" });
    }

    const [agg, mine] = await Promise.all([
      aggregateForProduct(productId),
      userId || anonId
        ? RatingModel.findOne({
            product: productId,
            ...(userId ? { user: userId } : { anonId }),
          })
            .select("value")
            .lean()
        : null,
    ]);

    const myRating = mine ? mine.value : null;

    return res.json({
      success: true,
      error: false,
      data: { average: agg.average, count: agg.count, myRating },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: true, message: err.message || "Server error" });
  }
};

export const deleteMyRating = async (req, res) => {
  try {
    const { userId, anonId } = pickIdentity(req);
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid productId" });
    }
    if (!userId && !anonId) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Missing identity" });
    }

    await RatingModel.deleteOne({
      product: productId,
      ...(userId ? { user: userId } : { anonId }),
    });

    const { average, count } = await aggregateForProduct(productId);
    await invalidateCacheNamespaces(RATING_CACHE_NAMESPACE);

    return res.json({
      success: true,
      error: false,
      message: "Rating removed",
      data: { average, count, myRating: null },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: true, message: err.message || "Server error" });
  }
};

/**
 * NEW: Paginated list of ratings for a product (so you don’t load all at once)
 * Query: ?page=1&limit=20&sort=newest|oldest
 */
export const getRatingsListForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid productId" });
    }

    const { page, limit, skip, sort } = parsePagination(req);

    const [items, total] = await Promise.all([
      RatingModel.find({ product: productId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("value createdAt")
        .lean(),
      RatingModel.countDocuments({ product: productId }),
    ]);

    return res.json({
      success: true,
      error: false,
      data: {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: true, message: err.message || "Server error" });
  }
};

async function aggregateForProduct(productId) {
  const agg = await RatingModel.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        count: { $sum: 1 },
        average: { $avg: "$value" },
      },
    },
    { $project: { _id: 0, count: 1, average: 1 } },
  ]);

  if (!agg.length) return { average: 0, count: 0 };

  return {
    average: Number(agg[0].average.toFixed(2)),
    count: agg[0].count,
  };
}