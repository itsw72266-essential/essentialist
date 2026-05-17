import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { normalizeLocale } from "@/lib/i18n";
import { isLocaleSensitiveQuery } from "@/lib/localeQueries";

export function useLanguageSync() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

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
      // Refetch only locale-bound catalog queries (not cart, user, orders, etc.).
      void queryClient.invalidateQueries({
        predicate: (query) => isLocaleSensitiveQuery(query),
        refetchType: "active",
      });
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, [i18n, queryClient]);
}
