import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";

export function joinClasses(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Shared typography for EN/FR — same Tailwind sizes in both locales.
 * French copy is scaled globally via html[lang="fr"] (see globals.css).
 * Length-based steps only shrink very long dynamic labels (categories, headings).
 * Product card titles use fixed classes in CardProduct, not these presets.
 */
export function getAdaptiveTextClasses(text, preset, locale) {
  normalizeLocale(locale);
  const len = String(text ?? "").trim().length;

  const presets = {
    categoryCircle: () => {
      const base =
        "font-bold text-gray-700 mt-2 line-clamp-2 break-words [overflow-wrap:anywhere] uppercase tracking-tighter px-0.5 text-center locale-compact";
      if (len > 24) return joinClasses(base, "text-[7px] sm:text-[8px] min-h-[2.8em] leading-[1.1]");
      if (len > 16) return joinClasses(base, "text-[8px] sm:text-[9px] min-h-[2.6em] leading-[1.15]");
      return joinClasses(base, "text-[10px] sm:text-xs min-h-[2.4em] leading-tight");
    },
    sectionHeading: () => {
      const base = "font-bold line-clamp-2 break-words locale-compact min-w-0 flex-1";
      if (len > 35) return joinClasses(base, "text-base md:text-2xl leading-tight");
      if (len > 22) return joinClasses(base, "text-lg md:text-[32px] leading-tight");
      return joinClasses(base, "text-[20px] md:text-[40px] leading-tight");
    },
    navCategory: () => {
      const base =
        "font-bold text-black pb-2 mb-3 tracking-wide border-b border-pink-100 uppercase break-words line-clamp-2 locale-compact text-base";
      return len > 20 ? joinClasses(base, "leading-snug") : base;
    },
    navSubcategory: () => {
      const base =
        "block text-black rounded-md hover:bg-pink-50 hover:text-pink-400 cursor-pointer p-1.5 break-words line-clamp-2 locale-compact text-sm font-semibold md:font-normal";
      return len > 28 ? joinClasses(base, "leading-snug") : base;
    },
    heroTitle: () =>
      "font-bold text-2xl md:text-3xl lg:text-4xl mb-3 text-gray-900 leading-tight locale-compact",
    heroSubtitle: () =>
      "text-gray-600 text-base md:text-lg leading-relaxed locale-compact",
    seeAllLink: () =>
      "font-bold transition-colors duration-300 shrink-0 locale-compact md:text-[20px] text-[16px]",
  };

  const resolver = presets[preset];
  return resolver ? resolver() : "";
}
