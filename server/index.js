// // path: server/index.js
// import dns from 'node:dns';
// dns.setDefaultResultOrder('ipv4first');
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
// import hpp from "hpp";
// import pinoHttp from "pino-http";
// import mongoose from "mongoose";
// import morgan from "morgan";
// import compression from "compression";
// import fetch from "node-fetch";
// import { Parser } from "xml2js";

// import connectDB from "./config/connectDB.js";
// import { ensureRedisConnection } from "./config/redisClient.js";

// import userRouter from "./route/user.route.js";
// import categoryRouter from "./route/category.route.js";
// import uploadRouter from "./route/upload.router.js";
// import subCategoryRouter from "./route/subCategory.route.js";
// import productRouter from "./route/product.route.js";
// import cartRouter from "./route/cart.route.js";
// import addressRouter from "./route/address.route.js";
// import orderRouter from "./route/order.route.js";
// import adminRouter from "./route/admin.routes.js";
// import ratingRouter from "./route/rating.router.js";
// import reviewRouter from "./route/review.router.js";
// import paymentRoutes from "./route/payments.js";
// import indexnowRoutes from "./route/indexnow.js";
// import brandRouter from "./route/brand.route.js";
// import guestAdminRouter from "./route/guestadmin.route.js";
// import blogRouter from "./route/blog.route.js";

// import indexnowNotifierMiddleware from "./middleware/indexnowNotifier.js";

// import ProductModel from "./models/product.model.js";
// import CategoryModel from "./models/category.model.js";
// import SubCategoryModel from "./models/subCategory.model.js";
// import BlogModel from "./models/blog.model.js";
// import RatingModel from "./models/rating.model.js";
// import ReviewModel from "./models/review.model.js";

// import "./jobs/receiptRegenerator.js";

// import slugify from "slugify";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 1010;

// app.disable("x-powered-by");
// app.set("trust proxy", 1);

// const allowedOrigins = [
//   process.env.FRONTEND_URL,
//   process.env.FRONTEND_URL_WWW,
//   process.env.LOCAL_FRONTEND_1,
//   process.env.LOCAL_FRONTEND_2,
// ].filter(Boolean);

// const corsOptions = allowedOrigins.length
//   ? { origin: allowedOrigins, credentials: true }
//   : { origin: true, credentials: true };

// app.use(cors(corsOptions));

// const enableHttpLogs = process.env.ENABLE_HTTP_LOGS === "true";

// if (enableHttpLogs) {
//   app.use(
//     pinoHttp({
//       level: process.env.NODE_ENV === "production" ? "info" : "debug",
//       redact: ["req.headers.authorization", "req.headers.cookie"],
//       autoLogging: {
//         ignore: (req) => req.url === "/health",
//       },
//     })
//   );
// }

// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );

// const bodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";
// const jsonParser = express.json({ limit: bodyLimit });

// const urlEncodedParser = express.urlencoded({
//   extended: true,
//   limit: bodyLimit,
// });
// const rawStripeParser = express.raw({
//   type: "application/json",
//   limit: bodyLimit,
// });

// app.use((req, res, next) => {
//   if (req.originalUrl === "/api/order/webhook") {
//     return rawStripeParser(req, res, next);
//   }

//   return jsonParser(req, res, (jsonErr) => {
//     if (jsonErr) return next(jsonErr);
//     return urlEncodedParser(req, res, next);
//   });
// });

// app.use(cookieParser());
// // app.use(morgan("dev"));
// app.use(
//   morgan("dev", {
//     skip: (req) => req.path.startsWith("/api/ratings") || req.path.startsWith("/api/reviews"),
//   })
// );

// app.use(mongoSanitize({ allowDots: true, replaceWith: "_" }));
// app.use(hpp());

// app.get("/", (req, res) => {
//   res.json({
//     message: "Server is running " + PORT,
//   });
// });

// app.get("/health", async (req, res) => {
//   const redisCheck = await (async () => {
//     try {
//       const result = await ensureRedisConnection({ force: false });
//       return result.ok ? result.pong || "ok" : result.reason || "error";
//     } catch (error) {
//       return error.message || "error";
//     }
//   })();

//   const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
//   const dbStateIndex = mongoose.connection.readyState;
//   const dbState = dbStates[dbStateIndex] || `state:${dbStateIndex}`;

//   const status =
//     dbState === "connected" &&
//     redisCheck !== "error" &&
//     redisCheck !== "Redis disabled"
//       ? "ok"
//       : "degraded";

