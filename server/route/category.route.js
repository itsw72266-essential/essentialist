// import { Router } from 'express'
// import auth from '../middleware/auth.js'
// import { AddCategoryController, deleteCategoryController, getCategoryController, updateCategoryController } from '../controllers/category.controller.js'

// const categoryRouter = Router()

// categoryRouter.post("/add-category",auth,AddCategoryController)
// categoryRouter.get('/get',getCategoryController)
// categoryRouter.put('/update',auth,updateCategoryController)
// categoryRouter.delete("/delete",auth,deleteCategoryController)

// export default categoryRouter



import { Router } from "express";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";
import {
  AddCategoryController,
  CATEGORY_CACHE_NAMESPACE,
  deleteCategoryController,
  getCategoryController,
  updateCategoryController,
} from "../controllers/category.controller.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const categoryRouter = Router();
const ONE_HOUR_SECONDS = 60 * 60;

categoryRouter.post("/add-category", auth, admin, AddCategoryController);
categoryRouter.get(
  "/get",
  cacheResponse({
    namespace: CATEGORY_CACHE_NAMESPACE,
    ttlSeconds: ONE_HOUR_SECONDS,
  }),
  getCategoryController
);
categoryRouter.put("/update", auth, admin, updateCategoryController);
categoryRouter.delete("/delete", auth, admin, deleteCategoryController);

export default categoryRouter;