import { getServerSideApiBaseUrl } from "@/lib/serverApiOrigin";
import { buildLanguageAlternates } from "@/lib/seo/localePaths";

/**
 * @typedef {Object} SitemapEntry
 * @property {string} url
 * @property {string} [lastModified]
 * @property {string} [changeFrequency]
 * @property {number} [priority]
 * @property {{ languages: Record<string, string> }} [alternates]
 */

/**
 * @param {SitemapEntry[]} items
 * @param {string} path
 * @param {Omit<SitemapEntry, 'url' | 'alternates'>} options
 */
function pushLocalized(items, path, options) {
  const base = path.startsWith("/") ? path : `/${path}`;
  const languages = buildLanguageAlternates(base);
  const alternates = { languages };

  for (const url of [languages.en, languages.fr]) {
    items.push({
      url,
      ...options,
      alternates,
    });
  }
}

const API_URL = (
  getServerSideApiBaseUrl() ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

function valideURLConvert(str) {
  return (str || "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function fetchJSON(path) {
  try {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** @returns {Promise<SitemapEntry[]>} */
export async function getSitemapEntries() {
  const now = new Date().toISOString();
  /** @type {SitemapEntry[]} */
  const items = [];

  const staticPages = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/new-arrival", changeFrequency: "weekly", priority: 0.8 },
    { path: "/brands", changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", changeFrequency: "monthly", priority: 0.8 },
    { path: "/reviews", changeFrequency: "weekly", priority: 0.7 },
    { path: "/search", changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const page of staticPages) {
    pushLocalized(items, page.path, {
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  let categories = [];
  let subcategories = [];
  let products = [];
  let blogs = [];
  let brands = [];

  const fallbackCategories = [
    { _id: "1", name: "SETTING POWDER", updatedAt: now },
    { _id: "2", name: "Makeup Sets", updatedAt: now },
    { _id: "3", name: "Foundation Makeup", updatedAt: now },
    { _id: "4", name: "Blush Makeup", updatedAt: now },
    { _id: "5", name: "Lip Makeup", updatedAt: now },
    { _id: "6", name: "Eye Makeup", updatedAt: now },
    { _id: "7", name: "Face Makeup", updatedAt: now },
  ];

  const fallbackProducts = [
    { _id: "nyx-1", name: "Total control drop foundation", updatedAt: now },
    { _id: "nyx-2", name: "Dou chromatic lip gloss", updatedAt: now },
    { _id: "la-girl-1", name: "Lip/eye liner pencil 3 in 1", updatedAt: now },
  ];

  const data = await fetchJSON("/api/next/sitemap-data");
  if (data) {
    categories = data.categories || fallbackCategories;
    subcategories = data.subcategories || [];
    products = data.products || fallbackProducts;
    blogs = data.blogs || [];
    brands = data.brands || [];
  } else {
    categories = fallbackCategories;
    products = fallbackProducts;
  }

  for (const cat of categories) {
    const catPath = `/${valideURLConvert(cat.name)}-${cat._id}`;
    pushLocalized(items, catPath, {
      lastModified: cat.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const prod of products) {
    const prodPath = `/product/${valideURLConvert(prod.name)}-${prod._id}`;
    pushLocalized(items, prodPath, {
      lastModified: prod.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const sub of subcategories) {
    const cat = Array.isArray(sub.category) ? sub.category[0] : sub.category;
    if (!cat?._id || !sub?.name) continue;
    const catSlug = `${valideURLConvert(cat.name)}-${cat._id}`;
    const subSlug = `${valideURLConvert(sub.name)}-${sub._id}`;
    pushLocalized(items, `/${catSlug}/${subSlug}`, {
      lastModified: sub.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.65,
    });
  }

  for (const brand of brands) {
    const slug =
      brand.slug || valideURLConvert(brand.name) || String(brand._id || "");
    if (!slug) continue;
    pushLocalized(items, `/brands/${slug}`, {
      lastModified: brand.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const blog of blogs) {
    pushLocalized(items, `/blog/${blog.slug}`, {
      lastModified: blog.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return items;
}
