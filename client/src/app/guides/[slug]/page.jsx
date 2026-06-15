import Link from "next/link";
import { notFound } from "next/navigation";

import Breadcrumbs from "@/components/seo/Breadcrumbs.client";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { buildPageMetadata } from "@/lib/seo/buildMetadata";
import { homeBreadcrumbItem } from "@/lib/seo/breadcrumbs";
import { getServerLocale } from "@/lib/seo/serverLocale";
import { cacheLife, cacheTag } from "next/cache";
import {
  getAllLocalSeoGuideSlugs,
  getLocalSeoGuide,
} from "@/lib/seo/localSeoGuides";

export function generateStaticParams() {
  return getAllLocalSeoGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getLocalSeoGuide(slug);
  if (!guide) return {};

  return buildPageMetadata({
    path: `/guides/${slug}`,
    locale: "en",
    title: `${guide.title} | Essentialist`,
    description: guide.description,
    keywords: guide.keywords,
  });
}

function FaqJsonLd({ faq }) {
  if (!faq?.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

async function CachedGuide({ slug, locale }) {
  "use cache";
  cacheLife("hours");
  cacheTag(`guide-${slug}`);

  const guide = getLocalSeoGuide(slug);
  if (!guide) return null;

  const breadcrumbItems = [
    homeBreadcrumbItem(locale),
    { label: "Guides", href: "/guides" },
    { label: guide.title },
  ];

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <BreadcrumbJsonLd items={breadcrumbItems} locale={locale} />
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <article>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{guide.title}</h1>
        <p className="text-slate-600 mb-8">{guide.description}</p>

        {guide.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-slate-700 mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}

        {guide.faq.length > 0 && (
          <section className="mt-10 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">FAQ</h2>
            <dl className="space-y-4">
              {guide.faq.map((item) => (
                <div key={item.q}>
                  <dt className="font-medium text-slate-900">{item.q}</dt>
                  <dd className="text-slate-600 mt-1">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {guide.links.length > 0 && (
          <nav
            className="mt-10 p-4 rounded-xl bg-pink-50 border border-pink-100"
            aria-label="Shop related products"
          >
            <h2 className="text-sm font-bold uppercase tracking-wide text-pink-700 mb-3">
              Shop & contact
            </h2>
            <ul className="flex flex-wrap gap-2">
              {guide.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm px-3 py-1.5 rounded-full bg-white text-pink-700 border border-pink-200 hover:bg-pink-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>

      <FaqJsonLd faq={guide.faq} />
    </main>
  );
}

export default async function LocalSeoGuidePage({ params }) {
  const { slug } = await params;
  const locale = await getServerLocale();

  // Dynamic + cheap: decide 404 here (notFound() can't run inside "use cache").
  if (!getLocalSeoGuide(slug)) notFound();

  return <CachedGuide slug={slug} locale={locale} />;
}
