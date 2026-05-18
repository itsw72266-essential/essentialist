// app/blog/page.jsx
/**
 * 2026 SEO/GEO/AEO Optimized Blog Listing Page
 * Optimized for: Google Search, Answer Engines, Rich Results
 * Target: Blog discovery, traffic, and authority building
 */

import Link from "next/link"
import { cookies } from "next/headers"
import BlogListingHeader from "./BlogListingHeader.client"
import BlogListingEmpty from "./BlogListingEmpty.client"

// --- Configuration ---
const BUSINESS_CONFIG = {
  name: "Essentialist Makeup Store",
  url: "https://www.esmakeupstore.com",
  phone: "+237655225569",
  city: "Douala",
  region: "Littoral",
  country: "Cameroon",
  countryCode: "CM",
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "http://localhost:3000"

import { getStaticPageMetadata } from "@/lib/seo/staticPages";
import { getServerLocale } from "@/lib/seo/serverLocale";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return getStaticPageMetadata("blog", locale);
}

/**
 * Fetch blogs with error handling
 */
async function fetchBlogs(page = 1, locale = "en") {
  try {
    const cookieStore = await cookies()
    const resolvedLocale =
      locale ||
      cookieStore.get("essentialist_lang")?.value?.split("-")[0] ||
      "en"

    const url = new URL("/api/next/blog/list", API_BASE_URL)
    url.searchParams.set("status", "published")
    url.searchParams.set("limit", "12")
    url.searchParams.set("page", page.toString())
    url.searchParams.set("sort", "newest")

    const response = await fetch(url.toString(), {
      headers: {
        "Accept-Language": resolvedLocale,
        "X-Locale": resolvedLocale,
      },
      next: { revalidate: 120 },
    })

    if (!response.ok) {
      console.error("Failed to load blogs:", response.status, response.statusText)
      return { data: [], totalPages: 1, currentPage: 1 }
    }

    return response.json()
  } catch (error) {
    console.error("Blog list error:", error)
    return { data: [], totalPages: 1, currentPage: 1 }
  }
}

/**
 * Structured Data for Blog Listing
 */
