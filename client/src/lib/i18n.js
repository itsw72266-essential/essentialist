"use client";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "fr"];
export const LANGUAGE_STORAGE_KEY = "essentialist_lang";

export const normalizeLocale = (value) => {
  if (!value || typeof value !== "string") return DEFAULT_LOCALE;
  const code = value.toLowerCase().split(",")[0].split("-")[0].trim();
  return SUPPORTED_LOCALES.includes(code) ? code : DEFAULT_LOCALE;
};

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        fr: { translation: fr },
      },
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: SUPPORTED_LOCALES,
      detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      },
      interpolation: { escapeValue: false },
      returnEmptyString: false,
    });
}

export const getCurrentLocale = () => normalizeLocale(i18n.resolvedLanguage || i18n.language);

export default i18n;
