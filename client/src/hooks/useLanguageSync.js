import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useLanguageSync() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleLanguageChange = (language) => {
      document.documentElement.lang = language;
      queryClient.invalidateQueries();
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, [i18n, queryClient]);
}
