// // client/src/app/[category]/[subCategory]/page.jsx
// import { notFound } from "next/navigation";
// import SummaryApi, { callSummaryApi } from "@/common/SummaryApi";
// import SubCategoryClientBlock from "./SubCategoryClientBlock";

// const PAGE_SIZE = 8;
// const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/i;

// const subCategoryBestTitles = {
//   Foundation: "Transfer Proof Foundation For Masks",
//   "Foundation Makeup": "Foundation Shade Finder Kit",
//   "Liquid Foundation": "Lightweight Liquid Foundation For Acne Prone Skin",
//   "Powder Foundation": "Buildable Powder Foundation For Mature Skin",
//   "Stick foundation": "Stick Foundation For Oily Skin",
//   "Total Control Drop Foundation": "Drop Foundation Full Coverage Adjustable",
//   "Foundation Primers": "Gripping Primer For Long Wear Makeup",
//   "Face Primer": "Pore Blurring Primer For Oily Skin",
//   "Tinted Moisturizer": "Tinted Moisturizer With SPF For Oily Skin",
//   "Setting Spray": "Alcohol Free Setting Spray For Dry Skin",
//   "SETTING POWDER": "No Flashback Setting Powder",
//   "All Setting Powder": "Translucent Setting Powder For Oily Skin",
//   Concealer: "Full Coverage Concealer For Dark Circles",
//   "Concealers & Neutralizers": "Peach Color Corrector For Dark Circles",
//   "Dark circle concealer": "Orange Concealer For Dark Circles",
//   "Blush Makeup": "Cream Blush For Mature Skin That Doesn’t Settle",
//   "All Blush": "Best Affordable Blush For Fair Skin",
//   "High Definition Blush": "HD Cream Blush For Camera Ready Look",
//   "Highlighters & Luminizers": "Subtle Highlighter For Mature Skin",
//   Illuminator: "Liquid Illuminator Under Foundation",
//   "Liquid highlighter": "Dewy Liquid Highlighter For Natural Glow",
//   Bronzy: "Subtle Bronzy Makeup Look Products",
//   "Bronzy Powder": "Warm Bronzer Powder For Olive Skin",
//   "Matte bronzer": "Matte Bronzer For Fair Cool Undertone",
//   "Eye Makeup": "Everyday Eye Makeup Kit For Beginners",
//   "Eye Shadow": "Neutral Eyeshadow For Blue Eyes",
//   "Eye Shadow Palette": "Mini Eyeshadow Palette For Travel",
//   Eyeliner: "Smudge Proof Eyeliner For Oily Lids",
//   Kajal: "Long Lasting Kajal For Watery Eyes",
//   Mascara: "Tubing Mascara For Short Lashes",
//   "Eye Cream & Treatment": "Eye Cream For Dark Circles And Puffiness Under $30",
//   "EYE CREAM": "Fragrance Free Eye Cream For Sensitive Skin",
//   "Eye Serum": "Retinol Eye Serum For Fine Lines",
//   "Eye brow cake powder": "Eyebrow Cake Powder For Sparse Brows",
//   "Eye Brow Enhancers": "Tinted Brow Gel For Thin Eyebrows",
//   "Lip Makeup": "Lip Makeup Set Gift For Her",
//   Lipstick: "Transfer Proof Lipstick For Weddings",
//   "Liquid Lipstick": "Comfortable Liquid Lipstick Non Drying",
//   "Matte Lip Sticks": "Matte Lipstick Set Nude",
//   "Lip Gloss": "Non Sticky Lip Gloss Set",
//   "Lip Lacquer": "High Shine Lip Lacquer Long Wear",
//   "Lip Liner": "Waterproof Lip Liner Nude Shades",
//   "Lip Plumper": "Cinnamon Lip Plumper Gloss",
//   "Lip Tint": "Long Lasting Lip Tint Waterproof",
//   "Lip Crayon": "Matte Lip Crayon Non Drying",
//   "Lip cream": "Long Lasting Lip Cream Matte Finish",
//   "Lip Cream Pallette": "Lip Cream Palette Professional",
//   "Lip/eye liner pencil 3 in 1": "3 In 1 Lip Eye Liner Pencil Set",
//   "Makeup Palettes": "All In One Makeup Palette With Mirror",
//   "Makeup Sets": "Beginner Makeup Set With Bag",
//   "Makeup Kits": "Travel Makeup Kit Essentials",
//   "Face Makeup": "Beginner Face Makeup Kit With Brushes",
//   Compact: "Compact Powder For Oily Skin Long Lasting",
//   "Loose Powder": "Talc Free Loose Setting Powder",
// };

