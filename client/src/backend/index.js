/**
 * @fileoverview Backend integration surface for the Next.js app.
 *
 * Import from `@backend/...` (or `@/backend/...`) for code that talks to Express.
 * App code is migrated off direct `@/common/SummaryApi` / `@/utils/Axios` imports;
 * `utils/Axios.js` still imports `common/SummaryApi` for refresh-token config only.
 *
 * Layout:
 * - `config/` — env accessors
 * - `http/` — HTTP client (legacy Axios)
 * - `contracts/` — API definitions (re-export of SummaryApi)
 * - `services/` — future gateways / orchestration
 */

export * from "./config/runtimePublicEnv.js";
export { getLegacyExpressOrigin } from "./config/upstreamOrigin.js";
export { default as httpClient } from "./http/legacyClient.js";
export { default as AxiosToastError } from "./http/axiosToastError.js";
export * from "./contracts/summaryApi.js";
export { LEGACY_EXPRESS_ENTRY } from "./services/legacyExpressGateway.js";
