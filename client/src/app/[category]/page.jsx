// // src/app/[category]/page.jsx
// import Link from 'next/link';
// import { notFound } from 'next/navigation';
// import CardProduct from '../../components/CardProduct';
// import { valideURLConvert } from '../../utils/valideURLConvert';
// import SummaryApi, { baseURL } from '../../common/SummaryApi';

// /**
//  * SEO KEYWORD MAP
//  * - Keys should match normalized category/subcategory names from your CMS.
//  * - Values are the exact competitive SEO titles you provided.
//  * - We append locale benefits and Cameroon modifiers dynamically.
//  */
// const SEO_KEYWORDS = {
//   // Major Categories
//   'face makeup': 'beginner face makeup kit with brushes',
//   'eye makeup': 'everyday eye makeup kit for beginners',
//   'lip makeup': 'non sticky lip gloss set',
//   'foundation makeup': 'foundation shade finder kit',
//   'foundation': 'foundation shade finder kit',
//   'setting powder': 'no flashback setting powder',
//   'blush makeup': 'cream blush for mature skin that doesn’t settle',
//   'makeup sets': 'beginner makeup set with bag',
//   'makeup kits': 'travel makeup kit essentials',
//   'makeup palettes': 'all in one makeup palette with mirror',

//   // Face subcats
//   'liquid foundation': 'lightweight liquid foundation for acne prone skin',
//   'powder foundation': 'buildable powder foundation for mature skin',
//   'stick foundation': 'stick foundation for oily skin',
//   'concealer': 'full coverage concealer for dark circles',
//   'dark circle concealer': 'orange concealer for dark circles',
//   'color corrector': 'peach color corrector for dark circles',
//   'setting spray': 'alcohol free setting spray for dry skin',
//   'loose powder': 'talc free loose setting powder',
//   'highlighter': 'dewy liquid highlighter for natural glow',
//   'illuminator': 'liquid illuminator under foundation',
//   'bronzer': 'matte bronzer for fair cool undertone',
//   'compact': 'compact powder for oily skin long lasting',
//   'high definition blush': 'hd cream blush for camera ready look',
//   'bronzy powder': 'warm bronzer powder for olive skin',
//   'total control drop foundation': 'drop foundation full coverage adjustable',
//   'foundation primers': 'gripping primer for long wear makeup',

//   // Eyes subcats
//   'eyeliner': 'smudge proof eyeliner for oily lids',
//   'kajal': 'long lasting kajal for watery eyes',
//   'mascara': 'tubing mascara for short lashes',
//   'eyeshadow': 'neutral eyeshadow for blue eyes',
//   'eyeshadow palette': 'mini eyeshadow palette for travel',
//   'brow cake powder': 'eyebrow cake powder for sparse brows',
//   'brow enhancers': 'tinted brow gel for thin eyebrows',
//   'eye cream': 'fragrance free eye cream for sensitive skin',
//   'eye cream & treatment': 'eye cream for dark circles and puffiness under 10000FCFA',
//   'eye serum': 'retinol eye serum for fine lines',

//   // Lips subcats
//   'lipstick': 'transfer proof lipstick for weddings',
//   'liquid lipstick': 'comfortable liquid lipstick non drying',
//   'matte lipsticks': 'matte lipstick set nude',
//   'lip liner': 'waterproof lip liner nude shades',
//   'lip plumper': 'cinnamon lip plumper gloss',
//   'lip tint': 'long lasting lip tint waterproof',
//   'lip crayon': 'matte lip crayon non drying',
//   'lip cream': 'long lasting lip cream matte finish',
//   'lip cream palette': 'lip cream palette professional',
//   '3 in 1 pencil': '3 in 1 lip eye liner pencil set',

//   // Exact items visible on your site (helps when CMS names match)
//   'nyx professional makeup stay matte but not flat powder foundation': 'buildable powder foundation for mature skin',
//   'total control pro drop foundation': 'drop foundation full coverage adjustable',
//   'nyx professional makeup high definition blush': 'hd cream blush for camera ready look',
// };

