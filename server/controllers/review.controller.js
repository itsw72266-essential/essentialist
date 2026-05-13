// import mongoose from "mongoose";
// import crypto from "crypto";
// import ReviewModel from "../models/review.model.js";
// import ReviewCommentModel from "../models/reviewComment.model.js";
// import ProductModel from "../models/product.model.js";
// import RatingModel from "../models/rating.model.js";
// import UserModel from "../models/user.model.js";

// const REVIEW_TOKEN_HEADER = "x-review-token";
// const SUBJECT_TYPES = [
//   "product",
//   "customer_service",
//   "environment",
//   "shipping",
//   "website",
//   "other",
// ];

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// function isValidStep(val) {
//   return (
//     Number.isFinite(val) &&
//     val >= 0.5 &&
//     val <= 5 &&
//     Math.abs(val * 2 - Math.round(val * 2)) < 1e-9
//   );
// }

// function sanitizeHtml(html = "") {
//   if (!html) return "";
//   return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
// }

// function hashToken(token) {
//   return crypto.createHash("sha256").update(token).digest("hex");
// }

// function generateGuestToken() {
//   return crypto.randomBytes(24).toString("hex");
// }

// function normalizeTags(input) {
//   if (!input) return [];
//   const list = Array.isArray(input)
//     ? input
//     : String(input)
//         .split(",")
//         .map((tag) => tag.trim());
//   return [...new Set(list.filter(Boolean))].slice(0, 5);
// }

// async function ensureProduct(productId) {
//   if (!mongoose.isValidObjectId(productId)) {
//     throw new Error("Invalid productId");
//   }
//   const product = await ProductModel.findById(productId).select("_id name");
//   if (!product) throw new Error("Product not found");
//   return product;
// }

// async function refreshProductReviewStats(productId) {
//   if (!productId) return { average: 0, count: 0 };
//   const [stats] = await ReviewModel.aggregate([
//     {
//       $match: {
//         product: new mongoose.Types.ObjectId(productId),
//         subjectType: "product",
//         status: "published",
//       },
//     },
//     {
//       $group: {
//         _id: "$product",
//         average: { $avg: "$rating" },
//         count: { $sum: 1 },
//       },
//     },
//   ]);
//   await ProductModel.findByIdAndUpdate(productId, {
//     $set: {
//       reviewsAverage: stats?.average || 0,
//       reviewsCount: stats?.count || 0,
//     },
//   });
//   return {
//     average: Number((stats?.average || 0).toFixed(2)),
//     count: stats?.count || 0,
//   };
// }

// function projectReview(doc, viewerId) {
//   if (!doc) return null;
//   const owned =
//     viewerId && doc.user ? String(doc.user) === String(viewerId) : false;

//   return {
//     _id: doc._id,
//     product: doc.product
//       ? {
//         _id: doc.product._id || doc.product,
//         name: doc.product.name,
//         slug: doc.product.slug,
//       }
//       : null,
//     subjectType: doc.subjectType,
//     experienceTags: doc.experienceTags || [],
//     locationContext: doc.locationContext || "",
//     rating: doc.rating,
//     title: doc.title,
//     comment: doc.comment,
//     contentHtml: doc.contentHtml,
//     authorName: doc.authorName,
//     authorEmail: doc.authorEmail,
//     authorAvatar: doc.authorAvatar,
//     authorType: doc.authorType,
//     isVerifiedPurchase: doc.isVerifiedPurchase,
//     status: doc.status,
//     createdAt: doc.createdAt,
//     updatedAt: doc.updatedAt,
//     commentsCount: doc.commentsCount || 0,
//     viewerCanEdit: owned,
//     viewerCanDelete: owned,
//   };
// }

// function projectComment(doc, viewerId, reviewOwnerId) {
//   if (!doc) return null;
//   const owned =
//     viewerId && doc.user ? String(doc.user) === String(viewerId) : false;
//   const reviewerIsOwner =
//     viewerId && reviewOwnerId
//       ? String(viewerId) === String(reviewOwnerId)
//       : false;

//   return {
//     _id: doc._id,
//     review: doc.review,
//     body: doc.body,
//     authorName: doc.authorName,
//     authorType: doc.authorType,
//     status: doc.status,
//     createdAt: doc.createdAt,
//     viewerCanDelete: owned || reviewerIsOwner,
//   };
// }

// // GET /api/reviews/public?subjectType=customer_service&limit=10...
// export const listReviews = async (req, res) => {
//   try {
//     const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
//     const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
//     const minRating =
//       req.query.minRating !== undefined ? Number(req.query.minRating) : null;
//     const verifiedOnly = req.query.verifiedOnly === "true";
//     const includeHidden = req.query.status === "all" && req.userId;
//     const requestedSubject = req.query.subjectType;
//     const productId = req.params.productId || req.query.productId || null;

//     const subjectType =
//       SUBJECT_TYPES.includes(requestedSubject) && requestedSubject
//         ? requestedSubject
//         : productId
//         ? "product"
//         : "website";

//     if (productId && !mongoose.isValidObjectId(productId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid productId" });
//     }

//     const query = { subjectType };
//     if (productId) {
//       query.product = productId;
//     }
//     if (!includeHidden) {
//       query.status = "published";
//     }
//     if (minRating) {
//       query.rating = { $gte: minRating };
//     }
//     if (verifiedOnly) {
//       query.isVerifiedPurchase = true;
//     }

//     const [items, total, stats] = await Promise.all([
//       ReviewModel.find(query)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .select(
//           "product user subjectType experienceTags locationContext rating title comment contentHtml authorName authorEmail authorAvatar authorType isVerifiedPurchase status createdAt updatedAt commentsCount"
//         )
//         .populate("product", "name slug")
//         .lean(),
//       ReviewModel.countDocuments(query),
//       subjectType === "product" && productId
//         ? ReviewModel.aggregate([
//             {
//               $match: {
//                 product: new mongoose.Types.ObjectId(productId),
//                 subjectType: "product",
//                 status: "published",
//               },
//             },
//             {
//               $group: {
//                 _id: "$product",
//                 average: { $avg: "$rating" },
//                 count: { $sum: 1 },
//               },
//             },
//           ])
//         : ReviewModel.aggregate([
//             {
//               $match: {
//                 subjectType,
//                 status: "published",
//               },
//             },
//             {
//               $group: {
//                 _id: "$subjectType",
//                 average: { $avg: "$rating" },
//                 count: { $sum: 1 },
//               },
//             },
//           ]),
//     ]);