// function parseIdFromSlug(slug) {
//   if (!slug) return null;
//   const parts = String(slug).split("-");
//   const candidate = parts[parts.length - 1];
//   return OBJECT_ID_REGEX.test(candidate) ? candidate : null;
// }

// function parseNameFromSlug(slug) {
//   if (!slug) return "";
//   const parts = String(slug).split("-");
//   return parts.slice(0, parts.length - 1).join(" ");
// }

// function safeArray(value) {
//   return Array.isArray(value) ? value : [];
// }

// function stripHtml(html) {
//   if (!html) return "";
//   return html.replace(/<[^>]*>?/gm, "").trim();
// }

// function bestSeoTitleForSubcategory(subCategoryName = "") {
//   if (subCategoryBestTitles[subCategoryName]) return subCategoryBestTitles[subCategoryName];
//   const key = Object.keys(subCategoryBestTitles).find(
//     (k) => k.toLowerCase() === String(subCategoryName).toLowerCase()
//   );
//   if (key) return subCategoryBestTitles[key];
//   return `${subCategoryName} buy online in Cameroon`;
// }

// async function fetchProductsByCatSub({ categoryId, subCategoryId, page }) {
//   try {
//     const response = await callSummaryApi(SummaryApi.getProductByCategoryAndSubCategory, {
//       payload: {
//         categoryId,
//         subCategoryId,
//         page,
//         limit: PAGE_SIZE,
//       },
//     });

//     if (!response?.success) {
//       return { products: [], totalCount: 0 };
//     }

//     return {
//       products: safeArray(response.data),
//       totalCount: Number(response.totalCount || 0),
//     };
//   } catch (error) {
//     console.error("fetchProductsByCatSub metadata error:", error);
//     return { products: [], totalCount: 0 };
//   }
// }

// // ----------------------------
// // FIXED: generateMetadata awaiting params
// // ----------------------------
// export async function generateMetadata({ params, searchParams }) {
//   const awaitedParams = await params;
//   const awaitedSearch = await searchParams;

//   const categorySlug = awaitedParams?.category;
//   const subCategorySlug = awaitedParams?.subCategory;
//   const page = Number(awaitedSearch?.page || 1);

//   const categoryId = parseIdFromSlug(categorySlug);
//   const subCategoryId = parseIdFromSlug(subCategorySlug);
//   const categoryName = parseNameFromSlug(categorySlug);
//   const subCategoryName = parseNameFromSlug(subCategorySlug);

//   if (!categoryId || !subCategoryId) {
//     return {
//       title: "Products",
//       description: "Explore our curated selection of makeup and beauty products.",
//       robots: { index: false, follow: true },
//     };
//   }

//   const { products, totalCount } = await fetchProductsByCatSub({
//     categoryId,
//     subCategoryId,
//     page,
//   });

//   const commercialTitle = bestSeoTitleForSubcategory(subCategoryName);
//   const title = `${commercialTitle} | ${subCategoryName}`;

//   const desc = products.length
//     ? `Shop ${subCategoryName} in ${categoryName} at EssentialistMakeupStore. Discover ${products.length} of ${totalCount} products available with nationwide shipping, secure online payment, and great prices.`
//     : `Browse ${subCategoryName} in ${categoryName} at EssentialistMakeupStore. Fast Cameroon-wide delivery and secure checkout.`;

//   const canonical = `https://www.esmakeupstore.com/${categorySlug}/${subCategorySlug}${
//     page > 1 ? `?page=${page}` : ""
//   }`;

//   const ogImage =
//     products?.[0]?.image?.[0] ||
//     products?.[0]?.image ||
//     "https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg";

//   return {
//     metadataBase: new URL("https://www.esmakeupstore.com"),
//     title,
//     description: stripHtml(desc).slice(0, 300),
//     alternates: { canonical },
//     keywords: [
//       commercialTitle,
//       subCategoryName,
//       categoryName,
//       "makeup",
//       "cosmetics",
//       "beauty",
//       "Cameroon makeup",
//       "Douala beauty",
//       "EssentialistMakeupStore",
//       "buy online",
//       "best price",
//       "free shipping",
//     ],
//     robots: { index: true, follow: true },
//     openGraph: {
//       type: "website",
//       siteName: "EssentialistMakeupStore",
//       url: canonical,
//       title,
//       description: stripHtml(desc).slice(0, 300),
//       images: [{ url: ogImage, width: 1200, height: 630, alt: subCategoryName }],
//       locale: "en_US",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description: stripHtml(desc).slice(0, 300),
//       images: [ogImage],
//     },
//   };
// }

