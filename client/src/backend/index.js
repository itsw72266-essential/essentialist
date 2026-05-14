/**
 * @fileoverview Backend integration surface for the Next.js app.
 *
 * Browser HTTP: import from `@/lib/apiClient` (axios + cookies + refresh).
 * `utils/Axios.js` imports `common/SummaryApi` only for baseURL / refresh routes.
 *
 * Layout:
 * - `config/` — env accessors
 * - `contracts/` — API definitions (re-export of SummaryApi)
 * - `services/` — optional legacy Express gateway (ops only)
 */

export * from "./config/runtimePublicEnv.js";
export { getLegacyExpressOrigin } from "./config/upstreamOrigin.js";
export { default as httpClient } from "../lib/apiClient.js";
export { default as AxiosToastError } from "./http/axiosToastError.js";
export * from "./contracts/summaryApi.js";
export {
  LEGACY_EXPRESS_ENTRY,
  fetchLegacyExpress,
  getLegacyExpressFetchUrl,
} from "./services/legacyExpressGateway.js";