//     const viewerId = req.userId ? String(req.userId) : null;
//     const formatted = items.map((item) => projectReview(item, viewerId));
//     const statsPayload = {
//       average: Number(
//         (stats?.[0]?.average ? stats[0].average : 0).toFixed(2)
//       ),
//       count: stats?.[0]?.count || 0,
//     };

//     return res.json({
//       success: true,
//       error: false,
//       data: {
//         items: formatted,
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//         stats: statsPayload,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };

// // POST /api/reviews
// export const createOrUpdateReview = async (req, res) => {
//   try {
//     const {
//       productId,
//       rating,
//       title,
//       comment,
//       contentHtml,
//       contentDelta,
//       authorName,
//       authorEmail,
//       reviewToken: bodyToken,
//       subjectType: incomingSubject,
//       experienceTags,
//       locationContext,
//     } = req.body;

//     const subjectType = SUBJECT_TYPES.includes(incomingSubject)
//       ? incomingSubject
//       : "product";

//     const tokenFromHeader = req.headers[REVIEW_TOKEN_HEADER];
//     const guestToken = bodyToken || tokenFromHeader;

//     if (!isValidStep(Number(rating))) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "rating must be between 0.5 and 5 in 0.5 steps",
//       });
//     }

//     let productRef = null;
//     if (subjectType === "product") {
//       if (!productId) {
//         return res
//           .status(400)
//           .json({ success: false, error: true, message: "productId required" });
//       }
//       const product = await ensureProduct(productId);
//       productRef = product._id;
//     }

//     const sanitizedHtml = sanitizeHtml(contentHtml);
//     const normalizedTags = normalizeTags(experienceTags);
//     const locationNote = (locationContext || "").trim().slice(0, 140);
//     let reviewDoc = null;
//     let newGuestToken = null;

//     if (req.userId) {
//       const user = await UserModel.findById(req.userId).select(
//         "name email avatar role"
//       );
//       if (!user) {
//         return res
//           .status(401)
//           .json({ success: false, error: true, message: "User not found" });
//       }

//       const match = {
//         user: req.userId,
//         subjectType,
//         product: subjectType === "product" ? productRef : null,
//       };

//       reviewDoc = await ReviewModel.findOneAndUpdate(
//         match,
//         {
//           $set: {
//             product: subjectType === "product" ? productRef : null,
//             rating,
//             title,
//             comment,
//             contentHtml: sanitizedHtml,
//             contentDelta,
//             authorType: user.role?.includes("ADMIN") ? "admin" : "registered",
//             authorName: user.name || "Essentialist Shopper",
//             authorEmail: user.email,
//             authorAvatar: user.avatar,
//             subjectType,
//             experienceTags: normalizedTags,
//             locationContext: locationNote,
//             status: "published",
//             isVerifiedPurchase: Boolean(req.body.isVerifiedPurchase),
//           },
//         },
//         { new: true, upsert: true, setDefaultsOnInsert: true }
//       );

//       if (subjectType === "product") {
//         await RatingModel.findOneAndUpdate(
//           { user: req.userId, product: productRef },
//           { $set: { value: rating } },
//           { new: true, upsert: true, setDefaultsOnInsert: true }
//         );
//       }
//     } else {
//       if (!authorName || !authorEmail) {
//         return res.status(400).json({
//           success: false,
//           error: true,
//           message: "Name and email are required for guest reviews",
//         });
//       }
//       if (!emailRegex.test(authorEmail)) {
//         return res.status(400).json({
//           success: false,
//           error: true,
//           message: "Enter a valid email address",
//         });
//       }

//       if (guestToken) {
//         reviewDoc = await ReviewModel.findOneAndUpdate(
//           {
//             guestTokenHash: hashToken(guestToken.trim()),
//             subjectType,
//             product: subjectType === "product" ? productRef : null,
//           },
//           {
//             $set: {
//               rating,
//               title,
//               comment,
//               contentHtml: sanitizedHtml,
//               contentDelta,
//               authorType: "guest",
//               authorName,
//               authorEmail,
//               experienceTags: normalizedTags,
//               locationContext: locationNote,
//               subjectType,
//             },
//           },
//           { new: true }
//         );

//         if (!reviewDoc) {
//           return res.status(404).json({
//             success: false,
//             error: true,
//             message: "Guest review not found",
//           });
//         }
//       } else {
//         const tempToken = generateGuestToken();
//         newGuestToken = tempToken;
//         reviewDoc = await ReviewModel.create({
//           product: subjectType === "product" ? productRef : null,
//           rating,
//           title,
//           comment,
//           contentHtml: sanitizedHtml,
//           contentDelta,
//           authorType: "guest",
//           authorName,
//           authorEmail,
//           guestTokenHash: hashToken(tempToken),
//           status: "pending",
//           subjectType,
//           experienceTags: normalizedTags,
//           locationContext: locationNote,
//         });
//       }
//     }

//     const safeReview = projectReview(reviewDoc.toObject(), req.userId);
//     const stats =
//       subjectType === "product" && productRef
//         ? await refreshProductReviewStats(productRef)
//         : {
//             average: 0,
//             count: await ReviewModel.countDocuments({
//               subjectType,
//               status: "published",
//             }),
//           };

//     return res.json({
//       success: true,
//       error: false,
//       message: req.userId ? "Review saved" : "Review received",
//       data: { ...safeReview, stats },
//       guestToken: newGuestToken || undefined,
//     });
//   } catch (err) {
//     if (err?.message === "Product not found") {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: err.message });
//     }
//     if (err?.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         error: true,
//         message: "Duplicate review conflict",
//       });
//     }
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };

// // DELETE /api/reviews/:productId?subjectType=product
// export const deleteMyReview = async (req, res) => {
//   try {
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         error: true,
//         message: "Login required",
//       });
//     }

//     const subjectType = SUBJECT_TYPES.includes(req.query.subjectType)
//       ? req.query.subjectType
//       : "product";

//     const filter = { user: req.userId, subjectType };

//     if (subjectType === "product") {
//       const { productId } = req.params;
//       if (!mongoose.isValidObjectId(productId)) {
//         return res
//           .status(400)
//           .json({ success: false, error: true, message: "Invalid productId" });
//       }
//       filter.product = productId;
//     } else {
//       filter.product = null;
//     }

//     const review = await ReviewModel.findOneAndDelete(filter);

