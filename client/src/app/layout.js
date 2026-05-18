// // app/layout.js
// import { Inter } from 'next/font/google'
// import { Suspense } from 'react'
// import './globals.css'

// import ClientLayoutShell from './partials/ClientLayoutShell'
// import { callSummaryApi } from '../common/SummaryApi'
// import SummaryApi from '../common/SummaryApi'

// const inter = Inter({ subsets: ['latin'] })

// // --- Metadata Configuration ---
// export const metadata = {
//   metadataBase: new URL('https://www.esmakeupstore.com'),
//   title: 'Cameroon Makeup Shop | Setting Powders, Makeup Kits & Beauty Deals',
//   description:
//     'Explore the best selection of authentic makeup products and cosmetics in Cameroon at Essentialist Makeup Store. Find foundations, lipsticks, eyeshadows, and more.',
//   keywords: [
//     'Cameroon makeup shop', 'Douala makeup store', 'setting powder Cameroon',
//     'makeup kits for teens Douala', 'NYX foundation price Cameroon',
//     'matte bronzer Cameroon', 'liquid lipstick Douala',
//     'waterproof mascara Cameroon', 'blush for melanin skin',
//     'Essentialist Makeup Store',
//   ],
//   robots: {
//     index: true,
//     follow: true,
//     'max-snippet': -1,
//     'max-image-preview': 'large',
//     'max-video-preview': -1,
//   },
//   alternates: { canonical: '/' },
//   openGraph: {
//     type: 'website',
//     siteName: 'Essentialist Makeup Store',
//     url: 'https://www.esmakeupstore.com/',
//     title: 'Cameroon Makeup Shop | Setting Powders, Makeup Kits & Beauty Deals',
//     description: 'Explore authentic makeup and cosmetics in Cameroon.',
//     images: [{ url: 'https://www.esmakeupstore.com/assets/logo.jpg', width: 1200, height: 630, alt: 'Essentialist Makeup Store Product Preview' }],
//     locale: 'en_US',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Cameroon Makeup Shop | Setting Powders, Makeup Kits & Beauty Deals',
//     description: 'Explore authentic makeup and cosmetics in Cameroon.',
//     images: ['https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'],
//     creator: '@essentialistmakeupstore',
//   },
//   icons: {
//     icon: [{ url: '/icon.avif', type: 'image/avif' }],
//     apple: [{ url: '/icon.avif' }],
//   },
//   other: {
//     'msvalidate.01': '1D7D3FCABB171743A8EB32440530AC76',
//     'al:android:package': 'com.fsn.esmakeupstore',
//     'al:android:app_name': 'Essentialist Makeup Store: Makeup Shopping App',
//     'al:ios:app_name': 'Essentialist Makeup Store — Makeup Shopping',
//   },
// }

// export const viewport = {
//   width: 'device-width',
//   initialScale: 1,
//   maximumScale: 5,
//   viewportFit: 'cover',
// }

// // --- 1. Create a "Wrapper" Component for Data Fetching ---
// // This component performs the async fetch. Because it is nested inside Suspense 
// // in the RootLayout, the build worker can "skip" it for static pages like 404.
// async function LayoutContent({ children }) {
//   let categories = []
//   let subCategories = []
  
//   try {
//     // Attempt to fetch data
//     const [catRes, subCatRes] = await Promise.all([
//       callSummaryApi(SummaryApi.getCategory, { cache: 'force-cache' }),
//       callSummaryApi(SummaryApi.getSubCategory, { cache: 'force-cache' })
//     ])
    
//     // Safety check: Ensure data structure is valid
//     categories = Array.isArray(catRes?.data) 
//       ? catRes.data 
//       : (Array.isArray(catRes?.data?.data) ? catRes.data.data : [])
      
//     subCategories = Array.isArray(subCatRes?.data) 
//       ? subCatRes.data 
//       : (Array.isArray(subCatRes?.data?.data) ? subCatRes.data.data : [])
      
//   } catch (e) {
//     console.error("Layout data fetch failed:", e)
//     // If fetch fails (e.g. during build), default to empty to prevent crash
//     categories = []
//     subCategories = []
//   }

//   const initialNavData = {
//     categories: Array.isArray(categories) ? categories : [],
//     subCategories: Array.isArray(subCategories) ? subCategories : []
//   }

//   return (
//     <ClientLayoutShell initialNavData={initialNavData}>
//       {children}
//     </ClientLayoutShell>
//   )
// }