// const SITEWIDE_QUICK_WINS = [
//   'lipstick set gift under 10000 FCFA',
//   'vegan mascara for volume',
//   'hydrating setting spray for dry skin',
//   'buildable coverage powder foundation',
//   'smudge proof kajal for sensitive eyes',
//   'highlighter stick for natural glow',
//   'non cakey concealer for mature skin',
//   'matte bronzer for fair skin',
//   'eye makeup starter kit under 15000 FCFA',
//   'bundle makeup kit Cameroon',
// ];

// const PAGE_SIZE = 12;

// /* ----------------------- Helpers ----------------------- */
// function parseIdFromSlug(slug) {
//   if (!slug) return null;
//   const parts = String(slug).split('-');
//   return parts[parts.length - 1];
// }
// function parseNameFromSlug(slug) {
//   if (!slug) return '';
//   const parts = String(slug).split('-');
//   return parts.slice(0, parts.length - 1).join(' ');
// }
// function toKey(s) {
//   return String(s || '')
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, ' ')
//     .replace(/[’']/g, "'");
// }
// function safeArray(v) {
//   return Array.isArray(v) ? v : [];
// }
// function stripHtml(html) {
//   if (!html) return '';
//   return html.replace(/<[^>]*>?/gm, '').trim();
// }

// /* ----------------------- Data Fetch ----------------------- */
// async function fetchCategories() {
//   try {
//     const res = await fetch(`${baseURL}${SummaryApi.getCategory.url}`, {
//       method: SummaryApi.getCategory.method.toUpperCase(),
//       headers: { 'Content-Type': 'application/json' },
//       next: { revalidate: 300 },
//     });
//     if (!res.ok) {
//       console.warn(`getCategory failed with status ${res.status}:`, res.statusText);
//       return [];
//     }
//     const j = await res.json();
//     return safeArray(j?.data || j);
//   } catch (e) {
//     console.error('fetchCategories', e);
//     return [];
//   }
// }

// // Strictly fetch subcategories of a given categoryId.
// async function fetchSubCategoriesOfCategory(categoryId) {
//   try {
//     const res = await fetch(`${baseURL}${SummaryApi.getSubCategory.url}`, {
//       method: SummaryApi.getSubCategory.method.toUpperCase(),
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ categoryId }),
//       next: { revalidate: 300 },
//     });
//     if (!res.ok) {
//       console.warn(`getSubCategory failed with status ${res.status}:`, res.statusText);
//       return [];
//     }
//     const j = await res.json();
//     // Safety filter even if backend already filtered
//     return safeArray(j?.data || j).filter((s) =>
//       safeArray(s?.category).some((c) => String(c?._id) === String(categoryId))
//     );
//   } catch (e) {
//     console.error('fetchSubCategoriesOfCategory', e);
//     return [];
//   }
// }

// async function fetchProductsByCategory({ categoryId, page }) {
//   try {
//     const res = await fetch(`${baseURL}${SummaryApi.getProductByCategory.url}`, {
//       method: SummaryApi.getProductByCategory.method.toUpperCase(),
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ categoryId, page, limit: PAGE_SIZE }),
//       next: { revalidate: 120 },
//     });

//     // Better error handling - don't throw, just return empty result
//     if (!res.ok) {
//       console.warn(`getProductByCategory failed with status ${res.status}:`, res.statusText);
//       return { products: [], totalCount: 0 };
//     }

//     const j = await res.json();
//     if (!j?.success) return { products: [], totalCount: 0 };
//     return { products: safeArray(j.data), totalCount: Number(j.totalCount || 0) };
//   } catch (e) {
//     console.error('fetchProductsByCategory', e);
//     return { products: [], totalCount: 0 };
//   }
// }

// // Fallback: aggregate products across all subcategories of this category
// async function fetchProductsAcrossSubcategories({ categoryId, subcats, page }) {
//   const per = PAGE_SIZE;
//   const start = (page - 1) * per;
//   const acc = [];
//   let totalCount = 0;

