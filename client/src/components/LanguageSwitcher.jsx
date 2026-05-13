"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";

const LanguageSwitcher = ({ className = "", compact = false }) => {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || "en";
  const isFrench = language.startsWith("fr");

  const handleToggleLanguage = () => {
    const next = isFrench ? "en" : "fr";
    void i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggleLanguage}
      className={`notranslate inline-flex items-center gap-1.5 font-bold text-[13px] hover:text-pink-200 transition-colors select-none ${className}`}
      aria-label={t("header.language")}
      translate="no"
      style={{ minWidth: compact ? 72 : 108 }}
    >
      <Globe className="w-4 h-4 shrink-0" />
      <span className="inline-block text-left">
        {compact ? (isFrench ? "FR" : "EN") : isFrench ? t("header.french") : t("header.english")}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