// // --- 2. The Main Root Layout (Synchronous) ---
// // Notice this function is NOT async. This satisfies the build worker.
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" data-scroll-behavior="smooth">
//       <body className={inter.className}>
//         {/* The Suspense boundary isolates the async fetching below */}
//         <Suspense fallback={<div className="min-h-screen bg-white" />}>
//           <LayoutContent>
//             {children}
//           </LayoutContent>
//         </Suspense>
//       </body>
//     </html>
//   )
// }







// // app/layout.js
// import { Inter } from 'next/font/google'
// import { Suspense } from 'react'
// import './globals.css'

// import ClientLayoutShell from './partials/ClientLayoutShell'
// import { callSummaryApi } from '../common/SummaryApi'
// import SummaryApi from '../common/SummaryApi'

// const inter = Inter({ subsets: ['latin'] })

// // --- Metadata Configuration ---
// export const metadata = {
//   metadataBase: new URL('https://www.esmakeupstore.com'),
//   title: {
//     template: '%s | Essentialist Makeup Store',
//     default: 'Essentialist Makeup Store | Best Cosmetic Products in Cameroon',
//   },
//   description:
//     'Shop authentic cosmetic products and professional makeup at Essentialist Makeup Store. Fast delivery in Douala and nationwide Cameroon on foundations, setting powders, and more.',
//   keywords: [
//     'Essentialist Makeup Store',
//     'makeup shop Cameroon',
//     'Douala makeup store',
//     'authentic cosmetics Cameroon',
//     'buy makeup online Douala',
//     'setting powder Cameroon',
//     'NYX Cameroon',
//     'Maybelline Cameroon',
//   ],
//   robots: {
//     index: true,
//     follow: true,
//     'max-snippet': -1,
//     'max-image-preview': 'large',
//     'max-video-preview': -1,
//   },
//   alternates: { canonical: '/' },
//   openGraph: {
//     type: 'website',
//     siteName: 'Essentialist Makeup Store',
//     url: 'https://www.esmakeupstore.com/',
//     title: 'Essentialist Makeup Store | Authentic Beauty in Cameroon',
//     description: 'Discover the best selection of authentic makeup products and cosmetics in Cameroon.',
//     images: [{ url: 'https://www.esmakeupstore.com/assets/logo.jpg', width: 1200, height: 630, alt: 'Essentialist Makeup Store' }],
//     locale: 'en_US',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Essentialist Makeup Store | Makeup Shop Cameroon',
//     description: 'Shop authentic makeup and cosmetics in Cameroon with fast delivery.',
//     images: ['https://www.esmakeupstore.com/assets/logo.jpg'],
//   },
//   icons: {
//     icon: [{ url: '/icon.avif', type: 'image/avif' }],
//     apple: [{ url: '/icon.avif' }],
//   },
//   other: {
//     'msvalidate.01': '1D7D3FCABB171743A8EB32440530AC76',
//     'al:android:package': 'com.fsn.esmakeupstore',
//     'al:android:app_name': 'Essentialist Makeup Store: Makeup Shopping App',
//     'al:ios:app_name': 'Essentialist Makeup Store — Makeup Shopping',
//   },
// }

// export const viewport = {
//   width: 'device-width',
//   initialScale: 1,
//   maximumScale: 5,
//   viewportFit: 'cover',
// }

// // --- Global Schema Data (SEO boost) ---
// const organizationSchema = {
//   '@context': 'https://schema.org',
//   '@type': 'Organization',
//   name: 'Essentialist Makeup Store',
//   url: 'https://www.esmakeupstore.com',
//   logo: 'https://www.esmakeupstore.com/assets/logo.jpg',
//   contactPoint: {
//     '@type': 'ContactPoint',
//     telephone: '+237655225569',
//     contactType: 'customer service',
//     areaServed: 'CM',
//     availableLanguage: ['en', 'fr'],
//   },
//   address: {
//     '@type': 'PostalAddress',
//     streetAddress: 'Bonamoussadi, Carrefour Maçon',
//     addressLocality: 'Douala',
//     addressCountry: 'CM',
//   },
//   sameAs: [
//     'https://www.facebook.com/Essentialistmakeupstore',
//     'https://www.instagram.com/Essentialistmakeupstore',
//     'https://www.tiktok.com/@essentialistmakeupstore',
//   ],
// }

// // --- 1. Create a "Wrapper" Component for Data Fetching ---
// async function LayoutContent({ children }) {
//   let categories = []
//   let subCategories = []
  