//   for (const s of subcats) {
//     try {
//       const res = await fetch(`${baseURL}${SummaryApi.getProductByCategoryAndSubCategory.url}`, {
//         method: SummaryApi.getProductByCategoryAndSubCategory.method.toUpperCase(),
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           categoryId,
//           subCategoryId: s?._id,
//           page: 1,
//           limit: 100,
//         }),
//         next: { revalidate: 120 },
//       });
//       if (!res.ok) continue;
//       const j = await res.json();
//       const list = safeArray(j?.data);
//       acc.push(...list);
//       totalCount += Number(j?.totalCount || list.length || 0);
//     } catch (e) {
//       console.error('fetchProductsAcrossSubcategories (one subcat)', e);
//     }
//   }

//   // Sort newest first if timestamps exist
//   acc.sort(
//     (a, b) =>
//       new Date(b?.updatedAt || b?.createdAt || 0) -
//       new Date(a?.updatedAt || a?.createdAt || 0)
//   );
//   const products = acc.slice(start, start + per);
//   if (!totalCount) totalCount = acc.length;

//   return { products, totalCount };
// }

// /* ----------------------- SEO Title Logic ----------------------- */
// function buildSeoTitle(categoryName) {
//   const key = toKey(categoryName);
//   const primary = SEO_KEYWORDS[key];
//   // Default to readable category name if no mapping found
//   const seed = primary || `${categoryName} – Buy Online`;
//   // Append benefit + locale
//   // Example: "No Flashback Setting Powder – Shine Control, Buy Online in Cameroon"
//   return `${capitalize(seed)} – Fast Delivery, Best Price in Cameroon`;
// }
// function capitalize(s = '') {
//   if (!s) return s;
//   return s.charAt(0).toUpperCase() + s.slice(1);
// }

// /* ----------------------- Metadata ----------------------- */
// export async function generateMetadata({ params, searchParams }) {
//   const resolvedParams = await params;
//   const resolvedSearchParams = await searchParams;

//   const categorySlug = resolvedParams?.category;
//   const page = Number(resolvedSearchParams?.page || 1);
//   const name = parseNameFromSlug(categorySlug) || 'Category';
//   const h1Title = buildSeoTitle(name);

//   const metaTitle = h1Title.length > 60 ? `${h1Title.slice(0, 57)}...` : h1Title;

//   const description = stripHtml(
//     `Shop ${name} at EssentialistMakeupStore – secure online payment, nationwide shipping in Cameroon (Douala, Yaoundé), great prices in FCFA. Order today.`
//   ).slice(0, 300);

//   const canonical = `https://www.esmakeupstore.com/${categorySlug}${
//     page > 1 ? `?page=${page}` : ''
//   }`;

//   return {
//     metadataBase: new URL('https://www.esmakeupstore.com'),
//     title: metaTitle,
//     description,
//     alternates: { canonical },
//     robots: { index: true, follow: true },
//     openGraph: {
//       type: 'website',
//       siteName: 'EssentialistMakeupStore',
//       url: canonical,
//       title: metaTitle,
//       description,
//       images: [
//         {
//           url: 'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg',
//           width: 1200,
//           height: 630,
//           alt: metaTitle,
//         },
//       ],
//       locale: 'en_US',
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: metaTitle,
//       description,
//       images: [
//         'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg',
//       ],
//     },
//     keywords: [
//       name,
//       buildPrimaryKeyword(name),
//       'makeup',
//       'beauty',
//       'Cameroon',
//       'Douala',
//       'Yaoundé',
//       'FCFA',
//       'buy online',
//       ...SITEWIDE_QUICK_WINS,
//     ],
//   };
// }
// function buildPrimaryKeyword(categoryName) {
//   const key = toKey(categoryName);
//   return SEO_KEYWORDS[key] || categoryName;
// }

// /* ----------------------- JSON-LD ----------------------- */
// function StructuredData({ categorySlug, categoryName, products = [] }) {
//   const url = `https://www.esmakeupstore.com/${categorySlug}`;

//   const breadcrumbJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'BreadcrumbList',
//     itemListElement: [
//       { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.esmakeupstore.com/' },
//       { '@type': 'ListItem', position: 2, name: categoryName || 'Category', item: url },
//     ],
//   };

