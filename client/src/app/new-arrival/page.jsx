// //D:\essentialist_next_ecommerce\client\src\app\new-arrival\page.jsx
// import SummaryApi, { apiFetch } from "../../common/SummaryApi";
// import NewArrivalContent from "../../components/NewArrivalContent";

// const STORE_NAME = "Essentialist Makeup Store";
// const PAGE_PATH = "https://www.esmakeupstore.com/new-arrival";
// const HERO_TITLE = "New Makeup Arrivals & Hot Brands in Cameroon";
// const HERO_SUBTITLE = "Discover the Latest Makeup Brands and Beauty Trends in Cameroon";
// const HERO_DESCRIPTION =
//   "Shop the newest arrivals and hottest makeup brands in Cameroon at Essentialist Makeup Store. From NYX and LA Girl to international bestsellers, find trending foundations, lipsticks, palettes, and more — all at unbeatable FCFA prices!";

// const USE_CATEGORY_BLOCKS = true;
// const NEW_CATEGORY_ID = "68055442764e6d332bd162c8";
// const NEW_HOT_CATEGORY_ID = "6806b355bca41016c4406edb";

// export const metadata = {
//   title: "NYX & L.A. Girl: Best New Makeup 2025 | Essentialist Makeup Store",
//   description:
//     "Explore the latest makeup launches in Cameroon. Essentialist Makeup Store brings you NYX, LA Girl, and top global beauty brands at the best FCFA prices.",
//   alternates: {
//     canonical: PAGE_PATH,
//   },
//   openGraph: {
//     title: "New & Hot Makeup Brands in Cameroon | Essentialist Makeup Store",
//     description:
//       "Discover trending beauty products in Cameroon. Shop new arrivals from NYX, LA Girl, and more at Essentialist Makeup Store, Douala.",
//     url: PAGE_PATH,
//     siteName: STORE_NAME,
//     type: "website",
//     images: [
//       {
//         url: "https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg",
//         alt: "New & Hot Makeup Cameroon",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "New & Hot Makeup Brands in Cameroon | Essentialist Makeup Store",
//     description:
//       "Shop the latest makeup and hottest beauty trends in Cameroon. NYX, LA Girl, and more available now at Essentialist Makeup Store.",
//     images: ["https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg"],
//   },
//   robots: {
//     index: true,
//     follow: true,
//   },
// };

// async function loadProducts() {
//   const basePayload = {
//     limit: 24,
//     page: 1,
//     sortBy: "createdAt",
//     sortOrder: "desc",
//   };

//   const [allRes, newRes, hotRes] = await Promise.allSettled([
//     apiFetch(SummaryApi.getProduct.url, { method: "POST", body: basePayload }),
//     USE_CATEGORY_BLOCKS
//       ? apiFetch(SummaryApi.getProductByCategory.url, {
//           method: "POST",
//           body: { ...basePayload, categoryId: NEW_CATEGORY_ID, limit: 16 },
//         })
//       : Promise.resolve({ value: [] }),
//     USE_CATEGORY_BLOCKS
//       ? apiFetch(SummaryApi.getProductByCategory.url, {
//           method: "POST",
//           body: { ...basePayload, categoryId: NEW_HOT_CATEGORY_ID, limit: 16 },
//         })
//       : Promise.resolve({ value: [] }),
//   ]);

//   const extractProducts = (result) => {
//     if (result.status !== "fulfilled") return [];
//     const payload = result.value;
//     if (!payload) return [];
//     if (Array.isArray(payload.data?.products)) return payload.data.products;
//     if (Array.isArray(payload.data)) return payload.data;
//     if (Array.isArray(payload.products)) return payload.products;
//     return [];
//   };

//   return {
//     feedProducts: extractProducts(allRes),
//     newCategoryProducts: extractProducts(newRes),
//     hotCategoryProducts: extractProducts(hotRes),
//   };
// }

// function normalizeProducts(products) {
//   if (!Array.isArray(products)) return [];

//   return products.map((product) => {
//     if (!product || typeof product !== "object") return product;

//     const brandData = product.brand;
//     const brandName =
//       typeof brandData === "string"
//         ? brandData
//         : typeof brandData === "object"
//         ? brandData?.name ?? ""
//         : "";