//   try {
//     const [catRes, subCatRes] = await Promise.all([
//       callSummaryApi(SummaryApi.getCategory, { cache: 'force-cache' }),
//       callSummaryApi(SummaryApi.getSubCategory, { cache: 'force-cache' })
//     ])
    
//     categories = Array.isArray(catRes?.data) 
//       ? catRes.data 
//       : (Array.isArray(catRes?.data?.data) ? catRes.data.data : [])
      
//     subCategories = Array.isArray(subCatRes?.data) 
//       ? subCatRes.data 
//       : (Array.isArray(subCatRes?.data?.data) ? subCatRes.data.data : [])
      
//   } catch (e) {
//     console.error("Layout data fetch failed:", e)
//     categories = []
//     subCategories = []
//   }

//   const initialNavData = {
//     categories: Array.isArray(categories) ? categories : [],
//     subCategories: Array.isArray(subCategories) ? subCategories : []
//   }

//   return (
//     <ClientLayoutShell initialNavData={initialNavData}>
//       {children}
//     </ClientLayoutShell>
//   )
// }

// // --- 2. The Main Root Layout (Synchronous) ---
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" data-scroll-behavior="smooth" className="scroll-smooth">
//       <head>
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
//         />
//       </head>
//       <body className={inter.className}>
//         <Suspense fallback={<div className="min-h-screen bg-white" />}>
//           <LayoutContent>
//             {children}
//           </LayoutContent>
//         </Suspense>
//       </body>
//     </html>
//   )
// }







// app/layout.js
/**
 * 2026 SEO/GEO/AEO Optimized Root Layout
 * Handles global SEO configuration, metadata, and structured data
 */

import { Inter, Poppins, Outfit } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'

import ClientLayoutShell from './partials/ClientLayoutShell'
import { buildLanguageAlternates } from '@/lib/seo/localePaths'