//   const collectionJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'CollectionPage',
//     name: `${categoryName || 'Category'} - EssentialistMakeupStore`,
//     url,
//     isPartOf: {
//       '@type': 'WebSite',
//       name: 'EssentialistMakeupStore',
//       url: 'https://www.esmakeupstore.com/',
//     },
//   };

//   const productListJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'ItemList',
//     name: `${categoryName} Makeup Products Collection`,
//     description: `Explore our selection of high-quality ${categoryName} makeup products at Essentialist Makeup Store.`,
//     numberOfItems: products.length,
//     itemListElement: products.map((product, index) => ({
//       '@type': 'ListItem',
//       position: index + 1,
//       item: {
//         '@type': 'Product',
//         name: product.name,
//         image: Array.isArray(product.image) ? product.image[0] : product.image,
//         // Minimal Offer block for Google compliance
//         offers: {
//           '@type': 'Offer',
//           price: String(product.price ?? ''),
//           priceCurrency: 'XAF',
//           availability:
//             Number(product?.stock || 0) > 0
//               ? 'https://schema.org/InStock'
//               : 'https://schema.org/OutOfStock',
//         },
//       },
//     })),
//   };

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
//       />
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
//       />
//       {products.length > 0 && (
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(productListJsonLd) }}
//         />
//       )}
//     </>
//   );
// }

// /* ----------------------- Page ----------------------- */
// export default async function CategoryPage({ params, searchParams }) {
//   const resolvedParams = await params;
//   const resolvedSearchParams = await searchParams;

//   const categorySlug = resolvedParams?.category;
//   const page = Number(resolvedSearchParams?.page || 1);
//   const categoryId = parseIdFromSlug(categorySlug);
//   const categoryNameFromSlug = parseNameFromSlug(categorySlug);

//   if (!categoryId) return notFound();

//   const [categories, subcats] = await Promise.all([
//     fetchCategories(),
//     fetchSubCategoriesOfCategory(categoryId),
//   ]);

//   const category = categories.find((c) => String(c?._id) === String(categoryId));
//   if (!category) return notFound();

//   const categoryName = category?.name || categoryNameFromSlug || 'Category';
//   const h1Title = buildSeoTitle(categoryName);
//   const primaryKeyword = buildPrimaryKeyword(categoryName);

//   // Try direct category listing
//   let { products, totalCount } = await fetchProductsByCategory({ categoryId, page });

//   // Fallback: aggregate across subcategories if nothing returns
//   if (products.length === 0 && subcats.length > 0) {
//     const agg = await fetchProductsAcrossSubcategories({ categoryId, subcats, page });
//     products = agg.products;
//     totalCount = agg.totalCount;
//   }

//   const totalPages = Math.max(1, Math.ceil((Number(totalCount) || 0) / PAGE_SIZE));
//   const hasMore = page < totalPages;
//   const nextHref = hasMore ? `/${categorySlug}?page=${page + 1}` : null;

//   const firstParagraph = `Looking for ${primaryKeyword} in Cameroon? Order today from EssentialistMakeupStore. Enjoy secure online payment, fast nationwide delivery to Douala, Yaoundé and beyond, and great prices in FCFA.`;

//   return (
//     <>
//       <StructuredData
//         categorySlug={categorySlug}
//         categoryName={categoryName}
//         products={products}
//       />