//     if (review && review.product) {
//       await RatingModel.deleteOne({
//         product: review.product,
//         user: req.userId,
//       });
//       await refreshProductReviewStats(review.product);
//     }

//     return res.json({
//       success: true,
//       error: false,
//       message: review ? "Review removed" : "Nothing to delete",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };

// // DELETE /api/reviews/id/:reviewId
// export const deleteReviewById = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     if (!mongoose.isValidObjectId(reviewId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid reviewId" });
//     }

//     const review = await ReviewModel.findById(reviewId).select(
//       "product user guestTokenHash subjectType"
//     );
//     if (!review) {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: "Review not found" });
//     }

//     const guestToken = req.headers[REVIEW_TOKEN_HEADER] || req.query.token;
//     const isOwner =
//       req.userId && review.user && String(review.user) === String(req.userId);

//     if (!isOwner) {
//       if (!guestToken) {
//         return res.status(403).json({
//           success: false,
//           error: true,
//           message: "Token required to delete guest review",
//         });
//       }
//       const hash = hashToken(guestToken.trim());
//       if (review.guestTokenHash !== hash) {
//         return res.status(403).json({
//           success: false,
//           error: true,
//           message: "Token mismatch",
//         });
//       }
//     }

//     await ReviewModel.deleteOne({ _id: reviewId });
//     if (review.product) {
//       await refreshProductReviewStats(review.product);
//     }

//     return res.json({
//       success: true,
//       error: false,
//       message: "Review deleted",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };

// // ADMIN — GET /api/reviews?status=...&subjectType=...
// export const adminListReviews = async (req, res) => {
//   try {
//     const { status, productId, search, subjectType } = req.query;
//     const query = {};

//     if (status && status !== "all") query.status = status;
//     if (productId && mongoose.isValidObjectId(productId)) {
//       query.product = productId;
//     }
//     if (subjectType && SUBJECT_TYPES.includes(subjectType)) {
//       query.subjectType = subjectType;
//     }
//     if (search) {
//       query.$or = [
//         { authorName: new RegExp(search, "i") },
//         { title: new RegExp(search, "i") },
//         { comment: new RegExp(search, "i") },
//       ];
//     }

//     const items = await ReviewModel.find(query)
//       .sort({ createdAt: -1 })
//       .populate("product", "name sku slug")
//       .lean();

//     return res.json({
//       success: true,
//       error: false,
//       data: { items },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || "Server error",
//     });
//   }
// };

// // ADMIN — POST /api/reviews/admin
// export const adminCreateReview = async (req, res) => {
//   try {
//     const {
//       productId,
//       rating,
//       title,
//       comment,
//       contentHtml,
//       authorName,
//       authorEmail,
//       authorAvatar,
//       isVerifiedPurchase,
//       status = "published",
//       subjectType = "product",
//       experienceTags,
//       locationContext,
//     } = req.body;

//     if (!authorName || !authorEmail) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Author name & email are required",
//       });
//     }
//     if (!emailRegex.test(authorEmail)) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Invalid email address",
//       });
//     }
//     if (!SUBJECT_TYPES.includes(subjectType)) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Invalid subjectType",
//       });
//     }
//     if (subjectType === "product") {
//       await ensureProduct(productId);
//     }
//     if (!isValidStep(Number(rating))) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "rating must be between 0.5 and 5 in 0.5 steps",
//       });
//     }

//     const review = await ReviewModel.create({
//       product: subjectType === "product" ? productId : null,
//       rating,
//       title,
//       comment,
//       contentHtml: sanitizeHtml(contentHtml),
//       authorType: "admin",
//       authorName,
//       authorEmail,
//       authorAvatar,
//       isVerifiedPurchase: Boolean(isVerifiedPurchase),
//       status,
//       createdByAdmin: true,
//       publishedAt: status === "published" ? new Date() : null,
//       subjectType,
//       experienceTags: normalizeTags(experienceTags),
//       locationContext: (locationContext || "").trim().slice(0, 140),
//     });

//     if (subjectType === "product" && productId) {
//       await refreshProductReviewStats(productId);
//     }

//     return res.status(201).json({
//       success: true,
//       error: false,
//       message: "Admin review created",
//       data: projectReview(review.toObject(), req.userId),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || "Server error",
//     });
//   }
// };

// // ADMIN — PUT /api/reviews/admin/:reviewId
// export const adminUpdateReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     if (!mongoose.isValidObjectId(reviewId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid reviewId" });
//     }

//     const payload = { ...req.body };

//     if (payload.contentHtml) payload.contentHtml = sanitizeHtml(payload.contentHtml);
//     if (payload.rating && !isValidStep(Number(payload.rating))) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "rating must be between 0.5 and 5 in 0.5 steps",
//       });
//     }
//     if (payload.authorEmail && !emailRegex.test(payload.authorEmail)) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Invalid email address",
//       });
//     }
//     if (payload.subjectType && !SUBJECT_TYPES.includes(payload.subjectType)) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Invalid subjectType",
//       });
//     }
//     if (payload.subjectType === "product" && payload.product) {
//       await ensureProduct(payload.product);
//     }
//     if (payload.experienceTags) {
//       payload.experienceTags = normalizeTags(payload.experienceTags);
//     }
//     if (payload.locationContext) {
//       payload.locationContext = payload.locationContext.trim().slice(0, 140);
//     }

//     const review = await ReviewModel.findByIdAndUpdate(
//       reviewId,
//       { $set: payload },
//       { new: true }
//     );

//     if (!review) {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: "Review not found" });
//     }

//     if (review.product) {
//       await refreshProductReviewStats(review.product);
//     }

//     return res.json({
//       success: true,
//       error: false,
//       message: "Review updated",
//       data: projectReview(review.toObject(), req.userId),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || "Server error",
//     });
//   }
// };

// // ADMIN — DELETE /api/reviews/admin/:reviewId
// export const adminDeleteReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     if (!mongoose.isValidObjectId(reviewId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid reviewId" });
//     }

//     const review = await ReviewModel.findById(reviewId).select("product");
//     if (!review) {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: "Review not found" });
//     }

//     await ReviewModel.deleteOne({ _id: reviewId });
//     if (review.product) {
//       await refreshProductReviewStats(review.product);
//     }

//     return res.json({
//       success: true,
//       error: false,
//       message: "Review deleted",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: error.message || "Server error",
//     });
//   }
// };

// // COMMENTS — GET /api/reviews/:reviewId/comments
// export const listReviewComments = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     if (!mongoose.isValidObjectId(reviewId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid reviewId" });
//     }

