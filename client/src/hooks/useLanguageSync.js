import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { normalizeLocale } from "@/lib/i18n";

export function useLanguageSync() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const applyLanguage = (language) => {
      const locale = normalizeLocale(language);
      document.documentElement.lang = locale;
      document.documentElement.style.setProperty(
        "--locale-text-scale",
        locale === "fr" ? "0.94" : "1",
      );
    };

    applyLanguage(i18n.resolvedLanguage || i18n.language);

    const handleLanguageChange = (language) => {
      applyLanguage(language);
      queryClient.invalidateQueries();
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, [i18n, queryClient]);
}
