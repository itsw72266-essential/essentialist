// // src/app/page.js
// import Image from 'next/image'
// import Link from 'next/link'
// import { Suspense } from 'react'
// import { cacheLife } from 'next/cache'

// import ProductRecommendations from '../components/ProductRecommendations'
// import TikTokGallery from '../components/TikTokGallery'
// import CategorySectionsInfinite from '../components/CategorySectionsInfinite'
// import { valideURLConvert } from '../utils/valideURLConvert'
// import {
//   getCategories,
//   getSubCategories,
//   getTopCategoryBundles,
// } from '../server/catalog'

// const DEFAULT_TITLE =
//   'Essentialist Makeup Store | Setting Powders, Makeup Kits & Beauty Deals'
// const DEFAULT_DESC =
//   'Explore the best selection of authentic makeup products and cosmetics. Find foundations, setting powders, lipsticks, eyeshadows, and more. Shop top brands and enjoy exclusive deals!'
// const OG_IMAGE = 'https://www.esmakeupstore.com/assets/logo.jpg'

// export async function generateMetadata() {
//   'use cache'
//   cacheLife('minutes', 5)

//   const categories = await getCategories()
//   const top = Array.isArray(categories)
//     ? categories
//         .slice(0, 7)
//         .map((c) => c?.name)
//         .filter(Boolean)
//         .join(', ')
//     : ''

//   const dynTitle = top
//     ? `Essentialist Makeup Store: Shop ${top} & More`
//     : DEFAULT_TITLE

//   const addPhrases =
//     'Buy setting powder, face makeup, cosmetic products, professional makeup kits, and skin essentials.'
//   const dynDesc = top
//     ? `Discover the best in ${top} and more at Essentialist Makeup Store. Authentic cosmetics, and beauty essentials: ${addPhrases}`
//     : `${DEFAULT_DESC} ${addPhrases}`

//   return {
//     metadataBase: 'https://www.esmakeupstore.com',
//     title: dynTitle,
//     description: dynDesc,
//     // SEO Note: Kept concise to prevent keyword stuffing penalties
//     keywords: [
//       'Essentialist makeup store',
//       'cosmetic products',
//       'produits de beauté',
//       'makeup store',
//       'skin essentials',
//       'professional makeup',
//       'face makeup',
//       'contouring makeup',
//       'setting powder',
//       'highlighter stick',
//       'lip makeup',
//       'eyeshadow palette',
//       'makeup kit',
//       'NYX cosmetics',
//       'Maybelline',
//     ],
//     robots: { index: true, follow: true },
//     alternates: { canonical: '/' },
//     openGraph: {
//       type: 'website',
//       siteName: 'Essentialist Makeup Store',
//       url: 'https://www.esmakeupstore.com/',
//       title: `${dynTitle}`,
//       description: `Essentialist Makeup Store: ${dynDesc}`,
//       images: [
//         {
//           url: OG_IMAGE,
//           width: 1200,
//           height: 630,
//           alt: 'Essentialist Makeup Store Product Preview',
//         },
//       ],
//       locale: 'en_US',
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: `${dynTitle}`,
//       description: `Essentialist Makeup Store: ${dynDesc}`,
//       images: [OG_IMAGE],
//     },
//     icons: {
//       icon: [{ url: '/icon.avif', type: 'image/avif' }],
//       apple: [{ url: '/icon.avif' }],
//     },
//     other: {
//       'og:site_name:pretty': 'Essentialist Makeup Store',
//       'al:android:package': 'com.fsn.esmakeupstore',
//       'al:android:app_name': 'Essentialist Makeup Store: Makeup Shopping App',
//       'al:ios:app_name': 'Essentialist Makeup Store — Makeup Shopping',
//       'msvalidate.01': '1D7D3FCABB171743A8EB32440530AC76',
//     },
//   }
// }

// function StructuredData({ categoryProducts = [] }) {
//   const productList = categoryProducts.flatMap(({ products }) =>
//     Array.isArray(products) ? products.slice(0, 5) : []
//   )

//   const websiteJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'WebSite',
//     name: 'Essentialist Makeup Store',
//     url: 'https://www.esmakeupstore.com/',
//     potentialAction: {
//       '@type': 'SearchAction',
//       target: 'https://www.esmakeupstore.com/search?q={search_term_string}',
//       'query-input': 'required name=search_term_string',
//     },
//     publisher: {
//       '@type': 'Organization',
//       name: 'Essentialist Makeup Store',
//       logo: {
//         '@type': 'ImageObject',
//         url: OG_IMAGE,
//       },
//     },
//     image: [OG_IMAGE, 'https://www.esmakeupstore.com/assets/logo.jpg'],
//   }

