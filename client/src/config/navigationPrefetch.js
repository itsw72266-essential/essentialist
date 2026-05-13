/**
 * Client-side route warming via `router.prefetch` / `<Link prefetch>`.
 * In dev, Turbopack still compiles each segment once; prefetching moves that work
 * to idle/open-menu time so clicks feel instant after warm-up.
 */

export const DASHBOARD_USER_PATHS = [
  "/dashboard/myorders",
  "/dashboard/address",
  "/dashboard/profile",
];

const DASHBOARD_ADMIN_ONLY_PATHS = [
  "/dashboard",
  "/dashboard/category",
  "/dashboard/subcategory",
  "/dashboard/upload-product",
  "/dashboard/product",
  "/dashboard/brands",
  "/dashboard/blog",
  "/dashboard/reviews",
];

export const DASHBOARD_ADMIN_PATHS = [
  ...DASHBOARD_ADMIN_ONLY_PATHS,
  ...DASHBOARD_USER_PATHS,
];

export const AUTH_AND_ACCOUNT_PATHS = ["/login", "/user", "/register"];
