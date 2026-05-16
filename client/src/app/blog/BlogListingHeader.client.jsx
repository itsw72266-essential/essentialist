"use client";

import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function BlogListingHeader({ storeName, city, country }) {
  const { t } = useTranslation();

  return (
    <header className="max-w-3xl mb-12">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        {t("blogListing.title")}
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        {t("blogListing.subtitle", { storeName, city, country })}
      </p>
      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-slate-600">{t("blogListing.trustExpert")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇨🇲</span>
          <span className="text-slate-600">{t("blogListing.trustCameroon")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="text-slate-600">{t("blogListing.trustAuthentic")}</span>
        </div>
      </div>
    </header>
  );
}
