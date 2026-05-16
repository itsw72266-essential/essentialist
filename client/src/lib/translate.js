import i18n from "@/lib/i18n";

/** Translate outside React components (utils, toasts, helpers). */
export function t(key, options) {
  return i18n.t(key, options);
}

export default t;
