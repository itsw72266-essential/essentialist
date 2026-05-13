import mongoose from "mongoose";
import slugify from "slugify";
import BlogModel from "../models/blog.model.js";
import UserModel from "../models/user.model.js";
import { invalidateCacheNamespaces } from "../middleware/cache.middleware.js";
import {
  buildVaryHeader,
  getRequestLocale,
  localizeBlog,
  sanitizeTranslations,
} from "../utils/localization.js";

// Cache for a month 
const DEFAULT_CACHE = { maxAge: 2592000, sMaxAge: 2592000 };
const BLOG_CACHE_NAMESPACES = ["blogs:list", "blogs:slug"];

const setCacheHeaders = (res, cache = DEFAULT_CACHE) => {
  if (!res || !cache) return;
  res.set(
    "Cache-Control",
    `public, max-age=${cache.maxAge}, s-maxage=${cache.sMaxAge}`
  );
  res.set("Vary", buildVaryHeader());
};

const safeInvalidateBlogCache = async () => {
  try {
    await invalidateCacheNamespaces(BLOG_CACHE_NAMESPACES);
  } catch (error) {
    console.error("[blog] Cache invalidation error:", error);
  }
};

const slugifySafe = (value = "") =>
  slugify(value, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });

const stripHtml = (input = "") => input.replace(/<[^>]*>/g, " ");

const calculateReadingTime = (content = "") => {
  const plain = stripHtml(content || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return 1;
  const words = plain.split(" ").length;
  return Math.max(1, Math.ceil(words / 200));
};

const normalizeTags = (tags) => {
  const array = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
    ? tags.split(",")
    : [];
  return [...new Set(array.map((t) => String(t).trim()).filter(Boolean))];
};

const createExcerpt = (inputExcerpt, content) => {
  if (inputExcerpt?.trim()) return inputExcerpt.trim();
  const plain = stripHtml(content || "").replace(/\s+/g, " ").trim();
  if (!plain) return "";
  return plain.length > 220 ? `${plain.slice(0, 217).trim()}...` : plain;
};

const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = slugifySafe(title || "");
  let slugCandidate = baseSlug;
  let counter = 1;

  const isSlugTaken = async (slugValue) => {
    const query = { slug: slugValue };
    if (excludeId) query._id = { $ne: excludeId };
    return BlogModel.exists(query);
  };

  while (await isSlugTaken(slugCandidate)) {
    slugCandidate = `${baseSlug}-${counter++}`;
  }
  return slugCandidate;
};

// --- CONTROLLERS ---