// --- Font Configuration (Performance + Design) ---
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Prevent font loading from blocking page
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const outfit = Outfit({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

// --- Business Configuration (Cameroon - GEO) ---
const BUSINESS_CONFIG = {
  name: 'Essentialist Makeup Store',
  shortName: 'Essentialist',
  url: 'https://www.esmakeupstore.com',
  phone: '+237655225569',
  email: 'contact@esmakeupstore.com',
  description: 'Premium authentic makeup and cosmetic products in Cameroon',
  logo: 'https://www.esmakeupstore.com/assets/logo.jpg',
  
  // GEO Configuration
  address: {
    street: 'Bonamoussadi, Carrefour Maçon',
    city: 'Douala',
    region: 'Littoral',
    country: 'Cameroon',
    countryCode: 'CM',
    postalCode: '5000',
    coordinates: {
      lat: 4.0511,
      lng: 9.7679,
    },
  },
  
  // Social & Verification
  social: {
    facebook: 'https://www.facebook.com/Essentialistmakeupstore',
    instagram: 'https://www.instagram.com/Essentialistmakeupstore',
    tiktok: 'https://www.tiktok.com/@essentialistmakeupstore',
    whatsapp: '237655225569',
  },
  
  // Trust Signals
  founding: 2020,
  rating: 4.8,
  reviewCount: 285,
}

// --- Metadata Configuration ---
export const metadata = {
  // Base Configuration
  metadataBase: new URL(BUSINESS_CONFIG.url),
  
  // Primary Metadata
  title: {
    template: `%s | ${BUSINESS_CONFIG.name}`,
    default: `${BUSINESS_CONFIG.name} | Best Makeup & Cosmetics in Douala, Cameroon`,
  },
  
  description: `${BUSINESS_CONFIG.description}. Shop foundations, setting powders, lipsticks, eyeshadow, and makeup kits. Fast delivery to Douala and nationwide. 4.8★ trusted by 285+ customers.`,
  
  // Keywords - Comprehensive Coverage
  keywords: [
    // Primary (High intent)
    'makeup store Cameroon',
    'cosmetics shop Douala',
    'buy makeup online Cameroon',
    'professional makeup Douala',
    
    // Secondary (Product specific)
    'setting powder Cameroon',
    'foundation makeup Douala',
    'eyeshadow palette Cameroon',
    'lipstick Cameroon',
    'makeup brush set',
    'concealer Cameroon',
    'makeup kits Douala',
    
    // Tertiary (Long-tail)
    'where to buy makeup in Douala',
    'best makeup store in Cameroon',
    'authentic cosmetics online',
    'makeup delivery Cameroon',
    'NYX cosmetics Cameroon',
    'Maybelline makeup Douala',
  ],
  
  // Robots & Crawling Configuration
  robots: {
    index: true,
    follow: true,
    nocache: false,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    bingbot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  
  // Canonical & Alternates
  alternates: {
    canonical: '/',
    languages: buildLanguageAlternates('/'),
  },
  
  // OpenGraph Configuration (Social + AEO)
  openGraph: {
    type: 'website',
    siteName: BUSINESS_CONFIG.name,
    url: BUSINESS_CONFIG.url,
    title: `${BUSINESS_CONFIG.name} | Best Makeup & Cosmetics in Douala`,
    description: BUSINESS_CONFIG.description,
    locale: 'en_US',
    localeAlternate: ['fr_CM', 'fr_FR'],
    images: [
      {
        url: BUSINESS_CONFIG.logo,
        width: 1200,
        height: 630,
        alt: `${BUSINESS_CONFIG.name} - Authentic Beauty in Cameroon`,
        type: 'image/jpeg',
      },
      {
        url: 'https://www.esmakeupstore.com/assets/og-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Makeup products collection at Essentialist Makeup Store',
        type: 'image/jpeg',
      },
      {
        url: 'https://www.esmakeupstore.com/assets/og-products.jpg',
        width: 1080,
        height: 1080,
        alt: 'Featured makeup products',
        type: 'image/jpeg',
      },
    ],
  },
  
  // Twitter / X Card Configuration
  twitter: {
    card: 'summary_large_image',
    site: '@essentialistmakeup',
    creator: '@essentialistmakeup',
    title: `${BUSINESS_CONFIG.name} | Makeup Shop Cameroon`,
    description: `Shop authentic makeup and cosmetics in ${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.country}. Fast delivery nationwide.`,
    images: [BUSINESS_CONFIG.logo],
  },
  
  // Icons Configuration
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.avif', type: 'image/avif' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico' }],
  },
  
  // Manifest for PWA
  manifest: '/manifest.json',
  
  // Additional SEO Meta Tags
  other: {
    // Geographic Meta Tags (GEO)
    'geo:placename': BUSINESS_CONFIG.address.city,
    'geo:position': `${BUSINESS_CONFIG.address.coordinates.lat};${BUSINESS_CONFIG.address.coordinates.lng}`,
    'geo:region': `${BUSINESS_CONFIG.address.countryCode}-${BUSINESS_CONFIG.address.region}`,
    'ICBM': `${BUSINESS_CONFIG.address.coordinates.lat},${BUSINESS_CONFIG.address.coordinates.lng}`,
    
    // Geographic Scope
    'coverage': `${BUSINESS_CONFIG.address.city}, ${BUSINESS_CONFIG.address.country}`,
    'distribution': 'global',
    'target-audience': 'Beauty enthusiasts in Cameroon',
    'target-region': 'CM',
    
    // Freshness & Update Frequency
    'revisit-after': '7 days',
    'rating': 'general',
    'author': BUSINESS_CONFIG.name,
    'creator': BUSINESS_CONFIG.name,
    'copyright': `© ${new Date().getFullYear()} ${BUSINESS_CONFIG.name}`,
    
    // Language & Charset
    'og:locale': 'en_US',
    'og:locale:alternate': ['fr_CM', 'fr_FR'],
    'language': 'English',
    'charset': 'utf-8',
    
    // Mobile App Links (Deep Linking)
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': BUSINESS_CONFIG.shortName,
    'al:android:package': 'com.fsn.esmakeupstore',
    'al:android:app_name': `${BUSINESS_CONFIG.name}: Makeup Shopping`,
    'al:android:url': `esmakeupstore://home`,
    'al:ios:app_id': '6596000000',
    'al:ios:app_name': `${BUSINESS_CONFIG.name}`,
    'al:ios:url': `esmakeupstore://home`,
    'al:web:url': BUSINESS_CONFIG.url,
    
    // Search Engine Verification
    'google-site-verification': 'YOUR_GOOGLE_VERIFICATION_CODE',
    'msvalidate.01': '1D7D3FCABB171743A8EB32440530AC76',
    'pinterest-site-verification': 'YOUR_PINTEREST_CODE',
    
    // Theme & Branding
    'theme-color': '#ec4899',
    'color-scheme': 'light dark',
    
    // Facebook
    'fb:app_id': 'YOUR_FB_APP_ID',
    'fb:pages': 'YOUR_FB_PAGE_ID',
    
    // Trustworthiness Signals
    'business-rating': BUSINESS_CONFIG.rating,
    'review-count': BUSINESS_CONFIG.reviewCount,
    'founded': BUSINESS_CONFIG.founding,
  },
}