//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//           .line-clamp-2 {
//             display: -webkit-box;
//             -webkit-line-clamp: 2;
//             -webkit-box-orient: vertical;
//             overflow: hidden;
//           }
//           .e-hero {
//             background: linear-gradient(135deg, #fff 0%, #f8fafc 40%, #f1f5f9 100%);
//             border: 1px solid #e2e8f0;
//           }
//           .e-card {
//             transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
//             position: relative;
//             overflow: hidden;
//           }
//           .e-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 20px 40px rgba(2, 6, 23, 0.12);
//           }
//           .e-card::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: linear-gradient(45deg, rgba(93, 92, 222, 0.05), rgba(236, 254, 255, 0.1));
//             opacity: 0;
//             transition: opacity .3s ease;
//           }
//           .e-card:hover::before {
//             opacity: 1;
//           }
//           .e-subcat-card {
//             transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
//             position: relative;
//             overflow: hidden;
//             background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
//           }
//           .e-subcat-card:hover {
//             transform: translateY(-6px) scale(1.02);
//             box-shadow: 0 25px 50px rgba(93, 92, 222, 0.15);
//           }
//           .e-subcat-card::after {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: linear-gradient(135deg, rgba(93, 92, 222, 0.08), rgba(14, 116, 144, 0.05));
//             opacity: 0;
//             transition: opacity .3s ease;
//           }
//           .e-subcat-card:hover::after {
//             opacity: 1;
//           }
//           .e-subcat-image {
//             transition: transform .3s ease;
//           }
//           .e-subcat-card:hover .e-subcat-image {
//             transform: scale(1.05);
//           }
//           .e-chip {
//             display: inline-flex;
//             align-items: center;
//             gap: 6px;
//             background:#ecfeff;
//             color:#0e7490;
//             border:1px solid #a5f3fc;
//             padding: 4px 10px;
//             border-radius: 999px;
//             font-size: 12px;
//             font-weight: 600;
//           }
//           .e-gradient-text {
//             background: linear-gradient(135deg, #5d5cde 0%, #0e7490 100%);
//             background-clip: text;
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//           }
//         `,
//         }}
//       />

//       <main className="container mx-auto px-4 pb-10">
//         {/* Hero */}
//         <section className="e-hero rounded-2xl mt-6 p-6 md:p-8 bg-white">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
//                 {h1Title}
//               </h1>
//               <p className="text-slate-600 mt-2 max-w-2xl">
//                 {firstParagraph}
//               </p>
//             </div>
//             <div className="e-chip">
//               <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 12a9 9 0 1118 0A9 9 0 013 12zm9-7a7 7 0 100 14A7 7 0 0012 5zm1 3v4l3 2-.8 1.2L11 13V8h2z"/></svg>
//               Fast & Reliable Shipping
//             </div>
//           </div>
//         </section>

//         {/* Subcategories */}
// <section aria-label="Subcategories" className="mt-10">
//   <div className="flex items-center justify-between mb-6">
//     <div>
//       <h2 className="text-2xl font-bold e-gradient-text">Browse Subcategories</h2>
//       <p className="text-slate-600 mt-1">Discover our curated collections</p>
//     </div>
//     {subcats.length > 0 && (
//       <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
//         {subcats.length} collections
//       </span>
//     )}
//   </div>

//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-1 lg:gap-1">
//     {subcats.length === 0 ? (
//       <div className="col-span-full border-2 border-dashed border-slate-200 rounded-lg p-12 text-center bg-white shadow-sm">
//         <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
//           <svg width="24" height="24" viewBox="0 0 24 24" className="text-slate-400" aria-hidden="true">
//             <path fill="currentColor" d="M3 7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm2 0v11h14V7h-2.586l-2-2H9.586l-2 2H5z"/>
//           </svg>
//         </div>
//         <h3 className="font-semibold text-slate-700 mb-2">No subcategories found</h3>
//         <p className="text-slate-500">We&apos;re working on adding more collections for this category.</p>
//       </div>
//     ) : (
//       subcats.map((s) => {
//         const href = `/${valideURLConvert(category.name)}-${category._id}/${valideURLConvert(s.name)}-${s._id}`;
//         const subPrimary = buildPrimaryKeyword(s?.name || '');
//         return (
//           <div key={s._id} className="px-1">
//             <Link
//               href={href}
//               className="relative flex flex-col border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out py-1 lg:p-2 rounded-lg bg-white shadow-sm hover:shadow-md group hover:-translate-y-1 block"
//               aria-label={`Explore ${s?.name}`}
//             >
//               <div className="relative overflow-hidden rounded-lg aspect-square mb-3">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img
//                   src={s?.image || '/placeholder.png'}
//                   alt={s?.name || 'Subcategory'}
//                   className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
//                   loading="lazy"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                 <div className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                   <svg width="16" height="16" viewBox="0 0 24 24" className="text-slate-600" aria-hidden="true">
//                     <path fill="currentColor" d="M7 7h10v2l4-3-4-3v2H5v6h2V7zm10 10H7v-2l-4 3 4 3v-2h12v-6h-2v4z"/>
//                   </svg>
//                 </div>
//               </div>
//               <div className="flex-grow flex flex-col px-2">
//                 <h3 className="font-semibold text-gray-800 text-sm lg:text-base line-clamp-2 mb-1 transition-colors duration-300 group-hover:text-gray-600">
//                   {capitalize(subPrimary)}
//                 </h3>
//                 <div className="flex items-center justify-between mt-auto">
//                   <span className="text-sm text-slate-500 font-medium">Explore Collection</span>
//                   <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
//                     <svg width="12" height="12" viewBox="0 0 24 24" className="text-white" aria-hidden="true">
//                       <path fill="currentColor" d="M7 7h10v2l4-3-4-3v2H5v6h2V7zm10 10H7v-2l-4 3 4 3v-2h12v-6h-2v4z"/>
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           </div>
//         );
//       })
//     )}
//   </div>
// </section>

