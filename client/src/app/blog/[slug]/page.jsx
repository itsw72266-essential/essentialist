// // app/blog/[slug]/page.jsx
// import Link from 'next/link';
// import { notFound } from 'next/navigation';
// import sanitizeHtml from 'sanitize-html';

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   process.env.API_URL ||
//   'http://localhost:1010';

// async function fetchBlog(slug) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`, {
//       next: { revalidate: 120 },
//     });

//     if (response.status === 404) {
//       return null;
//     }

//     if (!response.ok) {
//       throw new Error(`Failed to fetch blog: ${response.statusText}`);
//     }

//     return response.json();
//   } catch (error) {
//     console.error(`Blog details error for slug "${slug}":`, error);
//     return null;
//   }
// }

// export async function generateMetadata({ params }) {
//   const { slug } = await params;

//   const payload = await fetchBlog(slug);
//   if (!payload?.data) {
//     return {
//       title: 'Article not found | EssentialistMakeupStore',
//     };
//   }

//   const blog = payload.data;
//   return {
//     title: blog.metaTitle || blog.title,
//     description: blog.metaDescription || blog.excerpt || undefined,
//     openGraph: {
//       title: blog.metaTitle || blog.title,
//       description: blog.metaDescription || blog.excerpt || '',
//       images: blog.coverImage ? [blog.coverImage] : [],
//       type: 'article',
//       publishedTime: blog.publishedAt,
//       tags: blog.tags,
//     },
//   };
// }

// const BlogDetailsPage = async ({ params }) => {
//   const { slug } = await params;

//   const payload = await fetchBlog(slug);

//   if (!payload?.data) {
//     notFound();
//   }

//   const blog = payload.data;

//   const publishedDate = blog.publishedAt || blog.createdAt;
//   const formattedDate = publishedDate
//     ? new Date(publishedDate).toLocaleDateString(undefined, {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       })
//     : null;

//   const sanitizedContent = sanitizeHtml(blog.content || '', {
//     allowedTags: sanitizeHtml.defaults.allowedTags.concat([
//       'img',
//       'video',
//       'source',
//       'iframe',
//       'figure',
//       'figcaption',
//     ]),
//     allowedAttributes: {
//       ...sanitizeHtml.defaults.allowedAttributes,
//       iframe: ['src', 'allow', 'allowfullscreen', 'frameborder'],
//       img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
//       video: ['controls', 'poster', 'width', 'height', 'src'],
//       source: ['src', 'type'],
//     },
//     allowedSchemes: ['data', 'http', 'https'],
//   });

//   return (
//     <article className="mx-auto max-w-4xl px-4 py-12">
//       <Link
//         href="/blog"
//         className="text-sm font-semibold uppercase tracking-wide text-primary-200 hover:text-primary-300"
//       >
//         ← Back to Blog
//       </Link>

//       <header className="mt-6 space-y-4 text-center">
//         <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{blog.title}</h1>
//         {blog.excerpt && <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">{blog.excerpt}</p>}

//         <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 md:text-sm">
//           {formattedDate && <span>Published {formattedDate}</span>}
//           {blog.readingTime ? <span>{blog.readingTime} min read</span> : null}
//           {Array.isArray(blog.tags) && blog.tags.length > 0 && (
//             <span className="flex flex-wrap gap-2">
//               {blog.tags.map((tag) => (
//                 <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
//                   #{tag}
//                 </span>
//               ))}
//             </span>
//           )}
//         </div>
//       </header>

//       {blog.coverImage && (
//         <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
//           <img
//             src={blog.coverImage}
//             alt={blog.title}
//             className="h-auto w-full object-cover"
//             loading="lazy"
//           />
//         </div>
//       )}

//       <section
//         className="prose prose-slate mx-auto mt-10 max-w-none prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-img:shadow-sm prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary-200 hover:prose-a:text-primary-300"
//         dangerouslySetInnerHTML={{ __html: sanitizedContent }}
//       />

//       <footer className="mt-12 rounded-3xl bg-slate-50 px-6 py-8 text-center shadow-inner">
//         <h2 className="text-lg font-semibold text-slate-900">Need personalised beauty advice?</h2>
//         <p className="mt-2 text-sm text-slate-600">
//           Chat with our team on{' '}
//           <a href="tel:+237655225569" className="font-semibold text-primary-200">
//             +237 655 22 55 69
//           </a>{' '}
//           or reach us via email at{' '}
//           <a href="mailto:esssmakeup@gmail.com" className="font-semibold text-primary-200">
//             esssmakeup@gmail.com
//           </a>
//         </p>
//       </footer>
//     </article>
//   );
// };

