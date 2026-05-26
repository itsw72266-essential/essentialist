"use client";

import Link from "next/link";

import { localizePath } from "@/lib/seo/localePaths";
import { useActiveLocale } from "@/hooks/useLocalizedHref";

/**
 * Link that keeps the current locale prefix (/fr) when navigating.
 */
export default function LocaleLink({ href, locale, children, ...props }) {
  const resolvedLocale = locale || useActiveLocale();
  const localizedHref = localizePath(href, resolvedLocale);

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}
