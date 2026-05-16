/** Dev-only toggles to cut rerenders, prefetch storms, and compile churn. */

export const isProduction = process.env.NODE_ENV === "production";

/** Next.js Link prefetch — off in dev to avoid compiling many routes at once. */
export const linkPrefetch = isProduction;

/** React Query Devtools — opt-in via env (heavy in dev). */
export const enableReactQueryDevtools =
  process.env.NEXT_PUBLIC_RQ_DEVTOOLS === "true";