//   const itemListJsonLd =
//     productList.length > 0
//       ? {
//           '@context': 'https://schema.org',
//           '@type': 'ItemList',
//           name: 'Featured Makeup Products',
//           description: 'Explore our top makeup products at Essentialist Makeup Store.',
//           numberOfItems: productList.length,
//           itemListElement: productList.map((product, index) => ({
//             '@type': 'ListItem',
//             position: index + 1,
//             item: {
//               '@type': 'Product',
//               name: product.name,
//               image: Array.isArray(product.image) ? product.image[0] : product.image,
//               url: `https://www.esmakeupstore.com/product/${valideURLConvert(product.name)}-${product._id}`,
//               offers: {
//                 '@type': 'Offer',
//                 price: product.price,
//                 priceCurrency: 'XAF',
//                 availability:
//                   product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
//               },
//             },
//           })),
//         }
//       : null

//   const breadcrumbJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'BreadcrumbList',
//     itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.esmakeupstore.com/' }],
//   }

//   const organizationJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'Organization',
//     name: 'Essentialist Makeup Store',
//     url: 'https://www.esmakeupstore.com/',
//     logo: OG_IMAGE,
//     sameAs: [
//       'https://www.instagram.com/essentialistmakeupstore',
//       'https://www.facebook.com/essentialistmakeupstore',
//       'https://www.tiktok.com/@essentialistmakeupstore',
//     ],
//     address: { '@type': 'PostalAddress', addressCountry: 'CM', addressLocality: 'Douala' },
//     contactPoint: {
//       '@type': 'ContactPoint',
//       telephone: '+237655225569',
//       contactType: 'customer service',
//       availableLanguage: ['en', 'fr'],
//     },
//   }

//   const ld = [websiteJsonLd, breadcrumbJsonLd, organizationJsonLd]
//   if (itemListJsonLd) ld.push(itemListJsonLd)

//   return (
//     <>
//       {ld.map((obj, i) => (
//         <script
//           // eslint-disable-next-line react/no-danger
//           key={i}
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
//         />
//       ))}
//     </>
//   )
// }

// function buildCategoryUrl(catId, catName, subCategory) {
//   if (!catId || !catName || !subCategory) return '#'
//   return `/${valideURLConvert(catName)}-${catId}/${valideURLConvert(subCategory.name)}-${subCategory._id}`
// }

// export default async function Home() {
//   'use cache'
//   cacheLife('minutes', 5)

//   try {
//     const [categoryData, subCategoryData, categoryProducts] = await Promise.all([
//       getCategories(),
//       getSubCategories(),
//       getTopCategoryBundles(8),
//     ])

//     const topCategoryNames = Array.isArray(categoryData)
//       ? categoryData
//           .slice(0, 7)
//           .map((c) => c?.name)
//           .filter(Boolean)
//           .join(', ')
//       : ''

//     return (
//       <>
//         <StructuredData categoryProducts={categoryProducts} />

//         <section className="bg-white">
//           <ProductRecommendations />

//           <div className="container mx-auto px-4">
//             <div className="w-full h-full min-h-48 rounded">
//               <div className="hidden lg:block mt-2">
//                 <Image
//                   src="/assets/fbb4343f-2d39-4c25-ac2f-1ab5037f50da.avif"
//                   width={100}
//                   height={100}
//                   alt="Beautiful model with makeup - Professional beauty photography"
//                   priority
//                   className="w-full h-auto"
//                   sizes="(min-width:1024px) 1200px, 100vw"
//                 />
//               </div>
//               <div className="lg:hidden">
//                 <Image
//                   src="/assets/cosmetics-beauty-products-for-make-up-sale-banner-vector-25170220.avif"
//                   width={100}
//                   height={100}
//                   alt="Cosmetics sale banner - Makeup products collection"
//                   priority
//                   className="w-full h-auto"
//                   sizes="100vw"
//                 />
//               </div>