// // ----------------------------
// // FIXED PAGE COMPONENT
// // ----------------------------
// export default async function SubCategoryPage({ params, searchParams }) {
//   const awaitedParams = await params;
//   const awaitedSearch = await searchParams;

//   const categorySlug = awaitedParams?.category;
//   const subCategorySlug = awaitedParams?.subCategory;
//   const page = Number(awaitedSearch?.page || 1);

//   const categoryId = parseIdFromSlug(categorySlug);
//   const subCategoryId = parseIdFromSlug(subCategorySlug);

//   if (!categoryId || !subCategoryId) {
//     return notFound();
//   }

//   return (
//     <SubCategoryClientBlock
//       categorySlug={categorySlug}
//       subCategorySlug={subCategorySlug}
//       categoryId={categoryId}
//       subCategoryId={subCategoryId}
//       page={page}
//       categoryNameFromSlug={parseNameFromSlug(categorySlug)}
//       subCategoryNameFromSlug={parseNameFromSlug(subCategorySlug)}
//     />
//   );
// }











// client/src/app/[category]/[subCategory]/page.jsx
import { notFound } from "next/navigation";
import SubCategoryClientBlock from "./SubCategoryClientBlock";
import { getServerLocale } from "@/lib/seo/serverLocale";
import { buildSubCategoryMetadata } from "@/lib/seo/catalogMetadata";
const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/i;

const subCategoryBestTitles = {
  Foundation: "Transfer Proof Foundation For Masks",
  "Foundation Makeup": "Foundation Shade Finder Kit",
  "Liquid Foundation": "Lightweight Liquid Foundation For Acne Prone Skin",
  "Powder Foundation": "Buildable Powder Foundation For Mature Skin",
  "Stick foundation": "Stick Foundation For Oily Skin",
  "Total Control Drop Foundation": "Drop Foundation Full Coverage Adjustable",
  "Foundation Primers": "Gripping Primer For Long Wear Makeup",
  "Face Primer": "Pore Blurring Primer For Oily Skin",
  "Tinted Moisturizer": "Tinted Moisturizer With SPF For Oily Skin",
  "Setting Spray": "Alcohol Free Setting Spray For Dry Skin",
  "SETTING POWDER": "No Flashback Setting Powder",
  "All Setting Powder": "Translucent Setting Powder For Oily Skin",
  Concealer: "Full Coverage Concealer For Dark Circles",
  "Concealers & Neutralizers": "Peach Color Corrector For Dark Circles",
  "Dark circle concealer": "Orange Concealer For Dark Circles",
  "Blush Makeup": "Cream Blush For Mature Skin",
  "All Blush": "Best Affordable Blush For Fair Skin",
  "High Definition Blush": "HD Cream Blush For Camera Ready Look",
  "Highlighters & Luminizers": "Subtle Highlighter For Mature Skin",
  Illuminator: "Liquid Illuminator Under Foundation",
  "Liquid highlighter": "Dewy Liquid Highlighter For Natural Glow",
  Bronzy: "Subtle Bronzy Makeup Look Products",
  "Bronzy Powder": "Warm Bronzer Powder For Olive Skin",
  Bronzer: "Matte Bronzer For Fair Cool Undertone",
  "Matte bronzer": "Matte Bronzer For Fair Cool Undertone",
  "Eye Makeup": "Everyday Eye Makeup Kit For Beginners",
  "Eye Shadow": "Neutral Eyeshadow For Blue Eyes",
  "Eye Shadow Palette": "Mini Eyeshadow Palette For Travel",
  Eyeliner: "Smudge Proof Eyeliner For Oily Lids",
  Kajal: "Long Lasting Kajal For Watery Eyes",
  Mascara: "Tubing Mascara For Short Lashes",
  "Eye Cream & Treatment": "Eye Cream for Dark Circles",
  "EYE CREAM": "Fragrance Free Eye Cream For Sensitive Skin",
  "Eye Serum": "Retinol Eye Serum For Fine Lines",
  "Eye brow cake powder": "Eyebrow Cake Powder For Sparse Brows",
  "Eye Brow Enhancers": "Tinted Brow Gel For Thin Eyebrows",
  "Lip Makeup": "Lip Makeup Set Gift For Her",
  Lipstick: "Transfer Proof Lipstick For Weddings",
  "Liquid Lipstick": "Comfortable Liquid Lipstick Non Drying",
  "Matte Lip Sticks": "Matte Lipstick Set Nude",
  "Lip Gloss": "Non Sticky Lip Gloss Set",
  "Lip Lacquer": "High Shine Lip Lacquer Long Wear",
  "Lip Liner": "Waterproof Lip Liner Nude Shades",
  "Lip Plumper": "Cinnamon Lip Plumper Gloss",
  "Lip Tint": "Long Lasting Lip Tint Waterproof",
  "Lip Crayon": "Matte Lip Crayon Non Drying",
  "Lip cream": "Long Lasting Lip Cream Matte Finish",
  "Lip Cream Pallette": "Lip Cream Palette Professional",
  "Lip/eye liner pencil 3 in 1": "3 In 1 Lip Eye Liner Pencil Set",
  "Makeup Palettes": "All In One Makeup Palette With Mirror",
  "Makeup Sets": "Beginner Makeup Set With Bag",
  "Makeup Kits": "Travel Makeup Kit Essentials",
  "Face Makeup": "Beginner Face Makeup Kit With Brushes",
  Compact: "Compact Powder For Oily Skin Long Lasting",
  "Loose Powder": "Talc Free Loose Setting Powder",
};