//         {/* Products */}
//         <section className="mt-12">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h2 className="text-2xl font-bold e-gradient-text">Featured Products</h2>
//               <p className="text-slate-600 mt-1">Premium quality makeup essentials</p>
//             </div>
//             {products.length > 0 && (
//               <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                 {Math.min(products.length, PAGE_SIZE)} of {totalCount} products
//               </span>
//             )}
//           </div>

//           {products.length === 0 ? (
//             <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
//               <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
//                 <svg width="24" height="24" viewBox="0 0 24 24" className="text-slate-400" aria-hidden="true">
//                   <path fill="currentColor" d="M3 7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm2 0v11h14V7h-2.586l-2-2H9.586l-2 2H5z"/>
//                 </svg>
//               </div>
//               <h3 className="font-semibold text-slate-700 mb-2">No products found</h3>
//               <p className="text-slate-500 mb-4">We&apos;re working on adding more products to this category.</p>
//               {subcats.length > 0 && (
//                 <p className="text-sm text-indigo-600">Try browsing our subcategories above for more options.</p>
//               )}
//             </div>
//           ) : (
//             <>
//               <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="list">
//                 {products.map((p, i) => (
//                   <li key={`${p?._id}-cat-${i}`}>
//                     <CardProduct data={p} />
//                   </li>
//                 ))}
//               </ul>

//               {hasMore && (
//                 <div className="text-center mt-10">
//                   <Link
//                     href={nextHref}
//                     className="inline-flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
//                   >
//                     Load More Products
//                     <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
//                       <path fill="currentColor" d="M7 10l5 5 5-5z"/>
//                     </svg>
//                   </Link>
//                 </div>
//               )}
//             </>
//           )}
//         </section>
//       </main>
//     </>
//   );
// }






// src/app/[category]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CardProduct from '../../components/CardProduct';
import { valideURLConvert } from '../../utils/valideURLConvert';
import SummaryApi, { baseURL } from '../../common/SummaryApi';

const SEO_KEYWORDS = {
  'face makeup': 'beginner face makeup kit with brushes',
  'eye makeup': 'everyday eye makeup kit for beginners',
  'lip makeup': 'non sticky lip gloss set',
  'foundation': 'foundation shade finder kit',
  'setting powder': 'no flashback setting powder',
  'blush makeup': 'cream blush for mature skin',
  'makeup sets': 'beginner makeup set with bag',
  'makeup kits': 'travel makeup kit essentials',
  'makeup palettes': 'all in one makeup palette',
  'liquid foundation': 'lightweight liquid foundation for acne prone skin',
  'powder foundation': 'buildable powder foundation for mature skin',
  'stick foundation': 'stick foundation for oily skin',
  'concealer': 'full coverage concealer for dark circles',
  'setting spray': 'alcohol free setting spray for dry skin',
  'loose powder': 'talc free loose setting powder',
  'highlighter': 'dewy liquid highlighter for natural glow',
  'bronzer': 'matte bronzer for fair cool undertone',
  'eyeliner': 'smudge proof eyeliner for oily lids',
  'mascara': 'tubing mascara for short lashes',
  'eyeshadow palette': 'mini eyeshadow palette for travel',
  'lipstick': 'transfer proof lipstick for weddings',
  'liquid lipstick': 'comfortable liquid lipstick non drying',
};

