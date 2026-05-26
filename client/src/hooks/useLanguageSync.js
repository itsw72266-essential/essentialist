import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { LANGUAGE_STORAGE_KEY, normalizeLocale } from "@/lib/i18n";
import { isLocaleSensitiveQuery } from "@/lib/localeQueries";
import {
  getLocaleFromPathname,
  localizePath,
  stripLocalePrefix,
} from "@/lib/seo/localePaths";

function getStoredLocale() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
  return raw ? normalizeLocale(raw) : null;
}

export function useLanguageSync() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const pathLocale = getLocaleFromPathname(pathname);
    const i18nLocale = normalizeLocale(i18n.resolvedLanguage || i18n.language);
    const stored = getStoredLocale();
    const preferred = stored || i18nLocale;

    if (pathLocale === "fr") {
      if (i18nLocale !== "fr") {
        void i18n.changeLanguage("fr");
      }
      return;
    }

    // User chose French but landed on an unprefixed URL — fix the URL, do not reset i18n/localStorage to EN.
    if (preferred === "fr") {
      const nextPath = localizePath(stripLocalePrefix(pathname), "fr");
      if (nextPath !== pathname) {
        router.replace(nextPath);
        return;
      }
    }

    if (i18nLocale !== pathLocale) {
      void i18n.changeLanguage(pathLocale);
    }
  }, [pathname, i18n, router]);

  useEffect(() => {
    const applyLanguage = (language) => {
      const locale = normalizeLocale(language);
      document.documentElement.lang = locale;
      document.documentElement.style.fontSize =
        locale === "fr" ? "93.75%" : "";
    };

    applyLanguage(i18n.resolvedLanguage || i18n.language);

    const handleLanguageChange = (language) => {
      applyLanguage(language);
      void queryClient.invalidateQueries({
        predicate: (query) => isLocaleSensitiveQuery(query),
        refetchType: "active",
      });
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, [i18n, queryClient]);
}
