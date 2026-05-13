/**
 * Extension point for incremental migration: server actions, Route Handlers,
 * and typed service methods that wrap the legacy Express API.
 *
 * Today: no mandatory usage — the Express app in `server/` remains authoritative.
 */

export const LEGACY_EXPRESS_ENTRY = "server/index.js";
