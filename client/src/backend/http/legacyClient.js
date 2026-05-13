/**
 * Canonical HTTP client for the legacy Express API (server/).
 * Re-exports the existing Axios instance — no duplicate interceptors or base URLs.
 */
export { default } from "../../utils/Axios.js";
export { default as httpClient } from "../../utils/Axios.js";