//   res.status(status === "ok" ? 200 : 503).json({
//     status,
//     uptime: process.uptime(),
//     timestamp: new Date().toISOString(),
//     services: {
//       database: dbState,
//       redis: redisCheck,
//     },
//   });
// });

// app.use(express.static("public"));
// app.use(indexnowNotifierMiddleware);
// app.use(
//   compression({
//     level: 6,
//     threshold: 1024,
//     filter: (req, res) => {
//       if (req.headers["x-no-compression"]) {
//         return false;
//       }
//       return compression.filter(req, res);
//     },
//   })
// );

// app.use("/api/user", userRouter);
// app.use("/api/category", categoryRouter);
// app.use("/api/file", uploadRouter);
// app.use("/api/subcategory", subCategoryRouter);
// app.use("/api/product", productRouter);
// app.use("/api/cart", cartRouter);
// app.use("/api/address", addressRouter);
// app.use("/api/order", orderRouter);
// app.use("/api/ratings", ratingRouter);
// app.use("/api/reviews", reviewRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/indexnow", indexnowRoutes);
// app.use("/api/brand", brandRouter);
// app.use("/api/blog", blogRouter);
// app.use("/api/admin", guestAdminRouter);

// app.get("/mtn", (req, res) => {
//   res.send("PayUnit MTN Payment API");
// });
// app.get("/orange", (req, res) => {
//   res.send("PayUnit ORANGE Payment API");
// });
// app.get("/payunit", (req, res) => {
//   res.send("PayUnit Payment API");
// });
// app.get("/payunit/return", (req, res) => {
//   res.send("PayUnit Return URL");
// });

// const escapeXml = (unsafe = "") =>
//   unsafe.replace(/[<>&'"]/g, (c) => {
//     switch (c) {
//       case "<":
//         return "&lt;";
//       case ">":
//         return "&gt;";
//       case "&":
//         return "&amp;";
//       case "'":
//         return "&apos;";
//       case '"':
//         return "&quot;";
//       default:
//         return c;
//     }
//   });

// const formatDate = (date) => {
//   if (!date) return "";
//   const d = typeof date === "string" ? new Date(date) : date;
//   return d.toISOString().split("T")[0];
// };

// const formatSlug = (name = "") => slugify(name, { lower: true, strict: true });

// app.get("/sitemap.xml", async (req, res) => {
//   try {
//     const baseUrl =
//       process.env.FRONTEND_URL?.replace(/\/$/, "") ||
//       "https://www.esmakeupstore.com";

//     const [
//       categories,
//       subCategories,
//       products,
//       blogs,
//       ratingStats,
//       reviewStats,
//     ] = await Promise.all([
//       CategoryModel.find(),
//       SubCategoryModel.find(),
//       ProductModel.find({ publish: true }),
//       BlogModel.find({ status: "published" }).select("slug updatedAt coverImage"),
//       RatingModel.aggregate([
//         {
//           $addFields: {
//             productRef: { $ifNull: ["$product", "$productId"] },
//             ratingValue: { $ifNull: ["$rating", "$value"] },
//           },
//         },
//         {
//           $match: {
//             productRef: { $ne: null },
//             ratingValue: { $gt: 0 },
//           },
//         },
//         {
//           $group: {
//             _id: "$productRef",
//             averageRating: { $avg: "$ratingValue" },
//             ratingCount: { $sum: 1 },
//           },
//         },
//       ]),
//       ReviewModel.aggregate([
//         {
//           $addFields: {
//             productRef: { $ifNull: ["$product", "$productId"] },
//           },
//         },
//         {
//           $match: {
//             productRef: { $ne: null },
//           },
//         },
//         {
//           $group: {
//             _id: "$productRef",
//             reviewCount: { $sum: 1 },
//           },
//         },
//       ]),
//     ]);

//     const ratingMap = new Map(
//       ratingStats.map((stat) => [String(stat._id), stat])
//     );
//     const reviewMap = new Map(
//       reviewStats.map((stat) => [String(stat._id), stat])
//     );

//     const urls = [];

//     const staticPages = [
//       { path: "/", changefreq: "daily" },
//       { path: "/contact", changefreq: "monthly" },
//       { path: "/new-arrival", changefreq: "monthly" },
//       { path: "/brands", changefreq: "monthly" },
//       { path: "/blog", changefreq: "weekly" },
//       { path: "/reviews", changefreq: "weekly" },
//     ];

//     staticPages.forEach(({ path, changefreq }) => {
//       urls.push(
//         `<url>
//   <loc>${baseUrl}${path}</loc>
//   <changefreq>${changefreq}</changefreq>
// </url>`
//       );
//     });

