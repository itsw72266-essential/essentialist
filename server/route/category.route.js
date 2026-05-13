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
import {
  AddCategoryController,
  CATEGORY_CACHE_NAMESPACE,
  deleteCategoryController,
  getCategoryController,
  updateCategoryController,
} from "../controllers/category.controller.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const categoryRouter = Router();
const ONE_MONTH_SECONDS = 60 * 60 * 24 * 30;

categoryRouter.post("/add-category", auth, AddCategoryController);
categoryRouter.get(
  "/get",
  cacheResponse({
    namespace: CATEGORY_CACHE_NAMESPACE,
    ttlSeconds: ONE_MONTH_SECONDS,
  }),
  getCategoryController
);
categoryRouter.put("/update", auth, updateCategoryController);
categoryRouter.delete("/delete", auth, deleteCategoryController);

export default categoryRouter;