//     const review = await ReviewModel.findById(reviewId).select("user status");
//     if (!review || review.status === "hidden") {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: "Review not found" });
//     }

//     const comments = await ReviewCommentModel.find({
//       review: reviewId,
//       status: "published",
//     })
//       .sort({ createdAt: 1 })
//       .lean();

//     const viewerId = req.userId ? String(req.userId) : null;
//     const formatted = comments.map((comment) =>
//       projectComment(comment, viewerId, review.user)
//     );

//     return res.json({
//       success: true,
//       error: false,
//       data: { items: formatted },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };

// // COMMENTS — POST /api/reviews/:reviewId/comments
// export const createReviewComment = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const { body, authorName, authorEmail } = req.body;

//     if (!mongoose.isValidObjectId(reviewId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid reviewId" });
//     }

//     if (!body || !body.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: true,
//         message: "Comment body is required",
//       });
//     }

//     const review = await ReviewModel.findById(reviewId).select(
//       "user status subjectType"
//     );
//     if (!review || review.status === "hidden") {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: "Review not found" });
//     }
//     if (review.status !== "published") {
//       return res.status(403).json({
//         success: false,
//         error: true,
//         message: "Comments allowed only on published reviews",
//       });
//     }

//     let commentDoc = null;
//     let newGuestToken = null;
//     const trimmedBody = body.trim().slice(0, 2000);

//     if (req.userId) {
//       const user = await UserModel.findById(req.userId).select(
//         "name email role"
//       );
//       if (!user) {
//         return res
//           .status(401)
//           .json({ success: false, error: true, message: "User not found" });
//       }

//       commentDoc = await ReviewCommentModel.create({
//         review: reviewId,
//         user: req.userId,
//         authorType: user.role?.includes("ADMIN") ? "admin" : "registered",
//         authorName: user.name || "Essentialist Customer",
//         authorEmail: user.email,
//         body: trimmedBody,
//         status: "published",
//       });
//     } else {
//       if (!authorName || !authorEmail) {
//         return res.status(400).json({
//           success: false,
//           error: true,
//           message: "Guest name & email required",
//         });
//       }
//       if (!emailRegex.test(authorEmail)) {
//         return res.status(400).json({
//           success: false,
//           error: true,
//           message: "Invalid email address",
//         });
//       }

//       const tempToken = generateGuestToken();
//       newGuestToken = tempToken;
//       commentDoc = await ReviewCommentModel.create({
//         review: reviewId,
//         authorType: "guest",
//         authorName,
//         authorEmail,
//         body: trimmedBody,
//         status: "published",
//         guestTokenHash: hashToken(tempToken),
//       });
//     }

//     await ReviewModel.findByIdAndUpdate(reviewId, {
//       $inc: { commentsCount: 1 },
//     });

//     const payload = projectComment(
//       commentDoc.toObject(),
//       req.userId,
//       review.user
//     );

//     return res.status(201).json({
//       success: true,
//       error: false,
//       message: "Comment added",
//       data: payload,
//       guestToken: newGuestToken || undefined,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };

// // COMMENTS — DELETE /api/reviews/comments/:commentId
// export const deleteReviewComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;
//     if (!mongoose.isValidObjectId(commentId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid commentId" });
//     }

//     const comment = await ReviewCommentModel.findById(commentId)
//       .select("review user guestTokenHash")
//       .lean();

//     if (!comment) {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: "Comment not found" });
//     }

//     const review = await ReviewModel.findById(comment.review).select("user");
//     const guestToken = req.headers[REVIEW_TOKEN_HEADER] || req.query.token;
//     const isCommentOwner =
//       req.userId && comment.user && String(comment.user) === String(req.userId);
//     const isReviewOwner =
//       req.userId &&
//       review?.user &&
//       String(review.user) === String(req.userId);

//     if (!isCommentOwner && !isReviewOwner) {
//       if (!guestToken) {
//         return res.status(403).json({
//           success: false,
//           error: true,
//           message: "Token required to delete guest comment",
//         });
//       }
//       if (hashToken(guestToken.trim()) !== comment.guestTokenHash) {
//         return res.status(403).json({
//           success: false,
//           error: true,
//           message: "Token mismatch",
//         });
//       }
//     }

//     await ReviewCommentModel.deleteOne({ _id: commentId });
//     await ReviewModel.findByIdAndUpdate(comment.review, {
//       $inc: { commentsCount: -1 },
//     });

//     return res.json({
//       success: true,
//       error: false,
//       message: "Comment removed",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };

// // COMMENTS — DELETE /api/reviews/admin/comments/:commentId
// export const adminDeleteReviewComment = async (req, res) => {
//   try {
//     const { commentId } = req.params;
//     if (!mongoose.isValidObjectId(commentId)) {
//       return res
//         .status(400)
//         .json({ success: false, error: true, message: "Invalid commentId" });
//     }

//     const comment = await ReviewCommentModel.findById(commentId)
//       .select("review");
//     if (!comment) {
//       return res
//         .status(404)
//         .json({ success: false, error: true, message: "Comment not found" });
//     }

//     await ReviewCommentModel.deleteOne({ _id: commentId });
//     await ReviewModel.findByIdAndUpdate(comment.review, {
//       $inc: { commentsCount: -1 },
//     });

//     return res.json({
//       success: true,
//       error: false,
//       message: "Comment deleted",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: err.message || "Server error",
//     });
//   }
// };






// controllers/review.controller.js
import mongoose from "mongoose";
import crypto from "crypto";
import sanitizeHtml from "sanitize-html";
import ReviewModel from "../models/review.model.js";
import ReviewCommentModel from "../models/reviewComment.model.js";
import ProductModel from "../models/product.model.js";
import RatingModel from "../models/rating.model.js";
import UserModel from "../models/user.model.js";