export const createBlogController = async (request, response) => {
  try {
    const { title, excerpt, coverImage, content, tags, status, metaTitle, metaDescription, translations } = request.body;

    if (!title?.trim() || !content?.trim()) {
      return response.status(400).json({ message: "Title and Content are required", error: true, success: false });
    }

    const normalizedStatus = ["draft", "published", "archived"].includes(status) ? status : "draft";
    const slug = await generateUniqueSlug(title.trim());
    
    const blog = await BlogModel.create({
      title: title.trim(),
      slug,
      excerpt: createExcerpt(excerpt, content),
      coverImage,
      content,
      tags: normalizeTags(tags),
      status: normalizedStatus,
      metaTitle,
      metaDescription,
      translations: sanitizeTranslations(translations, [
        "title",
        "excerpt",
        "content",
        "tags",
        "metaTitle",
        "metaDescription"
      ]),
      readingTime: calculateReadingTime(content),
      author: request.userId || null,
      publishedAt: normalizedStatus === "published" ? new Date() : null
    });

    await safeInvalidateBlogCache();
    return response.status(201).json({ message: "Blog created", data: blog, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const getBlogListController = async (request, response) => {
  try {
    const locale = getRequestLocale(request);
    // 1. Extract and Sanitize Pagination Parameters
    const {
      page = 1,
      limit = 12,
      search = "",
      status,
      sort = "newest",
      scope = "public"
    } = request.query;

    const numericPage = Math.max(Number(page) || 1, 1);
    const numericLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const skip = (numericPage - 1) * numericLimit;

    // 2. Access Control Check
    const isAdminScope = scope === "admin";
    if (isAdminScope) {
      const adminUser = await UserModel.findById(request.userId).select("role");
      if (adminUser?.role !== "ADMIN") {
        return response.status(403).json({ message: "Admin access required", error: true, success: false });
      }
    }

    // 3. Build the Query Object
    const query = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }];
    }

    if (isAdminScope) {
      if (status && status !== "all") query.status = status;
    } else {
      query.status = "published";
    }

    // 4. Sorting Logic
    const sortMap = {
      newest: { publishedAt: -1, createdAt: -1 },
      oldest: { publishedAt: 1, createdAt: 1 }
    };

    // 5. Database Execution (Run Count and Find in Parallel)
    const [blogs, totalCount] = await Promise.all([
      BlogModel.find(query)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(numericLimit)
        .select(isAdminScope ? undefined : "-content")
        .lean(),
      BlogModel.countDocuments(query)
    ]);

    

    if (!isAdminScope) setCacheHeaders(response);

    // 6. Return Response with Pagination Metadata
    return response.json({
      message: "Blog list fetched successfully",
      data: blogs.map((blog) => localizeBlog(blog, locale)),
      currentPage: numericPage,
      limit: numericLimit,
      totalCount,
      totalPages: Math.ceil(totalCount / numericLimit),
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const updateBlogController = async (request, response) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ message: "Invalid ID", error: true, success: false });
    }

    const blog = await BlogModel.findById(id);
    if (!blog) return response.status(404).json({ message: "Blog not found" });

    const updates = request.body;
    if (updates.title && updates.title !== blog.title) {
      blog.title = updates.title.trim();
      blog.slug = await generateUniqueSlug(blog.title, blog._id);
    }

    if (updates.content) {
      blog.content = updates.content;
      blog.readingTime = calculateReadingTime(updates.content);
      blog.excerpt = updates.excerpt || createExcerpt("", updates.content);
    }

    // Apply other updates
    const fields = ["excerpt", "coverImage", "tags", "metaTitle", "metaDescription", "status"];
    fields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === "tags") blog.tags = normalizeTags(updates.tags);
        else if (field === "status") {
           if (updates.status === "published" && !blog.publishedAt) blog.publishedAt = new Date();
           blog.status = updates.status;
        } else {
           blog[field] = updates[field];
        }
      }
    });

    if (updates.translations !== undefined) {
      blog.translations = sanitizeTranslations(updates.translations, [
        "title",
        "excerpt",
        "content",
        "tags",
        "metaTitle",
        "metaDescription"
      ]);
    }

    await blog.save();
    await safeInvalidateBlogCache();

    return response.json({ message: "Blog updated", data: blog, success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const deleteBlogController = async (request, response) => {
  try {
    const deletion = await BlogModel.findByIdAndDelete(request.params.id);
    if (!deletion) return response.status(404).json({ message: "Blog not found" });
    
    await safeInvalidateBlogCache();
    return response.json({ message: "Blog deleted", success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};

export const getBlogBySlugController = async (request, response) => {
  try {
    const locale = getRequestLocale(request);
    const { slug } = request.params;
    const preview = request.query.preview === "true";

    const query = { slug };
    if (!preview) query.status = "published";
    else {
        const adminUser = await UserModel.findById(request.userId);
        if (adminUser?.role !== "ADMIN") return response.status(403).json({ message: "Unauthorized" });
    }

    const blog = await BlogModel.findOne(query).populate("author", "name email").lean();
    if (!blog) return response.status(404).json({ message: "Blog not found" });

    if (!preview) setCacheHeaders(response, { maxAge: 180, sMaxAge: 900 });

    return response.json({ data: localizeBlog(blog, locale), success: true });
  } catch (error) {
    return response.status(500).json({ message: error.message, error: true, success: false });
  }
};