//     categories.forEach((cat) => {
//       const catUrl = `${baseUrl}/${formatSlug(cat.name)}-${cat._id}`;
//       urls.push(
//         `<url>
//   <loc>${catUrl}</loc>
//   ${cat.updatedAt ? `<lastmod>${formatDate(cat.updatedAt)}</lastmod>` : ""}
//   <changefreq>weekly</changefreq>
//   ${
//     cat.image
//       ? `<image:image><image:loc>${escapeXml(
//           cat.image
//         )}</image:loc></image:image>`
//       : ""
//   }
// </url>`
//       );
//     });

//     subCategories.forEach((sub) => {
//       const parentCat = categories.find(
//         (c) => String(c._id) === String(sub.category?.[0])
//       );
//       if (!parentCat) return;

//       const subUrl = `${baseUrl}/${formatSlug(parentCat.name)}-${
//         parentCat._id
//       }/${formatSlug(sub.name)}-${sub._id}`;

//       urls.push(
//         `<url>
//   <loc>${subUrl}</loc>
//   ${sub.updatedAt ? `<lastmod>${formatDate(sub.updatedAt)}</lastmod>` : ""}
//   <changefreq>weekly</changefreq>
//   ${
//     sub.image
//       ? `<image:image><image:loc>${escapeXml(
//           sub.image
//         )}</image:loc></image:image>`
//       : ""
//   }
// </url>`
//       );
//     });

//     products.forEach((prod) => {
//       const prodId = String(prod._id);
//       const prodUrl = `${baseUrl}/product/${formatSlug(prod.name)}-${prodId}`;

//       const imageList = Array.isArray(prod.image)
//         ? prod.image.filter(Boolean)
//         : [];

//       const imageTags = imageList
//         .map(
//           (imgUrl) =>
//             `<image:image><image:loc>${escapeXml(
//               imgUrl
//             )}</image:loc></image:image>`
//         )
//         .join("\n");

//       urls.push(
//         `<url>
//   <loc>${prodUrl}</loc>
//   ${prod.updatedAt ? `<lastmod>${formatDate(prod.updatedAt)}</lastmod>` : ""}
//   <changefreq>weekly</changefreq>
//   ${imageTags}
// </url>`
//       );
//     });

//     blogs.forEach((blog) => {
//       const blogUrl = `${baseUrl}/blog/${blog.slug}`;
//       urls.push(
//         `<url>
//   <loc>${blogUrl}</loc>
//   ${blog.updatedAt ? `<lastmod>${formatDate(blog.updatedAt)}</lastmod>` : ""}
//   <changefreq>weekly</changefreq>
//   ${
//     blog.coverImage
//       ? `<image:image><image:loc>${escapeXml(
//           blog.coverImage
//         )}</image:loc></image:image>`
//       : ""
//   }
// </url>`
//       );
//     });

//     const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset
//   xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
// ${urls.join("\n")}
// </urlset>`;

//     res.header("Content-Type", "application/xml");
//     res.send(xml);
//   } catch (error) {
//     console.error("Sitemap error:", error);
//     res.status(500).send("Could not generate sitemap");
//   }
// });

// const INDEXNOW_HOST = "www.esmakeupstore.com";
// const INDEXNOW_KEY = "be1ca4afe49842e29f9fcb46c96f89a9";
// const INDEXNOW_KEY_LOCATION =
//   "https://www.esmakeupstore.com/be1ca4afe49842e29f9fcb46c96f89a9.txt";

// const extractUrlsFromSitemap = async (xml) => {
//   const parser = new Parser();
//   const result = await parser.parseStringPromise(xml);
//   let urls = [];

//   if (result.urlset?.url) {
//     urls = result.urlset.url.map((u) => u.loc?.[0]).filter(Boolean);
//   } else if (result.sitemapindex?.sitemap) {
//     for (const sitemap of result.sitemapindex.sitemap) {
//       const loc = sitemap.loc?.[0];
//       if (loc) {
//         const subXml = await fetch(loc).then((r) => r.text());
//         const nested = await extractUrlsFromSitemap(subXml);
//         urls = urls.concat(nested);
//       }
//     }
//   }

//   return urls;
// };

// const submitToIndexNow = async (urlList) => {
//   const payload = {
//     host: INDEXNOW_HOST,
//     key: INDEXNOW_KEY,
//     keyLocation: INDEXNOW_KEY_LOCATION,
//     urlList,
//   };