//               {/* On-Page SEO Section: Using your real search keywords naturally */}
//               <div className="max-w-4xl mx-auto text-center mt-6 mb-8 px-2">
//                 <h1 className="font-bold text-[24px] md:text-[36px] mb-3 text-gray-900">
//                   Welcome to the Essentialist Makeup Store
//                 </h1>
//                 <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
//                   Your premier destination for authentic <strong>cosmetic products</strong> and <strong>professional makeup</strong>.
//                   Shop our curated collection of high-quality <strong>face makeup</strong>, blurring <strong>setting powders</strong>,
//                   <strong> contouring makeup</strong>, and radiant <strong>lip gloss</strong>. Whether you are looking for everyday
//                   <strong> skin essentials</strong>, complete <strong>makeup kits</strong>, or top brands like <strong>NYX Cosmetics</strong>
//                   and <strong>Maybelline</strong>, we have everything you need for flawless beauty.
//                 </p>
//               </div>

//               <h2 className="font-bold text-[20px] md:text-[28px] text-center mt-8 mb-4">
//                 {topCategoryNames ? 'Shop by Category' : 'Shop Makeup Categories & More'}
//               </h2>
//             </div>
//           </div>

//           <div className="container mx-auto px-4 my-2 grid grid-cols-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 cursor-pointer">
//             {Array.isArray(categoryData) && categoryData.length ? (
//               categoryData
//                 .map((cat) => {
//                   if (!cat || !cat._id) return null
//                   const subcategory =
//                     Array.isArray(subCategoryData) &&
//                     subCategoryData.find(
//                       (sub) =>
//                         Array.isArray(sub?.category) &&
//                         sub.category.some((c) => c?._id === cat?._id)
//                     )
//                   const href = buildCategoryUrl(cat?._id, cat?.name, subcategory)
//                   const canNavigate = href !== '#'

//                   return (
//                     <Link
//                       key={`${cat?._id}-displayCategory`}
//                       href={href}
//                       prefetch={canNavigate}
//                       className={`w-full block focus:outline-none focus:ring-2 focus:ring-pink-300 rounded ${
//                         !canNavigate ? 'pointer-events-none opacity-60' : ''
//                       }`}
//                       aria-label={`Shop ${cat?.name}`}
//                     >
//                       <div className="relative w-full aspect-square">
//                         <Image
//                           src={cat?.image || '/placeholder.png'}
//                           alt={`${cat?.name} makeup category - Shop ${cat?.name} products`}
//                           fill
//                           sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 14vw"
//                           className="object-contain"
//                           loading="lazy"
//                         />
//                       </div>
//                       <div className="text-center text-xs sm:text-sm md:text-base font-semibold text-gray-700 mt-2">
//                         {cat?.name}
//                       </div>
//                     </Link>
//                   )
//                 })
//                 .filter(Boolean)
//             ) : (
//               <div className="col-span-full text-center text-gray-500 py-8">
//                 Categories will appear here soon.
//               </div>
//             )}
//           </div>

//           <div className="container mx-auto mt-2 px-4">
//             <div className="w-full rounded"></div>
//           </div>

//           <CategorySectionsInfinite
//             categoryProducts={categoryProducts || []}
//             subCategoryData={subCategoryData || []}
//           />

//           <Suspense fallback={<div className="container mx-auto px-4 py-4 text-center">Loading TikTok Gallery...</div>}>
//             <TikTokGallery />
//           </Suspense>

//           <a
//             href="https://wa.me/237655225569"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="fixed z-50 bottom-16 right-2 md:bottom-6 md:right-6 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-colors"
//             style={{ boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)' }}
//             aria-label="Contact us on WhatsApp for makeup consultation and orders"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 24 24" aria-hidden="true">
//               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.47-.148-.669.15-.198.297-.767.966-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.61-.916-2.206-.242-.58-.487-.5-.669-.51-.173-.006-.372-.007-.571-.007s-.521.075-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.214 3.074.149.198 2.1 3.205 5.077 4.372.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.123-.272-.198-.57-.347zm-5.421 7.617c-1.191 0-2.381-.195-3.509-.577l-3.909 1.024 1.04-3.814c-.673-1.045-1.205-2.181-1.498-3.377C1.212 14.271 0 12.211 0 9.999 0 4.477 5.373 0 12 0c3.185 0 6.187 1.24 8.438 3.488C22.687 5.737 24 8.741 24 12c0 6.627-5.373 12-12 12zm0-22C6.486 2 2 6.486 2 12c0 2.083 1.04 4.166 2.888 5.833l-.96 3.521 3.624-.948C9.834 21.001 10.912 21.2 12 21.2c5.514 0 10-4.486 10-10S17.514 2 12 2z"></path>
//             </svg>
//           </a>
//         </section>
//       </>
//     )
//   } catch (error) {
//     console.error('Error rendering Home page:', error)
//     return (
//       <section className="bg-white min-h-screen">
//         <div className="container mx-auto px-4 py-16 text-center">
//           <h1 className="text-2xl font-bold mb-4">Welcome to Essentialist Makeup Store</h1>
//           <p className="mb-8">We are currently updating our product catalog. Please check back soon!</p>

