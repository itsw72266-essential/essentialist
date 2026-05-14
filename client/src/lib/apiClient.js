/**
 * Canonical browser API client: axios + SummaryApi baseURL, cookie auth, 401 refresh.
 * All app HTTP from the browser should import this (not "legacy" paths).
 *
 * @see ../utils/Axios.js
 */
export { default } from "../utils/Axios.js";
export { default as apiClient } from "../utils/Axios.js";