//     const normalized = {
//       ...product,
//       brand: brandName,
//     };

//     if (!Array.isArray(product.image)) {
//       normalized.image = product.image ? [product.image] : [];
//     }

//     if (brandData && typeof brandData === "object") {
//       normalized.brandDetails = {
//         _id: brandData?._id ?? "",
//         name: brandName,
//         slug: brandData?.slug ?? "",
//         logo: brandData?.logo ?? "",
//         isFeatured: brandData?.isFeatured ?? false,
//         isActive: brandData?.isActive ?? true,
//       };
//     }

//     return normalized;
//   });
// }

// export default async function NewArrivalPage() {
//   const { feedProducts, newCategoryProducts, hotCategoryProducts } = await loadProducts();

//   const normalizedFeedProducts = normalizeProducts(feedProducts);
//   const normalizedNewCategoryProducts = normalizeProducts(newCategoryProducts);
//   const normalizedHotCategoryProducts = normalizeProducts(hotCategoryProducts);

//   const structuredData = {
//     "@context": "https://schema.org",
//     "@type": ["WebPage", "CollectionPage"],
//     name: "New & Hot Makeup Brands in Cameroon",
//     url: PAGE_PATH,
//     description:
//       "Explore the latest and hottest makeup brands and beauty products in Cameroon. Shop trending NYX, LA Girl and more at Essentialist Makeup Store.",
//     publisher: {
//       "@type": "Organization",
//       name: STORE_NAME,
//     },
//     mainEntity: {
//       "@type": "OfferCatalog",
//       name: "New Arrivals",
//       itemListElement: normalizedFeedProducts.slice(0, 20).map((product, index) => {
//         const priceValue = Number(product?.price ?? 0);
//         const discountValue = Number(product?.discount ?? 0);
//         const finalPrice =
//           priceValue && discountValue
//             ? Math.round(priceValue - (priceValue * discountValue) / 100)
//             : priceValue;

//         return {
//           "@type": "Offer",
//           position: index + 1,
//           itemOffered: {
//             "@type": "Product",
//             name: product?.name ?? "",
//             image: Array.isArray(product?.image) ? product.image : [],
//             brand: product?.brand
//               ? {
//                   "@type": "Brand",
//                   name: product.brand,
//                 }
//               : undefined,
//             offers: {
//               "@type": "Offer",
//               priceCurrency: "XAF",
//               price: finalPrice ? String(finalPrice) : "",
//               availability: "https://schema.org/InStock",
//               url: `${
//                 process.env.NEXT_PUBLIC_SITE_URL || "https://www.esmakeupstore.com"
//               }/product/${product?._id || ""}`,
//             },
//           },
//         };
//       }),
//     },
//   };

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
//       />
//       <NewArrivalContent
//         hero={{
//           title: HERO_TITLE,
//           subtitle: HERO_SUBTITLE,
//           description: HERO_DESCRIPTION,
//         }}
//         feedProducts={normalizedFeedProducts}
//         newCategoryProducts={USE_CATEGORY_BLOCKS ? normalizedNewCategoryProducts : []}
//         hotCategoryProducts={USE_CATEGORY_BLOCKS ? normalizedHotCategoryProducts : []}
//       />
//     </>
//   );
// }




// src/app/new-arrival/page.jsx
import SummaryApi, { apiFetch } from "../../common/SummaryApi";
import NewArrivalContent from "../../components/NewArrivalContent";

const STORE_NAME = "Essentialist Makeup Store";
const PAGE_PATH = "https://www.esmakeupstore.com/new-arrival";
const HERO_TITLE = "Latest Makeup Arrivals 2026";
const HERO_SUBTITLE = "The Newest Beauty Trends in Cameroon";
const HERO_DESCRIPTION =
  "Discover the latest additions to our collection. From newly launched NYX foundations to trending palettes, shop the freshest makeup arrivals in Cameroon at the best FCFA prices.";

const USE_CATEGORY_BLOCKS = true; 
const NEW_CATEGORY_ID = "68055442764e6d332bd162c8";
const NEW_HOT_CATEGORY_ID = "6806b355bca41016c4406edb";

