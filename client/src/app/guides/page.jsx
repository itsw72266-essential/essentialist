import Link from "next/link";

import Breadcrumbs from "@/components/seo/Breadcrumbs.client";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { buildPageMetadata } from "@/lib/seo/buildMetadata";
import { homeBreadcrumbItem } from "@/lib/seo/breadcrumbs";
import { getServerLocale } from "@/lib/seo/serverLocale";
import { cacheLife, cacheTag } from "next/cache";
import { LOCAL_SEO_GUIDES } from "@/lib/seo/localSeoGuides";

export const metadata = buildPageMetadata({
  path: "/guides",
  locale: "en",
  title: "Beauty & Shopping Guides Cameroon | Essentialist",
  description:
    "Guides for cosmetic shops in Cameroon, Essentialist Douala, Smashbox mascara prices, NYX mascara, and authentic makeup shopping.",
  keywords: [
    "cosmetic shops cameroon",
    "makeup store douala",
    "beauty guides cameroon",
    "Essentialist guides",
  ],
});

async function CachedGuidesIndex({ locale }) {
  "use cache";
  cacheLife("hours");
  cacheTag("guides-index");

  const breadcrumbItems = [
    homeBreadcrumbItem(locale),
    { label: "Guides" },
  ];

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <BreadcrumbJsonLd items={breadcrumbItems} locale={locale} />
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Shopping guides</h1>
      <p className="text-slate-600 mb-8">
        Local SEO guides for finding authentic makeup in Cameroon — with links to
        brands, categories, and our Douala store.
      </p>
      <ul className="space-y-4">
        {LOCAL_SEO_GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="block p-4 rounded-xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/50 transition-colors"
            >
              <h2 className="font-semibold text-slate-900">{guide.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{guide.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default async function GuidesIndexPage() {
  const locale = await getServerLocale();
  return <CachedGuidesIndex locale={locale} />;
}