// export default BlogDetailsPage;








// app/blog/[slug]/page.jsx
/**
 * 2026 SEO/GEO/AEO Optimized Blog Detail Page
 * Optimized for: Google Search, Answer Engines, Rich Results
 * Target: Individual blog articles with comprehensive schema
 */

import Link from "next/link"
import { notFound } from "next/navigation"
import sanitizeHtml from "sanitize-html"

// --- Configuration ---
const BUSINESS_CONFIG = {
  name: "Essentialist Makeup Store",
  url: "https://www.esmakeupstore.com",
  phone: "+237655225569",
  email: "esssmakeup@gmail.com",
  city: "Douala",
  region: "Littoral",
  country: "Cameroon",
  countryCode: "CM",
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:1010"

/**
 * Fetch blog post
 */
async function fetchBlog(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`, {
      next: { revalidate: 120 },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch blog: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Blog details error for slug "${slug}":`, error)
    return null
  }
}

/**
 * Enhanced metadata generation
 */
export async function generateMetadata({ params }) {
  const { slug } = await params

  const payload = await fetchBlog(slug)
  if (!payload?.data) {
    return {
      title: "Article not found | EssentialistMakeupStore",
      robots: { index: false },
    }
  }

  const blog = payload.data
  const publishedDate = blog.publishedAt || blog.createdAt
  const title = blog.metaTitle || blog.title
  const description = blog.metaDescription || blog.excerpt || ""
  const canonical = `https://www.esmakeupstore.com/blog/${slug}`

  return {
    metadataBase: new URL("https://www.esmakeupstore.com"),
    title: `${title} | ${BUSINESS_CONFIG.name}`,
    description: description.substring(0, 160),
    keywords: [
      ...(blog.tags || []),
      "makeup",
      "beauty",
      "cameroon",
      "tutorial",
    ].filter(Boolean),

    // Robots
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },

    // Canonical
    alternates: {
      canonical: canonical,
    },

    // OpenGraph
    openGraph: {
      type: "article",
      url: canonical,
      title: title,
      description: description,
      images: blog.coverImage
        ? [
            {
              url: blog.coverImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      publishedTime: publishedDate,
      authors: [BUSINESS_CONFIG.name],
      tags: blog.tags || [],
      locale: "en_US",
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: blog.coverImage ? [blog.coverImage] : [],
      creator: "@essentialistmakeup",
    },

    // Additional
    other: {
      "article:published_time": publishedDate,
      "article:author": BUSINESS_CONFIG.name,
      "article:section": "Beauty",
      "geo:placename": BUSINESS_CONFIG.city,
      "geo:region": `${BUSINESS_CONFIG.countryCode}-${BUSINESS_CONFIG.region}`,
    },
  }
}

/**
 * Structured Data for Blog Article
 */
function StructuredData({ blog, slug }) {
  const url = `https://www.esmakeupstore.com/blog/${slug}`
  const publishedDate = blog.publishedAt || blog.createdAt

  // 1. BlogPosting schema
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage || "",
    datePublished: publishedDate,
    dateModified: blog.updatedAt || publishedDate,
    author: {
      "@type": "Organization",
      name: BUSINESS_CONFIG.name,
      url: BUSINESS_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: "https://www.esmakeupstore.com/assets/logo.jpg",
      },
    },
    articleBody: blog.excerpt,
    keywords: (blog.tags || []).join(", "),
    inLanguage: "en-US",
    isAccessibleForFree: true,
    articleSection: "Beauty & Makeup",
  }

  // 2. FAQ schema for article-related questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is this article about?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: blog.excerpt || blog.title,
        },
      },
      {
        "@type": "Question",
        name: "Can I get more personalized advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes! Contact ${BUSINESS_CONFIG.name} at ${BUSINESS_CONFIG.phone} or ${BUSINESS_CONFIG.email} for personalized beauty consultation.`,
        },
      },
      {
        "@type": "Question",
        name: "Are the products mentioned available for purchase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Many products featured in our blog are available in our online store and at our location in ${BUSINESS_CONFIG.city}, ${BUSINESS_CONFIG.country}. Visit our shop to browse.`,
        },
      },
    ],
  }

  // 3. Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BUSINESS_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${BUSINESS_CONFIG.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: url,
      },
    ],
  }

  // 4. Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS_CONFIG.name,
    url: BUSINESS_CONFIG.url,
    logo: "https://www.esmakeupstore.com/assets/logo.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bonamoussadi, Carrefour Maçon",
      addressLocality: BUSINESS_CONFIG.city,
      addressRegion: BUSINESS_CONFIG.region,
      addressCountry: BUSINESS_CONFIG.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS_CONFIG.phone,
      contactType: "Customer Service",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  )
}