const REVIEW_TOKEN_HEADER = "x-review-token";
const SUBJECT_TYPES = [
  "product",
  "customer_service",
  "environment",
  "shipping",
  "website",
  "other",
];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const RICH_TEXT_SANITIZE_CONFIG = {
  allowedTags: ["b", "i", "em", "strong", "ul", "ol", "li", "p", "br"],
  allowedAttributes: {},
};
const PLAIN_TEXT_SANITIZE_CONFIG = {
  allowedTags: [],
  allowedAttributes: {},
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REVIEWS_PER_WINDOW = 3;
const rateLimitBuckets = new Map();

class RateLimitError extends Error {
  constructor(message = "Too many submissions. Please slow down.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function sanitizeRichText(html = "") {
  if (!html) return "";
  return sanitizeHtml(String(html), RICH_TEXT_SANITIZE_CONFIG).trim();
}

function sanitizePlainText(value = "", maxLength, collapseWhitespace = true) {
  if (value === undefined || value === null) return "";
  let sanitized = sanitizeHtml(String(value), PLAIN_TEXT_SANITIZE_CONFIG);
  sanitized = collapseWhitespace
    ? sanitized.replace(/\s+/g, " ")
    : sanitized.replace(/[ \t]+/g, " ");
  sanitized = sanitized.trim();
  if (typeof maxLength === "number" && maxLength > 0) {
    return sanitized.slice(0, maxLength);
  }
  return sanitized;
}

function normalizeEmail(email = "") {
  const sanitized = sanitizePlainText(email, 140);
  return sanitized.toLowerCase();
}

function isValidStep(val) {
  return (
    Number.isFinite(val) &&
    val >= 0.5 &&
    val <= 5 &&
    Math.abs(val * 2 - Math.round(val * 2)) < 1e-9
  );
}

function hashToken(token = "") {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function generateGuestToken() {
  return crypto.randomBytes(24).toString("hex");
}

function computeGuestFingerprint(email, subjectType, productId) {
  const emailKey = (email || "").toLowerCase().trim();
  const subjectKey = subjectType || "product";
  const productKey = productId ? String(productId) : "global";
  return hashToken(`${emailKey}::${subjectKey}::${productKey}`);
}

function normalizeTags(input) {
  if (!input) return [];
  const list = Array.isArray(input)
    ? input
    : String(input)
        .split(",")
        .map((tag) => tag.trim());
  const cleaned = list
    .map((tag) => sanitizePlainText(tag, 32))
    .filter(Boolean);
  return [...new Set(cleaned)].slice(0, 5);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function registerRateLimitHit(key, limit = RATE_LIMIT_MAX_REVIEWS_PER_WINDOW) {
  if (!key) return;
  const now = Date.now();
  const recent = (rateLimitBuckets.get(key) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  rateLimitBuckets.set(key, recent);
  if (recent.length > limit) {
    throw new RateLimitError(
      "Too many review submissions from this source. Please try again later."
    );
  }
}

function enforceRateLimit(keys, limit = RATE_LIMIT_MAX_REVIEWS_PER_WINDOW) {
  keys.filter(Boolean).forEach((key) => registerRateLimitHit(key, limit));
}

async function ensureProduct(productId) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new Error("Invalid productId");
  }
  const product = await ProductModel.findById(productId).select("_id name");
  if (!product) throw new Error("Product not found");
  return product;
}

async function refreshProductReviewStats(productId) {
  if (!productId) return { average: 0, count: 0 };
  const [stats] = await ReviewModel.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        subjectType: "product",
        status: "published",
      },
    },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  await ProductModel.findByIdAndUpdate(productId, {
    $set: {
      reviewsAverage: stats?.average || 0,
      reviewsCount: stats?.count || 0,
    },
  });
  return {
    average: Number((stats?.average || 0).toFixed(2)),
    count: stats?.count || 0,
  };
}

async function computeReviewStats({ subjectType, productId } = {}) {
  const match = { status: "published" };
  if (subjectType) match.subjectType = subjectType;
  if (productId) {
    if (!mongoose.isValidObjectId(productId)) {
      return { average: 0, count: 0 };
    }
    match.product = new mongoose.Types.ObjectId(productId);
  }
  const [stats] = await ReviewModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  return {
    average: Number((stats?.average || 0).toFixed(2)),
    count: stats?.count || 0,
  };
}

function projectReview(doc, viewerId) {
  if (!doc) return null;
  const owned =
    viewerId && doc.user ? String(doc.user) === String(viewerId) : false;

  return {
    _id: doc._id,
    product: doc.product
      ? {
          _id: doc.product._id || doc.product,
          name: doc.product.name,
          slug: doc.product.slug,
        }
      : null,
    subjectType: doc.subjectType,
    experienceTags: doc.experienceTags || [],
    locationContext: doc.locationContext || "",
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    contentHtml: doc.contentHtml,
    authorName: doc.authorName,
    authorEmail: doc.authorEmail,
    authorAvatar: doc.authorAvatar,
    authorType: doc.authorType,
    isVerifiedPurchase: doc.isVerifiedPurchase,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    commentsCount: doc.commentsCount || 0,
    viewerCanEdit: owned,
    viewerCanDelete: owned,
  };
}

function projectComment(doc, viewerId, reviewOwnerId) {
  if (!doc) return null;
  const owned =
    viewerId && doc.user ? String(doc.user) === String(viewerId) : false;
  const reviewerIsOwner =
    viewerId && reviewOwnerId
      ? String(viewerId) === String(reviewOwnerId)
      : false;

  return {
    _id: doc._id,
    review: doc.review,
    body: doc.body,
    authorName: doc.authorName,
    authorType: doc.authorType,
    status: doc.status,
    createdAt: doc.createdAt,
    viewerCanDelete: owned || reviewerIsOwner,
  };
}

export const listReviews = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const minRatingParam = req.query.minRating;
    const minRating =
      minRatingParam !== undefined ? Number(minRatingParam) : undefined;
    const verifiedOnly = req.query.verifiedOnly === "true";
    const includeHidden = req.query.status === "all" && Boolean(req.userId);
    const requestedSubject = req.query.subjectType;
    const productId = req.params.productId || req.query.productId || null;

    let subjectType =
      SUBJECT_TYPES.includes(requestedSubject) && requestedSubject
        ? requestedSubject
        : productId
        ? "product"
        : "website";

    if (productId && !mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid productId" });
    }

    const query = { subjectType };
    if (subjectType === "product" && productId) {
      query.product = productId;
    }
    if (!includeHidden) {
      query.status = "published";
    }
    if (Number.isFinite(minRating)) {
      const clamped = Math.max(0.5, Math.min(5, minRating));
      query.rating = { $gte: clamped };
    }
    if (verifiedOnly) {
      query.isVerifiedPurchase = true;
    }

    const [items, total, stats] = await Promise.all([
      ReviewModel.find(query)
        .sort({ isVerifiedPurchase: -1, createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "product user subjectType experienceTags locationContext rating title comment contentHtml authorName authorEmail authorAvatar authorType isVerifiedPurchase status createdAt updatedAt commentsCount"
        )
        .populate("product", "name slug")
        .lean(),
      ReviewModel.countDocuments(query),
      computeReviewStats({
        subjectType,
        productId: subjectType === "product" ? productId : undefined,
      }),
    ]);

    const viewerId = req.userId ? String(req.userId) : null;
    const formatted = items.map((item) => projectReview(item, viewerId));

    return res.json({
      success: true,
      error: false,
      data: {
        items: formatted,
        total,
        page,
        pages: Math.ceil(total / limit),
        stats,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};

export const createOrUpdateReview = async (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      comment,
      contentHtml,
      contentDelta,
      authorName,
      authorEmail,
      reviewToken: bodyToken,
      subjectType: incomingSubject,
      experienceTags,
      locationContext,
    } = req.body;

    let subjectType = SUBJECT_TYPES.includes(incomingSubject)
      ? incomingSubject
      : "product";

    const ratingValue = Number(rating);
    if (!isValidStep(ratingValue)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "rating must be between 0.5 and 5 in 0.5 steps",
      });
    }

    const headerToken = req.headers[REVIEW_TOKEN_HEADER];
    const rawGuestToken = (bodyToken || headerToken || "").trim();
    const hashedIncomingToken = rawGuestToken ? hashToken(rawGuestToken) : null;

    let guestReviewDoc = null;
    let productRef = null;

    if (!req.userId && hashedIncomingToken) {
      guestReviewDoc = await ReviewModel.findOne({
        guestTokenHash: hashedIncomingToken,
      }).select("+guestTokenHash +guestFingerprintHash");
      if (guestReviewDoc) {
        subjectType = guestReviewDoc.subjectType;
        productRef = guestReviewDoc.product || null;
      }
    }

    if (subjectType === "product" && !productRef) {
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "productId required",
        });
      }
      const product = await ensureProduct(productId);
      productRef = product._id;
    }

    const sanitizedHtml = sanitizeRichText(contentHtml);
    const sanitizedTitle = sanitizePlainText(title, 140);
    const sanitizedComment = sanitizePlainText(comment, 500);
    const normalizedTags = normalizeTags(experienceTags);
    const locationNote = sanitizePlainText(locationContext, 140);
    const sanitizedDelta = contentDelta ?? null;

    let reviewDoc = null;
    let guestTokenToReturn;
    let wasGuestUpdate = false;

    if (req.userId) {
      const user = await UserModel.findById(req.userId).select(
        "name email avatar role"
      );
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: true, message: "User not found" });
      }

      const resolvedAuthorName =
        sanitizePlainText(user.name, 140) || "Essentialist Shopper";

      const match = {
        user: req.userId,
        subjectType,
        product: subjectType === "product" ? productRef : null,
      };

      reviewDoc = await ReviewModel.findOneAndUpdate(
        match,
        {
          $set: {
            product: subjectType === "product" ? productRef : null,
            rating: ratingValue,
            title: sanitizedTitle,
            comment: sanitizedComment,
            contentHtml: sanitizedHtml,
            contentDelta: sanitizedDelta,
            authorType: user.role?.includes("ADMIN") ? "admin" : "registered",
            authorName: resolvedAuthorName,
            authorEmail: user.email,
            authorAvatar: user.avatar,
            subjectType,
            experienceTags: normalizedTags,
            locationContext: locationNote,
            status: "published",
            isVerifiedPurchase: Boolean(req.body.isVerifiedPurchase),
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      if (subjectType === "product" && productRef) {
        await RatingModel.findOneAndUpdate(
          { user: req.userId, product: productRef },
          { $set: { value: ratingValue } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }
    } else {
      const clientIp = getClientIp(req);
      const normalizedSubmittedEmail = normalizeEmail(authorEmail);
      const fallbackEmail = guestReviewDoc?.authorEmail
        ? normalizeEmail(guestReviewDoc.authorEmail)
        : "";
      const normalizedEmail =
        normalizedSubmittedEmail || fallbackEmail || null;

      if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Enter a valid email address",
        });
      }

      enforceRateLimit([
        clientIp ? `ip:${clientIp}` : null,
        `email:${normalizedEmail}`,
        hashedIncomingToken ? `token:${hashedIncomingToken}` : null,
      ]);

      if (!guestReviewDoc) {
        guestReviewDoc = await ReviewModel.findOne({
          authorEmail: normalizedEmail,
          subjectType,
          product: subjectType === "product" ? productRef : null,
          authorType: "guest",
        }).select("+guestTokenHash +guestFingerprintHash");
      }

      const sanitizedAuthorNameInput = sanitizePlainText(authorName, 140);
      const fallbackAuthorName = sanitizePlainText(
        guestReviewDoc?.authorName,
        140
      );
      const safeAuthorName = sanitizedAuthorNameInput || fallbackAuthorName;

      if (!safeAuthorName) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Name is required for guest reviews",
        });
      }

      const fingerprintHash = computeGuestFingerprint(
        normalizedEmail,
        subjectType,
        subjectType === "product" ? productRef : null
      );

      const guestPayload = {
        product: subjectType === "product" ? productRef : null,
        rating: ratingValue,
        title: sanitizedTitle,
        comment: sanitizedComment,
        contentHtml: sanitizedHtml,
        contentDelta: sanitizedDelta,
        authorType: "guest",
        authorName: safeAuthorName,
        authorEmail: normalizedEmail,
        experienceTags: normalizedTags,
        locationContext: locationNote,
        subjectType,
        guestFingerprintHash: fingerprintHash,
      };

      if (guestReviewDoc) {
        wasGuestUpdate = true;
        const shouldRotateToken =
          !rawGuestToken ||
          hashedIncomingToken !== guestReviewDoc.guestTokenHash;

        if (shouldRotateToken) {
          const rotatedToken = generateGuestToken();
          guestTokenToReturn = rotatedToken;
          guestReviewDoc.guestTokenHash = hashToken(rotatedToken);
        }

        guestReviewDoc.set(guestPayload);
        reviewDoc = await guestReviewDoc.save();
      } else {
        const freshToken = generateGuestToken();
        guestTokenToReturn = freshToken;

        reviewDoc = await ReviewModel.create({
          ...guestPayload,
          guestTokenHash: hashToken(freshToken),
          status: "pending",
        });
      }
    }

    if (!reviewDoc) {
      throw new Error("Unable to save review");
    }

    const plainReview =
      typeof reviewDoc.toObject === "function"
        ? reviewDoc.toObject()
        : reviewDoc;
    const safeReview = projectReview(plainReview, req.userId);

    const stats =
      subjectType === "product" && productRef
        ? await refreshProductReviewStats(productRef)
        : await computeReviewStats({ subjectType });

    const responseMessage = req.userId
      ? "Review saved"
      : wasGuestUpdate
      ? "Review updated"
      : "Review received";

    return res.json({
      success: true,
      error: false,
      message: responseMessage,
      data: { ...safeReview, stats },
      guestToken: guestTokenToReturn || undefined,
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return res.status(429).json({
        success: false,
        error: true,
        message: err.message,
      });
    }
    if (err?.message === "Product not found") {
      return res
        .status(404)
        .json({ success: false, error: true, message: err.message });
    }
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: true,
        message: "Duplicate review conflict",
      });
    }
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};

