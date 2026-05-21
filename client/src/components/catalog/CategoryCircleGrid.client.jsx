"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";
import { getAdaptiveTextClasses } from "@/lib/localeTypography";

/**
 * @param {Array<{ id: string, href: string, image?: string, displayName: string }>} items
 * @param {boolean} [isLoading]
 */
export default function CategoryCircleGrid({ items = [], isLoading = false }) {
  const { i18n } = useTranslation();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 my-8 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse text-center">
            <div className="aspect-square w-full rounded-full bg-gray-200" />
            <div className="h-3 bg-gray-200 rounded mt-2 mx-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="container mx-auto px-4 my-8 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="block w-full text-center transition-transform hover:scale-105"
        >
          <div className="relative aspect-square w-full rounded-full bg-gray-100 overflow-hidden shadow-sm ring-2 ring-gray-200/75">
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
              <Image
                src={item.image || "/placeholder.png"}
                alt={item.displayName}
                width={256}
                height={256}
                unoptimized
                sizes="(max-width: 640px) 22vw, 12vw"
                className="max-h-full max-w-full w-auto h-auto object-contain object-center"
              />
            </div>
          </div>
          <div
            className={getAdaptiveTextClasses(
              item.displayName,
              "categoryCircle",
              i18n.language,
            )}
          >
            {item.displayName}
          </div>
        </Link>
      ))}
    </div>
  );
}