/**
 * Blog Detail Page Component
 */
const BlogDetailsPage = async ({ params }) => {
  const { slug } = await params

  const payload = await fetchBlog(slug)

  if (!payload?.data) {
    notFound()
  }

  const blog = payload.data

  const publishedDate = blog.publishedAt || blog.createdAt
  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  // Sanitize content
  const sanitizedContent = sanitizeHtml(blog.content || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "video",
      "source",
      "iframe",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      iframe: ["src", "allow", "allowfullscreen", "frameborder"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      video: ["controls", "poster", "width", "height", "src"],
      source: ["src", "type"],
    },
    allowedSchemes: ["data", "http", "https"],
  })

  return (
    <>
      <StructuredData blog={blog} slug={slug} />

      <article
        className="mx-auto max-w-4xl px-4 py-12"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-semibold uppercase tracking-wide text-pink-600 hover:text-pink-700 transition"
        >
          ← Back to Blog
        </Link>

        {/* Header */}
        <header className="mt-8 space-y-6">
          {/* Tags */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-pink-100 px-3 py-1 text-xs uppercase tracking-wide font-semibold text-pink-700"
                  itemProp="keywords"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight"
            itemProp="headline"
          >
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl" itemProp="description">
              {blog.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-t border-b border-slate-200 py-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-semibold">{BUSINESS_CONFIG.name}</span>
              <span itemProp="author" content={BUSINESS_CONFIG.name} className="hidden" />
            </div>

            {formattedDate && (
              <div className="flex items-center gap-2">
                <span>📅</span>
                <time dateTime={publishedDate} itemProp="datePublished">
                  {formattedDate}
                </time>
              </div>
            )}

            {blog.readingTime && (
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span itemProp="timeRequired">{blog.readingTime} min read</span>
              </div>
            )}

            {blog.category && (
              <div className="flex items-center gap-2">
                <span>📂</span>
                <span itemProp="articleSection">{blog.category}</span>
              </div>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-auto object-cover"
              loading="lazy"
              itemProp="image"
            />
          </div>
        )}

        {/* Article Content */}
        <section
          className="prose prose-slate mx-auto mt-12 max-w-none
            prose-headings:text-slate-900
            prose-h2:mt-10 prose-h2:mb-4
            prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-a:text-pink-600 hover:prose-a:text-pink-700
            prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-img:shadow-md
            prose-li:text-slate-700
            prose-blockquote:border-pink-300 prose-blockquote:bg-pink-50"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          itemProp="articleBody"
        />

        {/* CTA Section */}
        <aside className="mt-16 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 p-8 border border-pink-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Need Personalized Beauty Advice?
          </h3>
          <p className="text-slate-600 mb-6">
            Our beauty experts in {BUSINESS_CONFIG.city} are here to help with product
            recommendations, tutorials, and skincare advice tailored to you.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition"
            >
              📞 {BUSINESS_CONFIG.phone}
            </a>
            <a
              href={`mailto:${BUSINESS_CONFIG.email}`}
              className="inline-flex items-center px-6 py-3 border border-pink-600 text-pink-600 rounded-full font-semibold hover:bg-pink-50 transition"
            >
              ✉️ {BUSINESS_CONFIG.email}
            </a>
          </div>
        </aside>

        {/* Related Links */}
        <nav className="mt-12 border-t border-slate-200 pt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">More Articles</h3>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-slate-100 text-slate-900 rounded-full font-semibold hover:bg-slate-200 transition"
          >
            Browse All Articles →
          </Link>
        </nav>

        {/* Hidden metadata for schema */}
        <meta itemProp="url" content={`${BUSINESS_CONFIG.url}/blog/${slug}`} />
        <meta itemProp="inLanguage" content="en-US" />
      </article>
    </>
  )
}

export default BlogDetailsPage