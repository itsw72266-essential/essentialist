"use client";

import { IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";

export default function CofirmBox({ cancel, confirm, close }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/70 p-4">
      <div className="w-full max-w-md rounded bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-semibold">{t("confirm.permanentDelete")}</h1>
          <button type="button" onClick={close} aria-label={t("common.close")}>
            <IoClose size={25} />
          </button>
        </div>
        <p className="my-4">{t("confirm.permanentDeleteMessage")}</p>
        <div className="ml-auto flex w-fit items-center gap-3">
          <button
            type="button"
            onClick={cancel}
            className="rounded border border-red-500 px-4 py-1 text-red-500 hover:bg-red-500 hover:text-white"
          >
            {t("confirm.cancel")}
          </button>
          <button
            type="button"
            onClick={confirm}
            className="rounded border border-green-600 px-4 py-1 text-green-600 hover:bg-green-600 hover:text-white"
          >
            {t("confirm.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
