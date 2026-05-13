/**
 * @fileoverview Backend integration surface for the Next.js app.
 *
 * Import from `@backend/...` for new server-facing code paths.
 * Existing `@/common/SummaryApi` and `@/utils/Axios` imports stay valid until migrated.
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