export const metadata = {
  title: "Newest Makeup Arrivals Cameroon 2026 | Essentialist Store",
  description:
    "Shop the latest 2026 makeup launches in Cameroon. Authentic NYX, L.A. Girl, and global beauty brands. Fast delivery in Douala, Yaoundé, and nationwide.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "New & Trending Makeup 2026 | Essentialist Makeup Store Cameroon",
    description:
      "Explore new arrivals from top brands. Buy authentic cosmetics online with fast delivery in Douala and across Cameroon.",
    url: PAGE_PATH,
    siteName: STORE_NAME,
    type: "website",
    images: [
      {
        url: "https://www.esmakeupstore.com/assets/logo.jpg",
        width: 1200,
        height: 630,
        alt: "New Arrivals at Essentialist Makeup Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Newest Makeup Arrivals 2026 | Cameroon's Best Beauty Store",
    description: "Shop the newest makeup arrivals from global brands in Cameroon. Authentic products, best FCFA prices.",
    images: ["https://www.esmakeupstore.com/assets/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function loadProducts() {
  const basePayload = {
    limit: 100, 
    page: 1,
    sortBy: "createdAt", 
    sortOrder: "desc",
    onlyActive: true,
  };

  const [allRes, newRes, hotRes] = await Promise.allSettled([
    apiFetch(SummaryApi.getProduct.url, { method: "POST", body: basePayload }),
    USE_CATEGORY_BLOCKS
      ? apiFetch(SummaryApi.getProductByCategory.url, {
          method: "POST",
          body: { ...basePayload, categoryId: NEW_CATEGORY_ID, limit: 16 },
        })
      : Promise.resolve({ value: [] }),
    USE_CATEGORY_BLOCKS
      ? apiFetch(SummaryApi.getProductByCategory.url, {
          method: "POST",
          body: { ...basePayload, categoryId: NEW_HOT_CATEGORY_ID, limit: 16 },
        })
      : Promise.resolve({ value: [] }),
  ]);

  const extractProducts = (result, applyCutoff = false) => {
    if (result.status !== "fulfilled") return [];
    const payload = result.value;
    if (!payload) return [];
    
    const allFetched = payload.data?.products || payload.data?.items || payload.data || payload.products || [];
    
    if (applyCutoff) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      return allFetched.filter(product => {
        const createdAt = new Date(product.createdAt || Date.now());
        return createdAt >= ninetyDaysAgo;
      });
    }

    return allFetched;
  };

  return {
    feedProducts: extractProducts(allRes, true), 
    newCategoryProducts: extractProducts(newRes),
    hotCategoryProducts: extractProducts(hotRes),
  };
}

function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];

  return products.map((product) => {
    if (!product || typeof product !== "object") return product;

    const brandData = product.brand;
    const brandName = typeof brandData === "string" 
      ? brandData 
      : (brandData?.name || "");

    const normalized = {
      ...product,
      brand: brandName,
      image: Array.isArray(product.image) ? product.image : (product.image ? [product.image] : [])
    };

    if (brandData && typeof brandData === "object") {
      normalized.brandDetails = {
        _id: brandData?._id || "",
        name: brandName,
        slug: brandData?.slug || "",
      };
    }

    return normalized;
  });
}

export default async function NewArrivalPage() {
  const { feedProducts, newCategoryProducts, hotCategoryProducts } = await loadProducts();

  const normalizedFeed = normalizeProducts(feedProducts);
  const normalizedNew = normalizeProducts(newCategoryProducts);
  const normalizedHot = normalizeProducts(hotCategoryProducts);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "New Makeup Arrivals 2026 - Cameroon",
    description: "Latest authentic makeup products and beauty trends available at Essentialist Makeup Store.",
    url: PAGE_PATH,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: normalizedFeed.slice(0, 15).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          brand: { "@type": "Brand", name: p.brand || STORE_NAME },
          offers: {
            "@type": "Offer",
            priceCurrency: "XAF",
            price: String(p.price || ""),
            availability: "https://schema.org/InStock",
          }
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <NewArrivalContent
        hero={{
          title: HERO_TITLE,
          subtitle: HERO_SUBTITLE,
          description: HERO_DESCRIPTION,
        }}
        feedProducts={normalizedFeed}
        newCategoryProducts={normalizedNew}
        hotCategoryProducts={normalizedHot}
      />
    </>
  );
}