function parseIdFromSlug(slug) {
  if (!slug) return null;
  const parts = String(slug).split("-");
  const candidate = parts[parts.length - 1];
  return OBJECT_ID_REGEX.test(candidate) ? candidate : null;
}

function parseNameFromSlug(slug) {
  if (!slug) return "";
  const parts = String(slug).split("-");
  return parts.slice(0, parts.length - 1).join(" ");
}

function bestSeoTitleForSubcategory(subCategoryName = "") {
  if (subCategoryBestTitles[subCategoryName]) return subCategoryBestTitles[subCategoryName];
  const key = Object.keys(subCategoryBestTitles).find(
    (k) => k.toLowerCase() === String(subCategoryName).toLowerCase()
  );
  if (key) return subCategoryBestTitles[key];
  return `${subCategoryName} Essentials`;
}

export async function generateMetadata({ params, searchParams }) {
  const awaitedParams = await params;
  const awaitedSearch = await searchParams;
  const locale = await getServerLocale();

  const categorySlug = awaitedParams?.category;
  const subCategorySlug = awaitedParams?.subCategory;
  const page = Number(awaitedSearch?.page || 1);

  const categoryId = parseIdFromSlug(categorySlug);
  const subCategoryId = parseIdFromSlug(subCategorySlug);
  const subCategoryName = parseNameFromSlug(subCategorySlug);

  if (!categoryId || !subCategoryId) {
    return buildSubCategoryMetadata({
      subCategoryName: "Beauty Products",
      categorySlug: categorySlug || "category",
      subCategorySlug: subCategorySlug || "products",
      locale,
      commercialTitle: "Beauty Products",
      page,
    });
  }

  const commercialTitle = bestSeoTitleForSubcategory(subCategoryName);

  return buildSubCategoryMetadata({
    subCategoryName,
    categorySlug,
    subCategorySlug,
    locale,
    commercialTitle,
    page,
  });
}

export default async function SubCategoryPage({ params, searchParams }) {
  const awaitedParams = await params;
  const awaitedSearch = await searchParams;

  const categorySlug = awaitedParams?.category;
  const subCategorySlug = awaitedParams?.subCategory;
  const page = Number(awaitedSearch?.page || 1);

  const categoryId = parseIdFromSlug(categorySlug);
  const subCategoryId = parseIdFromSlug(subCategorySlug);

  if (!categoryId || !subCategoryId) return notFound();

  return (
    <SubCategoryClientBlock
      categorySlug={categorySlug}
      subCategorySlug={subCategorySlug}
      categoryId={categoryId}
      subCategoryId={subCategoryId}
      page={page}
      categoryNameFromSlug={parseNameFromSlug(categorySlug)}
      subCategoryNameFromSlug={parseNameFromSlug(subCategorySlug)}
    />
  );
}