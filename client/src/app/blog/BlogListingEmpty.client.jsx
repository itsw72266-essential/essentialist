"use client";

import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function BlogListingEmpty() {
  const { t } = useTranslation();
  return (
    <div className="col-span-full rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
      <p className="text-sm">{t("blogListing.noPosts")}</p>
    </div>
  );
}