function StructuredData({ posts, currentPage, totalPages }) {
  const baseUrl = "https://www.esmakeupstore.com/blog"

  // 1. BlogPosting schema for each article
  const blogPostingsSchema =
    posts && posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "EssentialistMakeupStore Blog",
          url: baseUrl,
          numberOfItems: posts.length,
          itemListElement: posts.map((post, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            item: {
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: post.coverImage || "",
              datePublished: post.publishedAt || post.createdAt,
              author: {
                "@type": "Organization",
                name: BUSINESS_CONFIG.name,
              },
              articleBody: post.excerpt,
              keywords: (post.tags || []).join(", "),
              url: `${baseUrl}/${post.slug}`,
            },
          })),
        }
      : null

  // 2. CollectionPage schema
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EssentialistMakeupStore Beauty Blog",
    description:
      "Expert beauty tips, makeup tutorials, and skincare advice from Cameroon's favorite makeup destination.",
    url: baseUrl,
    isPartOf: {
      "@type": "WebSite",
      name: BUSINESS_CONFIG.name,
      url: "https://www.esmakeupstore.com",
    },
    mainEntity: {
      "@type": "Organization",
      name: BUSINESS_CONFIG.name,
      url: "https://www.esmakeupstore.com",
    },
  }

  // 3. FAQPage schema for common blog questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What topics does the EssentialistMakeupStore blog cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our blog covers makeup tutorials, skincare advice, beauty trends, product recommendations, and store updates. All content is tailored for the Cameroon beauty market.",
        },
      },
      {
        "@type": "Question",
        name: "How often are new articles published?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We publish new beauty content regularly. Check back weekly for fresh tutorials, tips, and updates from our beauty experts in Douala.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get personalized beauty advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes! Contact us at ${BUSINESS_CONFIG.phone} or esssmakeup@gmail.com for personalized beauty consultation and product recommendations.`,
        },
      },
      {
        "@type": "Question",
        name: "Are all products mentioned in the blog available for purchase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Most products featured in our blog are available in our store. Visit our shop to browse our complete collection of authentic cosmetics and makeup products.`,
        },
      },
    ],
  }

  // 4. Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.esmakeupstore.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: baseUrl,
      },
    ],
  }

  // 5. Organization schema (global authority)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS_CONFIG.name,
    url: "https://www.esmakeupstore.com",
    logo: "https://www.esmakeupstore.com/assets/logo.jpg",
    description: "Premium authentic makeup and cosmetics in Cameroon",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bonamoussadi, Carrefour Maçon",
      addressLocality: BUSINESS_CONFIG.city,
      addressRegion: BUSINESS_CONFIG.region,
      addressCountry: BUSINESS_CONFIG.countryCode,
    },
    sameAs: [
      "https://www.facebook.com/Essentialistmakeupstore",
      "https://www.instagram.com/Essentialistmakeupstore",
      "https://www.tiktok.com/@essentialistmakeupstore",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS_CONFIG.phone,
      contactType: "Customer Service",
    },
  }

  return (
    <>
      {blogPostingsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostingsSchema),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
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
 * Blog Listing Page Component
 */
const BlogPage = async ({ searchParams }) => {
  const params = await searchParams
  const currentPage = parseInt(params.page) || 1
  const locale = await getServerLocale()

  const payload = await fetchBlogs(currentPage, locale)
  const posts = payload?.data || []
  const totalPages = payload?.totalPages || 1

  return (
    <>
      <StructuredData posts={posts} currentPage={currentPage} totalPages={totalPages} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <BlogListingHeader
          storeName={BUSINESS_CONFIG.name}
          city={BUSINESS_CONFIG.city}
          country={BUSINESS_CONFIG.country}
        />

        {/* Blog Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 && <BlogListingEmpty />}

          {posts.map((post) => {
            const publishedDate = post.publishedAt || post.createdAt
            const formattedDate = publishedDate
              ? new Date(publishedDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"

            return (
              <article
                key={post._id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                        itemProp="image"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                        Cover image coming soon
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 px-5 py-6">
                    {/* Tags */}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-pink-50 px-2 py-0.5 text-xs uppercase tracking-wide text-pink-600"
                            itemProp="keywords"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2
                      className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-pink-600 transition"
                      itemProp="headline"
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-slate-600 line-clamp-3" itemProp="description">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                      <span itemProp="datePublished" content={publishedDate}>
                        {formattedDate}
                      </span>
                      {post.readingTime && (
                        <span className="inline-block">
                          <span itemProp="timeRequired">
                            {post.readingTime} min read
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Hidden Schema Properties */}
                    <meta itemProp="author" content={BUSINESS_CONFIG.name} />
                    <meta itemProp="url" content={`https://www.esmakeupstore.com/blog/${post.slug}`} />
                  </div>
                </Link>
              </article>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-16 flex items-center justify-center space-x-2 border-t border-slate-200 pt-8">
            <Link
              href={`/blog?page=${Math.max(1, currentPage - 1)}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                currentPage === 1
                  ? "pointer-events-none text-slate-300"
                  : "text-slate-700 hover:bg-slate-100 hover:text-pink-600"
              }`}
              aria-disabled={currentPage === 1}
            >
              ← Previous
            </Link>

            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}`}
                      className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                        currentPage === pageNum
                          ? "bg-pink-600 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                      aria-current={currentPage === pageNum ? "page" : undefined}
                    >
                      {pageNum}
                    </Link>
                  )
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={pageNum} className="px-2 text-slate-400">
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>

            <Link
              href={`/blog?page=${Math.min(totalPages, currentPage + 1)}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                currentPage === totalPages
                  ? "pointer-events-none text-slate-300"
                  : "text-slate-700 hover:bg-slate-100 hover:text-pink-600"
              }`}
              aria-disabled={currentPage === totalPages}
            >
              Next →
            </Link>
          </nav>
        )}
      </section>
    </>
  )
}

export default BlogPage