"use client";

import Link from "next/link";

/**
 * @param {{ title?: string, links?: Array<{ href: string, label: string }> }} props
 */
export default function PopularProductLinks({
  title = "Popular products",
  links = [],
}) {
  if (!links.length) return null;

  return (
    <nav
      className="container mx-auto px-4 py-6 border-t border-pink-100"
      aria-label={title}
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-pink-600 mb-3">
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-block text-xs sm:text-sm px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
