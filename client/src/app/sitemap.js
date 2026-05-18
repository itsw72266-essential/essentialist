//D:\essentialist_next_ecommerce\client\src\app\sitemap.js
import { getServerSideApiBaseUrl } from "@/lib/serverApiOrigin";
import { SITE_ORIGIN, localizePath } from "@/lib/seo/localePaths";

function pushLocalized(items, path, options) {
  const base = path.startsWith("/") ? path : `/${path}`;
  items.push({
    url: `${SITE_ORIGIN}${base}`,
    ...options,
  });
  items.push({
    url: `${SITE_ORIGIN}${localizePath(base, "fr")}`,
    ...options,
  });
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
  return (str || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

async function fetchJSON(path) {
  const url = `${API_URL}${path}`;
  
  // Notice we kept the 24 hour cache!
  const res = await fetch(url, {
    next: { revalidate: 86400 } 
  });
  
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
}

export default async function sitemap() {
  const now = new Date().toISOString();
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
    { _id: '1', name: 'SETTING POWDER', updatedAt: new Date().toISOString() },
    { _id: '2', name: 'Makeup Sets', updatedAt: new Date().toISOString() },
    { _id: '3', name: 'Foundation Makeup', updatedAt: new Date().toISOString() },
    { _id: '4', name: 'Blush Makeup', updatedAt: new Date().toISOString() },
    { _id: '5', name: 'Lip Makeup', updatedAt: new Date().toISOString() },
    { _id: '6', name: 'Eye Makeup', updatedAt: new Date().toISOString() },
    { _id: '7', name: 'Face Makeup', updatedAt: new Date().toISOString() },
  ];

  const fallbackProducts = [
    { _id: 'nyx-1', name: 'Total control drop foundation', updatedAt: new Date().toISOString(), subCategory: '3' },
    { _id: 'nyx-2', name: 'Dou chromatic lip gloss', updatedAt: new Date().toISOString(), subCategory: '5' },
    { _id: 'la-girl-1', name: 'Lip/eye liner pencil 3 in 1', updatedAt: new Date().toISOString(), subCategory: '6' },
  ];

  try {
    // 🔥 THE FIX: Fetching from our new, fast endpoint!
    const data = await fetchJSON('/api/next/sitemap-data');
    
    categories = data.categories || fallbackCategories;
    subcategories = data.subcategories || [];
    products = data.products || fallbackProducts;
    blogs = data.blogs || [];
    brands = data.brands || [];
  } catch (err) {
    console.error('Failed to fetch sitemap data:', err);
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
      brand.slug ||
      valideURLConvert(brand.name) ||
      String(brand._id || "");
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