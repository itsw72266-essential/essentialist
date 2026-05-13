// import express from "express";
// import optionalAuth from "../middleware/optionalAuth.js";
// import auth from "../middleware/auth.js";
// import adminOnly from "../middleware/adminOnly.js";
// import {
//   listReviews,
//   createOrUpdateReview,
//   deleteMyReview,
//   deleteReviewById,
//   adminListReviews,
//   adminCreateReview,
//   adminUpdateReview,
//   adminDeleteReview,
//   listReviewComments,
//   createReviewComment,
//   deleteReviewComment,
//   adminDeleteReviewComment,
// } from "../controllers/review.controller.js";

// const router = express.Router();

// // Public review feeds
// router.get("/public", optionalAuth, listReviews);
// router.get("/public/product/:productId", optionalAuth, listReviews);
// router.get("/:productId", optionalAuth, listReviews); // backward compatibility

// // Review CRUD
// router.post("/", optionalAuth, createOrUpdateReview);
// router.delete("/:productId", auth, deleteMyReview);
// router.delete("/id/:reviewId", optionalAuth, deleteReviewById);

// // Comments
// router.get("/:reviewId/comments", optionalAuth, listReviewComments);
// router.post("/:reviewId/comments", optionalAuth, createReviewComment);
// router.delete("/comments/:commentId", optionalAuth, deleteReviewComment);

// // Admin comment moderation
// router.delete(
//   "/admin/comments/:commentId",
//   auth,
//   adminOnly,
//   adminDeleteReviewComment
// );

// // Admin review moderation
// router.get("/", auth, adminOnly, adminListReviews);
// router.post("/admin", auth, adminOnly, adminCreateReview);
// router.put("/admin/:reviewId", auth, adminOnly, adminUpdateReview);
// router.delete("/admin/:reviewId", auth, adminOnly, adminDeleteReview);

// export default router;


import express from "express";
import optionalAuth from "../middleware/optionalAuth.js";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  listReviews,
  createOrUpdateReview,
  deleteMyReview,
  deleteReviewById,
  adminListReviews,
  adminCreateReview,
  adminUpdateReview,
  adminDeleteReview,
  listReviewComments,
  createReviewComment,
  deleteReviewComment,
  adminDeleteReviewComment,
} from "../controllers/review.controller.js";

const router = express.Router();

// Public review feeds
router.get("/public", optionalAuth, listReviews);
router.get("/public/product/:productId", optionalAuth, listReviews);
router.get("/:productId", optionalAuth, listReviews); // backward compatibility

// Review CRUD
router.post("/", auth, createOrUpdateReview);
router.delete("/:productId", auth, deleteMyReview);
router.delete("/id/:reviewId", auth, deleteReviewById);

// Comments
router.get("/:reviewId/comments", optionalAuth, listReviewComments);
router.post("/:reviewId/comments", auth, createReviewComment);
router.delete("/comments/:commentId", auth, deleteReviewComment);

// Admin comment moderation
router.delete(
  "/admin/comments/:commentId",
  auth,
  adminOnly,
  adminDeleteReviewComment
);

// Admin review moderation
router.get("/", auth, adminOnly, adminListReviews);
router.post("/admin", auth, adminOnly, adminCreateReview);
router.put("/admin/:reviewId", auth, adminOnly, adminUpdateReview);
router.delete("/admin/:reviewId", auth, adminOnly, adminDeleteReview);

export default router;