const SITEWIDE_QUICK_WINS = [
  'lipstick set gift under 10000 FCFA',
  'hydrating setting spray Cameroon',
  'affordable makeup kits Douala',
  'original makeup brands Cameroon',
  'makeup store Yaoundé',
];

const PAGE_SIZE = 12;

/* ----------------------- Helpers ----------------------- */
function parseIdFromSlug(slug) {
  if (!slug) return null;
  const parts = String(slug).split('-');
  return parts.at(-1);
}
function parseNameFromSlug(slug) {
  if (!slug) return '';
  const parts = String(slug).split('-');
  return parts.slice(0, parts.length - 1).join(' ');
}
function toKey(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}
function safeArray(v) {
  return Array.isArray(v) ? v : [];
}
function capitalize(s = '') {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ----------------------- Data Fetch ----------------------- */
async function fetchCategories() {
  try {
    const res = await fetch(`${baseURL}${SummaryApi.getCategory.url}`, {
      method: SummaryApi.getCategory.method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const j = await res.json();
    return safeArray(j?.data || j);
  } catch (e) {
    return [];
  }
}

async function fetchSubCategoriesOfCategory(categoryId) {
  try {
    const res = await fetch(`${baseURL}${SummaryApi.getSubCategory.url}`, {
      method: SummaryApi.getSubCategory.method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const j = await res.json();
    return safeArray(j?.data || j).filter((s) =>
      safeArray(s?.category).some((c) => String(c?._id) === String(categoryId))
    );
  } catch (e) {
    return [];
  }
}

async function fetchProductsByCategory({ categoryId, page }) {
  try {
    const res = await fetch(`${baseURL}${SummaryApi.getProductByCategory.url}`, {
      method: SummaryApi.getProductByCategory.method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, page, limit: PAGE_SIZE }),
      next: { revalidate: 120 },
    });
    if (!res.ok) return { products: [], totalCount: 0 };
    const j = await res.json();
    if (!j?.success) return { products: [], totalCount: 0 };
    return { products: safeArray(j.data), totalCount: Number(j.totalCount || 0) };
  } catch (e) {
    return { products: [], totalCount: 0 };
  }
}

async function fetchProductsAcrossSubcategories({ categoryId, subcats, page }) {
  const per = PAGE_SIZE;
  const start = (page - 1) * per;
  const acc = [];
  for (const s of subcats) {
    try {
      const res = await fetch(`${baseURL}${SummaryApi.getProductByCategoryAndSubCategory.url}`, {
        method: SummaryApi.getProductByCategoryAndSubCategory.method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, subCategoryId: s?._id, page: 1, limit: 50 }),
        next: { revalidate: 120 },
      });
      if (!res.ok) continue;
      const j = await res.json();
      acc.push(...safeArray(j?.data));
    } catch (e) {}
  }
  return { products: acc.slice(start, start + per), totalCount: acc.length };
}

/* ----------------------- Metadata ----------------------- */
export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams?.category;
  const name = parseNameFromSlug(categorySlug) || 'Makeup';
  const key = toKey(name);
  const primarySeo = SEO_KEYWORDS[key] || `${name} Essentials`;

  const metaTitle = `${capitalize(primarySeo)} | Essentialist Makeup Store Cameroon`;
  const description = `Shop authentic ${name} products in Cameroon. Best FCFA prices, secure payment, and fast delivery to Douala, Yaoundé, and nationwide. Explore our ${name} collection today!`;

  return {
    title: metaTitle,
    description,
    keywords: [name, primarySeo, ...SITEWIDE_QUICK_WINS],
    alternates: { canonical: `https://www.esmakeupstore.com/${categorySlug}` },
    openGraph: {
      title: metaTitle,
      description,
      url: `https://www.esmakeupstore.com/${categorySlug}`,
      siteName: 'Essentialist Makeup Store',
      images: [{ url: 'https://www.esmakeupstore.com/assets/logo.jpg' }],
      type: 'website',
    },
  };
}

