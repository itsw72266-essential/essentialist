"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";

const LOCALES = [
  { code: "en", label: "EN", nameKey: "header.english" },
  { code: "fr", label: "FR", nameKey: "header.french" },
];

function FlagGb({ className = "", clipId }) {
  return (
    <svg
      className={className}
      width="20"
      height="14"
      viewBox="0 0 60 42"
      aria-hidden
    >
      <clipPath id={clipId}>
        <path d="M0 0h60v42H0z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <path fill="#012169" d="M0 0h60v42H0z" />
        <path
          stroke="#fff"
          strokeWidth="6"
          d="M0 0l60 42M60 0L0 42"
        />
        <path
          stroke="#C8102E"
          strokeWidth="4"
          d="M0 0l60 42M60 0L0 42"
        />
        <path stroke="#fff" strokeWidth="10" d="M30 0v42M0 21h60" />
        <path stroke="#C8102E" strokeWidth="6" d="M30 0v42M0 21h60" />
      </g>
    </svg>
  );
}

function FlagFr({ className = "" }) {
  return (
    <svg
      className={className}
      width="20"
      height="14"
      viewBox="0 0 60 42"
      aria-hidden
    >
      <rect width="20" height="42" fill="#002395" />
      <rect x="20" width="20" height="42" fill="#fff" />
      <rect x="40" width="20" height="42" fill="#ED2939" />
    </svg>
  );
}

function FlagIcon({ locale, className = "", clipId }) {
  if (locale.startsWith("fr")) {
    return <FlagFr className={`shrink-0 rounded-sm ${className}`} />;
  }
  return <FlagGb className={`shrink-0 rounded-sm ${className}`} clipId={clipId} />;
}

const LanguageSwitcher = ({ className = "", compact = false }) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const gbClipId = useId();

  const language = i18n.resolvedLanguage || i18n.language || "en";
  const isFrench = language.startsWith("fr");
  const active = LOCALES.find((l) => l.code === (isFrench ? "fr" : "en")) || LOCALES[0];

  const setLocale = useCallback(
    (code) => {
      void i18n.changeLanguage(code);
      setOpen(false);
    },
    [i18n]
  );

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative notranslate ${className}`} translate="no">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center rounded-md border border-gray-300 bg-white font-bold text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-1 ${
          compact
            ? "gap-0.5 px-1 py-0.5 text-[10px] leading-none"
            : "gap-2 px-3 py-1.5 text-sm"
        }`}
        aria-label={t("header.language")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FlagIcon
          locale={active.code}
          clipId={gbClipId}
          className={compact ? "scale-75 origin-center" : ""}
        />
        <span>{active.label}</span>
        <ChevronDown
          className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""} ${
            compact ? "h-3 w-3" : "h-4 w-4"
          }`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("header.language")}
          className="absolute right-0 z-[100] mt-1 min-w-[9.5rem] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {LOCALES.map((item) => {
            const selected =
              (item.code === "fr" && isFrench) || (item.code === "en" && !isFrench);
            return (
              <li key={item.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => setLocale(item.code)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    selected
                      ? "bg-pink-50 text-pink-700"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <FlagIcon locale={item.code} clipId={gbClipId} />
                  <span>{item.label}</span>
                  {!compact && (
                    <span className="ml-auto text-xs font-normal text-gray-500">
                      {t(item.nameKey)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