//           <div className="flex justify-center">
//             <a
//               href="https://wa.me/237655225569"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="mr-2">
//                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.47-.148-.669.15-.198.297-.767.966-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.61-.916-2.206-.242-.58-.487-.5-.669-.51-.173-.006-.372-.007-.571-.007s-.521.075-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.214 3.074.149.198 2.1 3.205 5.077 4.372.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.123-.272-.198-.57-.347zm-5.421 7.617c-1.191 0-2.381-.195-3.509-.577l-3.909 1.024 1.04-3.814c-.673-1.045-1.205-2.181-1.498-3.377C1.212 14.271 0 12.211 0 9.999 0 4.477 5.373 0 12 0c3.185 0 6.187 1.24 8.438 3.488C22.687 5.737 24 8.741 24 12c0 6.627-5.373 12-12 12zm0-22C6.486 2 2 6.486 2 12c0 2.083 1.04 4.166 2.888 5.833l-.96 3.521 3.624-.948C9.834 21.001 10.912 21.2 12 21.2c5.514 0 10-4.486 10-10S17.514 2 12 2z"></path>
//               </svg>
//               Contact Us on WhatsApp
//             </a>
//           </div>
//         </div>
//       </section>
//     )
//   }
// }

// src/app/page.js
/**
 * 2026 SEO/GEO/AEO Optimized Home Page
 */

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";

import ProductRecommendations from "../components/ProductRecommendations";
import TikTokGallery from "../components/TikTokGallery";
import CategorySectionsInfinite from "../components/CategorySectionsInfinite";
import { valideURLConvert } from "../utils/valideURLConvert";
import {
  getCategories,
  getSubCategories,
  getTopCategoryBundles,
} from "../server/catalog";

// --- SEO Constants ---
const BUSINESS_CONFIG = {
  name: "Essentialist Makeup Store",
  url: "https://www.esmakeupstore.com",
  phone: "+237655225569",
  email: "contact@esmakeupstore.com",
  whatsapp: "237655225569",
  address: {
    street: "Bonamoussadi, Carrefour Maçon",
    city: "Douala",
    region: "Littoral",
    country: "Cameroon",
    countryCode: "CM",
    coordinates: { lat: 4.0511, lng: 9.7679 },
  },
  hours: {
    monday: "08:00-18:00",
    tuesday: "08:00-18:00",
    wednesday: "08:00-18:00",
    thursday: "08:00-18:00",
    friday: "08:00-18:00",
    saturday: "10:00-16:00",
    sunday: "closed",
  },
  deliveryAreas: ["Douala", "Yaoundé", "Cameroon"],
  currency: "XAF",
};

const CONTENT_KEYWORDS = {
  primary: [
    "makeup store Cameroon",
    "cosmetic products Cameroon",
    "buy makeup online Douala",
    "professional makeup Cameroon",
  ],
  secondary: [
    "setting powder Cameroon",
    "foundation makeup Cameroon",
    "eyeshadow palette Douala",
    "lipstick Cameroon",
    "makeup kits Cameroon",
    "beauty products Douala",
  ],
};

const DEFAULT_TITLE =
  "Best Makeup Store in Cameroon | Essentialist — Shop NYX, Smashbox, Bobbi Brown in Douala";
const DEFAULT_DESC =
  "Shop authentic makeup and cosmetic products in Cameroon. Professional makeup, setting powders, foundations, and more. Fast delivery to Douala and nationwide. Premium brands at affordable prices.";
const OG_IMAGE = "https://www.esmakeupstore.com/assets/logo.jpg";

