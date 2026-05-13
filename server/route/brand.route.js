// import { Router } from "express";
// import auth from "../middleware/auth.js";
// import { admin } from "../middleware/Admin.js";
// import {
//   createBrandController,
//   getBrandsController,
//   getBrandDetailsController,
//   updateBrandController,
//   deleteBrandController
// } from "../controllers/brand.controller.js";

// const brandRouter = Router();

// brandRouter.post("/create", auth, admin, createBrandController);
// brandRouter.get("/list", getBrandsController);
// brandRouter.get("/:identifier", getBrandDetailsController);
// brandRouter.put("/update/:id", auth, admin, updateBrandController);
// brandRouter.delete("/delete/:id", auth, admin, deleteBrandController);

// export default brandRouter;


//D:\EssentialistMakeupStore\server\route\brand.route.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";
import {
  createBrandController,
  getBrandsController,
  getBrandDetailsController,
  updateBrandController,
  deleteBrandController
} from "../controllers/brand.controller.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const brandRouter = Router();

brandRouter.post("/create", auth, admin, createBrandController);
brandRouter.get(
  "/list",
  cacheResponse({ namespace: "brands:list", ttlSeconds: 600 }),
  getBrandsController
);
brandRouter.get(
  "/:identifier",
  cacheResponse({ namespace: "brands:details", ttlSeconds: 600 }),
  getBrandDetailsController
);
brandRouter.put("/update/:id", auth, admin, updateBrandController);
brandRouter.delete("/delete/:id", auth, admin, deleteBrandController);

export default brandRouter;