// --- Viewport Configuration ---
export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: '#ec4899',
  interactiveWidget: 'resizes-content',
}

/**
 * Global Organization Schema
 * Used for knowledge panels and rich snippets
 */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  '@id': `${BUSINESS_CONFIG.url}/#organization`,
  name: BUSINESS_CONFIG.name,
  alternateName: BUSINESS_CONFIG.shortName,
  description: BUSINESS_CONFIG.description,
  url: BUSINESS_CONFIG.url,
  logo: {
    '@type': 'ImageObject',
    url: BUSINESS_CONFIG.logo,
    width: 250,
    height: 250,
  },
  image: [
    BUSINESS_CONFIG.logo,
    'https://www.esmakeupstore.com/assets/hero.jpg',
    'https://www.esmakeupstore.com/assets/products.jpg',
  ],
  
  // Contact Information
  telephone: BUSINESS_CONFIG.phone,
  email: BUSINESS_CONFIG.email,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: BUSINESS_CONFIG.phone,
    contactType: 'Customer Service',
    areaServed: BUSINESS_CONFIG.address.countryCode,
    availableLanguage: ['en', 'fr'],
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
      timeZone: 'Africa/Douala',
    },
  },
  
  // Address & Geography
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS_CONFIG.address.street,
    addressLocality: BUSINESS_CONFIG.address.city,
    addressRegion: BUSINESS_CONFIG.address.region,
    postalCode: BUSINESS_CONFIG.address.postalCode,
    addressCountry: BUSINESS_CONFIG.address.countryCode,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: BUSINESS_CONFIG.address.coordinates.lat,
    longitude: BUSINESS_CONFIG.address.coordinates.lng,
    address: BUSINESS_CONFIG.address.city,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Douala',
    },
    {
      '@type': 'City',
      name: 'Yaoundé',
    },
    {
      '@type': 'Country',
      name: 'Cameroon',
    },
  ],
  
  // Business Details
  foundingDate: BUSINESS_CONFIG.founding.toString(),
  foundingLocation: BUSINESS_CONFIG.address.city,
  priceRange: '$$',
  serviceType: ['Retail', 'E-commerce', 'Beauty & Cosmetics'],
  
  // Ratings & Reviews
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: BUSINESS_CONFIG.rating.toString(),
    bestRating: '5',
    worstRating: '1',
    ratingCount: BUSINESS_CONFIG.reviewCount.toString(),
  },
  
  // Social Media & External Links
  sameAs: [
    BUSINESS_CONFIG.social.facebook,
    BUSINESS_CONFIG.social.instagram,
    BUSINESS_CONFIG.social.tiktok,
  ],
  
  // Payment & Delivery
  paymentAccepted: ['Cash', 'Mobile Money', 'Bank Transfer'],
  currenciesAccepted: ['XAF'],
}

/**
 * Data Fetching Component with Error Handling
 */
function LayoutContent({ children }) {
  return (
    <ClientLayoutShell
      initialNavData={{
        categories: [],
        subCategories: [],
      }}
    >
      {children}
    </ClientLayoutShell>
  )
}

/**
 * Root Layout Component
 * Handles HTML structure and global configuration
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`scroll-smooth ${inter.variable} ${poppins.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect for third-party scripts (fonts are self-hosted via next/font) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />

        {/* DNS Prefetch for Performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Global Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* Performance: Lazy load non-critical scripts */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
      </head>

      <body className={poppins.className}>
        {/* Skip to main content link (Accessibility) */}
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>

        {/* Layout with Suspense for better UX */}
        <Suspense
          fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          }
        >
          <LayoutContent>
            <main id="main-content" role="main">
              {children}
            </main>
          </LayoutContent>
        </Suspense>

        {/* Performance Monitoring Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Web Vitals monitoring for performance
              if ('web-vital' in window) {
                const vitals = window['web-vital'];
                vitals.onCLS(console.log);
                vitals.onFID(console.log);
                vitals.onFCP(console.log);
                vitals.onINP(console.log);
                vitals.onLCP(console.log);
                vitals.onTTFB(console.log);
              }
            `,
          }}
        />
      </body>
    </html>
  )
}