//   const response = await fetch("https://api.indexnow.org/indexnow", {
//     method: "POST",
//     headers: { "Content-Type": "application/json; charset=utf-8" },
//     body: JSON.stringify(payload),
//   });

//   if (response.ok) {
//     return { ok: true, count: urlList.length };
//   }

//   const text = await response.text();
//   return { ok: false, status: response.status, text };
// };

// app.get("/indexnow-submit-sitemap", async (req, res) => {
//   try {
//     const sitemapUrl = `${
//       process.env.FRONTEND_URL?.replace(/\/$/, "") ||
//       "https://www.esmakeupstore.com"
//     }/sitemap.xml`;

//     const xml = await fetch(sitemapUrl).then((r) => r.text());
//     const urls = await extractUrlsFromSitemap(xml);

//     if (!urls.length) {
//       return res.status(404).json({ error: "No URLs found in sitemap" });
//     }

//     const BATCH = 10000;
//     const results = [];

//     for (let i = 0; i < urls.length; i += BATCH) {
//       const batch = urls.slice(i, i + BATCH);
//       const result = await submitToIndexNow(batch);
//       results.push(result);
//     }

//     res.json({
//       message: "Submitted URLs to IndexNow",
//       total: urls.length,
//       batches: results,
//     });
//   } catch (error) {
//     console.error("IndexNow submit error:", error);
//     res.status(500).json({ error: error.message || error.toString() });
//   }
// });

// ensureRedisConnection().catch((error) => {
//   console.error("[redis] Startup ping failed:", error);
// });

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log("Server is running", PORT);
//   });
// });




// D:\EssentialistMakeupStore\server\index.js
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import pinoHttp from "pino-http";
import mongoose from "mongoose";
import morgan from "morgan";
import compression from "compression";
import fetch from "node-fetch";
import { Parser } from "xml2js";

import connectDB from "./config/connectDB.js";
import { ensureRedisConnection } from "./config/redisClient.js";

import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import uploadRouter from "./route/upload.router.js";
import subCategoryRouter from "./route/subCategory.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import addressRouter from "./route/address.route.js";
import orderRouter from "./route/order.route.js";
import adminRouter from "./route/admin.routes.js";
import ratingRouter from "./route/rating.router.js";
import reviewRouter from "./route/review.router.js";
import paymentRoutes from "./route/payments.js";
import indexnowRoutes from "./route/indexnow.js";
import brandRouter from "./route/brand.route.js";
import guestAdminRouter from "./route/guestadmin.route.js";
import blogRouter from "./route/blog.route.js";

import indexnowNotifierMiddleware from "./middleware/indexnowNotifier.js";

import ProductModel from "./models/product.model.js";
import CategoryModel from "./models/category.model.js";
import SubCategoryModel from "./models/subCategory.model.js";
import BlogModel from "./models/blog.model.js";
import RatingModel from "./models/rating.model.js";
import ReviewModel from "./models/review.model.js";

import "./jobs/receiptRegenerator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1010;

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
  process.env.LOCAL_FRONTEND_1,
  process.env.LOCAL_FRONTEND_2,
].filter(Boolean);

const corsOptions = allowedOrigins.length
  ? { origin: allowedOrigins, credentials: true }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));

const enableHttpLogs = process.env.ENABLE_HTTP_LOGS === "true";

if (enableHttpLogs) {
  app.use(
    pinoHttp({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      redact: ["req.headers.authorization", "req.headers.cookie"],
      autoLogging: {
        ignore: (req) => req.url === "/health",
      },
    })
  );
}

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const bodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";
const jsonParser = express.json({ limit: bodyLimit });

const urlEncodedParser = express.urlencoded({
  extended: true,
  limit: bodyLimit,
});
const rawStripeParser = express.raw({
  type: "application/json",
  limit: bodyLimit,
});

app.use((req, res, next) => {
  if (req.originalUrl === "/api/order/webhook") {
    return rawStripeParser(req, res, next);
  }

  return jsonParser(req, res, (jsonErr) => {
    if (jsonErr) return next(jsonErr);
    return urlEncodedParser(req, res, next);
  });
});

app.use(cookieParser());
app.use(
  morgan("dev", {
    skip: (req) => req.path.startsWith("/api/ratings") || req.path.startsWith("/api/reviews"),
  })
);

app.use(mongoSanitize({ allowDots: true, replaceWith: "_" }));
app.use(hpp());

app.get("/", (req, res) => {
  res.json({
    message: "Server is running " + PORT,
  });
});