/* ----------------------- JSON-LD ----------------------- */
function StructuredData({ categorySlug, categoryName, products = [] }) {
  const url = `https://www.esmakeupstore.com/${categorySlug}`;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.esmakeupstore.com/' },
              { '@type': 'ListItem', position: 2, name: categoryName, item: url },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${categoryName} - Essentialist Makeup Store`,
            url,
            description: `Browse our collection of ${categoryName} products in Cameroon.`,
          }),
        }}
      />
    </>
  );
}

/* ----------------------- Page ----------------------- */
export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedParams?.category;
  const page = Number(resolvedSearchParams?.page || 1);
  const categoryId = parseIdFromSlug(categorySlug);

  if (!categoryId) return notFound();

  const [categories, subcats] = await Promise.all([
    fetchCategories(),
    fetchSubCategoriesOfCategory(categoryId),
  ]);

  const category = categories.find((c) => String(c?._id) === String(categoryId));
  if (!category) return notFound();

  const categoryName = category?.name || 'Category';
  const key = toKey(categoryName);
  const primarySeo = SEO_KEYWORDS[key] || categoryName;

  let { products, totalCount } = await fetchProductsByCategory({ categoryId, page });
  if (products.length === 0 && subcats.length > 0) {
    const agg = await fetchProductsAcrossSubcategories({ categoryId, subcats, page });
    products = agg.products;
    totalCount = agg.totalCount;
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasMore = page < totalPages;
  const nextHref = `/${categorySlug}?page=${page + 1}`;

  return (
    <>
      <StructuredData categorySlug={categorySlug} categoryName={categoryName} products={products} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .e-hero { background: linear-gradient(135deg, #fff 0%, #fff1f2 100%); border: 1px solid #fecdd3; }
        .e-gradient-text { background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .e-subcat-card { transition: all 0.3s ease; border: 1px solid #f1f5f9; }
        .e-subcat-card:hover { transform: translateY(-4px); border-color: #fb7185; box-shadow: 0 10px 20px rgba(225, 29, 72, 0.1); }
      `}} />

      <main className="container mx-auto px-4 pb-20">
        <section className="e-hero rounded-2xl mt-6 p-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold e-gradient-text">
            {capitalize(primarySeo)}
          </h1>
          <p className="text-slate-600 mt-3 max-w-3xl text-lg">
            Shop authentic <strong>{categoryName}</strong> in Cameroon. Secure FCFA payments and fast delivery to Douala and Yaoundé.
          </p>
        </section>

        {/* Subcategories */}
        {subcats.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Explore {categoryName} Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcats.map((s) => (
                <Link
                  key={s._id}
                  href={`/${valideURLConvert(categoryName)}-${category._id}/${valideURLConvert(s.name)}-${s._id}`}
                  className="e-subcat-card bg-white p-4 rounded-xl flex flex-col items-center group"
                >
                  <div className="w-24 h-24 mb-3">
                    <img src={s?.image || '/placeholder.png'} alt={s.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm text-center">{s.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Available Products</h2>
            <span className="text-sm font-medium text-slate-500 bg-slate-50 px-4 py-1 rounded-full border">
              {totalCount} Items Found
            </span>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed">
              <p className="text-slate-500">More {categoryName} products arriving soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((p, i) => (
                  <CardProduct key={p?._id || i} data={p} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-16 text-center">
                  <Link
                    href={nextHref}
                    className="inline-flex items-center px-10 py-4 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-700 transition-all shadow-lg hover:shadow-pink-200"
                  >
                    Load More {categoryName}
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}