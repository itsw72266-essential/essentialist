"use client";

import Link from "next/link";

/**
 * @param {{ items?: Array<{ label: string, href?: string }>, className?: string }} props
 */
export default function Breadcrumbs({ items = [], className = "" }) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-500 sm:text-sm ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 list-none m-0 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-slate-300 select-none" aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className="font-medium text-slate-800 line-clamp-1 max-w-[min(100%,20rem)]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-pink-600 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
