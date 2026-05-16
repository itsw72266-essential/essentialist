"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";
import { getAdaptiveTextClasses } from "@/lib/localeTypography";

/** @param {string} text @param {string} preset - key from localeTypography presets */
export function useAdaptiveTextClasses(text, preset) {
  const { i18n } = useTranslation();

  return useMemo(
    () => getAdaptiveTextClasses(text, preset, i18n.language),
    [text, preset, i18n.language],
  );
}