export async function generateMetadata() {
  "use cache";
  cacheLife("minutes", 5);

  const categories = await getCategories();
  const categoryNames = Array.isArray(categories)
    ? categories
        .slice(0, 5)
        .map((c) => c?.name)
        .filter(Boolean)
    : [];

  const topCategories = categoryNames.join(", ");
  const dynTitle = topCategories
    ? `Best Makeup Store in Cameroon | Shop ${topCategories} & More — Essentialist Douala`
    : DEFAULT_TITLE;

  const dynDesc = topCategories
    ? `Discover premium ${topCategories.toLowerCase()} and more at ${BUSINESS_CONFIG.name}. ${DEFAULT_DESC}`
    : DEFAULT_DESC;

  const allKeywords = [
    ...CONTENT_KEYWORDS.primary,
    ...CONTENT_KEYWORDS.secondary.slice(0, 3),
  ];

  return {
    metadataBase: BUSINESS_CONFIG.url,
    title: dynTitle,
    description: dynDesc,
    keywords: allKeywords,
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    alternates: {
      canonical: "/",
      languages: { en: "/", fr: "/fr" },
    },
    openGraph: {
      type: "website",
      siteName: BUSINESS_CONFIG.name,
      url: BUSINESS_CONFIG.url,
      title: dynTitle,
      description: dynDesc,
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt: BUSINESS_CONFIG.name },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: dynTitle,
      description: dynDesc,
      images: [OG_IMAGE],
      creator: "@essentialistmakeup",
    },
    other: {
      "geo:placename": BUSINESS_CONFIG.address.city,
      "geo:position": `${BUSINESS_CONFIG.address.coordinates.lat};${BUSINESS_CONFIG.address.coordinates.lng}`,
      "geo:region": `CM-${BUSINESS_CONFIG.address.region}`,
      "msvalidate.01": "1D7D3FCABB171743A8EB32440530AC76",
    },
  };
}

/**
 * Structured Data for SEO/GEO/AEO
 */
