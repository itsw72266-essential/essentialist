import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumbs";

/**
 * @param {{ items: Array<{ label: string, href?: string }>, locale?: string }} props
 */
export default function BreadcrumbJsonLd({ items = [], locale = "en" }) {
  if (!items.length) return null;
  const data = buildBreadcrumbJsonLd(items, { locale });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