export const deleteMyReview = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Login required",
      });
    }

    const subjectType = SUBJECT_TYPES.includes(req.query.subjectType)
      ? req.query.subjectType
      : "product";

    const filter = { user: req.userId, subjectType };

    if (subjectType === "product") {
      const { productId } = req.params;
      if (!mongoose.isValidObjectId(productId)) {
        return res
          .status(400)
          .json({ success: false, error: true, message: "Invalid productId" });
      }
      filter.product = productId;
    } else {
      filter.product = null;
    }

    const review = await ReviewModel.findOneAndDelete(filter);

    if (review && review.product) {
      await RatingModel.deleteOne({
        product: review.product,
        user: req.userId,
      });
      await refreshProductReviewStats(review.product);
    }

    return res.json({
      success: true,
      error: false,
      message: review ? "Review removed" : "Nothing to delete",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};

export const deleteReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid reviewId" });
    }

    const review = await ReviewModel.findById(reviewId)
      .select("product user subjectType")
      .select("+guestTokenHash");
    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Review not found" });
    }

    const guestToken = req.headers[REVIEW_TOKEN_HEADER] || req.query.token;
    const isOwner =
      req.userId && review.user && String(review.user) === String(req.userId);

    if (!isOwner) {
      if (!guestToken) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Token required to delete guest review",
        });
      }
      const hash = hashToken(guestToken.trim());
      if (review.guestTokenHash !== hash) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Token mismatch",
        });
      }
    }

    await ReviewModel.deleteOne({ _id: reviewId });
    if (review.product) {
      await refreshProductReviewStats(review.product);
    }

    return res.json({
      success: true,
      error: false,
      message: "Review deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};

export const adminListReviews = async (req, res) => {
  try {
    const { status, productId, search, subjectType } = req.query;
    const query = {};

    if (status && status !== "all") query.status = status;
    if (productId && mongoose.isValidObjectId(productId)) {
      query.product = productId;
    }
    if (subjectType && SUBJECT_TYPES.includes(subjectType)) {
      query.subjectType = subjectType;
    }
    if (search) {
      query.$or = [
        { authorName: new RegExp(search, "i") },
        { title: new RegExp(search, "i") },
        { comment: new RegExp(search, "i") },
      ];
    }

    const items = await ReviewModel.find(query)
      .sort({ createdAt: -1 })
      .populate("product", "name sku slug")
      .lean();

    return res.json({
      success: true,
      error: false,
      data: { items },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
};

export const adminCreateReview = async (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      comment,
      contentHtml,
      authorName,
      authorEmail,
      authorAvatar,
      isVerifiedPurchase,
      status = "published",
      subjectType = "product",
      experienceTags,
      locationContext,
    } = req.body;

    const sanitizedAuthorName = sanitizePlainText(authorName, 140);
    const normalizedEmail = normalizeEmail(authorEmail);

    if (!sanitizedAuthorName || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Author name & email are required",
      });
    }
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid email address",
      });
    }
    if (!SUBJECT_TYPES.includes(subjectType)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid subjectType",
      });
    }
    if (subjectType === "product") {
      await ensureProduct(productId);
    }
    if (!isValidStep(Number(rating))) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "rating must be between 0.5 and 5 in 0.5 steps",
      });
    }

    const safeTitle = sanitizePlainText(title, 140);
    const safeComment = sanitizePlainText(comment, 500);
    const safeLocation = sanitizePlainText(locationContext, 140);
    const safeHtml = sanitizeRichText(contentHtml);
    const tags = normalizeTags(experienceTags);

    const review = await ReviewModel.create({
      product: subjectType === "product" ? productId : null,
      rating,
      title: safeTitle,
      comment: safeComment,
      contentHtml: safeHtml,
      authorType: "admin",
      authorName: sanitizedAuthorName,
      authorEmail: normalizedEmail,
      authorAvatar: typeof authorAvatar === "string" ? authorAvatar.trim() : "",
      isVerifiedPurchase: Boolean(isVerifiedPurchase),
      status,
      createdByAdmin: true,
      publishedAt: status === "published" ? new Date() : null,
      subjectType,
      experienceTags: tags,
      locationContext: safeLocation,
    });

    if (subjectType === "product" && productId) {
      await refreshProductReviewStats(productId);
    }

    return res.status(201).json({
      success: true,
      error: false,
      message: "Admin review created",
      data: projectReview(review.toObject(), req.userId),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
};

export const adminUpdateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid reviewId" });
    }

    const payload = {};
    if (req.body.rating !== undefined) {
      if (!isValidStep(Number(req.body.rating))) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "rating must be between 0.5 and 5 in 0.5 steps",
        });
      }
      payload.rating = Number(req.body.rating);
    }
    if (req.body.title !== undefined) {
      payload.title = sanitizePlainText(req.body.title, 140);
    }
    if (req.body.comment !== undefined) {
      payload.comment = sanitizePlainText(req.body.comment, 500);
    }
    if (req.body.contentHtml !== undefined) {
      payload.contentHtml = sanitizeRichText(req.body.contentHtml);
    }
    if (req.body.authorName !== undefined) {
      payload.authorName = sanitizePlainText(req.body.authorName, 140);
    }
    if (req.body.authorEmail !== undefined) {
      const normalizedEmail = normalizeEmail(req.body.authorEmail);
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid email address",
        });
      }
      payload.authorEmail = normalizedEmail;
    }
    if (req.body.authorAvatar !== undefined) {
      payload.authorAvatar =
        typeof req.body.authorAvatar === "string"
          ? req.body.authorAvatar.trim()
          : "";
    }
    if (req.body.subjectType !== undefined) {
      if (!SUBJECT_TYPES.includes(req.body.subjectType)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid subjectType",
        });
      }
      payload.subjectType = req.body.subjectType;
      if (req.body.subjectType !== "product") {
        payload.product = null;
      }
    }
    if (req.body.product !== undefined) {
      if (payload.subjectType === "product" || req.body.subjectType === "product") {
        await ensureProduct(req.body.product);
        payload.product = req.body.product;
      } else if (!payload.subjectType || payload.subjectType !== "product") {
        payload.product = null;
      }
    }
    if (req.body.experienceTags !== undefined) {
      payload.experienceTags = normalizeTags(req.body.experienceTags);
    }
    if (req.body.locationContext !== undefined) {
      payload.locationContext = sanitizePlainText(
        req.body.locationContext,
        140
      );
    }
    if (req.body.isVerifiedPurchase !== undefined) {
      payload.isVerifiedPurchase = Boolean(req.body.isVerifiedPurchase);
    }
    if (req.body.status !== undefined) {
      payload.status = req.body.status;
    }
    if (req.body.contentDelta !== undefined) {
      payload.contentDelta = req.body.contentDelta;
    }

    const review = await ReviewModel.findByIdAndUpdate(
      reviewId,
      { $set: payload },
      { new: true }
    );

    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Review not found" });
    }

    if (review.product) {
      await refreshProductReviewStats(review.product);
    }

    return res.json({
      success: true,
      error: false,
      message: "Review updated",
      data: projectReview(review.toObject(), req.userId),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
};

export const adminDeleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid reviewId" });
    }

    const review = await ReviewModel.findById(reviewId).select("product");
    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Review not found" });
    }

    await ReviewModel.deleteOne({ _id: reviewId });
    if (review.product) {
      await refreshProductReviewStats(review.product);
    }

    return res.json({
      success: true,
      error: false,
      message: "Review deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Server error",
    });
  }
};

