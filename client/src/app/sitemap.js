import { getServerSideApiBaseUrl } from "@/lib/serverApiOrigin";
import { buildLanguageAlternates } from "@/lib/seo/localePaths";
import {
  buildCategoryPath,
  buildProductPath,
  buildSubCategoryPath,
  slugifyName,
} from "@/lib/catalogSlugs";
import { getAllLocalSeoGuideSlugs } from "@/lib/seo/localSeoGuides";

/**
 * @param {import("next").MetadataRoute.Sitemap} items
 * @param {string} path
 * @param {Omit<import("next").MetadataRoute.Sitemap[number], "url" | "alternates">} options
 */
function pushLocalized(items, path, options) {
  const base = path.startsWith("/") ? path : `/${path}`;
  const languages = buildLanguageAlternates(base);

  // List the EN and FR URLs as separate <url> entries instead of bundling the French
  // version as an <xhtml:link> alternate. hreflang already lives in every page's <head>
  // (a valid, single place for it), so the sitemap doesn't need to repeat it. Dropping
  // the XHTML-namespaced tags also lets Chrome render the sitemap as a clean indented
  // tree again, while both language URLs stay listed for discovery.
  items.push({ url: languages.en, ...options });
  items.push({ url: languages.fr, ...options });
}

const API_URL = (
  getServerSideApiBaseUrl() ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

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

// Stable last-modified for genuinely static pages/guides. Bump this only when the
// static pages themselves meaningfully change. Using `now` here would re-stamp these
// URLs on every ~24h regeneration even though they didn't change, which teaches Google
// to distrust our `lastmod` and wastes crawl budget re-fetching unchanged pages.
const STATIC_LAST_MODIFIED = "2026-06-27T00:00:00.000Z";

export default async function sitemap() {
  const now = new Date().toISOString();
  /** @type {import("next").MetadataRoute.Sitemap} */
  const items = [];

  const staticPages = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/new-arrival", changeFrequency: "weekly", priority: 0.8 },
    { path: "/brands", changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", changeFrequency: "monthly", priority: 0.8 },
    { path: "/guides", changeFrequency: "monthly", priority: 0.75 },
    { path: "/reviews", changeFrequency: "weekly", priority: 0.7 },
    { path: "/search", changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const page of staticPages) {
    pushLocalized(items, page.path, {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  for (const guideSlug of getAllLocalSeoGuideSlugs()) {
    pushLocalized(items, `/guides/${guideSlug}`, {
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
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
    const catPath = buildCategoryPath(cat);
    pushLocalized(items, catPath, {
      lastModified: cat.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const prod of products) {
    const prodPath = buildProductPath(prod);
    pushLocalized(items, prodPath, {
      lastModified: prod.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const sub of subcategories) {
    const cat = Array.isArray(sub.category) ? sub.category[0] : sub.category;
    if (!cat?._id || !sub?.name) continue;
    pushLocalized(items, buildSubCategoryPath(cat, sub), {
      lastModified: sub.updatedAt || now,
      changeFrequency: "weekly",
      priority: 0.65,
    });
  }

  for (const brand of brands) {
    const slug =
      brand.slug || slugifyName(brand.name) || String(brand._id || "");
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
