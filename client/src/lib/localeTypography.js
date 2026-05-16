import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";

export function joinClasses(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Adaptive layout for longer French copy in tight UI (nav, category circles, headings).
 * Product card titles keep their normal size — use line-clamp + break-words only.
 */
export function getAdaptiveTextClasses(text, preset, locale) {
  const lang = normalizeLocale(locale);
  const len = String(text ?? "").trim().length;
  const isFr = lang !== DEFAULT_LOCALE;

  const presets = {
    categoryCircle: () => {
      const base =
        "font-bold text-gray-700 mt-2 line-clamp-2 break-words [overflow-wrap:anywhere] uppercase tracking-tighter px-0.5 text-center locale-compact";
      if (!isFr) return joinClasses(base, "text-[10px] sm:text-xs min-h-[2.4em] leading-tight");
      if (len > 24) return joinClasses(base, "text-[7px] sm:text-[8px] min-h-[2.8em] leading-[1.1]");
      if (len > 16) return joinClasses(base, "text-[8px] sm:text-[9px] min-h-[2.6em] leading-[1.15]");
      return joinClasses(base, "text-[9px] sm:text-[10px] min-h-[2.4em] leading-tight");
    },
    sectionHeading: () => {
      const base = "font-bold line-clamp-2 break-words locale-compact min-w-0 flex-1";
      if (!isFr) return joinClasses(base, "text-[20px] md:text-[40px] leading-tight");
      if (len > 35) return joinClasses(base, "text-base md:text-2xl leading-tight");
      if (len > 22) return joinClasses(base, "text-lg md:text-[32px] leading-tight");
      return joinClasses(base, "text-[20px] md:text-[36px] leading-tight");
    },
    navCategory: () => {
      const base =
        "font-bold text-black pb-2 mb-3 tracking-wide border-b border-pink-100 uppercase break-words line-clamp-2 locale-compact";
      if (!isFr) return joinClasses(base, "text-base");
      return joinClasses(base, len > 20 ? "text-sm leading-snug" : "text-[15px]");
    },
    navSubcategory: () => {
      const base =
        "block text-black rounded-md hover:bg-pink-50 hover:text-pink-400 cursor-pointer p-1.5 break-words line-clamp-2 locale-compact";
      if (!isFr) return joinClasses(base, "text-sm font-semibold md:font-normal");
      return joinClasses(
        base,
        len > 28 ? "text-xs font-medium leading-snug" : "text-[13px] font-semibold md:font-normal",
      );
    },
    heroTitle: () => {
      if (!isFr) {
        return "font-bold text-2xl md:text-3xl lg:text-4xl mb-3 text-gray-900 leading-tight locale-compact";
      }
      return "font-bold text-xl md:text-2xl lg:text-[1.65rem] mb-3 text-gray-900 leading-tight locale-compact";
    },
    heroSubtitle: () => {
      if (!isFr) return "text-gray-600 text-base md:text-lg leading-relaxed locale-compact";
      return "text-gray-600 text-sm md:text-base leading-snug locale-compact";
    },
    seeAllLink: () => {
      const base = "font-bold transition-colors duration-300 shrink-0 locale-compact";
      if (!isFr) return joinClasses(base, "md:text-[20px] text-[16px]");
      return joinClasses(base, "md:text-base text-sm");
    },
  };

  const resolver = presets[preset];
  return resolver ? resolver() : "";
}