app.get("/health", async (req, res) => {
  const redisCheck = await (async () => {
    try {
      const result = await ensureRedisConnection({ force: false });
      return result.ok ? result.pong || "ok" : result.reason || "error";
    } catch (error) {
      return error.message || "error";
    }
  })();

  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStateIndex = mongoose.connection.readyState;
  const dbState = dbStates[dbStateIndex] || `state:${dbStateIndex}`;

  const status =
    dbState === "connected" &&
    redisCheck !== "error" &&
    redisCheck !== "Redis disabled"
      ? "ok"
      : "degraded";

  res.status(status === "ok" ? 200 : 503).json({
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: dbState,
      redis: redisCheck,
    },
  });
});

app.use(express.static("public"));
app.use(indexnowNotifierMiddleware);
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payments", paymentRoutes);
app.use("/api/indexnow", indexnowRoutes);
app.use("/api/brand", brandRouter);
app.use("/api/blog", blogRouter);
app.use("/api/admin", guestAdminRouter);

app.get("/mtn", (req, res) => {
  res.send("PayUnit MTN Payment API");
});
app.get("/orange", (req, res) => {
  res.send("PayUnit ORANGE Payment API");
});
app.get("/payunit", (req, res) => {
  res.send("PayUnit Payment API");
});
app.get("/payunit/return", (req, res) => {
  res.send("PayUnit Return URL");
});

// ==========================================================
// NEW LIGHTWEIGHT SITEMAP DATA ENDPOINT FOR NEXT.JS
// ==========================================================
app.get("/api/sitemap-data", async (req, res) => {
  try {
    const [categories, products, blogs] = await Promise.all([
      CategoryModel.find().select('name updatedAt image'),
      ProductModel.find({ publish: true }).select('name updatedAt image'),
      BlogModel.find({ status: "published" }).select('slug updatedAt coverImage')
    ]);

    res.json({ categories, products, blogs });
  } catch (error) {
    console.error("Sitemap data fetch error:", error);
    res.status(500).json({ error: "Failed to fetch sitemap data" });
  }
});


// ==========================================================
// INDEXNOW SUBMISSION LOGIC 
// ==========================================================
const INDEXNOW_HOST = "www.esmakeupstore.com";
const INDEXNOW_KEY = "be1ca4afe49842e29f9fcb46c96f89a9";
const INDEXNOW_KEY_LOCATION =
  "https://www.esmakeupstore.com/be1ca4afe49842e29f9fcb46c96f89a9.txt";

const extractUrlsFromSitemap = async (xml) => {
  const parser = new Parser();
  const result = await parser.parseStringPromise(xml);
  let urls = [];

  if (result.urlset?.url) {
    urls = result.urlset.url.map((u) => u.loc?.[0]).filter(Boolean);
  } else if (result.sitemapindex?.sitemap) {
    for (const sitemap of result.sitemapindex.sitemap) {
      const loc = sitemap.loc?.[0];
      if (loc) {
        const subXml = await fetch(loc).then((r) => r.text());
        const nested = await extractUrlsFromSitemap(subXml);
        urls = urls.concat(nested);
      }
    }
  }

  return urls;
};

const submitToIndexNow = async (urlList) => {
  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList,
  };

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return { ok: true, count: urlList.length };
  }

  const text = await response.text();
  return { ok: false, status: response.status, text };
};

app.get("/indexnow-submit-sitemap", async (req, res) => {
  try {
    const sitemapUrl = `${
      process.env.FRONTEND_URL?.replace(/\/$/, "") ||
      "https://www.esmakeupstore.com"
    }/sitemap.xml`;

    // This will now successfully fetch the generated XML from your Next.js app!
    const xml = await fetch(sitemapUrl).then((r) => r.text());
    const urls = await extractUrlsFromSitemap(xml);

    if (!urls.length) {
      return res.status(404).json({ error: "No URLs found in sitemap" });
    }

    const BATCH = 10000;
    const results = [];

    for (let i = 0; i < urls.length; i += BATCH) {
      const batch = urls.slice(i, i + BATCH);
      const result = await submitToIndexNow(batch);
      results.push(result);
    }

    res.json({
      message: "Submitted URLs to IndexNow",
      total: urls.length,
      batches: results,
    });
  } catch (error) {
    console.error("IndexNow submit error:", error);
    res.status(500).json({ error: error.message || error.toString() });
  }
});

ensureRedisConnection().catch((error) => {
  console.error("[redis] Startup ping failed:", error);
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running", PORT);
  });
});