function StructuredData({ categoryProducts = [] }) {
  const productList = categoryProducts
    .flatMap(({ products }) =>
      Array.isArray(products) ? products.slice(0, 8) : [],
    )
    .filter((p) => p && p._id);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BUSINESS_CONFIG.url}/#business`,
    name: BUSINESS_CONFIG.name,
    image: OG_IMAGE,
    telephone: BUSINESS_CONFIG.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_CONFIG.address.street,
      addressLocality: BUSINESS_CONFIG.address.city,
      addressCountry: BUSINESS_CONFIG.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_CONFIG.address.coordinates.lat,
      longitude: BUSINESS_CONFIG.address.coordinates.lng,
    },
    priceRange: "$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "285",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where can I buy makeup in Cameroon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can buy authentic makeup at Essentialist Makeup Store in Bonamoussadi, Douala. We also offer delivery nationwide across Cameroon. Shop NYX, Smashbox, Bobbi Brown, e.l.f., Laura Geller, MAC, and more at esmakeupstore.com.",
        },
      },
      {
        "@type": "Question",
        name: "What is the best makeup store in Cameroon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Essentialist Makeup Store is the leading cosmetics shop in Douala, Cameroon, offering authentic professional makeup, setting powders, foundations, eyeshadow palettes, and lipsticks from top international brands.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I buy NYX cosmetics in Cameroon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NYX Professional Makeup products are available at Essentialist Makeup Store in Douala, Cameroon. Browse online at esmakeupstore.com or visit us in Bonamoussadi.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I buy Smashbox mascara in Cameroon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Smashbox Super Fan mascara and other Smashbox products are in stock at Essentialist Makeup Store, Douala. Order online at esmakeupstore.com or via WhatsApp at +237 655 225 569.",
        },
      },
      {
        "@type": "Question",
        name: "Do you deliver makeup in Cameroon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Essentialist Makeup Store delivers to Douala, Yaoundé, and nationwide across Cameroon. Order via WhatsApp at +237 655 225 569 or shop online at esmakeupstore.com.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I find cosmetic shops in Cameroon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Essentialist Makeup Store is located in Bonamoussadi, Douala, Cameroon. We carry a wide range of professional cosmetics and beauty products with fast delivery across the country.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}

function buildCategoryUrl(catId, catName, subCategory) {
  if (!catId || !catName || !subCategory) return "#";
  return `/${valideURLConvert(catName)}-${catId}/${valideURLConvert(subCategory.name)}-${subCategory._id}`;
}

export default async function Home() {
  "use cache";
  cacheLife("minutes", 5);

  try {
    const [categoryData, subCategoryData, categoryProducts] = await Promise.all(
      [getCategories(), getSubCategories(), getTopCategoryBundles(8)],
    );

    const topCategories = Array.isArray(categoryData)
      ? categoryData
          .slice(0, 5)
          .map((c) => c?.name)
          .filter(Boolean)
      : [];

    return (
      <>
        <StructuredData categoryProducts={categoryProducts} />

        <section className="bg-white">
          {/* FIX 1: HERO MOVED TO THE TOP (STRUCTURAL PRIORITY) */}
          <div className="container mx-auto px-4 pt-4">
            <div className="w-full h-full min-h-48 rounded overflow-hidden">
              <div className="hidden lg:block">
                <Image
                  src="/assets/fbb4343f-2d39-4c25-ac2f-1ab5037f50da.avif"
                  width={1200}
                  height={500}
                  alt="Professional makeup artist applying foundation - Essentialist Makeup Store Douala Cameroon"
                  priority={true}
                  fetchPriority="high"
                  loading="eager"
                  unoptimized={true}
                  className="w-full h-auto"
                  sizes="100vw"
                />
              </div>
              <div className="lg:hidden">
                <Image
                  src="/assets/cosmetics-beauty-products-for-make-up-sale-banner-vector-25170220.avif"
                  width={400}
                  height={250}
                  alt="Cosmetics beauty products sale banner - Shop makeup in Cameroon"
                  priority={true}
                  fetchPriority="high"
                  loading="eager"
                  unoptimized={true}
                  className="w-full h-auto"
                  sizes="100vw"
                />
              </div>

              <div className="max-w-4xl mx-auto mt-6 mb-8 px-4 flex flex-col items-center text-center">
                <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl mb-3 text-gray-900 leading-tight">
                  <span className="text-pink-600">Best Makeup Store in Cameroon</span>{" "}
                  — Essentialist Makeup Store Douala
                </h1>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Where to buy authentic <strong>makeup &amp; cosmetics in Cameroon</strong>.
                  Shop <strong>NYX</strong>, <strong>Smashbox</strong>, <strong>Bobbi Brown</strong>,{" "}
                  <strong>e.l.f.</strong>, <strong>Laura Geller</strong>, <strong>MAC</strong> &amp; more.
                  Fast delivery to <strong>Douala</strong> and nationwide.
                </p>
              </div>
            </div>
          </div>

          {/* FIX 2: PRODUCT RECOMMENDATIONS MOVED BELOW HERO */}
          <ProductRecommendations />

          {/* Category Grid */}
          <div className="container mx-auto px-4 my-8 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {Array.isArray(categoryData) &&
              categoryData.slice(0, 16).map((cat) => {
                if (!cat?._id) return null;
                const subcategory = subCategoryData?.find((sub) =>
                  sub.category?.some((c) => c._id === cat._id),
                );
                const href = buildCategoryUrl(cat._id, cat.name, subcategory);
                return (
                  <Link
                    key={cat._id}
                    href={href}
                    className="block text-center transition-transform hover:scale-105"
                  >
                    <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      <Image
                        src={cat.image || "/placeholder.png"}
                        alt={cat.name}
                        fill
                        unoptimized={true}
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-700 mt-2 truncate uppercase tracking-tighter">
                      {cat.name}
                    </div>
                  </Link>
                );
              })}
          </div>

          <CategorySectionsInfinite
            categoryProducts={categoryProducts || []}
            subCategoryData={subCategoryData || []}
          />

          <Suspense fallback={<div className="h-20" />}>
            <TikTokGallery />
          </Suspense>

          {/* Floating WhatsApp */}
          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsapp}`}
            target="_blank"
            className="fixed z-50 bottom-20 right-4 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 shadow-lg hover:scale-110 transition-transform"
          >
            <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.47-.148-.669.15-.198.297-.767.966-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.61-.916-2.206-.242-.58-.487-.5-.669-.51-.173-.006-.372-.007-.571-.007s-.521.075-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.214 3.074.149.198 2.1 3.205 5.077 4.372.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.123-.272-.198-.57-.347zm-5.421 7.617c-1.191 0-2.381-.195-3.509-.577l-3.909 1.024 1.04-3.814c-.673-1.045-1.205-2.181-1.498-3.377C1.212 14.271 0 12.211 0 9.999 0 4.477 5.373 0 12 0c3.185 0 6.187 1.24 8.438 3.488C22.687 5.737 24 8.741 24 12c0 6.627-5.373 12-12 12zm0-22C6.486 2 2 6.486 2 12c0 2.083 1.04 4.166 2.888 5.833l-.96 3.521 3.624-.948C9.834 21.001 10.912 21.2 12 21.2c5.514 0 10-4.486 10-10S17.514 2 12 2z" />
            </svg>
          </a>
        </section>
      </>
    );
  } catch (error) {
    console.error("Error rendering Home page:", error);
    return <div>Welcome to Essentialist Makeup Store</div>;
  }
}
