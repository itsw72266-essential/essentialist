/**
 * Checklist when adding new translatable MongoDB fields (mirror Educaire workflow).
 *
 * 1. Schema: add English field + translations.fr.{field} on the model.
 * 2. auto-translate.js: include field in *_TRANSLATION_FIELDS and autoTranslate* helper.
 * 3. Controller: sanitizeTranslations on admin write; scheduleAutoTranslate after save.
 * 4. localization.js: merge field in localizeDocument / entity localize* helper.
 * 5. Client: use t('...') for static UI; getLocalizedContent(doc, field, i18n.language) only if API returns raw docs.
 * 6. Env: GEMINI_API_KEY (optional; without it only manual FR + English fallback).
 */

export const TRANSLATION_CHECKLIST = [
  "schema.translations.fr",
  "auto-translate field list",
  "controller sanitize + scheduleAutoTranslate",
  "localizeDocument fields",
  "client getLocalizedContent fallback",
];