export const listReviewComments = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid reviewId" });
    }

    const review = await ReviewModel.findById(reviewId).select("user status");
    if (!review || review.status === "hidden") {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Review not found" });
    }

    const comments = await ReviewCommentModel.find({
      review: reviewId,
      status: "published",
    })
      .sort({ createdAt: 1 })
      .lean();

    const viewerId = req.userId ? String(req.userId) : null;
    const formatted = comments.map((comment) =>
      projectComment(comment, viewerId, review.user)
    );

    return res.json({
      success: true,
      error: false,
      data: { items: formatted },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};

export const createReviewComment = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { body, authorName, authorEmail } = req.body;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid reviewId" });
    }

    const sanitizedBody = sanitizePlainText(body, 2000, false);
    if (!sanitizedBody) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Comment body is required",
      });
    }

    const review = await ReviewModel.findById(reviewId).select(
      "user status subjectType"
    );
    if (!review || review.status === "hidden") {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Review not found" });
    }
    if (review.status !== "published") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Comments allowed only on published reviews",
      });
    }

    let commentDoc = null;
    let newGuestToken = null;

    if (req.userId) {
      const user = await UserModel.findById(req.userId).select(
        "name email role"
      );
      if (!user) {
        return res
          .status(401)
          .json({ success: false, error: true, message: "User not found" });
      }

      const resolvedName =
        sanitizePlainText(user.name, 140) || "Essentialist Customer";

      commentDoc = await ReviewCommentModel.create({
        review: reviewId,
        user: req.userId,
        authorType: user.role?.includes("ADMIN") ? "admin" : "registered",
        authorName: resolvedName,
        authorEmail: user.email,
        body: sanitizedBody,
        status: "published",
      });
    } else {
      const sanitizedGuestName = sanitizePlainText(authorName, 140);
      const normalizedGuestEmail = normalizeEmail(authorEmail);

      if (!sanitizedGuestName || !normalizedGuestEmail) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Guest name & email required",
        });
      }
      if (!emailRegex.test(normalizedGuestEmail)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid email address",
        });
      }

      const tempToken = generateGuestToken();
      newGuestToken = tempToken;
      commentDoc = await ReviewCommentModel.create({
        review: reviewId,
        authorType: "guest",
        authorName: sanitizedGuestName,
        authorEmail: normalizedGuestEmail,
        body: sanitizedBody,
        status: "published",
        guestTokenHash: hashToken(tempToken),
      });
    }

    await ReviewModel.findByIdAndUpdate(reviewId, {
      $inc: { commentsCount: 1 },
    });

    const payload = projectComment(
      commentDoc.toObject(),
      req.userId,
      review.user
    );

    return res.status(201).json({
      success: true,
      error: false,
      message: "Comment added",
      data: payload,
      guestToken: newGuestToken || undefined,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};

export const deleteReviewComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!mongoose.isValidObjectId(commentId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid commentId" });
    }

    const comment = await ReviewCommentModel.findById(commentId)
      .select("review user")
      .select("+guestTokenHash")
      .lean();

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Comment not found" });
    }

    const review = await ReviewModel.findById(comment.review).select("user");
    const guestToken = req.headers[REVIEW_TOKEN_HEADER] || req.query.token;
    const isCommentOwner =
      req.userId && comment.user && String(comment.user) === String(req.userId);
    const isReviewOwner =
      req.userId &&
      review?.user &&
      String(review.user) === String(req.userId);

    if (!isCommentOwner && !isReviewOwner) {
      if (!guestToken) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Token required to delete guest comment",
        });
      }
      if (hashToken(guestToken.trim()) !== comment.guestTokenHash) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Token mismatch",
        });
      }
    }

    await ReviewCommentModel.deleteOne({ _id: commentId });
    await ReviewModel.findByIdAndUpdate(comment.review, {
      $inc: { commentsCount: -1 },
    });

    return res.json({
      success: true,
      error: false,
      message: "Comment removed",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};

export const adminDeleteReviewComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!mongoose.isValidObjectId(commentId)) {
      return res
        .status(400)
        .json({ success: false, error: true, message: "Invalid commentId" });
    }

    const comment = await ReviewCommentModel.findById(commentId).select(
      "review"
    );
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, error: true, message: "Comment not found" });
    }

    await ReviewCommentModel.deleteOne({ _id: commentId });
    await ReviewModel.findByIdAndUpdate(comment.review, {
      $inc: { commentsCount: -1 },
    });

    return res.json({
      success: true,
      error: false,
      message: "Comment deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || "Server error",
    });
  }
};