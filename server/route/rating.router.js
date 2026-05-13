// // routes/rating.router.js
// import { Router } from "express";
// import auth from "../middleware/auth.js";
// import { deleteMyRating, getRatingsForProduct, upsertRating } from "../controllers/rating.controller.js";
// import optionalAuth from '../middleware/optionalAuth.js';

// const ratingRouter = Router();

// // Read average/count and optionally myRating (if logged in)
// ratingRouter.get("/:productId", getRatingsForProduct);

// // Create/update requires auth
// ratingRouter.post("/", optionalAuth, upsertRating);

// // Delete my rating requires auth
// ratingRouter.delete("/:productId", optionalAuth, deleteMyRating);


// export default ratingRouter;



import { Router } from "express";
import { deleteMyRating, getRatingsForProduct, upsertRating } from "../controllers/rating.controller.js";
import optionalAuth from "../middleware/optionalAuth.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const ratingRouter = Router();

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
const ratingCache = cacheResponse({
  namespace: "ratings",
  ttlSeconds: THIRTY_DAYS_IN_SECONDS,
});

ratingRouter.get("/:productId", ratingCache, getRatingsForProduct);
ratingRouter.post("/", optionalAuth, upsertRating);
ratingRouter.delete("/:productId", optionalAuth, deleteMyRating);

export default ratingRouter;