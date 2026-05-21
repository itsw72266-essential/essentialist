"use client";

import Link from "next/link";

function isHomeCrumb(item, index) {
  return index === 0 && (item.href === "/" || item.label === "Home" || item.label === "Accueil");
}

/**
 * @param {{ items?: Array<{ label: string, href?: string }>, className?: string, hideHomeOnMobile?: boolean }} props
 */
export default function Breadcrumbs({
  items = [],
  className = "",
  hideHomeOnMobile = true,
}) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-3 min-w-0 w-full ${className}`}
    >
      <ol className="flex flex-nowrap items-center gap-0 list-none m-0 p-0 w-full min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hideOnMobile = hideHomeOnMobile && isHomeCrumb(item, index);
          const suppressSeparatorOnMobile =
            hideHomeOnMobile && index === 1 && isHomeCrumb(items[0], 0);

          return (
            <li
              key={`${item.label}-${index}`}
              className={`inline-flex flex-shrink-0 items-center ${hideOnMobile ? "hidden sm:inline-flex" : ""}`}
            >
              {index > 0 && (
                <span
                  className={`mx-1.5 text-slate-300 select-none flex-shrink-0 ${suppressSeparatorOnMobile ? "hidden sm:inline" : ""}`}
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className="font-medium text-slate-800 whitespace-nowrap truncate max-w-[52vw] sm:max-w-[28rem]"
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-slate-500 hover:text-pink-600 transition-colors whitespace-nowrap"
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
