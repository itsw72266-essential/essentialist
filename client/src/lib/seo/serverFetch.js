/** Headers for localized API / Route Handler fetches on the server. */
export function localeRequestHeaders(locale = "en") {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": locale,
    "X-Locale": locale,
  };
}
