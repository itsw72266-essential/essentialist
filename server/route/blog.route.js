
// D:\EssentialistMakeupStore\server\route\blog.route.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";
import {
  createBlogController,
  deleteBlogController,
  getBlogBySlugController,
  getBlogListController,
  updateBlogController
} from "../controllers/blog.controller.js";
import { admin } from "../middleware/Admin.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const blogRouter = Router();

blogRouter.post("/create", auth, admin, createBlogController);
blogRouter.put("/update/:id", auth, admin, updateBlogController);
blogRouter.delete("/delete/:id", auth, admin, deleteBlogController);
blogRouter.get(
  "/list",
  optionalAuth,
  cacheResponse({ namespace: "blogs:list", ttlSeconds: 180 }),
  getBlogListController
);
blogRouter.get(
  "/:slug",
  optionalAuth,
  cacheResponse({ namespace: "blogs:slug", ttlSeconds: 300 }),
  getBlogBySlugController
);

export default blogRouter;