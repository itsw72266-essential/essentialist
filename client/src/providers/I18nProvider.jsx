"use client";

import { useMemo } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n";

/**
 * Threads the request locale (resolved on the server from the URL) into
 * i18next so the initial HTML renders in the correct language, instead of
 * falling back to English and only correcting after hydration.
 *
 * - On the server we use a per-request cloned instance so two concurrent
 *   requests (e.g. "/" and "/fr") can never share mutable language state.
 * - On the client we drive the shared singleton, keeping the language
 *   switcher and useLanguageSync in control.
 */
export default function I18nProvider({ initialLocale = "en", children }) {
  const instance = useMemo(() => {
    if (typeof window === "undefined") {
      return i18n.cloneInstance({ lng: initialLocale, initImmediate: false });
    }
    if (i18n.language !== initialLocale) {
      void i18n.changeLanguage(initialLocale);
    }
    return i18n;
  }, [initialLocale]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
