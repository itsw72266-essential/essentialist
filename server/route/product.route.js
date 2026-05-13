// import { Router } from 'express'
// import auth from '../middleware/auth.js'
// import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails } from '../controllers/product.controller.js'
// import { admin } from '../middleware/Admin.js'

// const productRouter = Router()

// productRouter.post("/create",auth,admin,createProductController)
// productRouter.post('/get',getProductController)
// productRouter.post("/get-product-by-category",getProductByCategory)
// productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
// productRouter.post('/get-product-details',getProductDetails)

// //update product
// productRouter.put('/update-product-details',auth,admin,updateProductDetails)

// //delete product
// productRouter.delete('/delete-product',auth,admin,deleteProductDetails)

// //search product 
// productRouter.post('/search-product',searchProduct)

// export default productRouter


// product.router.js

// import { Router } from 'express'
// import auth from '../middleware/auth.js'
// // Import the new controller function
// import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails, getProductsByIds, getProductsByCategorySubcategorySlug, getProductBySlug  } from '../controllers/product.controller.js'
// import { admin } from '../middleware/Admin.js'

// const productRouter = Router()

// productRouter.post("/create",auth,admin,createProductController)
// productRouter.post('/get',getProductController)
// productRouter.post("/get-product-by-category",getProductByCategory)
// productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
// productRouter.post('/get-product-details',getProductDetails)

// // Add the new route here
// productRouter.post('/get-by-ids', getProductsByIds);

// //update product
// productRouter.put('/update-product-details',auth,admin,updateProductDetails)

// //delete product
// productRouter.delete('/delete-product',auth,admin,deleteProductDetails)

// //search product 
// productRouter.post('/search-product',searchProduct)

// // Add these lines
// productRouter.post('/by-category-subcategory-slug', getProductsByCategorySubcategorySlug);
// productRouter.post('/by-slug', getProductBySlug);

// export default productRouter



// import { Router } from "express";
// import auth from "../middleware/auth.js";
// import { admin } from "../middleware/Admin.js";
// import {
//   createProductController,
//   deleteProductDetails,
//   getProductByCategory,
//   getProductByCategoryAndSubCategory,
//   getProductController,
//   getProductDetails,
//   searchProduct,
//   updateProductDetails,
//   getProductsByIds,
//   getProductsByCategorySubcategorySlug,
//   getProductBySlug,
//   getProductFilterMetaController
// } from "../controllers/product.controller.js";

// const productRouter = Router();

// productRouter.post("/create", auth, admin, createProductController);
// productRouter.post("/get", getProductController);
// productRouter.post("/get-product-by-category", getProductByCategory);
// productRouter.post(
//   "/get-pruduct-by-category-and-subcategory",
//   getProductByCategoryAndSubCategory
// );
// productRouter.post("/get-product-details", getProductDetails);
// productRouter.post("/get-by-ids", getProductsByIds);
// productRouter.put("/update-product-details", auth, admin, updateProductDetails);
// productRouter.delete("/delete-product", auth, admin, deleteProductDetails);
// productRouter.post("/search-product", searchProduct);
// productRouter.post("/by-category-subcategory-slug", getProductsByCategorySubcategorySlug);
// productRouter.post("/by-slug", getProductBySlug);
// productRouter.post("/filter-meta", getProductFilterMetaController);

// export default productRouter;



import { Router } from "express";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";
import {
  createProductController,
  deleteProductDetails,
  getProductByCategory,
  getProductByCategoryAndSubCategory,
  getProductController,
  getProductDetails,
  searchProduct,
  updateProductDetails,
  getProductsByIds,
  getProductsByCategorySubcategorySlug,
  getProductBySlug,
  getProductFilterMetaController
} from "../controllers/product.controller.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const productRouter = Router();

productRouter.post("/create", auth, admin, createProductController);
productRouter.post(
  "/get",
  cacheResponse({ namespace: "products:list", ttlSeconds: 120 }),
  getProductController
);
productRouter.post(
  "/get-product-by-category",
  cacheResponse({ namespace: "products:by-category", ttlSeconds: 180 }),
  getProductByCategory
);
productRouter.post(
  "/get-product-by-category-and-subcategory",
  cacheResponse({ namespace: "products:category-sub", ttlSeconds: 180 }),
  getProductByCategoryAndSubCategory
);
productRouter.post(
  "/get-product-details",
  cacheResponse({ namespace: "products:details", ttlSeconds: 300 }),
  getProductDetails
);
productRouter.post(
  "/get-by-ids",
  cacheResponse({ namespace: "products:ids", ttlSeconds: 300 }),
  getProductsByIds
);
productRouter.put("/update-product-details", auth, admin, updateProductDetails);
productRouter.delete("/delete-product", auth, admin, deleteProductDetails);
productRouter.post(
  "/search-product",
  cacheResponse({ namespace: "products:search", ttlSeconds: 90 }),
  searchProduct
);
productRouter.post(
  "/by-category-subcategory-slug",
  cacheResponse({ namespace: "products:category-sub", ttlSeconds: 180 }),
  getProductsByCategorySubcategorySlug
);
productRouter.post(
  "/by-slug",
  cacheResponse({ namespace: "products:slug", ttlSeconds: 300 }),
  getProductBySlug
);
productRouter.post(
  "/filter-meta",
  cacheResponse({ namespace: "products:filter-meta", ttlSeconds: 300 }),
  getProductFilterMetaController
);

export default productRouter;