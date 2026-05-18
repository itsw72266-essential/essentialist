"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getLocaleFromPathname, localizePath } from "@/lib/seo/localePaths";

/**
 * Link that keeps the current locale prefix (/fr) when navigating.
 */
export default function LocaleLink({ href, locale, children, ...props }) {
  const pathname = usePathname();
  const resolvedLocale = locale || getLocaleFromPathname(pathname);
  const localizedHref = localizePath(href, resolvedLocale);

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}
